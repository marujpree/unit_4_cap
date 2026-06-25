const Gallery = ({ images }) => {
  return (
    <div>
      <h2>Your Screenshot Gallery 🖼️</h2>
      {images && images.length > 0 ? (
        <ul className="gallery">
          {images.map((src, index) => (
            <li key={index} className="gallery-item">
              <img
                className="gallery-img"
                src={src}
                alt={`Screenshot ${index + 1}`}
              />
            </li>
          ))}
        </ul>
      ) : (
        <p>No screenshots yet — take one to start your gallery!</p>
      )}
    </div>
  );
};

export default Gallery;
