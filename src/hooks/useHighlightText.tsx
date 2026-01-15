export function highlightMatch(text: string, query: string) {
  if (!query) return text;

  const regex = new RegExp(`(${query})`, "gi"); // case-insensitive match
  const parts = text.split(regex);

  return parts.map((part, i) =>
    regex.test(part) ? (
      <b key={i} style={{ fontWeight: 600, color: "#7b4eff" }}>
        {part}
      </b>
    ) : (
      part
    )
  );
}
