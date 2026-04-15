'use client'

import { useEffect, useRef } from 'react'

interface Props {
  formato: 'cilindro' | 'cubo' | string
  diametro: number   // cilindro: diâmetro; cubo: aresta
  altura: number
  className?: string
}

/**
 * Viewer 3D leve usando Three.js diretamente (sem react-three-fiber).
 * Renderiza geometrias paramétricas — não precisa de STL file.
 * Suporta rotação via arrastar e zoom via scroll.
 */
export default function ShapePreview({ formato, diametro, altura, className }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    let animId: number
    let renderer: import('three').WebGLRenderer
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let controls: any

    // Importa Three.js dinamicamente para não quebrar SSR
    ;(async () => {
      try {
        const THREE = await import('three')
        const { OrbitControls } = await import('three/examples/jsm/controls/OrbitControls.js')

        const w = canvas.clientWidth || 500
        const h = canvas.clientHeight || 280

        // Renderer
        renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true })
        renderer.setSize(w, h, false)
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
        renderer.shadowMap.enabled = true

        // Scene
        const scene = new THREE.Scene()
        scene.background = new THREE.Color(0xfff8f1)

        // Camera
        const camera = new THREE.PerspectiveCamera(45, w / h, 0.1, 2000)
        const maxDim = Math.max(diametro, altura)
        camera.position.set(maxDim * 1.5, maxDim * 1.2, maxDim * 1.5)
        camera.lookAt(0, altura / 2, 0)

        // Controls
        controls = new OrbitControls(camera, canvas)
        controls.enableDamping = true
        controls.dampingFactor = 0.08
        controls.minDistance = maxDim * 0.5
        controls.maxDistance = maxDim * 5

        // Lights
        const ambient = new THREE.AmbientLight(0xffffff, 0.6)
        scene.add(ambient)
        const dir = new THREE.DirectionalLight(0xffffff, 1.2)
        dir.position.set(maxDim, maxDim * 2, maxDim)
        dir.castShadow = true
        scene.add(dir)
        const fill = new THREE.DirectionalLight(0xfff2da, 0.4)
        fill.position.set(-maxDim, maxDim, -maxDim)
        scene.add(fill)

        // Geometry
        let geo: import('three').BufferGeometry
        if (formato === 'cubo') {
          geo = new THREE.BoxGeometry(diametro, altura, diametro)
        } else {
          // cilindro
          geo = new THREE.CylinderGeometry(diametro / 2, diametro / 2, altura, 48)
        }

        const mat = new THREE.MeshStandardMaterial({
          color: 0x7c9b8e,
          roughness: 0.6,
          metalness: 0.05,
        })
        const mesh = new THREE.Mesh(geo, mat)
        mesh.castShadow = true
        // Posiciona com base em z=0 (como no GCode)
        mesh.position.y = formato === 'cubo' ? 0 : altura / 2

        scene.add(mesh)

        // Grelha de fundo sutil
        const grid = new THREE.GridHelper(maxDim * 3, 10, 0xe5d9c1, 0xe5d9c1)
        grid.position.y = formato === 'cubo' ? -altura / 2 : 0
        scene.add(grid)

        // Render loop
        function animate() {
          animId = requestAnimationFrame(animate)
          controls.update()
          renderer.render(scene, camera)
        }
        animate()

        // Resize handler
        const ro = new ResizeObserver(() => {
          const nw = canvas.clientWidth
          const nh = canvas.clientHeight
          camera.aspect = nw / nh
          camera.updateProjectionMatrix()
          renderer.setSize(nw, nh, false)
        })
        ro.observe(canvas)

        // Cleanup
        return () => {
          ro.disconnect()
          cancelAnimationFrame(animId)
          controls.dispose()
          renderer.dispose()
          geo.dispose()
          mat.dispose()
        }
      } catch (err) {
        console.error('ShapePreview: erro ao carregar Three.js', err)
      }
    })()

    return () => {
      cancelAnimationFrame(animId)
      renderer?.dispose()
    }
  }, [formato, diametro, altura])

  return (
    <canvas
      ref={canvasRef}
      className={className}
      style={{ width: '100%', height: 280, display: 'block', touchAction: 'none' }}
    />
  )
}
