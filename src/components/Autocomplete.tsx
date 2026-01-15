/* eslint-disable react-hooks/set-state-in-effect */
import { useEffect, useState, useRef } from "react";
import { TextInput, Paper } from "@mantine/core";
import { useDebounce } from "../hooks/useDebounce";
import { highlightMatch } from "../hooks/useHighlightText";
import { IconSearch, IconX } from "@tabler/icons-react";

type FetchResult<T> = {
  data: T[];
  hasMore: boolean;
};

type AutocompleteProps<T> = {
  fetcher: (q: string, page: number) => Promise<FetchResult<T>>;
  getLabel: (item: T) => string;
  onSelect: (item: T) => void;
};

export function Autocomplete<T>({
  fetcher,
  getLabel,
  onSelect,
}: AutocompleteProps<T>) {
  const [query, setQuery] = useState("");
  const debouncedQuery = useDebounce(query, 400);

  const [items, setItems] = useState<T[]>([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);
  const [opened, setOpened] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);

  const wrapperRef = useRef<HTMLDivElement | null>(null);
  const scrollRef = useRef<HTMLDivElement | null>(null);
  const requestIdRef = useRef(0);

  // Load a specific page of results
  async function loadPage(p: number, reset = false) {
    if (loading) return;
    const currentRequestId = ++requestIdRef.current;

    setLoading(true);

    const res = await fetcher(debouncedQuery, p);
    if (currentRequestId !== requestIdRef.current) {
      return;
    }
    setItems((prev) => (reset ? res.data : [...prev, ...res.data]));
    setHasMore(res.hasMore);
    setPage(p);
    setLoading(false);
  }

  // Handle scroll to load more results
  function handleScroll() {
    const el = scrollRef.current;
    if (!el || loading || !hasMore) return;

    if (el.scrollTop + el.clientHeight >= el.scrollHeight - 10) {
      loadPage(page + 1);
    }
  }

  useEffect(() => {
    requestIdRef.current++;
    setItems([]);
    setPage(1);
    setHasMore(true);
    setActiveIndex(-1);
    loadPage(1, true);
  }, [debouncedQuery]);

  // Ensure active item is visible
  useEffect(() => {
    const el = scrollRef.current;
    const activeEl = el?.children[activeIndex] as HTMLElement | undefined;
    if (!el || !activeEl) return;

    const elTop = activeEl.offsetTop;
    const elBottom = elTop + activeEl.offsetHeight;

    if (elTop < el.scrollTop) {
      el.scrollTop = elTop;
    } else if (elBottom > el.scrollTop + el.clientHeight) {
      el.scrollTop = elBottom - el.clientHeight;
    }
  }, [activeIndex]);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (
        wrapperRef.current &&
        !wrapperRef.current.contains(e.target as Node)
      ) {
        setOpened(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div ref={wrapperRef} style={{ width: "100%", position: "relative" }}>
      <TextInput
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        onFocus={() => setOpened(true)}
        onKeyDown={(e) => {
          if (!opened) return;

          if (e.key === "ArrowDown") {
            e.preventDefault();
            setActiveIndex((i) => {
              const next = Math.min(i + 1, items.length - 1);
              if (next === items.length - 1 && hasMore && !loading) {
                loadPage(page + 1);
              }
              return next;
            });
          }

          if (e.key === "ArrowUp") {
            e.preventDefault();
            setActiveIndex((i) => Math.max(i - 1, 0));
          }

          if (e.key === "Enter" && activeIndex >= 0) {
            e.preventDefault();
            onSelect(items[activeIndex]);
            setOpened(false);
          }

          if (e.key === "Escape") {
            setOpened(false);
          }
        }}
        placeholder="Search..."
        classNames={{ input: "auto-input" }}
        leftSection={
          <IconSearch
            style={{
              position: "absolute",
              left: "10px",
              top: "12px",
              zIndex: 10,
            }}
            size={16}
            color="#888"
          />
        }
        rightSection={
          query ? (
            <IconX
              size={16}
              style={{
                cursor: "pointer",
                position: "absolute",
                right: "6px",
                top: "8px",
                transition: "0.15s",
                padding: 4,
                borderRadius: 6,
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = "#f1f3f5"; // light gray
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = "transparent";
              }}
              onClick={() => {
                setQuery("");
                setItems([]);
                setOpened(false);
                setActiveIndex(-1);
              }}
            />
          ) : null
        }
      />

      {opened && (
        <Paper
          shadow="md"
          radius="md"
          style={{
            position: "absolute",
            top: "100%",
            left: 0,
            right: 0,
            marginTop: 6,
            zIndex: 1000,
            background: "#fff",
            boxShadow: "0 12px 30px rgba(0,0,0,0.12)",
            border: "1px solid #eee",
            borderRadius: 8,
          }}
        >
          <div
            ref={scrollRef}
            onScroll={handleScroll}
            style={{
              maxHeight: 150,
              overflowY: "auto",
              width: "100%",
            }}
          >
            {items.map((item, i) => (
              <div
                key={i}
                style={{
                  padding: "10px 12px",
                  cursor: "pointer",
                  transition: "0.15s",
                  background: i === activeIndex ? "#f3edff" : "transparent",
                  color: "#333",
                }}
                onMouseEnter={() => setActiveIndex(i)}
                onClick={() => {
                  onSelect(item);
                  setOpened(false);
                }}
              >
                {highlightMatch(getLabel(item), query)}
              </div>
            ))}

            {loading && (
              <div style={{ padding: 10, textAlign: "center" }}>Loading...</div>
            )}

            {!hasMore && items.length > 0 && !loading && (
              <div style={{ padding: 10, color: "#999", textAlign: "center" }}>
                No more results
              </div>
            )}

            {query && opened && items.length === 0 && !loading && (
              <div style={{ padding: 10, color: "#999", textAlign: "center" }}>
                No match results
              </div>
            )}
          </div>
        </Paper>
      )}
    </div>
  );
}
