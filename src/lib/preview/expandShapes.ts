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

    // Shrink each hole inward by strokeWidth. The Clipper offset
    // operation on opentype-sourced hole paths returns empty in this
    // build regardless of winding, so fall back to a simple
    // centroid-ward shrink: pull every vertex toward the contour's
    // centroid by strokeWidth. This is a good approximation for
    // convex-ish letter counters (D, O, A, P, B, etc.) and never
    // over-collapses a surviving hole the way Clipper was doing.
    for (const hole of shape.holes) {
      const holePoints = hole.getPoints(12)
      if (holePoints.length < 3) continue

      let cx = 0
      let cy = 0
      for (const p of holePoints) {
        cx += p.x
        cy += p.y
      }
      cx /= holePoints.length
      cy /= holePoints.length

      const shrunk: THREE.Vector2[] = []
      for (const p of holePoints) {
        const dx = p.x - cx
        const dy = p.y - cy
        const d = Math.sqrt(dx * dx + dy * dy)
        if (d <= strokeWidth) {
          // This vertex is within strokeWidth of the centroid —
          // collapsing further would invert the polygon, so skip the
          // whole hole (it's closed entirely).
          shrunk.length = 0
          break
        }
        const k = (d - strokeWidth) / d
        shrunk.push(new THREE.Vector2(cx + dx * k, cy + dy * k))
      }

      if (shrunk.length >= 3) {
        expandedShape.holes.push(new THREE.Path(shrunk))
      }
    }

    result.push(expandedShape)
  }

  return result
}
