import React from 'react';

export const WelcomeMessage: React.FC = () => {
    return (
        <div className="welcome-message">
            <div className="welcome-content">
                <h1>🎭 مرحباً بك في تطبيق الأفاتار</h1>
                <h2>Welcome to Avatar App</h2>

                <div className="welcome-instructions">
                    <p className="ar">لبدء الاستخدام:</p>
                    <ol className="ar">
                        <li>اضغط على زر "معرض الأفاتارات" في الأعلى</li>
                        <li>اختر أفاتار من المعرض</li>
                        <li>أو أدخل رابط GLB الخاص بك</li>
                        <li>اسمح بالوصول للكاميرا</li>
                        <li>حرك رأسك واستمتع! 🎉</li>
                    </ol>

                    <p className="en">To get started:</p>
                    <ol className="en">
                        <li>Click "Avatar Gallery" button at the top</li>
                        <li>Select an avatar from the gallery</li>
                        <li>Or enter your own GLB URL</li>
                        <li>Allow camera access</li>
                        <li>Move your head and enjoy! 🎉</li>
                    </ol>
                </div>

                <div className="welcome-tip">
                    <p>💡 <strong>نصيحة:</strong> يمكنك إنشاء أفاتار مخصص من <a href="https://readyplayer.me/" target="_blank" rel="noopener noreferrer">Ready Player Me</a></p>
                    <p>💡 <strong>Tip:</strong> Create your custom avatar at <a href="https://readyplayer.me/" target="_blank" rel="noopener noreferrer">Ready Player Me</a></p>
                </div>
            </div>
        </div>
    );
};
