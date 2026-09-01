import { useCallback, useEffect, useRef, useState } from 'react';

export interface UserMediaControls {
  videoRef: React.RefObject<HTMLVideoElement | null>;
  hasStream: boolean;
  micOn: boolean;
  camOn: boolean;
  error: string | null;
  requesting: boolean;
  start: () => Promise<void>;
  stop: () => void;
  toggleMic: () => void;
  toggleCam: () => void;
}

// Wraps navigator.mediaDevices.getUserMedia so the live-class pages can open
// the real camera + microphone, toggle them, and release them on unmount.
export function useUserMedia(): UserMediaControls {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [hasStream, setHasStream] = useState(false);
  const [micOn, setMicOn] = useState(true);
  const [camOn, setCamOn] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [requesting, setRequesting] = useState(false);

  const attach = useCallback(() => {
    const video = videoRef.current;
    const stream = streamRef.current;
    if (video && stream) {
      video.srcObject = stream;
      video.play().catch(() => { /* autoplay can be blocked until user interacts */ });
    }
  }, []);

  const start = useCallback(async () => {
    if (streamRef.current) {
      attach();
      return;
    }
    if (!navigator.mediaDevices?.getUserMedia) {
      setError('This browser does not support camera or microphone access.');
      return;
    }
    setRequesting(true);
    setError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      streamRef.current = stream;
      setHasStream(true);
      setMicOn(true);
      setCamOn(true);
      attach();
    } catch (err) {
      const name = err instanceof DOMException ? err.name : '';
      if (name === 'NotAllowedError' || name === 'PermissionDeniedError' || name === 'SecurityError') {
        setError('Camera/microphone permission was denied. Allow access from the browser address bar and try again.');
      } else if (name === 'NotFoundError' || name === 'DevicesNotFoundError' || name === 'OverconstrainedError') {
        setError('No camera or microphone was found on this device.');
      } else if (name === 'NotReadableError' || name === 'TrackStartError') {
        setError('The camera or microphone is already in use by another application.');
      } else {
        setError('Could not start the camera or microphone.');
      }
    } finally {
      setRequesting(false);
    }
  }, [attach]);

  const stop = useCallback(() => {
    streamRef.current?.getTracks().forEach(t => t.stop());
    streamRef.current = null;
    setHasStream(false);
    if (videoRef.current) videoRef.current.srcObject = null;
  }, []);

  const toggleMic = useCallback(() => {
    setMicOn(prev => {
      const next = !prev;
      streamRef.current?.getAudioTracks().forEach(t => { t.enabled = next; });
      return next;
    });
  }, []);

  const toggleCam = useCallback(() => {
    setCamOn(prev => {
      const next = !prev;
      streamRef.current?.getVideoTracks().forEach(t => { t.enabled = next; });
      return next;
    });
  }, []);

  // Release the camera/mic when the component unmounts.
  useEffect(() => () => {
    streamRef.current?.getTracks().forEach(t => t.stop());
    streamRef.current = null;
  }, []);

  return { videoRef, hasStream, micOn, camOn, error, requesting, start, stop, toggleMic, toggleCam };
}
