declare module 'clipper-lib' {
  interface IntPoint {
    X: number
    Y: number
  }

  type Path = IntPoint[]
  type Paths = Path[]

  // JoinType: 0=jtSquare, 1=jtRound, 2=jtMiter
  // EndType: 0=etClosedPolygon, 1=etClosedLine, 2=etOpenButt, 3=etOpenSquare, 4=etOpenRound

  // ClipType: 0=ctIntersection, 1=ctUnion, 2=ctDifference, 3=ctXor
  // PolyType: 0=ptSubject, 1=ptClip
  // PolyFillType: 0=pftEvenOdd, 1=pftNonZero, 2=pftPositive, 3=pftNegative

  class Clipper {
    constructor(initOptions?: number)
    AddPath(path: Path, polyType: number, closed: boolean): boolean
    AddPaths(paths: Paths, polyType: number, closed: boolean): boolean
    Execute(clipType: number, solution: Paths, subjFillType?: number, clipFillType?: number): boolean
    Clear(): void
    static Orientation(path: Path): boolean
    static Area(path: Path): number
  }

  class ClipperOffset {
    constructor(miterLimit?: number, arcTolerance?: number)
    AddPath(path: Path, joinType: number, endType: number): void
    AddPaths(paths: Paths, joinType: number, endType: number): void
    Execute(solution: Paths, delta: number): void
    Clear(): void
    MiterLimit: number
    ArcTolerance: number
  }

  const JS: {
    ScaleUpPath(path: Path, scale: number): void
    ScaleUpPaths(paths: Paths, scale: number): void
    ScaleDownPath(path: Path, scale: number): void
    ScaleDownPaths(paths: Paths, scale: number): void
  }
}
