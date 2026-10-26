/**
 * Payroll3D - Interactive 3D Workstation & Financial Visualizer
 * Tugas 3: Algoritma dan Pemrograman (Operator, IF, dan Array)
 * Built with Three.js Vanilla (Zero Node.js dependency)
 */

(function () {
  'use strict';

  // State
  let scene, camera, renderer, controls;
  let container;
  let monitorScreenMesh, monitorCanvas, monitorCtx, monitorTexture;
  let idBadgeMesh, idBadgeCanvas, idBadgeCtx, idBadgeTexture;
  let hologramMesh, hologramCanvas, hologramCtx, hologramTexture;
  let moneyGroup;
  let coinParticles = [];
  let steamParticles;
  let clock;
  let autoRotate = false;
  let currentGrade = 'A';
  let isCalculating = false;

  const GRADE_CONFIG = {
    A: { name: 'Golongan A', salary: 5000000, color: '#38bdf8', hex: 0x38bdf8, index: 0 },
    B: { name: 'Golongan B', salary: 6500000, color: '#34d399', hex: 0x34d399, index: 1 },
    C: { name: 'Golongan C', salary: 9500000, color: '#c084fc', hex: 0xc084fc, index: 2 }
  };

  function init() {
    container = document.getElementById('canvas3d-container');
    if (!container || !window.THREE) {
      console.warn('Canvas container or THREE.js not available yet.');
      return;
    }

    clock = new THREE.Clock();

    // 1. Scene
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x0b1120);
    scene.fog = new THREE.FogExp2(0x0b1120, 0.045);

    // 2. Camera
    const aspect = container.clientWidth / container.clientHeight;
    camera = new THREE.PerspectiveCamera(40, aspect, 0.1, 100);
    camera.position.set(7.5, 6.2, 9.5);

    // 3. Renderer
    renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' });
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.15;
    container.appendChild(renderer.domElement);

    // 4. Controls
    if (window.THREE.OrbitControls) {
      controls = new THREE.OrbitControls(camera, renderer.domElement);
      controls.enableDamping = true;
      controls.dampingFactor = 0.06;
      controls.target.set(0, 1.2, 0);
      controls.maxPolarAngle = Math.PI / 2 - 0.05; // Don't go below floor
      controls.minDistance = 4;
      controls.maxDistance = 18;
    }

    // 5. Lights
    setupLights();

    // 6. Environment & Props
    buildEnvironment();
    buildDesk();
    buildComputer();
    buildIdBadge();
    buildHologramSlip();
    buildMoneyGroup();
    buildSteamParticles();

    // 7. Event Listeners
    window.addEventListener('resize', onWindowResize);

    // Initial render states
    updateMonitor('READY', 'Sistem Siap Digunakan');
    updateIdBadge('A', 5000000);
    updateHologramSlip({
      golongan: 'A',
      gajiPokok: 5000000,
      jamLembur: 0,
      persenLembur: 0,
      gajiLembur: 0,
      totalPenghasilan: 5000000,
      initial: true
    });

    animate();
  }

  // --- LIGHTS ---
  function setupLights() {
    // Ambient soft blue
    const ambientLight = new THREE.AmbientLight(0x1e293b, 1.2);
    scene.add(ambientLight);

    // Main Key Light (Warm daylight)
    const keyLight = new THREE.DirectionalLight(0xfff7ed, 1.6);
    keyLight.position.set(6, 10, 6);
    keyLight.castShadow = true;
    keyLight.shadow.mapSize.width = 1024;
    keyLight.shadow.mapSize.height = 1024;
    keyLight.shadow.camera.near = 0.5;
    keyLight.shadow.camera.far = 30;
    keyLight.shadow.camera.left = -5;
    keyLight.shadow.camera.right = 5;
    keyLight.shadow.camera.top = 5;
    keyLight.shadow.camera.bottom = -5;
    keyLight.shadow.bias = -0.0005;
    scene.add(keyLight);

    // Cyan Rim / Cyber Accent Light
    const rimLight = new THREE.PointLight(0x38bdf8, 2.0, 12);
    rimLight.position.set(-5, 4, -3);
    scene.add(rimLight);

    // Warm Desk Lamp Spot
    const deskSpot = new THREE.SpotLight(0xfef08a, 2.5, 8, Math.PI / 4, 0.4, 1);
    deskSpot.position.set(-2, 3.5, 0.8);
    deskSpot.target.position.set(0, 1.2, 0.5);
    deskSpot.castShadow = true;
    scene.add(deskSpot);
    scene.add(deskSpot.target);

    // Emerald Base Light under hologram
    const holoLight = new THREE.PointLight(0x10b981, 1.5, 6);
    holoLight.position.set(1.5, 2.2, 0.8);
    scene.add(holoLight);
  }

  // --- ENVIRONMENT (Platform & Grid) ---
  function buildEnvironment() {
    // Floating Hexagonal/Circular Base
    const baseGeo = new THREE.CylinderGeometry(5.2, 5.5, 0.4, 48);
    const baseMat = new THREE.MeshStandardMaterial({
      color: 0x0f172a,
      roughness: 0.6,
      metalness: 0.2
    });
    const baseMesh = new THREE.Mesh(baseGeo, baseMat);
    baseMesh.position.y = -0.2;
    baseMesh.receiveShadow = true;
    scene.add(baseMesh);

    // Glowing Neon Ring around platform
    const ringGeo = new THREE.TorusGeometry(5.3, 0.04, 16, 64);
    const ringMat = new THREE.MeshBasicMaterial({ color: 0x38bdf8 });
    const ringMesh = new THREE.Mesh(ringGeo, ringMat);
    ringMesh.rotation.x = Math.PI / 2;
    ringMesh.position.y = 0.01;
    scene.add(ringMesh);

    // Cyber Grid Floor
    const grid = new THREE.GridHelper(10, 20, 0x38bdf8, 0x1e293b);
    grid.position.y = 0.02;
    scene.add(grid);
  }

  // --- DESK & OFFICE FURNITURE ---
  function buildDesk() {
    const deskGroup = new THREE.Group();

    // Tabletop (Rich Walnut Wood Finish)
    const topGeo = new THREE.BoxGeometry(4.4, 0.15, 2.4);
    const topMat = new THREE.MeshStandardMaterial({
      color: 0x1e1e24,
      roughness: 0.35,
      metalness: 0.1
    });
    const topMesh = new THREE.Mesh(topGeo, topMat);
    topMesh.position.y = 1.35;
    topMesh.castShadow = true;
    topMesh.receiveShadow = true;
    deskGroup.add(topMesh);

    // Desk Mat / Mousepad
    const matGeo = new THREE.BoxGeometry(2.6, 0.01, 1.4);
    const matMat = new THREE.MeshStandardMaterial({
      color: 0x090d16,
      roughness: 0.8
    });
    const matMesh = new THREE.Mesh(matGeo, matMat);
    matMesh.position.set(-0.2, 1.43, 0.15);
    matMesh.receiveShadow = true;
    deskGroup.add(matMesh);

    // Metal Legs & Frame
    const legGeo = new THREE.CylinderGeometry(0.06, 0.06, 1.35, 16);
    const legMat = new THREE.MeshStandardMaterial({
      color: 0x334155,
      metalness: 0.8,
      roughness: 0.3
    });

    const legPositions = [
      [-2.0, 0.675, -1.0],
      [2.0, 0.675, -1.0],
      [-2.0, 0.675, 1.0],
      [2.0, 0.675, 1.0]
    ];

    legPositions.forEach(pos => {
      const leg = new THREE.Mesh(legGeo, legMat);
      leg.position.set(...pos);
      leg.castShadow = true;
      deskGroup.add(leg);
    });

    // Crossbar footer
    const barGeo = new THREE.BoxGeometry(4.0, 0.05, 0.05);
    const bar = new THREE.Mesh(barGeo, legMat);
    bar.position.set(0, 0.3, -1.0);
    deskGroup.add(bar);

    // Desk Lamp
    const lampGroup = new THREE.Group();
    const lampBase = new THREE.Mesh(
      new THREE.CylinderGeometry(0.18, 0.2, 0.04, 16),
      legMat
    );
    lampBase.position.set(-1.8, 1.45, 0.8);
    lampGroup.add(lampBase);

    const lampArm = new THREE.Mesh(
      new THREE.CylinderGeometry(0.02, 0.02, 0.8, 8),
      legMat
    );
    lampArm.position.set(-1.8, 1.85, 0.8);
    lampArm.rotation.z = -0.25;
    lampGroup.add(lampArm);

    const lampHead = new THREE.Mesh(
      new THREE.ConeGeometry(0.18, 0.25, 16, 1, true),
      new THREE.MeshStandardMaterial({ color: 0xf59e0b, roughness: 0.3, metalness: 0.4 })
    );
    lampHead.position.set(-1.6, 2.2, 0.8);
    lampHead.rotation.z = Math.PI * 0.75;
    lampGroup.add(lampHead);

    deskGroup.add(lampGroup);

    // Ceramic Coffee Mug
    const mugGeo = new THREE.CylinderGeometry(0.09, 0.08, 0.2, 16);
    const mugMat = new THREE.MeshStandardMaterial({ color: 0xe2e8f0, roughness: 0.2 });
    const mugMesh = new THREE.Mesh(mugGeo, mugMat);
    mugMesh.position.set(-1.6, 1.52, -0.6);
    mugMesh.castShadow = true;
    deskGroup.add(mugMesh);

    // Coffee Liquid
    const coffeeGeo = new THREE.CylinderGeometry(0.08, 0.08, 0.02, 16);
    const coffeeMat = new THREE.MeshStandardMaterial({ color: 0x3d2314, roughness: 0.1 });
    const coffeeMesh = new THREE.Mesh(coffeeGeo, coffeeMat);
    coffeeMesh.position.set(-1.6, 1.6, -0.6);
    deskGroup.add(coffeeMesh);

    // Succulent Pot
    const potGeo = new THREE.CylinderGeometry(0.14, 0.1, 0.18, 16);
    const potMat = new THREE.MeshStandardMaterial({ color: 0x64748b, roughness: 0.8 });
    const potMesh = new THREE.Mesh(potGeo, potMat);
    potMesh.position.set(1.9, 1.52, -0.8);
    potMesh.castShadow = true;
    deskGroup.add(potMesh);

    const plantGeo = new THREE.DodecahedronGeometry(0.12, 1);
    const plantMat = new THREE.MeshStandardMaterial({ color: 0x10b981, roughness: 0.5 });
    const plantMesh = new THREE.Mesh(plantGeo, plantMat);
    plantMesh.position.set(1.9, 1.68, -0.8);
    plantMesh.scale.set(1, 1.2, 1);
    deskGroup.add(plantMesh);

    scene.add(deskGroup);
  }

  // --- COMPUTER WORKSTATION ---
  function buildComputer() {
    const pcGroup = new THREE.Group();

    // Curved Monitor Stand Base
    const standBaseGeo = new THREE.CylinderGeometry(0.24, 0.28, 0.03, 24);
    const metalMat = new THREE.MeshStandardMaterial({ color: 0x94a3b8, metalness: 0.8, roughness: 0.2 });
    const standBase = new THREE.Mesh(standBaseGeo, metalMat);
    standBase.position.set(-0.2, 1.44, -0.6);
    standBase.receiveShadow = true;
    pcGroup.add(standBase);

    // Stand Stem
    const standStemGeo = new THREE.BoxGeometry(0.06, 0.55, 0.06);
    const standStem = new THREE.Mesh(standStemGeo, metalMat);
    standStem.position.set(-0.2, 1.72, -0.65);
    standStem.castShadow = true;
    pcGroup.add(standStem);

    // Monitor Bezel Frame
    const bezelGeo = new THREE.BoxGeometry(2.1, 1.15, 0.08);
    const bezelMat = new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.4 });
    const bezel = new THREE.Mesh(bezelGeo, bezelMat);
    bezel.position.set(-0.2, 2.05, -0.6);
    bezel.castShadow = true;
    pcGroup.add(bezel);

    // Dynamic Canvas for Monitor Display
    monitorCanvas = document.createElement('canvas');
    monitorCanvas.width = 1024;
    monitorCanvas.height = 512;
    monitorCtx = monitorCanvas.getContext('2d');
    monitorTexture = new THREE.CanvasTexture(monitorCanvas);

    const screenGeo = new THREE.PlaneGeometry(2.0, 1.05);
    const screenMat = new THREE.MeshBasicMaterial({ map: monitorTexture });
    monitorScreenMesh = new THREE.Mesh(screenGeo, screenMat);
    monitorScreenMesh.position.set(-0.2, 2.05, -0.555);
    pcGroup.add(monitorScreenMesh);

    // Mechanical Keyboard
    const kbGeo = new THREE.BoxGeometry(1.2, 0.04, 0.42);
    const kbMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.5 });
    const keyboard = new THREE.Mesh(kbGeo, kbMat);
    keyboard.position.set(-0.4, 1.45, 0.2);
    keyboard.receiveShadow = true;
    keyboard.castShadow = true;
    pcGroup.add(keyboard);

    // Glowing Keycaps Strip
    const keycapsGeo = new THREE.BoxGeometry(1.1, 0.02, 0.35);
    const keycapsMat = new THREE.MeshStandardMaterial({
      color: 0x0ea5e9,
      emissive: 0x0ea5e9,
      emissiveIntensity: 0.35
    });
    const keycaps = new THREE.Mesh(keycapsGeo, keycapsMat);
    keycaps.position.set(-0.4, 1.48, 0.2);
    pcGroup.add(keycaps);

    // Ergonomic Mouse
    const mouseGeo = new THREE.BoxGeometry(0.14, 0.05, 0.22);
    const mouseMat = new THREE.MeshStandardMaterial({ color: 0x334155, roughness: 0.3 });
    const mouse = new THREE.Mesh(mouseGeo, mouseMat);
    mouse.position.set(0.55, 1.45, 0.22);
    mouse.castShadow = true;
    pcGroup.add(mouse);

    scene.add(pcGroup);
  }

  // --- DYNAMIC 2D CANVAS RENDERERS FOR TEXTURES ---
  function updateMonitor(status, detail) {
    if (!monitorCtx) return;

    const ctx = monitorCtx;
    const w = 1024;
    const h = 512;

    // Background Gradient (Fintech terminal dark)
    const grad = ctx.createLinearGradient(0, 0, w, h);
    grad.addColorStop(0, '#090d16');
    grad.addColorStop(1, '#0f172a');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, w, h);

    // Subtle Grid pattern
    ctx.strokeStyle = 'rgba(56, 189, 248, 0.08)';
    ctx.lineWidth = 1;
    for (let x = 0; x < w; x += 40) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, h);
      ctx.stroke();
    }
    for (let y = 0; y < h; y += 40) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(w, y);
      ctx.stroke();
    }

    // Top Navigation Bar
    ctx.fillStyle = '#1e293b';
    ctx.fillRect(0, 0, w, 60);

    ctx.fillStyle = '#38bdf8';
    ctx.font = 'bold 22px "Courier New", monospace';
    ctx.fillText('⚡ PAYROLL CALC ENGINE // TUGAS 3 ALGO & PEMROGRAMAN', 28, 38);

    // Live Clock & Status Pill
    const isSuccess = status === 'SUCCESS';
    const pillColor = isSuccess ? '#10b981' : (status === 'CALCULATING' ? '#f59e0b' : '#38bdf8');
    ctx.fillStyle = pillColor;
    ctx.beginPath();
    ctx.arc(w - 180, 32, 7, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#f8fafc';
    ctx.font = 'bold 18px "Courier New", monospace';
    ctx.fillText(status, w - 160, 38);

    // Main Status Box
    ctx.fillStyle = 'rgba(30, 41, 59, 0.7)';
    ctx.strokeStyle = pillColor;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.roundRect(30, 90, w - 60, 160, 12);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = '#94a3b8';
    ctx.font = '18px "Segoe UI", sans-serif';
    ctx.fillText('STATUS SISTEM PERHITUNGAN:', 55, 130);

    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 32px "Segoe UI", sans-serif';
    ctx.fillText(detail || 'Menunggu input dari formulir web...', 55, 175);

    // Array Memory State Indicators
    ctx.fillStyle = '#64748b';
    ctx.font = '16px "Courier New", monospace';
    ctx.fillText('ARRAY MEMORY TABLE:', 30, 290);

    // Card 1: Array Gaji
    drawArrayCard(ctx, 30, 310, 460, 160, 'ARRAY_GAJI [double]', [
      'Indeks 0: Rp 5.000.000 (Gol A)',
      'Indeks 1: Rp 6.500.000 (Gol B)',
      'Indeks 2: Rp 9.500.000 (Gol C)'
    ], currentGrade === 'A' ? 0 : (currentGrade === 'B' ? 1 : 2));

    // Card 2: Array Lembur
    drawArrayCard(ctx, 534, 310, 460, 160, 'ARRAY_LEMBUR [double]', [
      'Idx 0: 30% (1j)  |  Idx 1: 32% (2j)',
      'Idx 2: 34% (3j)  |  Idx 3: 36% (4j)',
      'Idx 4: 38% (≥5j) |  Default: 0%'
    ], -1);

    monitorTexture.needsUpdate = true;
  }

  function drawArrayCard(ctx, x, y, w, h, title, lines, activeIdx) {
    ctx.fillStyle = 'rgba(15, 23, 42, 0.85)';
    ctx.strokeStyle = 'rgba(148, 163, 184, 0.2)';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.roundRect(x, y, w, h, 8);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = '#38bdf8';
    ctx.font = 'bold 16px "Courier New", monospace';
    ctx.fillText(title, x + 20, y + 30);

    ctx.font = '15px "Courier New", monospace';
    lines.forEach((line, i) => {
      if (i === activeIdx) {
        ctx.fillStyle = '#fef08a';
        ctx.fillText('▶ ' + line, x + 20, y + 65 + i * 28);
      } else {
        ctx.fillStyle = '#94a3b8';
        ctx.fillText('  ' + line, x + 20, y + 65 + i * 28);
      }
    });
  }

  // --- INTERACTIVE ID BADGE (Golongan Karyawan) ---
  function buildIdBadge() {
    const badgeGroup = new THREE.Group();
    badgeGroup.name = 'idBadgeGroup';

    // Metal Acrylic Stand
    const standGeo = new THREE.CylinderGeometry(0.18, 0.22, 0.04, 20);
    const standMat = new THREE.MeshStandardMaterial({ color: 0x475569, metalness: 0.9, roughness: 0.2 });
    const stand = new THREE.Mesh(standGeo, standMat);
    stand.position.set(-1.4, 1.44, 0.4);
    badgeGroup.add(stand);

    // ID Card Geometry
    const cardGeo = new THREE.BoxGeometry(0.55, 0.85, 0.02);
    idBadgeCanvas = document.createElement('canvas');
    idBadgeCanvas.width = 512;
    idBadgeCanvas.height = 768;
    idBadgeCtx = idBadgeCanvas.getContext('2d');
    idBadgeTexture = new THREE.CanvasTexture(idBadgeCanvas);

    const cardMat = new THREE.MeshStandardMaterial({
      map: idBadgeTexture,
      roughness: 0.25,
      metalness: 0.1
    });

    idBadgeMesh = new THREE.Mesh(cardGeo, cardMat);
    idBadgeMesh.position.set(-1.4, 1.88, 0.4);
    idBadgeMesh.rotation.y = 0.35;
    idBadgeMesh.castShadow = true;
    badgeGroup.add(idBadgeMesh);

    scene.add(badgeGroup);
  }

  function updateIdBadge(grade, salary) {
    if (!idBadgeCtx) return;
    const ctx = idBadgeCtx;
    const w = 512;
    const h = 768;
    const cfg = GRADE_CONFIG[grade] || GRADE_CONFIG['A'];

    // Lanyard ID card background
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(0, 0, w, h);

    // Accent header banner
    ctx.fillStyle = cfg.color;
    ctx.fillRect(0, 0, w, 150);

    // ID Clip slot hole
    ctx.fillStyle = '#090d16';
    ctx.beginPath();
    ctx.roundRect(w / 2 - 40, 20, 80, 16, 8);
    ctx.fill();

    ctx.fillStyle = '#090d16';
    ctx.font = 'bold 28px "Segoe UI", sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('EMPLOYEE BADGE', w / 2, 95);
    ctx.font = '18px "Courier New", monospace';
    ctx.fillText('ALGO CORP // TUGAS 3', w / 2, 125);

    // Avatar Icon Circle
    ctx.fillStyle = '#1e293b';
    ctx.beginPath();
    ctx.arc(w / 2, 270, 85, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = cfg.color;
    ctx.lineWidth = 6;
    ctx.stroke();

    // Grade Letter Big
    ctx.fillStyle = cfg.color;
    ctx.font = 'bold 95px "Segoe UI", sans-serif';
    ctx.fillText(grade, w / 2, 305);

    // Employee Title
    ctx.fillStyle = '#f8fafc';
    ctx.font = 'bold 32px "Segoe UI", sans-serif';
    ctx.fillText(cfg.name, w / 2, 400);

    ctx.fillStyle = '#94a3b8';
    ctx.font = '22px "Courier New", monospace';
    ctx.fillText(`Array Index: [${cfg.index}]`, w / 2, 440);

    // Salary Box
    ctx.fillStyle = 'rgba(30, 41, 59, 0.9)';
    ctx.beginPath();
    ctx.roundRect(40, 480, w - 80, 120, 16);
    ctx.fill();
    ctx.strokeStyle = 'rgba(255,255,255,0.1)';
    ctx.lineWidth = 2;
    ctx.stroke();

    ctx.fillStyle = '#94a3b8';
    ctx.font = '18px "Segoe UI", sans-serif';
    ctx.fillText('GAJI POKOK RESMI', w / 2, 518);

    ctx.fillStyle = '#34d399';
    ctx.font = 'bold 30px "Segoe UI", sans-serif';
    ctx.fillText('Rp ' + Number(salary).toLocaleString('id-ID'), w / 2, 565);

    // Barcode at bottom
    ctx.fillStyle = '#cbd5e1';
    for (let x = 60; x < w - 60; x += Math.random() * 8 + 4) {
      ctx.fillRect(x, 640, Math.random() * 4 + 2, 55);
    }

    ctx.fillStyle = '#64748b';
    ctx.font = '14px "Courier New", monospace';
    ctx.fillText(`VERIFIED ID: EMP-GOL-${grade}-2026`, w / 2, 725);
    ctx.textAlign = 'start';

    idBadgeTexture.needsUpdate = true;

    // Small spin animation on grade change
    if (idBadgeMesh) {
      const targetRot = idBadgeMesh.rotation.y + Math.PI * 2;
      const startRot = idBadgeMesh.rotation.y;
      const startTime = performance.now();
      const spin = (now) => {
        const progress = Math.min((now - startTime) / 450, 1);
        idBadgeMesh.rotation.y = startRot + (targetRot - startRot) * easeOutBack(progress);
        if (progress < 1) requestAnimationFrame(spin);
      };
      requestAnimationFrame(spin);
    }
  }

  // --- FLOATING HOLOGRAPHIC SLIP GAJI ---
  function buildHologramSlip() {
    hologramCanvas = document.createElement('canvas');
    hologramCanvas.width = 720;
    hologramCanvas.height = 960;
    hologramCtx = hologramCanvas.getContext('2d');
    hologramTexture = new THREE.CanvasTexture(hologramCanvas);

    const geo = new THREE.PlaneGeometry(1.6, 2.13);
    const mat = new THREE.MeshStandardMaterial({
      map: hologramTexture,
      transparent: true,
      opacity: 0.92,
      roughness: 0.1,
      metalness: 0.3,
      side: THREE.DoubleSide
    });

    hologramMesh = new THREE.Mesh(geo, mat);
    hologramMesh.position.set(1.4, 2.5, 0.6);
    hologramMesh.rotation.y = -0.4;
    hologramMesh.rotation.x = -0.05;
    scene.add(hologramMesh);
  }

  function updateHologramSlip(data) {
    if (!hologramCtx) return;
    const ctx = hologramCtx;
    const w = 720;
    const h = 960;

    // Clear with dark glass transparent tone
    ctx.clearRect(0, 0, w, h);

    // Glowing border rounded rect
    ctx.fillStyle = 'rgba(11, 17, 32, 0.88)';
    ctx.strokeStyle = '#38bdf8';
    ctx.lineWidth = 6;
    ctx.beginPath();
    ctx.roundRect(10, 10, w - 20, h - 20, 24);
    ctx.fill();
    ctx.stroke();

    // Top Hologram bar
    const barGrad = ctx.createLinearGradient(0, 0, w, 0);
    barGrad.addColorStop(0, '#0284c7');
    barGrad.addColorStop(1, '#06b6d4');
    ctx.fillStyle = barGrad;
    ctx.beginPath();
    ctx.roundRect(20, 20, w - 40, 90, [18, 18, 4, 4]);
    ctx.fill();

    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 32px "Segoe UI", sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('SLIP GAJI ELEKTRONIK', w / 2, 65);
    ctx.font = '16px "Courier New", monospace';
    ctx.fillText('SISTEM PENGHASILAN KARYAWAN', w / 2, 95);

    // Content rows
    ctx.textAlign = 'start';
    let y = 170;
    const leftX = 50;
    const rightX = w - 50;

    function drawSlipRow(label, value, subtext, isBold) {
      ctx.fillStyle = '#94a3b8';
      ctx.font = isBold ? 'bold 22px "Segoe UI", sans-serif' : '20px "Segoe UI", sans-serif';
      ctx.fillText(label, leftX, y);

      ctx.fillStyle = isBold ? '#38bdf8' : '#f8fafc';
      ctx.textAlign = 'right';
      ctx.font = isBold ? 'bold 24px "Segoe UI", sans-serif' : '22px "Segoe UI", sans-serif';
      ctx.fillText(value, rightX, y);

      if (subtext) {
        ctx.fillStyle = '#64748b';
        ctx.font = '15px "Courier New", monospace';
        ctx.fillText(subtext, rightX, y + 24);
        y += 20;
      }

      ctx.textAlign = 'start';
      y += 50;

      // Divider line
      ctx.strokeStyle = 'rgba(148, 163, 184, 0.15)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(leftX, y - 25);
      ctx.lineTo(rightX, y - 25);
      ctx.stroke();
    }

    drawSlipRow('Golongan Karyawan', `Golongan ${data.golongan}`, `ARRAY_GAJI[${data.golongan === 'A' ? 0 : data.golongan === 'B' ? 1 : 2}]`, true);
    drawSlipRow('Gaji Pokok', 'Rp ' + Number(data.gajiPokok).toLocaleString('id-ID'), null, false);
    drawSlipRow('Durasi Lembur', `${data.jamLembur} Jam`, null, false);
    drawSlipRow('Persentase Lembur', `${data.persenLembur}%`, `ARRAY_LEMBUR (${data.persenLembur}%)`, false);
    drawSlipRow('Nominal Uang Lembur', 'Rp ' + Number(data.gajiLembur).toLocaleString('id-ID'), 'Rumus: % Lembur × Gaji Pokok', false);

    // Total Highlight Box
    y += 10;
    ctx.fillStyle = 'rgba(16, 185, 129, 0.12)';
    ctx.strokeStyle = '#10b981';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.roundRect(40, y, w - 80, 130, 16);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = '#34d399';
    ctx.font = 'bold 20px "Segoe UI", sans-serif';
    ctx.fillText('TOTAL PENGHASILAN BERSIH', 60, y + 40);

    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 38px "Segoe UI", sans-serif';
    ctx.fillText('Rp ' + Number(data.totalPenghasilan).toLocaleString('id-ID'), 60, y + 95);

    // Stamp "VERIFIED"
    ctx.save();
    ctx.translate(w - 180, y + 175);
    ctx.rotate(-0.15);
    ctx.strokeStyle = '#10b981';
    ctx.lineWidth = 4;
    ctx.strokeRect(-110, -35, 220, 65);

    ctx.fillStyle = '#10b981';
    ctx.font = 'bold 22px "Courier New", monospace';
    ctx.textAlign = 'center';
    ctx.fillText('✓ TERVERIFIKASI', 0, -4);
    ctx.font = '12px "Courier New", monospace';
    ctx.fillText('LOGIKA ARRAY JAVA OK', 0, 18);
    ctx.restore();

    hologramTexture.needsUpdate = true;
  }

  // --- DYNAMIC 3D MONEY STACKS (Gepokan Uang Rupiah) ---
  function buildMoneyGroup() {
    moneyGroup = new THREE.Group();
    moneyGroup.position.set(0.6, 1.43, 0.4);
    scene.add(moneyGroup);
  }

  function createBanknoteTexture(color, label) {
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 256;
    const ctx = canvas.getContext('2d');

    // Banknote base
    ctx.fillStyle = color;
    ctx.fillRect(0, 0, 512, 256);

    // Outer border
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 6;
    ctx.strokeRect(10, 10, 492, 236);

    // Inner pattern
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
    ctx.lineWidth = 2;
    for (let i = 20; i < 490; i += 20) {
      ctx.beginPath();
      ctx.moveTo(i, 20);
      ctx.lineTo(i, 236);
      ctx.stroke();
    }

    // White paper band in center
    ctx.fillStyle = '#f8fafc';
    ctx.fillRect(200, 0, 112, 256);

    // Banknote Text
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 44px "Segoe UI", sans-serif';
    ctx.fillText('INDONESIA', 30, 70);
    ctx.font = 'bold 36px "Segoe UI", sans-serif';
    ctx.fillText(label, 30, 210);

    ctx.fillStyle = '#0f172a';
    ctx.font = 'bold 20px "Courier New", monospace';
    ctx.textAlign = 'center';
    ctx.fillText('BANKNOTE', 256, 130);
    ctx.fillText('100 PCS', 256, 160);

    return new THREE.CanvasTexture(canvas);
  }

  const redMoneyTexture = createBanknoteTexture('#be123c', '100.000'); // Rp 100.000
  const blueMoneyTexture = createBanknoteTexture('#0284c7', '50.000');  // Rp 50.000 (Overtime)

  function spawnMoneyStacks(gajiPokok, gajiLembur) {
    // Clear old stacks
    while (moneyGroup.children.length > 0) {
      const obj = moneyGroup.children[0];
      moneyGroup.remove(obj);
      if (obj.geometry) obj.geometry.dispose();
    }

    // Number of stacks scales proportionally
    // 1 bundle = Rp 1.000.000
    const pokokStacks = Math.round(gajiPokok / 1000000);
    const lemburStacks = Math.max(1, Math.round(gajiLembur / 500000));

    const stackGeo = new THREE.BoxGeometry(0.5, 0.08, 0.28);
    const redMat = new THREE.MeshStandardMaterial({ map: redMoneyTexture, roughness: 0.5 });
    const blueMat = new THREE.MeshStandardMaterial({ map: blueMoneyTexture, roughness: 0.5 });

    let index = 0;

    // Grid layout of stacks (e.g. 2 x 3 grid)
    const cols = 2;
    const spacingX = 0.56;
    const spacingZ = 0.34;

    function addStack(col, row, heightIdx, mat, isBonus) {
      const mesh = new THREE.Mesh(stackGeo, mat);
      const targetX = (col - 0.5) * spacingX;
      const targetZ = (row - 0.5) * spacingZ;
      const targetY = heightIdx * 0.085;

      // Start above desk and animate down
      mesh.position.set(targetX, targetY + 1.2 + Math.random() * 0.5, targetZ);
      mesh.rotation.y = (Math.random() - 0.5) * 0.12;
      mesh.castShadow = true;
      mesh.receiveShadow = true;
      moneyGroup.add(mesh);

      // Spring bounce drop animation
      const startY = mesh.position.y;
      const startTime = performance.now() + index * 50;
      index++;

      const dropAnim = (now) => {
        if (now < startTime) {
          requestAnimationFrame(dropAnim);
          return;
        }
        const progress = Math.min((now - startTime) / 380, 1);
        mesh.position.y = startY + (targetY - startY) * easeOutBounce(progress);
        if (progress < 1) {
          requestAnimationFrame(dropAnim);
        }
      };
      requestAnimationFrame(dropAnim);
    }

    // Add Base Salary (Red)
    let curCol = 0;
    let curRow = 0;
    let curHeight = 0;

    for (let i = 0; i < pokokStacks; i++) {
      addStack(curCol, curRow, curHeight, redMat, false);
      curCol++;
      if (curCol >= cols) {
        curCol = 0;
        curRow++;
        if (curRow >= 2) {
          curRow = 0;
          curHeight++;
        }
      }
    }

    // Add Overtime (Blue) stacks on top
    if (gajiLembur > 0) {
      for (let j = 0; j < lemburStacks; j++) {
        addStack(j % cols, Math.floor(j / cols) % 2, curHeight + 1 + Math.floor(j / 4), blueMat, true);
      }
    }
  }

  // --- CONFETTI & COIN CASCADE ---
  function triggerCelebration() {
    const coinGeo = new THREE.CylinderGeometry(0.08, 0.08, 0.02, 12);
    const coinMat = new THREE.MeshStandardMaterial({
      color: 0xf59e0b,
      metalness: 0.9,
      roughness: 0.2,
      emissive: 0xd97706,
      emissiveIntensity: 0.2
    });

    const spawnOrigin = new THREE.Vector3(0.6, 1.8, 0.4);

    for (let i = 0; i < 35; i++) {
      const coin = new THREE.Mesh(coinGeo, coinMat);
      coin.position.copy(spawnOrigin);
      coin.position.x += (Math.random() - 0.5) * 0.4;
      coin.position.z += (Math.random() - 0.5) * 0.4;

      const velocity = new THREE.Vector3(
        (Math.random() - 0.5) * 2.8,
        Math.random() * 3.5 + 2.0,
        (Math.random() - 0.5) * 2.8
      );

      const rotSpeed = new THREE.Vector3(
        (Math.random() - 0.5) * 10,
        (Math.random() - 0.5) * 10,
        (Math.random() - 0.5) * 10
      );

      scene.add(coin);
      coinParticles.push({ mesh: coin, velocity, rotSpeed, birth: performance.now() });
    }
  }

  function updateCoinParticles(delta) {
    const gravity = -9.8;
    const floorY = 1.43;

    for (let i = coinParticles.length - 1; i >= 0; i--) {
      const p = coinParticles[i];
      p.velocity.y += gravity * delta;
      p.mesh.position.addScaledVector(p.velocity, delta);

      p.mesh.rotation.x += p.rotSpeed.x * delta;
      p.mesh.rotation.y += p.rotSpeed.y * delta;

      // Bounce on desk floor
      if (p.mesh.position.y <= floorY) {
        p.mesh.position.y = floorY;
        p.velocity.y = -p.velocity.y * 0.4;
        p.velocity.x *= 0.7;
        p.velocity.z *= 0.7;
      }

      // Expire after 3.5 seconds
      if (performance.now() - p.birth > 3500) {
        scene.remove(p.mesh);
        p.mesh.geometry.dispose();
        coinParticles.splice(i, 1);
      }
    }
  }

  // --- STEAM PARTICLES FOR COFFEE MUG ---
  function buildSteamParticles() {
    const particleCount = 18;
    const geo = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);

    for (let i = 0; i < particleCount; i++) {
      positions[i * 3] = -1.6 + (Math.random() - 0.5) * 0.08;
      positions[i * 3 + 1] = 1.62 + Math.random() * 0.4;
      positions[i * 3 + 2] = -0.6 + (Math.random() - 0.5) * 0.08;
    }

    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));

    const mat = new THREE.PointsMaterial({
      color: 0xffffff,
      size: 0.04,
      transparent: true,
      opacity: 0.35
    });

    steamParticles = new THREE.Points(geo, mat);
    scene.add(steamParticles);
  }

  function updateSteam(delta) {
    if (!steamParticles) return;
    const pos = steamParticles.geometry.attributes.position.array;
    for (let i = 0; i < pos.length; i += 3) {
      pos[i + 1] += delta * 0.25; // drift up
      pos[i] += Math.sin(pos[i + 1] * 10) * 0.001; // subtle wave

      // Reset when reaches certain height
      if (pos[i + 1] > 2.1) {
        pos[i + 1] = 1.62;
        pos[i] = -1.6 + (Math.random() - 0.5) * 0.08;
        pos[i + 2] = -0.6 + (Math.random() - 0.5) * 0.08;
      }
    }
    steamParticles.geometry.attributes.position.needsUpdate = true;
  }

  // --- EASING FUNCTIONS ---
  function easeOutBounce(x) {
    const n1 = 7.5625;
    const d1 = 2.75;
    if (x < 1 / d1) return n1 * x * x;
    else if (x < 2 / d1) return n1 * (x -= 1.5 / d1) * x + 0.75;
    else if (x < 2.5 / d1) return n1 * (x -= 2.25 / d1) * x + 0.9375;
    else return n1 * (x -= 2.625 / d1) * x + 0.984375;
  }

  function easeOutBack(x) {
    const c1 = 1.70158;
    const c3 = c1 + 1;
    return 1 + c3 * Math.pow(x - 1, 3) + c1 * Math.pow(x - 1, 2);
  }

  // --- WINDOW RESIZE ---
  function onWindowResize() {
    if (!container || !camera || !renderer) return;
    const width = container.clientWidth;
    const height = container.clientHeight;
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
    renderer.setSize(width, height);
  }

  // --- MAIN ANIMATION LOOP ---
  function animate() {
    requestAnimationFrame(animate);

    const delta = clock.getDelta();
    const time = clock.getElapsedTime();

    // Bobbing animation for floating hologram slip
    if (hologramMesh) {
      hologramMesh.position.y = 2.5 + Math.sin(time * 2.2) * 0.06;
      hologramMesh.rotation.y = -0.4 + Math.sin(time * 1.2) * 0.04;
    }

    // Auto rotate mode
    if (controls) {
      controls.autoRotate = autoRotate;
      controls.autoRotateSpeed = 1.5;
      controls.update();
    }

    // Update Particles
    updateCoinParticles(delta);
    updateSteam(delta);

    renderer.render(scene, camera);
  }

  // --- SOUND EFFECTS (Web Audio API Synthesizer - Zero External Files) ---
  const SoundFX = {
    ctx: null,
    muted: false,
    init() {
      if (!this.ctx && (window.AudioContext || window.webkitAudioContext)) {
        this.ctx = new (window.AudioContext || window.webkitAudioContext)();
      }
    },
    click() {
      if (this.muted) return;
      this.init();
      if (!this.ctx) return;
      try {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(600, this.ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(120, this.ctx.currentTime + 0.04);
        gain.gain.setValueAtTime(0.12, this.ctx.currentTime);
        gain.gain.linearRampToValueAtTime(0.01, this.ctx.currentTime + 0.04);
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start();
        osc.stop(this.ctx.currentTime + 0.04);
      } catch (e) {}
    },
    chime() {
      if (this.muted) return;
      this.init();
      if (!this.ctx) return;
      try {
        const notes = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6
        notes.forEach((freq, i) => {
          const osc = this.ctx.createOscillator();
          const gain = this.ctx.createGain();
          osc.type = 'sine';
          osc.frequency.setValueAtTime(freq, this.ctx.currentTime + i * 0.08);
          gain.gain.setValueAtTime(0.18, this.ctx.currentTime + i * 0.08);
          gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + i * 0.08 + 0.35);
          osc.connect(gain);
          gain.connect(this.ctx.destination);
          osc.start(this.ctx.currentTime + i * 0.08);
          osc.stop(this.ctx.currentTime + i * 0.08 + 0.4);
        });
      } catch (e) {}
    }
  };

  // --- PUBLIC API EXPOSED TO WINDOW ---
  window.Payroll3D = {
    init,
    setGrade(grade) {
      currentGrade = grade;
      const cfg = GRADE_CONFIG[grade] || GRADE_CONFIG['A'];
      updateIdBadge(grade, cfg.salary);
      updateMonitor('READY', `Memilih ${cfg.name} (Array Index: [${cfg.index}])`);
      SoundFX.click();
    },
    startCalculating() {
      isCalculating = true;
      updateMonitor('CALCULATING', 'Memproses kalkulasi via Java WebServer...');
      SoundFX.click();
    },
    showResult(data) {
      isCalculating = false;
      updateMonitor('SUCCESS', `Total: Rp ${Number(data.totalPenghasilan).toLocaleString('id-ID')}`);
      updateHologramSlip(data);
      spawnMoneyStacks(data.gajiPokok, data.gajiLembur);
      triggerCelebration();
      SoundFX.chime();
    },
    showError(msg) {
      isCalculating = false;
      updateMonitor('ERROR', msg);
    },
    toggleAutoRotate() {
      autoRotate = !autoRotate;
      return autoRotate;
    },
    resetCamera() {
      if (!camera || !controls) return;
      controls.target.set(0, 1.2, 0);
      camera.position.set(7.5, 6.2, 9.5);
      controls.update();
      SoundFX.click();
    },
    focusView(type) {
      if (!camera || !controls) return;
      if (type === 'money') {
        controls.target.set(0.6, 1.5, 0.4);
        camera.position.set(2.8, 3.2, 2.8);
      } else if (type === 'slip') {
        controls.target.set(1.4, 2.5, 0.6);
        camera.position.set(3.6, 2.8, 3.2);
      } else {
        this.resetCamera();
      }
      controls.update();
      SoundFX.click();
    },
    toggleMute() {
      SoundFX.muted = !SoundFX.muted;
      return SoundFX.muted;
    }
  };

  // Auto initialize on DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
