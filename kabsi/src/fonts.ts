import { cancelRender, continueRender, delayRender, staticFile } from "remotion";

// Fonts live in kabsi/public/brand/fonts; kabsi/public is Remotion's public dir for Kabsi.
const handle = delayRender("Loading Lalezar and Readex Pro");

Promise.all([
  new FontFace("Lalezar", `url(${staticFile("brand/fonts/Lalezar-Regular.ttf")})`, {
    weight: "400",
  }).load(),
  new FontFace("Readex Pro", `url(${staticFile("brand/fonts/ReadexPro-Variable.ttf")})`, {
    weight: "160 700",
  }).load(),
])
  .then((faces) => {
    const fontSet = document.fonts as FontFaceSet & { add: (face: FontFace) => void };
    faces.forEach((face) => fontSet.add(face));
    continueRender(handle);
  })
  .catch((err) => cancelRender(err));
