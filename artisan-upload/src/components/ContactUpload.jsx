import React,{useState} from "react";

const ContactUpload = ({ onSubmit }) => {
    const [artisanName,setArtisanName] = useState("");
    const [phoneNum,setPhoneNum] = useState("");
    const [email,setEmail] = useState("");
    const [shopAddress,setShopAddress] = useState("");

    const handleFormSubmit = (e) => {
        e.preventDefault();

        const artisanData = {
            artisanName,
            phoneNum,
            email,
            shopAddress,
        };

        onSubmit(artisanData);
        //reset form 
        // setArtisanName("");
        // setPhoneNum("");
        // setEmail("");
        // setShopAddress("");
    };

    return (
        <form onSubmit={handleFormSubmit} className="contact-form">
            <div className="mb-4">
                <label htmlFor="artisanName" className="block text-[#3e2723]">Artisan Name: </label>
                <input type="text" id="artisanName" value={artisanName} onChange={(e)=>setArtisanName(e.target.value)}
                        className="mt-2 p-2 w-[65%] border dashed border-[#3e2723] rounded bg-yellow-50" required/>
            </div>

            <div className="mb-4">
                <label htmlFor="phoneNum" className="block text-[#3e2723]"><i className="fas fa-phone-alt text-dark-brown mr-2"></i>Artisan Phone Number: </label>
                <input type="tel" id="phoneNum" value={phoneNum} onChange={(e)=>setPhoneNum(e.target.value)}
                        className="mt-2 p-2 w-[65%] border dashed border-[#3e2723] rounded bg-yellow-50" required/>
            </div>

            <div className="mb-4">
                <label htmlFor="email" className="block text-[#3e2723]"><i className="fas fa-envelope text-dark-brown mr-2"></i>Artisan Email: </label>
                <input type="email" id="email" value={email} onChange={(e)=>setEmail(e.target.value)}
                        className="mt-2 p-2 w-[75%] border dashed border-[#3e2723] rounded bg-yellow-50"/>
            </div>

            <div className="mb-4">
                <label htmlFor="shopAddress" className="block text-[#3e2723]">Artisan Shop Address: </label>
                <textarea id="shopAddress" value={shopAddress} onChange={(e)=>setShopAddress(e.target.value)} className="mt-2 p-2 w-full border dashed border-[#3e2723] rounded bg-yellow-50" rows="4" required />
            </div>

            <button type="submit" className="mt-4 bg-dark-brown text-yellow-100 py-2 px-6 rounded-full items-center mx-auto block"> Submit </button>
        </form>
    );
};

export default ContactUpload;