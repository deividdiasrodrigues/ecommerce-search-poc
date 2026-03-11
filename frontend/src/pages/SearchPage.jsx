import { useState, useCallback } from "react";
import SearchBar   from "../components/SearchBar";
import ProductCard from "../components/ProductCard";
import { searchProducts } from "../services/searchService";

const STATUS = { IDLE: "idle", LOADING: "loading", SUCCESS: "success", ERROR: "error" };

export default function SearchPage() {
  const [status,    setStatus]    = useState(STATUS.IDLE);
  const [products,  setProducts]  = useState([]);
  const [error,     setError]     = useState(null);
  const [lastQuery, setLastQuery] = useState("");

  const handleSearch = useCallback(async (query) => {
    setStatus(STATUS.LOADING);
    setError(null);
    setLastQuery(query);

    try {
      const results = await searchProducts(query);
      setProducts(results);
      setStatus(STATUS.SUCCESS);
    } catch (err) {
      setError(err.message);
      setStatus(STATUS.ERROR);
    }
  }, []);

  return (
    <div className="page">
      <header className="header">
        <h1>🛍️ Ecommerce Search POC</h1>
        <p>Digite o nome de um produto, categoria ou palavra-chave</p>
      </header>

      <SearchBar onSearch={handleSearch} loading={status === STATUS.LOADING} />

      {status === STATUS.IDLE && (
        <p className="status">Comece digitando acima para buscar produtos.</p>
      )}

      {status === STATUS.LOADING && (
        <p className="status">Buscando por "{lastQuery}"…</p>
      )}

      {status === STATUS.ERROR && (
        <p className="status status--error">Erro: {error}</p>
      )}

      {status === STATUS.SUCCESS && (
        <>
          <p className="results-meta">
            {products.length === 0
              ? `Nenhum resultado encontrado para "${lastQuery}".`
              : `${products.length} resultado${products.length !== 1 ? "s" : ""} para "${lastQuery}"`}
          </p>

          {products.length > 0 && (
            <section className="product-grid" aria-label="Resultados da busca">
              {products.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </section>
          )}
        </>
      )}
    </div>
  );
}
