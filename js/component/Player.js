/**
 * Player Component - 3D Character Model, Movement Physics & Camera
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

export function buildRobloxPlayer(THREE, scene) {
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

export function updatePlayerPhysics(THREE, delta, keys, cameraYaw, colliders, chairPos, CHAIR_INTERACTION_DIST) {
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
  const isNearChair = distToChair < CHAIR_INTERACTION_DIST;
  const prompt = document.getElementById('interaction-prompt');
  if (prompt) {
    prompt.classList.toggle('visible', isNearChair && !player.isSitting);
  }
}
