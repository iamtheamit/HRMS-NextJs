export type ChartDatum = {
  label: string;
  value: number;
};

export const buildLastSixMonthSeries = (dates: string[]) => {
  const now = new Date();
  const monthKeys: string[] = [];

  for (let index = 5; index >= 0; index -= 1) {
    const d = new Date(now.getFullYear(), now.getMonth() - index, 1);
    monthKeys.push(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`);
  }

  const bucket = new Map<string, number>();
  monthKeys.forEach((key) => bucket.set(key, 0));

  dates.forEach((dateString) => {
    const parsed = new Date(dateString);
    if (Number.isNaN(parsed.getTime())) return;
    const key = `${parsed.getFullYear()}-${String(parsed.getMonth() + 1).padStart(2, '0')}`;
    if (!bucket.has(key)) return;
    bucket.set(key, (bucket.get(key) || 0) + 1);
  });

  return monthKeys.map((key) => {
    const [year, month] = key.split('-');
    const date = new Date(Number(year), Number(month) - 1, 1);
    return {
      label: date.toLocaleDateString([], { month: 'short' }),
      value: bucket.get(key) || 0,
    };
  });
};

export const buildStatusSeries = (rows: Array<{ status: string }>) => {
  const counts: Record<string, number> = {};
  rows.forEach((row) => {
    const key = (row.status || 'UNKNOWN').toUpperCase();
    counts[key] = (counts[key] || 0) + 1;
  });

  return Object.entries(counts).map(([label, value]) => ({ label, value }));
};

export const hasNonZeroValues = (series: ChartDatum[]) => {
  return series.some((item) => item.value > 0);
};
