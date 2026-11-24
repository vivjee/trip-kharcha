/** All financial arithmetic is performed in integer paisa. */
export const toMinorUnits = (value: number) =>
  Math.round((value + Number.EPSILON) * 100);
export const fromMinorUnits = (value: number) => value / 100;
export const roundMoney = (value: number) =>
  fromMinorUnits(toMinorUnits(value));
export const sumMoney = (values: number[]) =>
  fromMinorUnits(values.reduce((sum, value) => sum + toMinorUnits(value), 0));
export const formatMoney = (value: number, symbol = "रू") =>
  `${symbol} ${value.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

/** Keep the historical equal-split convention: the final member gets the remainder. */
export function allocateEqual(amount: number, count: number): number[] {
  if (count < 1) return [];
  const total = toMinorUnits(amount);
  const base = Math.floor(total / count);
  return Array.from({ length: count }, (_, i) =>
    fromMinorUnits(i === count - 1 ? total - base * (count - 1) : base),
  );
}

/** Largest remainder allocation cannot create a negative final share for tiny totals. */
export function allocateWeighted(amount: number, weights: number[]): number[] {
  const total = toMinorUnits(amount);
  const sum = weights.reduce((a, b) => a + b, 0);
  if (
    !Number.isFinite(sum) ||
    sum <= 0 ||
    weights.some((w) => !Number.isFinite(w) || w < 0)
  )
    return weights.map(() => 0);
  const exact = weights.map((w) => (total * w) / sum);
  const units = exact.map(Math.floor);
  const order = exact
    .map((v, i) => ({ i, remainder: v - units[i] }))
    .sort((a, b) => b.remainder - a.remainder || a.i - b.i);
  const remaining = total - units.reduce((a, b) => a + b, 0);
  for (let i = 0; i < remaining; i++) units[order[i % order.length].i]++;
  return units.map(fromMinorUnits);
}
