"use client";

import Link from "next/link";
import {
  ArrowRight,
  Package,
  TrendingUp,
  BarChart3,
  Shield,
  Zap,
  Users,
} from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden px-6 py-20 lg:py-32">
        <div className="relative max-w-6xl mx-auto">
          <div className="text-center space-y-8">
            <div className="inline-block px-4 py-1.5 rounded-full bg-white/10 border border-white/20 text-white text-sm font-medium mb-4">
              🚀 Your Complete Reselling Platform
            </div>

            <h1 className="text-5xl lg:text-7xl font-bold text-white leading-tight">
              Manage Your <br />
              <span className="text-white">Reselling Business</span>
            </h1>

            <p className="text-xl text-gray-400 max-w-2xl mx-auto leading-relaxed">
              Track inventory, record sales, analyze profits, and grow your
              business with powerful analytics. Everything you need in one
              place.
            </p>

            <div className="flex items-center justify-center gap-4 pt-4">
              <Link
                href="/register"
                className="group flex items-center gap-2 px-8 py-4 bg-white text-black hover:bg-gray-200 rounded-xl font-semibold transition-colors"
              >
                Get Started Free
                <ArrowRight size={20} />
              </Link>
              <Link
                href="/login"
                className="px-8 py-4 bg-white/5 border border-white/10 hover:bg-white/10 rounded-xl font-semibold text-white transition-colors"
              >
                Sign In
              </Link>
            </div>

            <div className="flex items-center justify-center gap-8 pt-8 text-sm text-gray-500">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-emerald-500" />
                No credit card required
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-blue-500" />
                Free forever plan
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="px-6 py-20">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-white mb-4">
              Everything You Need
            </h2>
            <p className="text-xl text-gray-400">
              Powerful features to manage your reselling business
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Feature 1 */}
            <div className="bg-white/5 border border-white/10 rounded-2xl p-8 hover:border-white/20 transition-colors">
              <div className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center mb-6">
                <Package size={24} className="text-white" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-3">
                Stock Management
              </h3>
              <p className="text-gray-400 leading-relaxed">
                Track all your inventory in one place. Add products with images,
                set prices, and manage suppliers effortlessly.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="bg-white/5 border border-white/10 rounded-2xl p-8 hover:border-white/20 transition-colors">
              <div className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center mb-6">
                <TrendingUp size={24} className="text-white" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-3">
                Sales Tracking
              </h3>
              <p className="text-gray-400 leading-relaxed">
                Record every sale with detailed information. Track profits,
                margins, and ROI automatically for each transaction.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="bg-white/5 border border-white/10 rounded-2xl p-8 hover:border-white/20 transition-colors">
              <div className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center mb-6">
                <BarChart3 size={24} className="text-white" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-3">
                Analytics Dashboard
              </h3>
              <p className="text-gray-400 leading-relaxed">
                Get insights into your business with comprehensive analytics.
                Track trends, profits, and make data-driven decisions.
              </p>
            </div>

            {/* Feature 4 */}
            <div className="bg-white/5 border border-white/10 rounded-2xl p-8 hover:border-white/20 transition-colors">
              <div className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center mb-6">
                <Zap size={24} className="text-white" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-3">
                Lightning Fast
              </h3>
              <p className="text-gray-400 leading-relaxed">
                Built for speed and efficiency. Add products, record sales, and
                view reports in seconds, not minutes.
              </p>
            </div>

            {/* Feature 5 */}
            <div className="bg-white/5 border border-white/10 rounded-2xl p-8 hover:border-white/20 transition-colors">
              <div className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center mb-6">
                <Shield size={24} className="text-white" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-3">
                Secure & Private
              </h3>
              <p className="text-gray-400 leading-relaxed">
                Your data is encrypted and secure. We take privacy seriously and
                never share your information with third parties.
              </p>
            </div>

            {/* Feature 6 */}
            <div className="bg-white/5 border border-white/10 rounded-2xl p-8 hover:border-white/20 transition-colors">
              <div className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center mb-6">
                <Users size={24} className="text-white" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-3">
                Multi-Platform
              </h3>
              <p className="text-gray-400 leading-relaxed">
                Track sales across multiple platforms like Vinted, OLX, eBay,
                and more. All your data in one centralized place.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="px-6 py-20">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-white mb-4">How It Works</h2>
            <p className="text-xl text-gray-400">
              Get started in three simple steps
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white/5 border border-white/10 rounded-2xl p-8 text-center space-y-4">
              <div className="w-16 h-16 rounded-full bg-white/10 border border-white/20 flex items-center justify-center text-2xl font-bold text-white mx-auto">
                1
              </div>
              <h3 className="text-xl font-semibold text-white">
                Add Your Products
              </h3>
              <p className="text-gray-400">
                Upload your inventory with photos, prices, and details. Organize
                by supplier, condition, and tags.
              </p>
            </div>

            <div className="bg-white/5 border border-white/10 rounded-2xl p-8 text-center space-y-4">
              <div className="w-16 h-16 rounded-full bg-white/10 border border-white/20 flex items-center justify-center text-2xl font-bold text-white mx-auto">
                2
              </div>
              <h3 className="text-xl font-semibold text-white">Record Sales</h3>
              <p className="text-gray-400">
                When you sell an item, record the sale with platform, price, and
                fees. Profit is calculated automatically.
              </p>
            </div>

            <div className="bg-white/5 border border-white/10 rounded-2xl p-8 text-center space-y-4">
              <div className="w-16 h-16 rounded-full bg-white/10 border border-white/20 flex items-center justify-center text-2xl font-bold text-white mx-auto">
                3
              </div>
              <h3 className="text-xl font-semibold text-white">
                Analyze & Grow
              </h3>
              <p className="text-gray-400">
                View detailed analytics about your profits, best-selling items,
                and trends to grow your business.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="px-6 py-20">
        <div className="max-w-6xl mx-auto">
          <div className="bg-white/5 border border-white/10 rounded-2xl p-12">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
              <div>
                <div className="text-5xl font-bold text-white mb-2">10k+</div>
                <div className="text-gray-400">Products Tracked</div>
              </div>
              <div>
                <div className="text-5xl font-bold text-white mb-2">5k+</div>
                <div className="text-gray-400">Sales Recorded</div>
              </div>
              <div>
                <div className="text-5xl font-bold text-white mb-2">$500k+</div>
                <div className="text-gray-400">Revenue Managed</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="px-6 py-20">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white/5 border border-white/10 rounded-2xl p-12 text-center">
            <h2 className="text-4xl font-bold text-white mb-4">
              Ready to Grow Your Business?
            </h2>
            <p className="text-xl text-gray-400 mb-8 max-w-2xl mx-auto">
              Join thousands of resellers who are already using Retrack to
              manage their inventory and maximize profits.
            </p>
            <Link
              href="/register"
              className="group inline-flex items-center gap-2 px-8 py-4 bg-white text-black hover:bg-gray-200 rounded-xl font-semibold transition-colors"
            >
              Start Free Today
              <ArrowRight size={20} />
            </Link>
            <p className="text-sm text-gray-500 mt-4">
              No credit card required • Free forever plan • Cancel anytime
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/10 px-6 py-12">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="text-gray-400 text-sm">
              © 2024 Retrack. All rights reserved.
            </div>
            <div className="flex items-center gap-6 text-sm text-gray-400">
              <Link href="#" className="hover:text-white transition-colors">
                Privacy Policy
              </Link>
              <Link href="#" className="hover:text-white transition-colors">
                Terms of Service
              </Link>
              <Link href="#" className="hover:text-white transition-colors">
                Contact
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
