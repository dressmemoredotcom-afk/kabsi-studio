import React from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import "./fonts";
import { clampRange } from "../../core/anim";
import { roomyTokens as T } from "./tokens";
import { RoomyListing } from "./schema";
import { ASSETS, assetUrl, type MediaAsset } from "./assets";
import { OVERLAP, outroFrom, planScenes, resolveVoScript, sceneCopy, totalFrames, voiceSignature } from "./storyboard";
import { RoomyAudio, type VoiceClip } from "./RoomyAudio";
import voice from "./generated/roomy-voice.json";
import { EditorialBadge } from "./components/EditorialBadge";
import { EditorialHeadline } from "./components/EditorialHeadline";
import { GlassBar } from "./components/GlassBar";
import { KenBurnsPhoto } from "./components/KenBurnsPhoto";
import { OutroCard } from "./components/OutroCard";
import { BottomScrim, LowerThird, Reveal } from "./components/primitives";
import { VideoClip } from "./components/VideoClip";
import { mediaAssetPath } from "./storyboard";

const MISSING: MediaAsset = { file: null, kind: "photo", width: 0, height: 0, durationS: 0 };

/** The stored voice track is used only while it still matches this listing's script. */
const voiceClips = (listing: RoomyListing): VoiceClip[] => {
  const script = resolveVoScript(listing);
  return voice.signature === voiceSignature(script, listing.durationSeconds) ? (voice.lines as VoiceClip[]) : [];
};

/**
 * Roomy Properties dynamic reel: 1080 x 1920, 30 fps, 22 seconds (660 frames) unless the listing sets durationSeconds,
 * for any listing with one to twelve photos and clips. The last 4 seconds are the outro; the time before it is shared
 * evenly between the media items. Scenes dissolve into each other. Missing files fall back to a designed placeholder.
 */
export const DynamicReel: React.FC<RoomyListing> = (listing) => {
  const frame = useCurrentFrame();
  const total = totalFrames(listing);
  const OUTRO_FROM = outroFrom(total);
  const plan = planScenes(listing.media.length, total);
  const copy = sceneCopy(listing);

  return (
    <AbsoluteFill style={{ background: T.charcoal }}>
      {listing.media.map((item, i) => {
        const { from, frames } = plan[i];
        const length = frames + OVERLAP;
        // The last scene stays under the outro's dissolve; every scene stays under the next one's.
        if (frame < from || frame >= from + length) return null;
        const fade = i === 0 ? clampRange(frame, 0, 10) : clampRange(frame, from, from + OVERLAP);
        const asset = ASSETS.media[item.src] ?? MISSING;
        const url = assetUrl(asset.file);
        const text = copy[i];
        return (
          <AbsoluteFill key={`${i}-${item.src}`} style={{ opacity: fade }}>
            {item.type === "photo" ? (
              <KenBurnsPhoto src={url} frame={frame} from={from} frames={length} index={i} width={asset.width} height={asset.height} />
            ) : (
              <VideoClip
                src={url}
                frame={frame}
                from={from}
                frames={length}
                startAtSecond={item.startAtSecond}
                playbackRate={item.playbackRate}
                focusX={item.focusX}
                durationS={asset.durationS}
                width={asset.width}
                height={asset.height}
                content={asset.content}
                index={i}
              />
            )}
            <BottomScrim strength={text.headline ? 1 : 0.8} />
            {text.topBadge && (
              <div style={{ position: "absolute", left: T.layout.marginX, top: 300 }}>
                <Reveal frame={frame} atFrame={from + 12} dy={-16}>
                  <EditorialBadge text={text.topBadge} ar={text.topBadgeAr} />
                </Reveal>
              </div>
            )}
            <LowerThird gap={26}>
              {text.headline && <EditorialHeadline frame={frame} atFrame={from + 24} headline={text.headline} subline={text.subline} />}
              {text.bar && <GlassBar frame={frame} atFrame={from + (text.headline ? 54 : 27)} rows={text.bar} />}
            </LowerThird>
          </AbsoluteFill>
        );
      })}

      {frame >= OUTRO_FROM && (
        <AbsoluteFill style={{ opacity: clampRange(frame, OUTRO_FROM, OUTRO_FROM + OVERLAP) }}>
          <OutroCard frame={frame} from={OUTRO_FROM} logo={ASSETS.logo} contact={listing.whatsappContact} instagram={listing.instagram} />
        </AbsoluteFill>
      )}

      <RoomyAudio clips={voiceClips(listing)} total={total} />
    </AbsoluteFill>
  );
};

// Keeps mediaAssetPath in the bundle's type graph for tools that import both the reel and the storyboard.
export { mediaAssetPath };
