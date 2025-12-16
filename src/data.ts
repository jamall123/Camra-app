import type { Background } from './types';

// Default backgrounds with colors and optional images
export const BACKGROUNDS: Background[] = [
  {
    id: 'office',
    name: 'Office',
    nameAr: 'مكتب',
    color: '#3d405b',
  },
  {
    id: 'lounge',
    name: 'Lounge',
    nameAr: 'صالة',
    color: '#e07a5f',
  },
  {
    id: 'bedroom',
    name: 'Bedroom',
    nameAr: 'غرفة نوم',
    color: '#81b29a',
  },
  {
    id: 'streaming',
    name: 'Streaming',
    nameAr: 'بث مباشر',
    color: '#f2cc8f',
  },
  {
    id: 'park',
    name: 'Park',
    nameAr: 'حديقة',
    color: '#60993e',
  },
  {
    id: 'gradient-purple',
    name: 'Purple Gradient',
    nameAr: 'تدرج بنفسجي',
    color: '#667eea',
  },
  {
    id: 'gradient-dark',
    name: 'Dark Mode',
    nameAr: 'الوضع المظلم',
    color: '#1a1a2e',
  },
  {
    id: 'gradient-sunset',
    name: 'Sunset',
    nameAr: 'غروب',
    color: '#ff7e5f',
  },
];

// Get custom background from uploaded image
export const createCustomBackground = (imageUrl: string): Background => ({
  id: `custom-${Date.now()}`,
  name: 'Custom Background',
  nameAr: 'خلفية مخصصة',
  color: '#000000',
  imageUrl,
  isCustom: true,
});
