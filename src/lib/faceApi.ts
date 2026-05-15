const MODEL_BASE_URL = 'https://cdn.jsdelivr.net/gh/vladmandic/face-api/model/';

type FaceApi = {
  nets: {
    tinyFaceDetector: { loadFromUri: (url: string) => Promise<void> };
    faceLandmark68Net: { loadFromUri: (url: string) => Promise<void> };
    faceRecognitionNet: { loadFromUri: (url: string) => Promise<void> };
  };
  TinyFaceDetectorOptions: new (options: { inputSize: number; scoreThreshold: number }) => unknown;
  detectSingleFace: (input: HTMLVideoElement, options?: unknown) => {
    withFaceLandmarks: () => {
      withFaceDescriptor: () => Promise<FaceDetectionResult | undefined>;
    };
  };
};

export interface FaceDetectionResult {
  detection: { score: number };
  descriptor: Float32Array;
}

declare global {
  interface Window {
    faceapi?: FaceApi;
  }
}

export async function loadFaceApiModels(): Promise<void> {
  const faceapi = window.faceapi;
  if (!faceapi) {
    throw new Error('face-api.js not loaded. Please refresh the page.');
  }

  console.log('Loading face detection models from:', MODEL_BASE_URL);

  await faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_BASE_URL);
  console.log('Tiny Face Detector loaded');

  await faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_BASE_URL);
  console.log('Face Landmark loaded');

  await faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_BASE_URL);
  console.log('Face Recognition loaded');
}

export function detectFace(videoEl: HTMLVideoElement): Promise<FaceDetectionResult | undefined> {
  const faceapi = window.faceapi;
  if (!faceapi) {
    throw new Error('face-api.js is not ready yet.');
  }

  const options = new faceapi.TinyFaceDetectorOptions({
    inputSize: 416,
    scoreThreshold: 0.35,
  });

  return faceapi
    .detectSingleFace(videoEl, options)
    .withFaceLandmarks()
    .withFaceDescriptor();
}

export function isFaceApiLoaded(): boolean {
  return !!window.faceapi;
}
