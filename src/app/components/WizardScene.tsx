"use client";

import { useRef, useEffect } from "react";
import * as THREE from "three";
import gsap from "gsap";

interface WizardSceneProps {
  serviceId: string | null;
  step: number;
}

const ACCENT = 0xd4c5a0;

// --- Procedural geometry builders ---

function createLaptop(): THREE.Group {
  const group = new THREE.Group();
  const mat = (o: number) =>
    new THREE.LineBasicMaterial({ color: ACCENT, transparent: true, opacity: o });

  // Offset to center the whole laptop vertically
  const oy = -0.35;

  // Screen outer frame
  const screenGeo = new THREE.BoxGeometry(2.6, 1.7, 0.05);
  const screen = new THREE.LineSegments(new THREE.EdgesGeometry(screenGeo), mat(0.7));
  screen.position.set(0, 0.95 + oy, -0.3);
  screen.rotation.x = -0.12;
  group.add(screen);

  // Inner screen bezel
  const bezelGeo = new THREE.BoxGeometry(2.3, 1.4, 0.01);
  const bezel = new THREE.LineSegments(new THREE.EdgesGeometry(bezelGeo), mat(0.35));
  bezel.position.set(0, 0.95 + oy, -0.27);
  bezel.rotation.x = -0.12;
  group.add(bezel);

  // Browser bar
  const barPoints = [
    new THREE.Vector3(-1.1, 1.55 + oy, -0.26),
    new THREE.Vector3(1.1, 1.55 + oy, -0.26),
  ];
  group.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints(barPoints), mat(0.3)));

  // Three dots (browser controls)
  [-0.95, -0.85, -0.75].forEach((x) => {
    const dotGeo = new THREE.CircleGeometry(0.025, 8);
    const dotEdges = new THREE.EdgesGeometry(dotGeo);
    const dot = new THREE.LineSegments(dotEdges, mat(0.4));
    dot.position.set(x, 1.6 + oy, -0.255);
    dot.rotation.x = -0.12;
    group.add(dot);
  });

  // Hero block
  const heroGeo = new THREE.PlaneGeometry(1.8, 0.4);
  const hero = new THREE.LineSegments(new THREE.EdgesGeometry(heroGeo), mat(0.25));
  hero.position.set(0, 1.2 + oy, -0.26);
  hero.rotation.x = -0.12;
  group.add(hero);

  // Two column blocks
  [[-0.5, 0.7 + oy], [0.5, 0.7 + oy]].forEach(([x, y]) => {
    const blockGeo = new THREE.PlaneGeometry(0.8, 0.35);
    const block = new THREE.LineSegments(new THREE.EdgesGeometry(blockGeo), mat(0.2));
    block.position.set(x, y, -0.26);
    block.rotation.x = -0.12;
    group.add(block);
  });

  // Text lines
  for (let i = 0; i < 3; i++) {
    const w = 0.6 + Math.random() * 0.3;
    const pts = [
      new THREE.Vector3(-0.9, 0.35 + oy - i * 0.12, -0.26),
      new THREE.Vector3(-0.9 + w, 0.35 + oy - i * 0.12, -0.26),
    ];
    group.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints(pts), mat(0.15)));
  }

  // Base/keyboard
  const baseGeo = new THREE.BoxGeometry(2.8, 0.06, 1.7);
  const base = new THREE.LineSegments(new THREE.EdgesGeometry(baseGeo), mat(0.3));
  base.position.y = oy;
  group.add(base);

  // Trackpad
  const padGeo = new THREE.PlaneGeometry(0.8, 0.5);
  const pad = new THREE.LineSegments(new THREE.EdgesGeometry(padGeo), mat(0.15));
  pad.position.set(0, 0.04 + oy, 0.15);
  pad.rotation.x = -Math.PI / 2;
  group.add(pad);

  // Keyboard hints
  for (let row = 0; row < 3; row++) {
    for (let col = 0; col < 8; col++) {
      const pts = [
        new THREE.Vector3(-1.0 + col * 0.25, 0.04 + oy, -0.5 + row * 0.2),
        new THREE.Vector3(-0.85 + col * 0.25, 0.04 + oy, -0.5 + row * 0.2),
      ];
      group.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints(pts), mat(0.08)));
    }
  }

  return group;
}

function createShoppingBag(): THREE.Group {
  const group = new THREE.Group();
  // Bag body
  const bagGeo = new THREE.BoxGeometry(1.6, 2, 0.9);
  const bagEdges = new THREE.EdgesGeometry(bagGeo);
  const bag = new THREE.LineSegments(
    bagEdges,
    new THREE.LineBasicMaterial({ color: ACCENT, transparent: true, opacity: 0.7 })
  );
  group.add(bag);
  // Handle
  const handleCurve = new THREE.CatmullRomCurve3([
    new THREE.Vector3(-0.4, 1, 0),
    new THREE.Vector3(-0.4, 1.6, 0),
    new THREE.Vector3(0.4, 1.6, 0),
    new THREE.Vector3(0.4, 1, 0),
  ]);
  const handleGeo = new THREE.BufferGeometry().setFromPoints(
    handleCurve.getPoints(20)
  );
  const handle = new THREE.Line(
    handleGeo,
    new THREE.LineBasicMaterial({ color: ACCENT, transparent: true, opacity: 0.4 })
  );
  group.add(handle);
  // Stripe decoration
  const stripeGeo = new THREE.BufferGeometry().setFromPoints([
    new THREE.Vector3(-0.8, 0.2, 0.46),
    new THREE.Vector3(0.8, 0.2, 0.46),
  ]);
  const stripe = new THREE.Line(
    stripeGeo,
    new THREE.LineBasicMaterial({ color: ACCENT, transparent: true, opacity: 0.3 })
  );
  group.add(stripe);
  return group;
}

function createDashboard(): THREE.Group {
  const group = new THREE.Group();
  const mat = (o: number) =>
    new THREE.LineBasicMaterial({ color: ACCENT, transparent: true, opacity: o });

  // Main frame
  const frameGeo = new THREE.BoxGeometry(2.8, 2, 0.08);
  group.add(new THREE.LineSegments(new THREE.EdgesGeometry(frameGeo), mat(0.7)));

  // Sidebar divider
  const sideX = -0.8;
  const sidePts = [
    new THREE.Vector3(sideX, 1, 0.05),
    new THREE.Vector3(sideX, -1, 0.05),
  ];
  group.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints(sidePts), mat(0.4)));

  // Topbar divider
  const topPts = [
    new THREE.Vector3(-1.4, 0.65, 0.05),
    new THREE.Vector3(1.4, 0.65, 0.05),
  ];
  group.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints(topPts), mat(0.4)));

  // Sidebar icons (small squares)
  for (let i = 0; i < 5; i++) {
    const iconGeo = new THREE.PlaneGeometry(0.15, 0.15);
    const icon = new THREE.LineSegments(new THREE.EdgesGeometry(iconGeo), mat(0.25));
    icon.position.set(-1.1, 0.4 - i * 0.3, 0.05);
    group.add(icon);
    // Label line next to icon
    const labelPts = [
      new THREE.Vector3(-0.98, 0.4 - i * 0.3, 0.05),
      new THREE.Vector3(-0.85, 0.4 - i * 0.3, 0.05),
    ];
    group.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints(labelPts), mat(0.15)));
  }

  // Main chart area (top right)
  const chartPanel = new THREE.PlaneGeometry(1.8, 0.7);
  const chartFrame = new THREE.LineSegments(new THREE.EdgesGeometry(chartPanel), mat(0.3));
  chartFrame.position.set(0.35, 0.2, 0.05);
  group.add(chartFrame);

  // Mini line chart inside
  const chartPoints = [
    new THREE.Vector3(-0.5, 0.05, 0.06),
    new THREE.Vector3(-0.2, 0.25, 0.06),
    new THREE.Vector3(0.1, 0.1, 0.06),
    new THREE.Vector3(0.4, 0.35, 0.06),
    new THREE.Vector3(0.7, 0.2, 0.06),
    new THREE.Vector3(1.0, 0.45, 0.06),
  ];
  const chartCurve = new THREE.CatmullRomCurve3(chartPoints);
  group.add(
    new THREE.Line(
      new THREE.BufferGeometry().setFromPoints(chartCurve.getPoints(30)),
      mat(0.5)
    )
  );

  // Stat cards (bottom right — 3 small cards)
  for (let i = 0; i < 3; i++) {
    const cardGeo = new THREE.PlaneGeometry(0.5, 0.35);
    const card = new THREE.LineSegments(new THREE.EdgesGeometry(cardGeo), mat(0.25));
    card.position.set(-0.3 + i * 0.65, -0.55, 0.05);
    group.add(card);

    // Number placeholder line in card
    const numPts = [
      new THREE.Vector3(-0.45 + i * 0.65, -0.48, 0.06),
      new THREE.Vector3(-0.15 + i * 0.65, -0.48, 0.06),
    ];
    group.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints(numPts), mat(0.15)));
  }

  // Data rows (bottom)
  for (let i = 0; i < 2; i++) {
    const rowPts = [
      new THREE.Vector3(-0.6, -0.82 - i * 0.15, 0.05),
      new THREE.Vector3(1.3, -0.82 - i * 0.15, 0.05),
    ];
    group.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints(rowPts), mat(0.12)));
  }

  return group;
}

function createSmartphone(): THREE.Group {
  const group = new THREE.Group();
  const mat = (o: number) =>
    new THREE.LineBasicMaterial({ color: ACCENT, transparent: true, opacity: o });

  // Phone body
  const bodyGeo = new THREE.BoxGeometry(1.2, 2.2, 0.1);
  const body = new THREE.LineSegments(new THREE.EdgesGeometry(bodyGeo), mat(0.7));
  group.add(body);

  // Screen bezel
  const screenGeo = new THREE.PlaneGeometry(1.0, 1.85);
  const screen = new THREE.LineSegments(new THREE.EdgesGeometry(screenGeo), mat(0.35));
  screen.position.set(0, 0, 0.06);
  group.add(screen);

  // Status bar line
  const statusPts = [
    new THREE.Vector3(-0.45, 0.85, 0.07),
    new THREE.Vector3(0.45, 0.85, 0.07),
  ];
  group.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints(statusPts), mat(0.3)));

  // Notch / dynamic island
  const notchGeo = new THREE.PlaneGeometry(0.3, 0.06);
  const notch = new THREE.LineSegments(new THREE.EdgesGeometry(notchGeo), mat(0.4));
  notch.position.set(0, 0.9, 0.07);
  group.add(notch);

  // Time indicator (left)
  const timePts = [
    new THREE.Vector3(-0.42, 0.88, 0.07),
    new THREE.Vector3(-0.28, 0.88, 0.07),
  ];
  group.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints(timePts), mat(0.2)));

  // Battery indicator (right)
  const battPts = [
    new THREE.Vector3(0.3, 0.88, 0.07),
    new THREE.Vector3(0.42, 0.88, 0.07),
  ];
  group.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints(battPts), mat(0.2)));

  // App header bar
  const headerPts = [
    new THREE.Vector3(-0.45, 0.7, 0.07),
    new THREE.Vector3(0.45, 0.7, 0.07),
  ];
  group.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints(headerPts), mat(0.25)));

  // Header title
  const titlePts = [
    new THREE.Vector3(-0.25, 0.77, 0.07),
    new THREE.Vector3(0.25, 0.77, 0.07),
  ];
  group.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints(titlePts), mat(0.3)));

  // 2x2 card grid
  const positions = [
    [-0.22, 0.4],
    [0.22, 0.4],
    [-0.22, -0.05],
    [0.22, -0.05],
  ];
  positions.forEach(([x, y]) => {
    const cardGeo = new THREE.PlaneGeometry(0.35, 0.35);
    const card = new THREE.LineSegments(new THREE.EdgesGeometry(cardGeo), mat(0.25));
    card.position.set(x, y, 0.07);
    group.add(card);

    // Icon circle inside card
    const iconGeo = new THREE.CircleGeometry(0.06, 8);
    const icon = new THREE.LineSegments(new THREE.EdgesGeometry(iconGeo), mat(0.2));
    icon.position.set(x, y + 0.05, 0.08);
    group.add(icon);

    // Label line
    const labelPts = [
      new THREE.Vector3(x - 0.1, y - 0.08, 0.08),
      new THREE.Vector3(x + 0.1, y - 0.08, 0.08),
    ];
    group.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints(labelPts), mat(0.15)));
  });

  // List items
  for (let i = 0; i < 3; i++) {
    const rowY = -0.4 - i * 0.15;
    const dotGeo = new THREE.CircleGeometry(0.04, 8);
    const dot = new THREE.LineSegments(new THREE.EdgesGeometry(dotGeo), mat(0.2));
    dot.position.set(-0.35, rowY, 0.07);
    group.add(dot);

    const textPts = [
      new THREE.Vector3(-0.25, rowY, 0.07),
      new THREE.Vector3(0.1 + Math.random() * 0.2, rowY, 0.07),
    ];
    group.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints(textPts), mat(0.15)));
  }

  // Bottom navigation bar
  const navBarPts = [
    new THREE.Vector3(-0.45, -0.75, 0.07),
    new THREE.Vector3(0.45, -0.75, 0.07),
  ];
  group.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints(navBarPts), mat(0.3)));

  // Bottom nav icons
  [-0.3, -0.1, 0.1, 0.3].forEach((x) => {
    const navIconGeo = new THREE.PlaneGeometry(0.1, 0.1);
    const navIcon = new THREE.LineSegments(new THREE.EdgesGeometry(navIconGeo), mat(0.25));
    navIcon.position.set(x, -0.85, 0.07);
    group.add(navIcon);
  });

  // Home indicator bar
  const homePts = [
    new THREE.Vector3(-0.15, -0.98, 0.07),
    new THREE.Vector3(0.15, -0.98, 0.07),
  ];
  group.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints(homePts), mat(0.3)));

  return group;
}

const serviceIds = ["siti-web", "shop-saas", "web-app", "mobile-app"] as const;

const geometryBuilders: Record<string, () => THREE.Group> = {
  "siti-web": createLaptop,
  "shop-saas": createShoppingBag,
  "web-app": createDashboard,
  "mobile-app": createSmartphone,
};

// Orbit positions for idle state (4 corners)
const orbitPositions = [
  { x: -1.2, y: 0.8 },   // top-left: laptop
  { x: 1.2, y: 0.8 },    // top-right: shop
  { x: -1.2, y: -0.8 },  // bottom-left: dashboard
  { x: 1.2, y: -0.8 },   // bottom-right: smartphone
];

type SceneState = "idle" | "transitioning" | "selected";

export default function WizardScene({ serviceId, step }: WizardSceneProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<{
    renderer: THREE.WebGLRenderer;
    scene: THREE.Scene;
    camera: THREE.PerspectiveCamera;
    orbitGroup: THREE.Group;
    orbitItems: THREE.Group[];
    selectedGroup: THREE.Group | null;
    state: SceneState;
    animId: number;
    timer: THREE.Timer;
    isRunning: boolean;
  } | null>(null);
  const prevServiceRef = useRef<string | null>(null);
  const prevStepRef = useRef<number>(step);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(container.clientWidth, container.clientHeight);
    container.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(
      45, container.clientWidth / container.clientHeight, 0.1, 100
    );
    camera.position.set(0, 0, 5);
    camera.lookAt(0, 0, 0);

    const ambient = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambient);

    // 4 mini geometries — each lives directly in the scene (NOT in a rotating group)
    // The "orbit" effect is done by moving each item individually in the loop
    const orbitGroup = new THREE.Group();
    const orbitItems: THREE.Group[] = [];

    serviceIds.forEach((id, i) => {
      const builder = geometryBuilders[id];
      const item = builder();
      item.scale.set(0.3, 0.3, 0.3);
      item.position.set(orbitPositions[i].x, orbitPositions[i].y, 0);
      item.traverse((child) => {
        if (child instanceof THREE.LineSegments || child instanceof THREE.Line) {
          const mat = child.material;
          if (mat instanceof THREE.LineBasicMaterial) mat.opacity *= 0.6;
        }
      });
      orbitGroup.add(item);
      orbitItems.push(item);
    });
    scene.add(orbitGroup);

    const timer = new THREE.Timer();
    timer.connect(document);
    sceneRef.current = {
      renderer, scene, camera, orbitGroup, orbitItems,
      selectedGroup: null, state: "idle", animId: 0, timer, isRunning: false,
    };

    const animate = (timestamp?: number) => {
      const ref = sceneRef.current;
      if (!ref || !ref.isRunning) return;

      ref.timer.update(timestamp);
      const elapsed = ref.timer.getElapsed();

      if (ref.state === "idle") {
        ref.orbitGroup.rotation.y = elapsed * 0.15;
        ref.orbitItems.forEach((item, i) => {
          item.rotation.y = elapsed * 0.4 + i * Math.PI * 0.5;
          item.position.y = orbitPositions[i].y + Math.sin(elapsed * 0.8 + i * 1.5) * 0.1;
        });
      }
      // "transitioning" — GSAP controls everything, loop just renders
      if (ref.state === "selected" && ref.selectedGroup) {
        ref.selectedGroup.rotation.y += 0.005;
      }

      ref.renderer.render(ref.scene, ref.camera);
      ref.animId = requestAnimationFrame(animate);
    };

    // Render one static frame immediately (so it's not blank)
    renderer.render(scene, camera);

    // WebGL context loss safety net
    const canvas = renderer.domElement;
    canvas.addEventListener("webglcontextlost", (e) => {
      e.preventDefault();
      if (sceneRef.current) {
        sceneRef.current.isRunning = false;
        cancelAnimationFrame(sceneRef.current.animId);
      }
    });
    canvas.addEventListener("webglcontextrestored", () => {
      if (sceneRef.current && container) {
        const w = container.clientWidth;
        const h = container.clientHeight;
        if (w > 0 && h > 0) {
          sceneRef.current.renderer.setSize(w, h);
          sceneRef.current.isRunning = true;
          sceneRef.current.animId = requestAnimationFrame(animate);
        }
      }
    });

    // Start animation only when visible in viewport
    const observer = new IntersectionObserver(
      ([entry]) => {
        const ref = sceneRef.current;
        if (!ref) return;
        if (entry.isIntersecting) {
          if (!ref.isRunning) {
            ref.isRunning = true;
            ref.timer.reset();
            ref.animId = requestAnimationFrame(animate);
          }
        } else {
          if (ref.isRunning) {
            ref.isRunning = false;
            cancelAnimationFrame(ref.animId);
          }
        }
      },
      { threshold: 0.1 }
    );
    observer.observe(container);

    // ResizeObserver: fires on ANY container size change (CSS transitions, layout shifts, window resize)
    const resizeObserver = new ResizeObserver((entries) => {
      if (!sceneRef.current) return;
      const { width, height } = entries[0].contentRect;
      if (width === 0 || height === 0) return;
      const { renderer: r, camera: c } = sceneRef.current;
      c.aspect = width / height;
      c.updateProjectionMatrix();
      r.setSize(width, height);
    });
    resizeObserver.observe(container);

    return () => {
      observer.disconnect();
      resizeObserver.disconnect();
      if (sceneRef.current) {
        sceneRef.current.isRunning = false;
        cancelAnimationFrame(sceneRef.current.animId);
        sceneRef.current.timer.dispose();
        sceneRef.current.renderer.dispose();
        container.removeChild(sceneRef.current.renderer.domElement);
        sceneRef.current = null;
      }
    };
  }, []);

  // Handle service change
  useEffect(() => {
    const ref = sceneRef.current;
    if (!ref) return;

    // Same service — just pulse on step change
    if (serviceId === prevServiceRef.current) {
      if (step !== prevStepRef.current && ref.selectedGroup) {
        gsap.to(ref.selectedGroup.scale, {
          x: 0.85, y: 0.85, z: 0.85,
          duration: 0.25, ease: "power2.out", yoyo: true, repeat: 1,
        });
      }
      prevStepRef.current = step;
      return;
    }

    prevServiceRef.current = serviceId;
    prevStepRef.current = step;

    const disposeGroup = (g: THREE.Group) => {
      g.traverse((child) => {
        if (child instanceof THREE.LineSegments || child instanceof THREE.Line) {
          child.geometry.dispose();
          if (child.material instanceof THREE.Material) child.material.dispose();
        }
      });
      if (g.parent) g.parent.remove(g);
    };

    // --- IDLE → SELECTED ---
    if (serviceId && ref.state === "idle") {
      ref.state = "transitioning";
      const selectedIndex = serviceIds.indexOf(serviceId as typeof serviceIds[number]);
      const selectedItem = ref.orbitItems[selectedIndex];

      // 1. Freeze orbit — stop the animation loop from moving items
      //    (state is now "transitioning" so loop just renders)

      // 2. Compute each item's current world position and detach ALL from orbitGroup
      const worldPositions: THREE.Vector3[] = [];
      ref.orbitItems.forEach((item) => {
        const wp = new THREE.Vector3();
        item.getWorldPosition(wp);
        worldPositions.push(wp);
      });
      // Now detach all and place in scene at world positions
      ref.orbitItems.forEach((item, i) => {
        ref.orbitGroup.remove(item);
        item.position.copy(worldPositions[i]);
        ref.scene.add(item);
      });
      ref.orbitGroup.visible = false;

      // 3. Shrink non-selected items
      ref.orbitItems.forEach((item, i) => {
        if (i !== selectedIndex) {
          gsap.to(item.scale, {
            x: 0, y: 0, z: 0,
            duration: 0.4, ease: "power2.in",
          });
        }
      });

      // 4. Selected item: glide to (0,0,0) and scale up simultaneously
      gsap.to(selectedItem.position, {
        x: 0, y: 0, z: 0,
        duration: 0.9, ease: "power3.inOut",
      });
      gsap.to(selectedItem.scale, {
        x: 0.8, y: 0.8, z: 0.8,
        duration: 0.9, ease: "power3.inOut",
        onComplete: () => {
          // 5. Seamless swap: replace orbit item with fresh full-opacity geometry
          const currentRotY = selectedItem.rotation.y;
          ref.orbitItems.forEach((item) => {
            if (item.parent) item.parent.remove(item);
          });

          const builder = geometryBuilders[serviceId];
          if (!builder) return;
          const group = builder();
          group.scale.set(0.8, 0.8, 0.8);
          group.rotation.y = currentRotY;
          group.position.set(0, 0, 0);
          ref.scene.add(group);
          ref.selectedGroup = group;
          ref.state = "selected";
        },
      });
      return;
    }

    // --- SELECTED → DIFFERENT SERVICE ---
    if (serviceId && ref.state === "selected") {
      ref.state = "transitioning";

      const swapTo = () => {
        if (ref.selectedGroup) disposeGroup(ref.selectedGroup);

        const builder = geometryBuilders[serviceId];
        if (!builder) return;
        const group = builder();
        group.scale.set(0, 0, 0);
        group.position.set(0, 0, 0);
        ref.scene.add(group);
        ref.selectedGroup = group;
        ref.state = "selected";

        gsap.to(group.scale, {
          x: 0.8, y: 0.8, z: 0.8,
          duration: 0.6, ease: "power2.out",
        });
        gsap.fromTo(group.rotation,
          { y: -0.5 },
          { y: 0, duration: 0.8, ease: "power2.out" }
        );
      };

      if (ref.selectedGroup) {
        gsap.to(ref.selectedGroup.scale, {
          x: 0, y: 0, z: 0,
          duration: 0.3, ease: "power2.in", onComplete: swapTo,
        });
      } else {
        swapTo();
      }
      return;
    }

    // --- SELECTED → IDLE (back) ---
    if (!serviceId && (ref.state === "selected" || ref.state === "transitioning")) {
      const restoreOrbit = () => {
        if (ref.selectedGroup) {
          disposeGroup(ref.selectedGroup);
          ref.selectedGroup = null;
        }

        // Rebuild orbit: recreate mini geometries fresh
        ref.orbitItems.forEach((item) => {
          if (item.parent) item.parent.remove(item);
        });
        ref.orbitItems.length = 0;

        ref.orbitGroup.clear();
        serviceIds.forEach((id, i) => {
          const builder = geometryBuilders[id];
          const item = builder();
          item.scale.set(0, 0, 0);
          item.position.set(orbitPositions[i].x, orbitPositions[i].y, 0);
          item.traverse((child) => {
            if (child instanceof THREE.LineSegments || child instanceof THREE.Line) {
              const mat = child.material;
              if (mat instanceof THREE.LineBasicMaterial) mat.opacity *= 0.6;
            }
          });
          ref.orbitGroup.add(item);
          ref.orbitItems.push(item);

          gsap.to(item.scale, {
            x: 0.3, y: 0.3, z: 0.3,
            duration: 0.5, delay: i * 0.1, ease: "power2.out",
          });
        });

        ref.orbitGroup.rotation.y = 0;
        ref.orbitGroup.visible = true;
        ref.state = "idle";
      };

      if (ref.selectedGroup) {
        gsap.to(ref.selectedGroup.scale, {
          x: 0, y: 0, z: 0,
          duration: 0.3, ease: "power2.in", onComplete: restoreOrbit,
        });
      } else {
        restoreOrbit();
      }
    }
  }, [serviceId, step]);

  return (
    <div
      ref={containerRef}
      className="absolute inset-0 z-0"
      style={{ pointerEvents: "none" }}
    />
  );
}
