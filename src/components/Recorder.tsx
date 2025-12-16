import React, { useState, useRef } from 'react';

export const Recorder: React.FC = () => {
    const [isRecording, setIsRecording] = useState(false);
    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const chunksRef = useRef<Blob[]>([]);

    const startRecording = () => {
        const canvas = document.querySelector('canvas');
        if (!canvas) {
            console.error("Canvas not found for recording");
            alert("خطأ: لم يتم العثور على مساحة الرسم للتسجيل.");
            return;
        }

        try {
            // Capture stream from canvas (30 FPS)
            const stream = canvas.captureStream(30);

            // Detect supported mime type
            const mimeTypes = [
                'video/webm;codecs=vp9',
                'video/webm;codecs=vp8',
                'video/webm',
                'video/mp4'
            ];

            const mimeType = mimeTypes.find(type => MediaRecorder.isTypeSupported(type)) || 'video/webm';
            console.log(`Using mime type: ${mimeType}`);

            const mediaRecorder = new MediaRecorder(stream, {
                mimeType: mimeType
            });

            mediaRecorderRef.current = mediaRecorder;
            chunksRef.current = [];

            mediaRecorder.ondataavailable = (event) => {
                if (event.data.size > 0) {
                    chunksRef.current.push(event.data);
                }
            };

            mediaRecorder.onstop = () => {
                if (chunksRef.current.length === 0) {
                    console.warn("No data recorded");
                    alert("لم يتم تسجيل أي بيانات. يرجى المحاولة مرة أخرى.");
                    return;
                }

                const blob = new Blob(chunksRef.current, { type: mimeType });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                document.body.appendChild(a);
                a.style.display = 'none';
                a.href = url;
                // Add timestamp to filename
                const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
                a.download = `avatar-recording-${timestamp}.webm`;
                a.click();

                // Cleanup
                setTimeout(() => {
                    document.body.removeChild(a);
                    window.URL.revokeObjectURL(url);
                }, 100);
            };

            mediaRecorder.start();
            setIsRecording(true);
        } catch (err) {
            console.error("Error starting recording:", err);
            alert("حدث خطأ أثناء بدء التسجيل. يرجى التحقق من المتصفح.");
        }
    };

    const stopRecording = () => {
        if (mediaRecorderRef.current && isRecording) {
            mediaRecorderRef.current.stop();
            setIsRecording(false);
        }
    };

    return (
        <div className="recorder-controls">
            {!isRecording ? (
                <button
                    onClick={startRecording}
                    className="record-btn start"
                    title="Start Recording"
                >
                    <div className="record-icon"></div>
                    <span>REC</span>
                </button>
            ) : (
                <button
                    onClick={stopRecording}
                    className="record-btn stop"
                    title="Stop Recording"
                >
                    <div className="stop-icon"></div>
                    <span>STOP</span>
                </button>
            )}
        </div>
    );
};
