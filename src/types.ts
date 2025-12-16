// Types for the Avatar Camera Application

// Rigged Pose from Kalidokit
export interface RiggedPose {
    face: FaceRig | null;
    pose: PoseRig | null;
    rightHand: HandRig | null;
    leftHand: HandRig | null;
}

export interface FaceRig {
    head: { x: number; y: number; z: number };
    eye: { l: number; r: number };
    mouth: {
        x: number;
        y: number;
        shape: {
            A: number;
            E: number;
            I: number;
            O: number;
            U: number;
        };
    };
    brow: number;
    pupil: { x: number; y: number };
}

export interface PoseRig {
    Hips?: Rotation;
    Spine?: Rotation;
    Spine1?: Rotation;
    Spine2?: Rotation;
    LeftArm?: Rotation;
    LeftForeArm?: Rotation;
    RightArm?: Rotation;
    RightForeArm?: Rotation;
}

export interface HandRig {
    [key: string]: Rotation;
}

export interface Rotation {
    x: number;
    y: number;
    z: number;
}

// Tracking Status
export interface TrackingStatus {
    face: boolean;
    pose: boolean;
    hands: boolean;
}

// Background Configuration
export interface Background {
    id: string;
    name: string;
    nameAr: string;
    color: string;
    imageUrl?: string;
    isCustom?: boolean;
}

// Avatar Configuration
export interface Avatar {
    id: string;
    name: string;
    nameAr: string;
    url: string;
    thumbnail?: string;
    category: 'male' | 'female' | 'character' | 'custom';
    description?: string;
}

// Recording State
export interface RecordingState {
    isRecording: boolean;
    isPaused: boolean;
    duration: number;
    error: string | null;
}

// Application Mode
export type AppMode = 'camera' | 'video';

// Smoothing Configuration for better animation
export interface SmoothingConfig {
    head: number;
    neck: number;
    spine: number;
    arms: number;
    hands: number;
    face: number;
}

export const DEFAULT_SMOOTHING: SmoothingConfig = {
    head: 0.12,
    neck: 0.1,
    spine: 0.08,
    arms: 0.1,
    hands: 0.2,
    face: 0.4,
};
