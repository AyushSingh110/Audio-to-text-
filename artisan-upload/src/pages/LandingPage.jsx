import React from "react";
import HeroSection from "../components/HeroSection";
import AboutSection from "../components/AboutSection";
import StorySection from "../components/StorySection";
import PhotoSection from "../components/PhotosSection";
import ContactSection from "../components/ContactSection";  

const LandingPage = ({uploadedImages,artisanData}) => {
    const Data = {
        artisanName: "kriti Creations",
        tagline: "HANDMADE | ECO-FRIENDLY | HERITAGE",
        ctaText: "Explore art pieces",
        aboutTxt: "This is where we describe the artisan's journey, craftsmanship, and unique values.The artisan creates beautiful, handmade products that capture heritage and culture.The story behind each item is deeply rooted in tradition, making each creation unique.",
        storyTxt: "In a quiet village surrounded by bamboo groves, Aarav, a skilled artisan, learned the ancient craft of bamboo weaving from his father. With each piece he creates—whether it's a basket, mat, or chair—Aarav honors the tradition passed down through generations. His woven creations are a blend of nature's beauty and human craftsmanship. Determined to preserve this art, he now teaches the younger generation, ensuring that the timeless tradition of bamboo weaving continues to thrive.",
        images: [
            "https://via.placeholder.com/200",
            "https://via.placeholder.com/200",
            "https://via.placeholder.com/200",
        ],
    };

    return (
        <div className="main">
            <HeroSection 
            artisanName={Data.artisanName}
            tagline={Data.tagline}
            ctaText={Data.ctaText}/>
            <AboutSection 
            aboutTxt={Data.aboutTxt} />
            <StorySection 
            storyTxt={Data.storyTxt} />
            <PhotoSection
            images={uploadedImages} />
            <ContactSection
            artisanName={artisanData.artisanName}
            phoneNum={artisanData.phoneNum}
            email={artisanData.email}
            shopAddress={artisanData.shopAddress} />
        </div>
    );
};

export default LandingPage;