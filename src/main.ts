const W = 1920;
const H = 1080;

const canvas = document.createElement("canvas");
const offscreenCanvas = document.createElement("canvas");

canvas.width = W;
canvas.height = H;

offscreenCanvas.width = W * 2;
offscreenCanvas.height = H * 2;

const ctx = canvas.getContext("2d", {
  willReadFrequently: true,
  alpha: false,
});

const offscreenCtx = offscreenCanvas.getContext("2d", {
  willReadFrequently: true,
  alpha: false,
});

// document.body.appendChild(canvas);

const imageData = new ImageData(offscreenCanvas.width, offscreenCanvas.height);
const buffer32 = new Uint32Array(imageData.data.buffer);

let len = buffer32.length - 1;
while (len--) buffer32[len] = Math.random() < 0.5 ? 0 : -1 >> 0;
offscreenCtx!.putImageData(imageData, 0, 0);

const drawLoop = () => {
  const x = Math.trunc(W * Math.random());
  const y = Math.trunc(H * Math.random());

  ctx!.drawImage(offscreenCanvas, -x, -y);

  requestAnimationFrame(drawLoop);
};

requestAnimationFrame(drawLoop);
