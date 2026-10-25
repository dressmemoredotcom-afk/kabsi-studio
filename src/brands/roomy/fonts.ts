import { cancelRender, continueRender, delayRender, staticFile } from "remotion";

// Cormorant Garamond (display), Jost (labels) and Amiri (Arabic), all SIL OFL, in assets/fonts.
const handle = delayRender("Loading Cormorant Garamond, Jost and Amiri");

Promise.all([
  new FontFace("Cormorant Garamond", `url(${staticFile("fonts/CormorantGaramond-Variable.ttf")})`, { weight: "300 700", style: "normal" }).load(),
  new FontFace("Cormorant Garamond", `url(${staticFile("fonts/CormorantGaramond-Italic-Variable.ttf")})`, { weight: "300 700", style: "italic" }).load(),
  new FontFace("Jost", `url(${staticFile("fonts/Jost-Variable.ttf")})`, { weight: "100 900" }).load(),
  new FontFace("Amiri", `url(${staticFile("fonts/Amiri-Regular.ttf")})`, { weight: "400" }).load(),
])
  .then((faces) => {
    const fontSet = document.fonts as FontFaceSet & { add: (face: FontFace) => void };
    faces.forEach((face) => fontSet.add(face));
    continueRender(handle);
  })
  .catch((err) => cancelRender(err));
