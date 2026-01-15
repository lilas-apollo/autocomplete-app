export type Item = {
  id: number;
  label: string;
};

const FRUITS = ["apple", "banana", "orange", "grape", "mango", "peach", "pear"];

const DATA: Item[] = Array.from({ length: 200 }).map((_, i) => {
  const fruit = FRUITS[i % FRUITS.length];
  return {
    id: i + 1,
    label: `${fruit} ${i + 1}`,
  };
});

export async function fetchItems(
  query: string,
  page: number,
  limit = 10
): Promise<{ data: Item[]; hasMore: boolean }> {
  // simulate network delay
  await new Promise((res) => setTimeout(res, 400));

  const filtered = DATA.filter((item) =>
    item.label.toLowerCase().includes(query.toLowerCase())
  );

  const start = (page - 1) * limit;
  const end = start + limit;

  return {
    data: filtered.slice(start, end),
    hasMore: end < filtered.length,
  };
}
