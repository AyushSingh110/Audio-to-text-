import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import ImageUpload from "../components/ImageUpload";
import AudioInput from "../components/AudioUpload";
import ContactUpload from "../components/ContactUpload";

const MainPage = ({updateUploadedImages,updateArtisanData}) => {
  const [uploadedImages, setUploadedImages] = useState([]);
  const [audioFile, setAudioFile] = useState(null);
  const [artisanData, setArtisanData] = useState(null);
  const navigate = useNavigate();

  const handleImageUpload = (files) => {
    console.log("Uploaded images:", files);
    const fileP = files.map((file) => URL.createObjectURL(file));
    setUploadedImages(fileP);
    updateUploadedImages(fileP);
  };

  const handleAudioUpload = (audio) => {
    console.log("Uploaded audio file:", audio);
    setAudioFile(audio);
  };

  const handleContactSubmit = (data) => {
    console.log("Contact data submitted:", data); 
    setArtisanData(data);
    updateArtisanData(data);
  };

  const handleSubmit = async () => {
    if (!artisanData) {
      console.error("Artisan data missing");
      return;
    }

    const formData = new FormData();
    formData.append("artisanData", JSON.stringify(artisanData));

    uploadedImages.forEach((image) => {
      formData.append("images", image);
    });

    if (audioFile) {
      formData.append("audioFile", audioFile); 
    }

    console.log("FormData entries being sent:");
    for (let [key, value] of formData.entries()) {
      console.log(key, value);
    }

    try {
      const response = await fetch("http://localhost:5000/api/save_artisan_data", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`Server error: ${response.status}`);
      }

      const resData = await response.json();
      console.log("Server response:", resData);
    } catch (error) {
      console.error("Error uploading data:", error);
    }
    //navigate to landing page
    navigate("/landing");
  };

  return (
    <div className="main-content">
      <h2 className="text-3xl font-serif text-center text-[#3e2723]">
        Welcome to Artisan Upload Page
      </h2>
      <p className="mt-4 text-lg text-center text-[#3e2723]">
        Follow these steps to let us evolve your story virtually...
      </p>
      <div className="mt-8">
        {/* step 1 */}
        <div className="step-box">
          <h3 className="text-2xl font-semibold text-[#3e2723] text-center">
            <i className="fas fa-camera-retro mr-2"></i>
            Step 1: Add your Photos
          </h3>
          <p className="mt-2 text-lg text-[#3e2723] text-center">
            Upload images of your products to showcase your work.
          </p>
          <ImageUpload onImageUpload={handleImageUpload} />
          <div className="step-text">
            Add photos that crave out your creativity and grab user attention
          </div>
        </div>

        {/* step 2 */}
        <div className="step-box">
          <h3 className="text-2xl font-semibold text-[#3e2723] mt-6 text-center">
            <i className="fas fa-microphone-alt mr-2"></i>
            Step 2: Add Your Voice
          </h3>
          <p className="mt-2 text-lg text-[#3e2723] text-center">
            Record or upload a voice note explaining your craftsmanship.
          </p>
          <AudioInput onAudioUpload={handleAudioUpload} />
          <div className="step-text">
            Record your voice and explain points and USPs about your business for us to make sales easy
          </div>
        </div>

        {/* step 3 */}
        <div className="step-box">
          <h3 className="text-2xl font-semibold text-[#3e2723] mt-6 text-center">
            <i className="fas fa-phone-alt text-dark-brown mr-2"></i>
            Step 3: Define your contact details
          </h3>
          <p className="mt-2 text-lg text-[#3e2723] text-center">
            Provide your details to contact you and visit you.
          </p>
          <ContactUpload onSubmit={handleContactSubmit} />
          <div className="step-text">
            Define all your details to contact you easily!
          </div>
        </div>

        <button
          onClick={handleSubmit}
          className="mt-4 bg-dark-brown text-yellow-100 py-2 px-6 rounded-full items-center mx-auto block"
        >
          Let's get started!
        </button>
      </div>
    </div>
  );
};

export default MainPage;
