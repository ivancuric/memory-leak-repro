import { FPS } from "yy-fps";

const fps = new FPS({
  FPS: 120,
});

const waitCheckbox = document.querySelector("#wait") as HTMLInputElement;
const fakeDataCheckbox = document.querySelector(
  "#fakeimgdata"
) as HTMLInputElement;
const transferablesCheckbox = document.querySelector(
  "#transferable"
) as HTMLInputElement;
const inSyncNode = document.querySelector("#insync") as HTMLDivElement;
const bufferLengthNode = document.querySelector(
  "#bufferLength"
) as HTMLDivElement;

let waitForWorkerResponse = waitCheckbox.checked;
let useFakeImageData = fakeDataCheckbox.checked;
let useTransferables = transferablesCheckbox.checked;

let animationFrame: number;

waitCheckbox.addEventListener("change", () => {
  waitForWorkerResponse = waitCheckbox.checked;
  cancelAnimationFrame(animationFrame);
  animationFrame = requestAnimationFrame(drawLoop);
});

fakeDataCheckbox.addEventListener("change", () => {
  useFakeImageData = fakeDataCheckbox.checked;
  cancelAnimationFrame(animationFrame);
  animationFrame = requestAnimationFrame(drawLoop);
});

transferablesCheckbox.addEventListener("change", () => {
  useTransferables = transferablesCheckbox.checked;
  cancelAnimationFrame(animationFrame);
  animationFrame = requestAnimationFrame(drawLoop);
});

const worker = new Worker(new URL("./worker.ts", import.meta.url));

function getRandomArbitrary(min: number, max: number) {
  return Math.trunc(Math.random() * (max - min) + min);
}

let randomPixelLocation: number;

worker.addEventListener("message", (e: MessageEvent<number>) => {
  const framesInSync = e.data === randomPixelLocation;
  console.log(framesInSync);

  if (framesInSync) {
    inSyncNode.textContent = "✅";
  } else {
    inSyncNode.textContent = "⛔️";
  }
  // console.log(framesInSync);

  if (waitForWorkerResponse && framesInSync) {
    animationFrame = requestAnimationFrame(drawLoop);
  }
});

function drawLoop() {
  if (!worker) {
    return;
  }

  fps.frame();

  const imageData = new ImageData(3840, 2160);

  randomPixelLocation = getRandomArbitrary(0, imageData.data.length - 1);
  imageData.data[randomPixelLocation] = 255;

  const fakeImageData = {
    data: imageData.data,
    width: imageData.width,
    height: imageData.height,
    colorSpace: imageData.colorSpace,
  } satisfies ImageData;

  const payload = useFakeImageData ? fakeImageData : imageData;
  const transferables = useTransferables ? [imageData.data.buffer] : [];

  worker.postMessage(payload, transferables);

  bufferLengthNode.textContent = imageData.data.length.toString();

  if (!waitForWorkerResponse) {
    animationFrame = requestAnimationFrame(drawLoop);
  }
}

requestAnimationFrame(drawLoop);
