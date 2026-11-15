import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import type { NasaModelItem } from '../../types/education.ts';
import {
  buildEarthGroup,
  buildMarsGroup,
  buildMarsRoverGroup,
  buildSaturnGroup,
  buildVoyagerProbeGroup,
  detectSoftwareWebGL,
} from './nasaModelBuilders.ts';

interface Nasa3DViewerProps {
  model: NasaModelItem;
  localGlbUrl?: string | null;
}

export function Nasa3DViewer({ model, localGlbUrl }: Nasa3DViewerProps) {
  const mountRef = useRef<HTMLDivElement | null>(null);
  const [loadingStatus, setLoadingStatus] = useState<string>('');
  const [loadError, setLoadError] = useState<string>('');
  const [autoSpin, setAutoSpin] = useState<boolean>(true);
  const autoSpinRef = useRef<boolean>(autoSpin);

  useEffect(() => {
    autoSpinRef.current = autoSpin;
  }, [autoSpin]);

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    const isSoftwareGl = detectSoftwareWebGL();
    const width = container.clientWidth || 640;
    const height = container.clientHeight || 400;

    const renderer = new THREE.WebGLRenderer({
      antialias: !isSoftwareGl,
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
    scene.background = new THREE.Color(0x091124);
    scene.fog = new THREE.FogExp2(0x091124, 0.045);

    const pmrem = new THREE.PMREMGenerator(renderer);
    const envTex = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
    scene.environment = envTex;
    pmrem.dispose();

    const camera = new THREE.PerspectiveCamera(42, width / height, 0.1, 100);
    camera.position.set(2.4, 1.6, 3.4);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = !isSoftwareGl;
    controls.dampingFactor = 0.07;
    controls.minDistance = 1.6;
    controls.maxDistance = 8.5;
    controls.target.set(0, 0.2, 0);

    const hemi = new THREE.HemisphereLight(0x93c5fd, 0x0f172a, 0.9);
    scene.add(hemi);

    const keyLight = new THREE.DirectionalLight(0xfffbeb, 2.2);
    keyLight.position.set(4, 6, 4);
    keyLight.castShadow = !isSoftwareGl;
    scene.add(keyLight);

    const rim = new THREE.DirectionalLight(0x38bdf8, 1.2);
    rim.position.set(-4, 2, -4);
    scene.add(rim);

    // Subtle starfield background
    const starGeo = new THREE.OctahedronGeometry(0.035, 0);
    const starMat = new THREE.MeshBasicMaterial({ color: 0xe2e8f0 });
    const stars = new THREE.InstancedMesh(starGeo, starMat, 80);
    const dummy = new THREE.Object3D();
    for (let i = 0; i < 80; i++) {
      dummy.position.set(((i * 31) % 24) - 12, ((i * 19) % 16) - 8, -4 - (i % 8) * 1.4);
      dummy.updateMatrix();
      stars.setMatrixAt(i, dummy.matrix);
    }
    stars.computeBoundingSphere();
    scene.add(stars);

    const subjectHolder = new THREE.Group();
    scene.add(subjectHolder);

    let mixer: THREE.AnimationMixer | null = null;
    const maxAniso = renderer.capabilities.getMaxAnisotropy();

    setLoadError('');
    setLoadingStatus('');

    const glbSource = localGlbUrl || (model.type === 'custom_glb' ? model.glbUrl : undefined);

    if (glbSource) {
      setLoadingStatus('Loading 3D GLB/glTF model...');
      const loader = new GLTFLoader();
      loader.load(
        glbSource,
        (gltf) => {
          const loaded = gltf.scene;
          const box = new THREE.Box3().setFromObject(loaded);
          const center = box.getCenter(new THREE.Vector3());
          const size = box.getSize(new THREE.Vector3());
          const maxDim = Math.max(size.x, size.y, size.z) || 1;
          loaded.position.sub(center);
          loaded.scale.setScalar(2.4 / maxDim);
          loaded.traverse((child) => {
            if (child instanceof THREE.Mesh) {
              child.castShadow = true;
              child.receiveShadow = true;
            }
          });
          subjectHolder.add(loaded);
          if (gltf.animations.length > 0) {
            mixer = new THREE.AnimationMixer(loaded);
            gltf.animations.forEach((clip) => mixer?.clipAction(clip).play());
          }
          setLoadingStatus('');
        },
        undefined,
        () => {
          setLoadingStatus('');
          setLoadError('Could not parse this GLB/glTF file. Try another standard .glb asset.');
        }
      );
    } else if (model.type === 'earth') {
      subjectHolder.add(buildEarthGroup(maxAniso, 1.28));
      controls.target.set(0, 0, 0);
    } else if (model.type === 'mars') {
      subjectHolder.add(buildMarsGroup(maxAniso, 1.25));
      controls.target.set(0, 0, 0);
    } else if (model.type === 'saturn') {
      subjectHolder.add(buildSaturnGroup(maxAniso, 0.92));
      controls.target.set(0, 0, 0);
    } else if (model.type === 'rover') {
      const r = buildMarsRoverGroup();
      r.position.y = -0.55;
      subjectHolder.add(r);
      controls.target.set(0, 0.25, 0);
    } else {
      const p = buildVoyagerProbeGroup();
      subjectHolder.add(p);
      controls.target.set(0, 0, 0);
    }

    const onResize = () => {
      if (!container) return;
      const w = container.clientWidth || 640;
      const h = container.clientHeight || 400;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener('resize', onResize);

    const clock = new THREE.Clock();
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
      const delta = Math.min(clock.getDelta(), 0.08);
      if (autoSpinRef.current) {
        subjectHolder.rotation.y += delta * 0.35;
      }
      if (mixer) {
        mixer.update(delta);
      }
      controls.update();
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
      controls.dispose();
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
  }, [model, localGlbUrl]);

  return (
    <div className="relative w-full h-[380px] sm:h-[430px] rounded-2xl overflow-hidden bg-[#091124] border border-slate-800">
      <div ref={mountRef} className="w-full h-full cursor-grab active:cursor-grabbing" />
      {loadingStatus && (
        <div className="absolute inset-0 flex items-center justify-center bg-slate-950/75 text-sm font-medium text-white">
          {loadingStatus}
        </div>
      )}
      {loadError && (
        <div className="absolute inset-x-4 top-4 bg-rose-950/90 border border-rose-500/40 text-rose-100 rounded-xl px-4 py-2.5 text-sm">
          {loadError}
        </div>
      )}
      <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between gap-3 pointer-events-none">
        <span className="text-xs text-slate-300 bg-slate-900/90 border border-white/10 rounded-lg px-3 py-1.5">
          Drag to orbit · Scroll to zoom
        </span>
        <button
          type="button"
          onClick={() => setAutoSpin((s) => !s)}
          className="pointer-events-auto text-xs font-semibold text-slate-950 bg-lime-300 hover:bg-lime-200 rounded-lg px-3 py-1.5 transition-colors whitespace-nowrap"
        >
          {autoSpin ? 'Pause Spin' : 'Auto Spin'}
        </button>
      </div>
    </div>
  );
}
