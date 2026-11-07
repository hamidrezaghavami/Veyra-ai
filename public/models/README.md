# 3D Models Directory

Drop your `.glb` or `.gltf` 3D files here (e.g. `robot.glb`, `safe.glb`, `credit-card.glb`, `vault.glb`).

### Recommended Free Sources for Premium 3D Models:
1. **Spline Library** (https://spline.design) — Export as GLTF/GLB directly.
2. **Sketchfab** (https://sketchfab.com) — Filter by "Free" + downloadable CC0 models.
3. **Poly Pizza** (https://poly.pizza) — Thousands of lightweight low-poly and high-poly 3D models.
4. **Kenney Assets** (https://kenney.nl) — CC0 3D game and sci-fi assets.

### Usage in React:
```tsx
import { Model3D } from './components/Model3D';

<Model3D url="/models/your-model.glb" scale={1.5} position={[0, 0, 0]} />
```
