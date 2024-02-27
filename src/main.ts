import { FPS } from "yy-fps";

const resolutions = {
  "1080p": [1920, 1080],
  "4k": [3840, 2160],
  "8k": [7680, 4320],
} as const;

type ResolutionKey = keyof typeof resolutions;

export type Payload = {
  imageData: ImageData;
  useBlackHole: boolean;
};

const fps = new FPS({
  FPS: 120,
});

function getRandomArbitrary(min: number, max: number) {
  return Math.trunc(Math.random() * (max - min) + min);
}

const canvas = document.createElement("canvas");
const ctx = canvas.getContext("2d", {
  willReadFrequently: true,
  // can't use `alpha: false` for this test as the alpha channels will be set to 255
})!;

// DOM nodes
const waitCheckbox = document.querySelector("#wait") as HTMLInputElement;
const canvasCheckbox = document.querySelector("#canvas") as HTMLInputElement;
const blackHoleCheckbox = document.querySelector(
  "#blackhole"
) as HTMLInputElement;
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

// state
let waitForWorkerResponse = waitCheckbox.checked;
let useFakeImageData = fakeDataCheckbox.checked;
let useTransferables = transferablesCheckbox.checked;
let useCanvas = canvasCheckbox.checked;
let useBlackHole = blackHoleCheckbox.checked;
let selectedResolutionKey = resolutionField.querySelector<HTMLInputElement>(
  "input:checked"
)!.value as ResolutionKey;

let animationFrame: number;
let randomPixelLocation: number;

// event handling
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

blackHoleCheckbox.addEventListener("change", () => {
  useBlackHole = blackHoleCheckbox.checked;
  cancelAnimationFrame(animationFrame);
  animationFrame = requestAnimationFrame(drawLoop);
});

canvasCheckbox.addEventListener("change", () => {
  useCanvas = canvasCheckbox.checked;
  cancelAnimationFrame(animationFrame);
  animationFrame = requestAnimationFrame(drawLoop);
});

resolutionField.addEventListener("change", (e) => {
  selectedResolutionKey = (e.target as HTMLInputElement).value as ResolutionKey;
  cancelAnimationFrame(animationFrame);
  animationFrame = requestAnimationFrame(drawLoop);
});

// initialize the worker
const worker = new Worker(new URL("./worker.ts", import.meta.url));

// respond to worker
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

// the draw loop
function drawLoop() {
  if (!worker) {
    return;
  }

  fps.frame();

  const selectedResolution = resolutions[selectedResolutionKey];
  let imageData: ImageData;

  // paint and read from canvas
  if (useCanvas) {
    canvas.width = selectedResolution[0];
    canvas.height = selectedResolution[1];
    ctx.drawImage(canvas, 0, 0);
    imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  } else {
    // or just create a new `ImageData` object
    imageData = new ImageData(...(selectedResolution as [number, number]));
  }

  randomPixelLocation = getRandomArbitrary(0, imageData.data.length - 1);
  imageData.data[randomPixelLocation] = 255;
  // Using `{ ...imageData }` will only spread the `data` property

  const fakeImageData: ImageData = {
    data: imageData.data,
    width: imageData.width,
    height: imageData.height,
    colorSpace: imageData.colorSpace,
  };

  const data = useFakeImageData ? fakeImageData : imageData;
  const payload: Payload = {
    imageData: data,
    useBlackHole,
  };
  const transferables = useTransferables ? [imageData.data.buffer] : [];

  worker.postMessage(payload, transferables);

  bufferLengthNode.textContent = imageData.data.length.toString();

  if (!waitForWorkerResponse) {
    animationFrame = requestAnimationFrame(drawLoop);
  }
}

// start the engine
requestAnimationFrame(drawLoop);
