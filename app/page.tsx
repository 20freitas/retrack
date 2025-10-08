"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import {
  ArrowRight,
  Package,
  TrendingUp,
  BarChart3,
  Shield,
  Zap,
  Users,
  CheckCircle2,
  Star,
  DollarSign,
  LineChart,
  ShoppingBag,
  FileText,
  Filter,
  Search,
  Upload,
  Tag,
  Calendar,
  Sparkles,
  Crown,
  Check,
  X,
  Edit,
  Trash2,
  MoreVertical,
  Plus,
} from "lucide-react";

// Mock data for demos
const mockProducts = [
  { id: 1, name: "Vintage Nike Sneakers", price: 89.99, stock: 3, category: "Footwear", image: "👟" },
  { id: 2, name: "Designer Handbag", price: 159.99, stock: 1, category: "Accessories", image: "👜" },
  { id: 3, name: "Leather Jacket", price: 129.99, stock: 2, category: "Clothing", image: "🧥" },
];

const mockSales = [
  { id: 1, product: "Vintage Nike Sneakers", platform: "Vinted", profit: 45.50, date: "2025-10-05", status: "completed" },
  { id: 2, product: "Designer Handbag", platform: "eBay", profit: 89.99, date: "2025-10-04", status: "completed" },
  { id: 3, product: "Leather Jacket", platform: "OLX", profit: 67.30, date: "2025-10-03", status: "pending" },
];

export default function Home() {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden px-6 py-20 lg:py-32">
        <div className="relative max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Left Side - Text Content */}
            <div className="space-y-8">
              <div className="inline-block px-4 py-1.5 rounded-full bg-white/10 border border-white/20 text-white text-sm font-medium">
                🚀 Your Complete Reselling Platform
              </div>

              <h1 className="text-5xl lg:text-6xl font-bold text-white leading-tight">
                Manage Your <br />
                <span className="text-white">Reselling Business</span>
              </h1>

              <p className="text-xl text-gray-400 leading-relaxed">
                Track inventory, record sales, analyze profits, and grow your
                business with powerful analytics. Everything you need in one
                place.
              </p>

              <div className="flex items-center gap-4 pt-4">
                <Link
                  href="/register"
                  className="group flex items-center gap-2 px-8 py-4 bg-white text-black hover:bg-gray-200 rounded-xl font-semibold transition-colors"
                >
                  Get Started
                  <ArrowRight size={20} />
                </Link>
                <Link
                  href="/login"
                  className="px-8 py-4 bg-white/5 border border-white/10 hover:bg-white/10 rounded-xl font-semibold text-white transition-colors"
                >
                  Sign In
                </Link>
              </div>

              <div className="flex items-center gap-8 pt-4 text-sm text-gray-500">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-emerald-500" />
                  Get started in minutes
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-blue-500" />
                  Cancel anytime
                </div>
              </div>
            </div>

            {/* Right Side - Simple Dashboard Preview */}
            <div className="relative">
              <div className="bg-white rounded-2xl shadow-xl border border-gray-200 p-6 overflow-hidden">
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-semibold text-gray-900">Dashboard</h3>
                  <div className="flex items-center gap-2 text-sm text-emerald-600 font-medium">
                    <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
                    Live
                  </div>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-3 gap-4 mb-6">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-gray-900">€2.8k</div>
                    <div className="text-xs text-gray-500 mt-1">Revenue</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-gray-900">127</div>
                    <div className="text-xs text-gray-500 mt-1">Sales</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-gray-900">€22</div>
                    <div className="text-xs text-gray-500 mt-1">Avg. Sale</div>
                  </div>
                </div>

                {/* Simple Bar Chart */}
                <div className="mb-6">
                  <div className="text-xs text-gray-500 mb-3 font-medium">Last 7 days</div>
                  <div className="flex items-end justify-between gap-2 h-32">
                    {[45, 70, 50, 85, 65, 95, 80].map((height, idx) => (
                      <div key={idx} className="flex-1 bg-gray-900 rounded-t hover:bg-gray-700 transition-colors" style={{ height: `${height}%` }}></div>
                    ))}
                  </div>
                </div>

                {/* Recent Activity */}
                <div>
                  <div className="text-xs text-gray-500 mb-3 font-medium">Recent sales</div>
                  <div className="space-y-2">
                    {[
                      { platform: 'Vinted', amount: '€24.99', status: 'completed' },
                      { platform: 'eBay', amount: '€18.50', status: 'completed' },
                      { platform: 'Facebook', amount: '€32.00', status: 'completed' },
                    ].map((sale, idx) => (
                      <div key={idx} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
                        <span className="text-sm text-gray-600">{sale.platform}</span>
                        <span className="text-sm font-semibold text-gray-900">{sale.amount}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Platform Logos */}
      <section className="px-6 py-12">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-center text-4xl font-bold text-white mb-12">
            Works With All Major Platforms
          </h2>
          <div className="flex gap-8 justify-center items-center">
            <div className="flex items-center justify-center w-[250px] h-32">
              <Image
                src="/logos/vinted.png"
                alt="Vinted"
                width={200}
                height={80}
                className="h-20 w-auto object-contain"
              />
            </div>

            <div className="flex items-center justify-center w-[250px] h-32">
              <Image
                src="/logos/olx.png"
                alt="OLX"
                width={200}
                height={80}
                className="h-20 w-auto object-contain"
              />
            </div>

            <div className="flex items-center justify-center w-[250px] h-32">
              <Image
                src="/logos/facebook.png"
                alt="Facebook Marketplace"
                width={200}
                height={80}
                className="h-20 w-auto object-contain"
              />
            </div>

            <div className="flex items-center justify-center w-[250px] h-32">
              <Image
                src="/logos/ebay.png"
                alt="eBay"
                width={200}
                height={80}
                className="h-20 w-auto object-contain"
              />
            </div>

            <div className="flex items-center justify-center w-[250px] h-32">
              <Image
                src="/logos/wallapop.png"
                alt="Wallapop"
                width={200}
                height={80}
                className="h-20 w-auto object-contain"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Screenshots Section */}
      <section className="px-6 py-20">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-white mb-4">
              See It In Action
            </h2>
            <p className="text-xl text-gray-400">
              A powerful dashboard designed for resellers
            </p>
          </div>

          <div className="space-y-16">
            {/* Screenshot 1 - Stock Manager */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <div className="order-2 lg:order-1 space-y-6">
                <div className="inline-block px-4 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/30 text-blue-300 text-sm font-medium">
                  Stock Management
                </div>
                <h3 className="text-3xl font-bold text-white">
                  Organize Your Inventory Effortlessly
                </h3>
                <p className="text-lg text-gray-400 leading-relaxed">
                  Add products with images, track purchase prices, manage
                  suppliers, and filter by status. Everything you need to stay
                  organized.
                </p>
                <ul className="space-y-3">
                  <li className="flex items-start gap-3">
                    <CheckCircle2 size={20} className="text-blue-400 mt-0.5 flex-shrink-0" />
                    <span className="text-gray-300">
                      Multiple product images with easy upload
                    </span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle2 size={20} className="text-blue-400 mt-0.5 flex-shrink-0" />
                    <span className="text-gray-300">
                      Advanced filters and search functionality
                    </span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle2 size={20} className="text-blue-400 mt-0.5 flex-shrink-0" />
                    <span className="text-gray-300">
                      Track suppliers and product conditions
                    </span>
                  </li>
                </ul>
              </div>
              <div className="order-1 lg:order-2">
                <div className="relative rounded-2xl border border-white/10 overflow-hidden bg-gradient-to-br from-gray-900 to-gray-950 backdrop-blur hover:border-white/20 transition-all duration-300">
                  {/* Stock Manager Demo */}
                  <div className="p-6 space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="text-xl font-bold text-white">Stock Manager</h3>
                      <div className="flex gap-2">
                        <button className="px-3 py-1.5 bg-blue-500/20 text-blue-300 rounded-lg text-sm hover:bg-blue-500/30 transition-colors">
                          <Plus size={16} className="inline mr-1" />
                          Add Product
                        </button>
                      </div>
                    </div>
                    
                    <div className="flex gap-2">
                      <div className="flex-1 relative">
                        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                        <input 
                          type="text" 
                          placeholder="Search products..."
                          className="w-full pl-10 pr-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 text-sm"
                          disabled
                        />
                      </div>
                      <button className="px-3 py-2 bg-white/5 border border-white/10 rounded-lg hover:bg-white/10 transition-colors">
                        <Filter size={16} className="text-gray-400" />
                      </button>
                    </div>

                    <div className="space-y-2">
                      {mockProducts.map((product, idx) => (
                        <div 
                          key={product.id}
                          className="flex items-center gap-4 p-3 bg-white/5 border border-white/10 rounded-lg hover:bg-white/10 transition-all duration-300"
                          style={{ animationDelay: `${idx * 100}ms` }}
                        >
                          <div className="text-3xl">{product.image}</div>
                          <div className="flex-1 min-w-0">
                            <h4 className="text-white font-medium text-sm truncate">{product.name}</h4>
                            <p className="text-gray-400 text-xs">{product.category}</p>
                          </div>
                          <div className="text-right">
                            <p className="text-white font-semibold text-sm">${product.price}</p>
                            <p className="text-gray-400 text-xs">Stock: {product.stock}</p>
                          </div>
                          <button className="p-2 hover:bg-white/10 rounded-lg transition-colors">
                            <MoreVertical size={16} className="text-gray-400" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Screenshot 2 - Sales History */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <div className="order-1">
                <div className="relative rounded-2xl border border-white/10 overflow-hidden bg-gradient-to-br from-gray-900 to-gray-950 backdrop-blur hover:border-white/20 transition-all duration-300">
                  {/* Sales History Demo */}
                  <div className="p-6 space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="text-xl font-bold text-white">Sales History</h3>
                      <button className="px-3 py-1.5 bg-emerald-500/20 text-emerald-300 rounded-lg text-sm hover:bg-emerald-500/30 transition-colors">
                        <Plus size={16} className="inline mr-1" />
                        New Sale
                      </button>
                    </div>

                    <div className="grid grid-cols-3 gap-3">
                      <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-lg">
                        <p className="text-emerald-300 text-xs mb-1">Total Profit</p>
                        <p className="text-white font-bold text-lg">$202.79</p>
                      </div>
                      <div className="p-3 bg-blue-500/10 border border-blue-500/30 rounded-lg">
                        <p className="text-blue-300 text-xs mb-1">Total Sales</p>
                        <p className="text-white font-bold text-lg">3</p>
                      </div>
                      <div className="p-3 bg-purple-500/10 border border-purple-500/30 rounded-lg">
                        <p className="text-purple-300 text-xs mb-1">Avg Profit</p>
                        <p className="text-white font-bold text-lg">$67.60</p>
                      </div>
                    </div>

                    <div className="space-y-2">
                      {mockSales.map((sale, idx) => (
                        <div 
                          key={sale.id}
                          className="flex items-center gap-4 p-3 bg-white/5 border border-white/10 rounded-lg hover:bg-white/10 transition-all duration-300"
                          style={{ animationDelay: `${idx * 100}ms` }}
                        >
                          <div className="flex-1 min-w-0">
                            <h4 className="text-white font-medium text-sm truncate">{sale.product}</h4>
                            <p className="text-gray-400 text-xs">{sale.platform} • {sale.date}</p>
                          </div>
                          <div className="text-right">
                            <p className="text-emerald-400 font-semibold text-sm">+${sale.profit}</p>
                            <span className={`inline-block px-2 py-0.5 rounded text-xs ${
                              sale.status === 'completed' 
                                ? 'bg-emerald-500/20 text-emerald-300' 
                                : 'bg-yellow-500/20 text-yellow-300'
                            }`}>
                              {sale.status}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
              <div className="order-2 space-y-6">
                <div className="inline-block px-4 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-sm font-medium">
                  Sales Tracking
                </div>
                <h3 className="text-3xl font-bold text-white">
                  Track Every Sale, Maximize Every Profit
                </h3>
                <p className="text-lg text-gray-400 leading-relaxed">
                  Record sales with automatic profit calculations. Track
                  platform fees, shipping costs, margins, and ROI all in one
                  place.
                </p>
                <ul className="space-y-3">
                  <li className="flex items-start gap-3">
                    <CheckCircle2 size={20} className="text-emerald-400 mt-0.5 flex-shrink-0" />
                    <span className="text-gray-300">
                      Automatic profit and margin calculations
                    </span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle2 size={20} className="text-emerald-400 mt-0.5 flex-shrink-0" />
                    <span className="text-gray-300">
                      Multi-platform support (Vinted, OLX, eBay, etc.)
                    </span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle2 size={20} className="text-emerald-400 mt-0.5 flex-shrink-0" />
                    <span className="text-gray-300">
                      Complete sales history with product images
                    </span>
                  </li>
                </ul>
              </div>
            </div>

            {/* Screenshot 3 - Finance Dashboard */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <div className="order-2 lg:order-1 space-y-6">
                <div className="inline-block px-4 py-1.5 rounded-full bg-purple-500/10 border border-purple-500/30 text-purple-300 text-sm font-medium">
                  Financial Analytics
                </div>
                <h3 className="text-3xl font-bold text-white">
                  Powerful Insights at Your Fingertips
                </h3>
                <p className="text-lg text-gray-400 leading-relaxed">
                  Visualize your business performance with interactive charts
                  and comprehensive financial reports.
                </p>
                <ul className="space-y-3">
                  <li className="flex items-start gap-3">
                    <CheckCircle2 size={20} className="text-purple-400 mt-0.5 flex-shrink-0" />
                    <span className="text-gray-300">
                      Real-time profit and investment tracking
                    </span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle2 size={20} className="text-purple-400 mt-0.5 flex-shrink-0" />
                    <span className="text-gray-300">
                      Export reports to CSV, Excel, and PDF
                    </span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle2 size={20} className="text-purple-400 mt-0.5 flex-shrink-0" />
                    <span className="text-gray-300">
                      Custom date range filters and analytics
                    </span>
                  </li>
                </ul>
              </div>
              <div className="order-1 lg:order-2">
                <div className="relative rounded-2xl border border-white/10 overflow-hidden bg-gradient-to-br from-gray-900 to-gray-950 backdrop-blur hover:border-white/20 transition-all duration-300">
                  {/* Finance Dashboard Demo */}
                  <div className="p-6 space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="text-xl font-bold text-white">Financial Analytics</h3>
                      <div className="flex gap-2">
                        <button className="px-3 py-1.5 bg-white/5 border border-white/10 rounded-lg text-white text-xs hover:bg-white/10 transition-colors">
                          Last 7 days
                        </button>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div className="p-4 bg-gradient-to-br from-emerald-500/20 to-emerald-500/5 border border-emerald-500/30 rounded-lg">
                        <div className="flex items-center gap-2 mb-2">
                          <TrendingUp size={16} className="text-emerald-400" />
                          <p className="text-emerald-300 text-xs">Total Profit</p>
                        </div>
                        <p className="text-white font-bold text-2xl">$202.79</p>
                        <p className="text-emerald-400 text-xs mt-1">↑ 12.5% from last week</p>
                      </div>
                      <div className="p-4 bg-gradient-to-br from-blue-500/20 to-blue-500/5 border border-blue-500/30 rounded-lg">
                        <div className="flex items-center gap-2 mb-2">
                          <DollarSign size={16} className="text-blue-400" />
                          <p className="text-blue-300 text-xs">Total Invested</p>
                        </div>
                        <p className="text-white font-bold text-2xl">$456.21</p>
                        <p className="text-gray-400 text-xs mt-1">Across 6 products</p>
                      </div>
                    </div>

                    <div className="p-4 bg-white/5 border border-white/10 rounded-lg">
                      <div className="flex items-center justify-between mb-3">
                        <p className="text-white text-sm font-medium">Sales Overview</p>
                        <LineChart size={16} className="text-purple-400" />
                      </div>
                      <div className="h-24 flex items-end justify-between gap-2">
                        {[45, 67, 34, 89, 56, 78, 92].map((height, idx) => (
                          <div 
                            key={idx}
                            className="flex-1 bg-gradient-to-t from-purple-500 to-purple-400 rounded-t transition-all duration-500 hover:from-purple-400 hover:to-purple-300"
                            style={{ 
                              height: `${height}%`,
                              animationDelay: `${idx * 100}ms`
                            }}
                          />
                        ))}
                      </div>
                      <div className="flex justify-between mt-2">
                        {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day, idx) => (
                          <p key={idx} className="text-gray-500 text-xs">{day}</p>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
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

      {/* Pricing Section */}
      <section className="px-6 py-20">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <div className="inline-block px-4 py-1.5 rounded-full bg-yellow-500/10 border border-yellow-500/30 text-yellow-300 text-sm font-medium mb-4">
              Simple Pricing
            </div>
            <h2 className="text-4xl font-bold text-white mb-4">
              Choose Your Plan
            </h2>
            <p className="text-xl text-gray-400">
              Select the perfect plan for your reselling business
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {/* Basic Plan */}
            <div className="bg-white/5 border border-white/10 rounded-2xl p-8 hover:border-white/20 transition-all duration-300">
              <div className="space-y-6">
                <div>
                  <h3 className="text-2xl font-bold text-white mb-2">Basic</h3>
                  <div className="flex items-baseline gap-2 mb-4">
                    <span className="text-5xl font-bold text-white">$9.99</span>
                    <span className="text-gray-400">/month</span>
                  </div>
                  <p className="text-gray-400">
                    Perfect for getting started with your reselling business
                  </p>
                </div>

                <ul className="space-y-3">
                  <li className="flex items-center gap-3">
                    <Check size={20} className="text-emerald-400 flex-shrink-0" />
                    <span className="text-gray-300">Up to 100 products</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <Check size={20} className="text-emerald-400 flex-shrink-0" />
                    <span className="text-gray-300">Unlimited sales tracking</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <Check size={20} className="text-emerald-400 flex-shrink-0" />
                    <span className="text-gray-300">Basic analytics</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <Check size={20} className="text-emerald-400 flex-shrink-0" />
                    <span className="text-gray-300">Export reports (CSV)</span>
                  </li>
                  <li className="flex items-center gap-3 opacity-50">
                    <X size={20} className="text-gray-500 flex-shrink-0" />
                    <span className="text-gray-500">Vinted import products</span>
                  </li>
                  <li className="flex items-center gap-3 opacity-50">
                    <X size={20} className="text-gray-500 flex-shrink-0" />
                    <span className="text-gray-500">Priority support</span>
                  </li>
                </ul>

                <Link
                  href="/register"
                  className="w-full block text-center px-6 py-3 bg-white/10 border border-white/20 hover:bg-white/15 rounded-xl font-medium text-white transition-colors"
                >
                  Get Started
                </Link>
              </div>
            </div>

            {/* Pro Plan */}
            <div className="relative bg-gradient-to-br from-blue-500/10 to-purple-500/10 border-2 border-blue-500/50 rounded-2xl p-8 hover:border-blue-500/70 transition-all duration-300">
              <div className="absolute top-4 right-4">
                <div className="flex items-center gap-1 px-3 py-1 rounded-full bg-blue-500/20 border border-blue-500/50">
                  <Crown size={14} className="text-blue-400" />
                  <span className="text-xs font-semibold text-blue-300">POPULAR</span>
                </div>
              </div>

              <div className="space-y-6">
                <div>
                  <h3 className="text-2xl font-bold text-white mb-2">Pro</h3>
                  <div className="flex items-baseline gap-2 mb-4">
                    <span className="text-5xl font-bold text-white">$19.99</span>
                    <span className="text-gray-400">/month</span>
                  </div>
                  <p className="text-gray-400">
                    For serious resellers ready to scale their business
                  </p>
                </div>

                <ul className="space-y-3">
                  <li className="flex items-center gap-3">
                    <Check size={20} className="text-blue-400 flex-shrink-0" />
                    <span className="text-gray-300">Unlimited products</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <Check size={20} className="text-blue-400 flex-shrink-0" />
                    <span className="text-gray-300">Vinted import products</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <Check size={20} className="text-blue-400 flex-shrink-0" />
                    <span className="text-gray-300">Unlimited sales tracking</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <Check size={20} className="text-blue-400 flex-shrink-0" />
                    <span className="text-gray-300">Advanced analytics</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <Check size={20} className="text-blue-400 flex-shrink-0" />
                    <span className="text-gray-300">Export to CSV, Excel & PDF</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <Check size={20} className="text-blue-400 flex-shrink-0" />
                    <span className="text-gray-300">Priority support</span>
                  </li>
                </ul>

                <Link
                  href="/register"
                  className="w-full block text-center px-6 py-3 bg-blue-600 hover:bg-blue-500 rounded-xl font-medium text-white transition-colors"
                >
                  Get Started
                </Link>
              </div>
            </div>
          </div>

          <p className="text-center text-gray-500 mt-12 text-sm">
            All plans include free updates and new features as they're released
          </p>
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

      {/* FAQ Section */}
      <section className="px-6 py-20">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-white mb-4">
              Frequently Asked Questions
            </h2>
            <p className="text-xl text-gray-400">
              Everything you need to know about Retrack
            </p>
          </div>

          <div className="space-y-4">
            {/* FAQ 1 */}
            <details className="group border border-white/10 rounded-2xl p-6 hover:border-white/20 transition-colors">
              <summary className="flex items-center justify-between cursor-pointer list-none">
                <h3 className="text-lg font-semibold text-white">
                  What's the difference between Basic and Pro?
                </h3>
                <span className="text-gray-400 group-open:rotate-180 transition-transform">
                  <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                    <path d="M5 7.5L10 12.5L15 7.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </span>
              </summary>
              <p className="mt-4 text-gray-400 leading-relaxed">
                Basic allows up to 100 products with essential features, while Pro offers unlimited products, Vinted import, advanced analytics, and priority support. Perfect for scaling your business.
              </p>
            </details>

            {/* FAQ 2 */}
            <details className="group border border-white/10 rounded-2xl p-6 hover:border-white/20 transition-colors">
              <summary className="flex items-center justify-between cursor-pointer list-none">
                <h3 className="text-lg font-semibold text-white">
                  What platforms does Retrack support?
                </h3>
                <span className="text-gray-400 group-open:rotate-180 transition-transform">
                  <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                    <path d="M5 7.5L10 12.5L15 7.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </span>
              </summary>
              <p className="mt-4 text-gray-400 leading-relaxed">
                Retrack supports all major reselling platforms including Vinted, OLX, Facebook Marketplace, eBay, Wallapop, and more. You can track sales from any platform in one centralized place.
              </p>
            </details>

            {/* FAQ 3 */}
            <details className="group border border-white/10 rounded-2xl p-6 hover:border-white/20 transition-colors">
              <summary className="flex items-center justify-between cursor-pointer list-none">
                <h3 className="text-lg font-semibold text-white">
                  Can I export my data?
                </h3>
                <span className="text-gray-400 group-open:rotate-180 transition-transform">
                  <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                    <path d="M5 7.5L10 12.5L15 7.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </span>
              </summary>
              <p className="mt-4 text-gray-400 leading-relaxed">
                Absolutely! Basic users can export to CSV, while Pro users get additional export options including Excel and PDF formats. Your data is always yours.
              </p>
            </details>

            {/* FAQ 4 */}
            <details className="group border border-white/10 rounded-2xl p-6 hover:border-white/20 transition-colors">
              <summary className="flex items-center justify-between cursor-pointer list-none">
                <h3 className="text-lg font-semibold text-white">
                  How does profit calculation work?
                </h3>
                <span className="text-gray-400 group-open:rotate-180 transition-transform">
                  <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                    <path d="M5 7.5L10 12.5L15 7.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </span>
              </summary>
              <p className="mt-4 text-gray-400 leading-relaxed">
                When you record a sale, Retrack automatically calculates your profit by subtracting the purchase price, shipping costs, and platform fees from the sale price. You'll also see margin percentage and ROI.
              </p>
            </details>

            {/* FAQ 5 */}
            <details className="group border border-white/10 rounded-2xl p-6 hover:border-white/20 transition-colors">
              <summary className="flex items-center justify-between cursor-pointer list-none">
                <h3 className="text-lg font-semibold text-white">
                  Can I upgrade or downgrade my plan?
                </h3>
                <span className="text-gray-400 group-open:rotate-180 transition-transform">
                  <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                    <path d="M5 7.5L10 12.5L15 7.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </span>
              </summary>
              <p className="mt-4 text-gray-400 leading-relaxed">
                Yes! You can upgrade to Pro at any time to unlock unlimited products and advanced features. You can also downgrade back to Basic whenever you want - no questions asked.
              </p>
            </details>

            {/* FAQ 6 */}
            <details className="group border border-white/10 rounded-2xl p-6 hover:border-white/20 transition-colors">
              <summary className="flex items-center justify-between cursor-pointer list-none">
                <h3 className="text-lg font-semibold text-white">
                  Is my data secure?
                </h3>
                <span className="text-gray-400 group-open:rotate-180 transition-transform">
                  <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                    <path d="M5 7.5L10 12.5L15 7.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </span>
              </summary>
              <p className="mt-4 text-gray-400 leading-relaxed">
                Your data security is our top priority. All data is encrypted in transit and at rest. We use industry-standard security practices and never share your information with third parties.
              </p>
            </details>
          </div>

          <div className="text-center mt-12">
            <p className="text-gray-400 mb-4">Still have questions?</p>
            <Link
              href="#"
              className="inline-flex items-center gap-2 text-white hover:text-gray-300 transition-colors"
            >
              Contact our support team
              <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="px-6 py-20">
        <div className="max-w-4xl mx-auto text-center">
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
            Get Started Today
            <ArrowRight size={20} />
          </Link>
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
