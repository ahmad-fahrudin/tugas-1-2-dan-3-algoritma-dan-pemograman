/**
 * Payroll3D - Interactive 3D Workstation Simulation
 * Tugas 3: Algoritma dan Pemrograman (Operator, IF, dan Array)
 * Standard Minimalist UI & Balanced Viewport
 */

(function () {
  'use strict';

  // --- ENGINE & STATE ---
  let scene, camera, renderer;
  let container;
  let clock;

  // Camera & POV State
  let povMode = 'FPS'; // 'FPS' | 'THIRD_PERSON'
  let cameraYaw = Math.PI; // Face desk at start
  let cameraPitch = -0.06;
  let isPointerLocked = false;
  let isDraggingCanvas = false;
  let previousMousePos = { x: 0, y: 0 };

  // Seated Zoom via Mouse Wheel (0 = current POV mentok zoom out, 1 = max zoom in)
  let seatedZoom = 0;
  let targetSeatedZoom = 0;

  // Player State
  const player = {
    pos: new THREE.Vector3(0, 0, 4.0),
    vel: new THREE.Vector3(),
    speed: 3.8,
    sprintSpeed: 6.2,
    jumpForce: 5.5,
    isGrounded: true,
    isSitting: false,
    walkTime: 0,
    meshGroup: null,
    head: null,
    torso: null,
    leftArm: null,
    rightArm: null,
    leftLeg: null,
    rightLeg: null
  };

  const keys = {
    forward: false,
    backward: false,
    left: false,
    right: false,
    jump: false,
    sprint: false
  };

  // Chair & Interaction Target
  const chairPos = new THREE.Vector3(0, 0, 1.55);
  const CHAIR_INTERACTION_DIST = 2.4;
  let isNearChair = false;

  // Workstation 3D Props
  let monitorScreenMesh, monitorCanvas, monitorCtx, monitorTexture;
  let idBadgeMesh, idBadgeCanvas, idBadgeCtx, idBadgeTexture;
  let hologramMesh, hologramCanvas, hologramCtx, hologramTexture;
  let moneyGroup;
  let coinParticles = [];
  let steamParticles;
  let currentGrade = 'A';

  const GRADE_CONFIG = {
    A: { name: 'Golongan A', salary: 5000000, color: '#38bdf8', hex: 0x38bdf8, index: 0 },
    B: { name: 'Golongan B', salary: 6500000, color: '#34d399', hex: 0x34d399, index: 1 },
    C: { name: 'Golongan C', salary: 9500000, color: '#c084fc', hex: 0xc084fc, index: 2 }
  };

  // Colliders for Room Objects (AABB)
  const colliders = [
    { minX: -2.3, maxX: 2.3, minZ: -1.4, maxZ: 0.35 },
    { minX: -6.8, maxX: -4.8, minZ: -6.8, maxZ: -5.8 },
    { minX: 4.8, maxX: 6.2, minZ: -6.8, maxZ: -5.8 }
  ];

  // --- SOUND EFFECTS (Web Audio API Synthesizer) ---
  const SoundFX = {
    ctx: null,
    muted: false,
    lastStepTime: 0,
    init() {
      if (!this.ctx && (window.AudioContext || window.webkitAudioContext)) {
        this.ctx = new (window.AudioContext || window.webkitAudioContext)();
      }
    },
    step() {
      if (this.muted) return;
      const now = performance.now();
      if (now - this.lastStepTime < 340) return;
      this.lastStepTime = now;
      this.init();
      if (!this.ctx) return;
      try {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(140 + Math.random() * 30, this.ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(40, this.ctx.currentTime + 0.06);
        gain.gain.setValueAtTime(0.08, this.ctx.currentTime);
        gain.gain.linearRampToValueAtTime(0.01, this.ctx.currentTime + 0.06);
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start();
        osc.stop(this.ctx.currentTime + 0.06);
      } catch (e) {}
    },
    jump() {
      if (this.muted) return;
      this.init();
      if (!this.ctx) return;
      try {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(220, this.ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(480, this.ctx.currentTime + 0.12);
        gain.gain.setValueAtTime(0.12, this.ctx.currentTime);
        gain.gain.linearRampToValueAtTime(0.01, this.ctx.currentTime + 0.12);
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start();
        osc.stop(this.ctx.currentTime + 0.12);
      } catch (e) {}
    },
    sit() {
      if (this.muted) return;
      this.init();
      if (!this.ctx) return;
      try {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(320, this.ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(160, this.ctx.currentTime + 0.18);
        gain.gain.setValueAtTime(0.15, this.ctx.currentTime);
        gain.gain.linearRampToValueAtTime(0.01, this.ctx.currentTime + 0.18);
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start();
        osc.stop(this.ctx.currentTime + 0.18);
      } catch (e) {}
    },
    stand() {
      if (this.muted) return;
      this.init();
      if (!this.ctx) return;
      try {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(180, this.ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(340, this.ctx.currentTime + 0.15);
        gain.gain.setValueAtTime(0.12, this.ctx.currentTime);
        gain.gain.linearRampToValueAtTime(0.01, this.ctx.currentTime + 0.15);
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start();
        osc.stop(this.ctx.currentTime + 0.15);
      } catch (e) {}
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
        gain.gain.setValueAtTime(0.1, this.ctx.currentTime);
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
        const notes = [523.25, 659.25, 783.99, 1046.50];
        notes.forEach((freq, i) => {
          const osc = this.ctx.createOscillator();
          const gain = this.ctx.createGain();
          osc.type = 'sine';
          osc.frequency.setValueAtTime(freq, this.ctx.currentTime + i * 0.07);
          gain.gain.setValueAtTime(0.16, this.ctx.currentTime + i * 0.07);
          gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + i * 0.07 + 0.35);
          osc.connect(gain);
          gain.connect(this.ctx.destination);
          osc.start(this.ctx.currentTime + i * 0.07);
          osc.stop(this.ctx.currentTime + i * 0.07 + 0.4);
        });
      } catch (e) {}
    },
    cashGrab() {
      if (this.muted) return;
      this.init();
      if (!this.ctx) return;
      try {
        const notes = [440, 554.37, 659.25, 880];
        notes.forEach((freq, i) => {
          const osc = this.ctx.createOscillator();
          const gain = this.ctx.createGain();
          osc.type = 'triangle';
          osc.frequency.setValueAtTime(freq, this.ctx.currentTime + i * 0.05);
          gain.gain.setValueAtTime(0.15, this.ctx.currentTime + i * 0.05);
          gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + i * 0.05 + 0.28);
          osc.connect(gain);
          gain.connect(this.ctx.destination);
          osc.start(this.ctx.currentTime + i * 0.05);
          osc.stop(this.ctx.currentTime + i * 0.05 + 0.3);
        });
      } catch (e) {}
    }
  };

  // --- INITIALIZATION ---
  function init() {
    container = document.getElementById('canvas3d-container');
    if (!container || !window.THREE) return;

    clock = new THREE.Clock();

    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x090d16);
    scene.fog = new THREE.FogExp2(0x090d16, 0.035);

    const aspect = container.clientWidth / container.clientHeight;
    camera = new THREE.PerspectiveCamera(65, aspect, 0.1, 100);
    camera.position.set(player.pos.x, player.pos.y + 1.62, player.pos.z);

    renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: 'high-performance' });
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.1;
    container.appendChild(renderer.domElement);

    setupLighting();
    buildOfficeRoom();
    buildWorkstationDesk();
    buildOfficeChair();
    buildComputer();
    buildIdBadge();
    buildHologramSlip();
    buildMoneyGroup();
    buildSteamParticles();
    buildRobloxPlayer();
    buildNpcEmployee();

    setupInputControls();

    updateMonitor('Siap', 'Menunggu input...');
    updateIdBadge('A', 5000000);
    updateHologramSlip({
      golongan: 'A',
      gajiPokok: 5000000,
      jamLembur: 0,
      persenLembur: 0,
      gajiLembur: 0,
      totalPenghasilan: 5000000
    });

    animate();
  }

  // --- LIGHTING ---
  function setupLighting() {
    const ambient = new THREE.AmbientLight(0x1e293b, 1.4);
    scene.add(ambient);

    const ceilingLight = new THREE.PointLight(0xf8fafc, 2.0, 16);
    ceilingLight.position.set(0, 4.2, 0);
    ceilingLight.castShadow = true;
    scene.add(ceilingLight);

    const deskSpot = new THREE.SpotLight(0xfef08a, 2.5, 8, Math.PI / 3.5, 0.4, 1);
    deskSpot.position.set(-1.8, 2.6, 0.8);
    deskSpot.target.position.set(0, 1.15, 0.3);
    deskSpot.castShadow = true;
    scene.add(deskSpot);
    scene.add(deskSpot.target);

    const cyanLight = new THREE.PointLight(0x38bdf8, 1.5, 14);
    cyanLight.position.set(5.5, 3.0, 1.0);
    scene.add(cyanLight);
  }

  // --- OFFICE ROOM ---
  function buildOfficeRoom() {
    const roomGroup = new THREE.Group();

    // Floor
    const floorGeo = new THREE.PlaneGeometry(14, 14);
    const floorMat = new THREE.MeshStandardMaterial({ color: 0x111827, roughness: 0.5, metalness: 0.1 });
    const floorMesh = new THREE.Mesh(floorGeo, floorMat);
    floorMesh.rotation.x = -Math.PI / 2;
    floorMesh.receiveShadow = true;
    roomGroup.add(floorMesh);

    // Rug
    const rug = new THREE.Mesh(
      new THREE.PlaneGeometry(6, 5),
      new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.9 })
    );
    rug.rotation.x = -Math.PI / 2;
    rug.position.set(0, 0.005, 0.5);
    rug.receiveShadow = true;
    roomGroup.add(rug);

    // Ceiling
    const ceiling = new THREE.Mesh(
      new THREE.PlaneGeometry(14, 14),
      new THREE.MeshStandardMaterial({ color: 0x0b101d, roughness: 0.8 })
    );
    ceiling.rotation.x = Math.PI / 2;
    ceiling.position.y = 4.5;
    roomGroup.add(ceiling);

    const lightFixture = new THREE.Mesh(
      new THREE.BoxGeometry(3, 0.1, 2),
      new THREE.MeshBasicMaterial({ color: 0xffffff })
    );
    lightFixture.position.set(0, 4.45, 0);
    roomGroup.add(lightFixture);

    // Walls
    const wallMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.7 });
    const backWall = new THREE.Mesh(new THREE.PlaneGeometry(14, 4.5), wallMat);
    backWall.position.set(0, 2.25, -7);
    backWall.receiveShadow = true;
    roomGroup.add(backWall);

    const frontWall = new THREE.Mesh(new THREE.PlaneGeometry(14, 4.5), wallMat);
    frontWall.rotation.y = Math.PI;
    frontWall.position.set(0, 2.25, 7);
    frontWall.receiveShadow = true;
    roomGroup.add(frontWall);

    const leftWall = new THREE.Mesh(new THREE.PlaneGeometry(14, 4.5), wallMat);
    leftWall.rotation.y = Math.PI / 2;
    leftWall.position.set(-7, 2.25, 0);
    leftWall.receiveShadow = true;
    roomGroup.add(leftWall);

    // Bookshelf
    const shelf = new THREE.Mesh(
      new THREE.BoxGeometry(1.6, 3.2, 0.8),
      new THREE.MeshStandardMaterial({ color: 0x182234, roughness: 0.5 })
    );
    shelf.position.set(-5.8, 1.6, -6.3);
    shelf.castShadow = true;
    roomGroup.add(shelf);

    // Water Dispenser
    const wdBase = new THREE.Mesh(
      new THREE.BoxGeometry(0.6, 1.4, 0.6),
      new THREE.MeshStandardMaterial({ color: 0xe2e8f0, roughness: 0.3 })
    );
    wdBase.position.set(5.5, 0.7, -6.3);
    wdBase.castShadow = true;
    roomGroup.add(wdBase);

    const bottle = new THREE.Mesh(
      new THREE.CylinderGeometry(0.24, 0.24, 0.65, 16),
      new THREE.MeshStandardMaterial({ color: 0x0ea5e9, transparent: true, opacity: 0.8, roughness: 0.1 })
    );
    bottle.position.set(5.5, 1.7, -6.3);
    roomGroup.add(bottle);

    // Window & Skyline
    const winFrame = new THREE.Mesh(
      new THREE.BoxGeometry(0.2, 3.6, 10),
      new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.4 })
    );
    winFrame.position.set(6.9, 2.2, 0);
    roomGroup.add(winFrame);

    const glass = new THREE.Mesh(
      new THREE.PlaneGeometry(9.6, 3.2),
      new THREE.MeshStandardMaterial({ color: 0x38bdf8, transparent: true, opacity: 0.2, roughness: 0.05 })
    );
    glass.rotation.y = -Math.PI / 2;
    glass.position.set(6.85, 2.2, 0);
    roomGroup.add(glass);

    const cityGroup = new THREE.Group();
    cityGroup.position.set(16, 0, 0);
    const bldColors = [0x0f172a, 0x1e293b, 0x0d1527, 0x131f37];
    for (let i = -12; i <= 12; i += 2.5) {
      const height = 6 + Math.random() * 12;
      const width = 1.8 + Math.random() * 1.5;
      const bld = new THREE.Mesh(
        new THREE.BoxGeometry(width, height, width),
        new THREE.MeshStandardMaterial({ color: bldColors[Math.floor(Math.random() * bldColors.length)], roughness: 0.6 })
      );
      bld.position.set(0, height / 2, i);
      cityGroup.add(bld);
    }
    roomGroup.add(cityGroup);

    scene.add(roomGroup);
  }

  // --- ERGONOMIC CHAIR ---
  let chairGroup;
  function buildOfficeChair() {
    chairGroup = new THREE.Group();
    chairGroup.position.copy(chairPos);
    chairGroup.rotation.y = 0; // Naturally faces negative Z (desk)

    const chromeMat = new THREE.MeshStandardMaterial({ color: 0x94a3b8, metalness: 0.9, roughness: 0.2 });
    const seatMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.6 });
    const cushionMat = new THREE.MeshStandardMaterial({ color: 0x0284c7, roughness: 0.7 });

    const starCenter = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.12, 0.08, 16), chromeMat);
    starCenter.position.y = 0.08;
    chairGroup.add(starCenter);

    for (let i = 0; i < 5; i++) {
      const angle = (i * Math.PI * 2) / 5;
      const leg = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.04, 0.42), chromeMat);
      leg.position.set(Math.sin(angle) * 0.22, 0.07, Math.cos(angle) * 0.22);
      leg.rotation.y = angle;
      chairGroup.add(leg);
    }

    const stem = new THREE.Mesh(new THREE.CylinderGeometry(0.045, 0.045, 0.55, 16), chromeMat);
    stem.position.y = 0.36;
    chairGroup.add(stem);

    // Seat cushion
    const seat = new THREE.Mesh(new THREE.BoxGeometry(0.68, 0.1, 0.65), cushionMat);
    seat.position.y = 0.65;
    seat.castShadow = true;
    seat.receiveShadow = true;
    chairGroup.add(seat);

    // Backrest (local z = +0.32, well behind the seated user)
    const backrest = new THREE.Mesh(new THREE.BoxGeometry(0.62, 0.75, 0.08), seatMat);
    backrest.position.set(0, 1.05, 0.32);
    backrest.rotation.x = 0.08;
    backrest.castShadow = true;
    chairGroup.add(backrest);

    // Headrest (local z = +0.36)
    const headrest = new THREE.Mesh(new THREE.BoxGeometry(0.38, 0.2, 0.08), cushionMat);
    headrest.position.set(0, 1.45, 0.36);
    chairGroup.add(headrest);

    // Armrests
    const armrestGeo = new THREE.BoxGeometry(0.08, 0.04, 0.36);
    const armL = new THREE.Mesh(armrestGeo, chromeMat);
    armL.position.set(-0.38, 0.88, 0.05);
    chairGroup.add(armL);

    const armR = new THREE.Mesh(armrestGeo, chromeMat);
    armR.position.set(0.38, 0.88, 0.05);
    chairGroup.add(armR);

    scene.add(chairGroup);
  }

  // --- WORKSTATION DESK (PROPORTIONAL COMFORTABLE HEIGHT) ---
  function buildWorkstationDesk() {
    const deskGroup = new THREE.Group();

    // Tabletop at comfortable y = 1.15 (surface y = 1.21)
    const topGeo = new THREE.BoxGeometry(4.4, 0.12, 2.2);
    const topMat = new THREE.MeshStandardMaterial({ color: 0x181e2b, roughness: 0.35, metalness: 0.1 });
    const topMesh = new THREE.Mesh(topGeo, topMat);
    topMesh.position.y = 1.15;
    topMesh.castShadow = true;
    topMesh.receiveShadow = true;
    deskGroup.add(topMesh);

    // Desk Mat
    const matMesh = new THREE.Mesh(
      new THREE.BoxGeometry(2.6, 0.01, 1.3),
      new THREE.MeshStandardMaterial({ color: 0x090d16, roughness: 0.8 })
    );
    matMesh.position.set(-0.2, 1.215, 0.15);
    matMesh.receiveShadow = true;
    deskGroup.add(matMesh);

    // Legs
    const legGeo = new THREE.CylinderGeometry(0.06, 0.06, 1.15, 16);
    const legMat = new THREE.MeshStandardMaterial({ color: 0x334155, metalness: 0.8, roughness: 0.3 });
    [
      [-2.0, 0.575, -0.9],
      [2.0, 0.575, -0.9],
      [-2.0, 0.575, 0.9],
      [2.0, 0.575, 0.9]
    ].forEach(pos => {
      const leg = new THREE.Mesh(legGeo, legMat);
      leg.position.set(...pos);
      leg.castShadow = true;
      deskGroup.add(leg);
    });

    // Coffee Mug
    const mugMesh = new THREE.Mesh(
      new THREE.CylinderGeometry(0.09, 0.08, 0.2, 16),
      new THREE.MeshStandardMaterial({ color: 0xe2e8f0, roughness: 0.2 })
    );
    mugMesh.position.set(-1.6, 1.31, -0.5);
    mugMesh.castShadow = true;
    deskGroup.add(mugMesh);

    // Succulent
    const potMesh = new THREE.Mesh(
      new THREE.CylinderGeometry(0.14, 0.1, 0.18, 16),
      new THREE.MeshStandardMaterial({ color: 0x64748b, roughness: 0.8 })
    );
    potMesh.position.set(1.9, 1.30, -0.7);
    deskGroup.add(potMesh);

    const plantMesh = new THREE.Mesh(
      new THREE.DodecahedronGeometry(0.12, 1),
      new THREE.MeshStandardMaterial({ color: 0x10b981, roughness: 0.5 })
    );
    plantMesh.position.set(1.9, 1.45, -0.7);
    deskGroup.add(plantMesh);

    scene.add(deskGroup);
  }

  // --- COMPUTER WORKSTATION ---
  function buildComputer() {
    const pcGroup = new THREE.Group();

    const metalMat = new THREE.MeshStandardMaterial({ color: 0x94a3b8, metalness: 0.8, roughness: 0.2 });
    const standBase = new THREE.Mesh(new THREE.CylinderGeometry(0.24, 0.28, 0.03, 24), metalMat);
    standBase.position.set(-0.2, 1.225, -0.55);
    pcGroup.add(standBase);

    const standStem = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.55, 0.06), metalMat);
    standStem.position.set(-0.2, 1.50, -0.6);
    pcGroup.add(standStem);

    const bezel = new THREE.Mesh(
      new THREE.BoxGeometry(2.1, 1.15, 0.08),
      new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.4 })
    );
    bezel.position.set(-0.2, 1.82, -0.55);
    bezel.castShadow = true;
    pcGroup.add(bezel);

    monitorCanvas = document.createElement('canvas');
    monitorCanvas.width = 1024;
    monitorCanvas.height = 512;
    monitorCtx = monitorCanvas.getContext('2d');
    monitorTexture = new THREE.CanvasTexture(monitorCanvas);

    monitorScreenMesh = new THREE.Mesh(
      new THREE.PlaneGeometry(2.0, 1.05),
      new THREE.MeshBasicMaterial({ map: monitorTexture })
    );
    monitorScreenMesh.position.set(-0.2, 1.82, -0.505);
    pcGroup.add(monitorScreenMesh);

    // Keyboard & Mouse
    const keyboard = new THREE.Mesh(
      new THREE.BoxGeometry(1.2, 0.04, 0.42),
      new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.5 })
    );
    keyboard.position.set(-0.4, 1.23, 0.2);
    keyboard.castShadow = true;
    pcGroup.add(keyboard);

    const mouse = new THREE.Mesh(
      new THREE.BoxGeometry(0.14, 0.05, 0.22),
      new THREE.MeshStandardMaterial({ color: 0x334155, roughness: 0.3 })
    );
    mouse.position.set(0.55, 1.23, 0.22);
    mouse.castShadow = true;
    pcGroup.add(mouse);

    scene.add(pcGroup);
  }

  // --- 3D ROBLOX CHARACTER ---
  function buildRobloxPlayer() {
    const pGroup = new THREE.Group();
    pGroup.position.copy(player.pos);

    const skinMat = new THREE.MeshStandardMaterial({ color: 0xfacc15, roughness: 0.35 });
    const shirtMat = new THREE.MeshStandardMaterial({ color: 0x0284c7, roughness: 0.5 });
    const pantsMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.6 });
    const capMat = new THREE.MeshStandardMaterial({ color: 0x0369a1, roughness: 0.4 });

    // Torso
    player.torso = new THREE.Mesh(new THREE.BoxGeometry(0.42, 0.52, 0.24), shirtMat);
    player.torso.position.y = 0.72;
    player.torso.castShadow = true;
    pGroup.add(player.torso);

    const collar = new THREE.Mesh(
      new THREE.BoxGeometry(0.16, 0.08, 0.02),
      new THREE.MeshStandardMaterial({ color: 0xffffff })
    );
    collar.position.set(0, 0.22, 0.125);
    player.torso.add(collar);

    // Head Group
    const headGroup = new THREE.Group();
    headGroup.position.set(0, 1.16, 0);

    player.head = new THREE.Mesh(new THREE.BoxGeometry(0.32, 0.32, 0.30), skinMat);
    player.head.castShadow = true;
    headGroup.add(player.head);

    const eyeGeo = new THREE.BoxGeometry(0.045, 0.045, 0.02);
    const blackMat = new THREE.MeshBasicMaterial({ color: 0x0a0a0a });

    const leftEye = new THREE.Mesh(eyeGeo, blackMat);
    leftEye.position.set(-0.08, 0.03, 0.155);
    player.head.add(leftEye);

    const rightEye = new THREE.Mesh(eyeGeo, blackMat);
    rightEye.position.set(0.08, 0.03, 0.155);
    player.head.add(rightEye);

    const smile = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.03, 0.02), blackMat);
    smile.position.set(0, -0.06, 0.155);
    player.head.add(smile);

    const capCrown = new THREE.Mesh(new THREE.BoxGeometry(0.34, 0.09, 0.34), capMat);
    capCrown.position.set(0, 0.16, 0);
    player.head.add(capCrown);

    const capVisor = new THREE.Mesh(new THREE.BoxGeometry(0.26, 0.03, 0.18), capMat);
    capVisor.position.set(0, 0.14, 0.22);
    player.head.add(capVisor);

    pGroup.add(headGroup);

    // Arms
    const armGeo = new THREE.BoxGeometry(0.14, 0.44, 0.14);
    player.leftArm = new THREE.Mesh(armGeo, shirtMat);
    player.leftArm.position.set(-0.29, 0.68, 0);
    player.leftArm.castShadow = true;
    pGroup.add(player.leftArm);

    const handL = new THREE.Mesh(new THREE.BoxGeometry(0.13, 0.12, 0.13), skinMat);
    handL.position.set(0, -0.22, 0);
    player.leftArm.add(handL);

    player.rightArm = new THREE.Mesh(armGeo, shirtMat);
    player.rightArm.position.set(0.29, 0.68, 0);
    player.rightArm.castShadow = true;
    pGroup.add(player.rightArm);

    const handR = new THREE.Mesh(new THREE.BoxGeometry(0.13, 0.12, 0.13), skinMat);
    handR.position.set(0, -0.22, 0);
    player.rightArm.add(handR);

    // Legs
    const legGeo = new THREE.BoxGeometry(0.16, 0.46, 0.16);
    player.leftLeg = new THREE.Mesh(legGeo, pantsMat);
    player.leftLeg.position.set(-0.11, 0.23, 0);
    player.leftLeg.castShadow = true;
    pGroup.add(player.leftLeg);

    player.rightLeg = new THREE.Mesh(legGeo, pantsMat);
    player.rightLeg.position.set(0.11, 0.23, 0);
    player.rightLeg.castShadow = true;
    pGroup.add(player.rightLeg);

    player.meshGroup = pGroup;
    scene.add(pGroup);
  }

  // --- MONEY STACKS & BANKNOTE TEXTURES ---
  function createBanknoteTexture(color, label) {
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 256;
    const ctx = canvas.getContext('2d');

    ctx.fillStyle = color;
    ctx.fillRect(0, 0, 512, 256);

    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 6;
    ctx.strokeRect(10, 10, 492, 236);

    ctx.fillStyle = '#f8fafc';
    ctx.fillRect(200, 0, 112, 256);

    ctx.fillStyle = '#ffffff';
    ctx.font = '700 40px -apple-system, sans-serif';
    ctx.fillText('INDONESIA', 30, 70);
    ctx.font = '700 36px -apple-system, sans-serif';
    ctx.fillText(label, 30, 210);

    ctx.fillStyle = '#0f172a';
    ctx.font = '600 20px monospace';
    ctx.textAlign = 'center';
    ctx.fillText('BANKNOTE', 256, 130);

    return new THREE.CanvasTexture(canvas);
  }

  const redMoneyTexture = createBanknoteTexture('#be123c', '100.000');
  const blueMoneyTexture = createBanknoteTexture('#0284c7', '50.000');

  function buildMoneyGroup() {
    moneyGroup = new THREE.Group();
    // Placed on open right counter in front of employee
    moneyGroup.position.set(1.1, 1.215, -0.75);
    scene.add(moneyGroup);
  }

  // --- NPC EMPLOYEE (HANDOVER SALARY) ---
  const npc = {
    meshGroup: null,
    torso: null,
    head: null,
    leftArm: null,
    rightArm: null,
    leftLeg: null,
    rightLeg: null,
    nameTagMesh: null,
    nameTagCanvas: null,
    nameTagCtx: null,
    chatBubbleMesh: null,
    chatBubbleCanvas: null,
    chatBubbleCtx: null,
    heldMoneyMesh: null,
    pos: new THREE.Vector3(1.4, 0, -5.5),
    walkTime: 0,
    state: 'IDLE',
    timer: 0,
    onComplete: null
  };

  function buildNpcEmployee() {
    const group = new THREE.Group();
    group.position.copy(npc.pos);
    group.visible = false;

    const skinMat = new THREE.MeshStandardMaterial({ color: 0xfacc15, roughness: 0.35 });
    const shirtMat = new THREE.MeshStandardMaterial({ color: 0x0284c7, roughness: 0.5 });
    const pantsMat = new THREE.MeshStandardMaterial({ color: 0x334155, roughness: 0.6 });
    const hairMat = new THREE.MeshStandardMaterial({ color: 0x291d12, roughness: 0.7 });

    npc.torso = new THREE.Mesh(new THREE.BoxGeometry(0.42, 0.52, 0.24), shirtMat);
    npc.torso.position.y = 0.72;
    npc.torso.castShadow = true;
    group.add(npc.torso);

    const collar = new THREE.Mesh(
      new THREE.BoxGeometry(0.16, 0.08, 0.02),
      new THREE.MeshStandardMaterial({ color: 0xffffff })
    );
    collar.position.set(0, 0.22, 0.125);
    npc.torso.add(collar);

    const tie = new THREE.Mesh(
      new THREE.BoxGeometry(0.06, 0.26, 0.025),
      new THREE.MeshStandardMaterial({ color: 0xdc2626 })
    );
    tie.position.set(0, 0.06, 0.13);
    npc.torso.add(tie);

    const headGroup = new THREE.Group();
    headGroup.position.set(0, 1.16, 0);

    npc.head = new THREE.Mesh(new THREE.BoxGeometry(0.32, 0.32, 0.30), skinMat);
    npc.head.castShadow = true;
    headGroup.add(npc.head);

    const eyeGeo = new THREE.BoxGeometry(0.045, 0.045, 0.02);
    const blackMat = new THREE.MeshBasicMaterial({ color: 0x0a0a0a });
    const leftEye = new THREE.Mesh(eyeGeo, blackMat);
    leftEye.position.set(-0.08, 0.03, 0.155);
    npc.head.add(leftEye);

    const rightEye = new THREE.Mesh(eyeGeo, blackMat);
    rightEye.position.set(0.08, 0.03, 0.155);
    npc.head.add(rightEye);

    const smile = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.03, 0.02), blackMat);
    smile.position.set(0, -0.06, 0.155);
    npc.head.add(smile);

    const hair = new THREE.Mesh(new THREE.BoxGeometry(0.34, 0.08, 0.32), hairMat);
    hair.position.set(0, 0.16, 0);
    npc.head.add(hair);

    group.add(headGroup);

    const armGeo = new THREE.BoxGeometry(0.14, 0.44, 0.14);
    npc.leftArm = new THREE.Mesh(armGeo, shirtMat);
    npc.leftArm.position.set(-0.29, 0.68, 0);
    npc.leftArm.castShadow = true;
    group.add(npc.leftArm);

    const handL = new THREE.Mesh(new THREE.BoxGeometry(0.13, 0.12, 0.13), skinMat);
    handL.position.set(0, -0.22, 0);
    npc.leftArm.add(handL);

    npc.rightArm = new THREE.Mesh(armGeo, shirtMat);
    npc.rightArm.position.set(0.29, 0.68, 0);
    npc.rightArm.castShadow = true;
    group.add(npc.rightArm);

    const handR = new THREE.Mesh(new THREE.BoxGeometry(0.13, 0.12, 0.13), skinMat);
    handR.position.set(0, -0.22, 0);
    npc.rightArm.add(handR);

    const heldGeo = new THREE.BoxGeometry(0.36, 0.12, 0.22);
    const heldMat = new THREE.MeshStandardMaterial({ map: redMoneyTexture, roughness: 0.5 });
    npc.heldMoneyMesh = new THREE.Mesh(heldGeo, heldMat);
    npc.heldMoneyMesh.position.set(0, 0.52, 0.24);
    npc.heldMoneyMesh.visible = false;
    group.add(npc.heldMoneyMesh);

    const legGeo = new THREE.BoxGeometry(0.16, 0.46, 0.16);
    npc.leftLeg = new THREE.Mesh(legGeo, pantsMat);
    npc.leftLeg.position.set(-0.11, 0.23, 0);
    npc.leftLeg.castShadow = true;
    group.add(npc.leftLeg);

    npc.rightLeg = new THREE.Mesh(legGeo, pantsMat);
    npc.rightLeg.position.set(0.11, 0.23, 0);
    npc.rightLeg.castShadow = true;
    group.add(npc.rightLeg);

    npc.nameTagCanvas = document.createElement('canvas');
    npc.nameTagCanvas.width = 384;
    npc.nameTagCanvas.height = 96;
    npc.nameTagCtx = npc.nameTagCanvas.getContext('2d');
    const nameTex = new THREE.CanvasTexture(npc.nameTagCanvas);
    npc.nameTagMesh = new THREE.Mesh(
      new THREE.PlaneGeometry(0.9, 0.22),
      new THREE.MeshBasicMaterial({ map: nameTex, transparent: true, side: THREE.DoubleSide })
    );
    npc.nameTagMesh.position.set(0, 1.55, 0);
    group.add(npc.nameTagMesh);

    npc.chatBubbleCanvas = document.createElement('canvas');
    npc.chatBubbleCanvas.width = 512;
    npc.chatBubbleCanvas.height = 160;
    npc.chatBubbleCtx = npc.chatBubbleCanvas.getContext('2d');
    drawChatBubble(npc.chatBubbleCtx, 'Terima kasih! Gaji sudah saya terima. 🙏');
    const chatTex = new THREE.CanvasTexture(npc.chatBubbleCanvas);
    npc.chatBubbleMesh = new THREE.Mesh(
      new THREE.PlaneGeometry(1.6, 0.5),
      new THREE.MeshBasicMaterial({ map: chatTex, transparent: true, side: THREE.DoubleSide })
    );
    npc.chatBubbleMesh.position.set(0, 1.95, 0);
    npc.chatBubbleMesh.visible = false;
    group.add(npc.chatBubbleMesh);

    npc.meshGroup = group;
    scene.add(group);
  }

  function drawNameTag(ctx, name) {
    if (!ctx) return;
    const w = 384, h = 96;
    ctx.clearRect(0, 0, w, h);
    ctx.fillStyle = 'rgba(15, 23, 42, 0.9)';
    ctx.strokeStyle = '#38bdf8';
    ctx.lineWidth = 3;
    ctx.strokeRect(6, 6, w - 12, h - 12);
    ctx.fillRect(6, 6, w - 12, h - 12);

    ctx.fillStyle = '#ffffff';
    ctx.font = '600 32px -apple-system, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(name, w / 2, h / 2);
  }

  function drawChatBubble(ctx, text) {
    if (!ctx) return;
    const w = 512, h = 160;
    ctx.clearRect(0, 0, w, h);
    ctx.fillStyle = '#0f172a';
    ctx.strokeStyle = '#10b981';
    ctx.lineWidth = 3;
    ctx.strokeRect(6, 6, w - 12, h - 36);
    ctx.fillRect(6, 6, w - 12, h - 36);

    ctx.fillStyle = '#0f172a';
    ctx.beginPath();
    ctx.moveTo(w / 2 - 12, h - 36);
    ctx.lineTo(w / 2, h - 8);
    ctx.lineTo(w / 2 + 12, h - 36);
    ctx.fill();

    ctx.fillStyle = '#ffffff';
    ctx.font = '600 24px -apple-system, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(text, w / 2, (h - 36) / 2);
  }

  function handoverSalary(data, onComplete) {
    if (npc.state !== 'IDLE') return;

    const names = {
      A: 'Budi (Gol. A)',
      B: 'Siti (Gol. B)',
      C: 'Rudi (Gol. C)'
    };
    const colors = {
      A: 0x0284c7,
      B: 0x059669,
      C: 0x7c3aed
    };

    const gol = data && data.golongan ? data.golongan : 'A';
    const empName = names[gol] || 'Karyawan';
    const shirtColor = colors[gol] || 0x0284c7;

    if (npc.torso) npc.torso.material.color.setHex(shirtColor);
    if (npc.leftArm) npc.leftArm.material.color.setHex(shirtColor);
    if (npc.rightArm) npc.rightArm.material.color.setHex(shirtColor);

    drawNameTag(npc.nameTagCtx, empName);
    if (npc.nameTagMesh && npc.nameTagMesh.material.map) {
      npc.nameTagMesh.material.map.needsUpdate = true;
    }

    if (npc.heldMoneyMesh) npc.heldMoneyMesh.visible = false;
    if (npc.chatBubbleMesh) {
      npc.chatBubbleMesh.visible = false;
      npc.chatBubbleMesh.scale.set(0.01, 0.01, 0.01);
    }

    // Spawn from the left side of the player (x = -4.5)
    npc.pos.set(-4.5, 0, 1.4);
    npc.meshGroup.position.copy(npc.pos);
    npc.meshGroup.rotation.y = Math.PI / 2; // Walk right toward player's chair
    npc.meshGroup.visible = true;

    // Turn camera slightly to the left toward the approaching NPC
    if (player.isSitting) {
      cameraYaw = Math.PI + 0.35;
      cameraPitch = -0.10;
    }

    npc.walkTime = 0;
    npc.timer = 0;
    npc.state = 'WALKING_IN';
    npc.onComplete = onComplete;

    updateMonitor('Proses', 'Menyerahkan gaji...');
  }

  function updateNpc(delta) {
    if (npc.state === 'IDLE' || !npc.meshGroup) return;

    if (camera) {
      if (npc.nameTagMesh) npc.nameTagMesh.quaternion.copy(camera.quaternion);
      if (npc.chatBubbleMesh) npc.chatBubbleMesh.quaternion.copy(camera.quaternion);
    }

    const walkSpeed = 2.4;
    const targetDeskX = -0.95; // Right beside the player's chair on their left

    if (npc.state === 'WALKING_IN') {
      npc.walkTime += delta * 10;
      npc.pos.x += walkSpeed * delta;
      SoundFX.step();

      const armAmp = 0.65, legAmp = 0.75;
      npc.leftArm.rotation.x = Math.sin(npc.walkTime) * armAmp;
      npc.rightArm.rotation.x = -Math.sin(npc.walkTime) * armAmp;
      npc.leftLeg.rotation.x = -Math.sin(npc.walkTime) * legAmp;
      npc.rightLeg.rotation.x = Math.sin(npc.walkTime) * legAmp;

      npc.meshGroup.position.copy(npc.pos);
      npc.meshGroup.rotation.y = Math.PI / 2; // Facing towards player

      if (npc.pos.x >= targetDeskX) {
        npc.pos.x = targetDeskX;
        npc.meshGroup.position.copy(npc.pos);

        // Turn slightly towards player and desk
        npc.meshGroup.rotation.y = Math.PI / 3;
        npc.leftLeg.rotation.x = 0;
        npc.rightLeg.rotation.x = 0;
        npc.state = 'TAKING_MONEY';
        npc.timer = 0;
      }
    } else if (npc.state === 'TAKING_MONEY') {
      npc.timer += delta;

      // Reach arms toward player/desk to take money
      npc.leftArm.rotation.x = THREE.MathUtils.lerp(npc.leftArm.rotation.x, -1.25, 0.15);
      npc.rightArm.rotation.x = THREE.MathUtils.lerp(npc.rightArm.rotation.x, -1.25, 0.15);

      if (npc.timer >= 0.4 && !npc.heldMoneyMesh.visible) {
        if (moneyGroup) {
          moneyGroup.scale.set(0, 0, 0);
        }
        npc.heldMoneyMesh.visible = true;
        SoundFX.cashGrab();

        npc.chatBubbleMesh.visible = true;
        updateMonitor('Lunas', 'Gaji telah diserahkan');
      }

      if (npc.chatBubbleMesh && npc.chatBubbleMesh.visible) {
        const s = Math.min(1, (npc.timer - 0.4) * 4);
        npc.chatBubbleMesh.scale.set(s, s, s);
      }

      if (npc.timer >= 2.6) {
        if (npc.chatBubbleMesh) npc.chatBubbleMesh.visible = false;
        npc.leftArm.rotation.x = -0.55;
        npc.rightArm.rotation.x = -0.55;
        npc.meshGroup.rotation.y = -Math.PI / 2; // Turn left to walk back out
        npc.state = 'WALKING_OUT';
        npc.walkTime = 0;
      }
    } else if (npc.state === 'WALKING_OUT') {
      npc.walkTime += delta * 10;
      npc.pos.x -= walkSpeed * delta;
      SoundFX.step();

      const legAmp = 0.75;
      npc.leftLeg.rotation.x = -Math.sin(npc.walkTime) * legAmp;
      npc.rightLeg.rotation.x = Math.sin(npc.walkTime) * legAmp;
      npc.leftArm.rotation.x = -0.55 + Math.sin(npc.walkTime) * 0.15;
      npc.rightArm.rotation.x = -0.55 - Math.sin(npc.walkTime) * 0.15;

      npc.meshGroup.position.copy(npc.pos);
      npc.meshGroup.rotation.y = -Math.PI / 2; // Facing walk out direction

      if (npc.pos.x <= -4.5) {
        npc.meshGroup.visible = false;
        npc.state = 'IDLE';
        if (typeof npc.onComplete === 'function') {
          npc.onComplete();
        }
      }
    }
  }

  // --- DYNAMIC MONITOR & HOLOGRAM CANVAS (ANTI-SLOP TEXT) ---
  function updateMonitor(status, detail) {
    if (!monitorCtx) return;
    const ctx = monitorCtx;
    const w = 1024, h = 512;

    ctx.fillStyle = '#090d16';
    ctx.fillRect(0, 0, w, h);

    // Clean border & header
    ctx.fillStyle = '#1e293b';
    ctx.fillRect(0, 0, w, 56);

    ctx.fillStyle = '#f8fafc';
    ctx.font = '600 20px -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif';
    ctx.fillText('Penghasilan Karyawan', 24, 36);

    ctx.fillStyle = '#38bdf8';
    ctx.font = '500 16px monospace';
    ctx.textAlign = 'right';
    ctx.fillText(status, w - 24, 36);
    ctx.textAlign = 'start';

    // Status message box
    ctx.fillStyle = '#0f172a';
    ctx.strokeStyle = '#1e293b';
    ctx.lineWidth = 1;
    ctx.strokeRect(24, 76, w - 48, 140);
    ctx.fillRect(24, 76, w - 48, 140);

    ctx.fillStyle = '#94a3b8';
    ctx.font = '15px -apple-system, sans-serif';
    ctx.fillText('Status:', 44, 115);

    ctx.fillStyle = '#f8fafc';
    ctx.font = '600 26px -apple-system, sans-serif';
    ctx.fillText(detail || 'Menunggu input...', 44, 160);

    // Array Tables
    drawArrayCard(ctx, 24, 236, 476, 240, 'ARRAY_GAJI', [
      'Indeks 0: Rp 5.000.000 (Gol A)',
      'Indeks 1: Rp 6.500.000 (Gol B)',
      'Indeks 2: Rp 9.500.000 (Gol C)'
    ], currentGrade === 'A' ? 0 : (currentGrade === 'B' ? 1 : 2));

    drawArrayCard(ctx, 524, 236, 476, 240, 'ARRAY_LEMBUR', [
      'Indeks 0: 30% (1 jam)',
      'Indeks 1: 32% (2 jam)',
      'Indeks 2: 34% (3 jam)',
      'Indeks 3: 36% (4 jam)',
      'Indeks 4: 38% (≥5 jam)'
    ], -1);

    monitorTexture.needsUpdate = true;
  }

  function drawArrayCard(ctx, x, y, w, h, title, lines, activeIdx) {
    ctx.fillStyle = '#0f172a';
    ctx.strokeStyle = '#1e293b';
    ctx.lineWidth = 1;
    ctx.strokeRect(x, y, w, h);
    ctx.fillRect(x, y, w, h);

    ctx.fillStyle = '#38bdf8';
    ctx.font = '600 15px monospace';
    ctx.fillText(title, x + 18, y + 32);

    ctx.font = '14px monospace';
    lines.forEach((line, i) => {
      if (i === activeIdx) {
        ctx.fillStyle = '#34d399';
        ctx.fillText('• ' + line, x + 18, y + 68 + i * 32);
      } else {
        ctx.fillStyle = '#94a3b8';
        ctx.fillText('  ' + line, x + 18, y + 68 + i * 32);
      }
    });
  }

  // --- ID BADGE ---
  function buildIdBadge() {
    const badgeGroup = new THREE.Group();
    const stand = new THREE.Mesh(
      new THREE.CylinderGeometry(0.18, 0.22, 0.04, 20),
      new THREE.MeshStandardMaterial({ color: 0x475569, metalness: 0.9, roughness: 0.2 })
    );
    stand.position.set(-1.4, 1.225, 0.4);
    badgeGroup.add(stand);

    idBadgeCanvas = document.createElement('canvas');
    idBadgeCanvas.width = 512;
    idBadgeCanvas.height = 768;
    idBadgeCtx = idBadgeCanvas.getContext('2d');
    idBadgeTexture = new THREE.CanvasTexture(idBadgeCanvas);

    idBadgeMesh = new THREE.Mesh(
      new THREE.BoxGeometry(0.55, 0.85, 0.02),
      new THREE.MeshStandardMaterial({ map: idBadgeTexture, roughness: 0.25 })
    );
    idBadgeMesh.position.set(-1.4, 1.66, 0.4);
    idBadgeMesh.rotation.y = 0.35;
    idBadgeMesh.castShadow = true;
    badgeGroup.add(idBadgeMesh);

    scene.add(badgeGroup);
  }

  function updateIdBadge(grade, salary) {
    if (!idBadgeCtx) return;
    const ctx = idBadgeCtx;
    const w = 512, h = 768;
    const cfg = GRADE_CONFIG[grade] || GRADE_CONFIG['A'];

    ctx.fillStyle = '#0f172a';
    ctx.fillRect(0, 0, w, h);

    ctx.fillStyle = cfg.color;
    ctx.fillRect(0, 0, w, 130);

    ctx.fillStyle = '#090d16';
    ctx.font = '700 24px -apple-system, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('ID KARYAWAN', w / 2, 75);

    ctx.fillStyle = '#1e293b';
    ctx.beginPath();
    ctx.arc(w / 2, 260, 80, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = cfg.color;
    ctx.font = '700 90px -apple-system, sans-serif';
    ctx.fillText(grade, w / 2, 292);

    ctx.fillStyle = '#f8fafc';
    ctx.font = '600 30px -apple-system, sans-serif';
    ctx.fillText(cfg.name, w / 2, 385);

    ctx.fillStyle = '#94a3b8';
    ctx.font = '18px monospace';
    ctx.fillText(`Indeks [${cfg.index}]`, w / 2, 425);

    ctx.fillStyle = '#1e293b';
    ctx.fillRect(40, 480, w - 80, 110);

    ctx.fillStyle = '#94a3b8';
    ctx.font = '16px -apple-system, sans-serif';
    ctx.fillText('Gaji Pokok', w / 2, 515);

    ctx.fillStyle = '#34d399';
    ctx.font = '700 28px -apple-system, sans-serif';
    ctx.fillText('Rp ' + Number(salary).toLocaleString('id-ID'), w / 2, 558);

    ctx.textAlign = 'start';
    idBadgeTexture.needsUpdate = true;
  }

  // --- FLOATING HOLOGRAPHIC SLIP GAJI ---
  function buildHologramSlip() {
    hologramCanvas = document.createElement('canvas');
    hologramCanvas.width = 720;
    hologramCanvas.height = 960;
    hologramCtx = hologramCanvas.getContext('2d');
    hologramTexture = new THREE.CanvasTexture(hologramCanvas);

    hologramMesh = new THREE.Mesh(
      new THREE.PlaneGeometry(1.6, 2.13),
      new THREE.MeshStandardMaterial({
        map: hologramTexture,
        transparent: true,
        opacity: 0.92,
        roughness: 0.1,
        metalness: 0.3,
        side: THREE.DoubleSide
      })
    );
    hologramMesh.position.set(1.4, 2.15, 0.6);
    hologramMesh.rotation.y = -0.4;
    hologramMesh.rotation.x = -0.05;
    scene.add(hologramMesh);
  }

  function updateHologramSlip(data) {
    if (!hologramCtx) return;
    const ctx = hologramCtx;
    const w = 720, h = 960;

    ctx.clearRect(0, 0, w, h);

    ctx.fillStyle = 'rgba(11, 17, 32, 0.92)';
    ctx.strokeStyle = '#38bdf8';
    ctx.lineWidth = 3;
    ctx.strokeRect(16, 16, w - 32, h - 32);
    ctx.fillRect(16, 16, w - 32, h - 32);

    ctx.fillStyle = '#0284c7';
    ctx.fillRect(20, 20, w - 40, 80);

    ctx.fillStyle = '#ffffff';
    ctx.font = '700 28px -apple-system, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('SLIP GAJI', w / 2, 70);

    ctx.textAlign = 'start';
    let y = 160;
    const leftX = 50, rightX = w - 50;

    function drawSlipRow(label, value, isBold) {
      ctx.fillStyle = '#94a3b8';
      ctx.font = isBold ? '600 22px -apple-system, sans-serif' : '20px -apple-system, sans-serif';
      ctx.fillText(label, leftX, y);

      ctx.fillStyle = isBold ? '#38bdf8' : '#f8fafc';
      ctx.textAlign = 'right';
      ctx.font = isBold ? '700 24px -apple-system, sans-serif' : '20px -apple-system, sans-serif';
      ctx.fillText(value, rightX, y);

      ctx.textAlign = 'start';
      y += 56;

      ctx.strokeStyle = 'rgba(148, 163, 184, 0.15)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(leftX, y - 24);
      ctx.lineTo(rightX, y - 24);
      ctx.stroke();
    }

    drawSlipRow('Golongan', `Golongan ${data.golongan}`, true);
    drawSlipRow('Gaji Pokok', 'Rp ' + Number(data.gajiPokok).toLocaleString('id-ID'), false);
    drawSlipRow('Jam Lembur', `${data.jamLembur} Jam`, false);
    drawSlipRow('Persentase', `${data.persenLembur}%`, false);
    drawSlipRow('Uang Lembur', 'Rp ' + Number(data.gajiLembur).toLocaleString('id-ID'), false);

    // Total Box
    y += 16;
    ctx.fillStyle = 'rgba(16, 185, 129, 0.12)';
    ctx.strokeStyle = '#10b981';
    ctx.lineWidth = 2;
    ctx.strokeRect(40, y, w - 80, 110);
    ctx.fillRect(40, y, w - 80, 110);

    ctx.fillStyle = '#34d399';
    ctx.font = '600 18px -apple-system, sans-serif';
    ctx.fillText('Total Penghasilan', 60, y + 38);

    ctx.fillStyle = '#ffffff';
    ctx.font = '700 36px -apple-system, sans-serif';
    ctx.fillText('Rp ' + Number(data.totalPenghasilan).toLocaleString('id-ID'), 60, y + 84);

    hologramTexture.needsUpdate = true;
  }

  // --- MONEY STACKS SPAWNER ---
  function spawnMoneyStacks(gajiPokok, gajiLembur) {
    if (moneyGroup) {
      moneyGroup.scale.set(1, 1, 1);
    }
    while (moneyGroup.children.length > 0) {
      const obj = moneyGroup.children[0];
      moneyGroup.remove(obj);
      if (obj.geometry) obj.geometry.dispose();
    }

    const pokokStacks = Math.round(gajiPokok / 1000000);
    const lemburStacks = Math.max(1, Math.round(gajiLembur / 500000));

    const stackGeo = new THREE.BoxGeometry(0.5, 0.08, 0.28);
    const redMat = new THREE.MeshStandardMaterial({ map: redMoneyTexture, roughness: 0.5 });
    const blueMat = new THREE.MeshStandardMaterial({ map: blueMoneyTexture, roughness: 0.5 });

    let index = 0;
    const cols = 2;
    const spacingX = 0.56, spacingZ = 0.34;

    function addStack(col, row, heightIdx, mat) {
      const mesh = new THREE.Mesh(stackGeo, mat);
      const targetX = (col - 0.5) * spacingX;
      const targetZ = (row - 0.5) * spacingZ;
      const targetY = heightIdx * 0.085;

      mesh.position.set(targetX, targetY + 1.0 + Math.random() * 0.4, targetZ);
      mesh.rotation.y = (Math.random() - 0.5) * 0.12;
      mesh.castShadow = true;
      moneyGroup.add(mesh);

      const startY = mesh.position.y;
      const startTime = performance.now() + index * 40;
      index++;

      const dropAnim = (now) => {
        if (now < startTime) {
          requestAnimationFrame(dropAnim);
          return;
        }
        const progress = Math.min((now - startTime) / 340, 1);
        mesh.position.y = startY + (targetY - startY) * easeOutBounce(progress);
        if (progress < 1) requestAnimationFrame(dropAnim);
      };
      requestAnimationFrame(dropAnim);
    }

    let curCol = 0, curRow = 0, curHeight = 0;
    for (let i = 0; i < pokokStacks; i++) {
      addStack(curCol, curRow, curHeight, redMat);
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

    if (gajiLembur > 0) {
      for (let j = 0; j < lemburStacks; j++) {
        addStack(j % cols, Math.floor(j / cols) % 2, curHeight + 1 + Math.floor(j / 4), blueMat);
      }
    }
  }

  function triggerCelebration() {
    const coinGeo = new THREE.CylinderGeometry(0.08, 0.08, 0.02, 12);
    const coinMat = new THREE.MeshStandardMaterial({
      color: 0xf59e0b,
      metalness: 0.9,
      roughness: 0.2
    });

    const spawnOrigin = new THREE.Vector3(0.6, 1.5, 0.4);

    for (let i = 0; i < 25; i++) {
      const coin = new THREE.Mesh(coinGeo, coinMat);
      coin.position.copy(spawnOrigin);
      coin.position.x += (Math.random() - 0.5) * 0.4;
      coin.position.z += (Math.random() - 0.5) * 0.4;

      const velocity = new THREE.Vector3(
        (Math.random() - 0.5) * 2.4,
        Math.random() * 3.0 + 1.8,
        (Math.random() - 0.5) * 2.4
      );

      const rotSpeed = new THREE.Vector3(
        (Math.random() - 0.5) * 8,
        (Math.random() - 0.5) * 8,
        (Math.random() - 0.5) * 8
      );

      scene.add(coin);
      coinParticles.push({ mesh: coin, velocity, rotSpeed, birth: performance.now() });
    }
  }

  function updateCoinParticles(delta) {
    const gravity = -9.8;
    const floorY = 1.22;

    for (let i = coinParticles.length - 1; i >= 0; i--) {
      const p = coinParticles[i];
      p.velocity.y += gravity * delta;
      p.mesh.position.addScaledVector(p.velocity, delta);

      p.mesh.rotation.x += p.rotSpeed.x * delta;
      p.mesh.rotation.y += p.rotSpeed.y * delta;

      if (p.mesh.position.y <= floorY) {
        p.mesh.position.y = floorY;
        p.velocity.y = -p.velocity.y * 0.35;
        p.velocity.x *= 0.7;
        p.velocity.z *= 0.7;
      }

      if (performance.now() - p.birth > 3000) {
        scene.remove(p.mesh);
        p.mesh.geometry.dispose();
        coinParticles.splice(i, 1);
      }
    }
  }

  // --- STEAM PARTICLES ---
  function buildSteamParticles() {
    const count = 15;
    const geo = new THREE.BufferGeometry();
    const positions = new Float32Array(count * 3);

    for (let i = 0; i < count; i++) {
      positions[i * 3] = -1.6 + (Math.random() - 0.5) * 0.08;
      positions[i * 3 + 1] = 1.41 + Math.random() * 0.4;
      positions[i * 3 + 2] = -0.5 + (Math.random() - 0.5) * 0.08;
    }

    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    const mat = new THREE.PointsMaterial({ color: 0xffffff, size: 0.04, transparent: true, opacity: 0.3 });
    steamParticles = new THREE.Points(geo, mat);
    scene.add(steamParticles);
  }

  function updateSteam(delta) {
    if (!steamParticles) return;
    const pos = steamParticles.geometry.attributes.position.array;
    for (let i = 0; i < pos.length; i += 3) {
      pos[i + 1] += delta * 0.22;
      pos[i] += Math.sin(pos[i + 1] * 10) * 0.001;
      if (pos[i + 1] > 1.9) {
        pos[i + 1] = 1.41;
        pos[i] = -1.6 + (Math.random() - 0.5) * 0.08;
        pos[i + 2] = -0.5 + (Math.random() - 0.5) * 0.08;
      }
    }
    steamParticles.geometry.attributes.position.needsUpdate = true;
  }

  function easeOutBounce(x) {
    const n1 = 7.5625;
    const d1 = 2.75;
    if (x < 1 / d1) return n1 * x * x;
    else if (x < 2 / d1) return n1 * (x -= 1.5 / d1) * x + 0.75;
    else if (x < 2.5 / d1) return n1 * (x -= 2.25 / d1) * x + 0.9375;
    else return n1 * (x -= 2.625 / d1) * x + 0.984375;
  }

  // --- INPUT CONTROLS ---
  function clampPitch() {
    const maxPitch = player.isSitting ? Math.PI / 3.0 : Math.PI / 2.3;
    const minPitch = player.isSitting ? -Math.PI / 2.8 : -Math.PI / 2.3;
    cameraPitch = Math.max(minPitch, Math.min(maxPitch, cameraPitch));
  }

  function setupInputControls() {
    const canvas = renderer.domElement;

    canvas.addEventListener('click', () => {
      if (!player.isSitting) {
        canvas.requestPointerLock();
      }
    });

    document.addEventListener('pointerlockchange', () => {
      isPointerLocked = document.pointerLockElement === canvas;
      const crosshair = document.getElementById('roblox-crosshair');
      if (crosshair) {
        crosshair.style.display = isPointerLocked ? 'block' : 'none';
      }
    });

    canvas.addEventListener('mousedown', (e) => {
      if (!isPointerLocked) {
        isDraggingCanvas = true;
        previousMousePos = { x: e.clientX, y: e.clientY };
      }
    });

    window.addEventListener('mouseup', () => {
      isDraggingCanvas = false;
    });

    // Mouse Wheel Zoom in Seated Mode (Bounded at current POV)
    canvas.addEventListener('wheel', (e) => {
      if (player.isSitting) {
        e.preventDefault();
        // Scroll up (deltaY < 0) = zoom in, Scroll down (deltaY > 0) = zoom out
        const zoomDelta = -e.deltaY * 0.0018;
        targetSeatedZoom = Math.max(0, Math.min(1, targetSeatedZoom + zoomDelta));
      }
    }, { passive: false });

    window.addEventListener('mousemove', (e) => {
      // Lock camera rotation while NPC interaction is active
      if (npc.state !== 'IDLE') return;

      if (isPointerLocked) {
        const sensitivity = 0.0024;
        cameraYaw -= e.movementX * sensitivity;
        cameraPitch -= e.movementY * sensitivity;
        clampPitch();
      } else if (isDraggingCanvas) {
        const deltaX = e.clientX - previousMousePos.x;
        const deltaY = e.clientY - previousMousePos.y;
        previousMousePos = { x: e.clientX, y: e.clientY };

        const sensitivity = 0.004;
        cameraYaw -= deltaX * sensitivity;
        cameraPitch -= deltaY * sensitivity;
        clampPitch();
      }
    });

    window.addEventListener('keydown', (e) => {
      if (document.activeElement && (document.activeElement.tagName === 'INPUT' || document.activeElement.tagName === 'SELECT')) {
        if (e.code === 'Escape') {
          document.activeElement.blur();
          if (player.isSitting) standUp();
        }
        return;
      }

      switch (e.code) {
        case 'KeyW':
        case 'ArrowUp':
          keys.forward = true;
          break;
        case 'KeyS':
        case 'ArrowDown':
          keys.backward = true;
          break;
        case 'KeyA':
        case 'ArrowLeft':
          keys.left = true;
          break;
        case 'KeyD':
        case 'ArrowRight':
          keys.right = true;
          break;
        case 'Space':
          if (player.isGrounded && !player.isSitting) {
            player.vel.y = player.jumpForce;
            player.isGrounded = false;
            SoundFX.jump();
          }
          break;
        case 'ShiftLeft':
        case 'ShiftRight':
          keys.sprint = true;
          break;
        case 'KeyE':
          if (isNearChair && !player.isSitting) {
            sitDownAtChair();
          } else if (player.isSitting) {
            standUp();
          }
          break;
        case 'Escape':
          if (player.isSitting) {
            standUp();
          }
          break;
        case 'Tab':
        case 'KeyV':
          e.preventDefault();
          togglePovMode();
          break;
      }
    });

    window.addEventListener('keyup', (e) => {
      switch (e.code) {
        case 'KeyW':
        case 'ArrowUp':
          keys.forward = false;
          break;
        case 'KeyS':
        case 'ArrowDown':
          keys.backward = false;
          break;
        case 'KeyA':
        case 'ArrowLeft':
          keys.left = false;
          break;
        case 'KeyD':
        case 'ArrowRight':
          keys.right = false;
          break;
        case 'ShiftLeft':
        case 'ShiftRight':
          keys.sprint = false;
          break;
      }
    });

    window.addEventListener('resize', onWindowResize);
  }

  function togglePovMode() {
    povMode = povMode === 'FPS' ? 'THIRD_PERSON' : 'FPS';
    const tag = document.getElementById('pov-mode-text');
    if (tag) {
      tag.textContent = povMode === 'FPS' ? '1st Person' : '3rd Person';
    }
  }

  // --- SITTING & STANDING (TALL ELEVATED SEATED POV) ---
  function sitDownAtChair() {
    player.isSitting = true;
    document.exitPointerLock();

    // Reset zoom state to default POV
    targetSeatedZoom = 0;
    seatedZoom = 0;
    if (camera) {
      camera.fov = 65;
      camera.updateProjectionMatrix();
    }

    // Position player body neatly in chair
    player.pos.set(chairPos.x, 0.55, chairPos.z - 0.05);
    if (player.meshGroup) {
      player.meshGroup.position.copy(player.pos);
      player.meshGroup.rotation.y = Math.PI;

      player.leftLeg.rotation.x = -Math.PI / 2;
      player.rightLeg.rotation.x = -Math.PI / 2;
      player.leftArm.rotation.x = -0.55;
      player.rightArm.rotation.x = -0.55;
    }

    // Camera initial orientation when sitting
    cameraYaw = Math.PI;
    cameraPitch = -0.15; // Natural downward glance at keyboard & monitor

    SoundFX.sit();

    const prompt = document.getElementById('interaction-prompt');
    if (prompt) prompt.classList.remove('visible');

    const seatedBanner = document.getElementById('seated-banner');
    if (seatedBanner) seatedBanner.classList.add('visible');

    const terminalDrawer = document.getElementById('terminal-drawer');
    if (terminalDrawer) terminalDrawer.classList.add('open');
  }

  function standUp() {
    if (!player.isSitting) return;
    player.isSitting = false;

    // Reset zoom state
    targetSeatedZoom = 0;
    seatedZoom = 0;
    if (camera) {
      camera.fov = 65;
      camera.updateProjectionMatrix();
    }

    player.pos.set(chairPos.x, 0, chairPos.z + 1.2);
    if (player.meshGroup) {
      player.meshGroup.position.copy(player.pos);
      player.meshGroup.rotation.y = Math.PI;
      player.leftLeg.rotation.x = 0;
      player.rightLeg.rotation.x = 0;
      player.leftArm.rotation.x = 0;
      player.rightArm.rotation.x = 0;
    }

    cameraYaw = Math.PI;
    cameraPitch = -0.06;

    SoundFX.stand();

    const seatedBanner = document.getElementById('seated-banner');
    if (seatedBanner) seatedBanner.classList.remove('visible');

    const terminalDrawer = document.getElementById('terminal-drawer');
    if (terminalDrawer) terminalDrawer.classList.remove('open');
  }

  // --- PLAYER MOVEMENT (POV-BASED) ---
  function updatePlayerPhysics(delta) {
    if (player.isSitting) return;

    const fx = Math.sin(cameraYaw);
    const fz = Math.cos(cameraYaw);
    const forward = new THREE.Vector3(fx, 0, fz).normalize();
    const right = new THREE.Vector3().crossVectors(forward, new THREE.Vector3(0, 1, 0)).normalize();

    const moveDir = new THREE.Vector3();
    if (keys.forward)  moveDir.add(forward);
    if (keys.backward) moveDir.sub(forward);
    if (keys.right)    moveDir.add(right);
    if (keys.left)     moveDir.sub(right);

    const isMoving = moveDir.lengthSq() > 0.0001;
    const currentSpeed = keys.sprint ? player.sprintSpeed : player.speed;

    if (isMoving) {
      moveDir.normalize();
      const moveDist = currentSpeed * delta;
      const targetPos = player.pos.clone().addScaledVector(moveDir, moveDist);

      targetPos.x = Math.max(-6.5, Math.min(6.5, targetPos.x));
      targetPos.z = Math.max(-6.5, Math.min(6.5, targetPos.z));

      let canMove = true;
      for (const col of colliders) {
        if (
          targetPos.x > col.minX &&
          targetPos.x < col.maxX &&
          targetPos.z > col.minZ &&
          targetPos.z < col.maxZ
        ) {
          canMove = false;
          break;
        }
      }

      if (canMove) {
        player.pos.copy(targetPos);
      }

      SoundFX.step();
      player.walkTime += delta * (keys.sprint ? 14 : 9);

      if (player.leftArm && player.rightArm && player.leftLeg && player.rightLeg) {
        const armAmp = 0.65, legAmp = 0.75;
        player.leftArm.rotation.x = Math.sin(player.walkTime) * armAmp;
        player.rightArm.rotation.x = -Math.sin(player.walkTime) * armAmp;
        player.leftLeg.rotation.x = -Math.sin(player.walkTime) * legAmp;
        player.rightLeg.rotation.x = Math.sin(player.walkTime) * legAmp;
      }

      if (player.meshGroup) {
        const lookAngle = Math.atan2(moveDir.x, moveDir.z);
        player.meshGroup.rotation.y = THREE.MathUtils.lerp(player.meshGroup.rotation.y, lookAngle, 0.2);
      }
    } else {
      if (player.leftArm && player.rightArm && player.leftLeg && player.rightLeg) {
        player.leftArm.rotation.x = THREE.MathUtils.lerp(player.leftArm.rotation.x, 0, 0.15);
        player.rightArm.rotation.x = THREE.MathUtils.lerp(player.rightArm.rotation.x, 0, 0.15);
        player.leftLeg.rotation.x = THREE.MathUtils.lerp(player.leftLeg.rotation.x, 0, 0.15);
        player.rightLeg.rotation.x = THREE.MathUtils.lerp(player.rightLeg.rotation.x, 0, 0.15);
      }
    }

    const gravity = -14.0;
    player.vel.y += gravity * delta;
    player.pos.y += player.vel.y * delta;

    if (player.pos.y <= 0) {
      player.pos.y = 0;
      player.vel.y = 0;
      player.isGrounded = true;
    }

    if (player.meshGroup) {
      player.meshGroup.position.copy(player.pos);
    }

    const distToChair = player.pos.distanceTo(chairPos);
    isNearChair = distToChair < CHAIR_INTERACTION_DIST;
    const prompt = document.getElementById('interaction-prompt');
    if (prompt) {
      prompt.classList.toggle('visible', isNearChair && !player.isSitting);
    }
  }

  // --- CAMERA UPDATE (TALL, UNCLIPPED SEATED POV WITH WHEEL ZOOM) ---
  function updateCamera() {
    // 1. SEATED MODE
    if (player.isSitting) {
      // Auto-focus and track NPC while handover interaction is active
      if (npc.state !== 'IDLE' && npc.meshGroup && npc.meshGroup.visible) {
        const npcHead = new THREE.Vector3(npc.pos.x, 1.35, npc.pos.z);
        camera.position.set(chairPos.x, 1.78, chairPos.z - 0.15);
        camera.lookAt(npcHead);

        // Sync yaw and pitch so view seamlessly unlocks when NPC leaves
        const dir = npcHead.clone().sub(camera.position).normalize();
        cameraYaw = Math.atan2(dir.x, dir.z);
        cameraPitch = Math.asin(dir.y);

        if (player.meshGroup) player.meshGroup.visible = false;
        return;
      }

      // Smoothly interpolate zoom level (bounded between 0 = default POV and 1 = max zoom)
      seatedZoom = THREE.MathUtils.lerp(seatedZoom, targetSeatedZoom, 0.15);

      const lookDir = new THREE.Vector3(
        Math.sin(cameraYaw) * Math.cos(cameraPitch),
        Math.sin(cameraPitch),
        Math.cos(cameraYaw) * Math.cos(cameraPitch)
      );

      if (povMode === 'FPS') {
        // FOV narrows smoothly from 65° down to 32° when zooming in
        camera.fov = THREE.MathUtils.lerp(65, 32, seatedZoom);
        camera.updateProjectionMatrix();

        // Forward dolly along look direction (up to 0.45m toward target)
        const forwardDolly = seatedZoom * 0.45;
        const baseEyePos = new THREE.Vector3(chairPos.x, 1.78, chairPos.z - 0.15);
        camera.position.copy(baseEyePos).addScaledVector(lookDir, forwardDolly);
        camera.lookAt(camera.position.clone().add(lookDir));

        if (player.meshGroup) {
          player.meshGroup.visible = false;
        }
      } else {
        // 3rd Person Seated: Distance moves closer from 2.4 down to 1.3
        if (player.meshGroup) {
          player.meshGroup.visible = true;
        }

        camera.fov = THREE.MathUtils.lerp(65, 45, seatedZoom);
        camera.updateProjectionMatrix();

        const camDist = THREE.MathUtils.lerp(2.4, 1.3, seatedZoom);
        const targetCamPos = new THREE.Vector3(
          chairPos.x - Math.sin(cameraYaw) * camDist,
          THREE.MathUtils.lerp(2.05, 1.6, seatedZoom) - Math.sin(cameraPitch) * 1.2,
          (chairPos.z + 0.4) - Math.cos(cameraYaw) * camDist
        );

        camera.position.lerp(targetCamPos, 0.18);
        camera.lookAt(new THREE.Vector3(chairPos.x, 1.35, chairPos.z - 0.5));
      }
      return;
    }

    // Ensure FOV is default 65 when walking
    if (camera.fov !== 65) {
      camera.fov = 65;
      camera.updateProjectionMatrix();
    }

    // 2. WALKING MODES
    if (povMode === 'FPS') {
      camera.position.set(player.pos.x, player.pos.y + 1.62, player.pos.z);

      const lookDir = new THREE.Vector3(
        Math.sin(cameraYaw) * Math.cos(cameraPitch),
        Math.sin(cameraPitch),
        Math.cos(cameraYaw) * Math.cos(cameraPitch)
      );

      camera.lookAt(camera.position.clone().add(lookDir));

      if (player.meshGroup) {
        player.meshGroup.visible = false;
      }
    } else {
      if (player.meshGroup) {
        player.meshGroup.visible = true;
      }

      const camDist = 3.4;
      const camHeight = 1.6;
      const targetCamPos = new THREE.Vector3(
        player.pos.x - Math.sin(cameraYaw) * camDist,
        player.pos.y + camHeight - Math.sin(cameraPitch) * 1.5,
        player.pos.z - Math.cos(cameraYaw) * camDist
      );

      camera.position.lerp(targetCamPos, 0.15);
      camera.lookAt(new THREE.Vector3(player.pos.x, player.pos.y + 1.2, player.pos.z));
    }
  }

  function onWindowResize() {
    if (!container || !camera || !renderer) return;
    const w = container.clientWidth;
    const h = container.clientHeight;
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    renderer.setSize(w, h);
  }

  function animate() {
    requestAnimationFrame(animate);

    const delta = clock.getDelta();
    const time = clock.getElapsedTime();

    if (hologramMesh) {
      hologramMesh.position.y = 2.15 + Math.sin(time * 2.2) * 0.05;
      hologramMesh.rotation.y = -0.4 + Math.sin(time * 1.2) * 0.04;
    }

    updatePlayerPhysics(delta);
    updateCamera();
    updateNpc(delta);

    updateCoinParticles(delta);
    updateSteam(delta);

    renderer.render(scene, camera);
  }

  // --- PUBLIC API ---
  window.Payroll3D = {
    init,
    sitDown: sitDownAtChair,
    standUp: standUp,
    togglePov: togglePovMode,
    isSitting() {
      return player.isSitting;
    },
    setGrade(grade) {
      currentGrade = grade;
      const cfg = GRADE_CONFIG[grade] || GRADE_CONFIG['A'];
      updateIdBadge(grade, cfg.salary);
      updateMonitor('Siap', `Golongan ${grade}`);
      SoundFX.click();
    },
    startCalculating() {
      updateMonitor('Menghitung', 'Memproses kalkulasi...');
      SoundFX.click();
    },
    showResult(data) {
      updateMonitor('Selesai', `Total: Rp ${Number(data.totalPenghasilan).toLocaleString('id-ID')}`);
      updateHologramSlip(data);
      spawnMoneyStacks(data.gajiPokok, data.gajiLembur);
      triggerCelebration();
      SoundFX.chime();
    },
    showError(msg) {
      updateMonitor('Error', msg);
    },
    handoverSalary(data, onComplete) {
      handoverSalary(data, onComplete);
    },
    toggleMute() {
      SoundFX.muted = !SoundFX.muted;
      return SoundFX.muted;
    }
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
