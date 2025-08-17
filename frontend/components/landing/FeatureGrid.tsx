"use client";

import { motion } from "framer-motion";
import { MdAnalytics, MdSecurity, MdGroups, MdRocketLaunch } from "react-icons/md";

const features = [
  {
    icon: <MdRocketLaunch className="w-6 h-6" />,
    title: "Fast Setup",
    description: "Spin up agendas, invite members, and start collaborating in minutes.",
  },
  {
    icon: <MdSecurity className="w-6 h-6" />,
    title: "Enterprise Security",
    description: "SSO, RBAC, and encrypted storage to keep sensitive boards safe.",
  },
  {
    icon: <MdGroups className="w-6 h-6" />,
    title: "Team Collaboration",
    description: "Comment, mention, and resolve threads directly in your agenda.",
  },
  {
    icon: <MdAnalytics className="w-6 h-6" />,
    title: "Smart Analytics",
    description: "AI-powered summaries, decisions tracking, and follow-up insights.",
  },
];

export default function FeatureGrid() {
  return (
    <section className="container mx-auto px-6 py-20">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.2 }}
        transition={{ duration: 0.6 }}
        className="text-center mb-14"
      >
        <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
          Everything you need for effective governance
        </h2>
        <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
          Built for modern organizations that value efficiency, transparency, and decisions.
        </p>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {features.map((f, i) => (
          <motion.div
            key={f.title}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: i * 0.05 }}
            whileHover={{ y: -4 }}
            className="group relative overflow-hidden rounded-xl border border-gray-200/70 dark:border-white/10 bg-white/70 dark:bg-white/5 backdrop-blur shadow-sm hover:shadow-lg transition-all"
          >
            <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity bg-gradient-to-br from-blue-500/5 to-purple-500/5" />
            <div className="relative p-6">
              <div className="inline-flex items-center justify-center rounded-lg bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 h-10 w-10 mb-4">
                {f.icon}
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">{f.title}</h3>
              <p className="text-sm text-gray-600 dark:text-gray-300">{f.description}</p>
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
