const startCameraDistance = 6;
const fieldOfView = 45;
const worldHeightAtStart = 2 * startCameraDistance * Math.tan(((fieldOfView / 2) * Math.PI) / 180);
const avatarHalfWidthInHeadRadii = 1.4;

const clamp = (value: number, min: number, max: number) => Math.min(Math.max(value, min), max);

export const heroWideBreakpoint = 768;

export function heroHeadRadiusPx(width: number, height: number) {
  const worldWidth = (worldHeightAtStart * width) / height;
  const scale = clamp((worldWidth / 7.9) * 1.12, 0.82, 1.12);
  return (scale * height) / worldHeightAtStart;
}

export function heroGapPx(width: number) {
  return clamp(width * 0.035, 32, 96);
}

export function centeredHeroTextLeft(width: number, height: number, textWidth: number) {
  const headRadius = heroHeadRadiusPx(width, height);
  const gap = heroGapPx(width);
  const avatarReach = headRadius * (1 + avatarHalfWidthInHeadRadii);
  const centered = (width + gap + avatarReach - textWidth) / 2;
  const edgePadding = width >= 1024 ? 80 : 48;
  return Math.min(centered, width - edgePadding - textWidth);
}
