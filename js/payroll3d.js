/**
 * Payroll3D - Interactive 3D Workstation Simulation
 * Tugas 3: Algoritma dan Pemrograman (Operator, IF, dan Array)
 * Main Orchestrator / Entry Point (Clean Component Architecture)
 */

import { SoundFX } from './component/SoundFX.js';
import { buildOfficeRoom } from './component/OfficeRoom.js';
import {
  buildWorkstationDesk,
  buildOfficeChair,
  buildComputer,
  updateMonitor,
  buildIdBadge,
  updateIdBadge
} from './component/Workstation.js';
import {
  player,
  initPlayerState,
  buildRobloxPlayer,
  updatePlayerPhysics
} from './component/Player.js';
import {
  npc,
  buildNpcEmployee,
  handoverSalary,
  updateNpc
} from './component/NpcEmployee.js';
import {
  buildMoneyGroup,
  spawnMoneyStacks,
  buildHologramSlip,
  updateHologramSlip,
  triggerCelebration,
  updateCoinParticles,
  buildSteamParticles,
  updateSteam
} from './component/MoneyAndSlip.js';

(function () {
  'use strict';

  let scene, camera, renderer;
  let container;
  let clock;

  const THREE = window.THREE;
  if (!THREE) {
    console.error('Three.js must be loaded before payroll3d.js');
    return;
  }

  // Camera & POV State
  let povMode = 'FPS'; // 'FPS' | 'THIRD_PERSON'
  let cameraYaw = Math.PI; // Face desk at start
  let cameraPitch = -0.06;
  let targetCameraYaw = Math.PI;
  let targetCameraPitch = -0.06;
  let isPointerLocked = false;
  let isDraggingCanvas = false;
  let previousMousePos = { x: 0, y: 0 };

  // Seated Zoom via Mouse Wheel
  let seatedZoom = 0;
  let targetSeatedZoom = 0;

  // Chair & Colliders
  const chairPos = new THREE.Vector3(0, 0, 1.55);
  const CHAIR_INTERACTION_DIST = 2.4;

  const colliders = [
    { minX: -2.3, maxX: 2.3, minZ: -1.4, maxZ: 0.35 },
    { minX: -6.8, maxX: -4.8, minZ: -6.8, maxZ: -5.8 },
    { minX: 4.8, maxX: 6.2, minZ: -6.8, maxZ: -5.8 }
  ];

  const keys = {
    forward: false,
    backward: false,
    left: false,
    right: false,
    jump: false,
    sprint: false
  };

  let currentGrade = 'A';
  const GRADE_CONFIG = {
    A: { name: 'Golongan A', salary: 5000000, color: '#38bdf8', hex: 0x38bdf8, index: 0 },
    B: { name: 'Golongan B', salary: 6500000, color: '#34d399', hex: 0x34d399, index: 1 },
    C: { name: 'Golongan C', salary: 9500000, color: '#c084fc', hex: 0xc084fc, index: 2 }
  };

  let hologramMeshObj;

  function init() {
    container = document.getElementById('canvas3d-container');
    if (!container) return;

    clock = new THREE.Clock();
    initPlayerState(THREE);

    // 1. Scene
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x0f172a);
    scene.fog = new THREE.FogExp2(0x0f172a, 0.025);

    // 2. Camera
    const aspect = container.clientWidth / container.clientHeight;
    camera = new THREE.PerspectiveCamera(65, aspect, 0.1, 100);
    camera.position.set(player.pos.x, player.pos.y + 1.62, player.pos.z);

    // 3. Renderer (High Performance, Stencil disabled, Capped DPR, PCF Shadow)
    renderer = new THREE.WebGLRenderer({
      antialias: true,
      powerPreference: 'high-performance',
      stencil: false,
      depth: true
    });
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.5));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.18;
    container.appendChild(renderer.domElement);

    // 4. Lights
    setupLighting();

    // 5. Build Modular Components
    buildOfficeRoom(THREE, scene);
    buildWorkstationDesk(THREE, scene);
    buildOfficeChair(THREE, scene, chairPos);
    buildComputer(THREE, scene);
    buildIdBadge(THREE, scene);
    hologramMeshObj = buildHologramSlip(THREE, scene);
    buildMoneyGroup(THREE, scene);
    buildSteamParticles(THREE, scene);
    buildRobloxPlayer(THREE, scene);
    buildNpcEmployee(THREE, scene);

    // 6. Setup Event Controls
    setupInputControls();

    // Initial Status
    updateMonitor('Siap', 'Menunggu input...', currentGrade);
    updateIdBadge('A', 5000000, GRADE_CONFIG);
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

  function setupLighting() {
    const ambient = new THREE.AmbientLight(0xecf0f5, 1.05);
    scene.add(ambient);

    const sunLight = new THREE.DirectionalLight(0xfffbeb, 1.25);
    sunLight.position.set(4, 8, 5);
    sunLight.castShadow = true;
    sunLight.shadow.mapSize.width = 1024;
    sunLight.shadow.mapSize.height = 1024;
    sunLight.shadow.camera.near = 0.5;
    sunLight.shadow.camera.far = 24;
    sunLight.shadow.camera.left = -7.5;
    sunLight.shadow.camera.right = 7.5;
    sunLight.shadow.camera.top = 7.5;
    sunLight.shadow.camera.bottom = -7.5;
    sunLight.shadow.bias = -0.0004;
    scene.add(sunLight);

    // Ceiling Light: High ambient luminescence without costly 6-face shadow map render pass
    const ceilingLight = new THREE.PointLight(0xf8fafc, 1.3, 18, 1.8);
    ceilingLight.position.set(0, 4.2, 0);
    ceilingLight.castShadow = false;
    scene.add(ceilingLight);

    // Desk SpotLight: Focused shadow for table interaction
    const deskSpot = new THREE.SpotLight(0xfef3c7, 1.8, 10, Math.PI / 3.4, 0.4, 1);
    deskSpot.position.set(-1.8, 2.6, 0.8);
    deskSpot.target.position.set(0, 1.15, 0.3);
    deskSpot.castShadow = true;
    deskSpot.shadow.mapSize.width = 512;
    deskSpot.shadow.mapSize.height = 512;
    deskSpot.shadow.bias = -0.0005;
    scene.add(deskSpot);
    scene.add(deskSpot.target);

    const windowLight = new THREE.DirectionalLight(0xe0f2fe, 0.6);
    windowLight.position.set(8, 3.5, 0);
    scene.add(windowLight);
  }

  function clampPitch() {
    const maxPitch = player.isSitting ? Math.PI / 3.0 : Math.PI / 2.3;
    const minPitch = player.isSitting ? -Math.PI / 2.8 : -Math.PI / 2.3;
    targetCameraPitch = Math.max(minPitch, Math.min(maxPitch, targetCameraPitch));
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

    canvas.addEventListener('wheel', (e) => {
      if (player.isSitting) {
        e.preventDefault();
        const zoomDelta = -e.deltaY * 0.0018;
        targetSeatedZoom = Math.max(0, Math.min(1, targetSeatedZoom + zoomDelta));
      }
    }, { passive: false });

    window.addEventListener('mousemove', (e) => {
      if (npc.state !== 'IDLE') return;

      if (isPointerLocked) {
        const sensitivity = 0.0022;
        targetCameraYaw -= e.movementX * sensitivity;
        targetCameraPitch -= e.movementY * sensitivity;
        clampPitch();
      } else if (isDraggingCanvas) {
        const deltaX = e.clientX - previousMousePos.x;
        const deltaY = e.clientY - previousMousePos.y;
        previousMousePos = { x: e.clientX, y: e.clientY };

        const sensitivity = 0.0035;
        targetCameraYaw -= deltaX * sensitivity;
        targetCameraPitch -= deltaY * sensitivity;
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
          const distToChair = player.pos.distanceTo(chairPos);
          if (distToChair < CHAIR_INTERACTION_DIST && !player.isSitting) {
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

  function sitDownAtChair() {
    player.isSitting = true;
    document.exitPointerLock();

    targetSeatedZoom = 0;
    seatedZoom = 0;
    if (camera) {
      camera.fov = 65;
      camera.updateProjectionMatrix();
    }

    player.pos.set(chairPos.x, 0.55, chairPos.z - 0.05);
    if (player.meshGroup) {
      player.meshGroup.position.copy(player.pos);
      player.meshGroup.rotation.y = Math.PI;

      player.leftLeg.rotation.x = -Math.PI / 2;
      player.rightLeg.rotation.x = -Math.PI / 2;
      player.leftArm.rotation.x = -0.55;
      player.rightArm.rotation.x = -0.55;
    }

    targetCameraYaw = cameraYaw = Math.PI;
    targetCameraPitch = cameraPitch = -0.15;

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

    targetCameraYaw = cameraYaw = Math.PI;
    targetCameraPitch = cameraPitch = -0.06;

    SoundFX.stand();

    const seatedBanner = document.getElementById('seated-banner');
    if (seatedBanner) seatedBanner.classList.remove('visible');

    const terminalDrawer = document.getElementById('terminal-drawer');
    if (terminalDrawer) terminalDrawer.classList.remove('open');
  }

  // Reusable Scratch Vectors (Zero Garbage-Collection Overhead)
  const _lookDir = new THREE.Vector3();
  const _camTarget = new THREE.Vector3();
  const _baseEyePos = new THREE.Vector3();
  const _targetCamPos = new THREE.Vector3();
  const _npcHead = new THREE.Vector3();
  const _dir = new THREE.Vector3();
  const _chairLookTarget = new THREE.Vector3(chairPos.x, 1.35, chairPos.z - 0.5);
  const _playerLookTarget = new THREE.Vector3();

  function updateCamera(delta) {
    // 1. Smooth rotation damping towards target yaw/pitch (Fluid & buttery smooth)
    const rotDamp = 1.0 - Math.exp(-28 * delta);
    cameraYaw = THREE.MathUtils.lerp(cameraYaw, targetCameraYaw, rotDamp);
    cameraPitch = THREE.MathUtils.lerp(cameraPitch, targetCameraPitch, rotDamp);

    if (player.isSitting) {
      if (npc.state !== 'IDLE' && npc.meshGroup && npc.meshGroup.visible) {
        _npcHead.set(npc.pos.x, 1.35, npc.pos.z);
        camera.position.set(chairPos.x, 1.78, chairPos.z - 0.15);
        camera.lookAt(_npcHead);

        _dir.copy(_npcHead).sub(camera.position).normalize();
        targetCameraYaw = cameraYaw = Math.atan2(_dir.x, _dir.z);
        targetCameraPitch = cameraPitch = Math.asin(_dir.y);

        if (player.meshGroup) player.meshGroup.visible = false;
        return;
      }

      const zoomDamp = 1.0 - Math.exp(-15 * delta);
      seatedZoom = THREE.MathUtils.lerp(seatedZoom, targetSeatedZoom, zoomDamp);

      _lookDir.set(
        Math.sin(cameraYaw) * Math.cos(cameraPitch),
        Math.sin(cameraPitch),
        Math.cos(cameraYaw) * Math.cos(cameraPitch)
      );

      if (povMode === 'FPS') {
        camera.fov = THREE.MathUtils.lerp(65, 32, seatedZoom);
        camera.updateProjectionMatrix();

        const forwardDolly = seatedZoom * 0.45;
        _baseEyePos.set(chairPos.x, 1.78, chairPos.z - 0.15);
        camera.position.copy(_baseEyePos).addScaledVector(_lookDir, forwardDolly);
        _camTarget.copy(camera.position).add(_lookDir);
        camera.lookAt(_camTarget);

        if (player.meshGroup) {
          player.meshGroup.visible = false;
        }
      } else {
        if (player.meshGroup) {
          player.meshGroup.visible = true;
        }

        camera.fov = THREE.MathUtils.lerp(65, 45, seatedZoom);
        camera.updateProjectionMatrix();

        const camDist = THREE.MathUtils.lerp(2.4, 1.3, seatedZoom);
        _targetCamPos.set(
          chairPos.x - Math.sin(cameraYaw) * camDist,
          THREE.MathUtils.lerp(2.05, 1.6, seatedZoom) - Math.sin(cameraPitch) * 1.2,
          (chairPos.z + 0.4) - Math.cos(cameraYaw) * camDist
        );

        const followDamp = 1.0 - Math.exp(-18 * delta);
        camera.position.lerp(_targetCamPos, followDamp);
        camera.lookAt(_chairLookTarget);
      }
      return;
    }

    if (camera.fov !== 65) {
      camera.fov = 65;
      camera.updateProjectionMatrix();
    }

    _lookDir.set(
      Math.sin(cameraYaw) * Math.cos(cameraPitch),
      Math.sin(cameraPitch),
      Math.cos(cameraYaw) * Math.cos(cameraPitch)
    );

    if (povMode === 'FPS') {
      camera.position.set(player.pos.x, player.pos.y + 1.62, player.pos.z);
      _camTarget.copy(camera.position).add(_lookDir);
      camera.lookAt(_camTarget);

      if (player.meshGroup) {
        player.meshGroup.visible = false;
      }
    } else {
      if (player.meshGroup) {
        player.meshGroup.visible = true;
      }

      const camDist = 3.4;
      const camHeight = 1.6;
      _targetCamPos.set(
        player.pos.x - Math.sin(cameraYaw) * camDist,
        player.pos.y + camHeight - Math.sin(cameraPitch) * 1.5,
        player.pos.z - Math.cos(cameraYaw) * camDist
      );

      const followDamp = 1.0 - Math.exp(-18 * delta);
      camera.position.lerp(_targetCamPos, followDamp);
      _playerLookTarget.set(player.pos.x, player.pos.y + 1.2, player.pos.z);
      camera.lookAt(_playerLookTarget);
    }
  }

  function onWindowResize() {
    if (!container || !camera || !renderer) return;
    const w = container.clientWidth;
    const h = container.clientHeight;
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    renderer.setSize(w, h);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.5));
  }

  // Realtime FPS Benchmark Counter
  let frameCount = 0;
  let lastFpsTime = performance.now();
  let fpsCounterEl = null;

  function updateFps() {
    frameCount++;
    const now = performance.now();
    const elapsed = now - lastFpsTime;
    if (elapsed >= 350) {
      const fps = Math.round((frameCount * 1000) / elapsed);
      if (!fpsCounterEl) fpsCounterEl = document.getElementById('fps-counter');
      if (fpsCounterEl) {
        fpsCounterEl.textContent = `${fps} FPS`;
      }
      frameCount = 0;
      lastFpsTime = now;
    }
  }

  function animate() {
    requestAnimationFrame(animate);

    const delta = Math.min(clock.getDelta(), 0.08);
    const time = clock.getElapsedTime();

    updateFps();

    if (hologramMeshObj) {
      hologramMeshObj.position.y = 2.15 + Math.sin(time * 2.2) * 0.05;
      hologramMeshObj.rotation.y = -0.4 + Math.sin(time * 1.2) * 0.04;
    }

    updatePlayerPhysics(THREE, delta, keys, cameraYaw, colliders, chairPos, CHAIR_INTERACTION_DIST);
    updateCamera(delta);
    updateNpc(THREE, delta, camera);

    updateCoinParticles(scene, delta);
    updateSteam(delta);

    renderer.render(scene, camera);
  }

  // --- PUBLIC API EXPOSED TO WINDOW ---
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
      updateIdBadge(grade, cfg.salary, GRADE_CONFIG);
      updateMonitor('Siap', `Golongan ${grade}`, currentGrade);
      SoundFX.click();
    },
    startCalculating() {
      updateMonitor('Menghitung', 'Memproses kalkulasi...', currentGrade);
      SoundFX.click();
    },
    showResult(data) {
      updateMonitor('Selesai', `Total: Rp ${Number(data.totalPenghasilan).toLocaleString('id-ID')}`, currentGrade);
      updateHologramSlip(data);
      spawnMoneyStacks(THREE, data.gajiPokok, data.gajiLembur);
      triggerCelebration(THREE, scene);
      SoundFX.chime();
    },
    showError(msg) {
      updateMonitor('Error', msg, currentGrade);
    },
    handoverSalary(data, onComplete) {
      handoverSalary(data, onComplete, {
        get isSitting() { return player.isSitting; },
        set cameraYaw(val) {
          targetCameraYaw = val;
          cameraYaw = val;
        },
        set cameraPitch(val) {
          targetCameraPitch = val;
          cameraPitch = val;
        }
      });
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
