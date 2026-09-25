export const YD = 0.9144; // metres per yard
export const MPH = 0.44704; // m/s per mph
export const G = 9.81;
export const ZERO_RANGES_YD = [25, 50, 100, 150, 200, 300, 400, 500, 600, 800, 1000];
export const SIM_DT = 0.004;

// simple drag: dv/dt = -k·v², k calibrated so a .308 (BC .46) loses ~30% velocity over 500 m
export const dragK = (bc) => 0.000346 / bc;

// 2D vertical-plane flight from the muzzle at launch `angle` until horizontal distance `rangeM`.
export function flightToRange(v0, bc, angle, rangeM, dt = SIM_DT) {
  const k = dragK(bc);
  let x = 0;
  let y = 0;
  let vx = v0 * Math.cos(angle);
  let vy = v0 * Math.sin(angle);
  let t = 0;
  while (x < rangeM && t < 12) {
    const v = Math.hypot(vx, vy);
    vx += -k * v * vx * dt;
    vy += (-G - k * v * vy) * dt;
    x += vx * dt;
    y += vy * dt;
    t += dt;
    if (vx < 5) break;
  }
  return { y, t, v: Math.hypot(vx, vy), reached: x >= rangeM };
}

// Barrel elevation so the bullet crosses the (horizontal) line of sight at zeroRangeM.
export function solveZeroAngle(v0, bc, zeroRangeM) {
  let lo = 0;
  let hi = 0.35;
  for (let i = 0; i < 28; i++) {
    const mid = (lo + hi) / 2;
    const { y, reached } = flightToRange(v0, bc, mid, zeroRangeM);
    if (reached && y > 0) hi = mid;
    else lo = mid;
  }
  return (lo + hi) / 2;
}

// Hold-over (mil, + = aim high) and wind hold (mil, + = downwind drift) at targetRangeM.
export function holdSolution(cal, zeroAngle, targetRangeM, windMs) {
  const { y, t, v, reached } = flightToRange(cal.v0, cal.bc, zeroAngle, targetRangeM);
  if (!reached) return { reachable: false, dropMil: 0, windMil: 0, tof: t, vImpact: v };
  const dropMil = (-y / targetRangeM) * 1000;
  const lag = t - targetRangeM / (cal.v0 * Math.cos(zeroAngle));
  const driftM = windMs * lag;
  return { reachable: true, dropM: -y, dropMil, tof: t, driftM, windMil: (driftM / targetRangeM) * 1000, vImpact: v };
}

// Point-in-oriented-box test for a target: box centred at c, yaw rotation, half extents (len/2 along heading, h/2, w/2).
export function pointInHog(p, c, yaw, half) {
  const dx = p.x - c.x;
  const dz = p.z - c.z;
  const cos = Math.cos(yaw);
  const sin = Math.sin(yaw);
  const lx = dx * cos - dz * sin;
  const lz = dx * sin + dz * cos;
  return Math.abs(lx) <= half.x && Math.abs(p.y - c.y) <= half.y && Math.abs(lz) <= half.z;
}
