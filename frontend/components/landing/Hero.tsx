"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { MdArrowForward, MdAutoFixHigh, MdFormatBold, MdFormatItalic, MdFormatListBulleted, MdSave } from "react-icons/md";
import { useEffect, useMemo, useState } from "react";

function Typewriter({
  phrases,
  className,
  typingSpeed = 85,
  deletingSpeed = 40,
  pauseMs = 900,
}: {
  phrases: string[];
  className?: string;
  typingSpeed?: number;
  deletingSpeed?: number;
  pauseMs?: number;
}) {
  const [index, setIndex] = useState(0);
  const [text, setText] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    const full = phrases[index];
    const speed = isDeleting ? deletingSpeed : typingSpeed;

    if (!isDeleting && text === full) {
      const t = setTimeout(() => setIsDeleting(true), pauseMs);
      return () => clearTimeout(t);
    }
    if (isDeleting && text === "") {
      setIsDeleting(false);
      setIndex((i) => (i + 1) % phrases.length);
      return;
    }

    const t = setTimeout(() => {
      const next = isDeleting ? full.slice(0, text.length - 1) : full.slice(0, text.length + 1);
      setText(next);
    }, speed);
    return () => clearTimeout(t);
  }, [text, isDeleting, index, phrases, typingSpeed, deletingSpeed, pauseMs]);

  return (
    <span
      className={className}
      style={{
        display: "inline-block",
        minWidth: `${useMemo(() => Math.max(...phrases.map((p) => p.length)), [phrases])}ch`,
        whiteSpace: "nowrap",
      }}
    >
      {text}
      <span className="inline-block w-[1ch] -ml-[1ch] animate-pulse">|</span>
    </span>
  );
}

export default function Hero() {
  return (
    <section className="relative overflow-hidden">
      {/* Background mesh */}
      <div aria-hidden className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute -top-24 -left-24 h-80 w-80 rounded-full bg-blue-500/20 blur-3xl" />
        <div className="absolute -bottom-24 -right-24 h-80 w-80 rounded-full bg-purple-500/20 blur-3xl" />
      </div>

      <div className="container mx-auto px-6 py-20 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
        {/* Left copy */}
        <div>
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
            className="text-5xl md:text-6xl font-bold text-gray-900 dark:text-white mb-6"
          >
            Lead sharper board meetings with
            {" "}
            <Typewriter
              phrases={["AI assistance", "smart agendas", "auto minutes"]}
              className="text-blue-600"
            />
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.1 }}
            className="text-xl text-gray-600 dark:text-gray-300 mb-8 max-w-xl"
          >
            Build agendas in minutes, capture decisions, assign action items, and publish minutes automatically — all in one place.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="flex flex-wrap items-center gap-4 font-subheading"
          >
            <Link
              href="/auth/register"
              className="inline-flex items-center px-8 py-4 bg-blue-600 text-white text-lg font-semibold rounded-lg hover:bg-blue-700 transition-colors"
            >
              Start Free Trial
              <MdArrowForward className="ml-2 w-5 h-5" />
            </Link>
            <Link
              href="/auth/login"
              className="inline-flex items-center px-8 py-4 border-2 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 text-lg font-semibold rounded-lg hover:border-gray-400 dark:hover:border-gray-500 transition-colors"
            >
              Sign In
            </Link>
          </motion.div>
        </div>

        {/* Right mock */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.15 }}
          className="relative"
        >
          <LiveMock />
        </motion.div>
      </div>
    </section>
  );
}

function LiveMock() {
  // Progressive reveal to mimic AI drafting content
  const [step, setStep] = useState(0);
  useEffect(() => {
    const delay = step < 6 ? 1200 : 2000; // pause a bit when fully drafted, then loop
    const t = setTimeout(() => setStep(step < 6 ? step + 1 : 0), delay);
    return () => clearTimeout(t);
  }, [step]);

  const dots = '.'.repeat((step % 3) + 1);

  return (
    <>
      <div className="mx-auto max-w-xl w-full h-[580px] rounded-2xl border border-gray-200/70 dark:border-white/10 bg-white/70 dark:bg-white/5 backdrop-blur shadow-xl flex flex-col">
        {/* Title bar */}
        <div className="flex items-center gap-2 px-4 py-3 border-b border-gray-200/70 dark:border-white/10">
          <span className="h-3 w-3 rounded-full bg-red-400" />
          <span className="h-3 w-3 rounded-full bg-yellow-400" />
          <span className="h-3 w-3 rounded-full bg-green-400" />
          <span className="ml-2 text-sm text-gray-500 dark:text-gray-400">Annual Board Meeting 2025</span>
        </div>
        {/* Toolbar mock */}
        <div className="flex items-center gap-2 px-4 py-3 border-b border-gray-200/60 dark:border-white/10">
          <button className="inline-flex items-center gap-2 px-3 py-1.5 text-sm rounded-md bg-blue-600 text-white hover:bg-blue-700 transition-colors">
            <MdAutoFixHigh className="w-4 h-4" /> Compose with AI
          </button>
          <div className="flex items-center gap-1 ml-2">
            <button className="h-8 w-8 grid place-items-center rounded bg-gray-100 dark:bg-white/10"><MdFormatBold className="w-4 h-4" /></button>
            <button className="h-8 w-8 grid place-items-center rounded bg-gray-100 dark:bg-white/10"><MdFormatItalic className="w-4 h-4" /></button>
            <button className="h-8 w-8 grid place-items-center rounded bg-gray-100 dark:bg-white/10"><MdFormatListBulleted className="w-4 h-4" /></button>
          </div>
          <button className="ml-auto inline-flex items-center gap-2 px-3 py-1.5 text-sm rounded-md border border-gray-200/70 dark:border-white/10 text-gray-700 dark:text-gray-300">
            <MdSave className="w-4 h-4" /> Save draft
          </button>
        </div>
        {/* Content mock */}
        <div className="p-6 space-y-5 flex-1 overflow-hidden">
          {/* Title */}
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Annual Board Meeting — Final Agenda</h3>

          {/* AI drafting banner */}
          <div className="inline-flex items-center gap-2 text-xs px-2 py-1 rounded-md bg-blue-50 text-blue-700 dark:bg-blue-500/10 dark:text-blue-300">
            <MdAutoFixHigh className="w-3.5 h-3.5" /> AI is drafting{dots}
          </div>

          {/* Executive Summary */}
          <div>
            <div className="text-xs uppercase tracking-wider text-gray-500 dark:text-gray-400">Executive Summary</div>
            {step >= 1 ? (
              <motion.p initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} className="mt-2 text-sm text-gray-700 dark:text-gray-300">
                We will prioritize profitable segments, accelerate the enterprise funnel, and rebalance spend to protect gross margin while funding AI-driven workflow gains.
              </motion.p>
            ) : (
              <div className="mt-2 h-5 w-3/4 rounded bg-gray-100 dark:bg-white/10" />
            )}
          </div>

          {/* Recommendations */}
          <div>
            <div className="text-xs uppercase tracking-wider text-gray-500 dark:text-gray-400">Recommendations</div>
            <ul className="mt-2 space-y-2 text-sm text-gray-700 dark:text-gray-300">
              <motion.li initial={{ opacity: 0, y: 6 }} animate={{ opacity: step >= 2 ? 1 : 0, y: step >= 2 ? 0 : 6 }} transition={{ duration: 0.35 }}>
                Focus sales capacity on top 20 enterprise accounts; target 3 new multi-year commitments.
              </motion.li>
              <motion.li initial={{ opacity: 0, y: 6 }} animate={{ opacity: step >= 3 ? 1 : 0, y: step >= 3 ? 0 : 6 }} transition={{ duration: 0.35, delay: 0.05 }}>
                Freeze low-ROI channels; redirect $400k to adoption programs and enterprise POCs.
              </motion.li>
              <motion.li initial={{ opacity: 0, y: 6 }} animate={{ opacity: step >= 4 ? 1 : 0, y: step >= 4 ? 0 : 6 }} transition={{ duration: 0.35, delay: 0.1 }}>
                Roll out AI draft minutes and action extraction to all committees in Q3.
              </motion.li>
            </ul>
          </div>

          {/* Supporting Details */}
          <div>
            <div className="text-xs uppercase tracking-wider text-gray-500 dark:text-gray-400">Supporting Details</div>
            <ul className="mt-2 space-y-2 text-sm text-gray-700 dark:text-gray-300">
              <motion.li initial={{ opacity: 0, y: 6 }} animate={{ opacity: step >= 5 ? 1 : 0, y: step >= 5 ? 0 : 6 }} transition={{ duration: 0.35 }}>
                Pipeline health: Enterprise up 28% QoQ; SMB flat. Gross margin at 72% with infra optimizations.
              </motion.li>
              <motion.li initial={{ opacity: 0, y: 6 }} animate={{ opacity: step >= 6 ? 1 : 0, y: step >= 6 ? 0 : 6 }} transition={{ duration: 0.35, delay: 0.05 }}>
                Risks: Elongated security reviews; mitigation via shared controls library and templates.
              </motion.li>
            </ul>
          </div>
        </div>
      </div>
      {/* Glow */}
      <div className="pointer-events-none absolute -inset-x-10 -bottom-10 h-24 bg-gradient-to-t from-blue-500/20 to-transparent blur-2xl" />
    </>
  );
}
