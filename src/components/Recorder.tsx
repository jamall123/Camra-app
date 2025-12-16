import React, { useState, useRef, useCallback, useEffect } from 'react';

interface RecorderProps {
    canvasSelector?: string;
}

export const Recorder: React.FC<RecorderProps> = ({
    canvasSelector = '.canvas-container canvas',
}) => {
    const [isRecording, setIsRecording] = useState(false);
    const [duration, setDuration] = useState(0);
    const [error, setError] = useState<string | null>(null);

    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const chunksRef = useRef<Blob[]>([]);
    const timerRef = useRef<ReturnType<typeof setInterval> | undefined>(undefined);

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            if (timerRef.current) clearInterval(timerRef.current);
            if (mediaRecorderRef.current?.state === 'recording') {
                mediaRecorderRef.current.stop();
            }
        };
    }, []);

    // Format duration as MM:SS
    const formatDuration = (seconds: number): string => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    // Get supported mime type
    const getSupportedMimeType = (): string => {
        const types = [
            'video/webm;codecs=vp9',
            'video/webm;codecs=vp8',
            'video/webm',
            'video/mp4',
        ];
        return types.find((type) => MediaRecorder.isTypeSupported(type)) || 'video/webm';
    };

    const startRecording = useCallback(() => {
        const canvas = document.querySelector(canvasSelector) as HTMLCanvasElement;

        if (!canvas) {
            setError('لم يتم العثور على مساحة الرسم');
            console.error('Canvas not found:', canvasSelector);
            return;
        }

        try {
            setError(null);
            const stream = canvas.captureStream(30);
            const mimeType = getSupportedMimeType();

            console.log(`Recording with: ${mimeType}`);

            const mediaRecorder = new MediaRecorder(stream, {
                mimeType,
                videoBitsPerSecond: 5000000, // 5 Mbps for better quality
            });

            mediaRecorderRef.current = mediaRecorder;
            chunksRef.current = [];

            mediaRecorder.ondataavailable = (event) => {
                if (event.data.size > 0) {
                    chunksRef.current.push(event.data);
                }
            };

            mediaRecorder.onstop = () => {
                if (timerRef.current) {
                    clearInterval(timerRef.current);
                }

                if (chunksRef.current.length === 0) {
                    setError('لم يتم تسجيل أي بيانات');
                    return;
                }

                // Create and download video
                const blob = new Blob(chunksRef.current, { type: mimeType });
                const url = URL.createObjectURL(blob);
                const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
                const extension = mimeType.includes('mp4') ? 'mp4' : 'webm';

                const link = document.createElement('a');
                link.href = url;
                link.download = `avatar-recording-${timestamp}.${extension}`;
                link.style.display = 'none';
                document.body.appendChild(link);
                link.click();

                // Cleanup
                setTimeout(() => {
                    document.body.removeChild(link);
                    URL.revokeObjectURL(url);
                }, 100);

                setDuration(0);
            };

            mediaRecorder.onerror = (event: Event) => {
                console.error('MediaRecorder error:', event);
                setError('حدث خطأ أثناء التسجيل');
                setIsRecording(false);
            };

            // Start recording with timeslice for better chunk handling
            mediaRecorder.start(1000);
            setIsRecording(true);
            setDuration(0);

            // Start duration timer
            timerRef.current = setInterval(() => {
                setDuration((prev) => prev + 1);
            }, 1000);
        } catch (err) {
            console.error('Recording start error:', err);
            setError('فشل بدء التسجيل');
        }
    }, [canvasSelector]);

    const stopRecording = useCallback(() => {
        if (mediaRecorderRef.current && isRecording) {
            mediaRecorderRef.current.stop();
            setIsRecording(false);
        }
    }, [isRecording]);

    return (
        <div className="recorder-container">
            {!isRecording ? (
                <button
                    onClick={startRecording}
                    className="record-btn start"
                    title="بدء التسجيل"
                    aria-label="Start Recording"
                >
                    <div className="record-icon" />
                    <span>REC</span>
                </button>
            ) : (
                <button
                    onClick={stopRecording}
                    className="record-btn stop"
                    title="إيقاف التسجيل"
                    aria-label="Stop Recording"
                >
                    <div className="stop-icon" />
                    <span>{formatDuration(duration)}</span>
                </button>
            )}

            {error && (
                <div className="recorder-error">
                    <span>{error}</span>
                    <button onClick={() => setError(null)}>✕</button>
                </div>
            )}
        </div>
    );
};
