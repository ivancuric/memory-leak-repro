//caught (in promise) DOMException: Failed to execute 'postMessage' on 'Worker': Data cannot be cloned, out of memory.

onmessage = (e: MessageEvent<ImageData>) => {
  const locationOfDirtyPixel = e.data.data.indexOf(255);
  postMessage(locationOfDirtyPixel);
};
