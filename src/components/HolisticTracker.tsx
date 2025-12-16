import React, { useEffect, useRef, useState, useCallback } from 'react';
import Webcam from 'react-webcam';
import { Holistic, type Results } from '@mediapipe/holistic';
import * as cam from '@mediapipe/camera_utils';
import { Face, Pose, Hand } from 'kalidokit';
import type { TrackingStatus, AppMode } from '../types';

interface HolisticTrackerProps {
    onPoseUpdate: (riggedPose: any) => void;
    onTrackingStatus?: (status: TrackingStatus) => void;
    mode: AppMode;
}

export const HolisticTracker: React.FC<HolisticTrackerProps> = ({
    onPoseUpdate,
    onTrackingStatus,
    mode,
}) => {
    const webcamRef = useRef<Webcam>(null);
    const videoRef = useRef<HTMLVideoElement>(null);
    const cameraRef = useRef<cam.Camera | null>(null);
    const holisticRef = useRef<Holistic | null>(null);
    const animationRef = useRef<number | undefined>(undefined);
    const isProcessingRef = useRef<boolean>(false);

    const [videoUrl, setVideoUrl] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [retryCount, setRetryCount] = useState(0);

    const maxRetries = 3;

    // Process MediaPipe results
    const processResults = useCallback(
        (results: Results) => {
            // Update tracking status
            onTrackingStatus?.({
                face: !!results.faceLandmarks,
                pose: !!results.poseLandmarks,
                hands: !!(results.leftHandLandmarks || results.rightHandLandmarks),
            });

            // No pose landmarks = no tracking
            if (!results.poseLandmarks) {
                onPoseUpdate(null);
                return;
            }

            const videoElement = mode === 'camera' ? webcamRef.current?.video : videoRef.current;

            // Dynamic search for 3D pose landmarks (MediaPipe keys change often: ea, za, DL, etc.)
            const findPose3D = (res: any) => {
                if (res.poseWorldLandmarks) return res.poseWorldLandmarks;
                for (const key in res) {
                    // Look for array that looks like 3D landmarks (has x, y, z, visibility)
                    const val = res[key];
                    if (Array.isArray(val) && val.length > 30 && val[0] &&
                        typeof val[0].x === 'number' &&
                        typeof val[0].z === 'number' &&
                        'visibility' in val[0]) {
                        return val;
                    }
                }
                return null;
            };

            const pose3D = findPose3D(results);

            let poseRig = null;
            let faceRig = null;
            let rightHandRig = null;
            let leftHandRig = null;

            // Solve Pose
            try {
                poseRig = Pose.solve(results.poseLandmarks, pose3D, {
                    runtime: 'mediapipe',
                    video: videoElement,
                    enableLegs: false,
                });
            } catch (e) {
                console.warn('Pose solve error:', e);
            }

            // Solve Face
            if (results.faceLandmarks) {
                try {
                    faceRig = Face.solve(results.faceLandmarks, {
                        runtime: 'mediapipe',
                        video: videoElement,
                    });
                } catch (e) {
                    console.warn('Face solve error:', e);
                }
            }

            // Solve Hands
            if (results.rightHandLandmarks) {
                try {
                    rightHandRig = Hand.solve(results.rightHandLandmarks, 'Right');
                } catch (e) {
                    /* ignore */
                }
            }

            if (results.leftHandLandmarks) {
                try {
                    leftHandRig = Hand.solve(results.leftHandLandmarks, 'Left');
                } catch (e) {
                    /* ignore */
                }
            }

            onPoseUpdate({
                face: faceRig,
                pose: poseRig,
                rightHand: rightHandRig,
                leftHand: leftHandRig,
            });
        },
        [onPoseUpdate, onTrackingStatus, mode]
    );

    // Initialize Holistic
    useEffect(() => {
        let mounted = true;
        let retryTimeout: ReturnType<typeof setTimeout>;

        const initHolistic = async () => {
            try {
                setIsLoading(true);
                setError(null);

                const holistic = new Holistic({
                    locateFile: (file) => `/Camra-app/mediapipe/${file}`,
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

                holistic.onResults((results: Results) => {
                    if (!mounted) return;
                    processResults(results);
                });

                holisticRef.current = holistic;

                // Camera mode: start webcam
                if (mode === 'camera') {
                    const checkInterval = setInterval(() => {
                        const video = webcamRef.current?.video;
                        if (video && video.readyState >= 2) {
                            clearInterval(checkInterval);

                            try {
                                const camera = new cam.Camera(video, {
                                    onFrame: async () => {
                                        if (holisticRef.current && !isProcessingRef.current) {
                                            isProcessingRef.current = true;
                                            try {
                                                await holisticRef.current.send({ image: video });
                                            } finally {
                                                isProcessingRef.current = false;
                                            }
                                        }
                                    },
                                    width: 640,
                                    height: 480,
                                });

                                camera.start();
                                cameraRef.current = camera;
                                setIsLoading(false);
                                setRetryCount(0);
                            } catch (err) {
                                console.error('Camera start error:', err);
                                if (retryCount < maxRetries) {
                                    setError(`جاري المحاولة ${retryCount + 1}/${maxRetries}...`);
                                    retryTimeout = setTimeout(() => {
                                        if (mounted) setRetryCount((prev) => prev + 1);
                                    }, 2000);
                                } else {
                                    setError('فشل الوصول للكاميرا. يرجى إعادة تحميل الصفحة.');
                                }
                            }
                        }
                    }, 100);

                    // Cleanup interval after 15 seconds
                    setTimeout(() => clearInterval(checkInterval), 15000);
                } else {
                    setIsLoading(false);
                }
            } catch (err) {
                console.error('Holistic init error:', err);
                setError('فشل تهيئة تتبع الجسم');
                setIsLoading(false);
            }
        };

        // Cleanup previous
        onPoseUpdate(null);
        if (cameraRef.current) {
            cameraRef.current.stop();
            cameraRef.current = null;
        }
        if (animationRef.current) {
            cancelAnimationFrame(animationRef.current);
        }

        initHolistic();

        return () => {
            mounted = false;
            if (retryTimeout) clearTimeout(retryTimeout);
            if (cameraRef.current) cameraRef.current.stop();
            if (holisticRef.current) holisticRef.current.close();
            if (animationRef.current) cancelAnimationFrame(animationRef.current);
        };
    }, [mode, retryCount, processResults, onPoseUpdate]);

    // Video frame processing loop
    const processVideoFrame = useCallback(async () => {
        const video = videoRef.current;
        const holistic = holisticRef.current;

        if (video && holistic && !video.paused && !video.ended) {
            if (!isProcessingRef.current) {
                isProcessingRef.current = true;
                try {
                    await holistic.send({ image: video });
                } finally {
                    isProcessingRef.current = false;
                }
            }

            // Use requestVideoFrameCallback for better sync if available
            if ('requestVideoFrameCallback' in video) {
                (video as any).requestVideoFrameCallback(processVideoFrame);
            } else {
                animationRef.current = requestAnimationFrame(processVideoFrame);
            }
        }
    }, []);

    const handleVideoUpload = useCallback(
        (event: React.ChangeEvent<HTMLInputElement>) => {
            const file = event.target.files?.[0];
            if (file) {
                if (videoUrl) {
                    URL.revokeObjectURL(videoUrl);
                }
                setVideoUrl(URL.createObjectURL(file));
            }
        },
        [videoUrl]
    );

    const handleVideoPlay = useCallback(() => {
        const video = videoRef.current;
        if (!video) return;

        if ('requestVideoFrameCallback' in video) {
            (video as any).requestVideoFrameCallback(processVideoFrame);
        } else {
            animationRef.current = requestAnimationFrame(processVideoFrame);
        }
    }, [processVideoFrame]);

    // Cleanup video URL on unmount
    useEffect(() => {
        return () => {
            if (videoUrl) {
                URL.revokeObjectURL(videoUrl);
            }
        };
    }, [videoUrl]);

    return (
        <div className="tracker-container">
            {mode === 'camera' ? (
                <div className="webcam-preview">
                    <Webcam
                        ref={webcamRef}
                        mirrored
                        className="webcam-video"
                        videoConstraints={{
                            width: 640,
                            height: 480,
                            facingMode: 'user',
                        }}
                        onUserMediaError={(err) => {
                            console.error('Webcam error:', err);
                            setError('خطأ في الكاميرا. تأكد من السماح بالوصول.');
                        }}
                    />
                    {isLoading && !error && (
                        <div className="loading-overlay">
                            <div className="loading-spinner" />
                            <p>جاري تحميل الكاميرا...</p>
                        </div>
                    )}
                </div>
            ) : (
                <div className="video-upload-container">
                    <h3>📁 رفع فيديو مسجل</h3>
                    <label className="file-upload-label">
                        <input
                            type="file"
                            accept="video/*"
                            onChange={handleVideoUpload}
                            className="file-input"
                        />
                        <span className="file-upload-button">اختر ملف فيديو</span>
                    </label>

                    {videoUrl ? (
                        <video
                            ref={videoRef}
                            src={videoUrl}
                            controls
                            playsInline
                            className="uploaded-video"
                            onPlay={handleVideoPlay}
                        />
                    ) : (
                        <p className="upload-hint">قم برفع فيديو ليقوم الأفاتار بتقليده</p>
                    )}
                </div>
            )}

            {error && (
                <div className="error-overlay">
                    <p>{error}</p>
                    {retryCount < maxRetries && mode === 'camera' && (
                        <button onClick={() => window.location.reload()}>إعادة المحاولة</button>
                    )}
                </div>
            )}
        </div>
    );
};
