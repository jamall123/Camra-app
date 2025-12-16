import React, { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { useTexture } from '@react-three/drei';
import * as THREE from 'three';

interface ImageAvatarProps {
    headRotation: [number, number, number]; // [pitch, yaw, roll]
    mouthOpen: number; // 0 to 1
}

// Custom Shader Material to handle the "Talking" deformation
const FaceShaderMaterial = {
    uniforms: {
        uTexture: { value: null },
        uMouthOpen: { value: 0 },
        uTime: { value: 0 }
    },
    vertexShader: `
    varying vec2 vUv;
    uniform float uMouthOpen;

    void main() {
      vUv = uv;
      vec3 pos = position;

      // Simple Jaw Drop Logic
      // Assuming mouth is roughly at UV y=0.35 to 0.45 range in a portrait
      // We shift pixels below the "upper lip" line downwards
      
      float lipLine = 0.42;
      float chinLine = 0.0;
      
      // Calculate influence: 1.0 at chin, fading to 0.0 at upper lip
      float jawInfluence = smoothstep(lipLine + 0.05, lipLine - 0.05, vUv.y);
      
      // Shift down based on openness and influence
      // We only move y, and maybe slightly z to keep shape?
      pos.y -= uMouthOpen * 0.15 * jawInfluence;
      
      gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
    }
  `,
    fragmentShader: `
    uniform sampler2D uTexture;
    varying vec2 vUv;

    void main() {
      vec4 color = texture2D(uTexture, vUv);
      if (color.a < 0.1) discard; // Transparency support
      gl_FragColor = color;
    }
  `
};

export const ImageAvatar: React.FC<ImageAvatarProps> = ({ headRotation, mouthOpen }) => {
    const texture = useTexture('/avatar.png');
    const meshRef = useRef<THREE.Mesh>(null!);

    // Create the shader material once
    const shaderMaterial = useMemo(() => {
        const mat = new THREE.ShaderMaterial({
            uniforms: THREE.UniformsUtils.clone(FaceShaderMaterial.uniforms),
            vertexShader: FaceShaderMaterial.vertexShader,
            fragmentShader: FaceShaderMaterial.fragmentShader,
            transparent: true,
            side: THREE.DoubleSide
        });
        mat.uniforms.uTexture.value = texture;
        return mat;
    }, [texture]);

    useFrame((state) => {
        if (meshRef.current) {
            // Smoothly interpolate rotation
            // We dampen the values a bit for 2D because 1:1 rotation looks weird on a flat plane
            const targetPitch = headRotation[0] * 0.8;
            const targetYaw = headRotation[1] * 0.8;
            const targetRoll = headRotation[2] * 0.8;

            meshRef.current.rotation.x = THREE.MathUtils.lerp(meshRef.current.rotation.x, targetPitch, 0.15);
            meshRef.current.rotation.y = THREE.MathUtils.lerp(meshRef.current.rotation.y, targetYaw, 0.15);
            meshRef.current.rotation.z = THREE.MathUtils.lerp(meshRef.current.rotation.z, targetRoll, 0.15);

            // subtle float
            // meshRef.current.position.y = -0.5 + Math.sin(state.clock.elapsedTime) * 0.02;

            // Update mouth uniform
            // Smooth lerp for mouth too
            const currentMouth = shaderMaterial.uniforms.uMouthOpen.value;
            shaderMaterial.uniforms.uMouthOpen.value = THREE.MathUtils.lerp(currentMouth, mouthOpen, 0.2);
        }
    });

    return (
        <mesh ref={meshRef} position={[0, -0.2, 0]} scale={[4, 4, 1]}>
            {/* High segment plane for smooth vertex deformation */}
            <planeGeometry args={[1, 1, 32, 32]} />
            <primitive object={shaderMaterial} attach="material" />
        </mesh>
    );
};
