import * as THREE from 'three';

// ═══════════════════════════════════════════════════════════════
//  FarmSceneCour - Niveau basé sur le plan réel de la propriété
//  Remplace FarmScene.js dans Game.js :
//    import { FarmScene } from './FarmSceneCour.js';
//
//  Colliders exportés pour Player.js et ProjectileManager.js :
//    FarmSceneCour.COLLIDERS
//    FarmSceneCour.WORLD_BOUNDS
//    FarmSceneCour.SPAWN_POSITIONS
// ═══════════════════════════════════════════════════════════════

// Plan offset : plan(px,py) → Three.js(px + OX, 0, py + OZ)
const OX = -12;
const OZ = 7;
function P(px, pz) { return { x: px + OX, z: pz + OZ }; }

export class FarmScene {
  // ── Static data for Player.js / ProjectileManager.js / server ──
  static COLLIDERS = [
    // Maison 1 (plan 0,-15, 8×15)
    { minX: -12, maxX: -4, minZ: -8, maxZ: 7, maxY: 6 },
    // Maison 2 (plan 9,-15, 8×6)
    { minX: -3, maxX: 5, minZ: -8, maxZ: -2, maxY: 7 },
    // Grand mur vertical (plan 7,-18, 0.3×6)
    { minX: -5.2, maxX: -4.5, minZ: -11, maxZ: -5, maxY: 3 },
    // Porte blanche fermée (plan 8,-9)
    { minX: -4.2, maxX: -3.5, minZ: -2, maxZ: -1.5, maxY: 2.2 },
    // Appentis back wall + side wall
    { minX: -4, maxX: -3.7, minZ: -13, maxZ: -8, maxY: 3 },
    { minX: -4, maxX: 0, minZ: -13.2, maxZ: -12.8, maxY: 3 },
    // ── Haies périmètre (3m haut, infranchissable) ──
    // Nord
    { minX: -14, maxX: 15, minZ: 11.5, maxZ: 13, maxY: 3 },
    // Est
    { minX: 11.5, maxX: 13, minZ: -15, maxZ: 13, maxY: 3 },
    // Sud (partie ouest, le long des bâtiments)
    { minX: -14, maxX: -12, minZ: -15, maxZ: 13, maxY: 3 },
    // Sud-Est (sous portail)
    { minX: -12, maxX: 5, minZ: -14.5, maxZ: -13, maxY: 3 },
    // Sud entre portail et haie est
    { minX: 7, maxX: 13, minZ: -14.5, maxZ: -13, maxY: 3 },
    // Murets divers
    { minX: -4, maxX: 0, minZ: -13.2, maxZ: -12.7, maxY: 2.5 },
    // Flower triangle murets (jumpable, height 0.7)
    // Wall C (horizontal bottom)
    { minX: 0.2, maxX: 4.6, minZ: -0.45, maxZ: -0.15, maxY: 0.7 },
    // Wall B (vertical left)
    { minX: 0.15, maxX: 0.45, minZ: -0.3, maxZ: 2.4, maxY: 0.7 },
    // Wall A (diagonal) - approximated with angled box
    { minX: 0.5, maxX: 4.6, minZ: -0.4, maxZ: 2.1, maxY: 0.7 },
    // Thick hedge at back of garden
    { minX: 7.5, maxX: 9.5, minZ: -3.5, maxZ: 3.5, maxY: 2.5 },
  ];

  static WORLD_BOUNDS = {
    minX: -13.5, maxX: 12.5,
    minZ: -14, maxZ: 12.5
  };

  static SPAWN_POSITIONS = [
    { x: -2, y: 1.7, z: 1 },    // Cour dallée
    { x: 6, y: 1.7, z: 3 }      // Pelouse est
  ];

  constructor(scene) {
    this.scene = scene;
  }

  create() {
    this.createLighting();
    this.createGround();
    this.createMaison1();
    this.createMaison2();
    this.createAppentis();
    this.createCourDallee();
    this.createPorteBlanche();
    this.createPortillonBlanc();
    this.createMurets();
    this.createHaiesPerimetre();
    this.createTrees();
    this.createBushes();
    this.createChemins();
    this.createTasDeBois();
    this.createCompost();
    this.createTableJardin();
    this.createVegetation();
    this.createDecorations();
  }

  // ═══════════════════════════════
  //  LIGHTING (Bretagne overcast)
  // ═══════════════════════════════

  createLighting() {
    const ambient = new THREE.AmbientLight(0x9db8c7, 0.5);
    this.scene.add(ambient);

    const sun = new THREE.DirectionalLight(0xfff4e0, 0.9);
    sun.position.set(20, 35, 15);
    sun.castShadow = true;
    sun.shadow.mapSize.width = 2048;
    sun.shadow.mapSize.height = 2048;
    sun.shadow.camera.near = 0.5;
    sun.shadow.camera.far = 100;
    sun.shadow.camera.left = -35;
    sun.shadow.camera.right = 35;
    sun.shadow.camera.top = 35;
    sun.shadow.camera.bottom = -35;
    sun.shadow.bias = -0.0001;
    this.scene.add(sun);

    const fillLight = new THREE.DirectionalLight(0xb0c4b0, 0.25);
    fillLight.position.set(-10, 5, -10);
    this.scene.add(fillLight);

    const hemi = new THREE.HemisphereLight(0xB0C4DE, 0x4A5D23, 0.45);
    this.scene.add(hemi);
  }

  // ═══════════════════════════════
  //  GROUND
  // ═══════════════════════════════

  createGround() {
    const groundGeo = new THREE.PlaneGeometry(60, 50, 30, 30);
    const groundMat = new THREE.MeshStandardMaterial({
      color: 0x567d46,
      roughness: 0.9,
      flatShading: false
    });

    const positions = groundGeo.attributes.position;
    for (let i = 0; i < positions.count; i++) {
      const x = positions.getX(i);
      const y = positions.getY(i);
      const z = Math.sin(x * 0.3) * 0.08 + Math.cos(y * 0.25) * 0.08;
      positions.setZ(i, z);
    }
    groundGeo.computeVertexNormals();

    const ground = new THREE.Mesh(groundGeo, groundMat);
    ground.rotation.x = -Math.PI / 2;
    ground.position.set(0, 0, -2);
    ground.receiveShadow = true;
    this.scene.add(ground);

    // Darker grass patches
    for (let i = 0; i < 20; i++) {
      const patchGeo = new THREE.CircleGeometry(0.8 + Math.random() * 2, 12);
      const patchMat = new THREE.MeshStandardMaterial({
        color: new THREE.Color(0x3d5c2f).lerp(new THREE.Color(0x567d46), Math.random() * 0.5),
        roughness: 1
      });
      const patch = new THREE.Mesh(patchGeo, patchMat);
      patch.rotation.x = -Math.PI / 2;
      patch.position.set(
        (Math.random() - 0.5) * 25,
        0.01,
        (Math.random() - 0.5) * 25
      );
      patch.receiveShadow = true;
      this.scene.add(patch);
    }
  }

  // ═══════════════════════════════
  //  MAISON 1 (plan: x0,y-15, 8×15)
  //  Grande maison en L, pierre
  // ═══════════════════════════════

  createMaison1() {
    const building = new THREE.Group();
    const p = P(0, -15); // corner

    const wallMat = new THREE.MeshStandardMaterial({ color: 0xc4b8a8, roughness: 0.95 });
    const roofMat = new THREE.MeshStandardMaterial({ color: 0x5a5a60, roughness: 0.8 });

    // Main structure (8 wide × 15 deep × 5.5 tall)
    const wallGeo = new THREE.BoxGeometry(8, 5.5, 15);
    const walls = new THREE.Mesh(wallGeo, wallMat);
    walls.position.set(p.x + 4, 2.75, p.z + 7.5);
    walls.castShadow = true;
    walls.receiveShadow = true;
    building.add(walls);

    // Roof (two-slope, ridge along Z axis)
    const roofShape = new THREE.Shape();
    roofShape.moveTo(-4.3, 0);
    roofShape.lineTo(0, 3);
    roofShape.lineTo(4.3, 0);
    roofShape.lineTo(-4.3, 0);

    const roofGeo = new THREE.ExtrudeGeometry(roofShape, { depth: 15.6, bevelEnabled: false });
    const roof = new THREE.Mesh(roofGeo, roofMat);
    roof.position.set(p.x + 4, 5.5, p.z - 0.3);
    roof.castShadow = true;
    building.add(roof);

    // Chimney
    const chimGeo = new THREE.BoxGeometry(0.6, 2, 0.6);
    const chimney = new THREE.Mesh(chimGeo, wallMat);
    chimney.position.set(p.x + 2, 7.5, p.z + 5);
    chimney.castShadow = true;
    building.add(chimney);

    // ── Windows South facade (z = p.z + 15) ──
    this.createWindow(building, p.x + 2, 4, p.z + 15.01, 0.8, 1.0);
    this.createWindow(building, p.x + 5.5, 4, p.z + 15.01, 0.8, 1.0);
    this.createWindow(building, p.x + 2, 1.8, p.z + 15.01, 1.1, 1.4);
    this.createWindow(building, p.x + 5.5, 1.8, p.z + 15.01, 0.8, 1.0);

    // Door South
    this.createDoor(building, p.x + 3.8, 1.2, p.z + 15.01, 0.9, 2.1);

    // ── Windows North facade (z = p.z) ──
    this.createWindow(building, p.x + 2.5, 4, p.z - 0.01, 0.8, 0.9);
    this.createWindow(building, p.x + 5.5, 4, p.z - 0.01, 0.8, 0.9);
    this.createWindow(building, p.x + 3, 1.8, p.z - 0.01, 1.0, 1.2);

    // ── Windows East facade (x = p.x + 8, facing courtyard) ──
    this.createWindowSide(building, p.x + 8.01, 1.8, p.z + 4, 0.8, 1.0);
    this.createWindowSide(building, p.x + 8.01, 1.8, p.z + 10, 0.8, 1.0);
    this.createWindowSide(building, p.x + 8.01, 4, p.z + 7, 0.7, 0.8);

    // Door East (toward courtyard)
    this.createDoorSide(building, p.x + 8.01, 1.1, p.z + 7, 0.9, 2.1);

    // Dormers
    for (const lx of [2.5, 5.5]) {
      const dWall = new THREE.Mesh(new THREE.BoxGeometry(1.3, 1.3, 0.8), wallMat);
      dWall.position.set(p.x + lx, 6.8, p.z + 14.5);
      building.add(dWall);
      const dRoof = new THREE.Mesh(new THREE.ConeGeometry(1, 0.8, 4), roofMat);
      dRoof.position.set(p.x + lx, 7.7, p.z + 14.5);
      dRoof.rotation.y = Math.PI / 4;
      building.add(dRoof);
      const dWin = new THREE.Mesh(
        new THREE.PlaneGeometry(0.5, 0.6),
        new THREE.MeshStandardMaterial({ color: 0xf5f5f0, roughness: 0.5 })
      );
      dWin.position.set(p.x + lx, 6.8, p.z + 14.92);
      building.add(dWin);
    }

    // Ivy on east facade + north
    this.createIvy(building, p.x + 8.05, 3, p.z + 3, 0.2, 5, 4, 'x');
    this.createIvy(building, p.x + 4, 3.5, p.z - 0.05, 6, 5, 0.2, 'z');

    this.scene.add(building);
  }

  // ═══════════════════════════════
  //  MAISON 2 (plan: x9,y-15, 8×6)
  //  Bâtiment secondaire, toit pentu
  // ═══════════════════════════════

  createMaison2() {
    const building = new THREE.Group();
    const p = P(9, -15);

    const wallMat = new THREE.MeshStandardMaterial({ color: 0xb8a898, roughness: 0.95 });
    const roofMat = new THREE.MeshStandardMaterial({ color: 0x5a4a40, roughness: 0.8 });

    // Walls (8×6×6)
    const wallGeo = new THREE.BoxGeometry(8, 6, 6);
    const walls = new THREE.Mesh(wallGeo, wallMat);
    walls.position.set(p.x + 4, 3, p.z + 3);
    walls.castShadow = true;
    walls.receiveShadow = true;
    building.add(walls);

    // Steep roof (ridge along Z)
    const roofShape = new THREE.Shape();
    roofShape.moveTo(-4.3, 0);
    roofShape.lineTo(0, 3.5);
    roofShape.lineTo(4.3, 0);
    roofShape.lineTo(-4.3, 0);

    const roofGeo = new THREE.ExtrudeGeometry(roofShape, { depth: 6.6, bevelEnabled: false });
    const roof = new THREE.Mesh(roofGeo, roofMat);
    roof.position.set(p.x + 4, 6, p.z - 0.3);
    roof.castShadow = true;
    building.add(roof);

    // Lichen patches on roof
    for (let i = 0; i < 10; i++) {
      const lichenGeo = new THREE.CircleGeometry(0.2 + Math.random() * 0.3, 8);
      const lichenMat = new THREE.MeshStandardMaterial({
        color: 0xc87530 + Math.floor(Math.random() * 0x202020),
        roughness: 1
      });
      const lichen = new THREE.Mesh(lichenGeo, lichenMat);
      lichen.position.set(
        p.x + 1 + Math.random() * 6,
        6.5 + Math.random() * 2,
        p.z + 5.5 + Math.random() * 0.5
      );
      lichen.rotation.x = -Math.PI / 4;
      lichen.rotation.z = Math.random() * Math.PI;
      building.add(lichen);
    }

    // French door (south facade, toward cour)
    this.createFrenchDoor(building, p.x + 4, 1.8, p.z + 6.01, 1.4, 2.8);

    // Heavy ivy on east and north facade
    this.createIvy(building, p.x + 8.05, 3.5, p.z + 3, 0.2, 5, 5, 'x');
    this.createIvy(building, p.x + 4, 4, p.z - 0.05, 6, 5, 0.2, 'z');

    this.scene.add(building);
  }

  // ═══════════════════════════════
  //  APPENTIS VÉLOS
  //  plan: x8,y-20, 4×5
  // ═══════════════════════════════

  createAppentis() {
    const group = new THREE.Group();
    const p = P(8, -20);
    const wallMat = new THREE.MeshStandardMaterial({ color: 0x9a8a7a, roughness: 0.95 });
    const corrMat = new THREE.MeshStandardMaterial({ color: 0x6b6b6b, roughness: 0.6, metalness: 0.3 });
    const woodMat = new THREE.MeshStandardMaterial({ color: 0x6b4423, roughness: 0.9 });

    // Back wall (north)
    const backW = new THREE.Mesh(new THREE.BoxGeometry(4, 3, 0.3), wallMat);
    backW.position.set(p.x + 2, 1.5, p.z + 0.15);
    backW.castShadow = true;
    group.add(backW);

    // Left wall
    const sideW = new THREE.Mesh(new THREE.BoxGeometry(0.3, 3, 5), wallMat);
    sideW.position.set(p.x + 0.15, 1.5, p.z + 2.5);
    sideW.castShadow = true;
    group.add(sideW);

    // Corrugated roof (mono-pente)
    const roofGeo = new THREE.BoxGeometry(4.4, 0.08, 5.5);
    const roofMesh = new THREE.Mesh(roofGeo, corrMat);
    roofMesh.position.set(p.x + 2, 2.9, p.z + 2.5);
    roofMesh.rotation.x = 0.12;
    roofMesh.castShadow = true;
    group.add(roofMesh);

    // Beams
    for (let i = 0; i < 3; i++) {
      const beam = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.1, 5.2), woodMat);
      beam.position.set(p.x + 0.5 + i * 1.5, 2.75, p.z + 2.5);
      group.add(beam);
    }

    // Dirt floor
    const floorMat = new THREE.MeshStandardMaterial({ color: 0x5C4033, roughness: 1 });
    const floor = new THREE.Mesh(new THREE.PlaneGeometry(4, 5), floorMat);
    floor.rotation.x = -Math.PI / 2;
    floor.position.set(p.x + 2, 0.01, p.z + 2.5);
    floor.receiveShadow = true;
    group.add(floor);

    // Props inside : brouette, pots, gilet jaune, outils
    // Pots
    for (let i = 0; i < 4; i++) {
      const potGeo = new THREE.CylinderGeometry(0.1, 0.07, 0.18, 8);
      const potMat = new THREE.MeshStandardMaterial({ color: 0xc4644a, roughness: 0.85 });
      const pot = new THREE.Mesh(potGeo, potMat);
      pot.position.set(p.x + 3 + i * 0.25, 0.09, p.z + 0.5);
      group.add(pot);
    }

    // Garden tools leaning against wall
    const toolMat = new THREE.MeshStandardMaterial({ color: 0x5a4a3a, roughness: 0.9 });
    for (let i = 0; i < 3; i++) {
      const handle = new THREE.Mesh(new THREE.CylinderGeometry(0.015, 0.015, 1.5, 4), toolMat);
      handle.position.set(p.x + 0.4, 0.75, p.z + 1 + i * 0.3);
      handle.rotation.z = 0.15;
      group.add(handle);
    }

    this.scene.add(group);
  }

  // ═══════════════════════════════
  //  COUR DALLÉE (plan: x8,y-9, 4×9)
  // ═══════════════════════════════

  createCourDallee() {
    const p = P(8, -9);
    const group = new THREE.Group();

    // Base paving
    const stoneMat = new THREE.MeshStandardMaterial({ color: 0xa0968c, roughness: 0.85 });

    // Irregular stepping stones
    for (let ix = 0; ix < 5; ix++) {
      for (let iz = 0; iz < 12; iz++) {
        const w = 0.5 + Math.random() * 0.4;
        const h = 0.4 + Math.random() * 0.35;
        const stoneGeo = new THREE.BoxGeometry(w, 0.07, h);
        const stone = new THREE.Mesh(stoneGeo, stoneMat.clone());
        stone.material.color.setHex(0x908880 + Math.floor(Math.random() * 0x202020));
        stone.position.set(
          p.x + ix * 0.85 + (Math.random() - 0.5) * 0.15,
          0.035,
          p.z + iz * 0.78 + (Math.random() - 0.5) * 0.15
        );
        stone.rotation.y = (Math.random() - 0.5) * 0.4;
        stone.receiveShadow = true;
        stone.castShadow = true;
        group.add(stone);
      }
    }

    // Moss between stones
    for (let i = 0; i < 30; i++) {
      const mossGeo = new THREE.CircleGeometry(0.05 + Math.random() * 0.08, 6);
      const mossMat = new THREE.MeshStandardMaterial({ color: 0x4A5D23, roughness: 1 });
      const moss = new THREE.Mesh(mossGeo, mossMat);
      moss.rotation.x = -Math.PI / 2;
      moss.position.set(
        p.x + Math.random() * 4,
        0.015,
        p.z + Math.random() * 9
      );
      group.add(moss);
    }

    this.scene.add(group);
  }

  // ═══════════════════════════════
  //  PORTE BLANCHE FERMÉE (plan: x8, y-9)
  // ═══════════════════════════════

  createPorteBlanche() {
    const p = P(8, -9);
    const group = new THREE.Group();
    const woodMat = new THREE.MeshStandardMaterial({ color: 0xF0EBE0, roughness: 0.7 });

    // Door frame
    const frame = new THREE.Mesh(new THREE.BoxGeometry(1.2, 2.3, 0.15), woodMat);
    frame.position.set(p.x + 0.5, 1.15, p.z);
    frame.castShadow = true;
    group.add(frame);

    // Planks
    for (let i = 0; i < 6; i++) {
      const plank = new THREE.Mesh(
        new THREE.BoxGeometry(0.12, 2.0, 0.06),
        new THREE.MeshStandardMaterial({ color: 0xE8E0D0, roughness: 0.75 })
      );
      plank.position.set(p.x + 0.15 + i * 0.17, 1.1, p.z + 0.06);
      group.add(plank);
    }

    this.scene.add(group);
  }

  // ═══════════════════════════════
  //  PORTILLON BLANC (rotated 90°, from house wall to hedge)
  // ═══════════════════════════════

  createPortillonBlanc() {
    // Portillon now runs along Z axis (orthogonal to house), from z=7 (house) to z=11 (near hedge)
    const startZ = 7;      // house north wall
    const endZ = 11;       // before the hedge
    const x = -12;         // west edge of Maison 1
    const length = endZ - startZ;  // ~4 units
    const numSlats = Math.floor(length / 0.12);

    const group = new THREE.Group();
    const woodMat = new THREE.MeshStandardMaterial({ color: 0xF0EBE0, roughness: 0.7 });

    // Posts at start and end
    for (const gz of [0, length]) {
      const post = new THREE.Mesh(new THREE.BoxGeometry(0.1, 1.3, 0.1), woodMat);
      post.position.set(x, 0.65, startZ + gz);
      post.castShadow = true;
      group.add(post);
    }

    // Slats with pointed tops (along Z)
    for (let i = 0; i < numSlats; i++) {
      const slat = new THREE.Mesh(new THREE.BoxGeometry(0.04, 1.0, 0.06), woodMat);
      slat.position.set(x, 0.55, startZ + 0.08 + i * 0.12);
      group.add(slat);

      const point = new THREE.Mesh(new THREE.ConeGeometry(0.04, 0.1, 4), woodMat);
      point.position.set(x, 1.08, startZ + 0.08 + i * 0.12);
      group.add(point);
    }

    // Cross bars (along Z)
    for (const barY of [0.3, 0.8]) {
      const bar = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.05, length - 0.15), woodMat);
      bar.position.set(x - 0.03, barY, startZ + length / 2);
      group.add(bar);
    }

    this.scene.add(group);
  }

  // ═══════════════════════════════
  //  MURETS
  // ═══════════════════════════════

  createMurets() {
    const muretMat = new THREE.MeshStandardMaterial({ color: 0x8B8378, roughness: 0.9 });

    // Grand mur horizontal (plan x:8, y:-20, w:4, h:0.5)
    this.addMuret(P(8, -20), 4, 0.5, 2.5, muretMat);

    // Grand mur vertical (plan x:7, y:-18, w:1, h:6) → actually a wall segment
    {
      const p = P(7, -18);
      const wall = new THREE.Mesh(new THREE.BoxGeometry(0.3, 2.5, 6), muretMat);
      wall.position.set(p.x + 0.15, 1.25, p.z + 3);
      wall.castShadow = true;
      this.scene.add(wall);
    }

    // ═══════════════════════════════
    // FLOWER TRIANGLE in courtyard
    // Triangle vertices: SW(0.3, -0.3), SE(4.5, -0.3), N(0.3, 2.8)
    // Contains tree at (2, 0), jumpable murets (height 0.7)
    // Gap at north tip for passage
    // ═══════════════════════════════

    // Wall C (bottom, horizontal) - parallel to Maison 2, with gap to pass
    // From (0.3, -0.3) to (4.5, -0.3), length 4.2
    {
      const wall = new THREE.Mesh(new THREE.BoxGeometry(4.2, 0.7, 0.25), muretMat);
      wall.position.set(0.3 + 4.2/2, 0.35, -0.3);
      wall.castShadow = true;
      this.scene.add(wall);
    }

    // Wall B (left, vertical) - parallel to Maison 1 east facade
    // From (0.3, -0.3) to (0.3, 2.3), length 2.6 (leaving 0.5 gap at top)
    {
      const wall = new THREE.Mesh(new THREE.BoxGeometry(0.25, 0.7, 2.6), muretMat);
      wall.position.set(0.3, 0.35, -0.3 + 2.6/2);
      wall.castShadow = true;
      this.scene.add(wall);
    }

    // Wall A (diagonal, hypotenuse) - connecting SE to near N
    // From (4.5, -0.3) toward (0.7, 2.0), leaving gap at north
    {
      const x1 = 4.5, z1 = -0.3;
      const x2 = 0.7, z2 = 2.0;
      const dx = x2 - x1;
      const dz = z2 - z1;
      const length = Math.sqrt(dx*dx + dz*dz);
      const angle = Math.atan2(dx, dz);  // rotation around Y

      const wall = new THREE.Mesh(new THREE.BoxGeometry(0.25, 0.7, length), muretMat);
      wall.position.set((x1+x2)/2, 0.35, (z1+z2)/2);
      wall.rotation.y = -angle;
      wall.castShadow = true;
      this.scene.add(wall);
    }

    // Flower bed inside triangle
    this.createTriangleFlowerBed();

    // Muret (plan x:21, y:-10, w:3, h:0.5)
    this.addMuret(P(21, -10), 3, 0.5, 0.7, muretMat);
  }

  createTriangleFlowerBed() {
    // Add colorful flowers inside the triangle (around tree at (2, 0))
    const flowerColors = [0xff6b6b, 0xffd93d, 0x6bcb77, 0x4d96ff, 0xff6eb4, 0xffa500];

    // Scatter flowers within triangle bounds
    for (let i = 0; i < 40; i++) {
      // Random point, reject if outside triangle
      const x = 0.5 + Math.random() * 3.5;
      const z = -0.2 + Math.random() * 2.2;

      // Check if inside triangle (simple bounds check)
      // Triangle: (0.3,-0.3), (4.5,-0.3), (0.3,2.8)
      // Left edge: x >= 0.3
      // Bottom edge: z >= -0.3
      // Diagonal edge: roughly z < 2.8 - (x-0.3)*0.75
      const maxZ = 2.3 - (x - 0.3) * 0.6;
      if (x < 0.5 || x > 4.2 || z < -0.1 || z > maxZ) continue;

      // Skip if too close to tree at (2, 0)
      const distToTree = Math.sqrt((x-2)**2 + z**2);
      if (distToTree < 0.8) continue;

      const color = flowerColors[Math.floor(Math.random() * flowerColors.length)];

      // Flower stem
      const stemGeo = new THREE.CylinderGeometry(0.015, 0.015, 0.15 + Math.random() * 0.1, 4);
      const stemMat = new THREE.MeshStandardMaterial({ color: 0x228B22, roughness: 0.8 });
      const stem = new THREE.Mesh(stemGeo, stemMat);
      stem.position.set(x, 0.1, z);
      this.scene.add(stem);

      // Flower head
      const petalGeo = new THREE.SphereGeometry(0.05 + Math.random() * 0.03, 6, 6);
      const petalMat = new THREE.MeshStandardMaterial({ color, roughness: 0.6 });
      const petal = new THREE.Mesh(petalGeo, petalMat);
      petal.position.set(x, 0.2 + Math.random() * 0.05, z);
      petal.scale.y = 0.6;
      this.scene.add(petal);
    }

    // Add some taller flowers near edges
    for (let i = 0; i < 15; i++) {
      const angle = Math.random() * Math.PI * 0.6;
      const dist = 0.8 + Math.random() * 1.5;
      const x = 2 + Math.cos(angle) * dist;
      const z = 0 + Math.sin(angle) * dist;

      if (x < 0.6 || x > 4 || z < 0 || z > 1.8) continue;

      const color = flowerColors[Math.floor(Math.random() * flowerColors.length)];

      // Taller flower
      const stemGeo = new THREE.CylinderGeometry(0.02, 0.02, 0.25, 4);
      const stemMat = new THREE.MeshStandardMaterial({ color: 0x228B22, roughness: 0.8 });
      const stem = new THREE.Mesh(stemGeo, stemMat);
      stem.position.set(x, 0.125, z);
      this.scene.add(stem);

      // Multiple petals
      for (let p = 0; p < 5; p++) {
        const pAngle = (p / 5) * Math.PI * 2;
        const petalGeo = new THREE.SphereGeometry(0.035, 5, 5);
        const petalMat = new THREE.MeshStandardMaterial({ color, roughness: 0.5 });
        const petal = new THREE.Mesh(petalGeo, petalMat);
        petal.position.set(
          x + Math.cos(pAngle) * 0.04,
          0.28,
          z + Math.sin(pAngle) * 0.04
        );
        petal.scale.y = 0.7;
        this.scene.add(petal);
      }

      // Center
      const centerGeo = new THREE.SphereGeometry(0.025, 5, 5);
      const centerMat = new THREE.MeshStandardMaterial({ color: 0xFFD700, roughness: 0.5 });
      const center = new THREE.Mesh(centerGeo, centerMat);
      center.position.set(x, 0.29, z);
      this.scene.add(center);
    }
  }

  addMuret(p, w, d, h, mat) {
    const geo = new THREE.BoxGeometry(w, h, Math.max(d, 0.3));
    const mesh = new THREE.Mesh(geo, mat);
    mesh.position.set(p.x + w / 2, h / 2, p.z);
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    this.scene.add(mesh);
  }

  // ═══════════════════════════════
  //  HAIES PÉRIMÈTRE (3m, infranchissable)
  // ═══════════════════════════════

  createHaiesPerimetre() {
    // ── Nord (plan: y=5, x=1→25, w=26) - starts east of portillon ──
    this.createHedgeRow(P(1, 5), 26, 3, 'x');

    // ── Est (plan: x=24, y=-7→18, h=25) ──
    this.createHedgeRow(P(24, -8), 22, 3, 'z');

    // ── Ouest (buildings fill most of this side, fill gaps) ──
    this.createHedgeRow(P(-1, -20), 25, 3, 'z');

    // ── Sud (plan y ≈ -21, from west to portail, then portail to east) ──
    this.createHedgeRow(P(0, -21), 16, 3, 'x');
    // Gap for portail (~3m)
    this.createHedgeRow(P(19, -21), 7, 3, 'x');

    // ── Haie derrière appentis (plan x:12, y:-20, w:13) ──
    this.createHedgeRow(P(12, -20), 13, 2.5, 'x');

    // Small hedge near entrance (plan x:0, y:4)
    this.createHedgeBall(P(0, 4), 1.5, 2);

    // ── Thick hedge at back of garden (fond du jardin) ──
    // Dense hedge row in the far eastern part of the garden
    this.createThickHedge(8, 3, 6);  // x=8, z from -3 to 3, thick and tall
  }

  createThickHedge(x, zStart, length) {
    // Create a thick, dense hedge with multiple layers
    const height = 2.5;
    const depth = 1.2;  // thick hedge

    for (let row = 0; row < 3; row++) {
      const rowX = x + row * 0.4;
      const count = Math.ceil(length / 0.6);

      for (let i = 0; i < count; i++) {
        const t = i / count;
        const s = 0.4 + Math.random() * 0.25;
        const geo = new THREE.SphereGeometry(s, 6, 6);
        const mat = new THREE.MeshStandardMaterial({
          color: new THREE.Color(0x1a4d1a).lerp(new THREE.Color(0x2d6b2d), Math.random() * 0.4),
          roughness: 0.95,
        });
        const sphere = new THREE.Mesh(geo, mat);
        sphere.scale.y = height / (s * 2);

        sphere.position.set(
          rowX + (Math.random() - 0.5) * 0.3,
          height / 2 + Math.random() * 0.15,
          zStart + t * length + Math.random() * 0.2
        );
        sphere.castShadow = true;
        this.scene.add(sphere);
      }
    }

    // Add some taller accent spheres
    for (let i = 0; i < 5; i++) {
      const s = 0.5 + Math.random() * 0.3;
      const geo = new THREE.SphereGeometry(s, 6, 6);
      const mat = new THREE.MeshStandardMaterial({
        color: new THREE.Color(0x1f5c1f).lerp(new THREE.Color(0x3d7a3d), Math.random() * 0.3),
        roughness: 0.9,
      });
      const sphere = new THREE.Mesh(geo, mat);
      sphere.scale.y = (height + 0.5) / (s * 2);
      sphere.position.set(
        x + 0.4 + Math.random() * 0.8,
        (height + 0.3) / 2,
        zStart + Math.random() * length
      );
      sphere.castShadow = true;
      this.scene.add(sphere);
    }
  }

  createHedgeRow(p, length, height, axis) {
    const count = Math.ceil(length / 1.0);
    for (let i = 0; i < count; i++) {
      const t = i / count;
      const s = 0.5 + Math.random() * 0.3;
      const geo = new THREE.SphereGeometry(s, 6, 6);
      const mat = new THREE.MeshStandardMaterial({
        color: new THREE.Color(0x2D5016).lerp(new THREE.Color(0x3D6B23), Math.random() * 0.4),
        roughness: 0.95,
      });
      const sphere = new THREE.Mesh(geo, mat);
      sphere.scale.y = height / (s * 2);

      if (axis === 'x') {
        sphere.position.set(
          p.x + t * length + Math.random() * 0.2,
          height / 2 + Math.random() * 0.2,
          p.z + Math.random() * 0.3 - 0.15
        );
      } else {
        sphere.position.set(
          p.x + Math.random() * 0.3 - 0.15,
          height / 2 + Math.random() * 0.2,
          p.z + t * length + Math.random() * 0.2
        );
      }
      sphere.castShadow = true;
      this.scene.add(sphere);
    }
  }

  createHedgeBall(p, radius, height) {
    const count = 5;
    for (let i = 0; i < count; i++) {
      const s = radius * (0.3 + Math.random() * 0.3);
      const geo = new THREE.SphereGeometry(s, 6, 6);
      const mat = new THREE.MeshStandardMaterial({
        color: new THREE.Color(0x2D5016).lerp(new THREE.Color(0x4A7C23), Math.random() * 0.3),
        roughness: 0.95,
      });
      const sphere = new THREE.Mesh(geo, mat);
      sphere.position.set(
        p.x + (Math.random() - 0.5) * radius,
        height / 2 + Math.random() * 0.2,
        p.z + (Math.random() - 0.5) * radius
      );
      sphere.scale.y = height / (s * 2);
      sphere.castShadow = true;
      this.scene.add(sphere);
    }
  }

  // ═══════════════════════════════
  //  TREES
  // ═══════════════════════════════

  createTrees() {
    // Grand Thuya (plan x:19, y:-6, r:2) → conifer
    this.createConifer(P(19, -6), 2, 9, 'Grand Thuya');

    // Arbre (plan x:14, y:-7) → deciduous
    this.createDeciduousTree(P(14, -7), 1.5, 5);

    // Arbre (plan x:22, y:-11)
    this.createDeciduousTree(P(22, -11), 1.2, 4.5);

    // Arbre (plan x:21, y:-14)
    this.createDeciduousTree(P(21, -14), 1.2, 4);

    // Arbre (plan x:17.2, y:-10) - pommier
    this.createDeciduousTree(P(17.2, -10), 1.3, 3.5);

    // Arbre (plan x:12, y:4)
    this.createDeciduousTree(P(12, 4), 1.5, 5);
  }

  createConifer(p, radius, height) {
    const tree = new THREE.Group();

    const trunkH = height * 0.35;
    const trunkGeo = new THREE.CylinderGeometry(0.15, 0.25, trunkH, 8);
    const trunkMat = new THREE.MeshStandardMaterial({ color: 0x4A3728, roughness: 0.95 });
    const trunk = new THREE.Mesh(trunkGeo, trunkMat);
    trunk.position.y = trunkH / 2;
    trunk.castShadow = true;
    tree.add(trunk);

    for (let i = 0; i < 5; i++) {
      const coneH = height * 0.2;
      const coneR = radius * (1 - i * 0.12);
      const cone = new THREE.Mesh(
        new THREE.ConeGeometry(coneR, coneH, 8),
        new THREE.MeshStandardMaterial({
          color: new THREE.Color(0x1C3D1C).lerp(new THREE.Color(0x2A5A1A), i * 0.12),
          roughness: 0.95
        })
      );
      cone.position.y = trunkH * 0.5 + i * coneH * 0.65 + coneH / 2;
      cone.castShadow = true;
      tree.add(cone);
    }

    tree.position.set(p.x, 0, p.z);
    this.scene.add(tree);
  }

  createDeciduousTree(p, radius, height) {
    const tree = new THREE.Group();
    const trunkH = height * 0.5;
    const trunkGeo = new THREE.CylinderGeometry(0.1, 0.18, trunkH, 6);
    const trunkMat = new THREE.MeshStandardMaterial({ color: 0x5D4E37, roughness: 0.95 });
    const trunk = new THREE.Mesh(trunkGeo, trunkMat);
    trunk.position.y = trunkH / 2;
    trunk.castShadow = true;
    tree.add(trunk);

    // Bare branches (winter)
    const branchMat = new THREE.MeshStandardMaterial({ color: 0x5D4E37, roughness: 0.9 });
    for (let i = 0; i < 7; i++) {
      const bLen = radius * (0.5 + Math.random() * 0.8);
      const branch = new THREE.Mesh(
        new THREE.CylinderGeometry(0.015, 0.05, bLen, 4),
        branchMat
      );
      const angle = (i / 7) * Math.PI * 2 + Math.random() * 0.5;
      branch.position.set(
        Math.cos(angle) * bLen * 0.3,
        trunkH * 0.65 + Math.random() * height * 0.25,
        Math.sin(angle) * bLen * 0.3
      );
      branch.rotation.x = Math.random() * 0.5 - 0.25;
      branch.rotation.z = Math.cos(angle) * 0.7;
      tree.add(branch);

      for (let j = 0; j < 3; j++) {
        const sb = new THREE.Mesh(
          new THREE.CylinderGeometry(0.008, 0.025, bLen * 0.35, 3),
          branchMat
        );
        sb.position.copy(branch.position);
        sb.position.y += 0.2 + Math.random() * 0.4;
        sb.position.x += (Math.random() - 0.5) * 0.4;
        sb.position.z += (Math.random() - 0.5) * 0.4;
        sb.rotation.set(Math.random() - 0.5, Math.random(), Math.random() - 0.5);
        tree.add(sb);
      }
    }

    tree.position.set(p.x, 0, p.z);
    this.scene.add(tree);
  }

  // ═══════════════════════════════
  //  BUSHES
  // ═══════════════════════════════

  createBushes() {
    const bushData = [
      { px: 13, py: -4, r: 0.6, label: 'Fleurs' },
      { px: 20, py: -16, r: 1.5, label: 'Okuba' },
      { px: 16, py: -16, r: 1.5, label: 'Okuba' },
      { px: 23, py: -12, r: 1.5, label: 'Bosquet' },
      { px: 20, py: -8, r: 1.5, label: 'Bosquet' },
      { px: 2, py: 4, r: 1.5, label: 'Arbuste' },
    ];

    for (const b of bushData) {
      this.createBush(P(b.px, b.py), b.r);
    }
  }

  createBush(p, radius) {
    const count = 3 + Math.floor(radius * 2);
    for (let i = 0; i < count; i++) {
      const sr = radius * (0.3 + Math.random() * 0.4);
      const geo = new THREE.SphereGeometry(sr, 7, 7);
      const mat = new THREE.MeshStandardMaterial({
        color: new THREE.Color(0x3D6B23).lerp(new THREE.Color(0x5A8A3A), Math.random() * 0.3),
        roughness: 0.95,
      });
      const sphere = new THREE.Mesh(geo, mat);
      sphere.position.set(
        p.x + (Math.random() - 0.5) * radius,
        sr * 0.8 + Math.random() * 0.2,
        p.z + (Math.random() - 0.5) * radius
      );
      sphere.castShadow = true;
      this.scene.add(sphere);
    }
  }

  // ═══════════════════════════════
  //  CHEMINS
  // ═══════════════════════════════

  createChemins() {
    const pathMat = new THREE.MeshStandardMaterial({ color: 0x5C4033, roughness: 1 });

    // Chemin (plan x:12, y:-9, w:5, h:1)
    {
      const p = P(12, -9);
      const path = new THREE.Mesh(new THREE.PlaneGeometry(5, 1), pathMat);
      path.rotation.x = -Math.PI / 2;
      path.position.set(p.x + 2.5, 0.015, p.z + 0.5);
      path.receiveShadow = true;
      this.scene.add(path);
    }

    // Chemin vertical (plan x:17.5, y:-17, w:0.5, h:9)
    {
      const p = P(17.5, -17);
      const path = new THREE.Mesh(new THREE.PlaneGeometry(0.6, 9), pathMat);
      path.rotation.x = -Math.PI / 2;
      path.position.set(p.x + 0.25, 0.015, p.z + 4.5);
      path.receiveShadow = true;
      this.scene.add(path);
    }

    // Corridor appentis (plan x:8, y:-15, 1×6)
    {
      const p = P(8, -15);
      const corr = new THREE.Mesh(new THREE.PlaneGeometry(1, 6), pathMat);
      corr.rotation.x = -Math.PI / 2;
      corr.position.set(p.x + 0.5, 0.012, p.z + 3);
      corr.receiveShadow = true;
      this.scene.add(corr);
    }

    // Stone path in courtyard already handled by createCourDallee
  }

  // ═══════════════════════════════
  //  TAS DE BOIS (plan x:21, y:2, 3×3)
  // ═══════════════════════════════

  createTasDeBois() {
    const p = P(22, 2.5);
    const group = new THREE.Group();
    const logMat = new THREE.MeshStandardMaterial({ color: 0x6B5A3A, roughness: 0.9 });
    const barkMat = new THREE.MeshStandardMaterial({ color: 0x4A5D23, roughness: 0.95 });

    for (let layer = 0; layer < 6; layer++) {
      const logsInLayer = 8 - layer;
      for (let i = 0; i < logsInLayer; i++) {
        const log = new THREE.Mesh(
          new THREE.CylinderGeometry(0.07, 0.08, 2 + Math.random() * 0.5, 6),
          Math.random() > 0.3 ? logMat : barkMat
        );
        log.rotation.z = Math.PI / 2;
        log.position.set(0, layer * 0.16 + 0.08, i * 0.17 - logsInLayer * 0.085);
        log.castShadow = true;
        group.add(log);
      }
    }
    group.position.set(p.x, 0, p.z);
    this.scene.add(group);
  }

  // ═══════════════════════════════
  //  COMPOST (plan x:21, y:-16)
  // ═══════════════════════════════

  createCompost() {
    const p = P(21, -16);
    const group = new THREE.Group();
    const plankMat = new THREE.MeshStandardMaterial({ color: 0x7A6B50, roughness: 0.9 });

    for (let side = 0; side < 4; side++) {
      for (let i = 0; i < 4; i++) {
        const isXSide = side < 2;
        const plank = new THREE.Mesh(
          new THREE.BoxGeometry(isXSide ? 1 : 0.04, 0.12, isXSide ? 0.04 : 1),
          plankMat
        );
        const px = side === 2 ? -0.48 : side === 3 ? 0.48 : 0;
        const pz = side === 0 ? -0.48 : side === 1 ? 0.48 : 0;
        plank.position.set(px, i * 0.2 + 0.1, pz);
        group.add(plank);
      }
    }

    const fill = new THREE.Mesh(
      new THREE.BoxGeometry(0.9, 0.5, 0.9),
      new THREE.MeshStandardMaterial({ color: 0x3A2A15, roughness: 1 })
    );
    fill.position.y = 0.25;
    group.add(fill);

    group.position.set(p.x, 0, p.z);
    this.scene.add(group);
  }

  // ═══════════════════════════════
  //  TABLE DE JARDIN
  // ═══════════════════════════════

  createTableJardin() {
    const p = P(10, -5);
    const group = new THREE.Group();
    const tableMat = new THREE.MeshStandardMaterial({ color: 0x2A7A3A, roughness: 0.6 });

    const top = new THREE.Mesh(new THREE.BoxGeometry(1.2, 0.04, 0.7), tableMat);
    top.position.y = 0.72;
    top.castShadow = true;
    group.add(top);

    for (const [lx, lz] of [[-0.5, -0.3], [0.5, -0.3], [-0.5, 0.3], [0.5, 0.3]]) {
      const leg = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.72, 0.04), tableMat);
      leg.position.set(lx, 0.36, lz);
      group.add(leg);
    }

    group.position.set(p.x, 0, p.z);
    this.scene.add(group);
  }

  // ═══════════════════════════════
  //  VEGETATION (hostas, ferns, grass tufts)
  // ═══════════════════════════════

  createVegetation() {
    // Plant beds near courtyard
    this.createPlantBed(-3, 0.1, 0, 2, 4);
    this.createPlantBed(-3, 0.1, -5, 2, 3);
    this.createPlantBed(2, 0.1, -3, 2, 3);

    // Scattered grass tufts
    for (let i = 0; i < 60; i++) {
      this.createGrassTuft(
        (Math.random() - 0.5) * 25,
        0,
        (Math.random() - 0.5) * 25
      );
    }

    // Potager (plan x:22, y:-18, w:2, h:3)
    {
      const p = P(22, -18);
      const potMat = new THREE.MeshStandardMaterial({ color: 0x3A2A15, roughness: 1 });
      const pot = new THREE.Mesh(new THREE.PlaneGeometry(2, 3), potMat);
      pot.rotation.x = -Math.PI / 2;
      pot.position.set(p.x + 1, 0.02, p.z + 1.5);
      pot.receiveShadow = true;
      this.scene.add(pot);

      // Stakes
      const stakeMat = new THREE.MeshStandardMaterial({ color: 0x6b4423, roughness: 0.9 });
      for (let j = 0; j < 5; j++) {
        const stake = new THREE.Mesh(new THREE.CylinderGeometry(0.012, 0.012, 0.7, 4), stakeMat);
        stake.position.set(p.x + 0.4 + j * 0.4, 0.35, p.z + 1 + (j % 2) * 0.8);
        this.scene.add(stake);
      }
    }
  }

  createPlantBed(x, y, z, width, depth) {
    const plantGroup = new THREE.Group();

    for (let i = 0; i < 6; i++) {
      const hosta = this.createHosta(
        x + (Math.random() - 0.5) * width,
        y,
        z + (Math.random() - 0.5) * depth,
        [0x4a7a3a, 0x5a8a4a, 0x3a6a2a][Math.floor(Math.random() * 3)]
      );
      plantGroup.add(hosta);
    }

    for (let i = 0; i < 4; i++) {
      const fern = this.createFern(
        x + (Math.random() - 0.5) * width,
        y,
        z + (Math.random() - 0.5) * depth
      );
      plantGroup.add(fern);
    }

    this.scene.add(plantGroup);
  }

  createHosta(x, y, z, color) {
    const group = new THREE.Group();
    const numLeaves = 5 + Math.floor(Math.random() * 4);
    for (let i = 0; i < numLeaves; i++) {
      const angle = (i / numLeaves) * Math.PI * 2;
      const leafLength = 0.2 + Math.random() * 0.15;

      const shape = new THREE.Shape();
      shape.moveTo(0, 0);
      shape.quadraticCurveTo(0.07, leafLength * 0.5, 0, leafLength);
      shape.quadraticCurveTo(-0.07, leafLength * 0.5, 0, 0);

      const leafGeo = new THREE.ShapeGeometry(shape);
      const leafMat = new THREE.MeshStandardMaterial({ color, roughness: 0.7, side: THREE.DoubleSide });
      const leaf = new THREE.Mesh(leafGeo, leafMat);
      leaf.position.set(0, 0.02, 0);
      leaf.rotation.x = -Math.PI / 3 - Math.random() * 0.3;
      leaf.rotation.y = angle;
      leaf.castShadow = true;
      group.add(leaf);
    }
    group.position.set(x, y, z);
    return group;
  }

  createFern(x, y, z) {
    const group = new THREE.Group();
    const numFronds = 4 + Math.floor(Math.random() * 3);
    for (let i = 0; i < numFronds; i++) {
      const angle = (i / numFronds) * Math.PI * 2;
      const frondLength = 0.25 + Math.random() * 0.15;
      const frond = new THREE.Mesh(
        new THREE.ConeGeometry(0.03, frondLength, 4),
        new THREE.MeshStandardMaterial({ color: 0x3d6b2e, roughness: 0.8 })
      );
      frond.position.y = frondLength * 0.3;
      frond.rotation.x = Math.PI / 4;
      frond.rotation.y = angle;
      frond.castShadow = true;
      group.add(frond);
    }
    group.position.set(x, y, z);
    return group;
  }

  createGrassTuft(x, y, z) {
    const group = new THREE.Group();
    const numBlades = 4 + Math.floor(Math.random() * 4);
    for (let i = 0; i < numBlades; i++) {
      const height = 0.08 + Math.random() * 0.12;
      const blade = new THREE.Mesh(
        new THREE.PlaneGeometry(0.015, height),
        new THREE.MeshStandardMaterial({
          color: 0x4a7040 + Math.floor(Math.random() * 0x101010),
          side: THREE.DoubleSide
        })
      );
      blade.position.set(
        (Math.random() - 0.5) * 0.08,
        height / 2,
        (Math.random() - 0.5) * 0.08
      );
      blade.rotation.y = Math.random() * Math.PI;
      blade.rotation.x = (Math.random() - 0.5) * 0.3;
      group.add(blade);
    }
    group.position.set(x, y, z);
    this.scene.add(group);
  }

  // ═══════════════════════════════
  //  DECORATIONS
  // ═══════════════════════════════

  createDecorations() {
    // Flower pots near courtyard
    this.createFlowerPot(P(9.5, -1));
    this.createFlowerPot(P(9, -3));
    this.createFlowerPot(P(11.5, -7));

    // Watering can
    this.createWateringCan(P(10, -7.5));

    // Bench near Maison 1
    this.createBench(P(3, -5));

    // Fallen leaves on ground
    for (let i = 0; i < 80; i++) {
      const leafGeo = new THREE.CircleGeometry(0.02 + Math.random() * 0.03, 5);
      const leafMat = new THREE.MeshStandardMaterial({
        color: 0x8B4513 + Math.floor(Math.random() * 0x303010),
        roughness: 1,
        side: THREE.DoubleSide
      });
      const leaf = new THREE.Mesh(leafGeo, leafMat);
      leaf.rotation.x = -Math.PI / 2 + (Math.random() - 0.5) * 0.3;
      leaf.rotation.z = Math.random() * Math.PI;
      leaf.position.set(
        (Math.random() - 0.5) * 22,
        0.01,
        (Math.random() - 0.5) * 22
      );
      this.scene.add(leaf);
    }
  }

  createFlowerPot(p) {
    const pot = new THREE.Group();
    const potMat = new THREE.MeshStandardMaterial({ color: 0xc4644a, roughness: 0.85 });
    const potMesh = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.08, 0.2, 12), potMat);
    potMesh.position.y = 0.1;
    pot.add(potMesh);

    const rim = new THREE.Mesh(new THREE.TorusGeometry(0.12, 0.015, 8, 16), potMat);
    rim.position.y = 0.2;
    rim.rotation.x = Math.PI / 2;
    pot.add(rim);

    const plant = new THREE.Mesh(
      new THREE.SphereGeometry(0.1, 8, 8),
      new THREE.MeshStandardMaterial({ color: 0x4a7a3a, roughness: 0.8 })
    );
    plant.position.y = 0.28;
    plant.scale.y = 0.7;
    pot.add(plant);

    pot.position.set(p.x, 0, p.z);
    pot.castShadow = true;
    this.scene.add(pot);
  }

  createWateringCan(p) {
    const can = new THREE.Group();
    const metalMat = new THREE.MeshStandardMaterial({ color: 0x607060, roughness: 0.6, metalness: 0.3 });

    const body = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.15, 0.25, 12), metalMat);
    body.position.y = 0.125;
    can.add(body);

    const spout = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.04, 0.2, 8), metalMat);
    spout.position.set(0.15, 0.2, 0);
    spout.rotation.z = -Math.PI / 4;
    can.add(spout);

    const handle = new THREE.Mesh(new THREE.TorusGeometry(0.08, 0.015, 8, 16, Math.PI), metalMat);
    handle.position.set(-0.05, 0.25, 0);
    handle.rotation.y = Math.PI / 2;
    can.add(handle);

    can.position.set(p.x, 0, p.z);
    can.castShadow = true;
    this.scene.add(can);
  }

  createBench(p) {
    const bench = new THREE.Group();
    const woodMat = new THREE.MeshStandardMaterial({ color: 0x5a4a3a, roughness: 0.9 });

    for (let i = 0; i < 3; i++) {
      const plank = new THREE.Mesh(new THREE.BoxGeometry(1.2, 0.04, 0.15), woodMat);
      plank.position.set(0, 0.45, -0.15 + i * 0.15);
      plank.castShadow = true;
      bench.add(plank);
    }

    for (const [lx, ly, lz] of [[-0.5, 0.225, -0.15], [-0.5, 0.225, 0.15], [0.5, 0.225, -0.15], [0.5, 0.225, 0.15]]) {
      const leg = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.45, 0.08), woodMat);
      leg.position.set(lx, ly, lz);
      leg.castShadow = true;
      bench.add(leg);
    }

    bench.position.set(p.x, 0, p.z);
    this.scene.add(bench);
  }

  // ═══════════════════════════════
  //  HELPERS (windows, doors, ivy)
  // ═══════════════════════════════

  createWindow(parent, x, y, z, width, height) {
    const frameMat = new THREE.MeshStandardMaterial({ color: 0xf5f5f0, roughness: 0.5 });
    const glassMat = new THREE.MeshStandardMaterial({ color: 0x334455, roughness: 0.1, metalness: 0.3 });

    const frame = new THREE.Mesh(new THREE.BoxGeometry(width + 0.15, height + 0.15, 0.1), frameMat);
    frame.position.set(x, y, z);
    frame.castShadow = true;
    parent.add(frame);

    const glass = new THREE.Mesh(new THREE.PlaneGeometry(width, height), glassMat);
    glass.position.set(x, y, z + 0.06);
    parent.add(glass);

    const vBar = new THREE.Mesh(new THREE.BoxGeometry(0.04, height, 0.05), frameMat);
    vBar.position.set(x, y, z + 0.08);
    parent.add(vBar);

    const hBar = new THREE.Mesh(new THREE.BoxGeometry(width, 0.04, 0.05), frameMat);
    hBar.position.set(x, y, z + 0.08);
    parent.add(hBar);

    // Shutters
    const shutterMat = new THREE.MeshStandardMaterial({ color: 0xe8e8e0, roughness: 0.7 });
    const shutterGeo = new THREE.BoxGeometry(width * 0.35, height + 0.1, 0.05);
    const left = new THREE.Mesh(shutterGeo, shutterMat);
    left.position.set(x - width * 0.45, y, z);
    left.castShadow = true;
    parent.add(left);
    const right = new THREE.Mesh(shutterGeo, shutterMat);
    right.position.set(x + width * 0.45, y, z);
    right.castShadow = true;
    parent.add(right);
  }

  createWindowSide(parent, x, y, z, width, height) {
    const frameMat = new THREE.MeshStandardMaterial({ color: 0xf5f5f0, roughness: 0.5 });
    const glassMat = new THREE.MeshStandardMaterial({ color: 0x334455, roughness: 0.1, metalness: 0.3 });

    const frame = new THREE.Mesh(new THREE.BoxGeometry(0.1, height + 0.15, width + 0.15), frameMat);
    frame.position.set(x, y, z);
    frame.castShadow = true;
    parent.add(frame);

    const glass = new THREE.Mesh(new THREE.PlaneGeometry(width, height), glassMat);
    glass.position.set(x + 0.06, y, z);
    glass.rotation.y = Math.PI / 2;
    parent.add(glass);

    const vBar = new THREE.Mesh(new THREE.BoxGeometry(0.05, height, 0.04), frameMat);
    vBar.position.set(x + 0.08, y, z);
    parent.add(vBar);
    const hBar = new THREE.Mesh(new THREE.BoxGeometry(0.05, 0.04, width), frameMat);
    hBar.position.set(x + 0.08, y, z);
    parent.add(hBar);
  }

  createDoor(parent, x, y, z, width, height) {
    const frameMat = new THREE.MeshStandardMaterial({ color: 0xd4cfc5, roughness: 0.8 });
    const doorMat = new THREE.MeshStandardMaterial({ color: 0x5c4a3a, roughness: 0.85 });

    const frame = new THREE.Mesh(new THREE.BoxGeometry(width + 0.2, height + 0.1, 0.15), frameMat);
    frame.position.set(x, y, z);
    parent.add(frame);

    const door = new THREE.Mesh(new THREE.BoxGeometry(width, height, 0.08), doorMat);
    door.position.set(x, y, z + 0.05);
    door.castShadow = true;
    parent.add(door);
  }

  createDoorSide(parent, x, y, z, width, height) {
    const frameMat = new THREE.MeshStandardMaterial({ color: 0xd4cfc5, roughness: 0.8 });
    const doorMat = new THREE.MeshStandardMaterial({ color: 0x5c4a3a, roughness: 0.85 });

    const frame = new THREE.Mesh(new THREE.BoxGeometry(0.15, height + 0.1, width + 0.2), frameMat);
    frame.position.set(x, y, z);
    parent.add(frame);

    const door = new THREE.Mesh(new THREE.BoxGeometry(0.08, height, width), doorMat);
    door.position.set(x + 0.05, y, z);
    door.castShadow = true;
    parent.add(door);
  }

  createFrenchDoor(parent, x, y, z, width, height) {
    const frameMat = new THREE.MeshStandardMaterial({ color: 0xf8f8f5, roughness: 0.4 });
    const glassMat = new THREE.MeshStandardMaterial({ color: 0x445566, roughness: 0.1, metalness: 0.2 });

    const frame = new THREE.Mesh(new THREE.BoxGeometry(width + 0.15, height + 0.15, 0.1), frameMat);
    frame.position.set(x, y, z);
    frame.castShadow = true;
    parent.add(frame);

    const paneW = width / 2 - 0.05;
    const paneH = height / 4 - 0.05;
    for (let row = 0; row < 4; row++) {
      for (let col = 0; col < 2; col++) {
        const pane = new THREE.Mesh(new THREE.PlaneGeometry(paneW * 0.85, paneH * 0.85), glassMat);
        pane.position.set(
          x + (col - 0.5) * paneW,
          y - height / 2 + paneH * (row + 0.5),
          z + 0.06
        );
        parent.add(pane);
      }
    }

    const vBar = new THREE.Mesh(new THREE.BoxGeometry(0.06, height, 0.04), frameMat);
    vBar.position.set(x, y, z + 0.07);
    parent.add(vBar);

    for (let i = 1; i < 4; i++) {
      const hBar = new THREE.Mesh(new THREE.BoxGeometry(width, 0.04, 0.04), frameMat);
      hBar.position.set(x, y - height / 2 + paneH * i, z + 0.07);
      parent.add(hBar);
    }
  }

  createIvy(parent, cx, cy, cz, sizeA, sizeB, sizeC, face) {
    const ivyGroup = new THREE.Group();
    const leafColors = [0x2d5a1e, 0x3d6b2e, 0x4a7a3a, 0x385c28];

    let width, height, zOff;
    if (face === 'x') {
      // Ivy on a wall facing X (side wall)
      width = sizeB;
      height = sizeC || sizeB;
      zOff = 0;
    } else {
      width = sizeA;
      height = sizeB;
      zOff = 0;
    }

    const numLeaves = Math.floor(width * height * 12);
    for (let i = 0; i < numLeaves; i++) {
      const leafSize = 0.07 + Math.random() * 0.1;
      const leafGeo = new THREE.PlaneGeometry(leafSize, leafSize * 1.2);
      const leafMat = new THREE.MeshStandardMaterial({
        color: leafColors[Math.floor(Math.random() * leafColors.length)],
        roughness: 0.8,
        side: THREE.DoubleSide
      });
      const leaf = new THREE.Mesh(leafGeo, leafMat);

      if (face === 'x') {
        leaf.position.set(
          cx,
          cy + (Math.random() - 0.5) * height,
          cz + (Math.random() - 0.5) * width
        );
        leaf.rotation.y = Math.PI / 2;
      } else {
        leaf.position.set(
          cx + (Math.random() - 0.5) * width,
          cy + (Math.random() - 0.5) * height,
          cz
        );
      }
      leaf.rotation.z = Math.random() * Math.PI * 2;
      leaf.castShadow = true;
      ivyGroup.add(leaf);
    }

    // Depth clusters
    for (let i = 0; i < numLeaves / 4; i++) {
      const clusterGeo = new THREE.SphereGeometry(0.12 + Math.random() * 0.08, 5, 5);
      const clusterMat = new THREE.MeshStandardMaterial({
        color: leafColors[Math.floor(Math.random() * leafColors.length)],
        roughness: 0.9
      });
      const cluster = new THREE.Mesh(clusterGeo, clusterMat);
      if (face === 'x') {
        cluster.position.set(
          cx + 0.05,
          cy + (Math.random() - 0.5) * height,
          cz + (Math.random() - 0.5) * width
        );
      } else {
        cluster.position.set(
          cx + (Math.random() - 0.5) * width,
          cy + (Math.random() - 0.5) * height,
          cz + 0.05
        );
      }
      cluster.castShadow = true;
      ivyGroup.add(cluster);
    }

    parent.add(ivyGroup);
  }
}
