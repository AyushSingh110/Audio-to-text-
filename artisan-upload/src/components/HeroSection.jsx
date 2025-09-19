import React from "react";

const HeroSection = ({artisanName,tagline,ctaText}) => {
    return (
        <section className="hero relative text-center py-12">
            <div className="relative z-10">
                <h1 className="cta-text text-5xl text-dark-brown text-center">{ctaText}</h1>

                <h2 className="text-3xl mt-3 text-[#6b8e23] text-center">{artisanName}</h2>

                <p className="text-lg mt-2 text-[#3e2723] text-center">{tagline}</p>
            </div>
        </section>
    );
};

export default HeroSection;