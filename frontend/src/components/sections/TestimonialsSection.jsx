import React from "react";
import { IconStar } from "../../icons/Icons";

// ✅ Static Testimonial Data
const TESTIMONIALS = [
  {
    _id: "1",
    name: "Aarav Sharma",
    role: "UPSC Aspirant",
    quote:
      "The All-India Grand Tests were a game-changer. The ranking system is precise and showed me exactly where I stood. Highly recommended!",
    avatar: "https://placehold.co/100x100/E2E8F0/4A5568?text=AS",
  },
  {
    _id: "2",
    name: "Priya Singh",
    role: "Banking Aspirant",
    quote:
      "I love the category-wise mock tests. The quality of questions is top-notch, and the instant analysis helped me focus on my weak areas.",
    avatar: "https://placehold.co/100x100/E2E8F0/4A5568?text=PS",
  },
  {
    _id: "3",
    name: "Rohan Gupta",
    role: "SSC CGL Aspirant",
    quote:
      "A fantastic platform. The interface is clean, easy to use, and bug-free. The instructor support feature is a brilliant addition.",
    avatar: "https://placehold.co/100x100/E2E8F0/4A5568?text=RG",
  },
  {
    _id: "4",
    name: "Sneha Verma",
    role: "State PSC Candidate",
    quote:
      "The mock tests are very close to real exam standards. The detailed explanations helped me understand every concept clearly.",
    avatar: "https://placehold.co/100x100/E2E8F0/4A5568?text=SV",
  },
  {
    _id: "5",
    name: "Vikram Patel",
    role: "Railway Exam Aspirant",
    quote:
      "I was able to track my progress after every test. The dashboard and analytics are really helpful for serious preparation.",
    avatar: "https://placehold.co/100x100/E2E8F0/4A5568?text=VP",
  },
  {
    _id: "6",
    name: "Megha Rao",
    role: "Teaching Exam Aspirant",
    quote:
      "The platform helped me improve speed and accuracy. The Grand Tests gave a real-time competitive feel. Worth every penny!",
    avatar: "https://placehold.co/100x100/E2E8F0/4A5568?text=MR",
  },
];

// ✅ Component
const TestimonialsSection = () => (
  <section id="testimonials" className="py-16 bg-gray-50">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <h2 className="text-3xl font-extrabold text-gray-900 text-center mb-10">
        What Our Students Say
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {TESTIMONIALS.map((item) => (
          <div
            key={item._id}
            className="bg-white p-6 rounded-lg shadow-lg hover:shadow-xl transition-shadow duration-300"
          >
            <div className="flex items-center mb-4">
              <img
                className="h-14 w-14 rounded-full object-cover"
                src={item.avatar}
                alt={item.name}
              />
              <div className="ml-4">
                <div className="text-base font-bold text-gray-900">{item.name}</div>
                <div className="text-sm text-gray-600">{item.role}</div>
              </div>
            </div>
            <div className="flex mb-2">
              <IconStar />
              <IconStar />
              <IconStar />
              <IconStar />
              <IconStar />
            </div>
            <p className="text-gray-700 italic">"{item.quote}"</p>
          </div>
        ))}
      </div>
    </div>
  </section>
);

export default TestimonialsSection;


