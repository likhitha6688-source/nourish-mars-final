import * as THREE from 'three';

export function detectSoftwareWebGL(): boolean {
  const canvas = document.createElement('canvas');
  const gl = canvas.getContext('webgl2');
  if (!gl) return true;
  const ext = gl.getExtension('WEBGL_debug_renderer_info');
  const param = ext ? ext.UNMASKED_RENDERER_WEBGL : gl.RENDERER;
  const gpu = String(gl.getParameter(param));
  gl.getExtension('WEBGL_lose_context')?.loseContext();
  return /SwiftShader|llvmpipe|softpipe|Software|Basic Render/i.test(gpu);
}

function createEarthTexture(maxAnisotropy: number): { colorMap: THREE.CanvasTexture; cloudMap: THREE.CanvasTexture } {
  const canvas = document.createElement('canvas');
  canvas.width = 1024;
  canvas.height = 512;
  const ctx = canvas.getContext('2d')!;

  const oceanGrad = ctx.createLinearGradient(0, 0, 0, 512);
  oceanGrad.addColorStop(0, '#0ea5e9');
  oceanGrad.addColorStop(0.5, '#0369a1');
  oceanGrad.addColorStop(1, '#0c4a6e');
  ctx.fillStyle = oceanGrad;
  ctx.fillRect(0, 0, 1024, 512);

  // Stylized educational continents
  const landmasses: Array<{ x: number; y: number; rx: number; ry: number; rot: number; color: string }> = [
    { x: 220, y: 170, rx: 95, ry: 68, rot: -0.3, color: '#34d399' },
    { x: 270, y: 310, rx: 52, ry: 85, rot: 0.25, color: '#22c55e' },
    { x: 520, y: 155, rx: 85, ry: 48, rot: 0.1, color: '#4ade80' },
    { x: 540, y: 265, rx: 65, ry: 95, rot: -0.1, color: '#86efac' },
    { x: 720, y: 175, rx: 130, ry: 72, rot: 0.15, color: '#34d399' },
    { x: 820, y: 340, rx: 58, ry: 42, rot: -0.2, color: '#eab308' },
  ];

  landmasses.forEach((l) => {
    ctx.save();
    ctx.translate(l.x, l.y);
    ctx.rotate(l.rot);
    ctx.fillStyle = l.color;
    ctx.beginPath();
    ctx.ellipse(0, 0, l.rx, l.ry, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = 'rgba(254, 240, 138, 0.28)';
    ctx.beginPath();
    ctx.ellipse(l.rx * 0.2, -l.ry * 0.15, l.rx * 0.45, l.ry * 0.4, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  });

  // Polar ice caps
  ctx.fillStyle = '#f8fafc';
  ctx.fillRect(0, 0, 1024, 34);
  ctx.fillRect(0, 476, 1024, 36);

  const colorMap = new THREE.CanvasTexture(canvas);
  colorMap.colorSpace = THREE.SRGBColorSpace;
  colorMap.anisotropy = maxAnisotropy;

  // Cloud layer
  const cloudCanvas = document.createElement('canvas');
  cloudCanvas.width = 512;
  cloudCanvas.height = 256;
  const cCtx = cloudCanvas.getContext('2d')!;
  cCtx.clearRect(0, 0, 512, 256);
  cCtx.fillStyle = 'rgba(255, 255, 255, 0.72)';
  for (let i = 0; i < 48; i++) {
    const cx = ((i * 73) % 490) + 12;
    const cy = 28 + ((i * 41) % 200);
    const rw = 24 + (i % 5) * 14;
    const rh = 9 + (i % 3) * 5;
    cCtx.beginPath();
    cCtx.ellipse(cx, cy, rw, rh, (i % 4) * 0.2, 0, Math.PI * 2);
    cCtx.fill();
  }
  const cloudMap = new THREE.CanvasTexture(cloudCanvas);
  cloudMap.colorSpace = THREE.SRGBColorSpace;
  cloudMap.anisotropy = maxAnisotropy;

  return { colorMap, cloudMap };
}

function createMarsTexture(maxAnisotropy: number): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 256;
  const ctx = canvas.getContext('2d')!;
  const grad = ctx.createLinearGradient(0, 0, 0, 256);
  grad.addColorStop(0, '#f1f5f9');
  grad.addColorStop(0.1, '#d97706');
  grad.addColorStop(0.5, '#c2410c');
  grad.addColorStop(0.9, '#9a3412');
  grad.addColorStop(1, '#e2e8f0');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, 512, 256);

  for (let i = 0; i < 36; i++) {
    const x = (i * 61) % 512;
    const y = 30 + ((i * 37) % 196);
    const r = 6 + (i % 5) * 5;
    ctx.fillStyle = i % 2 === 0 ? 'rgba(124, 45, 18, 0.45)' : 'rgba(251, 146, 60, 0.35)';
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fill();
  }
  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = maxAnisotropy;
  return tex;
}

function createSaturnTextures(maxAnisotropy: number): { bodyMap: THREE.CanvasTexture; ringMap: THREE.CanvasTexture } {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 256;
  const ctx = canvas.getContext('2d')!;
  const bands = ['#fde68a', '#f59e0b', '#fef3c7', '#d97706', '#fcd34d', '#b45309', '#fde68a'];
  bands.forEach((c, idx) => {
    ctx.fillStyle = c;
    ctx.fillRect(0, (idx * 256) / bands.length, 512, 256 / bands.length + 2);
  });
  const bodyMap = new THREE.CanvasTexture(canvas);
  bodyMap.colorSpace = THREE.SRGBColorSpace;
  bodyMap.anisotropy = maxAnisotropy;

  const rCanvas = document.createElement('canvas');
  rCanvas.width = 256;
  rCanvas.height = 32;
  const rCtx = rCanvas.getContext('2d')!;
  const rGrad = rCtx.createLinearGradient(0, 0, 256, 0);
  rGrad.addColorStop(0, 'rgba(254, 243, 199, 0.05)');
  rGrad.addColorStop(0.25, 'rgba(253, 230, 138, 0.85)');
  rGrad.addColorStop(0.48, 'rgba(180, 83, 9, 0.25)');
  rGrad.addColorStop(0.65, 'rgba(251, 191, 36, 0.9)');
  rGrad.addColorStop(0.9, 'rgba(254, 243, 199, 0.55)');
  rGrad.addColorStop(1, 'rgba(254, 243, 199, 0.0)');
  rCtx.fillStyle = rGrad;
  rCtx.fillRect(0, 0, 256, 32);

  const ringMap = new THREE.CanvasTexture(rCanvas);
  ringMap.colorSpace = THREE.SRGBColorSpace;
  return { bodyMap, ringMap };
}

export function buildEarthGroup(maxAnisotropy: number, radius = 1.35): THREE.Group {
  const group = new THREE.Group();
  const { colorMap, cloudMap } = createEarthTexture(maxAnisotropy);

  const planet = new THREE.Mesh(
    new THREE.SphereGeometry(radius, 48, 48),
    new THREE.MeshStandardMaterial({
      map: colorMap,
      roughness: 0.62,
      metalness: 0.06,
    })
  );
  planet.name = 'earthCore';
  planet.castShadow = true;
  planet.receiveShadow = true;
  group.add(planet);

  const clouds = new THREE.Mesh(
    new THREE.SphereGeometry(radius * 1.028, 40, 40),
    new THREE.MeshStandardMaterial({
      map: cloudMap,
      transparent: true,
      opacity: 0.85,
      depthWrite: false,
      roughness: 0.95,
    })
  );
  clouds.name = 'earthClouds';
  group.add(clouds);

  const atmosphere = new THREE.Mesh(
    new THREE.SphereGeometry(radius * 1.075, 36, 36),
    new THREE.MeshBasicMaterial({
      color: 0x38bdf8,
      transparent: true,
      opacity: 0.14,
      side: THREE.BackSide,
      depthWrite: false,
    })
  );
  group.add(atmosphere);

  return group;
}

export function buildMarsGroup(maxAnisotropy: number, radius = 1.25): THREE.Group {
  const group = new THREE.Group();
  const tex = createMarsTexture(maxAnisotropy);
  const mars = new THREE.Mesh(
    new THREE.SphereGeometry(radius, 44, 44),
    new THREE.MeshStandardMaterial({
      map: tex,
      roughness: 0.88,
      metalness: 0.04,
    })
  );
  mars.name = 'planetBody';
  mars.castShadow = true;
  mars.receiveShadow = true;
  group.add(mars);

  // Small orbiting moon Phobos
  const moon = new THREE.Mesh(
    new THREE.DodecahedronGeometry(radius * 0.14, 1),
    new THREE.MeshStandardMaterial({ color: 0x94a3b8, roughness: 0.9, metalness: 0.05 })
  );
  moon.position.set(radius * 1.65, radius * 0.35, 0);
  moon.name = 'orbitingMoon';
  group.add(moon);

  return group;
}

export function buildSaturnGroup(maxAnisotropy: number, radius = 1.05): THREE.Group {
  const group = new THREE.Group();
  const { bodyMap, ringMap } = createSaturnTextures(maxAnisotropy);

  const saturn = new THREE.Mesh(
    new THREE.SphereGeometry(radius, 44, 44),
    new THREE.MeshStandardMaterial({
      map: bodyMap,
      roughness: 0.65,
      metalness: 0.05,
    })
  );
  saturn.name = 'planetBody';
  saturn.castShadow = true;
  saturn.receiveShadow = true;
  group.add(saturn);

  const ringGeo = new THREE.RingGeometry(radius * 1.32, radius * 2.25, 64);
  const pos = ringGeo.attributes.position;
  const uv = ringGeo.attributes.uv;
  const v3 = new THREE.Vector3();
  for (let i = 0; i < pos.count; i++) {
    v3.fromBufferAttribute(pos, i);
    const dist = (v3.length() - radius * 1.32) / (radius * 0.93);
    uv.setXY(i, dist, 0.5);
  }
  const ring = new THREE.Mesh(
    ringGeo,
    new THREE.MeshStandardMaterial({
      map: ringMap,
      transparent: true,
      side: THREE.DoubleSide,
      roughness: 0.75,
      depthWrite: false,
    })
  );
  ring.rotation.x = Math.PI / 2.35;
  ring.rotation.y = 0.25;
  group.add(ring);

  return group;
}

export function buildMarsRoverGroup(): THREE.Group {
  const rover = new THREE.Group();

  const goldFoil = new THREE.MeshStandardMaterial({
    color: 0xf59e0b,
    metalness: 0.9,
    roughness: 0.24,
  });
  const whiteBody = new THREE.MeshStandardMaterial({
    color: 0xf8fafc,
    metalness: 0.15,
    roughness: 0.42,
  });
  const darkMetal = new THREE.MeshStandardMaterial({
    color: 0x334155,
    metalness: 0.78,
    roughness: 0.35,
  });
  const solarMat = new THREE.MeshStandardMaterial({
    color: 0x1d4ed8,
    metalness: 0.55,
    roughness: 0.2,
  });
  const lensMat = new THREE.MeshStandardMaterial({
    color: 0x38bdf8,
    emissive: 0x0284c7,
    emissiveIntensity: 0.65,
    roughness: 0.1,
    metalness: 0.8,
  });

  // Main chassis
  const chassis = new THREE.Mesh(new THREE.BoxGeometry(1.5, 0.52, 1.05), whiteBody);
  chassis.position.y = 0.68;
  chassis.castShadow = true;
  rover.add(chassis);

  // Gold foil belly thermal wrap
  const foil = new THREE.Mesh(new THREE.BoxGeometry(1.36, 0.28, 0.96), goldFoil);
  foil.position.y = 0.46;
  rover.add(foil);

  // Top solar/instrument deck
  const deck = new THREE.Mesh(new THREE.BoxGeometry(1.62, 0.08, 1.28), solarMat);
  deck.position.y = 0.96;
  rover.add(deck);

  // Six rocker-bogie wheels & struts
  const wheelGeo = new THREE.CylinderGeometry(0.24, 0.24, 0.18, 20);
  wheelGeo.rotateX(Math.PI / 2);
  const wheelPositions: Array<[number, number]> = [
    [-0.65, 0.66],
    [0, 0.66],
    [0.65, 0.66],
    [-0.65, -0.66],
    [0, -0.66],
    [0.65, -0.66],
  ];
  wheelPositions.forEach(([wx, wz]) => {
    const wheel = new THREE.Mesh(wheelGeo, darkMetal);
    wheel.position.set(wx, 0.24, wz);
    wheel.castShadow = true;
    rover.add(wheel);

    const strut = new THREE.Mesh(new THREE.BoxGeometry(0.07, 0.4, 0.07), darkMetal);
    strut.position.set(wx, 0.44, wz * 0.85);
    rover.add(strut);
  });

  // MastCam neck + head
  const mast = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.07, 0.72, 14), whiteBody);
  mast.position.set(0.45, 1.32, 0.22);
  rover.add(mast);

  const head = new THREE.Mesh(new THREE.BoxGeometry(0.36, 0.22, 0.28), whiteBody);
  head.position.set(0.45, 1.72, 0.22);
  rover.add(head);

  const eyeL = new THREE.Mesh(new THREE.CylinderGeometry(0.055, 0.055, 0.08, 16), lensMat);
  eyeL.rotation.z = Math.PI / 2;
  eyeL.position.set(0.64, 1.72, 0.15);
  rover.add(eyeL);

  const eyeR = new THREE.Mesh(new THREE.CylinderGeometry(0.055, 0.055, 0.08, 16), lensMat);
  eyeR.rotation.z = Math.PI / 2;
  eyeR.position.set(0.64, 1.72, 0.29);
  rover.add(eyeR);

  // High-gain parabolic dish
  const dishPoints = [
    new THREE.Vector2(0.01, 0),
    new THREE.Vector2(0.16, 0.03),
    new THREE.Vector2(0.28, 0.11),
  ];
  const dish = new THREE.Mesh(new THREE.LatheGeometry(dishPoints, 24), whiteBody);
  dish.position.set(-0.48, 1.18, -0.2);
  dish.rotation.z = 0.45;
  rover.add(dish);

  // Robotic sample arm
  const armBase = new THREE.Mesh(new THREE.BoxGeometry(0.35, 0.08, 0.08), darkMetal);
  armBase.position.set(0.92, 0.7, 0);
  armBase.rotation.z = -0.35;
  rover.add(armBase);

  const sampleTurret = new THREE.Mesh(new THREE.CylinderGeometry(0.11, 0.11, 0.14, 12), goldFoil);
  sampleTurret.position.set(1.12, 0.58, 0);
  rover.add(sampleTurret);

  return rover;
}

export function buildVoyagerProbeGroup(): THREE.Group {
  const probe = new THREE.Group();

  const dishWhite = new THREE.MeshStandardMaterial({ color: 0xf8fafc, roughness: 0.35, metalness: 0.1 });
  const goldFoil = new THREE.MeshStandardMaterial({ color: 0xfbbf24, metalness: 0.92, roughness: 0.2 });
  const darkStrut = new THREE.MeshStandardMaterial({ color: 0x475569, metalness: 0.75, roughness: 0.35 });

  // Parabolic dish via LatheGeometry
  const dishProfile = [
    new THREE.Vector2(0.01, 0),
    new THREE.Vector2(0.45, 0.08),
    new THREE.Vector2(0.85, 0.24),
    new THREE.Vector2(1.05, 0.38),
  ];
  const dish = new THREE.Mesh(new THREE.LatheGeometry(dishProfile, 36), dishWhite);
  dish.material.side = THREE.DoubleSide;
  dish.rotation.x = Math.PI / 2;
  probe.add(dish);

  // Decagonal bus behind dish
  const bus = new THREE.Mesh(new THREE.CylinderGeometry(0.48, 0.48, 0.36, 10), goldFoil);
  bus.rotation.x = Math.PI / 2;
  bus.position.z = -0.24;
  probe.add(bus);

  // Golden Record plaque
  const record = new THREE.Mesh(
    new THREE.CylinderGeometry(0.16, 0.16, 0.04, 24),
    new THREE.MeshStandardMaterial({ color: 0xfde047, metalness: 0.96, roughness: 0.12 })
  );
  record.position.set(0.42, 0.18, -0.24);
  record.rotation.z = Math.PI / 2;
  probe.add(record);

  // Receiver horn tripod in front of dish
  const receiver = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.1, 0.18, 12), darkStrut);
  receiver.rotation.x = Math.PI / 2;
  receiver.position.z = 0.65;
  probe.add(receiver);

  // Magnetometer long boom
  const boom = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.04, 2.1, 8), darkStrut);
  boom.rotation.z = Math.PI / 2;
  boom.position.set(-1.3, 0, -0.2);
  probe.add(boom);

  // RTG power arm
  const rtgArm = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.06, 0.9, 10), darkStrut);
  rtgArm.rotation.z = -Math.PI / 3;
  rtgArm.position.set(0.75, -0.45, -0.22);
  probe.add(rtgArm);

  return probe;
}

/**
 * Original 3D Little Girl Mascot ("Maya") + Mini Explorer Rocket!
 * Built as a 16+ part hierarchical THREE.Group for smooth homepage animations.
 */
export function buildMayaMascotGroup(): {
  root: THREE.Group;
  leftArm: THREE.Group;
  rightArm: THREE.Group;
  headGroup: THREE.Group;
  rocketGroup: THREE.Group;
} {
  const root = new THREE.Group();

  const skinMat = new THREE.MeshStandardMaterial({ color: 0x8d5524, roughness: 0.62, metalness: 0.04 });
  const cheekMat = new THREE.MeshStandardMaterial({ color: 0xfb7185, roughness: 0.7 });
  const hairMat = new THREE.MeshStandardMaterial({ color: 0x291c16, roughness: 0.85, metalness: 0.05 });
  const limeMat = new THREE.MeshStandardMaterial({ color: 0xc7f234, roughness: 0.42, metalness: 0.08 });
  const navyMat = new THREE.MeshStandardMaterial({ color: 0x1e3a8a, roughness: 0.5, metalness: 0.1 });
  const skyMat = new THREE.MeshStandardMaterial({ color: 0x38bdf8, roughness: 0.4, metalness: 0.15 });
  const bootMat = new THREE.MeshStandardMaterial({ color: 0xf97316, roughness: 0.55, metalness: 0.05 });
  const whiteMat = new THREE.MeshStandardMaterial({ color: 0xf8fafc, roughness: 0.3, metalness: 0.1 });
  const eyeMat = new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.15, metalness: 0.2 });

  // Explorer character group (stands happily in/beside rocket or center)
  const girl = new THREE.Group();
  girl.position.set(0, 0.15, 0.05);
  root.add(girl);

  // Legs & Boots
  const legGeo = new THREE.CylinderGeometry(0.11, 0.1, 0.42, 16);
  const legL = new THREE.Mesh(legGeo, navyMat);
  legL.position.set(-0.18, 0.32, 0);
  girl.add(legL);

  const legR = new THREE.Mesh(legGeo, navyMat);
  legR.position.set(0.18, 0.32, 0);
  girl.add(legR);

  const bootGeo = new THREE.CapsuleGeometry(0.12, 0.12, 8, 12);
  const bootL = new THREE.Mesh(bootGeo, bootMat);
  bootL.rotation.x = Math.PI / 2;
  bootL.position.set(-0.18, 0.12, 0.05);
  girl.add(bootL);

  const bootR = new THREE.Mesh(bootGeo, bootMat);
  bootR.rotation.x = Math.PI / 2;
  bootR.position.set(0.18, 0.12, 0.05);
  girl.add(bootR);

  // Torso (Navy & Lime Explorer Jacket)
  const torso = new THREE.Mesh(new THREE.CylinderGeometry(0.28, 0.34, 0.66, 20), navyMat);
  torso.position.y = 0.82;
  torso.castShadow = true;
  girl.add(torso);

  const yoke = new THREE.Mesh(new THREE.CylinderGeometry(0.29, 0.31, 0.24, 20), limeMat);
  yoke.position.y = 1.02;
  girl.add(yoke);

  // Glowing star patch on chest
  const starBadge = new THREE.Mesh(
    new THREE.OctahedronGeometry(0.11, 0),
    new THREE.MeshStandardMaterial({ color: 0xfef08a, emissive: 0xfacc15, emissiveIntensity: 0.45, roughness: 0.25 })
  );
  starBadge.scale.set(1, 1, 0.35);
  starBadge.position.set(0, 0.92, 0.3);
  girl.add(starBadge);

  // Explorer Backpack
  const pack = new THREE.Mesh(new THREE.BoxGeometry(0.42, 0.46, 0.24), skyMat);
  pack.position.set(0, 0.86, -0.34);
  girl.add(pack);

  const antenna = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.02, 0.35, 8), whiteMat);
  antenna.position.set(0.14, 1.24, -0.34);
  girl.add(antenna);

  const antennaTip = new THREE.Mesh(new THREE.SphereGeometry(0.05, 12, 12), limeMat);
  antennaTip.position.set(0.14, 1.42, -0.34);
  girl.add(antennaTip);

  // Articulated Arms
  const leftArm = new THREE.Group();
  leftArm.position.set(-0.34, 1.06, 0);
  const armLMesh = new THREE.Mesh(new THREE.CapsuleGeometry(0.09, 0.34, 8, 12), limeMat);
  armLMesh.position.y = -0.2;
  armLMesh.rotation.z = 0.22;
  leftArm.add(armLMesh);
  const handL = new THREE.Mesh(new THREE.SphereGeometry(0.1, 12, 12), skinMat);
  handL.position.set(-0.08, -0.42, 0);
  leftArm.add(handL);
  girl.add(leftArm);

  const rightArm = new THREE.Group();
  rightArm.position.set(0.34, 1.06, 0);
  const armRMesh = new THREE.Mesh(new THREE.CapsuleGeometry(0.09, 0.34, 8, 12), limeMat);
  armRMesh.position.y = -0.2;
  armRMesh.rotation.z = -0.22;
  rightArm.add(armRMesh);
  const handR = new THREE.Mesh(new THREE.SphereGeometry(0.1, 12, 12), skinMat);
  handR.position.set(0.08, -0.42, 0);
  rightArm.add(handR);
  girl.add(rightArm);

  // Head Group
  const headGroup = new THREE.Group();
  headGroup.position.set(0, 1.48, 0.02);
  girl.add(headGroup);

  const head = new THREE.Mesh(new THREE.SphereGeometry(0.4, 28, 28), skinMat);
  head.castShadow = true;
  headGroup.add(head);

  // Hair cap & twin curly puffs
  const hairCap = new THREE.Mesh(
    new THREE.SphereGeometry(0.415, 24, 24, 0, Math.PI * 2, 0, Math.PI * 0.56),
    hairMat
  );
  hairCap.rotation.x = -0.25;
  headGroup.add(hairCap);

  const puffL = new THREE.Mesh(new THREE.SphereGeometry(0.24, 18, 18), hairMat);
  puffL.position.set(-0.4, 0.28, -0.05);
  headGroup.add(puffL);

  const puffR = new THREE.Mesh(new THREE.SphereGeometry(0.24, 18, 18), hairMat);
  puffR.position.set(0.4, 0.28, -0.05);
  headGroup.add(puffR);

  // Hairbands
  const bandGeo = new THREE.TorusGeometry(0.14, 0.035, 10, 20);
  const bandL = new THREE.Mesh(bandGeo, limeMat);
  bandL.position.set(-0.29, 0.21, -0.04);
  bandL.rotation.y = Math.PI / 2;
  bandL.rotation.x = 0.5;
  headGroup.add(bandL);

  const bandR = new THREE.Mesh(bandGeo, limeMat);
  bandR.position.set(0.29, 0.21, -0.04);
  bandR.rotation.y = Math.PI / 2;
  bandR.rotation.x = -0.5;
  headGroup.add(bandR);

  // Eyes + Sparkle Catchlights
  const eyeGeo = new THREE.SphereGeometry(0.068, 16, 16);
  const eyeL = new THREE.Mesh(eyeGeo, eyeMat);
  eyeL.position.set(-0.14, 0.03, 0.35);
  headGroup.add(eyeL);

  const eyeR = new THREE.Mesh(eyeGeo, eyeMat);
  eyeR.position.set(0.14, 0.03, 0.35);
  headGroup.add(eyeR);

  const catchGeo = new THREE.SphereGeometry(0.022, 10, 10);
  const catchL = new THREE.Mesh(catchGeo, whiteMat);
  catchL.position.set(-0.12, 0.055, 0.405);
  headGroup.add(catchL);

  const catchR = new THREE.Mesh(catchGeo, whiteMat);
  catchR.position.set(0.16, 0.055, 0.405);
  headGroup.add(catchR);

  // Rosy cheeks & Cheerful smile
  const cheekGeo = new THREE.SphereGeometry(0.065, 12, 12);
  const cheekL = new THREE.Mesh(cheekGeo, cheekMat);
  cheekL.scale.set(1.2, 0.75, 0.5);
  cheekL.position.set(-0.24, -0.06, 0.32);
  headGroup.add(cheekL);

  const cheekR = new THREE.Mesh(cheekGeo, cheekMat);
  cheekR.scale.set(1.2, 0.75, 0.5);
  cheekR.position.set(0.24, -0.06, 0.32);
  headGroup.add(cheekR);

  const smile = new THREE.Mesh(
    new THREE.TorusGeometry(0.09, 0.02, 10, 20, Math.PI),
    whiteMat
  );
  smile.position.set(0, -0.1, 0.365);
  smile.rotation.z = Math.PI;
  headGroup.add(smile);

  // Playful Explorer Cardboard-and-Steel Mini Rocket beside/under Maya
  const rocketGroup = new THREE.Group();
  rocketGroup.position.set(1.28, 0.35, -0.35);
  rocketGroup.rotation.z = -0.22;
  rocketGroup.rotation.y = -0.35;
  root.add(rocketGroup);

  const hullMat = new THREE.MeshStandardMaterial({ color: 0xd97706, roughness: 0.78, metalness: 0.05 });
  const noseMat = new THREE.MeshStandardMaterial({ color: 0x38bdf8, roughness: 0.35, metalness: 0.15 });
  const finMat = new THREE.MeshStandardMaterial({ color: 0xfb7185, roughness: 0.5, metalness: 0.1 });

  const rocketBody = new THREE.Mesh(new THREE.CylinderGeometry(0.42, 0.46, 1.25, 24), hullMat);
  rocketGroup.add(rocketBody);

  const rocketNose = new THREE.Mesh(new THREE.ConeGeometry(0.43, 0.65, 24), noseMat);
  rocketNose.position.y = 0.95;
  rocketGroup.add(rocketNose);

  const porthole = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.18, 0.1, 20), limeMat);
  porthole.rotation.x = Math.PI / 2;
  porthole.position.set(0, 0.2, 0.42);
  rocketGroup.add(porthole);

  for (let i = 0; i < 3; i++) {
    const fin = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.42, 0.32), finMat);
    const angle = (i * Math.PI * 2) / 3;
    fin.position.set(Math.cos(angle) * 0.45, -0.45, Math.sin(angle) * 0.45);
    fin.rotation.y = -angle;
    rocketGroup.add(fin);
  }

  const flame = new THREE.Mesh(
    new THREE.ConeGeometry(0.24, 0.55, 16),
    new THREE.MeshStandardMaterial({ color: 0xfacc15, emissive: 0xf97316, emissiveIntensity: 0.85, roughness: 0.3 })
  );
  flame.rotation.x = Math.PI;
  flame.position.y = -0.88;
  flame.name = 'rocketFlame';
  rocketGroup.add(flame);

  return { root, leftArm, rightArm, headGroup, rocketGroup };
}
