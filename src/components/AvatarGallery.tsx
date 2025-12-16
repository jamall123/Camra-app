import React, { useState } from 'react';
import { AVATARS, AVATAR_CREATION_GUIDE, type Avatar } from '../avatars';

interface AvatarGalleryProps {
    onSelectAvatar: (url: string) => void;
    currentAvatarUrl: string;
}

export const AvatarGallery: React.FC<AvatarGalleryProps> = ({ onSelectAvatar, currentAvatarUrl }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [selectedCategory, setSelectedCategory] = useState<'all' | 'male' | 'female' | 'character'>('all');
    const [showGuide, setShowGuide] = useState(false);

    const filteredAvatars = selectedCategory === 'all'
        ? AVATARS
        : AVATARS.filter(avatar => avatar.category === selectedCategory);

    const handleSelectAvatar = (avatar: Avatar) => {
        onSelectAvatar(avatar.url);
        setIsOpen(false);
    };

    if (!isOpen) {
        return (
            <button
                className="avatar-gallery-toggle"
                onClick={() => setIsOpen(true)}
                title="Avatar Gallery / معرض الأفاتارات"
            >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                    <circle cx="12" cy="7" r="4"></circle>
                </svg>
                <span>معرض الأفاتارات</span>
            </button>
        );
    }

    return (
        <div className="avatar-gallery-overlay">
            <div className="avatar-gallery-modal">
                <div className="avatar-gallery-header">
                    <h2>🎭 Avatar Gallery / معرض الأفاتارات</h2>
                    <button
                        className="close-button"
                        onClick={() => setIsOpen(false)}
                        aria-label="Close"
                    >
                        ✕
                    </button>
                </div>

                <div className="avatar-gallery-tabs">
                    <button
                        className={selectedCategory === 'all' ? 'active' : ''}
                        onClick={() => setSelectedCategory('all')}
                    >
                        الكل / All
                    </button>
                    <button
                        className={selectedCategory === 'male' ? 'active' : ''}
                        onClick={() => setSelectedCategory('male')}
                    >
                        رجال / Male
                    </button>
                    <button
                        className={selectedCategory === 'female' ? 'active' : ''}
                        onClick={() => setSelectedCategory('female')}
                    >
                        نساء / Female
                    </button>
                    <button
                        className={selectedCategory === 'character' ? 'active' : ''}
                        onClick={() => setSelectedCategory('character')}
                    >
                        شخصيات / Characters
                    </button>
                </div>

                <div className="avatar-gallery-grid">
                    {filteredAvatars.map((avatar) => (
                        <div
                            key={avatar.id}
                            className={`avatar-card ${currentAvatarUrl === avatar.url ? 'selected' : ''}`}
                            onClick={() => handleSelectAvatar(avatar)}
                            title={avatar.description}
                        >
                            <div className="avatar-card-preview">
                                {avatar.thumbnail ? (
                                    <img
                                        src={avatar.thumbnail}
                                        alt={avatar.name}
                                        onError={(e) => {
                                            (e.target as HTMLImageElement).style.display = 'none';
                                            (e.target as HTMLImageElement).nextElementSibling?.classList.remove('hidden');
                                        }}
                                    />
                                ) : null}
                                <div className={`avatar-placeholder ${avatar.thumbnail ? 'hidden' : ''}`}>
                                    <svg width="48" height="48" viewBox="0 0 24 24" fill="currentColor">
                                        <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
                                    </svg>
                                </div>
                            </div>
                            <div className="avatar-card-info">
                                <h3>{avatar.nameAr}</h3>
                                <p>{avatar.name}</p>
                            </div>
                            {currentAvatarUrl === avatar.url && (
                                <div className="avatar-card-badge">✓</div>
                            )}
                        </div>
                    ))}
                </div>

                <div className="avatar-gallery-footer">
                    <button
                        className="guide-button"
                        onClick={() => setShowGuide(!showGuide)}
                    >
                        {showGuide ? '🔼' : '🔽'} {AVATAR_CREATION_GUIDE.ar.title}
                    </button>

                    {showGuide && (
                        <div className="avatar-guide">
                            <ol>
                                {AVATAR_CREATION_GUIDE.ar.steps.map((step, index) => (
                                    <li key={index}>{step}</li>
                                ))}
                            </ol>
                            <div className="avatar-sources">
                                <h4>مصادر مفيدة:</h4>
                                <ul>
                                    <li>
                                        <a href="https://readyplayer.me/" target="_blank" rel="noopener noreferrer">
                                            Ready Player Me - إنشاء أفاتار من صورة
                                        </a>
                                    </li>
                                    <li>
                                        <a href="https://www.mixamo.com/" target="_blank" rel="noopener noreferrer">
                                            Mixamo - شخصيات ثلاثية الأبعاد مجانية
                                        </a>
                                    </li>
                                    <li>
                                        <a href="https://sketchfab.com/search?features=downloadable&type=models" target="_blank" rel="noopener noreferrer">
                                            Sketchfab - نماذج ثلاثية الأبعاد قابلة للتحميل
                                        </a>
                                    </li>
                                </ul>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
