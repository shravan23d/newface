'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { detectFace, loadFaceApiModels } from '@/lib/faceApi';

type CameraStatus = 'idle' | 'loading-models' | 'starting-camera' | 'ready' | 'error';

export function useFaceCamera(enabled: boolean) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [retryKey, setRetryKey] = useState(0);
  const [status, setStatus] = useState<CameraStatus>('idle');
  const [error, setError] = useState('');
  const [faceDetected, setFaceDetected] = useState(false);
  const [faceDescriptor, setFaceDescriptor] = useState<number[]>([]);
  const [detectionCount, setDetectionCount] = useState(0);
  const [logs, setLogs] = useState<string[]>([]);

  const addLog = useCallback((message: string) => {
    setLogs((current) => [...current.slice(-11), `[${new Date().toLocaleTimeString()}] ${message}`]);
  }, []);

  const waitForFaceApi = useCallback(async () => {
    if (window.faceapi) return;

    await new Promise<void>((resolve, reject) => {
      const timeout = window.setTimeout(() => reject(new Error('Face library timed out')), 30000);
      const cleanUp = () => {
        window.clearTimeout(timeout);
        window.removeEventListener('faceapi-ready', onReady);
        window.removeEventListener('faceapi-error', onError);
      };
      const onReady = () => {
        cleanUp();
        resolve();
      };
      const onError = () => {
        cleanUp();
        reject(new Error('Face library failed to load'));
      };

      window.addEventListener('faceapi-ready', onReady);
      window.addEventListener('faceapi-error', onError);
    });
  }, []);

  useEffect(() => {
    if (!enabled) {
      return;
    }

    let stream: MediaStream | null = null;
    let intervalId: number | undefined;
    let cancelled = false;

    const start = async () => {
      try {
        setError('');
        setStatus('loading-models');
        addLog('Preparing face recognition');
        await waitForFaceApi();
        await loadFaceApiModels();

        if (cancelled) return;

        setStatus('starting-camera');
        addLog('Requesting camera access');
        stream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: 'user',
            width: { ideal: 720 },
            height: { ideal: 1080 },
            aspectRatio: { ideal: 0.6667 },
          },
        });

        if (cancelled || !videoRef.current) {
          stream.getTracks().forEach((track) => track.stop());
          return;
        }

        const video = videoRef.current;
        video.srcObject = stream;
        await video.play();

        if (cancelled) return;

        setStatus('ready');
        addLog('Camera ready');

        intervalId = window.setInterval(async () => {
          if (!videoRef.current || videoRef.current.readyState < 2) return;

          try {
            const detection = await detectFace(videoRef.current);
            if (!detection) {
              setFaceDetected(false);
              return;
            }

            setFaceDetected(true);
            setFaceDescriptor(Array.from(detection.descriptor));
            setDetectionCount((count) => count + 1);
          } catch (detectError) {
            const message = detectError instanceof Error ? detectError.message : 'Detection failed';
            addLog(message);
          }
        }, 450);
      } catch (startError) {
        const rawMessage = startError instanceof Error ? startError.message : 'Camera setup failed';
        const message = rawMessage.toLowerCase().includes('permission') || rawMessage.toLowerCase().includes('denied')
          ? 'Camera permission denied. Allow camera access in the browser, then refresh this page.'
          : rawMessage;
        setStatus('error');
        setError(message);
        addLog(message);
      }
    };

    start();

    return () => {
      cancelled = true;
      if (intervalId) window.clearInterval(intervalId);
      if (stream) stream.getTracks().forEach((track) => track.stop());
    };
  }, [addLog, enabled, retryKey, waitForFaceApi]);

  const captureFace = useCallback(async () => {
    if (!videoRef.current) {
      throw new Error('Camera is not ready');
    }

    const detection = await detectFace(videoRef.current);
    if (!detection) {
      throw new Error('No face detected. Center the face and try again.');
    }

    const descriptor = Array.from(detection.descriptor);
    setFaceDescriptor(descriptor);
    setFaceDetected(true);
    return descriptor;
  }, []);

  return {
    videoRef,
    status,
    error,
    faceDetected,
    faceDescriptor,
    detectionCount,
    logs,
    captureFace,
    retry: () => setRetryKey((key) => key + 1),
  };
}
