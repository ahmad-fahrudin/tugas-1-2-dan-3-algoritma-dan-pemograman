/**
 * OfficeRoom Component - Realistic Architectural 3D Office
 * Builds: Parquet floor, woven rug, ceiling cove, wood slat feature wall,
 * framed art, bookshelf, Monstera plant, water dispenser, panorama window & skyline.
 */

export function buildOfficeRoom(THREE, scene) {
  const roomGroup = new THREE.Group();

  // 1. Floor: Specular Dark Oak Parquet
  const floorGeo = new THREE.PlaneGeometry(14, 14);
  const floorMat = new THREE.MeshStandardMaterial({
    color: 0x1a2332,
    roughness: 0.32,
    metalness: 0.15
  });
  const floorMesh = new THREE.Mesh(floorGeo, floorMat);
  floorMesh.rotation.x = -Math.PI / 2;
  floorMesh.receiveShadow = true;
  roomGroup.add(floorMesh);

  // 2. High-End Woven Area Rug
  const rug = new THREE.Mesh(
    new THREE.PlaneGeometry(6.6, 5.4),
    new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.95 })
  );
  rug.rotation.x = -Math.PI / 2;
  rug.position.set(0, 0.005, 0.5);
  rug.receiveShadow = true;
  roomGroup.add(rug);

  // 3. Ceiling with Recessed LED Cove
  const ceiling = new THREE.Mesh(
    new THREE.PlaneGeometry(14, 14),
    new THREE.MeshStandardMaterial({ color: 0x0b101d, roughness: 0.85 })
  );
  ceiling.rotation.x = Math.PI / 2;
  ceiling.position.y = 4.5;
  roomGroup.add(ceiling);

  const lightFixture = new THREE.Mesh(
    new THREE.BoxGeometry(3.6, 0.08, 2.4),
    new THREE.MeshBasicMaterial({ color: 0xffffff })
  );
  lightFixture.position.set(0, 4.46, 0);
  roomGroup.add(lightFixture);

  // 4. Perimeter Baseboards (Skirting Boards)
  const baseboardMat = new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.5 });
  const bbBack = new THREE.Mesh(new THREE.BoxGeometry(14, 0.15, 0.04), baseboardMat);
  bbBack.position.set(0, 0.075, -6.98);
  roomGroup.add(bbBack);

  const bbLeft = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.15, 14), baseboardMat);
  bbLeft.position.set(-6.98, 0.075, 0);
  roomGroup.add(bbLeft);

  const bbFront = new THREE.Mesh(new THREE.BoxGeometry(14, 0.15, 0.04), baseboardMat);
  bbFront.position.set(0, 0.075, 6.98);
  roomGroup.add(bbFront);

  // 5. Back Feature Wall (Acoustic Wood Slat Wall)
  const wallMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.7 });
  const backWall = new THREE.Mesh(new THREE.PlaneGeometry(14, 4.5), wallMat);
  backWall.position.set(0, 2.25, -7);
  backWall.receiveShadow = true;
  roomGroup.add(backWall);

  // 20 Vertical Solid Wood Slats
  const slatMat = new THREE.MeshStandardMaterial({ color: 0x1c1917, roughness: 0.45, metalness: 0.1 });
  const slatGeo = new THREE.BoxGeometry(0.08, 4.4, 0.04);
  for (let x = -3.2; x <= 3.2; x += 0.32) {
    const slat = new THREE.Mesh(slatGeo, slatMat);
    slat.position.set(x, 2.25, -6.94);
    slat.castShadow = true;
    roomGroup.add(slat);
  }

  // Modern Framed Architectural Canvas Art
  const artFrame = new THREE.Mesh(
    new THREE.BoxGeometry(2.6, 1.3, 0.04),
    new THREE.MeshStandardMaterial({ color: 0x090d16, roughness: 0.3 })
  );
  artFrame.position.set(0, 2.9, -6.9);
  roomGroup.add(artFrame);

  const artCanvas = new THREE.Mesh(
    new THREE.PlaneGeometry(2.44, 1.14),
    new THREE.MeshStandardMaterial({ color: 0x0284c7, roughness: 0.4, emissive: 0x0369a1, emissiveIntensity: 0.15 })
  );
  artCanvas.position.set(0, 2.9, -6.875);
  roomGroup.add(artCanvas);

  // 6. Left & Front Walls
  const leftWall = new THREE.Mesh(new THREE.PlaneGeometry(14, 4.5), wallMat);
  leftWall.rotation.y = Math.PI / 2;
  leftWall.position.set(-7, 2.25, 0);
  leftWall.receiveShadow = true;
  roomGroup.add(leftWall);

  const frontWall = new THREE.Mesh(new THREE.PlaneGeometry(14, 4.5), wallMat);
  frontWall.rotation.y = Math.PI;
  frontWall.position.set(0, 2.25, 7);
  frontWall.receiveShadow = true;
  roomGroup.add(frontWall);

  // 7. Designer Bookshelf with Books & Gold Trophy
  const shelfMat = new THREE.MeshStandardMaterial({ color: 0x111827, roughness: 0.4, metalness: 0.2 });
  const shelf = new THREE.Mesh(new THREE.BoxGeometry(1.6, 3.2, 0.6), shelfMat);
  shelf.position.set(-6.0, 1.6, -6.4);
  shelf.castShadow = true;
  shelf.receiveShadow = true;
  roomGroup.add(shelf);

  const bookColors = [0x0284c7, 0x10b981, 0xf59e0b, 0xdc2626, 0xe2e8f0, 0x7c3aed];
  for (let b = 0; b < 10; b++) {
    const bHeight = 0.26 + Math.random() * 0.1;
    const bThick = 0.04 + Math.random() * 0.03;
    const book = new THREE.Mesh(
      new THREE.BoxGeometry(bThick, bHeight, 0.36),
      new THREE.MeshStandardMaterial({ color: bookColors[b % bookColors.length], roughness: 0.5 })
    );
    book.position.set(-6.4 + b * 0.08, 1.6 + bHeight / 2, -6.4);
    roomGroup.add(book);
  }

  const trophyBase = new THREE.Mesh(
    new THREE.CylinderGeometry(0.06, 0.08, 0.08, 16),
    new THREE.MeshStandardMaterial({ color: 0x18181b, roughness: 0.2 })
  );
  trophyBase.position.set(-5.5, 2.34, -6.4);
  roomGroup.add(trophyBase);

  const trophyCup = new THREE.Mesh(
    new THREE.ConeGeometry(0.07, 0.16, 16),
    new THREE.MeshStandardMaterial({ color: 0xf59e0b, metalness: 0.95, roughness: 0.15 })
  );
  trophyCup.position.set(-5.5, 2.46, -6.4);
  trophyCup.rotation.x = Math.PI;
  roomGroup.add(trophyCup);

  // 8. Corner Indoor Planter (Monstera Leaf Plant)
  const potMat = new THREE.MeshStandardMaterial({ color: 0x334155, roughness: 0.6 });
  const plantPot = new THREE.Mesh(new THREE.CylinderGeometry(0.3, 0.24, 0.65, 20), potMat);
  plantPot.position.set(-5.8, 0.325, 5.5);
  plantPot.castShadow = true;
  roomGroup.add(plantPot);

  const leafMat = new THREE.MeshStandardMaterial({ color: 0x059669, roughness: 0.4 });
  for (let l = 0; l < 6; l++) {
    const angle = (l * Math.PI * 2) / 6;
    const leaf = new THREE.Mesh(new THREE.CylinderGeometry(0.01, 0.015, 0.8, 8), leafMat);
    leaf.position.set(-5.8 + Math.cos(angle) * 0.15, 0.8, 5.5 + Math.sin(angle) * 0.15);
    leaf.rotation.z = Math.cos(angle) * 0.45;
    leaf.rotation.x = Math.sin(angle) * 0.45;
    roomGroup.add(leaf);

    const leafBlade = new THREE.Mesh(new THREE.BoxGeometry(0.32, 0.01, 0.24), leafMat);
    leafBlade.position.set(-5.8 + Math.cos(angle) * 0.45, 1.15, 5.5 + Math.sin(angle) * 0.45);
    leafBlade.rotation.y = angle;
    roomGroup.add(leafBlade);
  }

  // 9. Water Dispenser with Water Bottle
  const wdBase = new THREE.Mesh(
    new THREE.BoxGeometry(0.55, 1.35, 0.55),
    new THREE.MeshStandardMaterial({ color: 0xf1f5f9, roughness: 0.3 })
  );
  wdBase.position.set(5.5, 0.675, -6.3);
  wdBase.castShadow = true;
  roomGroup.add(wdBase);

  const bottle = new THREE.Mesh(
    new THREE.CylinderGeometry(0.24, 0.24, 0.65, 20),
    new THREE.MeshStandardMaterial({ color: 0x0284c7, transparent: true, opacity: 0.75, roughness: 0.1 })
  );
  bottle.position.set(5.5, 1.68, -6.3);
  roomGroup.add(bottle);

  // 10. Floor-to-Ceiling Panorama Window Wall
  const winFrame = new THREE.Mesh(
    new THREE.BoxGeometry(0.18, 3.8, 10.4),
    new THREE.MeshStandardMaterial({ color: 0x090d16, roughness: 0.3, metalness: 0.6 })
  );
  winFrame.position.set(6.92, 2.2, 0);
  roomGroup.add(winFrame);

  for (let mz = -3.5; mz <= 3.5; mz += 3.5) {
    const mullion = new THREE.Mesh(
      new THREE.BoxGeometry(0.2, 3.75, 0.08),
      new THREE.MeshStandardMaterial({ color: 0x090d16, roughness: 0.3, metalness: 0.6 })
    );
    mullion.position.set(6.9, 2.2, mz);
    roomGroup.add(mullion);
  }

  const glass = new THREE.Mesh(
    new THREE.PlaneGeometry(10.0, 3.6),
    new THREE.MeshStandardMaterial({ color: 0x38bdf8, transparent: true, opacity: 0.15, roughness: 0.05 })
  );
  glass.rotation.y = -Math.PI / 2;
  glass.position.set(6.85, 2.2, 0);
  roomGroup.add(glass);

  // City Skyline Backdrop
  const cityGroup = new THREE.Group();
  cityGroup.position.set(16, 0, 0);
  const bldColors = [0x090d16, 0x111827, 0x0f172a, 0x1e293b];
  for (let i = -14; i <= 14; i += 2.2) {
    const height = 7 + Math.random() * 14;
    const width = 1.8 + Math.random() * 1.4;
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
