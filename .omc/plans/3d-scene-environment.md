# Plan: 3D Scene Environment for Composite Sign Preview

## Context
The current 3D preview shows the composite sign floating in a dark void (#0a0a12). Users have no sense of the product's real-world size (~15-25cm desk item). We need a lightweight scene that adds a surface/shelf and size context without heavy GPU load.

## Design Decisions
- **Surface**: Matte black plane beneath the sign (sleek, cyberpunk, on-brand)
- **Size reference**: The sign sits on the surface at a realistic scale — the ground plane and camera angle give natural depth perception
- **Lighting**: Keep existing StudioLighting, enhance with a subtle environment map for more realistic material response
- **No neon glow** on the surface — clean look, focus on the sign
- **Lightweight**: No loaded GLTF models, just Three.js primitives

## Changes

### 1. CompositeSignScene.tsx — Add ground plane + adjust positioning

**Add a ground plane:**
- A simple `<mesh>` with `PlaneGeometry` positioned below the sign
- Matte black material (`color: #111111`, `roughness: 0.95`, `metalness: 0.05`)
- Large enough to act as a "shelf" surface (~60x60 units)
- Receives `ContactShadows` (already exists, just needs positioning adjustment)

**Adjust sign positioning:**
- Currently the sign floats at origin. Shift it upward so it sits ON the surface
- Add a slight backward tilt (lean) so it looks like it's standing/propped on a shelf — more natural than perfectly vertical
- The existing `rotation={[0.1, 0, 0]}` on the group is close, keep or fine-tune

**Update ContactShadows:**
- Already present at `position={[0, -4, 0]}` — adjust Y to match the ground plane position
- Increase opacity slightly for more grounding effect

**Add environment map (optional, lightweight):**
- Use `@react-three/drei`'s `Environment` component with `preset="city"` or `preset="studio"`
- This gives subtle reflections on the metallic parts of the sign without loading a custom HDRI
- Very lightweight — it's a built-in preset

### 2. Preview3DCanvas.tsx — No changes needed
The canvas wrapper doesn't need modification.

### 3. Camera adjustment
- Pull the camera back slightly and angle down to show the ground plane
- The sign + surface composition should fill the frame nicely
- Update `camera.position` in the config or in the scene's OrbitControls target

## Files to Modify
- `src/components/product/preview3d/CompositeSignScene.tsx` — ground plane, positioning, environment

## Verification
- Sign appears to sit on a dark matte surface
- Surface gives depth/grounding without being distracting
- Metallic parts of the sign have subtle environmental reflections
- Performance remains smooth (no frame drops on mobile)
- Existing rotation/zoom controls still work naturally
- Shadow falls naturally on the surface below the sign
