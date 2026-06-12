'use client'

import { useEffect, useRef, useState } from 'react'

interface Props {
  stlPath: string
}

export default function ShapeThumb({ stlPath }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const wrapRef = useRef<HTMLDivElement>(null)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const el = wrapRef.current
    if (!el) return
    const obs = new IntersectionObserver(entries => {
      if (entries[0]?.isIntersecting) { setVisible(true); obs.disconnect() }
    }, { rootMargin: '300px' })
    obs.observe(el)
    return () => obs.disconnect()
  }, [])

  useEffect(() => {
    if (!visible) return
    const canvas = canvasRef.current
    if (!canvas) return

    let disposed = false
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let renderer: any

    ;(async () => {
      try {
        const THREE = await import('three')
        const { STLLoader } = await import('three/examples/jsm/loaders/STLLoader.js')
        if (disposed) return

        const w = canvas.clientWidth || 120
        const h = canvas.clientHeight || 120

        renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true })
        renderer.setSize(w, h, false)
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5))

        const scene = new THREE.Scene()
        const camera = new THREE.PerspectiveCamera(40, w / h, 0.1, 5000)

        scene.add(new THREE.AmbientLight(0xffffff, 0.85))
        const dir = new THREE.DirectionalLight(0xffffff, 1.1)
        dir.position.set(150, 260, 200)
        scene.add(dir)
        const fill = new THREE.DirectionalLight(0xfff2da, 0.3)
        fill.position.set(-150, 120, -150)
        scene.add(fill)

        const mat = new THREE.MeshStandardMaterial({ color: 0x9fc4b4, roughness: 0.5, metalness: 0.05 })

        const loader = new STLLoader()
        const geo = await new Promise<import('three').BufferGeometry>((resolve, reject) =>
          loader.load(stlPath, resolve, undefined, reject)
        )
        if (disposed) { geo.dispose(); return }

        geo.computeBoundingBox()
        geo.center()
        const mesh = new THREE.Mesh(geo, mat)

        const box = new THREE.Box3().setFromObject(mesh)
        const size = box.getSize(new THREE.Vector3())
        const maxDim = Math.max(size.x, size.y, size.z) || 1

        camera.position.set(maxDim * 1.3, maxDim * 1.35, maxDim * 1.3)
        camera.lookAt(0, 0, 0)

        scene.add(mesh)
        renderer.render(scene, camera)
      } catch (err) {
        console.error('ShapeThumb:', err)
      }
    })()

    return () => {
      disposed = true
      renderer?.dispose()
    }
  }, [visible, stlPath])

  return (
    <div ref={wrapRef} style={{ width: '100%', height: '100%' }}>
      <canvas ref={canvasRef} style={{ width: '100%', height: '100%', display: 'block' }} />
    </div>
  )
}
