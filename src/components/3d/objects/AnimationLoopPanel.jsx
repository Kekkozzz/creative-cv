'use client'

import { useEffect, useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { Text } from '@react-three/drei'
import * as THREE from 'three'
import { useFade } from '../FadeInGroup'

const panelLabels = [
    { text: 'GSAP MOTION LAB', y: 0.195, color: '#22d3ee', size: 0.032 },
    { text: 'Timeline preview: stagger + easing', y: 0.152, color: '#a1a1aa', size: 0.02 },
    { text: 'opacity', y: 0.058, color: '#f8fafc', size: 0.019 },
    { text: 'translateY', y: -0.002, color: '#f8fafc', size: 0.019 },
    { text: 'scale', y: -0.062, color: '#f8fafc', size: 0.019 },
    { text: 'ease curve', y: -0.185, color: '#a1a1aa', size: 0.017 },
]

const START_SCALE = 0.82
const END_SCALE = 1.38
const START_Z = 0
const END_Z = 0.92
const TRACK_WIDTH = 0.46
const TRACK_HEIGHT = 0.018
const TRACK_X = -0.02
const TRACK_YS = [0.058, -0.002, -0.062]
const TRACK_COLORS = ['#22d3ee', '#8b5cf6', '#10b981']
const CURVE_OFFSET_X = 0.11
const CURVE_OFFSET_Y = -0.06
const CURVE_MIN_X = -0.14
const CURVE_MAX_X = 0.14
const CURVE_BASE_Y = -0.11
const CURVE_RISE = 0.06

export default function AnimationLoopPanel({ onClick, ...rest }) {
    const borderGeo = useMemo(() => new THREE.EdgesGeometry(new THREE.PlaneGeometry(0.96, 0.58)), [])
    const curveGeo = useMemo(() => {
        const points = [
            new THREE.Vector3(CURVE_MIN_X, CURVE_BASE_Y, 0),
            new THREE.Vector3(-0.07, -0.106, 0),
            new THREE.Vector3(0.02, -0.085, 0),
            new THREE.Vector3(CURVE_MAX_X, CURVE_BASE_Y + CURVE_RISE, 0),
        ]
        return new THREE.BufferGeometry().setFromPoints(points)
    }, [])

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

    const handlePointerOver = () => {
        document.body.style.cursor = 'pointer'
    }

    const handlePointerOut = () => {
        document.body.style.cursor = 'auto'
    }

    useFrame(({ clock }) => {
        const fade = typeof fadeRefOrValue === 'number' ? fadeRefOrValue : fadeRefOrValue.current
        const t = clock.getElapsedTime()

        if (groupRef.current) {
            const s = THREE.MathUtils.lerp(START_SCALE, END_SCALE, fade)
            groupRef.current.scale.setScalar(s)
            groupRef.current.position.z = THREE.MathUtils.lerp(START_Z, END_Z, fade)
        }

        if (panelRef.current) {
            panelRef.current.opacity = 0.86 * fade
            panelRef.current.visible = fade > 0.01
        }

        if (borderRef.current) {
            borderRef.current.opacity = 0.52 * fade
            borderRef.current.visible = fade > 0.01
        }

        textRefs.current.forEach((ref) => {
            if (!ref) return
            ref.fillOpacity = fade
            ref.visible = fade > 0.01
        })

        trackMatRefs.current.forEach((mat) => {
            if (!mat) return
            mat.opacity = 0.16 * fade
        })

        fillRefs.current.forEach((ref, i) => {
            if (!ref) return
            const wave = (Math.sin(t * 2 + i * 1.25) + 1) / 2
            const width = THREE.MathUtils.lerp(0.08, TRACK_WIDTH, wave)
            ref.scale.x = width / TRACK_WIDTH
            ref.position.x = TRACK_X + width / 2
            ref.visible = fade > 0.01
        })

        fillMatRefs.current.forEach((mat, i) => {
            if (!mat) return
            const wave = (Math.sin(t * 2 + i * 1.25) + 1) / 2
            mat.opacity = (0.3 + wave * 0.5) * fade
        })

        if (curveRef.current) {
            curveRef.current.material.opacity = 0.7 * fade
            curveRef.current.visible = fade > 0.01
        }

        if (curveDotRef.current) {
            const p = (Math.sin(t * 1.4) + 1) / 2
            curveDotRef.current.position.x = CURVE_OFFSET_X + THREE.MathUtils.lerp(CURVE_MIN_X, CURVE_MAX_X, p)
            curveDotRef.current.position.y = CURVE_OFFSET_Y + CURVE_BASE_Y + p * p * CURVE_RISE
            curveDotRef.current.material.opacity = (0.5 + p * 0.4) * fade
            curveDotRef.current.visible = fade > 0.01
        }

        if (chipRef.current && chipMatRef.current) {
            chipRef.current.position.y = 0.1 + Math.sin(t * 1.2) * 0.01
            chipMatRef.current.opacity = (0.55 + Math.sin(t * 2.2) * 0.12) * fade
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
                {/* Bigger transparent hit-area: captures clicks even on tiny moving elements */}
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

                <lineSegments>
                    <primitive object={borderGeo} attach="geometry" />
                    <lineBasicMaterial
                        ref={borderRef}
                        color="#22d3ee"
                        transparent
                        opacity={0}
                    />
                </lineSegments>

                {panelLabels.map((line, i) => (
                    <Text
                        key={i}
                        ref={(el) => { textRefs.current[i] = el }}
                        position={[-0.44, line.y, 0.0022]}
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

                {TRACK_YS.map((y, i) => (
                    <mesh key={`track-${i}`} position={[0.11, y, 0.001]}>
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

                {TRACK_YS.map((y, i) => (
                    <mesh
                        key={`fill-${i}`}
                        ref={(el) => { fillRefs.current[i] = el }}
                        visible={false}
                        position={[TRACK_X, y, 0.0014]}
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

                <line ref={curveRef} visible={false} geometry={curveGeo} position={[CURVE_OFFSET_X, CURVE_OFFSET_Y, 0.0017]}>
                    <lineBasicMaterial color="#22d3ee" transparent opacity={0} depthWrite={false} />
                </line>

                <mesh ref={curveDotRef} visible={false} position={[0, 0, 0.002]}>
                    <sphereGeometry args={[0.008, 8, 8]} />
                    <meshBasicMaterial color="#f8fafc" transparent opacity={0} depthWrite={false} />
                </mesh>

                <mesh ref={chipRef} visible={false} position={[0.23, 0.1, 0.0018]}>
                    <planeGeometry args={[0.22, 0.07]} />
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
                    position={[0.23, 0.1, 0.0022]}
                    fontSize={0.023}
                    color="#10b981"
                    anchorX="center"
                    anchorY="middle"
                    fillOpacity={0}
                    visible={false}
                >
                    60 FPS
                </Text>

                <Text
                    ref={(el) => { textRefs.current[panelLabels.length] = el }}
                    position={[-0.18, -0.23, 0.0022]}
                    fontSize={0.016}
                    color="#f59e0b"
                    anchorX="left"
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
