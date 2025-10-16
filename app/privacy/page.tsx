"use client";

import Link from "next/link";
import { Shield, Cookie, Lock, Eye, Database, UserCheck } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function PrivacyPage() {
  return (
    <div className="min-h-screen pt-20">
      {/* Hero Section */}
      <div className="relative py-20 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-block px-4 py-1.5 rounded-full bg-white/10 border border-white/20 text-white text-sm font-medium mb-6">
            Legal
          </div>
          <h1 className="text-5xl md:text-6xl font-bold text-white mb-6">
            Privacy Policy
          </h1>
          <p className="text-xl text-gray-400 leading-relaxed">
            Your privacy is important to us. Learn how we collect, use, and
            protect your personal information.
          </p>
          <p className="text-sm text-gray-500 mt-4">
            Last updated: October 16, 2025
          </p>
        </div>
      </div>



      {/* Content */}
      <div className="max-w-4xl mx-auto px-6 pb-20">
        <div className="space-y-12">
          {/* Introduction */}
          <section>
            <div className="flex items-start gap-4 mb-6">
              <div className="w-12 h-12 rounded-xl bg-blue-500/20 border border-blue-500/30 flex items-center justify-center flex-shrink-0">
                <Shield className="text-blue-400" size={24} />
              </div>
              <div>
                <h2 className="text-3xl font-bold text-white mb-4">
                  Introduction
                </h2>
                <p className="text-gray-400 leading-relaxed">
                  Welcome to Retrack. We respect your privacy and are committed to
                  protecting your personal data. This privacy policy will inform
                  you about how we look after your personal data when you visit
                  our website and use our services, and tell you about your
                  privacy rights and how the law protects you.
                </p>
              </div>
            </div>
          </section>

          {/* Information We Collect */}
          <section id="information-we-collect">
            <div className="flex items-start gap-4 mb-6">
              <div className="w-12 h-12 rounded-xl bg-purple-500/20 border border-purple-500/30 flex items-center justify-center flex-shrink-0">
                <Database className="text-purple-400" size={24} />
              </div>
              <div className="flex-1">
                <h2 className="text-3xl font-bold text-white mb-4">
                  Information We Collect
                </h2>
                <p className="text-gray-400 mb-4 leading-relaxed">
                  We collect and process the following types of personal data:
                </p>
                <ul className="space-y-3 text-gray-400">
                  <li className="flex items-start gap-2">
                    <span className="text-blue-400 mt-1">•</span>
                    <span>
                      <strong className="text-white">Account Information:</strong>{" "}
                      Name, email address, password, and profile information
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-blue-400 mt-1">•</span>
                    <span>
                      <strong className="text-white">Business Data:</strong>{" "}
                      Product listings, sales records, inventory information, and
                      financial analytics
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-blue-400 mt-1">•</span>
                    <span>
                      <strong className="text-white">Usage Data:</strong> How you
                      interact with our platform, features you use, and
                      performance metrics
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-blue-400 mt-1">•</span>
                    <span>
                      <strong className="text-white">Technical Data:</strong> IP
                      address, browser type, device information, and cookies
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-blue-400 mt-1">•</span>
                    <span>
                      <strong className="text-white">Payment Information:</strong>{" "}
                      Processed securely through our payment providers
                    </span>
                  </li>
                </ul>
              </div>
            </div>
          </section>

          {/* How We Use Your Data */}
          <section id="how-we-use">
            <div className="flex items-start gap-4 mb-6">
              <div className="w-12 h-12 rounded-xl bg-green-500/20 border border-green-500/30 flex items-center justify-center flex-shrink-0">
                <Eye className="text-green-400" size={24} />
              </div>
              <div className="flex-1">
                <h2 className="text-3xl font-bold text-white mb-4">
                  How We Use Your Data
                </h2>
                <p className="text-gray-400 mb-4 leading-relaxed">
                  We use your personal data for the following purposes:
                </p>
                <ul className="space-y-3 text-gray-400">
                  <li className="flex items-start gap-2">
                    <span className="text-green-400 mt-1">•</span>
                    <span>
                      To provide and maintain our reselling management services
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-400 mt-1">•</span>
                    <span>
                      To process your transactions and manage your account
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-400 mt-1">•</span>
                    <span>
                      To send you important updates, security alerts, and support
                      messages
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-400 mt-1">•</span>
                    <span>
                      To improve our platform and develop new features
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-400 mt-1">•</span>
                    <span>To comply with legal obligations and prevent fraud</span>
                  </li>
                </ul>
              </div>
            </div>
          </section>

          {/* Data Security */}
          <section id="data-security">
            <div className="flex items-start gap-4 mb-6">
              <div className="w-12 h-12 rounded-xl bg-red-500/20 border border-red-500/30 flex items-center justify-center flex-shrink-0">
                <Lock className="text-red-400" size={24} />
              </div>
              <div className="flex-1">
                <h2 className="text-3xl font-bold text-white mb-4">
                  Data Security
                </h2>
                <p className="text-gray-400 mb-4 leading-relaxed">
                  We have implemented appropriate security measures to prevent
                  your personal data from being accidentally lost, used, accessed
                  in an unauthorized way, altered, or disclosed.
                </p>
                <div className="bg-white/5 border border-white/10 rounded-xl p-6">
                  <h3 className="text-white font-semibold mb-3">
                    Our Security Measures Include:
                  </h3>
                  <ul className="space-y-2 text-gray-400 text-sm">
                    <li className="flex items-start gap-2">
                      <span className="text-red-400 mt-1">✓</span>
                      <span>End-to-end encryption for sensitive data</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-red-400 mt-1">✓</span>
                      <span>Secure servers with regular security audits</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-red-400 mt-1">✓</span>
                      <span>Two-factor authentication options</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-red-400 mt-1">✓</span>
                      <span>Regular security updates and patches</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </section>

          {/* Cookies Policy */}
          <section id="cookies">
            <div className="flex items-start gap-4 mb-6">
              <div className="w-12 h-12 rounded-xl bg-yellow-500/20 border border-yellow-500/30 flex items-center justify-center flex-shrink-0">
                <Cookie className="text-yellow-400" size={24} />
              </div>
              <div className="flex-1">
                <h2 className="text-3xl font-bold text-white mb-4">
                  Cookies Policy
                </h2>
                <p className="text-gray-400 mb-4 leading-relaxed">
                  We use cookies and similar tracking technologies to track
                  activity on our service and store certain information. Cookies
                  are files with a small amount of data that may include an
                  anonymous unique identifier.
                </p>
                <div className="space-y-4">
                  <div className="bg-white/5 border border-white/10 rounded-xl p-5">
                    <h3 className="text-white font-semibold mb-2">
                      Essential Cookies
                    </h3>
                    <p className="text-gray-400 text-sm">
                      Required for the platform to function properly. These cannot
                      be disabled as they are necessary for authentication and
                      security.
                    </p>
                  </div>
                  <div className="bg-white/5 border border-white/10 rounded-xl p-5">
                    <h3 className="text-white font-semibold mb-2">
                      Analytics Cookies
                    </h3>
                    <p className="text-gray-400 text-sm">
                      Help us understand how users interact with our platform so
                      we can improve the user experience.
                    </p>
                  </div>
                  <div className="bg-white/5 border border-white/10 rounded-xl p-5">
                    <h3 className="text-white font-semibold mb-2">
                      Preference Cookies
                    </h3>
                    <p className="text-gray-400 text-sm">
                      Remember your settings and preferences to provide a
                      personalized experience.
                    </p>
                  </div>
                </div>
                <p className="text-gray-400 mt-4 text-sm">
                  You can control cookies through your browser settings. However,
                  disabling certain cookies may affect your ability to use some
                  features of our platform.
                </p>
              </div>
            </div>
          </section>

          {/* Your Rights */}
          <section id="your-rights">
            <div className="flex items-start gap-4 mb-6">
              <div className="w-12 h-12 rounded-xl bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center flex-shrink-0">
                <UserCheck className="text-indigo-400" size={24} />
              </div>
              <div className="flex-1">
                <h2 className="text-3xl font-bold text-white mb-4">
                  Your Privacy Rights
                </h2>
                <p className="text-gray-400 mb-4 leading-relaxed">
                  Under data protection laws, you have rights including:
                </p>
                <ul className="space-y-3 text-gray-400">
                  <li className="flex items-start gap-2">
                    <span className="text-indigo-400 mt-1">•</span>
                    <span>
                      <strong className="text-white">
                        Right to Access:
                      </strong>{" "}
                      Request copies of your personal data
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-indigo-400 mt-1">•</span>
                    <span>
                      <strong className="text-white">
                        Right to Rectification:
                      </strong>{" "}
                      Correct any inaccurate or incomplete data
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-indigo-400 mt-1">•</span>
                    <span>
                      <strong className="text-white">Right to Erasure:</strong>{" "}
                      Request deletion of your personal data
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-indigo-400 mt-1">•</span>
                    <span>
                      <strong className="text-white">
                        Right to Portability:
                      </strong>{" "}
                      Transfer your data to another service
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-indigo-400 mt-1">•</span>
                    <span>
                      <strong className="text-white">Right to Object:</strong>{" "}
                      Object to processing of your personal data
                    </span>
                  </li>
                </ul>
                <div className="bg-blue-500/10 border border-blue-500/30 rounded-xl p-5 mt-6">
                  <p className="text-blue-300 text-sm">
                    To exercise any of these rights, please contact us at{" "}
                    <a
                      href="mailto:2025retrack@gmail.com"
                      className="text-blue-400 hover:text-blue-300 underline"
                    >
                      2025retrack@gmail.com
                    </a>
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* Data Retention */}
          <section>
            <h2 className="text-3xl font-bold text-white mb-4">
              Data Retention
            </h2>
            <p className="text-gray-400 leading-relaxed">
              We will retain your personal data only for as long as necessary to
              fulfill the purposes outlined in this privacy policy. We will retain
              and use your data to the extent necessary to comply with our legal
              obligations, resolve disputes, and enforce our agreements. When you
              delete your account, we will delete or anonymize your personal data
              within 30 days, except where we are required to retain it by law.
            </p>
          </section>

          {/* Third-Party Services */}
          <section>
            <h2 className="text-3xl font-bold text-white mb-4">
              Third-Party Services
            </h2>
            <p className="text-gray-400 mb-4 leading-relaxed">
              We may share your data with trusted third-party service providers
              who assist us in operating our platform:
            </p>
            <ul className="space-y-2 text-gray-400">
              <li className="flex items-start gap-2">
                <span className="text-blue-400 mt-1">•</span>
                <span>Payment processors for secure transactions</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-400 mt-1">•</span>
                <span>Cloud hosting providers for data storage</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-400 mt-1">•</span>
                <span>Analytics services to improve our platform</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-400 mt-1">•</span>
                <span>Email service providers for communications</span>
              </li>
            </ul>
            <p className="text-gray-400 mt-4 text-sm">
              All third-party services are carefully vetted and required to
              maintain the confidentiality of your information.
            </p>
          </section>

          {/* Changes to This Policy */}
          <section>
            <h2 className="text-3xl font-bold text-white mb-4">
              Changes to This Policy
            </h2>
            <p className="text-gray-400 leading-relaxed">
              We may update our privacy policy from time to time. We will notify
              you of any changes by posting the new privacy policy on this page
              and updating the "Last updated" date. You are advised to review this
              privacy policy periodically for any changes. Changes to this privacy
              policy are effective when they are posted on this page.
            </p>
          </section>

          {/* Contact Us */}
          <section id="contact">
            <h2 className="text-3xl font-bold text-white mb-4">Contact Us</h2>
            <p className="text-gray-400 mb-4 leading-relaxed">
              If you have any questions about this privacy policy or our data
              practices, please contact us:
            </p>
            <div className="bg-white/5 border border-white/10 rounded-xl p-6">
              <div className="space-y-3">
                <div className="flex items-center gap-3 text-gray-400">
                  <span className="text-white font-medium">Email:</span>
                  <a
                    href="mailto:2025retrack@gmail.com"
                    className="text-blue-400 hover:text-blue-300"
                  >
                    2025retrack@gmail.com
                  </a>
                </div>
                <div className="flex items-center gap-3 text-gray-400">
                  <span className="text-white font-medium">Support:</span>
                  <Link
                    href="/contact"
                    className="text-blue-400 hover:text-blue-300"
                  >
                    Contact Form
                  </Link>
                </div>
              </div>
            </div>
          </section>
        </div>
      </div>

      {/* Footer */}
      <div className="border-t border-white/10 py-8">
        <div className="max-w-7xl mx-auto px-6 text-center text-gray-400 text-sm">
          <p>
            © {new Date().getFullYear()} Retrack. All rights reserved. •{" "}
            <Link href="/contact" className="hover:text-white">
              Contact
            </Link>{" "}
            •{" "}
            <Link href="/terms" className="hover:text-white">
              Terms of Service
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
