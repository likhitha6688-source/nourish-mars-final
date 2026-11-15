import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import {
  buildEarthGroup,
  buildMayaMascotGroup,
  buildMarsGroup,
  buildMarsRoverGroup,
  detectSoftwareWebGL,
} from './nasaModelBuilders.ts';
import { playChime } from '../../utils/soundEffects.ts';

type CameraPreset = 'explorer' | 'maya' | 'mars';

const _targetPos = new THREE.Vector3();
const _targetLook = new THREE.Vector3();
const _currentLook = new THREE.Vector3(0.4, 0.7, 0);

export function Hero3DScene() {
  const mountRef = useRef<HTMLDivElement | null>(null);
  const [preset, setPreset] = useState<CameraPreset>('explorer');
  const [motionPaused, setMotionPaused] = useState<boolean>(() =>
    typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches
  );
  const [dockCollapsed, setDockCollapsed] = useState(false);
  const [mayaGreeting, setMayaGreeting] = useState<string>(
    'Hi, I am Maya! Ready to grow food on Mars with Sathya?'
  );

  const presetRef = useRef<CameraPreset>(preset);
  const motionPausedRef = useRef<boolean>(motionPaused);
  const jumpImpulseRef = useRef<number>(0);
  const pointerOffsetRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });

  useEffect(() => {
    presetRef.current = preset;
  }, [preset]);

  useEffect(() => {
    motionPausedRef.current = motionPaused;
  }, [motionPaused]);

  const triggerMayaWave = () => {
    jumpImpulseRef.current = 1.0;
    playChime('pop');
    const phrases = [
      'Sathya built our rover—let us check the Mars greenhouse!',
      'Fun fact: Mars averages -63°C, so plants grow in hydroponics!',
      'Every green leaf on Mars starts with a curious question!',
    ];
    setMayaGreeting(phrases[Math.floor(Math.random() * phrases.length)]);
  };

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    const isSoftwareGl = detectSoftwareWebGL();
    const width = container.clientWidth || 640;
    const height = container.clientHeight || 520;

    const renderer = new THREE.WebGLRenderer({
      antialias: !isSoftwareGl,
      alpha: true,
      powerPreference: 'high-performance',
    });
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.1;
    renderer.setPixelRatio(isSoftwareGl ? 1 : Math.min(window.devicePixelRatio, 2));
    renderer.setSize(width, height);
    renderer.shadowMap.enabled = !isSoftwareGl;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    container.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x0b1021, 0.028);

    const pmrem = new THREE.PMREMGenerator(renderer);
    const envTex = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
    scene.environment = envTex;
    pmrem.dispose();

    const camera = new THREE.PerspectiveCamera(42, width / height, 0.1, 100);
    camera.position.set(0.3, 1.5, 6.2);

    const hemi = new THREE.HemisphereLight(0xfde68a, 0x1e1b4b, 0.95);
    scene.add(hemi);

    const keyLight = new THREE.DirectionalLight(0xfffbeb, 2.2);
    keyLight.position.set(4.5, 6.5, 5.5);
    keyLight.castShadow = !isSoftwareGl;
    keyLight.shadow.mapSize.set(1024, 1024);
    keyLight.shadow.bias = -0.0005;
    keyLight.shadow.normalBias = 0.02;
    scene.add(keyLight);

    const rimLight = new THREE.DirectionalLight(0xfb923c, 1.3);
    rimLight.position.set(-5, 3, -4);
    scene.add(rimLight);

    // Martian Regolith Habitat Pad
    const padGroup = new THREE.Group();
    padGroup.position.set(-0.55, -0.32, 0);
    const padBase = new THREE.Mesh(
      new THREE.CylinderGeometry(1.18, 1.32, 0.18, 36),
      new THREE.MeshStandardMaterial({ color: 0x7c2d12, roughness: 0.72, metalness: 0.12 })
    );
    padBase.receiveShadow = true;
    padGroup.add(padBase);
    const padRing = new THREE.Mesh(
      new THREE.TorusGeometry(1.2, 0.035, 12, 48),
      new THREE.MeshStandardMaterial({ color: 0x4ade80, emissive: 0x22c55e, emissiveIntensity: 0.4, roughness: 0.3 })
    );
    padRing.rotation.x = Math.PI / 2;
    padRing.position.y = 0.08;
    padGroup.add(padRing);
    scene.add(padGroup);

    // Maya 3D Character + Rocket
    const maya = buildMayaMascotGroup();
    maya.root.position.set(-0.55, -0.22, 0);
    scene.add(maya.root);

    // Realistic Mars Globe & Distant Earth
    const maxAniso = renderer.capabilities.getMaxAnisotropy();
    const mars = buildMarsGroup(maxAniso, 1.3);
    mars.position.set(2.45, 1.85, -2.8);
    scene.add(mars);

    const earth = buildEarthGroup(maxAniso, 0.56);
    earth.position.set(-2.55, 2.25, -2.7);
    scene.add(earth);

    // Sathya's Mars Rover
    const rover = buildMarsRoverGroup();
    rover.scale.setScalar(0.56);
    rover.position.set(2.2, -0.4, -0.65);
    rover.rotation.y = -0.65;
    scene.add(rover);

    // Floating hydroponic green leaves inside mini dome crystal
    const leafMat = new THREE.MeshStandardMaterial({ color: 0x4ade80, roughness: 0.45 });
    const seedlingGroup = new THREE.Group();
    seedlingGroup.position.set(0.65, 0.05, 0.65);
    const pot = new THREE.Mesh(
      new THREE.CylinderGeometry(0.16, 0.12, 0.18, 16),
      new THREE.MeshStandardMaterial({ color: 0xe2e8f0, roughness: 0.4 })
    );
    seedlingGroup.add(pot);
    const leaf1 = new THREE.Mesh(new THREE.SphereGeometry(0.11, 12, 12), leafMat);
    leaf1.scale.set(1.3, 0.45, 0.8);
    leaf1.position.set(0.08, 0.16, 0);
    leaf1.rotation.z = 0.4;
    const leaf2 = new THREE.Mesh(new THREE.SphereGeometry(0.11, 12, 12), leafMat);
    leaf2.scale.set(1.3, 0.45, 0.8);
    leaf2.position.set(-0.08, 0.16, 0);
    leaf2.rotation.z = -0.4;
    seedlingGroup.add(leaf1, leaf2);
    scene.add(seedlingGroup);

    // Instanced stars
    const starCount = 120;
    const starGeo = new THREE.OctahedronGeometry(0.052, 0);
    const starMat = new THREE.MeshStandardMaterial({
      color: 0xfef08a,
      emissive: 0xfde047,
      emissiveIntensity: 0.65,
      roughness: 0.3,
    });
    const starsMesh = new THREE.InstancedMesh(starGeo, starMat, starCount);
    const dummy = new THREE.Object3D();
    for (let i = 0; i < starCount; i++) {
      dummy.position.set(((i * 17) % 16) - 8, ((i * 23) % 10) - 3.5, -2 - (i % 9) * 1.1);
      dummy.scale.setScalar(0.5 + (i % 4) * 0.35);
      dummy.rotation.set(i * 0.4, i * 0.7, 0);
      dummy.updateMatrix();
      starsMesh.setMatrixAt(i, dummy.matrix);
    }
    starsMesh.computeBoundingSphere();
    scene.add(starsMesh);

    if (!isSoftwareGl) {
      renderer.compile(scene, camera);
    }

    const onPointerMove = (e: PointerEvent) => {
      const rect = renderer.domElement.getBoundingClientRect();
      const nx = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      const ny = ((e.clientY - rect.top) / rect.height) * 2 - 1;
      pointerOffsetRef.current.x = THREE.MathUtils.clamp(nx, -1, 1);
      pointerOffsetRef.current.y = THREE.MathUtils.clamp(ny, -1, 1);
    };

    const onCanvasClick = () => {
      jumpImpulseRef.current = 1.0;
      playChime('pop');
    };

    renderer.domElement.addEventListener('pointermove', onPointerMove);
    renderer.domElement.addEventListener('click', onCanvasClick);

    const onResize = () => {
      if (!container) return;
      const w = container.clientWidth || 640;
      const h = container.clientHeight || 520;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener('resize', onResize);

    const clock = new THREE.Clock();
    let elapsed = 0;
    let frameId = 0;
    let disposed = false;

    function afterDraw(cb: () => void) {
      const gl = renderer.getContext() as WebGL2RenderingContext;
      const sync = gl.fenceSync(gl.SYNC_GPU_COMMANDS_COMPLETE, 0);
      gl.flush();
      const poll = () => {
        if (disposed) return;
        const state = sync && gl.getSyncParameter(sync, gl.SYNC_STATUS);
        if (state === gl.UNSIGNALED) {
          frameId = window.setTimeout(poll, 5);
        } else {
          if (sync) gl.deleteSync(sync);
          frameId = window.setTimeout(cb, 80);
        }
      };
      frameId = window.setTimeout(poll, 5);
    }

    function tick() {
      if (disposed) return;
      const rawDelta = Math.min(clock.getDelta(), 0.08);
      if (!motionPausedRef.current) {
        elapsed += rawDelta;
      }

      const hopDecay = Math.max(0, jumpImpulseRef.current);
      if (hopDecay > 0) {
        jumpImpulseRef.current = Math.max(0, jumpImpulseRef.current - rawDelta * 1.9);
      }
      const bounceOffset = Math.sin(hopDecay * Math.PI) * 0.65;

      maya.root.position.y = -0.22 + Math.sin(elapsed * 2.1) * 0.06 + bounceOffset;
      maya.headGroup.rotation.z = Math.sin(elapsed * 1.6) * 0.08;
      maya.headGroup.rotation.y = Math.sin(elapsed * 0.9) * 0.16 + pointerOffsetRef.current.x * 0.22;
      maya.rightArm.rotation.z = 2.35 + Math.sin(elapsed * 5.2) * 0.38;
      maya.leftArm.rotation.z = -0.15 + Math.sin(elapsed * 2.4) * 0.12;
      maya.rocketGroup.position.y = 0.42 + Math.sin(elapsed * 2.7 + 1.1) * 0.18;
      maya.rocketGroup.rotation.z = -0.22 + Math.sin(elapsed * 1.8) * 0.06;

      seedlingGroup.position.y = 0.06 + Math.sin(elapsed * 2.3) * 0.05;
      seedlingGroup.rotation.y = elapsed * 0.6;

      mars.rotation.y = elapsed * 0.12;
      earth.rotation.y = elapsed * 0.18;
      rover.position.y = -0.4 + Math.sin(elapsed * 1.5 + 0.6) * 0.08;
      rover.rotation.y = -0.65 + Math.sin(elapsed * 0.8) * 0.14;

      const activePreset = presetRef.current;
      if (activePreset === 'explorer') {
        _targetPos.set(
          0.35 + pointerOffsetRef.current.x * 0.35,
          1.45 - pointerOffsetRef.current.y * 0.2,
          6.1
        );
        _targetLook.set(0.35, 0.8, -0.3);
      } else if (activePreset === 'maya') {
        _targetPos.set(-0.2 + pointerOffsetRef.current.x * 0.25, 1.35, 3.6);
        _targetLook.set(-0.35, 1.0, 0);
      } else {
        _targetPos.set(1.4 + pointerOffsetRef.current.x * 0.25, 1.7, 3.8);
        _targetLook.set(2.2, 1.4, -2.2);
      }

      const dampAlpha = 1 - Math.exp(-5 * rawDelta);
      camera.position.lerp(_targetPos, dampAlpha);
      _currentLook.lerp(_targetLook, dampAlpha);
      camera.lookAt(_currentLook);

      renderer.render(scene, camera);

      if (isSoftwareGl) afterDraw(tick);
      else frameId = requestAnimationFrame(tick);
    }

    tick();

    return () => {
      disposed = true;
      cancelAnimationFrame(frameId);
      clearTimeout(frameId);
      window.removeEventListener('resize', onResize);
      renderer.domElement.removeEventListener('pointermove', onPointerMove);
      renderer.domElement.removeEventListener('click', onCanvasClick);
      scene.traverse((obj) => {
        if (obj instanceof THREE.Mesh) {
          obj.geometry.dispose();
          if (Array.isArray(obj.material)) obj.material.forEach((m) => m.dispose());
          else obj.material.dispose();
        }
      });
      envTex.dispose();
      renderer.dispose();
      if (renderer.domElement.parentNode === container) {
        container.removeChild(renderer.domElement);
      }
    };
  }, []);

  return (
    <div className="relative w-full h-[460px] sm:h-[520px] lg:h-[560px] rounded-2xl overflow-hidden bg-slate-950/75 border border-white/15">
      {/* Subtle uploaded cosmic Maya background image */}
      <img
        src="/assets/nourish/scenes/scene_01.jpg"
        alt=""
        aria-hidden="true"
        className="absolute inset-0 w-full h-full object-cover opacity-25 pointer-events-none"
      />
      <div ref={mountRef} className="relative z-10 w-full h-full cursor-pointer" aria-label="Interactive 3D Maya and Mars Explorer Scene" />

      <div className="pointer-events-none absolute top-4 left-4 right-4 z-20 flex justify-between items-start gap-3">
        <div className="bg-slate-900/92 border border-white/15 rounded-xl px-4 py-2.5 text-sm text-slate-100 max-w-xs">
          <span className="font-semibold text-lime-300">Maya:</span> {mayaGreeting}
        </div>
      </div>

      <div className="absolute bottom-3 left-1/2 -translate-x-1/2 z-20 w-[94%] max-w-[540px] flex flex-col items-center">
        <button
          type="button"
          onClick={() => setDockCollapsed((c) => !c)}
          className="px-3 py-1 text-xs font-medium text-slate-200 bg-slate-900/95 border border-b-0 border-white/15 rounded-t-lg hover:bg-slate-800 transition-colors whitespace-nowrap"
        >
          {dockCollapsed ? 'Show 3D Controls' : 'Hide 3D Controls'}
        </button>
        {!dockCollapsed && (
          <div className="w-full bg-slate-900/95 border border-white/15 rounded-xl p-2 flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => {
                  playChime('button');
                  setPreset('explorer');
                }}
                className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap ${
                  preset === 'explorer' ? 'bg-lime-300 text-slate-950' : 'text-slate-200 hover:bg-white/10'
                }`}
              >
                Mars View
              </button>
              <button
                type="button"
                onClick={() => {
                  playChime('button');
                  setPreset('maya');
                }}
                className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap ${
                  preset === 'maya' ? 'bg-lime-300 text-slate-950' : 'text-slate-200 hover:bg-white/10'
                }`}
              >
                Meet Maya
              </button>
              <button
                type="button"
                onClick={() => {
                  playChime('button');
                  setPreset('mars');
                }}
                className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap ${
                  preset === 'mars' ? 'bg-lime-300 text-slate-950' : 'text-slate-200 hover:bg-white/10'
                }`}
              >
                Mars &amp; Rover
              </button>
            </div>
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={triggerMayaWave}
                className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-orange-400 text-slate-950 hover:bg-orange-300 transition-colors whitespace-nowrap"
              >
                Wave &amp; Hop
              </button>
              <button
                type="button"
                onClick={() => setMotionPaused((p) => !p)}
                className="px-3 py-1.5 text-xs font-medium rounded-lg border border-white/20 text-slate-200 hover:bg-white/10 transition-colors whitespace-nowrap"
              >
                {motionPaused ? 'Resume' : 'Pause'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
