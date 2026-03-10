import { useState } from "react";

export default function SearchBar({ onSearch, loading }) {
  const [value, setValue] = useState("");

  function handleSubmit(e) {
    e.preventDefault();
    const trimmed = value.trim();
    if (trimmed) onSearch(trimmed);
  }

  return (
    <form className="search-form" onSubmit={handleSubmit} role="search">
      <input
        className="search-input"
        type="search"
        placeholder="Search for products…"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        aria-label="Search products"
        autoFocus
      />
      <button
        className="search-button"
        type="submit"
        disabled={loading || value.trim() === ""}
        aria-busy={loading}
      >
        {loading ? "Searching…" : "Search"}
      </button>
    </form>
  );
}
