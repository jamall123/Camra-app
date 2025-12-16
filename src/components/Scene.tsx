import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, useGLTF, useTexture } from '@react-three/drei';
import React, { Suspense, useRef, useEffect, useMemo } from 'react';
import * as THREE from 'three';
import type { Background } from '../types';

// Bone name mapping: Kalidokit -> Mixamo/RPM
const BONE_MAP: Record<string, string> = {
    // Body (Spine & Hips)
    Hips: 'Hips',
    Spine: 'Spine',
    Spine1: 'Spine1',
    Spine2: 'Spine2',

    // Arms (Left)
    LeftArm: 'LeftArm',
    LeftForeArm: 'LeftForeArm',
    LeftHand: 'LeftHand',
    LeftShoulder: 'LeftShoulder', // Clavicle

    // Arms (Right)
    RightArm: 'RightArm',
    RightForeArm: 'RightForeArm',
    RightHand: 'RightHand',
    RightShoulder: 'RightShoulder', // Clavicle

    // Left Hand Fingers
    LeftWrist: 'LeftHand',
    LeftThumbProximal: 'LeftHandThumb1',
    LeftThumbIntermediate: 'LeftHandThumb2',
    LeftThumbDistal: 'LeftHandThumb3',
    LeftIndexProximal: 'LeftHandIndex1',
    LeftIndexIntermediate: 'LeftHandIndex2',
    LeftIndexDistal: 'LeftHandIndex3',
    LeftMiddleProximal: 'LeftHandMiddle1',
    LeftMiddleIntermediate: 'LeftHandMiddle2',
    LeftMiddleDistal: 'LeftHandMiddle3',
    LeftRingProximal: 'LeftHandRing1',
    LeftRingIntermediate: 'LeftHandRing2',
    LeftRingDistal: 'LeftHandRing3',
    LeftLittleProximal: 'LeftHandPinky1',
    LeftLittleIntermediate: 'LeftHandPinky2',
    LeftLittleDistal: 'LeftHandPinky3',
    RightWrist: 'RightHand',
    RightThumbProximal: 'RightHandThumb1',
    RightThumbIntermediate: 'RightHandThumb2',
    RightThumbDistal: 'RightHandThumb3',
    RightIndexProximal: 'RightHandIndex1',
    RightIndexIntermediate: 'RightHandIndex2',
    RightIndexDistal: 'RightHandIndex3',
    RightMiddleProximal: 'RightHandMiddle1',
    RightMiddleIntermediate: 'RightHandMiddle2',
    RightMiddleDistal: 'RightHandMiddle3',
    RightRingProximal: 'RightHandRing1',
    RightRingIntermediate: 'RightHandRing2',
    RightRingDistal: 'RightHandRing3',
    RightLittleProximal: 'RightHandPinky1',
    RightLittleIntermediate: 'RightHandPinky2',
    RightLittleDistal: 'RightHandPinky3',
};

// Smoothing values - higher = faster/more responsive, lower = smoother
const LERP = {
    head: 0.25,     // رأس أكثر استجابة
    neck: 0.2,      // رقبة
    spine: 0.15,    // عمود فقري
    arms: 0.2,      // ذراعين
    hands: 0.3,     // يدين أكثر استجابة
    face: 0.5,      // وجه سريع الاستجابة
};

// Simple loading box
const LoadingBox = () => (
    <mesh>
        <boxGeometry args={[0.8, 0.8, 0.8]} />
        <meshStandardMaterial color="#646cff" wireframe />
    </mesh>
);

// Helper to check if value is valid number
const isValid = (v: any): v is number => typeof v === 'number' && isFinite(v);

// Clamp to range
const clamp = (v: number, min: number, max: number) => Math.max(min, Math.min(max, v));

// Avatar Model Component
const AvatarModel: React.FC<{ url: string; riggedPose: any }> = ({ url, riggedPose }) => {
    const { scene } = useGLTF(url);
    const bonesRef = useRef<Record<string, THREE.Bone>>({});
    const headMeshRef = useRef<THREE.SkinnedMesh | null>(null);

    // Build bone map once when scene loads
    useEffect(() => {
        const bones: Record<string, THREE.Bone> = {};
        const normalize = (name: string) => name.toLowerCase().replace(/mixamorig|:|_+/g, '');

        scene.traverse((obj) => {
            if (obj instanceof THREE.Bone) {
                bones[obj.name] = obj;
                bones[normalize(obj.name)] = obj;
            }
            if ((obj as THREE.SkinnedMesh).isSkinnedMesh) {
                const mesh = obj as THREE.SkinnedMesh;
                if (mesh.morphTargetDictionary &&
                    (mesh.name.includes('Head') || mesh.name.includes('Face') || mesh.name === 'Wolf3D_Head')) {
                    headMeshRef.current = mesh;
                }
            }
        });

        bonesRef.current = bones;
    }, [scene]);

    // Find bone by name with fallbacks
    const getBone = (name: string): THREE.Bone | null => {
        const bones = bonesRef.current;
        const mapped = BONE_MAP[name] || name;

        // Try explicit map first
        if (bones[name]) return bones[name];
        if (bones[mapped]) return bones[mapped];

        // Try variations
        return bones[`mixamorig${name}`] ||
            bones[`mixamorig:${name}`] ||
            bones[`mixamorig${mapped}`] ||
            bones[`mixamorig:${mapped}`] ||
            bones[name.toLowerCase()] ||
            bones[mapped.toLowerCase()] ||
            null;
    };

    // Safe rotation apply
    const rotateBone = (name: string, rot: any, lerp: number) => {
        if (!rot) return;
        const bone = getBone(name);
        if (!bone) return;

        if (isValid(rot.x)) bone.rotation.x = THREE.MathUtils.lerp(bone.rotation.x, clamp(rot.x, -Math.PI, Math.PI), lerp);
        if (isValid(rot.y)) bone.rotation.y = THREE.MathUtils.lerp(bone.rotation.y, clamp(rot.y, -Math.PI, Math.PI), lerp);
        if (isValid(rot.z)) bone.rotation.z = THREE.MathUtils.lerp(bone.rotation.z, clamp(rot.z, -Math.PI, Math.PI), lerp);
    };

    // Safe morph apply
    const setMorph = (name: string, value: any, lerp: number) => {
        const mesh = headMeshRef.current;
        if (!mesh?.morphTargetInfluences || !mesh?.morphTargetDictionary) return;
        if (!isValid(value)) return;

        const idx = mesh.morphTargetDictionary[name];
        if (idx !== undefined) {
            mesh.morphTargetInfluences[idx] = THREE.MathUtils.lerp(
                mesh.morphTargetInfluences[idx],
                clamp(value, 0, 1),
                lerp
            );
        }
    };

    useFrame(() => {
        if (!riggedPose) return;

        const { face, pose, rightHand, leftHand } = riggedPose;

        // Head & Neck
        if (face?.head) {
            rotateBone('Head', { x: -face.head.x, y: face.head.y, z: face.head.z }, LERP.head);
            rotateBone('Neck', { x: -face.head.x * 0.5, y: face.head.y * 0.5, z: face.head.z * 0.5 }, LERP.neck);
        }

        // Face morphs
        if (face) {
            if (face.eye) {
                setMorph('eyeBlinkLeft', 1 - (face.eye.r || 1), LERP.face);
                setMorph('eyeBlinkRight', 1 - (face.eye.l || 1), LERP.face);
            }
            if (face.mouth?.shape) {
                setMorph('mouthOpen', face.mouth.shape.A, LERP.face);
                setMorph('jawOpen', face.mouth.shape.A, LERP.face);
                setMorph('mouthSmile', (face.mouth.shape.E || 0) * 0.5, LERP.face);
            }
        }

        // Body
        if (pose) {
            rotateBone('Spine', pose.Spine, LERP.spine);
            rotateBone('Spine1', pose.Spine1, LERP.spine);
            rotateBone('Spine2', pose.Spine2, LERP.spine);
            rotateBone('Hips', pose.Hips, LERP.spine);
            rotateBone('RightArm', pose.RightArm, LERP.arms);
            rotateBone('RightForeArm', pose.RightForeArm, LERP.arms);
            rotateBone('LeftArm', pose.LeftArm, LERP.arms);
            rotateBone('LeftForeArm', pose.LeftForeArm, LERP.arms);
        }

        // Hands
        if (rightHand) {
            Object.entries(rightHand).forEach(([key, rot]) => rotateBone(key, rot, LERP.hands));
        }
        if (leftHand) {
            Object.entries(leftHand).forEach(([key, rot]) => rotateBone(key, rot, LERP.hands));
        }
    });

    return <primitive object={scene} position={[0, -2.1, 0]} scale={1.35} />;
};

// Background Plane for custom images
const BackgroundPlane: React.FC<{ imageUrl: string }> = ({ imageUrl }) => {
    const texture = useTexture(imageUrl);
    return (
        <mesh position={[0, 0, -5]} scale={[16, 9, 1]}>
            <planeGeometry />
            <meshBasicMaterial map={texture} />
        </mesh>
    );
};

// Scene Component
interface SceneProps {
    background: Background;
    riggedPose: any;
    modelUrl: string;
}

export const Scene: React.FC<SceneProps> = ({ background, riggedPose, modelUrl }) => {
    const bgColor = useMemo(() => background.color, [background.color]);

    return (
        <Canvas
            camera={{ position: [0, 0.2, 1.8], fov: 45 }}
            gl={{ preserveDrawingBuffer: true, antialias: true }}
        >
            {/* Background */}
            {background.imageUrl ? (
                <Suspense fallback={<color attach="background" args={[bgColor]} />}>
                    <BackgroundPlane imageUrl={background.imageUrl} />
                </Suspense>
            ) : (
                <color attach="background" args={[bgColor]} />
            )}

            {/* Lighting */}
            <ambientLight intensity={1.0} />
            <directionalLight position={[5, 5, 5]} intensity={0.5} />
            <directionalLight position={[-5, 3, 2]} intensity={0.3} />

            {/* Avatar */}
            {modelUrl ? (
                <Suspense fallback={<LoadingBox />}>
                    <AvatarModel url={modelUrl} riggedPose={riggedPose} />
                </Suspense>
            ) : (
                <LoadingBox />
            )}

            <OrbitControls
                enableZoom={true}
                enablePan={false}
                target={[0, 0, 0]}
                maxDistance={5}
                minDistance={1}
            />
        </Canvas>
    );
};
