import React, {useState} from "react";
import { useDropzone } from "react-dropzone";

const ImageUpload = ({ onImageUpload }) => {
    const [images, setImages] = useState([]);

    //handle the drop of imgs
    const onDrop = (acceptedFiles) => {
        const filePreviews = acceptedFiles.map((file) => URL.createObjectURL(file));
        setImages(filePreviews);
        onImageUpload(acceptedFiles);
    };

    const { getRootProps, getInputProps } = useDropzone({ onDrop, accept:'image/*'});

    return (
        <div className="mt-8">
            <div 
            {...getRootProps()} 
            className="border-2 border-dashed border-[#6b8e23] p-4 text-center cursor-pointer w-[500px] h-[135px] mx-auto">
                <input {...getInputProps()} />
                <p className="text-center text-xl text-cyan-800">Drag and Drop your images here or click to select files</p>
            </div>

            <div className="mt-4 text-center">
                <p className="text-lg text-[#3e2723] font-semibold">Your pieces:</p>

                <div className="flex justify-center flex-wrap mt-4">
                    {images.map((image, idx) => (
                        <div key={idx} className="w-32 h-32 mx-2 mb-4">
                        <img
                            src={image}
                            alt={`product-preview-${idx}`}
                            className="w-full h-full object-cover rounded-lg shadow-md"
                        />
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default ImageUpload;