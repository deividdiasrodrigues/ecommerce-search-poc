import { useState, useEffect, useRef, useCallback } from "react";
import { fetchSuggestions } from "../services/searchService";

const MIN_CHARS    = 3;
const DEBOUNCE_MS  = 200;

export default function SearchBar({ onSearch, loading }) {
  const [value,       setValue]       = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [showDrop,    setShowDrop]    = useState(false);
  const [activeIdx,   setActiveIdx]   = useState(-1);

  const inputRef     = useRef(null);
  const dropRef      = useRef(null);
  const debounceRef  = useRef(null);
  const ignoreNextFetch = useRef(false); // set after user picks a suggestion

  // ── Fetch suggestions with debounce ────────────────────────────────────────
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);

    if (value.trim().length < MIN_CHARS || ignoreNextFetch.current) {
      ignoreNextFetch.current = false;
      setSuggestions([]);
      setShowDrop(false);
      setActiveIdx(-1);
      return;
    }

    debounceRef.current = setTimeout(async () => {
      const results = await fetchSuggestions(value);
      setSuggestions(results);
      setShowDrop(results.length > 0);
      setActiveIdx(-1);
    }, DEBOUNCE_MS);

    return () => clearTimeout(debounceRef.current);
  }, [value]);

  // ── Close dropdown on outside click ────────────────────────────────────────
  useEffect(() => {
    function handleClickOutside(e) {
      if (
        dropRef.current  && !dropRef.current.contains(e.target) &&
        inputRef.current && !inputRef.current.contains(e.target)
      ) {
        setShowDrop(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // ── Pick a suggestion ───────────────────────────────────────────────────────
  const pickSuggestion = useCallback((title) => {
    ignoreNextFetch.current = true;
    setValue(title);
    setSuggestions([]);
    setShowDrop(false);
    setActiveIdx(-1);
    onSearch(title);
  }, [onSearch]);

  // ── Submit ──────────────────────────────────────────────────────────────────
  function handleSubmit(e) {
    e.preventDefault();
    const trimmed = value.trim();
    if (!trimmed) return;
    if (activeIdx >= 0 && suggestions[activeIdx]) {
      pickSuggestion(suggestions[activeIdx].title);
    } else {
      setShowDrop(false);
      onSearch(trimmed);
    }
  }

  // ── Keyboard navigation ─────────────────────────────────────────────────────
  function handleKeyDown(e) {
    if (!showDrop || suggestions.length === 0) return;

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIdx((i) => Math.min(i + 1, suggestions.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIdx((i) => Math.max(i - 1, -1));
    } else if (e.key === "Escape") {
      setShowDrop(false);
      setActiveIdx(-1);
    }
  }

  return (
    <div className="search-wrapper">
      <form className="search-form" onSubmit={handleSubmit} role="search">
        <input
          ref={inputRef}
          className="search-input"
          type="search"
          placeholder="Buscar produtos…"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={() => suggestions.length > 0 && setShowDrop(true)}
          aria-label="Search products"
          aria-autocomplete="list"
          aria-controls="autocomplete-list"
          aria-activedescendant={activeIdx >= 0 ? `suggestion-${activeIdx}` : undefined}
          autoComplete="off"
          autoFocus
        />
        <button
          className="search-button"
          type="submit"
          disabled={loading || value.trim() === ""}
          aria-busy={loading}
        >
          {loading ? "Buscando…" : "Buscar"}
        </button>
      </form>

      {showDrop && (
        <ul
          id="autocomplete-list"
          ref={dropRef}
          className="autocomplete-dropdown"
          role="listbox"
          aria-label="Sugestões de busca"
        >
          {suggestions.map((s, i) => (
            <li
              key={i}
              id={`suggestion-${i}`}
              role="option"
              aria-selected={i === activeIdx}
              className={`autocomplete-item${i === activeIdx ? " autocomplete-item--active" : ""}`}
              onMouseDown={() => pickSuggestion(s.title)}
            >
              <span className="autocomplete-item__title">{s.title}</span>
              {s.category_name && (
                <span className="autocomplete-item__category">{s.category_name}</span>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
