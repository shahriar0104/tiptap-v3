"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";

type Testimonial = {
  name: string;
  title: string;
  company: string;
  quote: string;
};

const testimonials: Testimonial[] = [
  {
    name: "Amina Rahman",
    title: "Board Chair",
    company: "Nimbus Health",
    quote:
      "Boardsmith turned a 5-hour prep into 45 minutes. Agendas assemble themselves and minutes are ready when we adjourn.",
  },
  {
    name: "Daniel Ortega",
    title: "COO",
    company: "Horizon Capital",
    quote:
      "The AI assistance keeps us on-topic and action-oriented. Accountability for follow-ups improved immediately.",
  },
  {
    name: "Sofia Kim",
    title: "General Counsel",
    company: "Atlas Robotics",
    quote:
      "Role-based access and audit trails simplify our compliance checks. It’s fast without compromising control.",
  },
];

export default function Testimonials() {
  const [index, setIndex] = useState(0);

  // Auto-rotate every 5 seconds
  useEffect(() => {
    const id = setInterval(() => setIndex((i) => (i + 1) % testimonials.length), 5000);
    return () => clearInterval(id);
  }, []);

  return (
    <section className="container mx-auto px-6 py-16">
      <div className="text-center mb-10">
        <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white">What leaders say</h2>
        <p className="mt-2 text-gray-600 dark:text-gray-300">Real outcomes from real boardrooms</p>
      </div>

      <div className="relative mx-auto max-w-3xl">
        <AnimatePresence mode="wait">
          <motion.blockquote
            key={index}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.4 }}
            className="rounded-2xl border border-gray-200/70 dark:border-white/10 bg-white/70 dark:bg-white/5 backdrop-blur p-8 shadow-lg"
         >
            <p className="text-xl md:text-2xl text-gray-900 dark:text-white leading-relaxed">
              “{testimonials[index].quote}”
            </p>
            <footer className="mt-6 flex items-center gap-4">
              <div className="h-10 w-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 text-white flex items-center justify-center text-sm font-semibold">
                {initials(testimonials[index].name)}
              </div>
              <div>
                <div className="font-semibold text-gray-900 dark:text-white">
                  {testimonials[index].name}
                </div>
                <div className="text-sm text-gray-500 dark:text-gray-400">
                  {testimonials[index].title} • {testimonials[index].company}
                </div>
              </div>
            </footer>
          </motion.blockquote>
        </AnimatePresence>

        {/* Dots */}
        <div className="mt-6 flex justify-center gap-2">
          {testimonials.map((_, i) => (
            <button
              key={i}
              aria-label={`Go to testimonial ${i + 1}`}
              onClick={() => setIndex(i)}
              className={`h-2.5 w-2.5 rounded-full transition-all ${
                i === index
                  ? "bg-blue-600 w-6"
                  : "bg-gray-300 dark:bg-gray-600 hover:bg-gray-400 dark:hover:bg-gray-500"
              }`}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

function initials(name: string) {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}
