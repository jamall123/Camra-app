// Avatar Library - مكتبة الأفاتارات
export interface Avatar {
    id: string;
    name: string;
    nameAr: string;
    url: string;
    thumbnail?: string;
    category: 'male' | 'female' | 'character' | 'custom';
    description?: string;
}

// Jamal's Custom Avatars - أفاتارات جمال المخصصة
export const AVATARS: Avatar[] = [
    {
        id: 'avatar-1',
        name: 'Classic Casual',
        nameAr: 'كلاسيك كاجوال',
        url: 'https://models.readyplayer.me/693fd189fe6f676b663eef96.glb',
        thumbnail: 'https://models.readyplayer.me/693fd189fe6f676b663eef96.png',
        category: 'male',
        description: 'Custom avatar 1'
    },
    {
        id: 'avatar-2',
        name: 'Modern Stylish',
        nameAr: 'مودرن ستايلش',
        url: 'https://models.readyplayer.me/693fd3db100ae875d5ac970e.glb',
        thumbnail: 'https://models.readyplayer.me/693fd3db100ae875d5ac970e.png',
        category: 'male',
        description: 'Custom avatar 2'
    },
    {
        id: 'avatar-3',
        name: 'Business Formal',
        nameAr: 'رسمي',
        url: 'https://models.readyplayer.me/693fd49d14ff70500021ada0.glb',
        thumbnail: 'https://models.readyplayer.me/693fd49d14ff70500021ada0.png',
        category: 'male',
        description: 'Custom avatar 3'
    },
    {
        id: 'avatar-4',
        name: 'Cool Vibe',
        nameAr: 'كول فايب',
        url: 'https://models.readyplayer.me/693fd50de37c2412efc8f6aa.glb',
        thumbnail: 'https://models.readyplayer.me/693fd50de37c2412efc8f6aa.png',
        category: 'male',
        description: 'Custom avatar 4'
    },
    {
        id: 'avatar-5',
        name: 'Urban Street',
        nameAr: 'حضري',
        url: 'https://models.readyplayer.me/693fd56bd7e4ffac81fa4e48.glb',
        thumbnail: 'https://models.readyplayer.me/693fd56bd7e4ffac81fa4e48.png',
        category: 'male',
        description: 'Custom avatar 5'
    },
    {
        id: 'avatar-6',
        name: 'Sporty',
        nameAr: 'رياضي',
        url: 'https://models.readyplayer.me/693fd5d0fe6f676b663f0870.glb',
        thumbnail: 'https://models.readyplayer.me/693fd5d0fe6f676b663f0870.png',
        category: 'male',
        description: 'Custom avatar 6'
    }
];

// Popular free 3D model sources for avatars
export const AVATAR_SOURCES = {
    readyPlayerMe: {
        name: 'Ready Player Me',
        url: 'https://readyplayer.me/',
        description: 'Create custom 3D avatars from a photo',
        descriptionAr: 'إنشاء أفاتار ثلاثي الأبعاد من صورة'
    },
    mixamo: {
        name: 'Mixamo',
        url: 'https://www.mixamo.com/',
        description: 'Free 3D characters and animations',
        descriptionAr: 'شخصيات ثلاثية الأبعاد ورسوم متحركة مجانية'
    },
    sketchfab: {
        name: 'Sketchfab',
        url: 'https://sketchfab.com/search?features=downloadable&type=models',
        description: 'Download free 3D models',
        descriptionAr: 'تحميل نماذج ثلاثية الأبعاد مجانية'
    }
};

// Instructions for creating custom avatars
export const AVATAR_CREATION_GUIDE = {
    en: {
        title: 'How to Create Your Own Avatar',
        steps: [
            'Visit Ready Player Me (https://readyplayer.me/)',
            'Take a selfie or upload a photo',
            'Customize your avatar appearance',
            'Download the GLB file',
            'Copy the URL and paste it in the input field above'
        ]
    },
    ar: {
        title: 'كيفية إنشاء أفاتار خاص بك',
        steps: [
            'قم بزيارة Ready Player Me (https://readyplayer.me/)',
            'التقط صورة شخصية أو قم بتحميل صورة',
            'قم بتخصيص مظهر الأفاتار الخاص بك',
            'قم بتنزيل ملف GLB',
            'انسخ الرابط والصقه في حقل الإدخال أعلاه'
        ]
    }
};
