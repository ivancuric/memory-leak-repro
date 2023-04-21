import { FPS } from "yy-fps";

const resolutions = {
  "1080p": [1920, 1080],
  "4k": [3840, 2160],
  "8k": [7680, 4320],
} as const;

type ResolutionKey = keyof typeof resolutions;

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
const resolutionField = document.querySelector(
  "#resolution"
) as HTMLFieldSetElement;

let waitForWorkerResponse = waitCheckbox.checked;
let useFakeImageData = fakeDataCheckbox.checked;
let useTransferables = transferablesCheckbox.checked;
let selectedResolutionKey = resolutionField.querySelector<HTMLInputElement>(
  "input:checked"
)!.value as ResolutionKey;

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

resolutionField.addEventListener("change", (e) => {
  selectedResolutionKey = (e.target as HTMLInputElement).value as ResolutionKey;
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

  if (framesInSync) {
    inSyncNode.textContent = "✅";
  } else {
    inSyncNode.textContent = "⛔️";
  }

  if (waitForWorkerResponse && framesInSync) {
    animationFrame = requestAnimationFrame(drawLoop);
  }
});

function drawLoop() {
  if (!worker) {
    return;
  }

  fps.frame();

  const selectedResolution = resolutions[selectedResolutionKey];
  const imageData = new ImageData(...(selectedResolution as [number, number]));

  randomPixelLocation = getRandomArbitrary(0, imageData.data.length - 1);
  imageData.data[randomPixelLocation] = 255;

  // Using `{ ...imageData }` will only spread the `data` property

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
