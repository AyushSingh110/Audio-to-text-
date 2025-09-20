import React, { useEffect, useState } from "react";
import HeroSection from "../components/HeroSection";
import AboutSection from "../components/AboutSection";
import StorySection from "../components/StorySection";
import PhotoSection from "../components/PhotosSection";
import ContactSection from "../components/ContactSection";  

const LandingPage = ({ uploadedImages, artisanData }) => {
    const [aboutTxt, setAboutTxt] = useState("");
    const [storyTxt, setStoryTxt] = useState("");
    const [keywords, setKeywords] = useState("");

    useEffect(() => {
        fetch("/uploads/data/3fdc4688-2ecd-4b9d-837b-633695ae3132.json")
            .then((res) => res.json())
            .then((data) => {
                setAboutTxt(data.content.about_text);
                setStoryTxt(data.transcript);
                setKeywords(data.content.keywords);
            })
            .catch((err) => {
                setAboutTxt("Could not load about text.");
                setStoryTxt("Could not load story text.");
                setKeywords("Could not load keywords");
            });
    }, []);

    return (
        <div className="main">
            <HeroSection 
                artisanName={artisanData?.artisanName || "Artisan"}
                tagline={keywords}
                ctaText={"Explore art pieces"}
            />
            <AboutSection 
                aboutTxt={aboutTxt} />
            <StorySection 
                storyTxt={storyTxt} />
            <PhotoSection
                images={uploadedImages} />
            <ContactSection
                artisanName={artisanData?.artisanName}
                phoneNum={artisanData?.phoneNum}
                email={artisanData?.email}
                shopAddress={artisanData?.shopAddress} />
        </div>
    );
};

export default LandingPage;