onmessage = (e: MessageEvent<Uint8ClampedArray>) => {
  // const view = new Uint8Array(e.data.buffer);
  const locationOfDirtyPixel = e.data.indexOf(255);

  postMessage(locationOfDirtyPixel);
};
