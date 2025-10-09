"use client";

import Link from "next/link";
import {
  Package,
  TrendingUp,
  DollarSign,
  HelpCircle,
  Mail,
  FileText,
  Shield,
  Heart,
} from "lucide-react";

export default function UserFooter() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t border-white/10 mt-auto">
      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* Brand */}
          <div>
            <h3 className="text-xl font-bold text-white mb-4">Retrack</h3>
            <p className="text-gray-400 text-sm mb-4">
              The ultimate reselling management platform for tracking inventory,
              sales, and profits.
            </p>
            <div className="flex items-center gap-2 text-gray-400">
              <span className="text-sm">Made with</span>
              <Heart size={14} className="text-red-500 fill-red-500" />
              <span className="text-sm">for resellers</span>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-white font-semibold mb-4">Quick Links</h4>
            <ul className="space-y-2">
              <li>
                <Link
                  href="/dashboard/stock"
                  className="text-gray-400 hover:text-white transition-colors text-sm flex items-center gap-2"
                >
                  <Package size={14} />
                  Stock Manager
                </Link>
              </li>
              <li>
                <Link
                  href="/dashboard/sales"
                  className="text-gray-400 hover:text-white transition-colors text-sm flex items-center gap-2"
                >
                  <TrendingUp size={14} />
                  Sales History
                </Link>
              </li>
              <li>
                <Link
                  href="/dashboard/finance"
                  className="text-gray-400 hover:text-white transition-colors text-sm flex items-center gap-2"
                >
                  <DollarSign size={14} />
                  Financial Analytics
                </Link>
              </li>
              <li>
                <Link
                  href="/dashboard/settings"
                  className="text-gray-400 hover:text-white transition-colors text-sm flex items-center gap-2"
                >
                  <Package size={14} />
                  Settings
                </Link>
              </li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h4 className="text-white font-semibold mb-4">Support</h4>
            <ul className="space-y-2">
              <li>
                <Link
                  href="/support"
                  className="text-gray-400 hover:text-white transition-colors text-sm flex items-center gap-2"
                >
                  <HelpCircle size={14} />
                  Help Center
                </Link>
              </li>
              <li>
                <Link
                  href="/support#faq"
                  className="text-gray-400 hover:text-white transition-colors text-sm flex items-center gap-2"
                >
                  <FileText size={14} />
                  FAQs
                </Link>
              </li>
              <li>
                <a
                  href="mailto:support@retrack.com"
                  className="text-gray-400 hover:text-white transition-colors text-sm flex items-center gap-2"
                >
                  <Mail size={14} />
                  Contact Support
                </a>
              </li>
              <li>
                <Link
                  href="/docs"
                  className="text-gray-400 hover:text-white transition-colors text-sm flex items-center gap-2"
                >
                  <FileText size={14} />
                  Documentation
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h4 className="text-white font-semibold mb-4">Legal</h4>
            <ul className="space-y-2">
              <li>
                <Link
                  href="/privacy"
                  className="text-gray-400 hover:text-white transition-colors text-sm flex items-center gap-2"
                >
                  <Shield size={14} />
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link
                  href="/terms"
                  className="text-gray-400 hover:text-white transition-colors text-sm flex items-center gap-2"
                >
                  <FileText size={14} />
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link
                  href="/cookies"
                  className="text-gray-400 hover:text-white transition-colors text-sm"
                >
                  Cookie Policy
                </Link>
              </li>
              <li>
                <Link
                  href="/refund"
                  className="text-gray-400 hover:text-white transition-colors text-sm"
                >
                  Refund Policy
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-white/10">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="text-gray-400 text-sm">
              © {currentYear} Retrack. All rights reserved.
            </div>

            <div className="flex items-center gap-6 text-sm text-gray-400">
              <Link
                href="/status"
                className="hover:text-white transition-colors"
              >
                System Status
              </Link>
              <Link
                href="/changelog"
                className="hover:text-white transition-colors"
              >
                Changelog
              </Link>
              <Link href="/api" className="hover:text-white transition-colors">
                API
              </Link>
            </div>

            <div className="flex items-center gap-3">
              <a
                href="https://twitter.com/retrack"
                target="_blank"
                rel="noopener noreferrer"
                className="w-8 h-8 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 flex items-center justify-center transition-colors"
                aria-label="Twitter"
              >
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  className="text-gray-400"
                >
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                </svg>
              </a>
              <a
                href="https://facebook.com/retrack"
                target="_blank"
                rel="noopener noreferrer"
                className="w-8 h-8 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 flex items-center justify-center transition-colors"
                aria-label="Facebook"
              >
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  className="text-gray-400"
                >
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                </svg>
              </a>
              <a
                href="https://instagram.com/retrack"
                target="_blank"
                rel="noopener noreferrer"
                className="w-8 h-8 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 flex items-center justify-center transition-colors"
                aria-label="Instagram"
              >
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  className="text-gray-400"
                >
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                </svg>
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
