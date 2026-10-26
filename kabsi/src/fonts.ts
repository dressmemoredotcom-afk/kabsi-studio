import { cancelRender, continueRender, delayRender, staticFile } from "remotion";

// Fonts live in kabsi/public/brand/fonts; kabsi/public is Remotion's public dir for Kabsi. Both are variable fonts.
const handle = delayRender("Loading Bricolage Grotesque and Manrope");

Promise.all([
  new FontFace("Bricolage Grotesque", `url(${staticFile("brand/fonts/BricolageGrotesque-Variable.ttf")})`, {
    weight: "200 800",
  }).load(),
  new FontFace("Manrope", `url(${staticFile("brand/fonts/Manrope-Variable.ttf")})`, {
    weight: "200 800",
  }).load(),
])
  .then((faces) => {
    const fontSet = document.fonts as FontFaceSet & { add: (face: FontFace) => void };
    faces.forEach((face) => fontSet.add(face));
    continueRender(handle);
  })
  .catch((err) => cancelRender(err));
