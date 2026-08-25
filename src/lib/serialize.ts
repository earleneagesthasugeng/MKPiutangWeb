type Decimalish = { toNumber: () => number };

export function toNumber(value: Decimalish | number): number {
  return typeof value === "number" ? value : value.toNumber();
}

export function startOfTodayUTC(): Date {
  const now = new Date();
  return new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
}
