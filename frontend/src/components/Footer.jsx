// src/components/Footer.jsx
import React from "react";

const Footer = () => (
  <footer className="bg-gray-800 text-gray-300">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
        <div>
          <h3 className="text-lg font-semibold text-white mb-4">TestPrep</h3>
          <p className="text-sm">Your partner in exam preparation.</p>
        </div>
        <div>
          <h3 className="text-sm font-semibold text-gray-400 uppercase mb-4">Quick Links</h3>
          <ul className="space-y-2">
            <li><a href="#" className="hover:text-white">Home</a></li>
            <li><a href="#categories" className="hover:text-white">Categories</a></li>
            <li><a href="#mock-tests" className="hover:text-white">Mock Tests</a></li>
          </ul>
        </div>
        <div>
          <h3 className="text-sm font-semibold text-gray-400 uppercase mb-4">Support</h3>
          <ul className="space-y-2">
            <li><a href="#" className="hover:text-white">About Us</a></li>
            <li><a href="#" className="hover:text-white">Contact Us</a></li>
          </ul>
        </div>
        <div>
          <h3 className="text-sm font-semibold text-gray-400 uppercase mb-4">Legal</h3>
          <ul className="space-y-2">
            <li><a href="#" className="hover:text-white">Privacy Policy</a></li>
          </ul>
        </div>
      </div>
      <div className="mt-8 border-t border-gray-700 pt-8 text-center text-sm">
        <p>&copy; 2025 TestPrep. All rights reserved.</p>
      </div>
    </div>
  </footer>
);

export default Footer;
