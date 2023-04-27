import { FPS } from "yy-fps";

const resolutions = {
  "1080p": [1920, 1080],
  "4k": [3840, 2160],
  "8k": [7680, 4320],
} as const;

type ResolutionKey = keyof typeof resolutions;

const fps = new FPS({
  FPS: 500,
});

function getRandomArbitrary(min: number, max: number) {
  return Math.trunc(Math.random() * (max - min) + min);
}

// DOM nodes
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

// state
let waitForWorkerResponse = waitCheckbox.checked;
let useFakeImageData = fakeDataCheckbox.checked;
let useTransferables = transferablesCheckbox.checked;
let selectedResolutionKey = resolutionField.querySelector<HTMLInputElement>(
  "input:checked"
)!.value as ResolutionKey;

let randomPixelLocation: number;
let workerBusy = false;

// event handling
waitCheckbox.addEventListener("change", () => {
  waitForWorkerResponse = waitCheckbox.checked;
});

fakeDataCheckbox.addEventListener("change", () => {
  useFakeImageData = fakeDataCheckbox.checked;
});

transferablesCheckbox.addEventListener("change", () => {
  useTransferables = transferablesCheckbox.checked;
});

resolutionField.addEventListener("change", (e) => {
  selectedResolutionKey = (e.target as HTMLInputElement).value as ResolutionKey;
});

// initialize the worker
const worker = new Worker(new URL("./worker.ts", import.meta.url));

// respond to worker
worker.addEventListener("message", (e: MessageEvent<number>) => {
  workerBusy = false;
  const framesInSync = e.data === randomPixelLocation;

  if (framesInSync) {
    inSyncNode.textContent = "✅";
  } else {
    inSyncNode.textContent = "⛔️";
  }
});

// the draw loop
function drawLoop() {
  if (!worker) {
    return;
  }

  if (workerBusy && waitForWorkerResponse) {
    return;
  }

  fps.frame();

  const selectedResolution = resolutions[selectedResolutionKey];
  const imageData = new ImageData(...(selectedResolution as [number, number]));

  randomPixelLocation = getRandomArbitrary(0, imageData.data.length - 1);
  imageData.data[randomPixelLocation] = 255;

  // Using `{ ...imageData }` will only spread the `data` property

  const fakeImageData: FakeImageData = {
    data: imageData.data,
    // width: imageData.width,
    // height: imageData.height,
  };

  const payload = useFakeImageData ? fakeImageData : imageData;
  const transferables = useTransferables ? [imageData.data.buffer] : [];

  workerBusy = true;
  worker.postMessage(payload, transferables);

  bufferLengthNode.textContent = imageData.data.length.toString();
}

// start the engine
setInterval(drawLoop, 0);

export type FakeImageData = {
  data: Uint8ClampedArray;
};
