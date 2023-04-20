const worker = new Worker(new URL("./worker.ts", import.meta.url));

function getRandomArbitrary(min: number, max: number) {
  return Math.trunc(Math.random() * (max - min) + min);
}

let randomPixelLocation: number;

worker.addEventListener("message", (e: MessageEvent<number>) => {
  console.log(e.data === randomPixelLocation);
  requestAnimationFrame(drawLoop);
});

const drawLoop = async () => {
  if (!worker) {
    return;
  }

  const imageData = new ImageData(1920, 1080);

  randomPixelLocation = getRandomArbitrary(0, imageData.data.length - 1);
  // console.log(randomPixelLocation);
  imageData.data[randomPixelLocation] = 255;

  worker.postMessage(imageData, [imageData.data.buffer]);
};

requestAnimationFrame(drawLoop);
