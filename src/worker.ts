//caught (in promise) DOMException: Failed to execute 'postMessage' on 'Worker': Data cannot be cloned, out of memory.

onmessage = (e: any) => {
  const locationOfDirtyPixel = e.data.data.indexOf(255);
  // console.log(locationOfDirtyPixel);

  postMessage(locationOfDirtyPixel);
};
