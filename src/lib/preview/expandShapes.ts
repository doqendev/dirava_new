import * as THREE from 'three'
import ClipperLib from 'clipper-lib'

// Scale factor for Clipper (works with integers internally)
const CLIPPER_SCALE = 1000

/**
 * Expand shapes uniformly using Clipper's polygon offset.
 * Handles corners, self-intersections, and complex topology correctly.
 */
export function expandShapes(shapes: THREE.Shape[], strokeWidth: number): THREE.Shape[] {
  const result: THREE.Shape[] = []

  for (const shape of shapes) {
    // Convert outer contour to Clipper path
    const outerPoints = shape.getPoints(12)
    const clipperOuter: ClipperLib.Path = outerPoints.map((p) => ({
      X: Math.round(p.x * CLIPPER_SCALE),
      Y: Math.round(p.y * CLIPPER_SCALE),
    }))

    // Offset outer contour outward (positive delta)
    const outerOffset = new ClipperLib.ClipperOffset()
    outerOffset.ArcTolerance = 5
    outerOffset.AddPath(clipperOuter, 1 /* jtRound */, 0 /* etClosedPolygon */)
    const outerSolution: ClipperLib.Paths = []
    outerOffset.Execute(outerSolution, strokeWidth * CLIPPER_SCALE)

    if (outerSolution.length === 0) continue

    // Use the first (largest) result as the expanded outer contour
    const expandedOuter = outerSolution[0]!.map(
      (p) => new THREE.Vector2(p.X / CLIPPER_SCALE, p.Y / CLIPPER_SCALE)
    )
    const expandedShape = new THREE.Shape(expandedOuter)

    // Shrink each hole inward by strokeWidth using edge-normal
    // offsets. (Clipper's hole offset returns empty in this build
    // regardless of winding/delta combination — this does the work
    // manually.) For each vertex we compute the miter offset from the
    // two adjacent edges' inward normals, so the shrunk hole keeps
    // the original contour's shape instead of rounding toward a
    // centroid.
    for (const hole of shape.holes) {
      const holePoints = hole.getPoints(12)
      if (holePoints.length < 3) continue

      // Inward direction depends on winding. Shoelace formula: CCW
      // polygon has positive signed area (in y-up coords). For a hole
      // inside a Shape, Three.js expects opposite winding to the
      // outer, so we compute the sign once and use it per-vertex.
      let signedArea = 0
      for (let i = 0; i < holePoints.length; i++) {
        const a = holePoints[i]!
        const b = holePoints[(i + 1) % holePoints.length]!
        signedArea += a.x * b.y - b.x * a.y
      }
      const ccw = signedArea > 0
      // Per-edge inward normal (unit length). For CCW, inward is
      // (-dy, dx); for CW, (dy, -dx).
      const edgeNormal = (ax: number, ay: number, bx: number, by: number) => {
        const dx = bx - ax
        const dy = by - ay
        const len = Math.sqrt(dx * dx + dy * dy) || 1
        const nx = ccw ? -dy / len : dy / len
        const ny = ccw ? dx / len : -dx / len
        return { nx, ny }
      }

      const shrunk: THREE.Vector2[] = []
      let collapsed = false
      for (let i = 0; i < holePoints.length; i++) {
        const prev = holePoints[(i - 1 + holePoints.length) % holePoints.length]!
        const curr = holePoints[i]!
        const next = holePoints[(i + 1) % holePoints.length]!
        const n1 = edgeNormal(prev.x, prev.y, curr.x, curr.y)
        const n2 = edgeNormal(curr.x, curr.y, next.x, next.y)
        // Miter offset: (n1 + n2) / (1 + n1 · n2). Stable everywhere
        // except when the two normals are nearly opposite (spike
        // vertex) — cap the miter length to avoid blow-ups.
        const sumX = n1.nx + n2.nx
        const sumY = n1.ny + n2.ny
        const denom = 1 + n1.nx * n2.nx + n1.ny * n2.ny
        const MITER_CAP = 4
        let mx: number
        let my: number
        if (Math.abs(denom) < 1 / MITER_CAP) {
          // Near-colinear reversal — fall back to simple normal of
          // n1 scaled by strokeWidth.
          mx = n1.nx * strokeWidth
          my = n1.ny * strokeWidth
        } else {
          const miterLen = strokeWidth / denom
          const clamped = Math.max(-MITER_CAP * strokeWidth, Math.min(MITER_CAP * strokeWidth, miterLen))
          mx = sumX * clamped * 0.5
          my = sumY * clamped * 0.5
          // The formula above gives 2·strokeWidth direction, so
          // multiply by 0.5 to land exactly strokeWidth into the poly.
          // (Derived from offset = n1+n2 rescaled so that distance to
          // each original edge equals strokeWidth.)
        }
        const newX = curr.x + mx
        const newY = curr.y + my
        // Sanity: if the moved point lands outside the polygon, skip
        // (e.g. the hole has collapsed at this vertex).
        shrunk.push(new THREE.Vector2(newX, newY))
      }

      // Quick collapse test: if the shrunk polygon has flipped sign
      // (became inside-out), the hole closed entirely.
      let newSigned = 0
      for (let i = 0; i < shrunk.length; i++) {
        const a = shrunk[i]!
        const b = shrunk[(i + 1) % shrunk.length]!
        newSigned += a.x * b.y - b.x * a.y
      }
      if ((newSigned > 0) !== ccw) collapsed = true

      if (!collapsed && shrunk.length >= 3) {
        expandedShape.holes.push(new THREE.Path(shrunk))
      }
    }

    result.push(expandedShape)
  }

  return result
}
