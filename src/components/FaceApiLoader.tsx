'use client';

import { useEffect } from 'react';

const FACE_API_CDN = 'https://cdn.jsdelivr.net/npm/@vladmandic/face-api/dist/face-api.js';
const MODEL_BASE_URL = 'https://cdn.jsdelivr.net/gh/vladmandic/face-api/model/';

export default function FaceApiLoader() {
  useEffect(() => {
    if (window.faceapi) {
      console.log('face-api.js already loaded');
      window.dispatchEvent(new CustomEvent('faceapi-ready'));
      return;
    }

    const script = document.createElement('script');
    script.src = FACE_API_CDN;
    script.async = true;
    script.onload = () => {
      console.log('face-api.js script loaded');
      window.dispatchEvent(new CustomEvent('faceapi-ready'));
    };
    script.onerror = () => {
      console.error('Failed to load face-api.js script');
      window.dispatchEvent(new CustomEvent('faceapi-error'));
    };
    document.head.appendChild(script);

    return () => {
      if (document.head.contains(script)) {
        document.head.removeChild(script);
      }
    };
  }, []);

  return null;
}

export const MODEL_URL = MODEL_BASE_URL;
