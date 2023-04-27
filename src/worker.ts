import { FakeImageData } from "./main";

onmessage = (e: MessageEvent<FakeImageData>) => {
  // const view = new Uint8Array(e.data.buffer);
  const locationOfDirtyPixel = e.data.data.indexOf(255);

  postMessage(locationOfDirtyPixel);
};
