import { ImageAnnotatorClient } from '@google-cloud/vision';

const vision = new ImageAnnotatorClient({
  keyFilename: process.env.GOOGLE_CLOUD_KEYFILE, // Itt kell a környezeti változót használni
});

export { vision };