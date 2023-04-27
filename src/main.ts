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
  // const imageData = new ImageData(...(selectedResolution as [number, number]));

  const arrayBuffer = new ArrayBuffer(
    selectedResolution[0] * selectedResolution[1] * 4
  );

  const dataArray = new Uint8ClampedArray(arrayBuffer);

  randomPixelLocation = getRandomArbitrary(0, dataArray.length - 1);
  dataArray[randomPixelLocation] = 255;

  const transferables = useTransferables ? [dataArray.buffer] : [];

  workerBusy = true;
  worker.postMessage(dataArray, transferables);

  bufferLengthNode.textContent = dataArray.length.toString();
}

// start the engine
setInterval(drawLoop, 0);
