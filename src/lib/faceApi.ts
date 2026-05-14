const MODEL_BASE_URL = 'https://cdn.jsdelivr.net/gh/vladmandic/face-api/model/';

type FaceApi = {
  nets: {
    ssdMobilenetv1: { loadFromUri: (url: string) => Promise<void> };
    faceLandmark68Net: { loadFromUri: (url: string) => Promise<void> };
    faceRecognitionNet: { loadFromUri: (url: string) => Promise<void> };
  };
  detectSingleFace: (input: HTMLVideoElement) => {
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

  await faceapi.nets.ssdMobilenetv1.loadFromUri(MODEL_BASE_URL);
  console.log('SSD MobileNet loaded');

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

  return faceapi
    .detectSingleFace(videoEl)
    .withFaceLandmarks()
    .withFaceDescriptor();
}

export function isFaceApiLoaded(): boolean {
  return !!window.faceapi;
}
