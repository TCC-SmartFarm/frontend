// Largest-Triangle-Three-Buckets: reduz séries longas preservando picos e
// vales reais — diferente de média por janela, não cria valores que não
// existem nas leituras.
export const downsampleLTTB = <T extends { ts: number; value: number }>(
  points: T[],
  threshold: number,
): T[] => {
  const n = points.length;
  if (threshold >= n || threshold < 3) return points;

  const sampled: T[] = [points[0]];
  const every = (n - 2) / (threshold - 2);
  let a = 0;

  for (let i = 0; i < threshold - 2; i++) {
    const avgStart = Math.floor((i + 1) * every) + 1;
    const avgEnd = Math.min(Math.floor((i + 2) * every) + 1, n);
    const avgLen = avgEnd - avgStart;

    let avgTs = points[n - 1].ts;
    let avgValue = points[n - 1].value;
    if (avgLen > 0) {
      avgTs = 0;
      avgValue = 0;
      for (let j = avgStart; j < avgEnd; j++) {
        avgTs += points[j].ts;
        avgValue += points[j].value;
      }
      avgTs /= avgLen;
      avgValue /= avgLen;
    }

    const rangeStart = Math.floor(i * every) + 1;
    const rangeEnd = Math.min(Math.floor((i + 1) * every) + 1, n);
    const pa = points[a];

    let maxArea = -1;
    let next = rangeStart;
    for (let j = rangeStart; j < rangeEnd; j++) {
      const area = Math.abs(
        (pa.ts - avgTs) * (points[j].value - pa.value) -
          (pa.ts - points[j].ts) * (avgValue - pa.value),
      );
      if (area > maxArea) {
        maxArea = area;
        next = j;
      }
    }
    sampled.push(points[next]);
    a = next;
  }

  sampled.push(points[n - 1]);
  return sampled;
};
