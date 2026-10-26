import React from "react";
import { siWhatsapp } from "simple-icons";
import { colors } from "../tokens";

/**
 * The WhatsApp glyph, exactly as the simple-icons package ships it: the path is not edited, redrawn or recoloured by
 * hand. Use it only where the screen means WhatsApp. It takes no animation props and is never animated: place it, do
 * not move, scale or fade it.
 */
export const WhatsAppGlyph: React.FC<{ size: number; color?: string }> = ({ size, color = colors.paper }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" role="img" aria-label={siWhatsapp.title}>
    <path d={siWhatsapp.path} fill={color} />
  </svg>
);
