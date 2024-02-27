// https://twitter.com/subzey/status/1711117272142471398/

import { Payload } from "./main";

const { port1, port2 } = new MessageChannel();
// "Black hole" port
port2.close();

onmessage = (e: MessageEvent<Payload>) => {
  const locationOfDirtyPixel = e.data.imageData.data.indexOf(255);

  if (e.data.useBlackHole) {
    // toss data buffer into the void
    port1.postMessage(e.data, [e.data.imageData.data.buffer]);
  }

  postMessage(locationOfDirtyPixel);
};
