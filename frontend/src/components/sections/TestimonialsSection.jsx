import React from "react";
import { Star } from "lucide-react"; // Using lucide-react for the star icon

// Static Testimonial Data (kept the same for consistency)
const TESTIMONIALS = [
  {
    _id: "1",
    name: "Aarav Sharma",
    role: "UPSC Aspirant",
    quote:
      "The All-India Grand Tests were a game-changer. The ranking system is precise and showed me exactly where I stood. Highly recommended!",
    avatar: "https://placehold.co/100x100/1F2937/9CA3AF?text=AS",
  },
  {
    _id: "2",
    name: "Priya Singh",
    role: "Banking Aspirant",
    quote:
      "I love the category-wise mock tests. The quality of questions is top-notch, and the instant analysis helped me focus on my weak areas.",
    avatar: "https://placehold.co/100x100/1F2937/9CA3AF?text=PS",
  },
  {
    _id: "3",
    name: "Rohan Gupta",
    role: "SSC CGL Aspirant",
    quote:
      "A fantastic platform. The interface is clean, easy to use, and bug-free. The instructor support feature is a brilliant addition.",
    avatar: "https://placehold.co/100x100/1F2937/9CA3AF?text=RG",
  },
];

// Component
const TestimonialsSection = () => (
  <section id="testimonials" className="py-24 bg-gray-950 text-gray-100">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <h2 className="text-4xl font-extrabold text-center mb-16 text-cyan-400">
        What Our Users Say
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {TESTIMONIALS.map((item) => (
          <div
            key={item._id}
            className="bg-gray-900 p-8 rounded-xl shadow-2xl border border-gray-800 hover:border-indigo-500 transition duration-300"
          >
            <div className="flex mb-4">
              {Array(5).fill().map((_, i) => (
                <Star key={i} className="w-5 h-5 fill-yellow-400 text-yellow-400" />
              ))}
            </div>
            <p className="text-gray-300 italic mb-6 text-lg">"{item.quote}"</p>
            
            <div className="flex items-center">
              <img
                className="h-14 w-14 rounded-full object-cover border-2 border-cyan-400"
                src={item.avatar}
                alt={item.name}
                onError={(e) => { e.target.onerror = null; e.target.src = "https://placehold.co/100x100/1F2937/9CA3AF?text=PR"; }}
              />
              <div className="ml-4">
                <div className="text-base font-bold text-gray-100">{item.name}</div>
                <div className="text-sm text-cyan-400">{item.role}</div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  </section>
);

export default TestimonialsSection;