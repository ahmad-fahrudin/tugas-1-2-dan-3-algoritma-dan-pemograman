/**
 * Payroll3D & Roblox Office Simulator
 * Tugas 3: Algoritma dan Pemrograman (Operator, IF, dan Array)
 * Features:
 * - FPS & 3rd-Person POV Roblox Character
 * - WASD + Mouse Look (Pointer Lock)
 * - Office Room with City View Window, Ergonomic Chair & Desk
 * - Press [E] to Sit Down at Chair & Open Salary Terminal
 * - Press [ESC] to Stand Up & Resume Walking
 * - Interactive 3D Banknote Stacks, Monitor Screen, Holographic Slip & Coin Burst
 * - Pure Native JS + Three.js (Zero Node.js dependency)
 */

(function () {
  'use strict';

  // --- ENGINE & STATE ---
  let scene, camera, renderer;
  let container;
  let clock;

  // Camera & POV State
  let povMode = 'FPS'; // 'FPS' | 'THIRD_PERSON' | 'SEATED'
  let cameraYaw = 0;
  let cameraPitch = 0;
  let isPointerLocked = false;

  // Player State
  const player = {
    pos: new THREE.Vector3(0, 0, 4.5), // Start in the room facing desk
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

  // Keyboard Keys
  const keys = {
    forward: false,
    backward: false,
    left: false,
    right: false,
    jump: false,
    sprint: false
  };

  // Chair & Interaction Target
  const chairPos = new THREE.Vector3(0, 0, 1.45);
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

  // Colliders for Room
  const colliders = [
    // Desk AABB
    { minX: -2.3, maxX: 2.3, minZ: -1.4, maxZ: 0.4 },
    // Bookshelf
    { minX: -6.8, maxX: -4.8, minZ: -6.8, maxZ: -5.8 },
    // Water Dispenser
    { minX: 4.8, maxX: 6.2, minZ: -6.8, maxZ: -5.8 },
    // Filing Cabinet
    { minX: -6.8, maxX: -5.5, minZ: 2.0, maxZ: 4.5 }
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
    }
  };

  // --- INITIALIZATION ---
  function init() {
    container = document.getElementById('canvas3d-container');
    if (!container || !window.THREE) {
      console.warn('Canvas container or THREE.js not available.');
      return;
    }

    clock = new THREE.Clock();

    // 1. Scene
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x060913);
    scene.fog = new THREE.FogExp2(0x060913, 0.035);

    // 2. Camera
    const aspect = container.clientWidth / container.clientHeight;
    camera = new THREE.PerspectiveCamera(65, aspect, 0.1, 100);
    camera.position.set(player.pos.x, player.pos.y + 1.45, player.pos.z);

    // 3. Renderer
    renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: 'high-performance' });
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.15;
    container.appendChild(renderer.domElement);

    // 4. Lights
    setupLighting();

    // 5. Environment & Office Room
    buildOfficeRoom();
    buildWorkstationDesk();
    buildOfficeChair();
    buildComputer();
    buildIdBadge();
    buildHologramSlip();
    buildMoneyGroup();
    buildSteamParticles();

    // 6. Build 3D Roblox Player Model
    buildRobloxPlayer();

    // 7. Event Handlers (WASD, Mouse Look, Pointer Lock)
    setupInputControls();

    // Initial calculations & textures
    updateMonitor('READY', 'Sistem Siap Digunakan');
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
    // Ambient light
    const ambient = new THREE.AmbientLight(0x1e293b, 1.4);
    scene.add(ambient);

    // Ceiling Panel Light (Center)
    const ceilingLight = new THREE.PointLight(0xf8fafc, 2.2, 16);
    ceilingLight.position.set(0, 4.2, 0);
    ceilingLight.castShadow = true;
    ceilingLight.shadow.mapSize.width = 1024;
    ceilingLight.shadow.mapSize.height = 1024;
    ceilingLight.shadow.bias = -0.0005;
    scene.add(ceilingLight);

    // Warm Desk Lamp Spot
    const deskSpot = new THREE.SpotLight(0xfef08a, 2.8, 8, Math.PI / 3.5, 0.4, 1);
    deskSpot.position.set(-1.8, 2.8, 0.8);
    deskSpot.target.position.set(0, 1.2, 0.3);
    deskSpot.castShadow = true;
    scene.add(deskSpot);
    scene.add(deskSpot.target);

    // Cyan Neon Accent Light from Window/Walls
    const cyanLight = new THREE.PointLight(0x38bdf8, 1.8, 14);
    cyanLight.position.set(5.5, 3.0, 1.0);
    scene.add(cyanLight);

    // Emerald Terminal Glow
    const greenLight = new THREE.PointLight(0x10b981, 1.2, 5);
    greenLight.position.set(1.4, 2.2, 0.5);
    scene.add(greenLight);
  }

  // --- OFFICE ROOM CONSTRUCTION ---
  function buildOfficeRoom() {
    const roomGroup = new THREE.Group();

    // 1. Floor (Parquet Wood & Grid Trim)
    const floorGeo = new THREE.PlaneGeometry(14, 14);
    const floorMat = new THREE.MeshStandardMaterial({
      color: 0x111827,
      roughness: 0.45,
      metalness: 0.15
    });
    const floorMesh = new THREE.Mesh(floorGeo, floorMat);
    floorMesh.rotation.x = -Math.PI / 2;
    floorMesh.position.y = 0;
    floorMesh.receiveShadow = true;
    roomGroup.add(floorMesh);

    // Subtle Rug under Desk
    const rugGeo = new THREE.PlaneGeometry(6, 5);
    const rugMat = new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.9 });
    const rug = new THREE.Mesh(rugGeo, rugMat);
    rug.rotation.x = -Math.PI / 2;
    rug.position.set(0, 0.005, 0.5);
    rug.receiveShadow = true;
    roomGroup.add(rug);

    // 2. Ceiling
    const ceilGeo = new THREE.PlaneGeometry(14, 14);
    const ceilMat = new THREE.MeshStandardMaterial({ color: 0x0b101d, roughness: 0.8 });
    const ceiling = new THREE.Mesh(ceilGeo, ceilMat);
    ceiling.rotation.x = Math.PI / 2;
    ceiling.position.y = 4.5;
    roomGroup.add(ceiling);

    // Ceiling Light Fixture
    const lightFixtureGeo = new THREE.BoxGeometry(3, 0.1, 2);
    const lightFixtureMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
    const fixture = new THREE.Mesh(lightFixtureGeo, lightFixtureMat);
    fixture.position.set(0, 4.45, 0);
    roomGroup.add(fixture);

    // 3. Back Wall (z = -7) with Acoustic Wooden Slats & Company Plaque
    const backWallGeo = new THREE.PlaneGeometry(14, 4.5);
    const wallMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.7 });
    const backWall = new THREE.Mesh(backWallGeo, wallMat);
    backWall.position.set(0, 2.25, -7);
    backWall.receiveShadow = true;
    roomGroup.add(backWall);

    // Company Wall Plaque
    const plaqueGeo = new THREE.BoxGeometry(4.2, 1.1, 0.08);
    const plaqueMat = new THREE.MeshStandardMaterial({ color: 0x090d16, metalness: 0.8, roughness: 0.2 });
    const plaque = new THREE.Mesh(plaqueGeo, plaqueMat);
    plaque.position.set(0, 3.0, -6.92);
    roomGroup.add(plaque);

    // Plaque Neon Glow Bar
    const glowBarGeo = new THREE.BoxGeometry(4.4, 0.05, 0.04);
    const glowBarMat = new THREE.MeshBasicMaterial({ color: 0x38bdf8 });
    const glowBar = new THREE.Mesh(glowBarGeo, glowBarMat);
    glowBar.position.set(0, 3.6, -6.9);
    roomGroup.add(glowBar);

    // 4. Front Wall (z = 7)
    const frontWall = new THREE.Mesh(backWallGeo, wallMat);
    frontWall.rotation.y = Math.PI;
    frontWall.position.set(0, 2.25, 7);
    frontWall.receiveShadow = true;
    roomGroup.add(frontWall);

    // 5. Left Wall (x = -7) with Bookshelves
    const sideWallGeo = new THREE.PlaneGeometry(14, 4.5);
    const leftWall = new THREE.Mesh(sideWallGeo, wallMat);
    leftWall.rotation.y = Math.PI / 2;
    leftWall.position.set(-7, 2.25, 0);
    leftWall.receiveShadow = true;
    roomGroup.add(leftWall);

    // Bookshelf
    const shelfGeo = new THREE.BoxGeometry(1.6, 3.2, 0.8);
    const shelfMat = new THREE.MeshStandardMaterial({ color: 0x182234, roughness: 0.5 });
    const shelf = new THREE.Mesh(shelfGeo, shelfMat);
    shelf.position.set(-5.8, 1.6, -6.3);
    shelf.castShadow = true;
    shelf.receiveShadow = true;
    roomGroup.add(shelf);

    // Water Dispenser
    const wdBase = new THREE.Mesh(
      new THREE.BoxGeometry(0.6, 1.4, 0.6),
      new THREE.MeshStandardMaterial({ color: 0xe2e8f0, roughness: 0.3 })
    );
    wdBase.position.set(5.5, 0.7, -6.3);
    wdBase.castShadow = true;
    roomGroup.add(wdBase);

    // Blue Water Bottle on Top
    const bottle = new THREE.Mesh(
      new THREE.CylinderGeometry(0.24, 0.24, 0.65, 16),
      new THREE.MeshStandardMaterial({ color: 0x0ea5e9, transparent: true, opacity: 0.8, roughness: 0.1 })
    );
    bottle.position.set(5.5, 1.7, -6.3);
    roomGroup.add(bottle);

    // 6. Right Wall (x = 7) with Massive Panorama Glass Window & City Sky
    const windowFrameGeo = new THREE.BoxGeometry(0.2, 3.6, 10);
    const frameMat = new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.4 });
    const winFrame = new THREE.Mesh(windowFrameGeo, frameMat);
    winFrame.position.set(6.9, 2.2, 0);
    roomGroup.add(winFrame);

    // Glass Pane
    const glassGeo = new THREE.PlaneGeometry(9.6, 3.2);
    const glassMat = new THREE.MeshStandardMaterial({
      color: 0x38bdf8,
      transparent: true,
      opacity: 0.2,
      roughness: 0.05
    });
    const glass = new THREE.Mesh(glassGeo, glassMat);
    glass.rotation.y = -Math.PI / 2;
    glass.position.set(6.85, 2.2, 0);
    roomGroup.add(glass);

    // Low-poly City Skyline outside window
    const cityGroup = new THREE.Group();
    cityGroup.position.set(16, 0, 0);

    const bldColors = [0x0f172a, 0x1e293b, 0x0d1527, 0x131f37];
    for (let i = -12; i <= 12; i += 2.5) {
      const height = 6 + Math.random() * 12;
      const width = 1.8 + Math.random() * 1.5;
      const bldGeo = new THREE.BoxGeometry(width, height, width);
      const bldMat = new THREE.MeshStandardMaterial({
        color: bldColors[Math.floor(Math.random() * bldColors.length)],
        roughness: 0.6
      });
      const bld = new THREE.Mesh(bldGeo, bldMat);
      bld.position.set(0, height / 2, i);
      cityGroup.add(bld);

      // Glowing window dots on skyscraper
      for (let wy = 2; wy < height - 1; wy += 1.2) {
        if (Math.random() > 0.4) {
          const dot = new THREE.Mesh(
            new THREE.PlaneGeometry(0.25, 0.25),
            new THREE.MeshBasicMaterial({ color: Math.random() > 0.3 ? 0xfef08a : 0x38bdf8 })
          );
          dot.rotation.y = -Math.PI / 2;
          dot.position.set(-width / 2 - 0.02, wy, i + (Math.random() - 0.5) * (width - 0.6));
          cityGroup.add(dot);
        }
      }
    }
    roomGroup.add(cityGroup);

    scene.add(roomGroup);
  }

  // --- ERGONOMIC OFFICE CHAIR ---
  let chairGroup;
  function buildOfficeChair() {
    chairGroup = new THREE.Group();
    chairGroup.position.copy(chairPos);
    chairGroup.rotation.y = Math.PI; // Face the desk

    const chromeMat = new THREE.MeshStandardMaterial({ color: 0x94a3b8, metalness: 0.9, roughness: 0.2 });
    const seatMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.6 });
    const cushionMat = new THREE.MeshStandardMaterial({ color: 0x0284c7, roughness: 0.7 });

    // 5-Star Caster Base
    const starCenter = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.12, 0.08, 16), chromeMat);
    starCenter.position.y = 0.1;
    chairGroup.add(starCenter);

    for (let i = 0; i < 5; i++) {
      const angle = (i * Math.PI * 2) / 5;
      const leg = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.04, 0.42), chromeMat);
      leg.position.set(Math.sin(angle) * 0.22, 0.09, Math.cos(angle) * 0.22);
      leg.rotation.y = angle;
      chairGroup.add(leg);

      // Wheel
      const wheel = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 0.03, 8), chromeMat);
      wheel.position.set(Math.sin(angle) * 0.42, 0.04, Math.cos(angle) * 0.42);
      chairGroup.add(wheel);
    }

    // Stem cylinder
    const stem = new THREE.Mesh(new THREE.CylinderGeometry(0.045, 0.045, 0.55, 16), chromeMat);
    stem.position.y = 0.38;
    chairGroup.add(stem);

    // Seat cushion
    const seat = new THREE.Mesh(new THREE.BoxGeometry(0.68, 0.1, 0.65), cushionMat);
    seat.position.y = 0.65;
    seat.castShadow = true;
    seat.receiveShadow = true;
    chairGroup.add(seat);

    // Backrest
    const backrest = new THREE.Mesh(new THREE.BoxGeometry(0.62, 0.75, 0.08), seatMat);
    backrest.position.set(0, 1.05, 0.3);
    backrest.rotation.x = -0.1;
    backrest.castShadow = true;
    chairGroup.add(backrest);

    // Headrest
    const headrest = new THREE.Mesh(new THREE.BoxGeometry(0.38, 0.2, 0.08), cushionMat);
    headrest.position.set(0, 1.5, 0.34);
    chairGroup.add(headrest);

    // Left & Right Armrests
    const armrestGeo = new THREE.BoxGeometry(0.08, 0.04, 0.36);
    const armL = new THREE.Mesh(armrestGeo, chromeMat);
    armL.position.set(-0.35, 0.88, 0.05);
    chairGroup.add(armL);

    const armR = new THREE.Mesh(armrestGeo, chromeMat);
    armR.position.set(0.35, 0.88, 0.05);
    chairGroup.add(armR);

    scene.add(chairGroup);
  }

  // --- WORKSTATION DESK ---
  function buildWorkstationDesk() {
    const deskGroup = new THREE.Group();

    // Tabletop
    const topGeo = new THREE.BoxGeometry(4.4, 0.14, 2.2);
    const topMat = new THREE.MeshStandardMaterial({ color: 0x181e2b, roughness: 0.35, metalness: 0.1 });
    const topMesh = new THREE.Mesh(topGeo, topMat);
    topMesh.position.y = 1.35;
    topMesh.castShadow = true;
    topMesh.receiveShadow = true;
    deskGroup.add(topMesh);

    // Desk Mat
    const matGeo = new THREE.BoxGeometry(2.6, 0.01, 1.3);
    const matMat = new THREE.MeshStandardMaterial({ color: 0x090d16, roughness: 0.8 });
    const matMesh = new THREE.Mesh(matGeo, matMat);
    matMesh.position.set(-0.2, 1.43, 0.15);
    matMesh.receiveShadow = true;
    deskGroup.add(matMesh);

    // Metal Legs
    const legGeo = new THREE.CylinderGeometry(0.06, 0.06, 1.35, 16);
    const legMat = new THREE.MeshStandardMaterial({ color: 0x334155, metalness: 0.8, roughness: 0.3 });
    [
      [-2.0, 0.675, -0.9],
      [2.0, 0.675, -0.9],
      [-2.0, 0.675, 0.9],
      [2.0, 0.675, 0.9]
    ].forEach(pos => {
      const leg = new THREE.Mesh(legGeo, legMat);
      leg.position.set(...pos);
      leg.castShadow = true;
      deskGroup.add(leg);
    });

    // Ceramic Coffee Mug
    const mugGeo = new THREE.CylinderGeometry(0.09, 0.08, 0.2, 16);
    const mugMat = new THREE.MeshStandardMaterial({ color: 0xe2e8f0, roughness: 0.2 });
    const mugMesh = new THREE.Mesh(mugGeo, mugMat);
    mugMesh.position.set(-1.6, 1.52, -0.5);
    mugMesh.castShadow = true;
    deskGroup.add(mugMesh);

    // Succulent Pot
    const potGeo = new THREE.CylinderGeometry(0.14, 0.1, 0.18, 16);
    const potMat = new THREE.MeshStandardMaterial({ color: 0x64748b, roughness: 0.8 });
    const potMesh = new THREE.Mesh(potGeo, potMat);
    potMesh.position.set(1.9, 1.52, -0.7);
    deskGroup.add(potMesh);

    const plantGeo = new THREE.DodecahedronGeometry(0.12, 1);
    const plantMat = new THREE.MeshStandardMaterial({ color: 0x10b981, roughness: 0.5 });
    const plantMesh = new THREE.Mesh(plantGeo, plantMat);
    plantMesh.position.set(1.9, 1.68, -0.7);
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
    standBase.position.set(-0.2, 1.44, -0.55);
    pcGroup.add(standBase);

    // Stand Stem
    const standStemGeo = new THREE.BoxGeometry(0.06, 0.55, 0.06);
    const standStem = new THREE.Mesh(standStemGeo, metalMat);
    standStem.position.set(-0.2, 1.72, -0.6);
    pcGroup.add(standStem);

    // Monitor Bezel Frame
    const bezelGeo = new THREE.BoxGeometry(2.1, 1.15, 0.08);
    const bezelMat = new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.4 });
    const bezel = new THREE.Mesh(bezelGeo, bezelMat);
    bezel.position.set(-0.2, 2.05, -0.55);
    bezel.castShadow = true;
    pcGroup.add(bezel);

    // Monitor Canvas
    monitorCanvas = document.createElement('canvas');
    monitorCanvas.width = 1024;
    monitorCanvas.height = 512;
    monitorCtx = monitorCanvas.getContext('2d');
    monitorTexture = new THREE.CanvasTexture(monitorCanvas);

    const screenGeo = new THREE.PlaneGeometry(2.0, 1.05);
    const screenMat = new THREE.MeshBasicMaterial({ map: monitorTexture });
    monitorScreenMesh = new THREE.Mesh(screenGeo, screenMat);
    monitorScreenMesh.position.set(-0.2, 2.05, -0.505);
    pcGroup.add(monitorScreenMesh);

    // Mechanical Keyboard
    const kbGeo = new THREE.BoxGeometry(1.2, 0.04, 0.42);
    const kbMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.5 });
    const keyboard = new THREE.Mesh(kbGeo, kbMat);
    keyboard.position.set(-0.4, 1.45, 0.2);
    keyboard.castShadow = true;
    pcGroup.add(keyboard);

    // Keycaps Strip
    const keycapsGeo = new THREE.BoxGeometry(1.1, 0.02, 0.35);
    const keycapsMat = new THREE.MeshStandardMaterial({
      color: 0x0ea5e9,
      emissive: 0x0ea5e9,
      emissiveIntensity: 0.35
    });
    const keycaps = new THREE.Mesh(keycapsGeo, keycapsMat);
    keycaps.position.set(-0.4, 1.48, 0.2);
    pcGroup.add(keycaps);

    // Mouse
    const mouseGeo = new THREE.BoxGeometry(0.14, 0.05, 0.22);
    const mouseMat = new THREE.MeshStandardMaterial({ color: 0x334155, roughness: 0.3 });
    const mouse = new THREE.Mesh(mouseGeo, mouseMat);
    mouse.position.set(0.55, 1.45, 0.22);
    mouse.castShadow = true;
    pcGroup.add(mouse);

    scene.add(pcGroup);
  }

  // --- 3D ROBLOX CHARACTER MODEL ---
  function buildRobloxPlayer() {
    const pGroup = new THREE.Group();
    pGroup.position.copy(player.pos);

    // Materials
    const skinMat = new THREE.MeshStandardMaterial({ color: 0xfacc15, roughness: 0.35 }); // Classic Roblox Yellow
    const shirtMat = new THREE.MeshStandardMaterial({ color: 0x0284c7, roughness: 0.5 }); // Classic Cyan/Blue Shirt
    const pantsMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.6 }); // Navy Pants
    const capMat = new THREE.MeshStandardMaterial({ color: 0x0369a1, roughness: 0.4 });   // Roblox Cap

    // 1. Torso
    const torsoGeo = new THREE.BoxGeometry(0.42, 0.52, 0.24);
    player.torso = new THREE.Mesh(torsoGeo, shirtMat);
    player.torso.position.y = 0.72;
    player.torso.castShadow = true;
    pGroup.add(player.torso);

    // Roblox White Collar Detail
    const collar = new THREE.Mesh(
      new THREE.BoxGeometry(0.16, 0.08, 0.02),
      new THREE.MeshStandardMaterial({ color: 0xffffff })
    );
    collar.position.set(0, 0.22, 0.125);
    player.torso.add(collar);

    // 2. Head Group
    const headGroup = new THREE.Group();
    headGroup.position.set(0, 1.16, 0);

    const headGeo = new THREE.BoxGeometry(0.32, 0.32, 0.30);
    player.head = new THREE.Mesh(headGeo, skinMat);
    player.head.castShadow = true;
    headGroup.add(player.head);

    // Roblox Smiley Face (Eyes and Smile)
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

    // Roblox Baseball Cap
    const capCrown = new THREE.Mesh(new THREE.BoxGeometry(0.34, 0.09, 0.34), capMat);
    capCrown.position.set(0, 0.16, 0);
    player.head.add(capCrown);

    const capVisor = new THREE.Mesh(new THREE.BoxGeometry(0.26, 0.03, 0.18), capMat);
    capVisor.position.set(0, 0.14, 0.22);
    player.head.add(capVisor);

    pGroup.add(headGroup);

    // 3. Left Arm
    const armGeo = new THREE.BoxGeometry(0.14, 0.44, 0.14);
    player.leftArm = new THREE.Mesh(armGeo, shirtMat);
    player.leftArm.position.set(-0.29, 0.68, 0);
    player.leftArm.castShadow = true;
    pGroup.add(player.leftArm);

    // Yellow Hand for Left Arm
    const handL = new THREE.Mesh(new THREE.BoxGeometry(0.13, 0.12, 0.13), skinMat);
    handL.position.set(0, -0.22, 0);
    player.leftArm.add(handL);

    // 4. Right Arm
    player.rightArm = new THREE.Mesh(armGeo, shirtMat);
    player.rightArm.position.set(0.29, 0.68, 0);
    player.rightArm.castShadow = true;
    pGroup.add(player.rightArm);

    // Yellow Hand for Right Arm
    const handR = new THREE.Mesh(new THREE.BoxGeometry(0.13, 0.12, 0.13), skinMat);
    handR.position.set(0, -0.22, 0);
    player.rightArm.add(handR);

    // 5. Left Leg
    const legGeo = new THREE.BoxGeometry(0.16, 0.46, 0.16);
    player.leftLeg = new THREE.Mesh(legGeo, pantsMat);
    player.leftLeg.position.set(-0.11, 0.23, 0);
    player.leftLeg.castShadow = true;
    pGroup.add(player.leftLeg);

    // 6. Right Leg
    player.rightLeg = new THREE.Mesh(legGeo, pantsMat);
    player.rightLeg.position.set(0.11, 0.23, 0);
    player.rightLeg.castShadow = true;
    pGroup.add(player.rightLeg);

    player.meshGroup = pGroup;
    scene.add(pGroup);
  }

  // --- DYNAMIC MONITOR & HOLOGRAM CANVAS ---
  function updateMonitor(status, detail) {
    if (!monitorCtx) return;
    const ctx = monitorCtx;
    const w = 1024;
    const h = 512;

    const grad = ctx.createLinearGradient(0, 0, w, h);
    grad.addColorStop(0, '#090d16');
    grad.addColorStop(1, '#0f172a');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, w, h);

    // Grid pattern
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

    // Top Header Bar
    ctx.fillStyle = '#1e293b';
    ctx.fillRect(0, 0, w, 60);

    ctx.fillStyle = '#38bdf8';
    ctx.font = 'bold 22px "Courier New", monospace';
    ctx.fillText('⚡ ROBLOX PAYROLL ENGINE // TUGAS 3 ALGO & PEMROGRAMAN', 28, 38);

    const isSuccess = status === 'SUCCESS';
    const pillColor = isSuccess ? '#10b981' : (status === 'CALCULATING' ? '#f59e0b' : '#38bdf8');
    ctx.fillStyle = pillColor;
    ctx.beginPath();
    ctx.arc(w - 180, 32, 7, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#f8fafc';
    ctx.font = 'bold 18px "Courier New", monospace';
    ctx.fillText(status, w - 160, 38);

    // Main Box
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
    ctx.font = 'bold 30px "Segoe UI", sans-serif';
    ctx.fillText(detail || 'Menunggu input dari formulir...', 55, 175);

    // Array Tables
    drawArrayCard(ctx, 30, 290, 460, 180, 'ARRAY_GAJI [double]', [
      'Indeks 0: Rp 5.000.000 (Gol A)',
      'Indeks 1: Rp 6.500.000 (Gol B)',
      'Indeks 2: Rp 9.500.000 (Gol C)'
    ], currentGrade === 'A' ? 0 : (currentGrade === 'B' ? 1 : 2));

    drawArrayCard(ctx, 534, 290, 460, 180, 'ARRAY_LEMBUR [double]', [
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
        ctx.fillText('▶ ' + line, x + 20, y + 68 + i * 28);
      } else {
        ctx.fillStyle = '#94a3b8';
        ctx.fillText('  ' + line, x + 20, y + 68 + i * 28);
      }
    });
  }

  // --- ID BADGE ---
  function buildIdBadge() {
    const badgeGroup = new THREE.Group();
    const standGeo = new THREE.CylinderGeometry(0.18, 0.22, 0.04, 20);
    const standMat = new THREE.MeshStandardMaterial({ color: 0x475569, metalness: 0.9, roughness: 0.2 });
    const stand = new THREE.Mesh(standGeo, standMat);
    stand.position.set(-1.4, 1.44, 0.4);
    badgeGroup.add(stand);

    const cardGeo = new THREE.BoxGeometry(0.55, 0.85, 0.02);
    idBadgeCanvas = document.createElement('canvas');
    idBadgeCanvas.width = 512;
    idBadgeCanvas.height = 768;
    idBadgeCtx = idBadgeCanvas.getContext('2d');
    idBadgeTexture = new THREE.CanvasTexture(idBadgeCanvas);

    const cardMat = new THREE.MeshStandardMaterial({ map: idBadgeTexture, roughness: 0.25 });
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

    ctx.fillStyle = '#0f172a';
    ctx.fillRect(0, 0, w, h);

    ctx.fillStyle = cfg.color;
    ctx.fillRect(0, 0, w, 150);

    ctx.fillStyle = '#090d16';
    ctx.beginPath();
    ctx.roundRect(w / 2 - 40, 20, 80, 16, 8);
    ctx.fill();

    ctx.fillStyle = '#090d16';
    ctx.font = 'bold 28px "Segoe UI", sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('EMPLOYEE BADGE', w / 2, 95);
    ctx.font = '18px "Courier New", monospace';
    ctx.fillText('ROBLOX CORP // TUGAS 3', w / 2, 125);

    ctx.fillStyle = '#1e293b';
    ctx.beginPath();
    ctx.arc(w / 2, 270, 85, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = cfg.color;
    ctx.lineWidth = 6;
    ctx.stroke();

    ctx.fillStyle = cfg.color;
    ctx.font = 'bold 95px "Segoe UI", sans-serif';
    ctx.fillText(grade, w / 2, 305);

    ctx.fillStyle = '#f8fafc';
    ctx.font = 'bold 32px "Segoe UI", sans-serif';
    ctx.fillText(cfg.name, w / 2, 400);

    ctx.fillStyle = '#94a3b8';
    ctx.font = '22px "Courier New", monospace';
    ctx.fillText(`Array Index: [${cfg.index}]`, w / 2, 440);

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

    ctx.clearRect(0, 0, w, h);

    ctx.fillStyle = 'rgba(11, 17, 32, 0.88)';
    ctx.strokeStyle = '#38bdf8';
    ctx.lineWidth = 6;
    ctx.beginPath();
    ctx.roundRect(10, 10, w - 20, h - 20, 24);
    ctx.fill();
    ctx.stroke();

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

    // Stamp
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

  // --- MONEY STACKS ---
  function buildMoneyGroup() {
    moneyGroup = new THREE.Group();
    moneyGroup.position.set(0.6, 1.43, 0.35);
    scene.add(moneyGroup);
  }

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

  const redMoneyTexture = createBanknoteTexture('#be123c', '100.000');
  const blueMoneyTexture = createBanknoteTexture('#0284c7', '50.000');

  function spawnMoneyStacks(gajiPokok, gajiLembur) {
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
    const spacingX = 0.56;
    const spacingZ = 0.34;

    function addStack(col, row, heightIdx, mat) {
      const mesh = new THREE.Mesh(stackGeo, mat);
      const targetX = (col - 0.5) * spacingX;
      const targetZ = (row - 0.5) * spacingZ;
      const targetY = heightIdx * 0.085;

      mesh.position.set(targetX, targetY + 1.2 + Math.random() * 0.5, targetZ);
      mesh.rotation.y = (Math.random() - 0.5) * 0.12;
      mesh.castShadow = true;
      moneyGroup.add(mesh);

      const startY = mesh.position.y;
      const startTime = performance.now() + index * 45;
      index++;

      const dropAnim = (now) => {
        if (now < startTime) {
          requestAnimationFrame(dropAnim);
          return;
        }
        const progress = Math.min((now - startTime) / 360, 1);
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

  // --- CELEBRATION COINS ---
  function triggerCelebration() {
    const coinGeo = new THREE.CylinderGeometry(0.08, 0.08, 0.02, 12);
    const coinMat = new THREE.MeshStandardMaterial({
      color: 0xf59e0b,
      metalness: 0.9,
      roughness: 0.2,
      emissive: 0xd97706,
      emissiveIntensity: 0.25
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

      if (p.mesh.position.y <= floorY) {
        p.mesh.position.y = floorY;
        p.velocity.y = -p.velocity.y * 0.4;
        p.velocity.x *= 0.7;
        p.velocity.z *= 0.7;
      }

      if (performance.now() - p.birth > 3500) {
        scene.remove(p.mesh);
        p.mesh.geometry.dispose();
        coinParticles.splice(i, 1);
      }
    }
  }

  // --- STEAM PARTICLES ---
  function buildSteamParticles() {
    const particleCount = 18;
    const geo = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);

    for (let i = 0; i < particleCount; i++) {
      positions[i * 3] = -1.6 + (Math.random() - 0.5) * 0.08;
      positions[i * 3 + 1] = 1.62 + Math.random() * 0.4;
      positions[i * 3 + 2] = -0.5 + (Math.random() - 0.5) * 0.08;
    }

    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    const mat = new THREE.PointsMaterial({ color: 0xffffff, size: 0.04, transparent: true, opacity: 0.35 });
    steamParticles = new THREE.Points(geo, mat);
    scene.add(steamParticles);
  }

  function updateSteam(delta) {
    if (!steamParticles) return;
    const pos = steamParticles.geometry.attributes.position.array;
    for (let i = 0; i < pos.length; i += 3) {
      pos[i + 1] += delta * 0.25;
      pos[i] += Math.sin(pos[i + 1] * 10) * 0.001;
      if (pos[i + 1] > 2.1) {
        pos[i + 1] = 1.62;
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

  // --- INPUT & POINTER LOCK CONTROLS ---
  function setupInputControls() {
    const canvas = renderer.domElement;

    // Pointer Lock click on canvas
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

    // Mouse Look
    document.addEventListener('mousemove', (e) => {
      if (!isPointerLocked || player.isSitting) return;
      const sensitivity = 0.0024;
      cameraYaw -= e.movementX * sensitivity;
      cameraPitch -= e.movementY * sensitivity;

      // Clamp vertical pitch (prevent flipping)
      const maxPitch = Math.PI / 2.3;
      cameraPitch = Math.max(-maxPitch, Math.min(maxPitch, cameraPitch));
    });

    // Keyboard Listeners
    window.addEventListener('keydown', (e) => {
      // Don't intercept typing if user is typing into input fields
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
    if (player.isSitting) return;
    povMode = povMode === 'FPS' ? 'THIRD_PERSON' : 'FPS';
    const tag = document.getElementById('pov-mode-text');
    if (tag) {
      tag.textContent = povMode === 'FPS' ? 'POV: 1st Person (Mata)' : 'POV: 3rd Person (Roblox)';
    }
  }

  // --- SITTING & STANDING LOGIC ---
  function sitDownAtChair() {
    player.isSitting = true;
    povMode = 'SEATED';
    document.exitPointerLock();

    // Move player model into chair
    player.pos.set(chairPos.x, 0.42, chairPos.z - 0.22);
    if (player.meshGroup) {
      player.meshGroup.position.copy(player.pos);
      player.meshGroup.rotation.y = Math.PI; // Face desk

      // Sitting pose: legs bent forward, arms forward
      player.leftLeg.rotation.x = -Math.PI / 2;
      player.rightLeg.rotation.x = -Math.PI / 2;
      player.leftArm.rotation.x = -0.55;
      player.rightArm.rotation.x = -0.55;
    }

    SoundFX.sit();

    // Notify UI to open calculator drawer
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
    povMode = 'FPS';

    // Move player back slightly behind chair
    player.pos.set(chairPos.x, 0, chairPos.z + 1.2);
    if (player.meshGroup) {
      player.meshGroup.position.copy(player.pos);
      player.leftLeg.rotation.x = 0;
      player.rightLeg.rotation.x = 0;
      player.leftArm.rotation.x = 0;
      player.rightArm.rotation.x = 0;
    }

    SoundFX.stand();

    const seatedBanner = document.getElementById('seated-banner');
    if (seatedBanner) seatedBanner.classList.remove('visible');

    const terminalDrawer = document.getElementById('terminal-drawer');
    if (terminalDrawer) terminalDrawer.classList.remove('open');
  }

  // --- PLAYER MOVEMENT & COLLISION ---
  function updatePlayerPhysics(delta) {
    if (player.isSitting) return;

    // Movement Direction
    const inputX = (keys.right ? 1 : 0) - (keys.left ? 1 : 0);
    const inputZ = (keys.backward ? 1 : 0) - (keys.forward ? 1 : 0);
    const isMoving = inputX !== 0 || inputZ !== 0;

    const currentSpeed = keys.sprint ? player.sprintSpeed : player.speed;

    if (isMoving) {
      // Calculate movement vector aligned with camera yaw
      const forward = new THREE.Vector3(Math.sin(cameraYaw), 0, Math.cos(cameraYaw));
      const right = new THREE.Vector3(-Math.cos(cameraYaw), 0, Math.sin(cameraYaw));

      const moveDir = new THREE.Vector3()
        .addScaledVector(forward, inputZ)
        .addScaledVector(right, inputX)
        .normalize();

      const moveDist = currentSpeed * delta;
      const targetPos = player.pos.clone().addScaledVector(moveDir, moveDist);

      // Room Boundaries [-6.5, 6.5]
      targetPos.x = Math.max(-6.5, Math.min(6.5, targetPos.x));
      targetPos.z = Math.max(-6.5, Math.min(6.5, targetPos.z));

      // Obstacle Collision (AABB)
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

      // Step sound & walking animation
      SoundFX.step();
      player.walkTime += delta * (keys.sprint ? 14 : 9);

      if (player.leftArm && player.rightArm && player.leftLeg && player.rightLeg) {
        const armAmp = 0.65;
        const legAmp = 0.75;
        player.leftArm.rotation.x = Math.sin(player.walkTime) * armAmp;
        player.rightArm.rotation.x = -Math.sin(player.walkTime) * armAmp;
        player.leftLeg.rotation.x = -Math.sin(player.walkTime) * legAmp;
        player.rightLeg.rotation.x = Math.sin(player.walkTime) * legAmp;
      }

      // Rotate player model towards moving direction (in 3rd person)
      if (player.meshGroup) {
        const lookAngle = Math.atan2(moveDir.x, moveDir.z);
        player.meshGroup.rotation.y = THREE.MathUtils.lerp(player.meshGroup.rotation.y, lookAngle, 0.2);
      }
    } else {
      // Idle return arms/legs to neutral
      if (player.leftArm && player.rightArm && player.leftLeg && player.rightLeg) {
        player.leftArm.rotation.x = THREE.MathUtils.lerp(player.leftArm.rotation.x, 0, 0.15);
        player.rightArm.rotation.x = THREE.MathUtils.lerp(player.rightArm.rotation.x, 0, 0.15);
        player.leftLeg.rotation.x = THREE.MathUtils.lerp(player.leftLeg.rotation.x, 0, 0.15);
        player.rightLeg.rotation.x = THREE.MathUtils.lerp(player.rightLeg.rotation.x, 0, 0.15);
      }
    }

    // Gravity & Jump Physics
    const gravity = -14.0;
    player.vel.y += gravity * delta;
    player.pos.y += player.vel.y * delta;

    if (player.pos.y <= 0) {
      player.pos.y = 0;
      player.vel.y = 0;
      player.isGrounded = true;
    }

    // Update Player Mesh Position
    if (player.meshGroup) {
      player.meshGroup.position.copy(player.pos);
    }

    // Check Distance to Chair for Prompt
    const distToChair = player.pos.distanceTo(chairPos);
    isNearChair = distToChair < CHAIR_INTERACTION_DIST;
    const prompt = document.getElementById('interaction-prompt');
    if (prompt) {
      prompt.classList.toggle('visible', isNearChair && !player.isSitting);
    }
  }

  // --- CAMERA UPDATE ---
  function updateCamera() {
    if (povMode === 'SEATED') {
      // Seated camera view: looking directly at computer screen and desk
      const targetCamPos = new THREE.Vector3(chairPos.x, 1.85, chairPos.z - 0.2);
      camera.position.lerp(targetCamPos, 0.12);
      camera.lookAt(new THREE.Vector3(-0.2, 1.95, -0.5));
      return;
    }

    if (povMode === 'FPS') {
      // First-person view from character eye level
      camera.position.set(player.pos.x, player.pos.y + 1.48, player.pos.z);

      const lookDir = new THREE.Vector3(
        Math.sin(cameraYaw) * Math.cos(cameraPitch),
        Math.sin(cameraPitch),
        Math.cos(cameraYaw) * Math.cos(cameraPitch)
      );

      camera.lookAt(camera.position.clone().add(lookDir));

      // In FPS mode, hide player mesh so it doesn't block the camera
      if (player.meshGroup) {
        player.meshGroup.visible = false;
      }
    } else {
      // Third-person Roblox camera behind player
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

  // --- MAIN LOOP ---
  function animate() {
    requestAnimationFrame(animate);

    const delta = clock.getDelta();
    const time = clock.getElapsedTime();

    // Floating hologram slip bobbing
    if (hologramMesh) {
      hologramMesh.position.y = 2.5 + Math.sin(time * 2.2) * 0.06;
      hologramMesh.rotation.y = -0.4 + Math.sin(time * 1.2) * 0.04;
    }

    updatePlayerPhysics(delta);
    updateCamera();

    updateCoinParticles(delta);
    updateSteam(delta);

    renderer.render(scene, camera);
  }

  // --- PUBLIC API EXPOSED TO WINDOW ---
  window.Payroll3D = {
    init,
    sitDown: sitDownAtChair,
    standUp: standUp,
    togglePov: togglePovMode,
    setGrade(grade) {
      currentGrade = grade;
      const cfg = GRADE_CONFIG[grade] || GRADE_CONFIG['A'];
      updateIdBadge(grade, cfg.salary);
      updateMonitor('READY', `Memilih ${cfg.name} (Array Index: [${cfg.index}])`);
      SoundFX.click();
    },
    startCalculating() {
      updateMonitor('CALCULATING', 'Memproses kalkulasi via Java WebServer...');
      SoundFX.click();
    },
    showResult(data) {
      updateMonitor('SUCCESS', `Total: Rp ${Number(data.totalPenghasilan).toLocaleString('id-ID')}`);
      updateHologramSlip(data);
      spawnMoneyStacks(data.gajiPokok, data.gajiLembur);
      triggerCelebration();
      SoundFX.chime();
    },
    showError(msg) {
      updateMonitor('ERROR', msg);
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
