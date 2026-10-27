/**
 * MoneyAndSlip Component - Banknote Stacks, Holographic Receipt, Coins & Steam
 */

export let moneyGroup;
export let redMoneyTexture;
export let blueMoneyTexture;

let hologramMesh, hologramCanvas, hologramCtx, hologramTexture;
let coinParticles = [];
let steamParticles;

export function createBanknoteTexture(THREE, color, label) {
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

export function buildMoneyGroup(THREE, scene) {
  redMoneyTexture = createBanknoteTexture(THREE, '#be123c', '100.000');
  blueMoneyTexture = createBanknoteTexture(THREE, '#0284c7', '50.000');

  moneyGroup = new THREE.Group();
  // Di depan player di atas meja (bukan di belakang layar)
  moneyGroup.position.set(0.50, 1.215, 0.38);
  scene.add(moneyGroup);
}

export function spawnMoneyStacks(THREE, gajiPokok, gajiLembur) {
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

export function buildHologramSlip(THREE, scene) {
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
  return hologramMesh;
}

export function updateHologramSlip(data) {
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

export function triggerCelebration(THREE, scene) {
  const coinGeo = new THREE.CylinderGeometry(0.08, 0.08, 0.02, 12);
  const coinMat = new THREE.MeshStandardMaterial({
    color: 0xf59e0b,
    metalness: 0.9,
    roughness: 0.2
  });

  const spawnOrigin = new THREE.Vector3(0.50, 1.45, 0.38);

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

export function updateCoinParticles(scene, delta) {
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

export function buildSteamParticles(THREE, scene) {
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

export function updateSteam(delta) {
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
