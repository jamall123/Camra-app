# 🎭 Camera Avatar App - تطبيق الأفاتار بالكاميرا

<div align="center">

![Version](https://img.shields.io/badge/version-1.0.0-blue.svg)
![React](https://img.shields.io/badge/React-19.2.0-61dafb.svg)
![Three.js](https://img.shields.io/badge/Three.js-0.182.0-black.svg)
![MediaPipe](https://img.shields.io/badge/MediaPipe-Face%20Mesh-orange.svg)

**تطبيق ويب تفاعلي للتحكم في أفاتار ثلاثي الأبعاد باستخدام حركات وجهك**

**Interactive web app to control a 3D avatar using your facial movements**

[العربية](#-نظرة-عامة) | [English](#-overview)

</div>

---

## 🌟 نظرة عامة

تطبيق متقدم يستخدم تقنية تتبع الوجه من MediaPipe للتحكم في أفاتار ثلاثي الأبعاد في الوقت الفعلي. يمكنك اختيار من مكتبة أفاتارات جاهزة أو تحميل أفاتار مخصص خاص بك.

### المميزات الرئيسية

- ✨ **تتبع وجه متقدم**: تتبع دقيق لحركات الرأس والفم
- 🎭 **مكتبة أفاتارات**: مجموعة متنوعة من الأفاتارات الجاهزة
- 🎨 **خلفيات متعددة**: 5 خلفيات ملونة قابلة للتبديل
- 📱 **تصميم متجاوب**: يعمل على جميع الأجهزة
- 🚀 **أداء عالي**: تحسينات للأداء السلس
- 🔧 **قابل للتخصيص**: إمكانية تحميل أفاتارات GLB مخصصة

---

## 🚀 البدء السريع

### المتطلبات

- Node.js 18+ و npm
- متصفح حديث يدعم WebGL و WebRTC
- كاميرا ويب

### التثبيت

```bash
# استنساخ المشروع
git clone <repository-url>
cd Camra-app

# تثبيت المكتبات
npm install

# تشغيل التطبيق
npm run dev
```

التطبيق سيعمل على: `http://localhost:5173`

### البناء للإنتاج

```bash
npm run build
npm run preview
```

---

## 🛠️ التقنيات المستخدمة

### Frontend Framework
- **React 19.2.0** - مكتبة واجهة المستخدم
- **TypeScript** - للكتابة الآمنة
- **Vite** - أداة البناء السريعة

### 3D Graphics
- **Three.js** - محرك الرسومات ثلاثية الأبعاد
- **@react-three/fiber** - React renderer لـ Three.js
- **@react-three/drei** - مساعدات Three.js

### Face Tracking
- **MediaPipe Face Mesh** - تتبع معالم الوجه
- **@mediapipe/camera_utils** - أدوات الكاميرا

### Styling
- **Tailwind CSS 4** - إطار عمل CSS
- **Custom CSS** - أنماط مخصصة للمكونات

---

## 📁 هيكل المشروع

```
Camra-app/
├── src/
│   ├── components/
│   │   ├── Scene.tsx           # مشهد Three.js الرئيسي
│   │   ├── FaceTracker.tsx     # مكون تتبع الوجه
│   │   ├── AvatarGallery.tsx   # معرض الأفاتارات
│   │   └── ImageAvatar.tsx     # أفاتار من صورة (اختياري)
│   ├── avatars.ts              # بيانات مكتبة الأفاتارات
│   ├── data.ts                 # بيانات الخلفيات
│   ├── App.tsx                 # المكون الرئيسي
│   ├── index.css               # الأنماط العامة
│   └── main.tsx                # نقطة الدخول
├── public/                     # الملفات الثابتة
├── AVATAR_GUIDE.md            # دليل الاستخدام الشامل
└── README.md                   # هذا الملف
```

---

## 🎯 كيفية الاستخدام

### 1. السماح بالوصول للكاميرا
عند فتح التطبيق، اسمح للمتصفح بالوصول إلى الكاميرا.

### 2. اختيار الأفاتار
- اضغط على زر "معرض الأفاتارات" في أعلى الشاشة
- اختر أفاتار من المعرض
- أو أدخل رابط GLB مخصص في حقل الإدخال

### 3. التحكم في الأفاتار
- حرك رأسك: الأفاتار سيتبع حركتك
- افتح فمك: الأفاتار سيفتح فمه
- غير الخلفية: استخدم الأزرار الملونة في الأسفل

### 4. إنشاء أفاتار مخصص
راجع [AVATAR_GUIDE.md](./AVATAR_GUIDE.md) للحصول على دليل شامل لإنشاء أفاتارات مخصصة.

---

## 🎨 إنشاء أفاتار مخصص - ملخص سريع

### Ready Player Me (الأسهل)
1. زر https://readyplayer.me/
2. التقط صورة أو ارفع صورة
3. خصص المظهر
4. احصل على رابط GLB
5. الصقه في التطبيق

### Mixamo (شخصيات جاهزة)
1. زر https://www.mixamo.com/
2. اختر شخصية
3. حمل بصيغة GLB
4. استخدم الرابط المباشر

### Sketchfab (نماذج مجانية)
1. ابحث في https://sketchfab.com/
2. اختر نموذج قابل للتحميل
3. حمل بصيغة GLB
4. استخدم الرابط المباشر

---

## 🔧 التخصيص والتطوير

### إضافة أفاتارات جديدة للمكتبة

عدّل ملف `src/avatars.ts`:

```typescript
export const AVATARS: Avatar[] = [
  {
    id: 'my-avatar',
    name: 'My Custom Avatar',
    nameAr: 'أفاتاري المخصص',
    url: 'https://example.com/avatar.glb',
    category: 'male', // أو 'female' أو 'character'
    description: 'وصف الأفاتار'
  },
  // ... أفاتارات أخرى
];
```

### إضافة خلفيات جديدة

عدّل ملف `src/data.ts`:

```typescript
export const BACKGROUNDS = [
  {
    id: 'my-bg',
    name: 'My Background',
    url: '/bg/my-background.jpg',
    color: '#hexcolor'
  },
  // ... خلفيات أخرى
];
```

### تخصيص تتبع الوجه

عدّل إعدادات MediaPipe في `src/components/FaceTracker.tsx`:

```typescript
faceMesh.setOptions({
  maxNumFaces: 1,
  refineLandmarks: true,
  minDetectionConfidence: 0.7, // زد للدقة الأعلى
  minTrackingConfidence: 0.7,
});
```

---

## 📊 الأداء والتحسينات

### التحسينات المطبقة

- ✅ **React.memo** للمكونات
- ✅ **useCallback** للدوال
- ✅ **Cleanup functions** لتنظيف الموارد
- ✅ **Error boundaries** لمعالجة الأخطاء
- ✅ **Loading states** لتجربة مستخدم أفضل
- ✅ **Smooth interpolation** للحركة السلسة

### نصائح للأداء الأفضل

1. استخدم نماذج GLB أصغر من 10MB
2. أغلق التطبيقات الأخرى
3. استخدم متصفح Chrome أو Edge
4. تأكد من إضاءة جيدة للكاميرا

---

## 🐛 حل المشاكل الشائعة

### الكاميرا لا تعمل
- تحقق من أذونات المتصفح
- تأكد من عدم استخدام الكاميرا في تطبيق آخر
- أعد تحميل الصفحة

### الأفاتار لا يتحرك
- تحسين الإضاءة
- تأكد من ظهور وجهك بالكامل
- جرب أفاتار آخر

### الأفاتار لا يُحمّل
- تحقق من صحة رابط GLB
- تأكد من أن الرابط مباشر
- جرب أفاتار من المعرض

راجع [AVATAR_GUIDE.md](./AVATAR_GUIDE.md) للمزيد من الحلول.

---

## 🌐 التوافق

### المتصفحات
- ✅ Chrome 90+
- ✅ Edge 90+
- ✅ Firefox 88+
- ✅ Safari 14+

### الأجهزة
- ✅ Windows, Mac, Linux
- ✅ أجهزة لوحية
- ⚠️ هواتف (أداء محدود)

---

## 📚 موارد مفيدة

- [Three.js Documentation](https://threejs.org/docs/)
- [MediaPipe Face Mesh](https://google.github.io/mediapipe/solutions/face_mesh)
- [Ready Player Me](https://readyplayer.me/)
- [glTF Format](https://www.khronos.org/gltf/)

---

## 🤝 المساهمة

المساهمات مرحب بها! يرجى:

1. Fork المشروع
2. إنشاء branch للميزة الجديدة
3. Commit التغييرات
4. Push إلى Branch
5. فتح Pull Request

---

## 📄 الترخيص

هذا المشروع مفتوح المصدر ومتاح للاستخدام الشخصي والتجاري.

---

## 👨‍💻 المطور

**Jamal Ahmed**
- Email: ja1827082@gmail.com
- Phone: +249990596880

---

<div align="center">

**صُنع بـ ❤️ باستخدام React و Three.js**

**Made with ❤️ using React & Three.js**

</div>

---

## 🌟 Overview

An advanced web application that uses MediaPipe's face tracking technology to control a 3D avatar in real-time. Choose from a library of ready-made avatars or upload your own custom avatar.

### Key Features

- ✨ **Advanced Face Tracking**: Precise tracking of head and mouth movements
- 🎭 **Avatar Library**: Diverse collection of ready-made avatars
- 🎨 **Multiple Backgrounds**: 5 switchable colored backgrounds
- 📱 **Responsive Design**: Works on all devices
- 🚀 **High Performance**: Optimizations for smooth performance
- 🔧 **Customizable**: Ability to upload custom GLB avatars

---

## 🚀 Quick Start

### Requirements

- Node.js 18+ and npm
- Modern browser supporting WebGL and WebRTC
- Webcam

### Installation

```bash
# Clone the project
git clone <repository-url>
cd Camra-app

# Install dependencies
npm install

# Run the app
npm run dev
```

The app will run on: `http://localhost:5173`

### Build for Production

```bash
npm run build
npm run preview
```

For detailed usage instructions, see [AVATAR_GUIDE.md](./AVATAR_GUIDE.md).

---

**Enjoy! 🎉**
