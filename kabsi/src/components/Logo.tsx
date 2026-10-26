import React from "react";
import { cancelRender, continueRender, delayRender, staticFile } from "remotion";
import { colors } from "../tokens";
import { LOGO } from "../kit";

/**
 * The Kabsi ring mark or the wordmark, straight from kabsi/public/brand/ (copied unchanged from kabsi-design-studio;
 * never redrawn, never recoloured). While the files have not been uploaded, a plain dashed ring stands in and a
 * warning goes to the console, so the render still shows where the mark belongs. `allowMissing` is for the kit test.
 */
export const Logo: React.FC<{ kind: "mark" | "wordmark"; height: number; allowMissing?: boolean }> = ({ kind, height, allowMissing = false }) => {
  const [handle] = React.useState(() => delayRender(`Loading the ${kind}`));
  const [failed, setFailed] = React.useState(false);
  const done = React.useRef(false);
  const finish = (ok: boolean) => {
    if (done.current) return;
    done.current = true;
    setFailed(!ok);
    if (!ok && !allowMissing) cancelRender(new Error(`kabsi/public/${LOGO[kind]} is missing: upload the logo files from kabsi-design-studio public/ unchanged`));
    if (!ok) console.warn(`kabsi/public/${LOGO[kind]} is missing: showing a stand-in ring`);
    continueRender(handle);
  };
  if (failed) {
    return <div style={{ width: height, height, boxSizing: "border-box", borderRadius: "50%", border: `${Math.round(height * 0.06)}px dashed ${colors.mute}` }} />;
  }
  // A plain img: it has its own delayRender and falls back to the stand-in ring when the file is missing, which Img cannot.
  // eslint-disable-next-line @remotion/warn-native-media-tag
  return <img src={staticFile(LOGO[kind])} height={height} alt="" style={{ display: "block", height }} onLoad={() => finish(true)} onError={() => finish(false)} />;
};
