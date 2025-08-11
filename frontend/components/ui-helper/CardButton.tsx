"use client"

import Link from "next/link";
import { ReactNode } from "react";
import { motion } from "framer-motion";

export default function CardButton({
                                     href,
                                     title,
                                     description,
                                     icon,
                                     tone,
                                   }: {
  href: string;
  title: string;
  description?: string;
  icon?: string | ReactNode;
  tone?: "brand" | "neutral";
}) {
  const isBrand = tone === "brand";

  return (
    <Link href={href}>
      <motion.div
        initial={false} // avoid SSR/client mismatch
        whileHover={{ 
          scale: 1.02, 
          y: -8,
          transition: { 
            type: "spring", 
            stiffness: 400, 
            damping: 25,
            mass: 0.8
          }
        }}
        whileTap={{ 
          scale: 0.98,
          transition: { 
            type: "spring", 
            stiffness: 600, 
            damping: 30 
          }
        }}
        className={`
          group relative block p-6 rounded-xl border transform-gpu
          transition-all duration-200 ease-out hover:shadow-xl
          min-h-[180px] flex flex-col
          ${isBrand
          ? "bg-blue-50 border-blue-200 hover:border-blue-300 hover:bg-blue-100 dark:bg-blue-950/30 dark:border-blue-800 dark:hover:border-blue-700 dark:hover:bg-blue-900/40"
          : "bg-white border-gray-200 hover:border-gray-300 hover:bg-gray-50 dark:bg-gray-900 dark:border-gray-800 dark:hover:border-gray-700 dark:hover:bg-gray-800"
        }
        `}
    >
      <div className="flex items-start justify-between mb-4">
        {icon && (
          <div className={`
            flex items-center justify-center w-12 h-12 rounded-lg text-xl
            ${isBrand
            ? "bg-blue-600 text-white"
            : "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-300"
          }
          `}>
            {icon}
          </div>
        )}

        <div className={`
          opacity-0 group-hover:opacity-100 transition-opacity duration-200
          w-6 h-6 flex items-center justify-center rounded-full text-sm
          ${isBrand
          ? "text-blue-600 dark:text-blue-400"
          : "text-gray-400 dark:text-gray-500"
        }
        `}>
          →
        </div>
      </div>

      <div className="space-y-2 flex-1 flex flex-col">
        <h3 className={`
          font-semibold text-base
          ${isBrand
          ? "text-blue-900 dark:text-blue-100"
          : "text-gray-900 dark:text-gray-100"
        }
        `}>
          {title}
        </h3>
        {description && (
          <p className={`
            text-sm leading-relaxed flex-1
            ${isBrand
            ? "text-blue-700 dark:text-blue-300"
            : "text-gray-600 dark:text-gray-400"
          }
          `}>
            {description}
          </p>
        )}
      </div>
      </motion.div>
    </Link>
  );
}