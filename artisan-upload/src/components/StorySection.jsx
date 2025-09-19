import React from "react";

const StorySection = ({ storyTxt }) => {
  return (
    <section className="story-section relative p-12 bg-light-beige">
      {/* "Story" Title - Overlapping the Content Box on the Left */}
      <div className="story-title-container relative">
        <h1 className="story-title absolute left-0 top-1/4 transform translate-y-[-50%] text-6xl font-bold text-dark-brown text-shadow z-10 text-left">
          STORY
        </h1>
      </div>

      {/* Content Box for the Story */}
      <div className="story-container p-6 shadow-lg rounded-xl mt-12 relative z-0">
        <div className="story-content mt-6 text-lg text-[#3e2723]">
          <p>{storyTxt}</p>
        </div>
      </div>
    </section>
  );
};

export default StorySection;
