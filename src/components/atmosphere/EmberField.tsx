import { useEffect, useMemo, useRef } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { NormalBlending, PlaneGeometry, ShaderMaterial, Vector2 } from 'three';

// Spec §8 — the site's single three.js effect: a domain-warped ember field
// behind chapter 00. It is an upgrade over `CssAura` in `HeroAtmosphere`, not
// a replacement: it occupies the same box and reuses the same two colours,
// centres, radii and peak alphas as the design's aura gradient
// (portfolio-v5-flight-deck.dc.html line 74) so the two read as one design.

const VERTEX_SHADER = /* glsl */ `
  varying vec2 vUv;

  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

// The colour literals below are the design's rust (#C0603A) and ember
// (#E8A33D) tokens in normalised sRGB. GLSL cannot read the CSS custom
// properties, so they are declared once here as named constants and never
// repeated inline. The renderer is put in linear output mode (see `linear` on
// <Canvas> below) precisely so these values reach the screen unconverted and
// match the CSS gradient the fallback paints.
const FRAGMENT_SHADER = /* glsl */ `
  precision highp float;

  varying vec2 vUv;

  uniform float uTime;
  uniform vec2 uPointer;

  const vec3 RUST = vec3(0.75294, 0.37647, 0.22745);   // #C0603A
  const vec3 EMBER = vec3(0.90980, 0.63922, 0.23922);  // #E8A33D

  // Centres, radii, colour-stop ends and peak alphas ported from the design's
  // two radial-gradient layers, verbatim.
  const vec2 RUST_CENTER = vec2(0.38, 0.44);
  const vec2 EMBER_CENTER = vec2(0.66, 0.62);
  const float RUST_RADIUS = 0.45;
  const float EMBER_RADIUS = 0.38;
  const float RUST_STOP = 0.70;
  const float EMBER_STOP = 0.72;
  const float RUST_ALPHA = 0.36;
  const float EMBER_ALPHA = 0.22;

  float hash(vec2 p) {
    return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123);
  }

  float noise(vec2 p) {
    vec2 i = floor(p);
    vec2 f = fract(p);
    vec2 u = f * f * (3.0 - 2.0 * f);
    return mix(
      mix(hash(i + vec2(0.0, 0.0)), hash(i + vec2(1.0, 0.0)), u.x),
      mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), u.x),
      u.y
    );
  }

  float fbm(vec2 p) {
    float value = 0.0;
    float amplitude = 0.5;
    for (int i = 0; i < 4; i++) {
      value += amplitude * noise(p);
      p *= 2.0;
      amplitude *= 0.5;
    }
    return value;
  }

  // One gradient lobe: a linear radial falloff identical in shape to the CSS
  // stop, modulated by a domain-warped fbm field so it breathes.
  float lobe(vec2 uv, vec2 center, float radius, float stop, float t) {
    vec2 warp = vec2(fbm(uv * 2.6 + t), fbm(uv * 2.6 + vec2(4.7, 1.3) - t));
    float n = fbm(uv * 3.2 + warp * 1.4 + t * 0.6);
    float d = length(uv - center) / radius;
    float falloff = clamp(1.0 - d / stop, 0.0, 1.0);
    return falloff * clamp(0.55 + 0.9 * n, 0.0, 1.4);
  }

  void main() {
    // The pointer nudges the field by at most 2% of the box: enough to feel
    // alive, small enough that the composition never leaves the design.
    vec2 uv = vUv + uPointer * 0.02;

    float rust = RUST_ALPHA * lobe(uv, RUST_CENTER, RUST_RADIUS, RUST_STOP, uTime);
    float ember = EMBER_ALPHA * lobe(uv, EMBER_CENTER, EMBER_RADIUS, EMBER_STOP, uTime * 1.13 + 9.0);

    float alpha = rust + ember;
    if (alpha <= 0.0001) discard;

    vec3 color = (RUST * rust + EMBER * ember) / alpha;
    gl_FragColor = vec4(color, clamp(alpha, 0.0, 1.0));
  }
`;

const TIME_SCALE = 0.06;
// Pointer easing, expressed per second and applied as an exponential so the
// lerp is frame-rate independent rather than tied to a 60fps assumption.
const POINTER_EASE_PER_SECOND = 3;

function Embers() {
  const viewport = useThree((state) => state.viewport);

  const geometry = useMemo(() => new PlaneGeometry(1, 1), []);
  const uniforms = useMemo(
    () => ({ uTime: { value: 0 }, uPointer: { value: new Vector2(0, 0) } }),
    [],
  );
  const material = useMemo(
    () =>
      new ShaderMaterial({
        vertexShader: VERTEX_SHADER,
        fragmentShader: FRAGMENT_SHADER,
        uniforms,
        transparent: true,
        blending: NormalBlending,
        depthTest: false,
        depthWrite: false,
        toneMapped: false,
      }),
    [uniforms],
  );

  const pointerTarget = useRef(new Vector2(0, 0));
  // Set false on unmount so a frame already queued for this tick cannot touch
  // uniforms belonging to a disposed material.
  const running = useRef(true);

  useEffect(() => {
    // The canvas is pointer-events:none (it must never eat hero clicks), so
    // react-three-fiber's own pointer state never updates. Read the pointer
    // from the window instead, normalised to -1..1 across the viewport.
    const onPointerMove = (event: PointerEvent) => {
      pointerTarget.current.set(
        (event.clientX / window.innerWidth) * 2 - 1,
        (event.clientY / window.innerHeight) * 2 - 1,
      );
    };
    window.addEventListener('pointermove', onPointerMove, { passive: true });
    return () => window.removeEventListener('pointermove', onPointerMove);
  }, []);

  useEffect(() => {
    const disposables = { geometry, material };
    return () => {
      running.current = false;
      // These two are constructed here rather than by react-three-fiber, so
      // r3f's own auto-dispose does not cover them. GPU buffers and the
      // compiled program leak for the life of the context otherwise, and a
      // remount would allocate a second set.
      disposables.geometry.dispose();
      disposables.material.dispose();
    };
  }, [geometry, material]);

  useFrame((_state, delta) => {
    if (!running.current) return;
    // Guard against a tab-restore delta spike walking the field forward by
    // seconds in a single frame.
    const step = Math.min(delta, 1 / 30);
    uniforms.uTime.value += step * TIME_SCALE;
    uniforms.uPointer.value.lerp(
      pointerTarget.current,
      1 - Math.exp(-step * POINTER_EASE_PER_SECOND),
    );
  });

  return (
    <mesh
      geometry={geometry}
      material={material}
      scale={[viewport.width, viewport.height, 1]}
      frustumCulled={false}
    />
  );
}

export function EmberField() {
  return (
    <div
      data-testid="ember-field"
      data-anim="aura"
      aria-hidden="true"
      className="pointer-events-none absolute -top-[24%] -left-[8%] h-[150%] w-[72%]"
    >
      <Canvas
        // Every value below is set explicitly rather than inherited: several
        // react-three-fiber defaults (fov 75, ACES tone mapping, sRGB output
        // conversion, unclamped dpr) would change how this looks or what it
        // costs, and an inherited default is a decision nobody made.
        camera={{ fov: 50, near: 0.1, far: 100, position: [0, 0, 5] }}
        dpr={[1, 1.5]}
        flat // NoToneMapping: ACES would desaturate the ported ember colours.
        linear // Linear output: the constants above are already sRGB values.
        frameloop="always"
        resize={{ scroll: false, debounce: { scroll: 0, resize: 100 } }}
        gl={{
          alpha: true,
          antialias: false, // Nothing here has an edge to alias.
          depth: false,
          stencil: false,
          preserveDrawingBuffer: false,
          powerPreference: 'high-performance',
        }}
        style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}
      >
        <Embers />
      </Canvas>
    </div>
  );
}
