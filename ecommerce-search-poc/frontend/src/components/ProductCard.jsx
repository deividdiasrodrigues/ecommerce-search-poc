export default function ProductCard({ product }) {
  const { id, navigation_id, title, price, image, rating_average, rating_count } = product;

  const formattedPrice = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(price);

  return (
    <article className="product-card">
      <div className="product-card__image-wrapper">
        <img
          className="product-card__image"
          src={image || "https://placehold.co/400x400?text=No+Image"}
          alt={title}
          loading="lazy"
        />
      </div>

      <div className="product-card__body">
        <h3 className="product-card__title">{title}</h3>
        <p className="product-card__id">ID: {navigation_id || id}</p>

        <div className="product-card__footer">
          <span className="product-card__price">{formattedPrice}</span>
          <span className="product-card__rating">
            <span>★</span>
            {Number(rating_average).toFixed(1)} ({rating_count})
          </span>
        </div>
      </div>
    </article>
  );
}
