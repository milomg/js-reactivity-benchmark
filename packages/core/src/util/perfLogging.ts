export interface PerfResult {
  framework: string;
  test: string;
  time: number;
}

export interface PerfResultStrings {
  framework: string;
  test: string;
  time: string;
}

export type PerfResultCallback = (result: PerfResult) => void;

const columnWidth = {
  framework: 32,
  test: 60,
  time: 8,
};

export function perfResultHeaders(): PerfResultStrings {
  const keys: (keyof PerfResultStrings)[] = Object.keys(columnWidth) as any;
  const kv = keys.map((key) => [key, key]);
  const untrimmed = Object.fromEntries(kv);
  return trimColumns(untrimmed);
}

function trimColumns(row: PerfResultStrings): PerfResultStrings {
  const keys: (keyof PerfResultStrings)[] = Object.keys(columnWidth) as any;
  const trimmed = { ...row };
  for (const key of keys) {
    const length = columnWidth[key];
    const value = (row[key] || "").slice(0, length).padEnd(length);
    trimmed[key] = value;
  }
  return trimmed;
}

export function formatPerfResultStrings(row: PerfResultStrings): string {
  return Object.values(trimColumns(row)).join(" , ");
}

export function formatPerfResult(row: PerfResult): string {
  return formatPerfResultStrings({
    framework: row.framework,
    test: row.test,
    time: row.time.toFixed(2),
  });
}
