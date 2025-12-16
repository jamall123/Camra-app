import React, { useEffect, useRef, useState } from 'react';
import Webcam from 'react-webcam';
import { Holistic, type Results } from '@mediapipe/holistic';
import * as cam from '@mediapipe/camera_utils';
import * as Kalidokit from 'kalidokit';

interface HolisticTrackerProps {
    onPoseUpdate: (riggedPose: any) => void;
    onTrackingStatus?: (status: { face: boolean; pose: boolean; hands: boolean }) => void;
}

export const HolisticTracker: React.FC<HolisticTrackerProps> = ({ onPoseUpdate, onTrackingStatus }) => {
    const webcamRef = useRef<Webcam>(null);
    const cameraRef = useRef<cam.Camera | null>(null);
    const holisticRef = useRef<Holistic | null>(null);
    const [isReady, setIsReady] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [retryCount, setRetryCount] = useState(0);
    const maxRetries = 3;

    useEffect(() => {
        let mounted = true;
        let retryTimeout: number;

        const initHolistic = async () => {
            try {
                const holistic = new Holistic({
                    locateFile: (file) => {
                        return `https://cdn.jsdelivr.net/npm/@mediapipe/holistic/${file}`;
                    },
                });

                holistic.setOptions({
                    modelComplexity: 1,
                    smoothLandmarks: true,
                    enableSegmentation: false,
                    smoothSegmentation: false,
                    refineFaceLandmarks: true,
                    minDetectionConfidence: 0.5,
                    minTrackingConfidence: 0.5,
                });

                // Safe import for Kalidokit
                const KalidokitLib = (Kalidokit as any).default || Kalidokit;

                holistic.onResults((results: Results) => {
                    if (!mounted) return;

                    // Update Status Check
                    if (onTrackingStatus) {
                        onTrackingStatus({
                            face: !!results.faceLandmarks,
                            pose: !!results.poseLandmarks,
                            hands: !!(results.leftHandLandmarks || results.rightHandLandmarks)
                        });
                    }

                    // Check if landmarks exist
                    if (!results.poseLandmarks) {
                        onPoseUpdate(null); // Clear pose if lost
                        return;
                    }

                    // Solve Pose
                    const pose3D = (results as any).poseWorldLandmarks || (results as any).ea;

                    let poseRig = null;
                    try {
                        poseRig = KalidokitLib.Pose.solve(results.poseLandmarks, pose3D, {
                            runtime: 'mediapipe',
                            video: webcamRef.current?.video,
                            enableLegs: false, // CRITICAL FIX: Ignore legs/hips to prevent errors in half-body view
                        });
                    } catch (e) {
                        console.error("Kalidokit Pose Error", e);
                    }

                    // Solve Face
                    let faceRig = null;
                    if (results.faceLandmarks) {
                        try {
                            faceRig = KalidokitLib.Face.solve(results.faceLandmarks, {
                                runtime: 'mediapipe',
                                video: webcamRef.current?.video
                            });
                        } catch (e) {
                            console.error("Kalidokit Face Error", e);
                        }
                    }

                    // Solve Hands
                    let rightHandRig = null;
                    if (results.rightHandLandmarks) {
                        try {
                            rightHandRig = KalidokitLib.Hand.solve(results.rightHandLandmarks, "Right");
                        } catch (e) { }
                    }

                    let leftHandRig = null;
                    if (results.leftHandLandmarks) {
                        try {
                            leftHandRig = KalidokitLib.Hand.solve(results.leftHandLandmarks, "Left");
                        } catch (e) { }
                    }

                    onPoseUpdate({
                        face: faceRig,
                        pose: poseRig,
                        rightHand: rightHandRig,
                        leftHand: leftHandRig
                    });
                });

                holisticRef.current = holistic;

                // Wait for webcam to be ready with retry logic
                const checkWebcam = setInterval(() => {
                    if (webcamRef.current && webcamRef.current.video && webcamRef.current.video.readyState === 4) {
                        clearInterval(checkWebcam);

                        try {
                            const camera = new cam.Camera(webcamRef.current.video, {
                                onFrame: async () => {
                                    if (webcamRef.current && webcamRef.current.video && holisticRef.current) {
                                        await holisticRef.current.send({ image: webcamRef.current.video });
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

                // Cleanup interval after 20 seconds
                setTimeout(() => clearInterval(checkWebcam), 20000);

            } catch (err) {
                console.error('Holistic initialization error:', err);
                setError('فشل تهيئة تتبع الجسم');
            }
        };

        initHolistic();

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
            if (holisticRef.current) {
                try {
                    holisticRef.current.close();
                } catch (e) {
                    console.error('Error closing holistic:', e);
                }
                holisticRef.current = null;
            }
        };
    }, [onPoseUpdate, retryCount, onTrackingStatus]);

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
                onUserMediaError={(err: any) => {
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
                    <p style={{ marginTop: '1rem', fontSize: '0.875rem' }}>جاري تحميل نموذج تتبع الجسم الكامل...</p>
                    <p style={{ marginTop: '0.5rem', fontSize: '0.75rem', opacity: 0.7 }}>قد يستغرق هذا بضع ثوانٍ</p>
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
