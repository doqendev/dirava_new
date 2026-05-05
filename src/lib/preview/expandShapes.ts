import * as THREE from 'three'
import ClipperLib from 'clipper-lib'

const CLIPPER_SCALE = 1000

export type StrokeJoinType = 'round' | 'miter' | 'square'

function pathArea(path: ClipperLib.Path) {
  let area = 0
  for (let i = 0; i < path.length; i++) {
    const a = path[i]!
    const b = path[(i + 1) % path.length]!
    area += a.X * b.Y - b.X * a.Y
  }
  return area / 2
}

function pointInPolygon(point: THREE.Vector2, polygon: THREE.Vector2[]) {
  let inside = false
  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
    const a = polygon[i]!
    const b = polygon[j]!
    if (
      a.y > point.y !== b.y > point.y &&
      point.x < ((b.x - a.x) * (point.y - a.y)) / (b.y - a.y) + a.x
    ) {
      inside = !inside
    }
  }
  return inside
}

function pathsToShapes(paths: ClipperLib.Paths) {
  const contours = paths
    .map((path) => ({
      points: path.map((p) => new THREE.Vector2(p.X / CLIPPER_SCALE, p.Y / CLIPPER_SCALE)),
      area: Math.abs(pathArea(path)),
    }))
    .filter((contour) => contour.points.length >= 3)
    .sort((a, b) => b.area - a.area)

  const parents = contours.map(() => -1)
  const depth = contours.map(() => 0)
  for (let i = 1; i < contours.length; i++) {
    const point = contours[i]!.points[0]
    if (!point) continue
    for (let j = i - 1; j >= 0; j--) {
      if (pointInPolygon(point, contours[j]!.points)) {
        parents[i] = j
        depth[i] = (depth[j] ?? 0) + 1
        break
      }
    }
  }

  const shapes: THREE.Shape[] = []
  const byIdx = new Map<number, THREE.Shape>()
  for (let i = 0; i < contours.length; i++) {
    if ((depth[i] ?? 0) % 2 === 0) {
      const shape = new THREE.Shape(contours[i]!.points)
      shapes.push(shape)
      byIdx.set(i, shape)
    }
  }

  for (let i = 0; i < contours.length; i++) {
    if ((depth[i] ?? 0) % 2 !== 1) continue
    let parent = parents[i] ?? -1
    while (parent !== -1 && (depth[parent] ?? 0) % 2 !== 0) parent = parents[parent] ?? -1
    const shape = byIdx.get(parent)
    if (shape) shape.holes.push(new THREE.Path(contours[i]!.points))
  }

  return shapes
}

/**
 * Expand shapes uniformly using Clipper's polygon offset.
 * Handles corners, self-intersections, holes, and complex topology.
 */
export function expandShapes(
  shapes: THREE.Shape[],
  strokeWidth: number,
  joinType: StrokeJoinType = 'round',
): THREE.Shape[] {
  const result: THREE.Shape[] = []
  const jt = joinType === 'miter' ? 2 : joinType === 'square' ? 0 : 1
  const miterLimit = 100

  for (const shape of shapes) {
    const clipperOuter: ClipperLib.Path = shape.getPoints(12).map((p) => ({
      X: Math.round(p.x * CLIPPER_SCALE),
      Y: Math.round(p.y * CLIPPER_SCALE),
    }))
    if (clipperOuter.length < 3) continue

    const outerArea = pathArea(clipperOuter)
    const sourcePaths: ClipperLib.Paths = [clipperOuter]
    for (const hole of shape.holes) {
      const holePath: ClipperLib.Path = hole.getPoints(12).map((p) => ({
        X: Math.round(p.x * CLIPPER_SCALE),
        Y: Math.round(p.y * CLIPPER_SCALE),
      }))
      if (holePath.length < 3) continue
      if (pathArea(holePath) * outerArea > 0) holePath.reverse()
      sourcePaths.push(holePath)
    }

    const offset = new ClipperLib.ClipperOffset(miterLimit)
    offset.ArcTolerance = 5
    offset.AddPaths(sourcePaths, jt, 0)

    const solution: ClipperLib.Paths = []
    offset.Execute(solution, strokeWidth * CLIPPER_SCALE)
    result.push(...pathsToShapes(solution))
  }

  return result
}
