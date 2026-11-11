// Отражения для металла и глянца: катушка, кольца удилища.
// Окружение — нарисованная панорама неба (градиент, солнце, тёплый низ от досок). three сам готовит из неё
// размытые отражения для каждого рендерера, так что материалы годятся и для игры, и для значков.
import * as THREE from 'three';

/** Хром: скоба лесоукладывателя, бортик шпули, ручка. Цвет — по вершинам. */
export const METAL_MAT = new THREE.MeshStandardMaterial({ vertexColors: true, metalness: 1, roughness: 0.27 });
/** Глянцевая краска и анодированный алюминий: корпус и шпуля катушки. */
export const GLOSS_MAT = new THREE.MeshStandardMaterial({ vertexColors: true, metalness: 0.35, roughness: 0.3 });
/** Пропускные кольца удилища. */
export const RING_MAT = new THREE.MeshStandardMaterial({ color: '#d5dbe4', metalness: 1, roughness: 0.25 });
const MATS = [METAL_MAT, GLOSS_MAT, RING_MAT];

function panorama() {
  const c = document.createElement('canvas');
  c.width = 256;
  c.height = 128;
  const g = c.getContext('2d');
  const sky = g.createLinearGradient(0, 0, 0, 128);
  sky.addColorStop(0, '#2f7fe0');
  sky.addColorStop(0.36, '#8fcaff');
  sky.addColorStop(0.5, '#f3fbff');
  sky.addColorStop(0.52, '#3fb8c8');
  sky.addColorStop(0.7, '#8a5a2c');
  sky.addColorStop(1, '#3a2412');
  g.fillStyle = sky;
  g.fillRect(0, 0, 256, 128);
  // солнце и светлые облака
  const sun = g.createRadialGradient(70, 26, 0, 70, 26, 34);
  sun.addColorStop(0, 'rgba(255,255,255,1)');
  sun.addColorStop(0.2, 'rgba(255,248,220,0.95)');
  sun.addColorStop(1, 'rgba(255,240,200,0)');
  g.fillStyle = sun;
  g.fillRect(0, 0, 256, 128);
  g.fillStyle = 'rgba(255,255,255,0.85)';
  for (const [x, y, w, h] of [[150, 40, 46, 9], [205, 30, 34, 7], [20, 48, 30, 6]]) {
    g.beginPath();
    g.ellipse(x, y, w / 2, h / 2, 0, 0, 7);
    g.fill();
  }
  const t = new THREE.CanvasTexture(c);
  t.mapping = THREE.EquirectangularReflectionMapping;
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
}
const tex = panorama();
for (const m of MATS) {
  m.envMap = tex;
  m.envMapIntensity = 1;
}
/** Сила отражений по времени суток: днём 1, ночью почти нет. */
export function setEnvLight(k) {
  for (const m of MATS) m.envMapIntensity = k;
}
