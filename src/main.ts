import { wrap, transfer } from "comlink";
import { FPS } from "yy-fps";
import { GetDirtyPixelLocation } from "./worker";

const resolutions = {
  "1080p": [1920, 1080],
  "4k": [3840, 2160],
  "8k": [7680, 4320],
} as const;

type ResolutionKey = keyof typeof resolutions;

const fps = new FPS({
  FPS: 120,
});

function getRandomArbitrary(min: number, max: number) {
  return Math.trunc(Math.random() * (max - min) + min);
}

// DOM nodes
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
let useFakeImageData = fakeDataCheckbox.checked;
let useTransferables = transferablesCheckbox.checked;
let selectedResolutionKey = resolutionField.querySelector<HTMLInputElement>(
  "input:checked"
)!.value as ResolutionKey;

let animationFrame: number;
let randomPixelLocation: number;

// event handling
fakeDataCheckbox.addEventListener("change", () => {
  useFakeImageData = fakeDataCheckbox.checked;
  // cancelAnimationFrame(animationFrame);
});

transferablesCheckbox.addEventListener("change", () => {
  useTransferables = transferablesCheckbox.checked;
  // cancelAnimationFrame(animationFrame);
});

resolutionField.addEventListener("change", (e) => {
  selectedResolutionKey = (e.target as HTMLInputElement).value as ResolutionKey;
  // cancelAnimationFrame(animationFrame);
});

// initialize the worker
const worker = new Worker(new URL("./worker.ts", import.meta.url), {
  type: "module",
});

const getDirtyPixelLocation = wrap<GetDirtyPixelLocation>(worker);

// the draw loop
async function drawLoop() {
  if (!worker) {
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

  const pixelLocation = await getDirtyPixelLocation(
    transfer(payload, transferables)
  );

  const framesInSync = pixelLocation === randomPixelLocation;

  if (framesInSync) {
    inSyncNode.textContent = "✅";
  } else {
    inSyncNode.textContent = "⛔️";
  }

  bufferLengthNode.textContent = imageData.data.length.toString();

  requestAnimationFrame(drawLoop);
}

// start the engine
requestAnimationFrame(drawLoop);
