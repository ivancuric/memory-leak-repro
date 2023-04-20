const canvas = document.createElement("canvas");

canvas.width = 1920;
canvas.height = 1080;

const ctx = canvas.getContext("2d", {
  willReadFrequently: true,
  alpha: false,
});

document.body.appendChild(canvas);

const imageData = new ImageData(canvas.width, canvas.height);

imageData.data.fill(255);

function getRandomArbitrary(min: number, max: number) {
  return Math.trunc(Math.random() * (max - min) + min);
}

ctx!.putImageData(imageData, 0, 0);

const drawLoop = () => {
  const randomPixel = getRandomArbitrary(0, imageData.data.length - 1);
  imageData.data[randomPixel] = 0;

  ctx!.putImageData(imageData, 0, 0);

  requestAnimationFrame(drawLoop);
};

requestAnimationFrame(drawLoop);
