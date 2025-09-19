import React from "react";

const AboutSection = ({ aboutTxt }) => {
  return (
    <section className="about-section relative p-12 mt-4">
      {/* About Title */}
      <div className="flex justify-center">
        <div className="about-title bg-yellow-200 text-dark-brown text-center py-2 px-6 rounded-t-md w-[200px] border-2 border-dashed border-[#241816]">
          <h2 className="text-xl font-bold">ABOUT</h2>
        </div>
      </div>

      {/* About Content */}
      <div className="about-container p-6 bg-white shadow-lg rounded-xl mt-6 w-[1000px] flex justify-center">
        <div className="about-content mt-6 text-lg text-[#3e2723]">
          <p className="text-center">{aboutTxt}</p>
        </div>
      </div>

      {/* Product Image */}
      <div className="product-image absolute bottom-0 right-0 w-42 h-42 mt-4">
        <img
          src="/photo1.jpg"  
          alt="Artisan's Product"
          className="w-full h-full object-cover rounded-lg shadow-xl"
        />
      </div>
    </section>
  );
};

export default AboutSection;
