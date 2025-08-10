import Link from "next/link";

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
  icon?: string;
  tone?: "brand" | "neutral";
}) {
  const isBrand = tone === "brand";

  return (
    <Link
      href={href}
      className={`
        group relative block p-6 rounded-xl border transition-all duration-200
        hover:scale-[1.02] hover:shadow-lg hover:-translate-y-1
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

      <div className="space-y-2">
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
            text-sm leading-relaxed
            ${isBrand
            ? "text-blue-700 dark:text-blue-300"
            : "text-gray-600 dark:text-gray-400"
          }
          `}>
            {description}
          </p>
        )}
      </div>
    </Link>
  );
}