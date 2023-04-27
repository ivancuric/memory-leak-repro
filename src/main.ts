import { FPS } from "yy-fps";
import { INITIAL_WORKERS, workerController } from "./workerPool";

const resolutions = {
  "1080p": [1920, 1080],
  "4k": [3840, 2160],
  "8k": [7680, 4320],
} as const;

type ResolutionKey = keyof typeof resolutions;

const fps = new FPS({
  FPS: INITIAL_WORKERS * 100,
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
const workerThreadsNode = document.querySelector(
  "#workerThreads"
) as HTMLDivElement;
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
workerController.callback = (e) => {
  const framesInSync = e.data === randomPixelLocation;

  if (framesInSync) {
    inSyncNode.textContent = "✅";
  } else {
    inSyncNode.textContent = "⛔️";
  }
};

// the draw loop
function drawLoop() {
  if (workerController.workersBusy() && waitForWorkerResponse) {
    return;
  }

  fps.frame();

  const selectedResolution = resolutions[selectedResolutionKey];
  const imageData = new ImageData(...(selectedResolution as [number, number]));

  randomPixelLocation = getRandomArbitrary(0, imageData.data.length - 1);
  imageData.data[randomPixelLocation] = 255;

  // Using `{ ...imageData }` will only spread the `data` property

  const fakeImageData: ImageData = {
    data: imageData.data,
    width: imageData.width,
    height: imageData.height,
    colorSpace: imageData.colorSpace,
  };

  const payload = useFakeImageData ? fakeImageData : imageData;
  const transferables = useTransferables ? [imageData.data.buffer] : [];

  workerController.postMessage(payload, transferables);

  bufferLengthNode.textContent = imageData.data.length.toString();
}

// start the engine
setInterval(drawLoop, 0);

const drawThreads = () => {
  requestAnimationFrame(() => {
    const threadStatus = workerController.getWorkerStatus();
    workerThreadsNode.textContent = threadStatus
      .map((thread) => (thread ? "🟢" : "🔴"))
      .join("");
    drawThreads();
  });
};

requestAnimationFrame(drawThreads);
