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

    // Offset each hole inward (negative delta = shrink hole opening)
    for (const hole of shape.holes) {
      const holePoints = hole.getPoints(12)
      const clipperHole: ClipperLib.Path = holePoints.map((p) => ({
        X: Math.round(p.x * CLIPPER_SCALE),
        Y: Math.round(p.y * CLIPPER_SCALE),
      }))

      const holeOffset = new ClipperLib.ClipperOffset()
      holeOffset.ArcTolerance = 5
      holeOffset.AddPath(clipperHole, 1 /* jtRound */, 0 /* etClosedPolygon */)
      const holeSolution: ClipperLib.Paths = []
      holeOffset.Execute(holeSolution, -strokeWidth * CLIPPER_SCALE)

      // If the hole survives shrinking, add it
      for (const shrunkHole of holeSolution) {
        const holeVecs = shrunkHole.map(
          (p) => new THREE.Vector2(p.X / CLIPPER_SCALE, p.Y / CLIPPER_SCALE)
        )
        expandedShape.holes.push(new THREE.Path(holeVecs))
      }
    }

    result.push(expandedShape)
  }

  return result
}
