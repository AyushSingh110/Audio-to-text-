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
            className="bg-blue-500 text-white px-4 py-2 rounded-full my-2 hover:bg-blue-600 transition-colors"
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
    <div className="generated-post-card bg-white p-4 rounded-lg shadow-lg mt-4 max-w-lg mx-auto">
      {/* Post Image */}
      {image && (
        <img src={image} alt="Post visual" className="w-full h-64 object-cover rounded-t-lg" />
      )}

      {/* Post Content */}
      <div className="p-4">
        <div className="text-gray-800" style={{ whiteSpace: 'pre-wrap' }}>
          {renderPostWithButtons(postText)}
        </div>
      </div>

      {/* Share Buttons */}
      <div className="flex justify-end gap-3 p-4 border-t border-gray-200">
        <button 
          onClick={() => onShare('instagram')} 
          className="bg-pink-500 text-white px-4 py-2 rounded-full hover:bg-pink-600 transition-colors"
        >
          Share on Instagram
        </button>
        <button 
          onClick={() => onShare('twitter')} 
          className="bg-blue-400 text-white px-4 py-2 rounded-full hover:bg-blue-500 transition-colors"
        >
          Share on Twitter
        </button>
      </div>
    </div>
  );
};

export default GeneratedPost;
