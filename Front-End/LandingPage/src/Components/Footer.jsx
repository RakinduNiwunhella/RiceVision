import React from "react";

const socialIcons = [
  {
    href: "https://www.linkedin.com/company/ricevision/about/",
    label: "LinkedIn",
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
        <path d="M4.98 3.5a2.48 2.48 0 1 1 0 4.96 2.48 2.48 0 0 1 0-4.96ZM3 8.98h3.96V21H3V8.98ZM9.02 8.98h3.8v1.64h.06c.53-1 1.83-2.06 3.77-2.06 4.03 0 4.77 2.65 4.77 6.1V21h-3.96v-5.6c0-1.34-.03-3.07-1.87-3.07-1.87 0-2.16 1.46-2.16 2.97V21H9.02V8.98Z" />
      </svg>
    ),
  },
  {
    href: "https://www.instagram.com/rice_vision/",
    label: "Instagram",
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
        <path d="M7 2C4.243 2 2 4.243 2 7v10c0 2.757 2.243 5 5 5h10c2.757 0 5-2.243 5-5V7c0-2.757-2.243-5-5-5H7Zm10 2a3 3 0 0 1 3 3v10a3 3 0 0 1-3 3H7a3 3 0 0 1-3-3V7a3 3 0 0 1 3-3h10Zm-5 3.5A4.5 4.5 0 1 0 16.5 12 4.505 4.505 0 0 0 12 7.5Zm0 7.5A3 3 0 1 1 15 12a3.003 3.003 0 0 1-3 3Zm4.75-7.75a1.25 1.25 0 1 0 1.25 1.25 1.251 1.251 0 0 0-1.25-1.25Z" />
      </svg>
    ),
  },
];

export default function Footer() {
  return (
<footer className="w-full bg-gray-50 dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800">      <div className="max-w-7xl mx-auto px-6 py-14 grid grid-cols-1 md:grid-cols-3 gap-10">
        <div>
          <h2 className="text-2xl font-semibold text-green-700 dark:text-green-400">
            RiceVision
          </h2>
          <p className="mt-4 text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
            Intelligent rice monitoring and analytics platform supporting
            sustainable agriculture through satellite-driven insights.
          </p>

          <div className="flex gap-4 mt-6">
            {socialIcons.map((item, idx) => (
              <a
                key={idx}
                href={item.href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={item.label}
                className="w-10 h-10 flex items-center justify-center rounded-full
                  border border-gray-300 dark:border-gray-700
                  text-gray-600 dark:text-gray-400
                  hover:text-white hover:bg-green-600
                  dark:hover:bg-green-500
                  transition"
              >
                {item.icon}
              </a>
            ))}
          </div>
        </div>

        <div>
          <h3 className="text-sm font-semibold uppercase tracking-wider text-gray-900 dark:text-gray-200 mb-4">
            Navigation
          </h3>
          <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
            <li><a href="#info" className="hover:text-green-600 transition">Home</a></li>
            <li><a href="#mission" className="hover:text-green-600 transition">Mission</a></li>
            <li><a href="#features" className="hover:text-green-600 transition">Features</a></li>
            <li><a href="#contact" className="hover:text-green-600 transition">Contact</a></li>
          </ul>
        </div>

        <div>
          <h3 className="text-sm font-semibold uppercase tracking-wider text-gray-900 dark:text-gray-200 mb-4">
            Contact Us!
          </h3>
          <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
            <li href="#" className="hover:text-green-600 transition">Email Us</li>
            <li className="hover:text-green-600 transition">ricevisionlanka@gmail.com</li>
          </ul>

          <button
            onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
            className="mt-6 text-sm font-medium text-green-700 dark:text-green-400 hover:underline"
          >
            Back to top ↑
          </button>
        </div>
      </div>

      <div className="border-t border-gray-200 dark:border-gray-800 py-4 text-center text-xs text-gray-500 dark:text-gray-400">
        © {new Date().getFullYear()} RiceVision. All rights reserved.
      </div>
    </footer>
  );
}