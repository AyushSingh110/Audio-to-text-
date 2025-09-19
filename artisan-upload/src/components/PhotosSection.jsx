import React from 'react';


const PhotoSection = ({ images }) => {
  return (
    <section className="photo-section">
      <h1 className="gallery-title">Product Gallery</h1>
      <div className="gallery-container">
        {images.length > 0 ? (
            images.map((image, index) => (
            <div className="art-item" key={index}>
                <img src={image} alt={`art piece ${index + 1}`} className="art-image" />
            </div>
            ))
        ) : (
            <p>no images uploaded yet. please upload some of your artworks</p>
        )}
      </div>
    </section>
  );
};

export default PhotoSection;