import React from 'react';

const GeneratedPost = ({ postText, image, onShare }) => {
  const renderPostWithButtons = (text) => {
    const parts = text.split(/(\[Button:.*?\])/g);
    return parts.map((part, index) => {
      const buttonMatch = part.match(/\[Button:(.*?)\]/);
      if (buttonMatch) {
        const buttonText = buttonMatch[1].trim();
        return (
          <button 
            key={index} 
            className="generate-post bg-white text-white px-4 py-2 rounded-full my-2 hover:bg-[#3e2723] transition-colors"
            onClick={() => alert(`Button clicked: ${buttonText}`)} 
          >
            {buttonText}
          </button>
        );
      }
      return part.split('\n').map((line, i) => <React.Fragment key={`${index}-${i}`}>{line}<br/></React.Fragment>);
    });
  };

  return (
    <div className="generated-post-card bg-[#D6C39A] p-4 rounded-lg shadow-lg mt-4 max-w-lg mx-auto">
      {/* Post Image */}
      {image && (
        <img src={image} alt="Post visual" className="w-full h-64 object-cover rounded-t-lg" />
      )}

      {/* Post Content */}
      <div className="p-4">
        <div className="text-dark-brown" style={{ whiteSpace: 'pre-wrap' }}>
          {renderPostWithButtons(postText)}
        </div>
      </div>

      {/* Share Buttons */}
      <div className="flex justify-end gap-3 p-4 border-t border-gray-200">
        <button 
          onClick={() => onShare('instagram')} 
          className="bg-[#D17076] text-white px-4 py-2 rounded-full hover:bg-[#D17076] transition-colors"
        >
          Share on Instagram
        </button>
        <button 
          onClick={() => onShare('twitter')} 
          className="bg-[#1DA1F2] text-white px-4 py-2 rounded-full hover:bg-[#1DA1F2] transition-colors"
        >
          Share on Twitter
        </button>
      </div>
    </div>
  );
};

export default GeneratedPost;
