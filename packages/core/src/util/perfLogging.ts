export interface PerfResult {
  framework: string;
  test: string;
  time: number;
  memoryUsed?: number; // MB
  heapUsed?: number; // MB
  gcTime?: number; // ms
}

export interface PerfResultStrings {
  framework: string;
  test: string;
  time: string;
  memoryUsed?: string;
  heapUsed?: string;
  gcTime?: string;
}

export type PerfResultCallback = (result: PerfResult) => void;

const columnWidth = {
  framework: 32,
  test: 60,
  time: 8,
  memoryUsed: 12,
  heapUsed: 12,
  gcTime: 10,
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
    const value =
      row[key] !== undefined
        ? (row[key] || "").slice(0, length).padEnd(length)
        : "";
    if (value) {
      trimmed[key] = value;
    }
  }
  return trimmed;
}

export function formatPerfResult(row: PerfResultStrings): string {
  const keys: (keyof PerfResultStrings)[] = ["framework", "test", "time"];
  const optional: (keyof PerfResultStrings)[] = [
    "memoryUsed",
    "heapUsed",
    "gcTime",
  ];

  // Always include required columns
  const values = keys.map((key) => row[key] || "").filter((v) => v !== "");

  // Add optional columns if they exist
  for (const key of optional) {
    if (row[key]) {
      values.push(row[key]!);
    }
  }

  return values.join(" , ");
}
