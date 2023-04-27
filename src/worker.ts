onmessage = async (e: MessageEvent<ImageData>) => {
  // console.time("Looking for pixel");
  const locationOfDirtyPixel = e.data.data.indexOf(255);
  // console.timeEnd("Looking for pixel");
  // await new Promise((f) => setTimeout(f, 8));
  postMessage(locationOfDirtyPixel);
};
