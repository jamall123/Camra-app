import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, useGLTF, Html } from '@react-three/drei';
import React, { Suspense, useRef, useEffect } from 'react';
import * as THREE from 'three';

// Fallback box if model fails or is loading
const BoxAvatar = ({ headRotation }: { headRotation?: [number, number, number] }) => (
    <mesh rotation={[headRotation?.[0] || 0, headRotation?.[1] || 0, headRotation?.[2] || 0]}>
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial color="#FF69B4" />
    </mesh>
);

// Helper map for Kalidokit -> Mixamo/RPM bone names
const KalidokitToMixamo: Record<string, string> = {
    // Left Hand
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

    // Right Hand
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

const AvatarModel = ({ url, riggedPose }: { url: string, riggedPose: any }) => {
    const { scene } = useGLTF(url);
    const nodesRef = useRef<any>(null);

    // Map graph nodes once
    useEffect(() => {
        const nodes: any = {};
        const normalize = (name: string) => name.toLowerCase().replace(/mixamorig|:|_+/g, '');

        // Log all bones once for debugging
        const allBoneNames: string[] = [];

        scene.traverse((obj) => {
            if (obj instanceof THREE.Bone) {
                nodes[obj.name] = obj;
                nodes[normalize(obj.name)] = obj;
                allBoneNames.push(obj.name);
            }
            if ((obj as THREE.Mesh).isMesh) {
                nodes[obj.name] = obj;
            }
        });

        console.log("Avatar Bones Detected:", allBoneNames);
        nodesRef.current = nodes;
    }, [scene]);

    useFrame(() => {
        if (!riggedPose || !nodesRef.current) return;

        const nodes = nodesRef.current;
        const { face, pose, rightHand, leftHand } = riggedPose;

        // Helper: Rotate bone if found with smoother lerp
        const rotateBone = (name: string, rot: { x: number, y: number, z: number }, lerp = 0.1) => {
            // Try exact name, mapped name, or normalized variants
            const mappedName = KalidokitToMixamo[name] || name;

            const bone = nodes[name] ||
                nodes[mappedName] ||
                nodes['mixamorig' + name] ||
                nodes['mixamorig' + mappedName] ||
                nodes[name.toLowerCase()] ||
                nodes[mappedName.toLowerCase()] ||
                nodes[name.toLowerCase().replace(/mixamorig|:|_+/g, '')];

            if (bone) {
                bone.rotation.x = THREE.MathUtils.lerp(bone.rotation.x, rot.x, lerp);
                bone.rotation.y = THREE.MathUtils.lerp(bone.rotation.y, rot.y, lerp);
                bone.rotation.z = THREE.MathUtils.lerp(bone.rotation.z, rot.z, lerp);
            }
        };

        // --- 1. HEAD & FACE (Very Smooth) ---
        if (face && face.head) {
            rotateBone('Head', { x: -face.head.x, y: face.head.y, z: face.head.z }, 0.15);
            rotateBone('Neck', { x: -face.head.x * 0.5, y: face.head.y * 0.5, z: face.head.z * 0.5 }, 0.1);
        }

        // MorphTargets (Blinking, Smile, Mouth) - Faster response for face
        const headMesh = nodes.Wolf3D_Head || nodes.Head_2 || Object.values(nodes).find((n: any) => n.morphTargetDictionary && (n.name.includes('Head') || n.name.includes('Face')));

        if (headMesh && headMesh.morphTargetInfluences && headMesh.morphTargetDictionary && face) {
            // Blink
            if (face.eye) {
                const lIdx = headMesh.morphTargetDictionary['eyeBlinkLeft'];
                const rIdx = headMesh.morphTargetDictionary['eyeBlinkRight'];
                if (lIdx !== undefined && face.eye.r !== undefined) headMesh.morphTargetInfluences[lIdx] = THREE.MathUtils.lerp(headMesh.morphTargetInfluences[lIdx], 1 - face.eye.r, 0.5);
                if (rIdx !== undefined && face.eye.l !== undefined) headMesh.morphTargetInfluences[rIdx] = THREE.MathUtils.lerp(headMesh.morphTargetInfluences[rIdx], 1 - face.eye.l, 0.5);
            }

            // Mouth Shape
            if (face.mouth && face.mouth.shape) {
                const mouthOpenIndex = headMesh.morphTargetDictionary['mouthOpen'] ?? headMesh.morphTargetDictionary['jawOpen'];
                if (mouthOpenIndex !== undefined) headMesh.morphTargetInfluences[mouthOpenIndex] = THREE.MathUtils.lerp(headMesh.morphTargetInfluences[mouthOpenIndex], face.mouth.shape.A, 0.5);

                const mouthSmileIndex = headMesh.morphTargetDictionary['mouthSmile'];
                if (mouthSmileIndex !== undefined) headMesh.morphTargetInfluences[mouthSmileIndex] = THREE.MathUtils.lerp(headMesh.morphTargetInfluences[mouthSmileIndex], face.mouth.shape.E * 0.5, 0.5);
            }
        }

        // --- 2. BODY POSE (Spine/Chest) ---
        if (pose) {
            if (pose.Spine) rotateBone('Spine', pose.Spine, 0.1);
            if (pose.Spine1) rotateBone('Spine1', pose.Spine1, 0.1);
            if (pose.Spine2) rotateBone('Spine2', pose.Spine2, 0.1);
            if (pose.Hips) rotateBone('Hips', pose.Hips, 0.1);
        }

        // --- 3. ARMS & HANDS (Smoother) ---
        // Right Side
        if (pose && pose.RightArm) rotateBone('RightArm', pose.RightArm, 0.1);
        if (pose && pose.RightForeArm) rotateBone('RightForeArm', pose.RightForeArm, 0.1);

        // Right Hand & Fingers
        if (rightHand) {
            Object.keys(rightHand).forEach(key => {
                rotateBone(key, rightHand[key], 0.25);
            });
        }

        // Left Side
        if (pose && pose.LeftArm) rotateBone('LeftArm', pose.LeftArm, 0.1);
        if (pose && pose.LeftForeArm) rotateBone('LeftForeArm', pose.LeftForeArm, 0.1);

        // Left Hand & Fingers
        if (leftHand) {
            Object.keys(leftHand).forEach(key => {
                rotateBone(key, leftHand[key], 0.25);
            });
        }

    });

    const [debugInfo, setDebugInfo] = React.useState<{ bones: string[] }>({ bones: [] });

    // One-time bone logging for on-screen debug
    useEffect(() => {
        if (!scene) return;
        const allBones: string[] = [];
        scene.traverse((obj) => {
            if (obj instanceof THREE.Bone) {
                allBones.push(obj.name);
            }
        });
        setDebugInfo({ bones: allBones });
    }, [scene]);

    // Render Debug Overlay
    return (
        <group>
            <primitive object={scene} position={[0, -2.1, 0]} scale={1.35} />
            <Html position={[-1, 1.5, 0]}>
                <div style={{
                    background: 'rgba(0,0,0,0.8)',
                    color: 'white',
                    padding: '10px',
                    borderRadius: '5px',
                    fontSize: '10px',
                    width: '200px',
                    fontFamily: 'monospace',
                    pointerEvents: 'none',
                    textAlign: 'left' // Ensure text is left-aligned for readability
                }}>
                    <h3 style={{ margin: '0 0 5px 0', borderBottom: '1px solid #555' }}>Diagnostic Panel</h3>
                    <div><strong>Face:</strong> {riggedPose?.face ? '✅ Found' : '❌ Searching...'}</div>
                    <div><strong>Pose:</strong> {riggedPose?.pose ? '✅ Found' : '❌ Searching...'}</div>
                    <div><strong>R.Hand:</strong> {riggedPose?.rightHand ? '✅ Found' : '❌ Searching...'}</div>
                    <div><strong>L.Hand:</strong> {riggedPose?.leftHand ? '✅ Found' : '❌ Searching...'}</div>
                    <div style={{ marginTop: '5px', borderTop: '1px solid #555', paddingTop: '5px' }}>
                        <strong>Detected Bones ({debugInfo.bones.length}):</strong>
                        <div style={{ maxHeight: '100px', overflowY: 'auto' }}>
                            {debugInfo.bones.length > 0 ? debugInfo.bones.slice(0, 15).map(b => (
                                <div key={b}>- {b}</div>
                            )) : 'No bones found!'}
                            {debugInfo.bones.length > 15 && <div>...and {debugInfo.bones.length - 15} more</div>}
                        </div>
                    </div>
                </div>
            </Html>
        </group>
    );
};

interface SceneProps {
    background: string;
    riggedPose: any;
    modelUrl: string;
}

export const Scene: React.FC<SceneProps> = ({ background, riggedPose, modelUrl }) => {
    return (
        // Adjusted Camera FOV for a closer "Portrait" shot
        <Canvas camera={{ position: [0, 0.2, 1.8], fov: 45 }}>
            <color attach="background" args={[background]} />
            <ambientLight intensity={1.0} />
            <directionalLight position={[5, 5, 5]} intensity={0.5} />
            {modelUrl ? (
                <Suspense fallback={<BoxAvatar />}>
                    <AvatarModel url={modelUrl} riggedPose={riggedPose} />
                </Suspense>
            ) : (
                <BoxAvatar />
            )}
            <OrbitControls enableZoom={false} target={[0, 0, 0]} />
        </Canvas>
    );
};
