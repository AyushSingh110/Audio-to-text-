import React from "react";

const ContactSection = ({ artisanName, phoneNum, email, shopAddress }) => {
  return (
    <section className="contact-section">
      <h2 className="contact-title">Meet the Artisan</h2>
      <div className="contact-container">
        <div className="contact-row">
          <div className="contact-item">
            <h2 className="contact-label">Name:</h2>
            <span className="contact-info">{artisanName}</span>
          </div>
          <div className="contact-item">
            <h2 className="contact-label">Phone:</h2>
            <span className="contact-info">{phoneNum}</span>
          </div>
          <div className="contact-item">
            <h2 className="contact-label">Email:</h2>
            <span className="contact-info">{email}</span>
          </div>
        </div>

        <div className="address-wrapper">
          <h2 className="address-label">Shop Address:</h2>
          <p className="address-info">{shopAddress}</p>
        </div>
      </div>
    </section>
  );
};

export default ContactSection;