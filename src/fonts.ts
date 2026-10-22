import { cancelRender, continueRender, delayRender, staticFile } from "remotion";

// Fonts live in assets/fonts, which is Remotion's public dir.
const handle = delayRender("Loading Lalezar and Readex Pro");

Promise.all([
  new FontFace("Lalezar", `url(${staticFile("fonts/Lalezar-Regular.ttf")})`, {
    weight: "400",
  }).load(),
  new FontFace("Readex Pro", `url(${staticFile("fonts/ReadexPro-Variable.ttf")})`, {
    weight: "160 700",
  }).load(),
])
  .then((faces) => {
    faces.forEach((face) => document.fonts.add(face));
    continueRender(handle);
  })
  .catch((err) => cancelRender(err));
