onmessage = (e: MessageEvent<ImageData>) => {
  const locationOfDirtyPixel = e.data.data.indexOf(255);

  postMessage(locationOfDirtyPixel);
};
