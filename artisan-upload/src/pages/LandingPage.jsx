import React, { useEffect, useState } from "react";
import HeroSection from "../components/HeroSection";
import AboutSection from "../components/AboutSection";
import StorySection from "../components/StorySection";
import PhotoSection from "../components/PhotosSection";
import ContactSection from "../components/ContactSection";  
import GeneratedPost from "../components/GeneratedPost";

const LandingPage = ({ uploadedImages, artisanData }) => {
    const [aboutTxt, setAboutTxt] = useState("");
    const [storyTxt, setStoryTxt] = useState("");
    const [keywords, setKeywords] = useState("");
    const [postType, setPostType] = useState("instagram");
    const [postText, setPostText] = useState("");
    const [generatedPost, setGeneratedPost] = useState("");

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
                setKeywords("Could not load keywords.");
            });
    }, []);

    // Social Post Generator Handler
    const handleGeneratePost = async () => {
        const res = await fetch("/api/generate_post", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ text: postText, post_type: postType })
        });
        const data = await res.json();
        setGeneratedPost(data.post);
    };

    // Share handlers (open links)
    const handleShare = (platform) => {
        if (platform === "instagram") {
            window.open("https://www.instagram.com/", "_blank");
        } else if (platform === "twitter") {
            window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(generatedPost)}`, "_blank");
        } else if (platform === "whatsapp") {
            window.open(`https://wa.me/?text=${encodeURIComponent(generatedPost)}`, "_blank");
        } else if (platform === "email") {
            window.open(`mailto:?subject=Artisan Campaign&body=${encodeURIComponent(generatedPost)}`);
        }
    };

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
            {/* Social Post Generator Section */}
            <div className="relative social-post-generator p-6 bg-[#D6C39A]  border-2 border-dashed border-[#3e2723] rounded-xl shadow-lg mt-8 mb-4">
                <div className="absolute inset-0 z-0 bg-cover bg-center filter blur-sm opacity-50" 
                    style={{ backgroundImage: "url('/bg-1.jpg')" }}>
                </div>
                <div className="relative z-10">
                    <h2 className="text-2xl font-bold mb-4">Generate Social Media Post</h2>
                    <textarea
                        className="w-full p-2 border rounded mb-2 bg-yellow-50"
                        rows={3}
                        placeholder="Enter your post content..."
                        value={postText}
                        onChange={e => setPostText(e.target.value)}
                    />
                    <div className="flex gap-4 mb-2">
                        <select value={postType} onChange={e => setPostType(e.target.value)} className="p-2 border rounded bg-yellow-50">
                            <option value="instagram">Instagram Post</option>
                            <option value="twitter">Twitter Post</option>
                            <option value="whatsapp">WhatsApp Message</option>
                            <option value="email">Email Campaign</option>
                        </select>
                        <button onClick={handleGeneratePost} className="bg-[#B88A4A] text-dark-brown px-4 py-2 rounded text-lg">Generate</button>
                    </div>
                    {generatedPost && (
                        <GeneratedPost 
                            postText={generatedPost}
                            image={uploadedImages[0]} 
                            postType={postType}
                            onShare={handleShare}
                        />
                    )}
                </div>
            </div>
            <ContactSection
                artisanName={artisanData?.artisanName}
                phoneNum={artisanData?.phoneNum}
                email={artisanData?.email}
                shopAddress={artisanData?.shopAddress} />
        </div>
    );
};

export default LandingPage;