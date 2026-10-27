/**
 * Workstation Component - Executive Desk, Ergonomic Chair, Computer & ID Badge
 */

let monitorScreenMesh, monitorCanvas, monitorCtx, monitorTexture;
let idBadgeMesh, idBadgeCanvas, idBadgeCtx, idBadgeTexture;

export function buildWorkstationDesk(THREE, scene) {
  const deskGroup = new THREE.Group();

  // 1. Dual-Tier Beveled Walnut Tabletop (y = 1.15, surface y = 1.21)
  const topGeo = new THREE.BoxGeometry(4.4, 0.10, 2.2);
  const topMat = new THREE.MeshStandardMaterial({
    color: 0x1e1610,
    roughness: 0.28,
    metalness: 0.05
  });
  const topMesh = new THREE.Mesh(topGeo, topMat);
  topMesh.position.y = 1.15;
  topMesh.castShadow = true;
  topMesh.receiveShadow = true;
  deskGroup.add(topMesh);

  // Beveled Chamfer Lower Rim
  const rimMesh = new THREE.Mesh(
    new THREE.BoxGeometry(4.34, 0.03, 2.14),
    new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.35 })
  );
  rimMesh.position.y = 1.095;
  deskGroup.add(rimMesh);

  // 2. Stitched Leather Desk Mat
  const matMesh = new THREE.Mesh(
    new THREE.BoxGeometry(2.6, 0.012, 1.3),
    new THREE.MeshStandardMaterial({ color: 0x141416, roughness: 0.65 })
  );
  matMesh.position.set(-0.2, 1.215, 0.15);
  matMesh.receiveShadow = true;
  deskGroup.add(matMesh);

  // 3. Heavy Matte Steel Legs with Floor Glides
  const legGeo = new THREE.CylinderGeometry(0.055, 0.055, 1.15, 16);
  const legMat = new THREE.MeshStandardMaterial({ color: 0x0f172a, metalness: 0.6, roughness: 0.35 });
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

    const glide = new THREE.Mesh(
      new THREE.CylinderGeometry(0.07, 0.07, 0.02, 16),
      new THREE.MeshStandardMaterial({ color: 0x94a3b8, metalness: 0.9, roughness: 0.2 })
    );
    glide.position.set(pos[0], 0.01, pos[2]);
    deskGroup.add(glide);
  });

  const crossbar = new THREE.Mesh(
    new THREE.BoxGeometry(4.0, 0.04, 0.04),
    legMat
  );
  crossbar.position.set(0, 0.25, -0.9);
  deskGroup.add(crossbar);

  // 4. Glazed Porcelain Coffee Mug with Coaster & Coffee (Beside player's left side)
  const mugX = -0.75;
  const mugZ = 0.45;

  const coaster = new THREE.Mesh(
    new THREE.CylinderGeometry(0.11, 0.11, 0.012, 24),
    new THREE.MeshStandardMaterial({ color: 0x854d0e, roughness: 0.8 })
  );
  coaster.position.set(mugX, 1.215, mugZ);
  coaster.receiveShadow = true;
  deskGroup.add(coaster);

  const mugMesh = new THREE.Mesh(
    new THREE.CylinderGeometry(0.085, 0.075, 0.18, 20),
    new THREE.MeshStandardMaterial({ color: 0xf8fafc, roughness: 0.15 })
  );
  mugMesh.position.set(mugX, 1.305, mugZ);
  mugMesh.castShadow = true;
  mugMesh.receiveShadow = true;
  deskGroup.add(mugMesh);

  // Ceramic Mug Handle
  const handleMesh = new THREE.Mesh(
    new THREE.TorusGeometry(0.045, 0.012, 12, 16, Math.PI),
    new THREE.MeshStandardMaterial({ color: 0xf8fafc, roughness: 0.15 })
  );
  handleMesh.position.set(mugX - 0.085, 1.305, mugZ);
  handleMesh.rotation.y = Math.PI / 2;
  deskGroup.add(handleMesh);

  const coffeeSurface = new THREE.Mesh(
    new THREE.CylinderGeometry(0.078, 0.078, 0.01, 16),
    new THREE.MeshStandardMaterial({ color: 0x3d2314, roughness: 0.1 })
  );
  coffeeSurface.position.set(mugX, 1.38, mugZ);
  deskGroup.add(coffeeSurface);

  // 5. Smartphone on Angled Wireless Stand
  const phoneStand = new THREE.Mesh(
    new THREE.BoxGeometry(0.14, 0.18, 0.12),
    new THREE.MeshStandardMaterial({ color: 0x1e293b, metalness: 0.7, roughness: 0.3 })
  );
  phoneStand.position.set(-1.3, 1.25, 0.3);
  phoneStand.rotation.x = -0.3;
  deskGroup.add(phoneStand);

  const smartphone = new THREE.Mesh(
    new THREE.BoxGeometry(0.12, 0.22, 0.015),
    new THREE.MeshStandardMaterial({ color: 0x090d16, roughness: 0.1, metalness: 0.9 })
  );
  smartphone.position.set(-1.3, 1.28, 0.28);
  smartphone.rotation.x = -0.3;
  deskGroup.add(smartphone);

  // 6. Ceramic Fluted Succulent Planter
  const potMesh = new THREE.Mesh(
    new THREE.CylinderGeometry(0.14, 0.1, 0.18, 20),
    new THREE.MeshStandardMaterial({ color: 0x64748b, roughness: 0.6 })
  );
  potMesh.position.set(1.9, 1.30, -0.7);
  deskGroup.add(potMesh);

  const plantMesh = new THREE.Mesh(
    new THREE.DodecahedronGeometry(0.12, 1),
    new THREE.MeshStandardMaterial({ color: 0x10b981, roughness: 0.4 })
  );
  plantMesh.position.set(1.9, 1.45, -0.7);
  deskGroup.add(plantMesh);

  scene.add(deskGroup);
}

export function buildOfficeChair(THREE, scene, chairPos) {
  const chairGroup = new THREE.Group();
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

  // Backrest
  const backrest = new THREE.Mesh(new THREE.BoxGeometry(0.62, 0.75, 0.08), seatMat);
  backrest.position.set(0, 1.05, 0.32);
  backrest.rotation.x = 0.08;
  backrest.castShadow = true;
  chairGroup.add(backrest);

  // Headrest
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
  return chairGroup;
}

export function buildComputer(THREE, scene) {
  const pcGroup = new THREE.Group();
  const metalMat = new THREE.MeshStandardMaterial({ color: 0x94a3b8, metalness: 0.85, roughness: 0.2 });

  // 1. Heavy Chamfered Base & Sculpted Articulated Arm
  const standBase = new THREE.Mesh(new THREE.CylinderGeometry(0.26, 0.30, 0.025, 32), metalMat);
  standBase.position.set(-0.2, 1.225, -0.55);
  pcGroup.add(standBase);

  const standStem = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.58, 0.08), metalMat);
  standStem.position.set(-0.2, 1.51, -0.62);
  standStem.rotation.x = 0.08;
  pcGroup.add(standStem);

  // 2. Ultrawide Monitor Chassis (Curved Micro-Bezel)
  const bezelMat = new THREE.MeshStandardMaterial({ color: 0x090d16, roughness: 0.25, metalness: 0.5 });
  const bezel = new THREE.Mesh(new THREE.BoxGeometry(2.14, 1.18, 0.06), bezelMat);
  bezel.position.set(-0.2, 1.82, -0.55);
  bezel.castShadow = true;
  pcGroup.add(bezel);

  // Chin Bar with Metallic Accent
  const chin = new THREE.Mesh(
    new THREE.BoxGeometry(2.14, 0.04, 0.065),
    new THREE.MeshStandardMaterial({ color: 0x18181b, metalness: 0.8, roughness: 0.2 })
  );
  chin.position.set(-0.2, 1.25, -0.55);
  pcGroup.add(chin);

  // 3. ScreenBar LED Monitor Light
  const screenBar = new THREE.Mesh(
    new THREE.BoxGeometry(0.85, 0.03, 0.04),
    new THREE.MeshStandardMaterial({ color: 0x18181b, metalness: 0.8, roughness: 0.2 })
  );
  screenBar.position.set(-0.2, 2.42, -0.52);
  pcGroup.add(screenBar);

  const barLens = new THREE.Mesh(
    new THREE.PlaneGeometry(0.82, 0.02),
    new THREE.MeshBasicMaterial({ color: 0xfffbeb })
  );
  barLens.rotation.x = Math.PI / 2;
  barLens.position.set(-0.2, 2.405, -0.52);
  pcGroup.add(barLens);

  // 4. Dynamic Ultra-Sharp Screen Texture
  monitorCanvas = document.createElement('canvas');
  monitorCanvas.width = 1024;
  monitorCanvas.height = 512;
  monitorCtx = monitorCanvas.getContext('2d');
  monitorTexture = new THREE.CanvasTexture(monitorCanvas);

  monitorScreenMesh = new THREE.Mesh(
    new THREE.PlaneGeometry(2.04, 1.08),
    new THREE.MeshBasicMaterial({ map: monitorTexture })
  );
  monitorScreenMesh.position.set(-0.2, 1.82, -0.515);
  pcGroup.add(monitorScreenMesh);

  // 5. Studio Monitor Speakers
  const speakerMat = new THREE.MeshStandardMaterial({ color: 0x18181b, roughness: 0.4 });
  const coneMat = new THREE.MeshStandardMaterial({ color: 0xf59e0b, metalness: 0.7, roughness: 0.3 });

  [-1.45, 1.05].forEach(sx => {
    const spkBox = new THREE.Mesh(new THREE.BoxGeometry(0.20, 0.34, 0.22), speakerMat);
    spkBox.position.set(sx, 1.38, -0.55);
    spkBox.rotation.y = sx < 0 ? 0.22 : -0.22;
    spkBox.castShadow = true;
    pcGroup.add(spkBox);

    const cone = new THREE.Mesh(new THREE.CylinderGeometry(0.065, 0.02, 0.015, 20), coneMat);
    cone.position.set(sx, 1.34, -0.44);
    cone.rotation.x = Math.PI / 2;
    cone.rotation.y = sx < 0 ? 0.22 : -0.22;
    pcGroup.add(cone);
  });

  // 6. Custom Mechanical Keyboard
  const kbChassis = new THREE.Mesh(
    new THREE.BoxGeometry(1.22, 0.04, 0.42),
    new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.4, metalness: 0.5 })
  );
  kbChassis.position.set(-0.4, 1.23, 0.2);
  kbChassis.castShadow = true;
  pcGroup.add(kbChassis);

  const keycapsMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.5 });
  const keycaps = new THREE.Mesh(new THREE.BoxGeometry(1.14, 0.02, 0.36), keycapsMat);
  keycaps.position.set(-0.4, 1.255, 0.2);
  pcGroup.add(keycaps);

  const enterKey = new THREE.Mesh(
    new THREE.BoxGeometry(0.12, 0.022, 0.06),
    new THREE.MeshStandardMaterial({ color: 0x0284c7, emissive: 0x0284c7, emissiveIntensity: 0.3 })
  );
  enterKey.position.set(0.1, 1.26, 0.2);
  pcGroup.add(enterKey);

  // 7. Sculpted Ergonomic Mouse
  const mouseBody = new THREE.Mesh(
    new THREE.BoxGeometry(0.14, 0.05, 0.22),
    new THREE.MeshStandardMaterial({ color: 0x1f2937, roughness: 0.25 })
  );
  mouseBody.position.set(0.55, 1.23, 0.22);
  mouseBody.castShadow = true;
  pcGroup.add(mouseBody);

  const scrollWheel = new THREE.Mesh(
    new THREE.CylinderGeometry(0.015, 0.015, 0.03, 16),
    metalMat
  );
  scrollWheel.rotation.z = Math.PI / 2;
  scrollWheel.position.set(0.55, 1.258, 0.16);
  pcGroup.add(scrollWheel);

  scene.add(pcGroup);
}

export function updateMonitor(status, detail, currentGrade) {
  if (!monitorCtx) return;
  const ctx = monitorCtx;
  const w = 1024, h = 512;

  ctx.fillStyle = '#090d16';
  ctx.fillRect(0, 0, w, h);

  // Titlebar with Developer Window Dots
  ctx.fillStyle = '#1e293b';
  ctx.fillRect(0, 0, w, 56);

  const dots = ['#ef4444', '#f59e0b', '#10b981'];
  dots.forEach((color, i) => {
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.arc(28 + i * 20, 28, 6, 0, Math.PI * 2);
    ctx.fill();
  });

  ctx.fillStyle = '#f8fafc';
  ctx.font = '600 18px -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif';
  ctx.fillText('Terminal Penghasilan Karyawan — Tugas 3', 105, 35);

  const isSuccess = status === 'Selesai' || status === 'Lunas';
  const pillColor = isSuccess ? '#10b981' : (status === 'Menghitung' || status === 'Proses' ? '#f59e0b' : '#38bdf8');

  ctx.fillStyle = '#0f172a';
  ctx.strokeStyle = pillColor;
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.roundRect(w - 180, 14, 155, 30, 15);
  ctx.fill();
  ctx.stroke();

  ctx.fillStyle = pillColor;
  ctx.beginPath();
  ctx.arc(w - 165, 29, 4, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = '#f8fafc';
  ctx.font = '600 14px monospace';
  ctx.fillText(status, w - 150, 34);

  // Status message box
  ctx.fillStyle = '#0f172a';
  ctx.strokeStyle = '#1e293b';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.roundRect(24, 76, w - 48, 140, 8);
  ctx.fill();
  ctx.stroke();

  ctx.fillStyle = '#94a3b8';
  ctx.font = '14px -apple-system, sans-serif';
  ctx.fillText('Status Sistem:', 44, 112);

  ctx.fillStyle = '#f8fafc';
  ctx.font = '700 28px -apple-system, sans-serif';
  ctx.fillText(detail || 'Menunggu input...', 44, 160);

  // Array Tables
  drawArrayCard(ctx, 24, 236, 476, 240, 'ARRAY_GAJI [double]', [
    'Indeks 0: Rp 5.000.000 (Gol A)',
    'Indeks 1: Rp 6.500.000 (Gol B)',
    'Indeks 2: Rp 9.500.000 (Gol C)'
  ], currentGrade === 'A' ? 0 : (currentGrade === 'B' ? 1 : 2));

  drawArrayCard(ctx, 524, 236, 476, 240, 'ARRAY_LEMBUR [double]', [
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

export function buildIdBadge(THREE, scene) {
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

export function updateIdBadge(grade, salary, GRADE_CONFIG) {
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
