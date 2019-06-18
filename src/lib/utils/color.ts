/**
 * Transform an hex string to an array of rgb
 * @param hex Hexadecimal color, without the hash tag
 * @returns Array of RGB
 */
export function hexToRGB(hex: string): [number, number, number] {
  const base = 16;
  const rgb = [0, 2, 4].map((start) => {
    return parseInt(hex.slice(start, start + 2), base);
  });
  return rgb as [number, number, number];
}
