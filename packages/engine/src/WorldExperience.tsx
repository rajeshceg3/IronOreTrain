'use client'
import { createOreSoundscape } from './sound/oreSoundscape'
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'

export const chapters = [
  {
    name: 'Arrival',
    title: 'A line across the sand',
    text: 'The mine and the Atlantic port are connected by a railway over 700 km long. Begin beside the ore wagons, then turn the view in any direction.',
    sky: '#d6b28b',
    sand: '#bd8d59',
    sun: '#ffe0b0',
    light: 2.1,
    camera: [23, 13, 34],
    target: [0, 2, -13],
  },
  {
    name: 'Orientation',
    title: 'Mine to ocean',
    text: 'SNIM links the iron-ore mining area of Zouérat with the port of Nouadhibou. This landscape is an illustration, not a survey of the route.',
    sky: '#bbd1d8',
    sand: '#d6ae79',
    sun: '#fff2ce',
    light: 2.5,
    camera: [37, 25, 45],
    target: [0, 1, -13],
  },
  {
    name: 'Boarding',
    title: 'Inside the hopper',
    text: 'Look into an open ore wagon: raised sides, braced steel and a mound of dark mineral. Explore virtually. This is not an invitation or guide to board a working train.',
    sky: '#d7b18b',
    sand: '#c59964',
    sun: '#ffe0ad',
    light: 2.2,
    camera: [8, 8, 13],
    target: [0, 2, 10],
  },
  {
    name: 'Exploration',
    title: 'Follow the iron ribbon',
    text: 'The train carries ore from the inland mining sites to the coast. Drag around the wagons, zoom toward the wheelsets, or pull back to read the railway across the desert.',
    sky: '#b8ced4',
    sand: '#cda56e',
    sun: '#fff0c9',
    light: 2.6,
    camera: [22, 10, 23],
    target: [0, 2, -8],
  },
  {
    name: 'Discovery',
    title: 'Built to carry weight',
    text: 'Open hoppers, paired bogies, steel side ribs and couplers make the cargo train legible. The locomotive and wagons here are stylised, not an exact model of SNIM rolling stock.',
    sky: '#c5987b',
    sand: '#ad7c4e',
    sun: '#ffd1a0',
    light: 1.9,
    camera: [10, 5, -27],
    target: [0, 2, -36],
  },
  {
    name: 'Night',
    title: 'Under a desert sky',
    text: 'The light changes; the railway keeps its line. Pause the motion and explore the stars, warm locomotive lamps and the long silhouette of the ore train.',
    sky: '#142539',
    sand: '#526276',
    sun: '#bed5ed',
    light: 1.1,
    camera: [21, 12, 30],
    target: [0, 2, -12],
  },
  {
    name: 'Reflection',
    title: 'The distance between places',
    text: 'A mine, a railway, a port. One industrial chain drawn through a wide landscape. Stay as long as you like, or return to the first view.',
    sky: '#a27e78',
    sand: '#b48b72',
    sun: '#ffd7b5',
    light: 1.7,
    camera: [30, 18, 48],
    target: [0, 1, -12],
  },
]
type V3 = [number, number, number]
function Box({
  p,
  s,
  color,
  rotation = 0,
}: {
  p: V3
  s: V3
  color: string
  rotation?: number
}) {
  return (
    <mesh position={p} rotation={[0, rotation, 0]}>
      <boxGeometry args={s} />
      <meshStandardMaterial color={color} roughness={0.85} />
    </mesh>
  )
}
function Wagon({ z, index }: { z: number; index: number }) {
  const rust = ['#92583e', '#a86947', '#754936'][index % 3]
  return (
    <group position={[0, 0, z]}>
      <Box p={[0, 1.4, 0]} s={[3.7, 0.35, 11.8]} color="#302b2b" />
      <Box p={[-1.85, 2.7, 0]} s={[0.16, 2.3, 11.8]} color={rust} />
      <Box p={[1.85, 2.7, 0]} s={[0.16, 2.3, 11.8]} color={rust} />
      {[-5.85, 5.85].map((q) => (
        <Box key={q} p={[0, 2.7, q]} s={[3.7, 2.3, 0.18]} color={rust} />
      ))}
      {[-1.96, 1.96].flatMap((x) =>
        [-5, -3, -1, 1, 3, 5].map((q) => (
          <Box
            key={x + ':' + q}
            p={[x, 2.7, q]}
            s={[0.16, 2.45, 0.16]}
            color="#4f3831"
          />
        )),
      )}
      <mesh position={[0, 2.6, 0]} scale={[1.65, 1, 5.5]}>
        <sphereGeometry args={[1, 10, 5, 0, Math.PI * 2, 0, Math.PI / 2]} />
        <meshStandardMaterial color="#48352f" flatShading roughness={1} />
      </mesh>
      {Array.from({ length: 12 }, (_, i) => (
        <mesh
          key={i}
          position={[
            Math.sin(i * 6) * 1.2,
            2.7 + Math.sin(i * 2) * 0.25,
            (i - 5.5) * 0.84,
          ]}
          rotation={[i, i * 0.4, 0]}
        >
          <dodecahedronGeometry args={[0.5, 0]} />
          <meshStandardMaterial
            color={i % 2 ? '#5d4236' : '#342c2a'}
            flatShading
          />
        </mesh>
      ))}
      {[-3.8, 3.8].map((q) => (
        <group key={q}>
          <Box p={[0, 0.85, q]} s={[2.8, 0.65, 2]} color="#282b2d" />
          {[-0.6, 0.6].flatMap((d) =>
            [-1.67, 1.67].map((x) => (
              <mesh
                key={d + ':' + x}
                position={[x, 0.65, q + d]}
                rotation={[0, 0, Math.PI / 2]}
              >
                <cylinderGeometry args={[0.65, 0.65, 0.24, 12]} />
                <meshStandardMaterial
                  color="#26292c"
                  metalness={0.4}
                  roughness={0.6}
                />
              </mesh>
            )),
          )}
        </group>
      ))}
      <Box p={[0, 1.2, 6.45]} s={[0.45, 0.4, 1.3]} color="#282727" />
    </group>
  )
}
function Locomotive() {
  return (
    <group position={[0, 0, -48]}>
      <Box p={[0, 1.4, 0]} s={[3.9, 0.6, 12]} color="#282b2b" />
      <Box p={[0, 2.6, 0]} s={[3.2, 2, 11.4]} color="#c0a36b" />
      <Box p={[0, 4, 3]} s={[3.5, 2, 3.5]} color="#d5bd86" />
      <Box p={[0, 5.1, 3]} s={[3.7, 0.2, 3.8]} color="#454842" />
      <Box p={[0, 4.1, 4.8]} s={[2.65, 0.95, 0.08]} color="#284a59" />
      {[-1.77, 1.77].map((x) => (
        <Box key={x} p={[x, 4.1, 3]} s={[0.08, 0.95, 2]} color="#284a59" />
      ))}
      <Box p={[0, 2.8, -0.5]} s={[3.28, 0.55, 10]} color="#7f4536" />
      {[-3, -2, -1, 0].flatMap((z) =>
        [-1.64, 1.64].map((x) => (
          <Box
            key={z + ':' + x}
            p={[x, 3.4, z]}
            s={[0.05, 0.7, 0.1]}
            color="#3b3c36"
          />
        )),
      )}
      {[-3.8, 3.8].flatMap((z) =>
        [-1.7, 1.7].map((x) => (
          <mesh
            key={z + ':' + x}
            position={[x, 0.7, z]}
            rotation={[0, 0, Math.PI / 2]}
          >
            <cylinderGeometry args={[0.7, 0.7, 0.3, 12]} />
            <meshStandardMaterial color="#272b2d" />
          </mesh>
        )),
      )}
      <Box p={[0, 3.9, -3.5]} s={[0.7, 0.8, 0.8]} color="#393e3c" />
      {[-0.8, 0.8].map((x) => (
        <mesh key={x} position={[x, 2.8, -5.76]}>
          <sphereGeometry args={[0.18, 8, 8]} />
          <meshStandardMaterial
            color="#fff1bd"
            emissive="#ffd17b"
            emissiveIntensity={3}
          />
        </mesh>
      ))}
      <Box p={[0, 0.85, -6]} s={[3.6, 1, 0.35]} color="#514a3f" />
    </group>
  )
}
function Ground({ sand }: { sand: string }) {
  const geo = useMemo(() => {
    const g = new THREE.PlaneGeometry(600, 600, 85, 85)
    g.rotateX(-Math.PI / 2)
    const p = g.attributes.position
    for (let i = 0; i < p.count; i++) {
      const x = p.getX(i),
        z = p.getZ(i)
      const railFlat = Math.min(1, Math.max(0, (Math.abs(x) - 6) / 14))
      p.setY(
        i,
        (Math.sin(x * 0.043 + z * 0.021) * 3 +
          Math.sin(x * 0.073 - z * 0.034) * 1.4) *
          railFlat -
          0.3,
      )
    }
    g.computeVertexNormals()
    return g
  }, [])
  return (
    <>
      <mesh geometry={geo}>
        <meshStandardMaterial color={sand} flatShading roughness={1} />
      </mesh>
      {[-1.4, 1.4].map((x) => (
        <Box key={x} p={[x, 0.12, 50]} s={[0.13, 0.2, 360]} color="#64625a" />
      ))}
      {Array.from({ length: 150 }, (_, i) => (
        <Box
          key={i}
          p={[0, -0.08, -125 + i * 2.4]}
          s={[4.6, 0.18, 0.28]}
          color="#544b40"
        />
      ))}
      {Array.from({ length: 15 }, (_, i) => (
        <mesh
          key={i}
          position={[(i % 2 ? -1 : 1) * (65 + i * 7), 4, -140 + i * 10]}
          rotation={[0, i * 0.5, 0]}
          scale={[18 + (i % 3) * 9, 10 + (i % 4) * 5, 12]}
        >
          <dodecahedronGeometry args={[1, 0]} />
          <meshStandardMaterial color="#85715b" flatShading roughness={1} />
        </mesh>
      ))}
    </>
  )
}
function Camera({ chapter, reset }: { chapter: number; reset: number }) {
  const { camera, gl, invalidate } = useThree()
  const controls = useRef<OrbitControls | null>(null)
  useEffect(() => {
    const c = new OrbitControls(camera, gl.domElement)
    controls.current = c
    c.enableDamping = false
    c.enablePan = false
    c.minDistance = 6
    c.maxDistance = 115
    c.maxPolarAngle = Math.PI * 0.49
    const onChange = () => {
      gl.domElement.dataset.camera = JSON.stringify(
        camera.position.toArray().map((x) => +x.toFixed(3)),
      )
      invalidate()
    }
    c.addEventListener('change', onChange)
    const key = (e: KeyboardEvent) => {
      if (
        ![
          'ArrowLeft',
          'ArrowRight',
          'ArrowUp',
          'ArrowDown',
          'Home',
          '+',
          '-',
        ].includes(e.key)
      )
        return
      e.preventDefault()
      if (e.key === 'Home') {
        camera.position.fromArray(chapters[chapter].camera)
        c.target.fromArray(chapters[chapter].target)
      } else {
        const v = camera.position.clone().sub(c.target)
        const s = new THREE.Spherical().setFromVector3(v)
        if (e.key === 'ArrowLeft') s.theta -= 0.15
        if (e.key === 'ArrowRight') s.theta += 0.15
        if (e.key === 'ArrowUp') s.phi = Math.max(0.1, s.phi - 0.1)
        if (e.key === 'ArrowDown') s.phi = Math.min(Math.PI * 0.49, s.phi + 0.1)
        if (e.key === '+') s.radius *= 0.9
        if (e.key === '-') s.radius *= 1.1
        camera.position
          .copy(c.target)
          .add(new THREE.Vector3().setFromSpherical(s))
      }
      c.update()
      onChange()
    }
    gl.domElement.tabIndex = 0
    gl.domElement.setAttribute(
      'aria-label',
      '360 degree train scene. Drag to rotate, pinch or scroll to zoom. Arrow keys rotate; Home resets.',
    )
    gl.domElement.addEventListener('keydown', key)
    camera.position.fromArray(chapters[chapter].camera)
    c.target.fromArray(chapters[chapter].target)
    c.update()
    onChange()
    return () => {
      c.dispose()
      gl.domElement.removeEventListener('keydown', key)
    }
  }, [camera, gl, invalidate, chapter, reset])
  return null
}
function Dust({ motion }: { motion: boolean }) {
  const ref = useRef<THREE.Points>(null)
  const { invalidate } = useThree()
  const p = useMemo(() => {
    const a = new Float32Array(400 * 3)
    for (let i = 0; i < 400; i++) {
      a[i * 3] = Math.sin(i * 17.3) * 40
      a[i * 3 + 1] = 0.5 + ((i * 13) % 50) / 10
      a[i * 3 + 2] = Math.sin(i * 7.7) * 120
    }
    return a
  }, [])
  useEffect(() => {
    if (!motion) return
    const t = setInterval(invalidate, 66)
    return () => clearInterval(t)
  }, [motion, invalidate])
  useFrame((_, delta) => {
    if (motion && ref.current)
      ref.current.position.z =
        (ref.current.position.z + Math.min(delta, 0.15) * 2) % 18
  })
  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[p, 3]} />
      </bufferGeometry>
      <pointsMaterial
        color="#f7d9a7"
        size={0.08}
        transparent
        opacity={0.35}
        depthWrite={false}
      />
    </points>
  )
}
function Scene({
  chapter,
  reset,
  motion,
}: {
  chapter: number
  reset: number
  motion: boolean
}) {
  const c = chapters[chapter]
  const stars = useMemo(() => {
    const a = new Float32Array(600 * 3)
    for (let i = 0; i < 600; i++) {
      const t = i * 2.39996,
        phi = Math.acos(0.04 + (i / 600) * 0.93)
      a[i * 3] = 180 * Math.sin(phi) * Math.cos(t)
      a[i * 3 + 1] = 180 * Math.cos(phi)
      a[i * 3 + 2] = 180 * Math.sin(phi) * Math.sin(t)
    }
    return a
  }, [])
  return (
    <>
      <color attach="background" args={[c.sky]} />
      <fog attach="fog" args={[c.sky, 110, 290]} />
      <ambientLight intensity={chapter === 5 ? 1.1 : 1.4} />
      <directionalLight
        position={[-60, 35, -60]}
        color={c.sun}
        intensity={c.light}
      />
      <hemisphereLight color={c.sky} groundColor={c.sand} intensity={0.7} />
      <Ground sand={c.sand} />
      <Locomotive />
      {Array.from({ length: 15 }, (_, i) => (
        <Wagon key={i} z={-34 + i * 13.2} index={i} />
      ))}
      <Dust motion={motion} />
      {chapter === 5 && (
        <points>
          <bufferGeometry>
            <bufferAttribute attach="attributes-position" args={[stars, 3]} />
          </bufferGeometry>
          <pointsMaterial color="#e5f0ff" size={0.65} fog={false} />
        </points>
      )}
      <mesh position={[-100, 55, -150]}>
        <sphereGeometry args={[7, 24, 24]} />
        <meshBasicMaterial color={c.sun} fog={false} />
      </mesh>
      <Camera chapter={chapter} reset={reset} />
    </>
  )
}
function useSound(enabled: boolean, chapter: number) {
  const scapeRef = useRef<ReturnType<typeof createOreSoundscape> | null>(null)
  useEffect(() => {
    if (!enabled) return
    const scape = createOreSoundscape()
    scapeRef.current = scape
    void scape.start(chapter)
    return () => {
      scape.stop()
      scapeRef.current = null
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enabled])
  useEffect(() => {
    scapeRef.current?.setChapter(chapter)
  }, [chapter])
}
const PIN_KEY = 'ironore-chrome-pin'
const RETIRE_MS = 2600
const TOP_ZONE = 96
const BOTTOM_ZONE = 150

const InkPrev = (
  <svg className="ink-icon" viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M14.8 5.2 C 11 8.2, 8.3 10.4, 6.2 12 C 8.4 13.7, 11.1 15.9, 14.9 18.8" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"/></svg>
)
const InkNext = (
  <svg className="ink-icon" viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M9.2 5.2 C 13 8.2, 15.7 10.4, 17.8 12 C 15.6 13.7, 12.9 15.9, 9.1 18.8" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"/></svg>
)
const InkMotion = ({ paused }: { paused: boolean }) => (
  <svg className="ink-icon" viewBox="0 0 24 24" aria-hidden="true" focusable="false">{paused
    ? <path d="M8 5.4 C 8 4.8, 8.6 4.5, 9 4.9 L 18.5 11.4 C 18.9 11.8, 18.9 12.4, 18.4 12.7 L 9.1 19.2 C 8.6 19.5, 8 19.2, 8 18.6 Z" fill="none" stroke="currentColor" strokeWidth="2.3" strokeLinejoin="round"/>
    : <path d="M9 5.6 L 8.9 18.4 M 15.1 5.5 L 15 18.5" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round"/>}</svg>
)
const InkSound = ({ on }: { on: boolean }) => (
  <svg className="ink-icon" viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M4 9.5 C 4 9, 4.4 8.7, 5 8.7 L 8 8.8 L 12.6 4.9 C 13 4.6, 13.5 4.8, 13.5 5.4 L 13.4 18.6 C 13.4 19.2, 12.9 19.5, 12.5 19.1 L 8 15.3 L 5 15.4 C 4.4 15.4, 4 15, 4 14.5 Z" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinejoin="round"/>{on
    ? <><path d="M16.5 9 C 17.8 10.2, 17.9 13.9, 16.6 15.1" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"/><path d="M19 6.6 C 21.4 9, 21.5 15.2, 19.1 17.5" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"/></>
    : <path d="M16.5 9.4 L 21 14.6 M 21 9.4 L 16.5 14.6" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"/>}</svg>
)
const InkTheme = ({ dark }: { dark: boolean }) => (
  <svg className="ink-icon" viewBox="0 0 24 24" aria-hidden="true" focusable="false">{dark
    ? <path d="M15.6 4.2 C 11.4 4.9, 8.3 8.3, 8.4 12.3 C 8.5 16, 11.2 18.9, 14.8 19.5 C 13.1 20.4, 11.1 20.7, 9.2 20.2 C 5.6 19.3, 3.2 16.1, 3.4 12.4 C 3.6 8.5, 6.7 5.3, 10.6 4.6 C 12.3 4.3, 14 4.1, 15.6 4.2 Z" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinejoin="round"/>
    : <><circle cx="12" cy="12" r="4.4" fill="none" stroke="currentColor" strokeWidth="2.2"/><path d="M12 2.8 L 12 5.2 M 12 18.8 L 12 21.2 M 2.8 12 L 5.2 12 M 18.8 12 L 21.2 12 M 5.5 5.5 L 7.2 7.2 M 16.8 16.8 L 18.5 18.5 M 18.5 5.5 L 16.8 7.2 M 7.2 16.8 L 5.5 18.5" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"/></>}</svg>
)
const InkNotes = ({ on }: { on: boolean }) => (
  <svg className="ink-icon" viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M5 4.2 C 5 3.5, 5.6 3, 6.3 3.1 L 17.8 3.2 C 18.5 3.2, 19 3.8, 19 4.5 L 18.9 19.6 C 18.9 20.3, 18.3 20.9, 17.6 20.8 L 6.2 20.7 C 5.5 20.7, 5 20.1, 5 19.4 Z" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinejoin="round"/>{on
    ? <path d="M8.2 8 L 15.8 8.1 M 8.1 12 L 15.9 12.1 M 8.2 16 L 13.8 16.1" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
    : <path d="M8 8.2 L 16 15.8 M 16 8.2 L 8 15.8" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>}</svg>
)
const InkPin = ({ pinned }: { pinned: boolean }) => (
  <svg className="ink-icon" viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M14.5 3.6 L 20.4 9.5 C 20.8 9.9, 20.6 10.6, 20 10.7 L 16.4 11.1 L 13.2 19.6 C 13 20.1, 12.3 20.2, 12 19.8 L 9.7 16.4 L 4.9 21.2 M 3.6 14.5 C 3.4 14, 3.7 13.5, 4.2 13.4 L 12.9 11.2 L 13.3 4 C 13.4 3.4, 14.1 3.2, 14.5 3.6 Z" fill={pinned ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2" strokeLinejoin="round"/></svg>
)
const SignalFlag = (
  <svg className="ink-icon flag" viewBox="0 0 26 40" aria-hidden="true" focusable="false"><path d="M6 1.5 L 5.8 38" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round"/><path d="M6.2 4.5 C 10.5 3, 15.5 3.4, 19.8 5.2 L 19.5 14.5 C 15.2 12.6, 10.5 12.3, 6.4 13.8 Z" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinejoin="round"/></svg>
)

export function WorldExperience() {
  const [chapter, setChapter] = useState(0),
    [reset, setReset] = useState(0),
    [motion, setMotion] = useState(false),
    [sound, setSound] = useState(false),
    [dark, setDark] = useState(false),
    [notes, setNotes] = useState(true)
  useSound(sound, chapter)
  useEffect(() => {
    const q = matchMedia('(prefers-reduced-motion: reduce)')
    setMotion(!q.matches)
    const f = () => setMotion(!q.matches)
    q.addEventListener('change', f)
    return () => q.removeEventListener('change', f)
  }, [])
  // Quiet-by-default chrome: the desert leads; controls visit when called.
  const [pinned, setPinned] = useState(() => { try { return localStorage.getItem(PIN_KEY) === '1' } catch { return false } })
  const [chrome, setChrome] = useState(true)
  const focusWithin = useRef(false), retireTimer = useRef<ReturnType<typeof setTimeout> | null>(null), rootRef = useRef<HTMLElement | null>(null)
  const retireSoon = useCallback(() => { if (retireTimer.current) clearTimeout(retireTimer.current); retireTimer.current = setTimeout(() => { if (!focusWithin.current) setChrome(false) }, RETIRE_MS) }, [])
  const wake = useCallback(() => { setChrome(true); retireSoon() }, [retireSoon])
  useEffect(() => {
    retireSoon()
    const onPointerMove = (e: PointerEvent) => { if (e.pointerType === 'touch') return; if (e.clientY < TOP_ZONE || e.clientY > window.innerHeight - BOTTOM_ZONE) wake() }
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') { focusWithin.current = false; setChrome(false) } }
    document.addEventListener('pointermove', onPointerMove); document.addEventListener('keydown', onKey)
    return () => { document.removeEventListener('pointermove', onPointerMove); document.removeEventListener('keydown', onKey); if (retireTimer.current) clearTimeout(retireTimer.current) }
  }, [wake, retireSoon])
  const togglePin = () => setPinned((p) => { const next = !p; try { next ? localStorage.setItem(PIN_KEY, '1') : localStorage.removeItem(PIN_KEY) } catch {}; if (next) setChrome(true); return next })
  const onChromeFocus = (e: React.FocusEvent) => { const t = e.target as Element; if (t.closest && t.closest('.train-header, .journey-actions, .chrome-hint')) { focusWithin.current = true; if (retireTimer.current) clearTimeout(retireTimer.current); setChrome(true) } }
  const onChromeBlur = (e: React.FocusEvent) => { if (!rootRef.current?.contains(e.relatedTarget as Node)) { focusWithin.current = false; retireSoon() } }
  const chromeOn = chrome || pinned
  const c = chapters[chapter]
  return (
    <main className={'train-app ' + (dark ? 'dark' : '')} ref={rootRef} onFocusCapture={onChromeFocus} onBlurCapture={onChromeBlur}>
      {!chromeOn && (
        <button className="chrome-hint" aria-label="Show controls" onClick={wake}>{SignalFlag}</button>
      )}
      <header className={'train-header chrome' + (chromeOn ? ' chrome-on' : '')}>
        <div>
          <h1>Iron & sand</h1>
          <p>The Mauritania ore train</p>
        </div>
      </header>
      <section className="scene-window" aria-label={c.name + ' scene'}>
        <Canvas
          frameloop="demand"
          dpr={[1, 1.5]}
          camera={{ position: c.camera as V3, fov: 52, near: 0.1, far: 400 }}
          gl={{ antialias: true, powerPreference: 'low-power' }}
        >
          <Scene chapter={chapter} reset={reset} motion={motion} />
        </Canvas>
                <nav className={'chapter-trail chrome' + (chromeOn ? ' chrome-on' : '')} role="radiogroup" aria-label="Journey chapter">
          {chapters.map((c, i) => (
          <button key={c.name} type="button" data-chapter={i} role="radio" aria-checked={chapter === i} aria-label={c.name} title={c.name} tabIndex={chapter === i ? 0 : -1} className="trail-token milepost" onClick={() => setChapter(i)} onKeyDown={(e) => { if (e.key !== 'ArrowRight' && e.key !== 'ArrowLeft') return; e.preventDefault(); const n = (chapter + (e.key === 'ArrowRight' ? 1 : chapters.length - 1)) % chapters.length; setChapter(n) }}>
            <svg className="ink-icon" viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M12 21.5 L 12 9" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round"/><rect x="6.2" y="2.8" width="11.6" height="7.4" rx="2.2" fill="none" stroke="currentColor" strokeWidth="2.2" transform="rotate(-1.5 12 6.5)"/><text x="12" y="8.6" textAnchor="middle" fontSize="6.5" fill="currentColor" stroke="none" fontFamily="inherit">{i + 1}</text></svg>
          </button>
        ))}
        </nav>

        <span className="scene-note">
          Illustrated landscape · Drag for 360°
        </span>
      </section>
      <footer className="journey-footer">
        <div className="chapter-story" aria-live="polite">
          <h2>{c.title}</h2>
          {notes && <p>{c.text}</p>}
        </div>
        <div className={'journey-actions chrome' + (chromeOn ? ' chrome-on' : '')}>
          <div className="transport">
            <button
              className="ink-toggle"
              onClick={() => setChapter((chapter + 6) % 7)}
              aria-label="Previous chapter"
              title="Previous chapter"
            >
              {InkPrev}
            </button>
            <span className="chapter-count">{chapter + 1} of 7</span>
            <button
              className="ink-toggle"
              onClick={() => setChapter((chapter + 1) % 7)}
              aria-label="Next chapter"
              title="Next chapter"
            >
              {InkNext}
            </button>
            <button className="ink-toggle" onClick={() => setReset((x) => x + 1)} aria-label="Reset view" title="Reset view"><svg className="ink-icon" viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M19.2 12.2 C 19.1 16.2, 15.9 19.3, 11.9 19.2 C 8 19.1, 5 16, 5.1 12 C 5.2 8.1, 8.4 5, 12.3 5.1 C 14.7 5.2, 16.8 6.3, 18.1 8.1" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round"/><path d="M18.4 4.4 C 18.5 6, 18.4 7.4, 18.2 8.9 C 16.6 8.5, 15.2 8.2, 13.7 8" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"/></svg></button>
          </div>
          <div className="settings">
            <button className="ink-toggle" aria-pressed={motion} aria-label={motion ? 'Pause motion' : 'Play motion'} title={motion ? 'Pause motion' : 'Play motion'} onClick={() => setMotion(!motion)}>
              <InkMotion paused={!motion} />
            </button>
            <button className="ink-toggle" aria-pressed={sound} aria-label={sound ? 'Turn sound off' : 'Turn sound on'} title={sound ? 'Sound on' : 'Sound off'} onClick={() => setSound(!sound)}>
              <InkSound on={sound} />
            </button>
            <button className="ink-toggle" aria-pressed={dark} aria-label={dark ? 'Light controls' : 'Dark controls'} title={dark ? 'Light controls' : 'Dark controls'} onClick={() => setDark(!dark)}>
              <InkTheme dark={dark} />
            </button>
            <button className="ink-toggle" aria-pressed={notes} aria-label={notes ? 'Hide notes' : 'Show notes'} title={notes ? 'Hide notes' : 'Show notes'} onClick={() => setNotes(!notes)}>
              <InkNotes on={notes} />
            </button>
            <button className="ink-toggle" aria-pressed={pinned} aria-label={pinned ? 'Let controls retire' : 'Keep controls visible'} title={pinned ? 'Let controls retire' : 'Keep controls visible'} onClick={togglePin}>
              <InkPin pinned={pinned} />
            </button>
          </div>
        </div>
      </footer>
    </main>
  )
}
