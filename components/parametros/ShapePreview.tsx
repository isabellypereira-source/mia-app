'use client'

import { useEffect, useRef } from 'react'

interface Props {
  formato: string
  diametro: number
  altura: number
  stlPath?: string   // ex: '/stl/tilapia.stl' — se fornecido, carrega o arquivo
}

export default function ShapePreview({ formato, diametro, altura, stlPath }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    let animId: number
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let renderer: any
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let controls: any
    let disposed = false

    ;(async () => {
      try {
        const THREE = await import('three')
        const { OrbitControls } = await import('three/examples/jsm/controls/OrbitControls.js')

        if (disposed) return

        const w = canvas.clientWidth || 500
        const h = canvas.clientHeight || 280

        renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true })
        renderer.setSize(w, h, false)
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
        renderer.shadowMap.enabled = true

        const scene = new THREE.Scene()
        scene.background = new THREE.Color(0xfff8f1)

        const camera = new THREE.PerspectiveCamera(45, w / h, 0.1, 5000)

        controls = new OrbitControls(camera, canvas)
        controls.enableDamping = true
        controls.dampingFactor = 0.08

        // Luz
        scene.add(new THREE.AmbientLight(0xffffff, 0.65))
        const dir = new THREE.DirectionalLight(0xffffff, 1.2)
        dir.position.set(200, 300, 200)
        dir.castShadow = true
        scene.add(dir)
        const fill = new THREE.DirectionalLight(0xfff2da, 0.35)
        fill.position.set(-200, 200, -200)
        scene.add(fill)

        const mat = new THREE.MeshStandardMaterial({ color: 0x7c9b8e, roughness: 0.55, metalness: 0.05 })
        let mesh: import('three').Mesh

        if (stlPath) {
          // Carrega STL real
          const { STLLoader } = await import('three/examples/jsm/loaders/STLLoader.js')
          if (disposed) return
          const loader = new STLLoader()
          const geo = await new Promise<import('three').BufferGeometry>((resolve, reject) =>
            loader.load(stlPath, resolve, undefined, reject)
          )
          if (disposed) { geo.dispose(); return }
          geo.computeBoundingBox()
          geo.center()
          mesh = new THREE.Mesh(geo, mat)
          mesh.castShadow = true

          const box = new THREE.Box3().setFromObject(mesh)
          const size = box.getSize(new THREE.Vector3())
          const maxDim = Math.max(size.x, size.y, size.z)
          camera.position.set(maxDim * 1.5, maxDim * 1.2, maxDim * 1.5)
          camera.lookAt(0, 0, 0)
          controls.minDistance = maxDim * 0.4
          controls.maxDistance = maxDim * 6

          const grid = new THREE.GridHelper(maxDim * 3, 10, 0xe5d9c1, 0xe5d9c1)
          grid.position.y = -size.y / 2
          scene.add(grid)
        } else {
          // Geometria paramétrica (cilindro / cubo)
          const geo = formato === 'cubo'
            ? new THREE.BoxGeometry(diametro, altura, diametro)
            : new THREE.CylinderGeometry(diametro / 2, diametro / 2, altura, 48)

          mesh = new THREE.Mesh(geo, mat)
          mesh.castShadow = true
          mesh.position.y = formato === 'cubo' ? 0 : altura / 2

          const maxDim = Math.max(diametro, altura)
          camera.position.set(maxDim * 1.5, maxDim * 1.2, maxDim * 1.5)
          camera.lookAt(0, altura / 2, 0)
          controls.minDistance = maxDim * 0.5
          controls.maxDistance = maxDim * 5

          const grid = new THREE.GridHelper(maxDim * 3, 10, 0xe5d9c1, 0xe5d9c1)
          grid.position.y = formato === 'cubo' ? -altura / 2 : 0
          scene.add(grid)
        }

        scene.add(mesh)

        function animate() {
          if (disposed) return
          animId = requestAnimationFrame(animate)
          controls.update()
          renderer.render(scene, camera)
        }
        animate()

        const ro = new ResizeObserver(() => {
          if (disposed) return
          const nw = canvas.clientWidth
          const nh = canvas.clientHeight
          camera.aspect = nw / nh
          camera.updateProjectionMatrix()
          renderer.setSize(nw, nh, false)
        })
        ro.observe(canvas)

        return () => { ro.disconnect() }
      } catch (err) {
        console.error('ShapePreview:', err)
      }
    })()

    return () => {
      disposed = true
      cancelAnimationFrame(animId)
      controls?.dispose()
      renderer?.dispose()
    }
  }, [formato, diametro, altura, stlPath])

  return (
    <canvas
      ref={canvasRef}
      style={{ width: '100%', height: 280, display: 'block', touchAction: 'none' }}
    />
  )
}
