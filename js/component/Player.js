/**
 * Player Component - 3D Character Model (Mahasiswa UT), Movement Physics & Camera
 * Style:
 * - Kulit coklat sawo matang khas Indonesia (#a66a38)
 * - Almamater kuning Universitas Terbuka (#facc15) dengan kemeja putih & dasi biru
 * - Logo resmi UT di saku dada kiri
 * - Rambut rapi mahasiswa
 */

import { SoundFX } from './SoundFX.js';

export const player = {
  pos: null,
  vel: null,
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

export function initPlayerState(THREE) {
  player.pos = new THREE.Vector3(0, 0, 4.0);
  player.vel = new THREE.Vector3();
}

function createUtLogoTexture(THREE) {
  const canvas = document.createElement('canvas');
  canvas.width = 128;
  canvas.height = 128;
  const ctx = canvas.getContext('2d');

  // Background circle (Biru UT)
  ctx.fillStyle = '#0f3a7a';
  ctx.beginPath();
  ctx.arc(64, 64, 58, 0, Math.PI * 2);
  ctx.fill();

  // Yellow Ring
  ctx.strokeStyle = '#facc15';
  ctx.lineWidth = 8;
  ctx.stroke();

  // Cyan globe inner circle
  ctx.fillStyle = '#0284c7';
  ctx.beginPath();
  ctx.arc(64, 64, 44, 0, Math.PI * 2);
  ctx.fill();

  // White bold 'UT' logo text
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 36px -apple-system, sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('UT', 64, 64);

  return new THREE.CanvasTexture(canvas);
}

export function buildRobloxPlayer(THREE, scene) {
  const pGroup = new THREE.Group();
  pGroup.position.copy(player.pos);

  // 1. Materials: Kulit Coklat Sawo Matang & Almamater Kuning UT
  const skinMat = new THREE.MeshStandardMaterial({ color: 0xa66a38, roughness: 0.45 }); // Kulit coklat
  const almamaterMat = new THREE.MeshStandardMaterial({ color: 0xfacc15, roughness: 0.5 }); // Jas Kuning UT
  const shirtWhiteMat = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.3 }); // Kemeja putih
  const tieMat = new THREE.MeshStandardMaterial({ color: 0x0f3a7a, roughness: 0.4 }); // Dasi Biru UT
  const pantsMat = new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.6 }); // Celana bahan hitam/navy
  const hairMat = new THREE.MeshStandardMaterial({ color: 0x1f1610, roughness: 0.8 }); // Rambut hitam rapi

  // 2. Torso (Jas Almamater Kuning UT)
  player.torso = new THREE.Mesh(new THREE.BoxGeometry(0.42, 0.52, 0.24), almamaterMat);
  player.torso.position.y = 0.72;
  player.torso.castShadow = true;
  pGroup.add(player.torso);

  // Kemeja Putih Bagian Dalam (V-Neck Opening)
  const innerShirt = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.24, 0.02), shirtWhiteMat);
  innerShirt.position.set(0, 0.14, 0.122);
  player.torso.add(innerShirt);

  // Dasi Biru UT
  const tie = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.22, 0.025), tieMat);
  tie.position.set(0, 0.08, 0.125);
  player.torso.add(tie);

  // Logo Resmi Universitas Terbuka di Dada Kiri
  const utLogoTex = createUtLogoTexture(THREE);
  const utBadge = new THREE.Mesh(
    new THREE.PlaneGeometry(0.10, 0.10),
    new THREE.MeshBasicMaterial({ map: utLogoTex, transparent: true, side: THREE.DoubleSide })
  );
  utBadge.position.set(-0.11, 0.10, 0.126);
  player.torso.add(utBadge);

  // 3. Head Group (Wajah Coklat & Rambut Mahasiswa Rapi)
  const headGroup = new THREE.Group();
  headGroup.position.set(0, 1.16, 0);

  player.head = new THREE.Mesh(new THREE.BoxGeometry(0.32, 0.32, 0.30), skinMat);
  player.head.castShadow = true;
  headGroup.add(player.head);

  // Eyes & Friendly Smile
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

  // Rambut Mahasiswa Rapi (Gaya Belah Samping)
  const hairTop = new THREE.Mesh(new THREE.BoxGeometry(0.34, 0.08, 0.32), hairMat);
  hairTop.position.set(0, 0.16, 0);
  player.head.add(hairTop);

  const hairSideL = new THREE.Mesh(new THREE.BoxGeometry(0.03, 0.14, 0.30), hairMat);
  hairSideL.position.set(-0.16, 0.08, 0);
  player.head.add(hairSideL);

  const hairSideR = new THREE.Mesh(new THREE.BoxGeometry(0.03, 0.14, 0.30), hairMat);
  hairSideR.position.set(0.16, 0.08, 0);
  player.head.add(hairSideR);

  const hairBack = new THREE.Mesh(new THREE.BoxGeometry(0.32, 0.18, 0.03), hairMat);
  hairBack.position.set(0, 0.06, -0.15);
  player.head.add(hairBack);

  pGroup.add(headGroup);

  // 4. Arms (Lengan Jas Almamater Kuning & Tangan Kulit Coklat)
  const armGeo = new THREE.BoxGeometry(0.14, 0.44, 0.14);
  player.leftArm = new THREE.Mesh(armGeo, almamaterMat);
  player.leftArm.position.set(-0.29, 0.68, 0);
  player.leftArm.castShadow = true;
  pGroup.add(player.leftArm);

  const handL = new THREE.Mesh(new THREE.BoxGeometry(0.13, 0.12, 0.13), skinMat);
  handL.position.set(0, -0.22, 0);
  player.leftArm.add(handL);

  player.rightArm = new THREE.Mesh(armGeo, almamaterMat);
  player.rightArm.position.set(0.29, 0.68, 0);
  player.rightArm.castShadow = true;
  pGroup.add(player.rightArm);

  const handR = new THREE.Mesh(new THREE.BoxGeometry(0.13, 0.12, 0.13), skinMat);
  handR.position.set(0, -0.22, 0);
  player.rightArm.add(handR);

  // 5. Legs (Celana Bahan Hitam Mahasiswa)
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

let _forward = null;
let _right = null;
let _moveDir = null;
let _targetPos = null;
let _up = null;

function ensureScratchVectors(THREE) {
  if (!_forward) {
    _forward = new THREE.Vector3();
    _right = new THREE.Vector3();
    _moveDir = new THREE.Vector3();
    _targetPos = new THREE.Vector3();
    _up = new THREE.Vector3(0, 1, 0);
  }
}

export function updatePlayerPhysics(THREE, delta, keys, cameraYaw, colliders, chairPos, CHAIR_INTERACTION_DIST) {
  if (player.isSitting) return;

  ensureScratchVectors(THREE);

  const fx = Math.sin(cameraYaw);
  const fz = Math.cos(cameraYaw);
  _forward.set(fx, 0, fz).normalize();
  _right.crossVectors(_forward, _up).normalize();

  _moveDir.set(0, 0, 0);
  if (keys.forward)  _moveDir.add(_forward);
  if (keys.backward) _moveDir.sub(_forward);
  if (keys.right)    _moveDir.add(_right);
  if (keys.left)     _moveDir.sub(_right);

  const isMoving = _moveDir.lengthSq() > 0.0001;
  const currentSpeed = keys.sprint ? player.sprintSpeed : player.speed;

  if (isMoving) {
    _moveDir.normalize();
    const moveDist = currentSpeed * delta;
    _targetPos.copy(player.pos).addScaledVector(_moveDir, moveDist);

    _targetPos.x = Math.max(-6.5, Math.min(6.5, _targetPos.x));
    _targetPos.z = Math.max(-6.5, Math.min(6.5, _targetPos.z));

    let canMove = true;
    for (const col of colliders) {
      if (
        _targetPos.x > col.minX &&
        _targetPos.x < col.maxX &&
        _targetPos.z > col.minZ &&
        _targetPos.z < col.maxZ
      ) {
        canMove = false;
        break;
      }
    }

    if (canMove) {
      player.pos.copy(_targetPos);
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
      const lookAngle = Math.atan2(_moveDir.x, _moveDir.z);
      const rotDamp = 1.0 - Math.exp(-18 * delta);
      player.meshGroup.rotation.y = THREE.MathUtils.lerp(player.meshGroup.rotation.y, lookAngle, rotDamp);
    }
  } else {
    if (player.leftArm && player.rightArm && player.leftLeg && player.rightLeg) {
      const limbDamp = 1.0 - Math.exp(-14 * delta);
      player.leftArm.rotation.x = THREE.MathUtils.lerp(player.leftArm.rotation.x, 0, limbDamp);
      player.rightArm.rotation.x = THREE.MathUtils.lerp(player.rightArm.rotation.x, 0, limbDamp);
      player.leftLeg.rotation.x = THREE.MathUtils.lerp(player.leftLeg.rotation.x, 0, limbDamp);
      player.rightLeg.rotation.x = THREE.MathUtils.lerp(player.rightLeg.rotation.x, 0, limbDamp);
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
  const isNearChair = distToChair < CHAIR_INTERACTION_DIST;
  const prompt = document.getElementById('interaction-prompt');
  if (prompt) {
    prompt.classList.toggle('visible', isNearChair && !player.isSitting);
  }
}
