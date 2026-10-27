/**
 * NpcEmployee Component - 3D Roblox Employee Handover Interaction
 */

import { SoundFX } from './SoundFX.js';
import { redMoneyTexture, moneyGroup } from './MoneyAndSlip.js';
import { updateMonitor } from './Workstation.js';

export const npc = {
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
  pos: null,
  walkTime: 0,
  state: 'IDLE',
  timer: 0,
  onComplete: null
};

export function buildNpcEmployee(THREE, scene) {
  npc.pos = new THREE.Vector3(-4.5, 0, 1.4);

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

export function drawNameTag(ctx, name) {
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

export function drawChatBubble(ctx, text) {
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

export function handoverSalary(data, onComplete, cameraState) {
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

  npc.pos.set(-4.5, 0, 1.4);
  npc.meshGroup.position.copy(npc.pos);
  npc.meshGroup.rotation.y = Math.PI / 2;
  npc.meshGroup.visible = true;

  if (cameraState && cameraState.isSitting) {
    cameraState.cameraYaw = Math.PI + 0.35;
    cameraState.cameraPitch = -0.10;
  }

  npc.walkTime = 0;
  npc.timer = 0;
  npc.state = 'WALKING_IN';
  npc.onComplete = onComplete;

  updateMonitor('Proses', 'Menyerahkan gaji...', gol);
}

export function updateNpc(THREE, delta, camera) {
  if (npc.state === 'IDLE' || !npc.meshGroup) return;

  if (camera) {
    if (npc.nameTagMesh) npc.nameTagMesh.quaternion.copy(camera.quaternion);
    if (npc.chatBubbleMesh) npc.chatBubbleMesh.quaternion.copy(camera.quaternion);
  }

  const walkSpeed = 2.4;
  const targetDeskX = -0.95;

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
    npc.meshGroup.rotation.y = Math.PI / 2;

    if (npc.pos.x >= targetDeskX) {
      npc.pos.x = targetDeskX;
      npc.meshGroup.position.copy(npc.pos);

      npc.meshGroup.rotation.y = Math.PI / 3;
      npc.leftLeg.rotation.x = 0;
      npc.rightLeg.rotation.x = 0;
      npc.state = 'TAKING_MONEY';
      npc.timer = 0;
    }
  } else if (npc.state === 'TAKING_MONEY') {
    npc.timer += delta;

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
      npc.meshGroup.rotation.y = -Math.PI / 2;
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
    npc.meshGroup.rotation.y = -Math.PI / 2;

    if (npc.pos.x <= -4.5) {
      npc.meshGroup.visible = false;
      npc.state = 'IDLE';
      if (typeof npc.onComplete === 'function') {
        npc.onComplete();
      }
    }
  }
}
