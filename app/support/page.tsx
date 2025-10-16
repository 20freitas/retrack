"use client";

import Link from "next/link";
import Footer from "@/components/Footer";
import {
  ArrowRight,
  Mail,
  MessageCircle,
  Book,
  Search,
  ChevronRight,
  Clock,
  CheckCircle2,
  HelpCircle,
  FileText,
  Video,
  Users,
} from "lucide-react";

const faqs = [
  {
    category: "Getting Started",
    icon: Book,
    questions: [
      {
        q: "How do I create an account?",
        a: "Click the 'Get Started' button on our homepage, choose your plan, and follow the registration process. You'll be up and running in minutes!",
      },
      {
        q: "What information do I need to get started?",
        a: "Just your email address and a password. You can start adding products immediately after signing up.",
      },
      {
        q: "Is there a free trial?",
        a: "We offer a 14-day money-back guarantee on all plans. Try Retrack risk-free!",
      },
    ],
  },
  {
    category: "Product Management",
    icon: FileText,
    questions: [
      {
        q: "How do I add products to my inventory?",
        a: "Navigate to Stock Manager, click 'Add Product', and fill in the details like name, purchase price, supplier, and condition. You can also upload multiple images.",
      },
      {
        q: "Can I import products from Vinted?",
        a: "Yes! Pro plan users can import products directly from Vinted using our integration feature.",
      },
      {
        q: "How do I organize my products?",
        a: "Use tags, categories, suppliers, and conditions to organize your inventory. You can also use the search and filter features to find products quickly.",
      },
    ],
  },
  {
    category: "Sales & Tracking",
    icon: CheckCircle2,
    questions: [
      {
        q: "How do I record a sale?",
        a: "Go to Sales History, click 'New Sale', select the product, enter the sale price, platform, and any fees. Profit is calculated automatically.",
      },
      {
        q: "What platforms are supported?",
        a: "We support all major platforms: Vinted, OLX, Facebook Marketplace, eBay, Wallapop, and more. You can also add custom platforms.",
      },
      {
        q: "How is profit calculated?",
        a: "Profit = Sale Price - Purchase Price - Shipping Costs - Platform Fees. We also show you the margin percentage and ROI.",
      },
    ],
  },
  {
    category: "Analytics & Reports",
    icon: Video,
    questions: [
      {
        q: "What analytics are available?",
        a: "View total profits, sales trends, best-selling items, platform performance, and ROI. Pro users get advanced analytics with custom date ranges.",
      },
      {
        q: "Can I export my data?",
        a: "Yes! Basic users can export to CSV. Pro users can export to CSV, Excel, and PDF formats.",
      },
      {
        q: "How often is data updated?",
        a: "All data is updated in real-time. Your dashboard reflects changes instantly.",
      },
    ],
  },
  {
    category: "Billing & Plans",
    icon: Users,
    questions: [
      {
        q: "What's the difference between Basic and Pro?",
        a: "Basic offers up to 100 products with essential features. Pro includes unlimited products, Vinted import, advanced analytics, and priority support.",
      },
      {
        q: "Can I change my plan?",
        a: "Absolutely! Upgrade or downgrade anytime from your account settings. Changes take effect immediately.",
      },
      {
        q: "What payment methods do you accept?",
        a: "We accept all major credit cards (Visa, Mastercard, American Express) and PayPal.",
      },
    ],
  },
];

const contactMethods = [
  {
    icon: Mail,
    title: "Email Support",
    description: "Get help via email",
    detail: "2025retrack@gmail.com",
    response: "Response within 24 hours",
    action: "Send Email",
    href: "mailto:2025retrack@gmail.com",
  },
  {
    icon: MessageCircle,
    title: "Live Chat",
    description: "Chat with our team",
    detail: "Available Mon-Fri, 9am-6pm CET",
    response: "Instant responses",
    action: "Start Chat",
    href: "#",
  },
  {
    icon: Book,
    title: "Documentation",
    description: "Browse our guides",
    detail: "Comprehensive tutorials",
    response: "Self-serve support",
    action: "View Docs",
    href: "#",
  },
];

export default function SupportPage() {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="px-6 py-20 lg:py-32">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-block px-4 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/30 text-blue-300 text-sm font-medium mb-6">
            Support Center
          </div>
          <h1 className="text-5xl lg:text-6xl font-bold text-white mb-6">
            How Can We Help?
          </h1>
          <p className="text-xl text-gray-400 mb-8">
            Find answers to your questions or get in touch with our support team
          </p>

          {/* Search Bar */}
          <div className="max-w-2xl mx-auto">
            <div className="relative">
              <Search
                size={20}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500"
              />
              <input
                type="text"
                placeholder="Search for help articles..."
                className="w-full pl-12 pr-4 py-4 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-white/20 transition-colors"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Contact Methods */}
      <section className="px-6 py-12">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {contactMethods.map((method, idx) => (
              <Link
                key={idx}
                href={method.href}
                className="group bg-white/5 border border-white/10 rounded-2xl p-6 hover:border-white/20 hover:bg-white/10 transition-all duration-300"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="p-3 rounded-xl bg-white/10 border border-white/20">
                    <method.icon size={24} className="text-white" />
                  </div>
                  <ChevronRight
                    size={20}
                    className="text-gray-500 group-hover:text-white group-hover:translate-x-1 transition-all"
                  />
                </div>
                <h3 className="text-xl font-semibold text-white mb-2">
                  {method.title}
                </h3>
                <p className="text-gray-400 text-sm mb-4">
                  {method.description}
                </p>
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    <Clock size={14} />
                    <span>{method.response}</span>
                  </div>
                  <p className="text-white font-medium text-sm">
                    {method.detail}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="px-6 py-20">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-white mb-4">
              Frequently Asked Questions
            </h2>
            <p className="text-xl text-gray-400">
              Quick answers to common questions
            </p>
          </div>

          <div className="space-y-12">
            {faqs.map((category, idx) => (
              <div key={idx}>
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-2 rounded-lg bg-white/10 border border-white/20">
                    <category.icon size={20} className="text-white" />
                  </div>
                  <h3 className="text-2xl font-bold text-white">
                    {category.category}
                  </h3>
                </div>

                <div className="space-y-4">
                  {category.questions.map((faq, faqIdx) => (
                    <details
                      key={faqIdx}
                      className="group border border-white/10 rounded-2xl p-6 hover:border-white/20 transition-colors"
                    >
                      <summary className="flex items-start justify-between cursor-pointer list-none">
                        <div className="flex items-start gap-3 flex-1">
                          <HelpCircle
                            size={20}
                            className="text-blue-400 mt-0.5 flex-shrink-0"
                          />
                          <h4 className="text-lg font-semibold text-white">
                            {faq.q}
                          </h4>
                        </div>
                        <span className="text-gray-400 group-open:rotate-180 transition-transform ml-4">
                          <svg
                            width="20"
                            height="20"
                            viewBox="0 0 20 20"
                            fill="none"
                          >
                            <path
                              d="M5 7.5L10 12.5L15 7.5"
                              stroke="currentColor"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                          </svg>
                        </span>
                      </summary>
                      <p className="mt-4 ml-8 text-gray-400 leading-relaxed">
                        {faq.a}
                      </p>
                    </details>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Popular Articles */}
      <section className="px-6 py-20 bg-white/5">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-white mb-4">
              Popular Help Articles
            </h2>
            <p className="text-gray-400">Most viewed guides and tutorials</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                title: "Getting Started Guide",
                description: "Learn the basics of Retrack in 5 minutes",
                views: "2.5k views",
              },
              {
                title: "Adding Your First Product",
                description: "Step-by-step guide to adding products",
                views: "1.8k views",
              },
              {
                title: "Recording Sales",
                description: "How to track and record your sales",
                views: "1.5k views",
              },
              {
                title: "Understanding Analytics",
                description: "Make sense of your profit data",
                views: "1.2k views",
              },
              {
                title: "Vinted Integration",
                description: "Import products from Vinted automatically",
                views: "980 views",
              },
              {
                title: "Exporting Reports",
                description: "Export your data to CSV, Excel, or PDF",
                views: "850 views",
              },
            ].map((article, idx) => (
              <Link
                key={idx}
                href="#"
                className="group bg-white/5 border border-white/10 rounded-xl p-6 hover:border-white/20 hover:bg-white/10 transition-all duration-300"
              >
                <div className="flex items-start justify-between mb-3">
                  <FileText size={20} className="text-blue-400" />
                  <ArrowRight
                    size={16}
                    className="text-gray-500 group-hover:text-white group-hover:translate-x-1 transition-all"
                  />
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">
                  {article.title}
                </h3>
                <p className="text-gray-400 text-sm mb-3">
                  {article.description}
                </p>
                <p className="text-gray-500 text-xs">{article.views}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Still Need Help CTA */}
      <section className="px-6 py-20">
        <div className="max-w-4xl mx-auto">
          <div className="bg-gradient-to-br from-blue-500/10 to-purple-500/10 border border-blue-500/30 rounded-3xl p-12 text-center">
            <h2 className="text-3xl font-bold text-white mb-4">
              Still Need Help?
            </h2>
            <p className="text-xl text-gray-400 mb-8 max-w-2xl mx-auto">
              Our support team is here to help. Get in touch and we'll respond
              as soon as possible.
            </p>
            <div className="flex items-center justify-center gap-4">
              <Link
                href="mailto:2025retrack@gmail.com"
                className="inline-flex items-center gap-2 px-8 py-4 bg-white text-black hover:bg-gray-200 rounded-xl font-semibold transition-colors"
              >
                <Mail size={20} />
                Email Support
              </Link>
              <Link
                href="#"
                className="inline-flex items-center gap-2 px-8 py-4 bg-white/10 border border-white/20 hover:bg-white/15 rounded-xl font-semibold text-white transition-colors"
              >
                <MessageCircle size={20} />
                Start Chat
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <Footer />
    </div>
  );
}
