// Мелочь мира: ящики, бочки, сети, кранцы, чайки на сваях.
// В отражении воды её нет (слой 1 — его видит только камера игрока), а издали она не рисуется вовсе:
// предмет в метр за сотню метров — несколько точек экрана, а треугольников в нём тысячи.
import { detail } from './surface.js';

const SMALL = [];
let at = 0;
/** o — предмет, x, z — где стоит, size — наибольший размер в метрах. */
export function small(o, x, z, size) {
  o.traverse((c) => c.layers.set(1));
  SMALL.push({ o, x, z, size: Math.max(0.6, size) });
  return o;
}
/** Прячет далёкую мелочь; за кадр просматривает часть списка. */
export function cullSmall(camera) {
  const n = Math.min(SMALL.length, 16);
  for (let i = 0; i < n; i++) {
    const s = SMALL[(at = (at + 1) % SMALL.length)];
    s.o.visible = Math.hypot(s.x - camera.position.x, s.z - camera.position.z) < Math.max(40, s.size * detail.far);
  }
}
/** Для проверок: сколько мелочи всего и сколько сейчас видно. */
export const smallState = () => ({ n: SMALL.length, shown: SMALL.filter((s) => s.o.visible).length });
