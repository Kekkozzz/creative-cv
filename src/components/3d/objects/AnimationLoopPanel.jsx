'use client'

import { useEffect, useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { Text } from '@react-three/drei'
import * as THREE from 'three'
import { useFade } from '../FadeInGroup'

const panelLabels = [
    { text: 'GSAP MOTION LAB', y: 0.22, color: '#22d3ee', size: 0.032 },
    { text: 'Timeline preview: stagger + easing', y: 0.18, color: '#a1a1aa', size: 0.018 },
    { text: 'opacity', y: 0.1, color: '#f8fafc', size: 0.017 },
    { text: 'translateY', y: 0.04, color: '#f8fafc', size: 0.017 },
    { text: 'scale', y: -0.02, color: '#f8fafc', size: 0.017 },
]

const START_SCALE = 0.82
const END_SCALE = 1.38
const START_Z = 0
const END_Z = 0.92

// Track bars — right side of labels
const TRACK_WIDTH = 0.38
const TRACK_HEIGHT = 0.018
const TRACK_X_START = -0.08
const TRACK_YS = [0.1, 0.04, -0.02]
const TRACK_COLORS = ['#22d3ee', '#8b5cf6', '#10b981']

// Ease curve — bottom section, centered
const CURVE_POINTS = [
    new THREE.Vector3(-0.2, -0.12, 0),
    new THREE.Vector3(-0.08, -0.12, 0),
    new THREE.Vector3(0.08, -0.19, 0),
    new THREE.Vector3(0.2, -0.08, 0),
]

export default function AnimationLoopPanel({ onClick, ...rest }) {
    const borderGeo = useMemo(() => new THREE.EdgesGeometry(new THREE.PlaneGeometry(0.96, 0.58)), [])
    const curveGeo = useMemo(() => new THREE.BufferGeometry().setFromPoints(CURVE_POINTS), [])

    const groupRef = useRef()
    const panelRef = useRef()
    const borderRef = useRef()
    const textRefs = useRef([])
    const trackMatRefs = useRef([])
    const fillRefs = useRef([])
    const fillMatRefs = useRef([])
    const curveRef = useRef()
    const curveDotRef = useRef()
    const chipRef = useRef()
    const chipMatRef = useRef()
    const chipTextRef = useRef()
    const fadeRefOrValue = useFade()

    useEffect(() => () => {
        document.body.style.cursor = 'auto'
    }, [])

    const triggerClick = (e) => {
        e.stopPropagation()
        onClick?.()
    }

    const handlePointerOver = () => { document.body.style.cursor = 'pointer' }
    const handlePointerOut = () => { document.body.style.cursor = 'auto' }

    useFrame(({ clock }) => {
        const fade = typeof fadeRefOrValue === 'number' ? fadeRefOrValue : fadeRefOrValue.current
        const t = clock.getElapsedTime()

        // Scale + z position follow fade
        if (groupRef.current) {
            const s = THREE.MathUtils.lerp(START_SCALE, END_SCALE, fade)
            groupRef.current.scale.setScalar(s)
            groupRef.current.position.z = THREE.MathUtils.lerp(START_Z, END_Z, fade)
        }

        // Panel bg
        if (panelRef.current) {
            panelRef.current.opacity = 0.88 * fade
            panelRef.current.visible = fade > 0.01
        }

        // Border
        if (borderRef.current) {
            borderRef.current.opacity = 0.5 * fade
            borderRef.current.visible = fade > 0.01
        }

        // Text labels
        textRefs.current.forEach((ref) => {
            if (!ref) return
            ref.fillOpacity = fade
            ref.visible = fade > 0.01
        })

        // Track backgrounds
        trackMatRefs.current.forEach((mat) => {
            if (!mat) return
            mat.opacity = 0.15 * fade
            mat.visible = fade > 0.01
        })

        // Animated fill bars
        fillRefs.current.forEach((ref, i) => {
            if (!ref) return
            const wave = (Math.sin(t * 2 + i * 1.25) + 1) / 2
            const width = THREE.MathUtils.lerp(0.06, TRACK_WIDTH, wave)
            ref.scale.x = width / TRACK_WIDTH
            ref.position.x = TRACK_X_START + width / 2
            ref.visible = fade > 0.01
        })

        fillMatRefs.current.forEach((mat, i) => {
            if (!mat) return
            const wave = (Math.sin(t * 2 + i * 1.25) + 1) / 2
            mat.opacity = (0.35 + wave * 0.5) * fade
        })

        // Ease curve
        if (curveRef.current) {
            curveRef.current.material.opacity = 0.6 * fade
            curveRef.current.visible = fade > 0.01
        }

        // Ease dot — follows the curve
        if (curveDotRef.current) {
            const p = (Math.sin(t * 1.4) + 1) / 2
            const x = THREE.MathUtils.lerp(-0.2, 0.2, p)
            const y = -0.12 + p * p * 0.08 - (1 - p) * (1 - p) * 0.04
            curveDotRef.current.position.x = x
            curveDotRef.current.position.y = y
            curveDotRef.current.material.opacity = (0.6 + p * 0.3) * fade
            curveDotRef.current.visible = fade > 0.01
        }

        // FPS chip
        if (chipRef.current && chipMatRef.current) {
            chipMatRef.current.opacity = (0.55 + Math.sin(t * 2.2) * 0.1) * fade
            chipRef.current.visible = fade > 0.01
        }
        if (chipTextRef.current) {
            chipTextRef.current.fillOpacity = fade
            chipTextRef.current.visible = fade > 0.01
        }
    })

    return (
        <group {...rest}>
            <group ref={groupRef} scale={START_SCALE}>
                {/* Hit area for clicks */}
                <mesh
                    position={[0, 0, 0.003]}
                    onClick={triggerClick}
                    onPointerDown={triggerClick}
                    onPointerOver={handlePointerOver}
                    onPointerOut={handlePointerOut}
                >
                    <planeGeometry args={[0.99, 0.61]} />
                    <meshBasicMaterial transparent opacity={0} depthWrite={false} side={THREE.DoubleSide} />
                </mesh>

                {/* Background panel */}
                <mesh position={[0, 0, -0.005]}>
                    <planeGeometry args={[0.96, 0.58]} />
                    <meshBasicMaterial
                        ref={panelRef}
                        color="#090913"
                        transparent
                        opacity={0}
                        depthWrite={false}
                    />
                </mesh>

                {/* Border */}
                <lineSegments>
                    <primitive object={borderGeo} attach="geometry" />
                    <lineBasicMaterial ref={borderRef} color="#22d3ee" transparent opacity={0} />
                </lineSegments>

                {/* Labels */}
                {panelLabels.map((line, i) => (
                    <Text
                        key={i}
                        ref={(el) => { textRefs.current[i] = el }}
                        position={[-0.44, line.y, 0.002]}
                        fontSize={line.size}
                        color={line.color}
                        anchorX="left"
                        anchorY="middle"
                        maxWidth={0.86}
                        fillOpacity={0}
                        visible={false}
                    >
                        {line.text}
                    </Text>
                ))}

                {/* FPS chip — top right corner */}
                <mesh ref={chipRef} visible={false} position={[0.33, 0.22, 0.002]}>
                    <planeGeometry args={[0.16, 0.05]} />
                    <meshBasicMaterial
                        ref={chipMatRef}
                        color="#052e2b"
                        transparent
                        opacity={0}
                        depthWrite={false}
                    />
                </mesh>
                <Text
                    ref={chipTextRef}
                    position={[0.33, 0.22, 0.003]}
                    fontSize={0.02}
                    color="#10b981"
                    anchorX="center"
                    anchorY="middle"
                    fillOpacity={0}
                    visible={false}
                >
                    60 FPS
                </Text>

                {/* Track backgrounds */}
                {TRACK_YS.map((y, i) => (
                    <mesh key={`track-${i}`} position={[TRACK_X_START + TRACK_WIDTH / 2, y, 0.001]}>
                        <planeGeometry args={[TRACK_WIDTH, TRACK_HEIGHT]} />
                        <meshBasicMaterial
                            ref={(el) => { trackMatRefs.current[i] = el }}
                            color="#1f2937"
                            transparent
                            opacity={0}
                            depthWrite={false}
                        />
                    </mesh>
                ))}

                {/* Animated fill bars */}
                {TRACK_YS.map((y, i) => (
                    <mesh
                        key={`fill-${i}`}
                        ref={(el) => { fillRefs.current[i] = el }}
                        visible={false}
                        position={[TRACK_X_START, y, 0.0014]}
                    >
                        <planeGeometry args={[TRACK_WIDTH, TRACK_HEIGHT]} />
                        <meshBasicMaterial
                            ref={(el) => { fillMatRefs.current[i] = el }}
                            color={TRACK_COLORS[i]}
                            transparent
                            opacity={0}
                            depthWrite={false}
                        />
                    </mesh>
                ))}

                {/* Ease curve label */}
                <Text
                    ref={(el) => { textRefs.current[panelLabels.length] = el }}
                    position={[-0.44, -0.13, 0.002]}
                    fontSize={0.016}
                    color="#a1a1aa"
                    anchorX="left"
                    anchorY="middle"
                    fillOpacity={0}
                    visible={false}
                >
                    ease curve
                </Text>

                {/* Ease curve line */}
                <line ref={curveRef} visible={false} geometry={curveGeo} position={[0, 0, 0.05]}>
                    <lineBasicMaterial color="#22d3ee" transparent opacity={0} depthWrite={false} />
                </line>

                {/* Click hint */}
                <Text
                    ref={(el) => { textRefs.current[panelLabels.length + 1] = el }}
                    position={[0, -0.25, 0.002]}
                    fontSize={0.014}
                    color="#f59e0b"
                    anchorX="center"
                    anchorY="middle"
                    fillOpacity={0}
                    visible={false}
                >
                    click panel for full breakdown
                </Text>
            </group>
        </group>
    )
}
