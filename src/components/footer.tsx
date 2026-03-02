"use client";

import Link from "next/link";
import { Github, Linkedin, Globe } from "lucide-react";

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800">
      <div className="max-w-6xl mx-auto px-4 py-6">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="text-center md:text-left">
            <p className="text-gray-600 dark:text-gray-400">
              Created by{" "}
              <Link
                href="https://github.com/diegoperea20"
                className="text-blue-600 dark:text-blue-400 hover:underline"
                target="_blank"
                rel="noopener noreferrer"
              >
                Diego Ivan Perea Montealegre
              </Link>
            </p>
            <p className="text-gray-500 dark:text-gray-500 text-sm mt-1">
              © {currentYear} Youtube Tag Extractor D. All rights reserved.
            </p>
          </div>

          <div className="flex space-x-4">
             <Link
              href="https://github.com/diegoperea20/YouTube-Tag-Extractor-D"
              className="text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="GitHub Profile"
            >
              <Github className="w-5 h-5" />
            </Link>
            <Link
              href="https://github.com/diegoperea20/"
              className="text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="GitHub Profile"
            >
              <Github className="w-5 h-5" />
            </Link>
            <Link
              href="https://www.linkedin.com/in/diego-perea-montealegre"
              className="text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="LinkedIn Profile"
            >
              <Linkedin className="w-5 h-5" />
            </Link>
            <Link
              href="https://diegoperea20.github.io/diego-ivan-perea-montealegre-cv/"
              className="text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Website Profile"
            >
              <Globe className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;