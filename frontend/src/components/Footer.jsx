import React from "react";

const Footer = () => (
  <footer className="bg-black text-gray-400 border-t border-gray-800">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
        <div>
          <h3 className="text-xl font-bold text-cyan-400 mb-4">EXAM<span className="text-gray-100">PRO</span></h3>
          <p className="text-sm">Your partner in exam preparation, driven by A.I.</p>
        </div>
        <div>
          <h3 className="text-sm font-semibold text-gray-400 uppercase mb-4">Quick Links</h3>
          <ul className="space-y-2">
            <li><a href="#" className="hover:text-white transition">Tests</a></li>
            <li><a href="#categories" className="hover:text-white transition">Categories</a></li>
            <li><a href="#mock-tests" className="hover:text-white transition">Featured Tests</a></li>
          </ul>
        </div>
        <div>
          <h3 className="text-sm font-semibold text-gray-400 uppercase mb-4">Support</h3>
          <ul className="space-y-2">
            <li><a href="#" className="hover:text-white transition">About Us</a></li>
            <li><a href="#" className="hover:text-white transition">Contact Support</a></li>
          </ul>
        </div>
        <div>
          <h3 className="text-sm font-semibold text-gray-400 uppercase mb-4">Legal</h3>
          <ul className="space-y-2">
            <li><a href="#" className="hover:text-white transition">Privacy Policy</a></li>
            <li><a href="#" className="hover:text-white transition">Terms of Service</a></li>
          </ul>
        </div>
      </div>
      <div className="mt-12 border-t border-gray-700 pt-8 text-center text-sm">
        <p>&copy; 2025 ExamPro. All rights reserved. Future-ready testing environment.</p>
      </div>
    </div>
  </footer>
);

export default Footer;