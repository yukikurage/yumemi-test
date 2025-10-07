// generate automatically
// number -> hash -> color

function simpleHash(num: number): number {
  let hash = num;
  hash = (hash << 5) - hash + num;
  hash = hash & hash;
  return Math.abs(hash);
}

export function getRandomColorFromNumber(
  num: number,
  backgroundColor: "light" | "dark" = "light"
): string {
  const hash = simpleHash(num);
  const hue = (hash * 137.508) % 360;

  // 背景色に応じて明度を調整
  const lightness =
    backgroundColor === "light"
      ? 40 + (hash % 20) // 暗めの色 (40-60%)
      : 60 + (hash % 20); // 明るめの色 (60-80%)

  const saturation = 70 + (hash % 20); // 70-90%

  return `hsl(${Math.floor(hue)}, ${saturation}%, ${lightness}%)`;
}
