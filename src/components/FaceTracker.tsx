import React, { useEffect, useRef, useState } from 'react';
import Webcam from 'react-webcam';
import { FaceMesh } from '@mediapipe/face_mesh';
import * as cam from '@mediapipe/camera_utils';

interface FaceTrackerProps {
    onFaceUpdate: (rotation: [number, number, number], mouthOpen: number) => void;
}

export const FaceTracker: React.FC<FaceTrackerProps> = ({ onFaceUpdate }) => {
    const webcamRef = useRef<Webcam>(null);
    const cameraRef = useRef<cam.Camera | null>(null);
    const faceMeshRef = useRef<FaceMesh | null>(null);
    const [isReady, setIsReady] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [retryCount, setRetryCount] = useState(0);
    const maxRetries = 3;

    useEffect(() => {
        let mounted = true;
        let retryTimeout: number;

        const initFaceTracking = async () => {
            try {
                const faceMesh = new FaceMesh({
                    locateFile: (file) => {
                        return `https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh/${file}`;
                    },
                });

                faceMesh.setOptions({
                    maxNumFaces: 1,
                    refineLandmarks: true,
                    minDetectionConfidence: 0.6,
                    minTrackingConfidence: 0.6,
                });

                faceMesh.onResults((results) => {
                    if (!mounted) return;

                    if (results.multiFaceLandmarks && results.multiFaceLandmarks.length > 0) {
                        const landmarks = results.multiFaceLandmarks[0];

                        // Improved head rotation estimation
                        const top = landmarks[10];
                        const bottom = landmarks[152];
                        const left = landmarks[234];
                        const right = landmarks[454];
                        const leftEye = landmarks[33];
                        const rightEye = landmarks[263];

                        // Pitch (up/down rotation) - smoothed and inverted to fix direction
                        const pitch = -1 * (top.z - bottom.z) * 4.5;

                        // Yaw (left/right rotation) - smoothed
                        const yaw = (right.z - left.z) * 4.5;

                        // Roll (tilt rotation) - improved calculation
                        const eyeDeltaY = rightEye.y - leftEye.y;
                        const eyeDeltaX = rightEye.x - leftEye.x;
                        const roll = Math.atan2(eyeDeltaY, eyeDeltaX) * 0.4;

                        // Improved mouth openness detection
                        const upperLip = landmarks[13];
                        const lowerLip = landmarks[14];
                        const mouthDist = Math.hypot(upperLip.x - lowerLip.x, upperLip.y - lowerLip.y, upperLip.z - lowerLip.z);
                        const mouthOpen = Math.min(mouthDist * 45, 1.0);

                        onFaceUpdate([pitch, yaw, roll], mouthOpen);
                    }
                });

                faceMeshRef.current = faceMesh;

                // Wait for webcam to be ready with retry logic
                const checkWebcam = setInterval(() => {
                    if (webcamRef.current && webcamRef.current.video && webcamRef.current.video.readyState === 4) {
                        clearInterval(checkWebcam);

                        try {
                            const camera = new cam.Camera(webcamRef.current.video, {
                                onFrame: async () => {
                                    if (webcamRef.current && webcamRef.current.video && faceMeshRef.current) {
                                        await faceMeshRef.current.send({ image: webcamRef.current.video });
                                    }
                                },
                                width: 640,
                                height: 480,
                            });

                            camera.start();
                            cameraRef.current = camera;
                            setIsReady(true);
                            setError(null);
                            setRetryCount(0);
                        } catch (err) {
                            console.error('Camera start error:', err);
                            if (retryCount < maxRetries) {
                                setError(`جاري المحاولة ${retryCount + 1}/${maxRetries}...`);
                                retryTimeout = setTimeout(() => {
                                    setRetryCount(prev => prev + 1);
                                }, 2000);
                            } else {
                                setError('فشل الوصول للكاميرا. يرجى إعادة تحميل الصفحة.');
                            }
                        }
                    }
                }, 100);

                // Cleanup interval after 15 seconds if webcam doesn't load
                setTimeout(() => clearInterval(checkWebcam), 15000);

            } catch (err) {
                console.error('Face tracking initialization error:', err);
                setError('فشل تهيئة تتبع الوجه');
            }
        };

        initFaceTracking();

        // Cleanup function
        return () => {
            mounted = false;
            if (retryTimeout) clearTimeout(retryTimeout);
            if (cameraRef.current) {
                try {
                    cameraRef.current.stop();
                } catch (e) {
                    console.error('Error stopping camera:', e);
                }
                cameraRef.current = null;
            }
            if (faceMeshRef.current) {
                try {
                    faceMeshRef.current.close();
                } catch (e) {
                    console.error('Error closing faceMesh:', e);
                }
                faceMeshRef.current = null;
            }
        };
    }, [onFaceUpdate, retryCount]);

    return (
        <div className="webcam-preview">
            <Webcam
                ref={webcamRef}
                style={{ width: '100%', height: '100%' }}
                mirrored
                videoConstraints={{
                    width: 640,
                    height: 480,
                    facingMode: "user"
                }}
                onUserMediaError={(err) => {
                    console.error('Webcam error:', err);
                    const errorMsg = (err instanceof DOMException && err.name === 'NotAllowedError')
                        ? 'تم رفض الوصول للكاميرا. يرجى السماح بالوصول.'
                        : (err instanceof DOMException && err.name === 'NotReadableError')
                            ? 'الكاميرا مستخدمة في تطبيق آخر. يرجى إغلاقه.'
                            : 'خطأ في الكاميرا. يرجى إعادة المحاولة.';
                    setError(errorMsg);
                }}
            />
            {!isReady && !error && (
                <div className="webcam-loading">
                    <div className="loading-spinner"></div>
                    <p style={{ marginTop: '1rem', fontSize: '0.875rem' }}>جاري تحميل الكاميرا...</p>
                </div>
            )}
            {error && (
                <div className="webcam-error">
                    <p>{error}</p>
                    {retryCount < maxRetries && (
                        <button
                            onClick={() => window.location.reload()}
                            style={{
                                marginTop: '0.5rem',
                                padding: '0.5rem 1rem',
                                background: 'var(--color-accent)',
                                color: 'white',
                                border: 'none',
                                borderRadius: '0.25rem',
                                cursor: 'pointer'
                            }}
                        >
                            إعادة المحاولة
                        </button>
                    )}
                </div>
            )}
        </div>
    );
};
