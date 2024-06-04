import React from 'react';

const Footer = () => {
    return (
        <footer className="bg-gray-900 text-gray-300 py-8 mt-32">
            <div className="container mx-auto flex flex-wrap justify-between">
                {/* About Section */}
                <div className="footer-section">
                    <h3 className="footer-heading">ABOUT</h3>
                    <ul className="footer-list">
                        <li>Terms & Conditions</li>
                        <li>Privacy Policy</li>
                        <li>Copyrights</li>
                        <li>About us</li>
                        <li>Events</li>
                        <li>Careers</li>
                    </ul>
                </div>

                {/* Customer Service Section */}
                <div className="footer-section">
                    <h3 className="footer-heading">CUSTOMER SERVICE</h3>
                    <ul className="footer-list">
                        <li>How it works</li>
                        <li>Why Partner with us?</li>
                        <li>Contact us</li>
                        <li>FAQs</li>
                        <li>Video Tutorials</li>
                        <li>Broker Academy</li>
                        <li>Popular Searches</li>
                    </ul>
                </div>

                {/* Other Info Section */}
                <div className="footer-section">
                    <h3 className="footer-heading">OTHER INFO</h3>
                    <ul className="footer-list">
                        <li>Trends</li>
                        <li>Press</li>
                        <li>Lamudi Scholarship</li>
                        <li>Success Stories</li>
                        <li>The Outlook Awards</li>
                        <li>Broker Awards</li>
                        <li>City Insider</li>
                    </ul>
                </div>

                {/* Contact Information */}
                <div className="footer-section">
                    <h3 className="footer-heading">CONTACT</h3>
                    <p className="mb-2">
                        FACEBOOK MESSENGER: <a href="https://www.messenger.com/t/Wherehouse" className="underline hover:text-white hover:underline">Wherehouse</a>
                    </p>
                    <p className="mb-2">
                        EMAIL: <a href="mailto:wherehouse@gmail.com" className="underline hover:text-white hover:underline">wherehouse@gmail.com</a>
                    </p>
                    <p>OFFICE: 226 Sitio Toto Cupang Proper Balanga City Bataan.</p>
                </div>
            </div>

            {/* Copyright */}
            <div className="mt-8 text-center">
                <p>© 2023 Wherehouse Philippines Inc. All rights reserved. Material may not be published or reproduced in any form without prior written permission.</p>
            </div>
        </footer>
    );
};

export default Footer;
