import { cancelRender, continueRender, delayRender, staticFile } from "remotion";

// Cormorant Garamond (display) and Jost (labels), both SIL OFL, in assets/fonts.
const handle = delayRender("Loading Cormorant Garamond and Jost");

Promise.all([
  new FontFace("Cormorant Garamond", `url(${staticFile("fonts/CormorantGaramond-Variable.ttf")})`, {
    weight: "300 700",
    style: "normal",
  }).load(),
  new FontFace("Cormorant Garamond", `url(${staticFile("fonts/CormorantGaramond-Italic-Variable.ttf")})`, {
    weight: "300 700",
    style: "italic",
  }).load(),
  new FontFace("Jost", `url(${staticFile("fonts/Jost-Variable.ttf")})`, { weight: "100 900" }).load(),
])
  .then((faces) => {
    const fontSet = document.fonts as FontFaceSet & { add: (face: FontFace) => void };
    faces.forEach((face) => fontSet.add(face));
    continueRender(handle);
  })
  .catch((err) => cancelRender(err));
