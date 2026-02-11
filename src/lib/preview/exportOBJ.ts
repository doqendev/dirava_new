import * as THREE from 'three'

interface ExportResult {
  obj: string
  mtl: string
}

/**
 * Export a Three.js group/scene to OBJ + MTL format.
 * Each mesh becomes a separate named group/body with its material color preserved.
 */
export function exportGroupToOBJ(group: THREE.Object3D, name = 'model'): ExportResult {
  const mtlName = `${name}.mtl`
  const materials: Map<string, THREE.Color> = new Map()
  let objStr = `# Exported from Tamashii 3D Preview\nmtllib ${mtlName}\n\n`
  let vertexOffset = 0
  let normalOffset = 0
  let meshIndex = 0

  group.updateMatrixWorld(true)

  group.traverse((child) => {
    if (!(child instanceof THREE.Mesh)) return
    if (!child.geometry) return

    const geo = child.geometry as THREE.BufferGeometry
    const posAttr = geo.getAttribute('position')
    const normAttr = geo.getAttribute('normal')
    if (!posAttr) return

    meshIndex++

    // Determine material color
    let color = new THREE.Color(0.5, 0.5, 0.5)
    if (child.material instanceof THREE.MeshStandardMaterial) {
      color = child.material.color.clone()
    }

    // Create a unique material name based on color
    const colorHex = '#' + color.getHexString()
    const matName = `mat_${colorHex.replace('#', '')}`
    if (!materials.has(matName)) {
      materials.set(matName, color)
    }

    // Group name from mesh ancestry
    const groupName = getBodyName(child, meshIndex)
    objStr += `g ${groupName}\n`
    objStr += `usemtl ${matName}\n`

    // Get world transform matrix
    const worldMatrix = child.matrixWorld

    // Write vertices
    const tempVec = new THREE.Vector3()
    for (let i = 0; i < posAttr.count; i++) {
      tempVec.set(posAttr.getX(i), posAttr.getY(i), posAttr.getZ(i))
      tempVec.applyMatrix4(worldMatrix)
      objStr += `v ${tempVec.x.toFixed(6)} ${tempVec.y.toFixed(6)} ${tempVec.z.toFixed(6)}\n`
    }

    // Write normals
    const normalMatrix = new THREE.Matrix3().getNormalMatrix(worldMatrix)
    if (normAttr) {
      for (let i = 0; i < normAttr.count; i++) {
        tempVec.set(normAttr.getX(i), normAttr.getY(i), normAttr.getZ(i))
        tempVec.applyMatrix3(normalMatrix).normalize()
        objStr += `vn ${tempVec.x.toFixed(6)} ${tempVec.y.toFixed(6)} ${tempVec.z.toFixed(6)}\n`
      }
    }

    // Write faces
    const index = geo.getIndex()
    if (index) {
      for (let i = 0; i < index.count; i += 3) {
        const a = index.getX(i) + 1 + vertexOffset
        const b = index.getX(i + 1) + 1 + vertexOffset
        const c = index.getX(i + 2) + 1 + vertexOffset
        if (normAttr) {
          const na = index.getX(i) + 1 + normalOffset
          const nb = index.getX(i + 1) + 1 + normalOffset
          const nc = index.getX(i + 2) + 1 + normalOffset
          objStr += `f ${a}//${na} ${b}//${nb} ${c}//${nc}\n`
        } else {
          objStr += `f ${a} ${b} ${c}\n`
        }
      }
    } else {
      // Non-indexed geometry
      for (let i = 0; i < posAttr.count; i += 3) {
        const a = i + 1 + vertexOffset
        const b = i + 2 + vertexOffset
        const c = i + 3 + vertexOffset
        if (normAttr) {
          objStr += `f ${a}//${a - vertexOffset + normalOffset} ${b}//${b - vertexOffset + normalOffset} ${c}//${c - vertexOffset + normalOffset}\n`
        } else {
          objStr += `f ${a} ${b} ${c}\n`
        }
      }
    }

    objStr += '\n'
    vertexOffset += posAttr.count
    if (normAttr) normalOffset += normAttr.count
  })

  // Build MTL
  let mtlStr = '# Exported from Tamashii 3D Preview\n\n'
  for (const [matName, color] of Array.from(materials)) {
    mtlStr += `newmtl ${matName}\n`
    mtlStr += `Kd ${color.r.toFixed(4)} ${color.g.toFixed(4)} ${color.b.toFixed(4)}\n`
    mtlStr += `Ka 0.1000 0.1000 0.1000\n`
    mtlStr += `Ks 0.3000 0.3000 0.3000\n`
    mtlStr += `Ns 50.0000\n`
    mtlStr += `d 1.0000\n`
    mtlStr += `illum 2\n\n`
  }

  return { obj: objStr, mtl: mtlStr }
}

function getBodyName(mesh: THREE.Object3D, index: number): string {
  // Walk up to find meaningful parent names
  const parts: string[] = []
  let current: THREE.Object3D | null = mesh
  while (current) {
    if (current.name) parts.unshift(current.name)
    current = current.parent
  }
  if (parts.length > 0) return parts.join('_')
  return `body_${index}`
}

/**
 * Trigger a browser download of the OBJ + MTL files as a zip-like pair.
 */
export function downloadOBJ(group: THREE.Object3D, name = 'model') {
  const { obj, mtl } = exportGroupToOBJ(group, name)

  // Download MTL first (referenced by OBJ)
  downloadFile(`${name}.mtl`, mtl, 'text/plain')
  // Small delay to avoid browser blocking multiple downloads
  setTimeout(() => {
    downloadFile(`${name}.obj`, obj, 'text/plain')
  }, 100)
}

function downloadFile(filename: string, content: string, mimeType: string) {
  const blob = new Blob([content], { type: mimeType })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}
