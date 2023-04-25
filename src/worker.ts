import { expose } from "comlink";

const getDirtyPixelLocation = (imageData: ImageData) => {
  const locationOfDirtyPixel = imageData.data.indexOf(255);
  return locationOfDirtyPixel;
};

expose(getDirtyPixelLocation);

export type GetDirtyPixelLocation = typeof getDirtyPixelLocation;
