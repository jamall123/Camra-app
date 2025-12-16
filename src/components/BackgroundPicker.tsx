import React, { useRef, useCallback, useState } from 'react';
import type { Background } from '../types';
import { BACKGROUNDS, createCustomBackground } from '../data';

interface BackgroundPickerProps {
    currentBackground: Background;
    onBackgroundChange: (background: Background) => void;
}

export const BackgroundPicker: React.FC<BackgroundPickerProps> = ({
    currentBackground,
    onBackgroundChange,
}) => {
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [customBackgrounds, setCustomBackgrounds] = useState<Background[]>([]);
    const [isExpanded, setIsExpanded] = useState(false);

    const handleFileUpload = useCallback(
        (event: React.ChangeEvent<HTMLInputElement>) => {
            const file = event.target.files?.[0];
            if (!file) return;

            // Validate file type
            if (!file.type.startsWith('image/')) {
                alert('يرجى اختيار ملف صورة');
                return;
            }

            // Validate file size (max 10MB)
            if (file.size > 10 * 1024 * 1024) {
                alert('حجم الصورة كبير جداً (الحد الأقصى 10 ميجابايت)');
                return;
            }

            const imageUrl = URL.createObjectURL(file);
            const newBackground = createCustomBackground(imageUrl);

            setCustomBackgrounds((prev) => [...prev, newBackground]);
            onBackgroundChange(newBackground);

            // Reset input
            if (fileInputRef.current) {
                fileInputRef.current.value = '';
            }
        },
        [onBackgroundChange]
    );

    const handleUploadClick = () => {
        fileInputRef.current?.click();
    };

    const allBackgrounds = [...BACKGROUNDS, ...customBackgrounds];

    return (
        <div className="background-picker">
            {/* Toggle Button */}
            <button
                className="picker-toggle"
                onClick={() => setIsExpanded(!isExpanded)}
                title={isExpanded ? 'إغلاق' : 'تغيير الخلفية'}
            >
                <span className="picker-icon">🎨</span>
                {isExpanded && <span className="picker-label">الخلفيات</span>}
            </button>

            {/* Expanded Panel */}
            {isExpanded && (
                <div className="picker-panel">
                    <div className="picker-header">
                        <h3>🖼️ اختر خلفية</h3>
                        <button className="close-btn" onClick={() => setIsExpanded(false)}>
                            ✕
                        </button>
                    </div>

                    <div className="backgrounds-grid">
                        {/* Upload Custom Button */}
                        <button
                            className="background-item upload-btn"
                            onClick={handleUploadClick}
                            title="رفع صورة"
                        >
                            <div className="upload-icon">📤</div>
                            <span>رفع صورة</span>
                        </button>

                        {/* Background Options */}
                        {allBackgrounds.map((bg) => (
                            <button
                                key={bg.id}
                                className={`background-item ${currentBackground.id === bg.id ? 'selected' : ''}`}
                                onClick={() => onBackgroundChange(bg)}
                                style={{
                                    backgroundColor: bg.color,
                                    backgroundImage: bg.imageUrl ? `url(${bg.imageUrl})` : undefined,
                                }}
                                title={bg.nameAr || bg.name}
                            >
                                {currentBackground.id === bg.id && (
                                    <div className="selected-badge">✓</div>
                                )}
                                {bg.isCustom && <div className="custom-badge">مخصص</div>}
                            </button>
                        ))}
                    </div>

                    {/* Hidden File Input */}
                    <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        onChange={handleFileUpload}
                        className="hidden-input"
                    />

                    {/* Info Text */}
                    <p className="picker-info">
                        قم برفع صورة مخصصة أو اختر من الخلفيات المتاحة
                    </p>
                </div>
            )}
        </div>
    );
};
