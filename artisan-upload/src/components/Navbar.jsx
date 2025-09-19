import React from "react";

const Navbar = () => {
    return (
        <nav className="bg-dark-brown text-white p-4 fixed top-0 left-0 right-0 z-20">
            <div className="max-w-screen-xl mx-auto flex justify-start items-center pl-0">
                <h1 className="text-xl font-serif font-bold">Name_Of_Site</h1>
            </div>
        </nav>
    );
};

export default Navbar;

// max-w-screen-xl mx-auto : centers navbar horizontally
// fixed top-0 left-0 right-0 z-10 : make navbar fixed at top stays above