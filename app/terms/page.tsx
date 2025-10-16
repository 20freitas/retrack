"use client";

import Link from "next/link";
import {
  FileText,
  Shield,
  AlertTriangle,
  DollarSign,
  UserX,
  Scale,
} from "lucide-react";
import { Button } from "@/components/ui/button";

export default function TermsPage() {
  return (
    <div className="min-h-screen pt-20">
      {/* Hero Section */}
      <div className="relative py-20 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-block px-4 py-1.5 rounded-full bg-white/10 border border-white/20 text-white text-sm font-medium mb-6">
            Legal
          </div>
          <h1 className="text-5xl md:text-6xl font-bold text-white mb-6">
            Terms of Service
          </h1>
          <p className="text-xl text-gray-400 leading-relaxed">
            Please read these terms carefully before using Retrack. By accessing
            our platform, you agree to be bound by these terms.
          </p>
          <p className="text-sm text-gray-500 mt-4">
            Last updated: October 16, 2025
          </p>
        </div>
      </div>



      {/* Content */}
      <div className="max-w-4xl mx-auto px-6 pb-20">
        <div className="space-y-12">
          {/* Acceptance */}
          <section id="acceptance">
            <div className="flex items-start gap-4 mb-6">
              <div className="w-12 h-12 rounded-xl bg-blue-500/20 border border-blue-500/30 flex items-center justify-center flex-shrink-0">
                <FileText className="text-blue-400" size={24} />
              </div>
              <div>
                <h2 className="text-3xl font-bold text-white mb-4">
                  Acceptance of Terms
                </h2>
                <p className="text-gray-400 leading-relaxed mb-4">
                  By accessing and using Retrack ("the Service"), you accept and
                  agree to be bound by the terms and provisions of this agreement.
                  If you do not agree to these Terms of Service, please do not use
                  the Service.
                </p>
                <p className="text-gray-400 leading-relaxed">
                  We reserve the right to update and change these Terms of Service
                  at any time without notice. Continued use of the Service after
                  any such changes constitutes your consent to such changes.
                </p>
              </div>
            </div>
          </section>

          {/* User Accounts */}
          <section id="user-accounts">
            <div className="flex items-start gap-4 mb-6">
              <div className="w-12 h-12 rounded-xl bg-purple-500/20 border border-purple-500/30 flex items-center justify-center flex-shrink-0">
                <Shield className="text-purple-400" size={24} />
              </div>
              <div className="flex-1">
                <h2 className="text-3xl font-bold text-white mb-4">
                  User Accounts
                </h2>
                <p className="text-gray-400 mb-4 leading-relaxed">
                  To use certain features of the Service, you must register for an
                  account. When you register, you agree to:
                </p>
                <ul className="space-y-3 text-gray-400">
                  <li className="flex items-start gap-2">
                    <span className="text-purple-400 mt-1">•</span>
                    <span>
                      Provide accurate, current, and complete information during
                      registration
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-purple-400 mt-1">•</span>
                    <span>
                      Maintain and promptly update your account information
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-purple-400 mt-1">•</span>
                    <span>
                      Maintain the security of your password and accept all risks
                      of unauthorized access
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-purple-400 mt-1">•</span>
                    <span>
                      Immediately notify us of any unauthorized use of your account
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-purple-400 mt-1">•</span>
                    <span>
                      Be responsible for all activities that occur under your
                      account
                    </span>
                  </li>
                </ul>
                <div className="bg-purple-500/10 border border-purple-500/30 rounded-xl p-5 mt-6">
                  <p className="text-purple-300 text-sm">
                    <strong>Important:</strong> You must be at least 18 years old
                    to use this Service. By creating an account, you represent and
                    warrant that you are at least 18 years of age.
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* User Responsibilities */}
          <section id="user-responsibilities">
            <div className="flex items-start gap-4 mb-6">
              <div className="w-12 h-12 rounded-xl bg-red-500/20 border border-red-500/30 flex items-center justify-center flex-shrink-0">
                <AlertTriangle className="text-red-400" size={24} />
              </div>
              <div className="flex-1">
                <h2 className="text-3xl font-bold text-white mb-4">
                  User Responsibilities and Prohibited Activities
                </h2>
                <p className="text-gray-400 mb-4 leading-relaxed">
                  You agree not to engage in any of the following prohibited
                  activities:
                </p>
                <ul className="space-y-3 text-gray-400">
                  <li className="flex items-start gap-2">
                    <span className="text-red-400 mt-1">✗</span>
                    <span>
                      Copying, distributing, or disclosing any part of the Service
                      without authorization
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-red-400 mt-1">✗</span>
                    <span>
                      Using any automated system to access the Service in a manner
                      that sends more requests than a human can reasonably produce
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-red-400 mt-1">✗</span>
                    <span>
                      Attempting to interfere with, compromise, or reverse
                      engineer the Service
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-red-400 mt-1">✗</span>
                    <span>
                      Using the Service for any illegal or unauthorized purpose
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-red-400 mt-1">✗</span>
                    <span>
                      Violating any laws in your jurisdiction (including but not
                      limited to copyright laws)
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-red-400 mt-1">✗</span>
                    <span>
                      Transmitting any viruses, malware, or malicious code
                    </span>
                  </li>
                </ul>
              </div>
            </div>
          </section>

          {/* Payment and Refunds */}
          <section id="payment">
            <div className="flex items-start gap-4 mb-6">
              <div className="w-12 h-12 rounded-xl bg-green-500/20 border border-green-500/30 flex items-center justify-center flex-shrink-0">
                <DollarSign className="text-green-400" size={24} />
              </div>
              <div className="flex-1">
                <h2 className="text-3xl font-bold text-white mb-4">
                  Payment Terms and Refund Policy
                </h2>
                
                <h3 className="text-xl font-semibold text-white mb-3">
                  Subscription and Billing
                </h3>
                <p className="text-gray-400 mb-4 leading-relaxed">
                  Retrack offers various subscription plans. By selecting a paid
                  plan, you agree to pay the subscription fees indicated for that
                  plan. Payments are processed securely through our third-party
                  payment processors.
                </p>
                <ul className="space-y-3 text-gray-400 mb-6">
                  <li className="flex items-start gap-2">
                    <span className="text-green-400 mt-1">•</span>
                    <span>
                      Subscriptions automatically renew unless cancelled before the
                      renewal date
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-400 mt-1">•</span>
                    <span>
                      All fees are exclusive of taxes, which you are responsible
                      for paying
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-400 mt-1">•</span>
                    <span>
                      We reserve the right to change subscription fees with 30 days
                      notice
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-400 mt-1">•</span>
                    <span>
                      You can cancel your subscription at any time from your
                      account settings
                    </span>
                  </li>
                </ul>

                <h3 className="text-xl font-semibold text-white mb-3">
                  Refund Policy
                </h3>
                <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-6">
                  <p className="text-red-300 mb-4">
                    <strong>No Refunds Policy</strong>
                  </p>
                  <p className="text-gray-400 text-sm mb-4">
                    All sales are final. We do not offer refunds for any subscription 
                    or service purchases. Please review your plan carefully before 
                    purchasing.
                  </p>
                  <div className="space-y-2 text-gray-400 text-sm">
                    <p className="flex items-start gap-2">
                      <span className="text-red-400 mt-1">•</span>
                      <span>
                        All payments are non-refundable
                      </span>
                    </p>
                    <p className="flex items-start gap-2">
                      <span className="text-red-400 mt-1">•</span>
                      <span>
                        You can cancel your subscription at any time to prevent future charges
                      </span>
                    </p>
                    <p className="flex items-start gap-2">
                      <span className="text-red-400 mt-1">•</span>
                      <span>
                        Cancellation does not entitle you to a refund for the current billing period
                      </span>
                    </p>
                    <p className="flex items-start gap-2">
                      <span className="text-red-400 mt-1">•</span>
                      <span>
                        Access to the service continues until the end of your paid period
                      </span>
                    </p>
                  </div>
                  <p className="text-gray-400 text-sm mt-4">
                    If you have questions about billing, please contact us at{" "}
                    <a
                      href="mailto:2025retrack@gmail.com"
                      className="text-red-400 hover:text-red-300 underline"
                    >
                      2025retrack@gmail.com
                    </a>
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* Service Availability */}
          <section>
            <h2 className="text-3xl font-bold text-white mb-4">
              Service Availability
            </h2>
            <p className="text-gray-400 mb-4 leading-relaxed">
              We strive to provide reliable and uninterrupted service. However:
            </p>
            <ul className="space-y-2 text-gray-400">
              <li className="flex items-start gap-2">
                <span className="text-blue-400 mt-1">•</span>
                <span>
                  We do not guarantee that the Service will be uninterrupted or
                  error-free
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-400 mt-1">•</span>
                <span>
                  We may perform scheduled maintenance that temporarily affects
                  availability
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-400 mt-1">•</span>
                <span>
                  We are not responsible for delays or failures due to
                  circumstances beyond our control
                </span>
              </li>
            </ul>
          </section>

          {/* Intellectual Property */}
          <section>
            <h2 className="text-3xl font-bold text-white mb-4">
              Intellectual Property
            </h2>
            <p className="text-gray-400 mb-4 leading-relaxed">
              The Service and its original content, features, and functionality are
              owned by Retrack and are protected by international copyright,
              trademark, patent, trade secret, and other intellectual property laws.
            </p>
            <div className="bg-white/5 border border-white/10 rounded-xl p-6">
              <h3 className="text-white font-semibold mb-3">Your Content</h3>
              <p className="text-gray-400 text-sm">
                You retain all rights to the content you upload to the Service
                (product listings, sales data, etc.). By using the Service, you
                grant us a license to use, store, and process your content solely
                for the purpose of providing the Service to you.
              </p>
            </div>
          </section>

          {/* Termination */}
          <section id="termination">
            <div className="flex items-start gap-4 mb-6">
              <div className="w-12 h-12 rounded-xl bg-orange-500/20 border border-orange-500/30 flex items-center justify-center flex-shrink-0">
                <UserX className="text-orange-400" size={24} />
              </div>
              <div className="flex-1">
                <h2 className="text-3xl font-bold text-white mb-4">
                  Account Termination
                </h2>
                <p className="text-gray-400 mb-4 leading-relaxed">
                  We may terminate or suspend your account and bar access to the
                  Service immediately, without prior notice or liability, under our
                  sole discretion, for any reason whatsoever, including but not
                  limited to a breach of these Terms.
                </p>
                <p className="text-gray-400 mb-4 leading-relaxed">
                  If you wish to terminate your account, you may:
                </p>
                <ul className="space-y-2 text-gray-400">
                  <li className="flex items-start gap-2">
                    <span className="text-orange-400 mt-1">•</span>
                    <span>Cancel your subscription from your account settings</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-orange-400 mt-1">•</span>
                    <span>
                      Request account deletion by contacting support
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-orange-400 mt-1">•</span>
                    <span>
                      Simply discontinue using the Service (for free accounts)
                    </span>
                  </li>
                </ul>
                <p className="text-gray-400 mt-4 leading-relaxed">
                  Upon termination, your right to use the Service will immediately
                  cease. All provisions which by their nature should survive
                  termination shall survive, including ownership provisions,
                  warranty disclaimers, and limitations of liability.
                </p>
              </div>
            </div>
          </section>

          {/* Limitation of Liability */}
          <section id="liability">
            <div className="flex items-start gap-4 mb-6">
              <div className="w-12 h-12 rounded-xl bg-yellow-500/20 border border-yellow-500/30 flex items-center justify-center flex-shrink-0">
                <Scale className="text-yellow-400" size={24} />
              </div>
              <div className="flex-1">
                <h2 className="text-3xl font-bold text-white mb-4">
                  Limitation of Liability
                </h2>
                <p className="text-gray-400 mb-4 leading-relaxed">
                  In no event shall Retrack, nor its directors, employees,
                  partners, agents, suppliers, or affiliates, be liable for any
                  indirect, incidental, special, consequential, or punitive
                  damages, including without limitation, loss of profits, data,
                  use, goodwill, or other intangible losses, resulting from:
                </p>
                <ul className="space-y-2 text-gray-400">
                  <li className="flex items-start gap-2">
                    <span className="text-yellow-400 mt-1">•</span>
                    <span>Your access to or use of or inability to use the Service</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-yellow-400 mt-1">•</span>
                    <span>
                      Any conduct or content of any third party on the Service
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-yellow-400 mt-1">•</span>
                    <span>
                      Any content obtained from the Service
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-yellow-400 mt-1">•</span>
                    <span>
                      Unauthorized access, use, or alteration of your data
                    </span>
                  </li>
                </ul>
                <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-xl p-5 mt-6">
                  <p className="text-yellow-300 text-sm">
                    <strong>Disclaimer:</strong> The Service is provided on an "AS
                    IS" and "AS AVAILABLE" basis. We make no warranties, expressed
                    or implied, regarding the Service's reliability, accuracy, or
                    availability.
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* Governing Law */}
          <section>
            <h2 className="text-3xl font-bold text-white mb-4">Governing Law</h2>
            <p className="text-gray-400 leading-relaxed">
              These Terms shall be governed and construed in accordance with the
              laws of the jurisdiction in which Retrack operates, without regard to
              its conflict of law provisions. Any disputes arising from these Terms
              will be resolved in the courts of that jurisdiction.
            </p>
          </section>

          {/* Changes to Terms */}
          <section>
            <h2 className="text-3xl font-bold text-white mb-4">
              Changes to These Terms
            </h2>
            <p className="text-gray-400 leading-relaxed mb-4">
              We reserve the right to modify or replace these Terms at any time. If
              a revision is material, we will provide at least 30 days' notice
              prior to any new terms taking effect. What constitutes a material
              change will be determined at our sole discretion.
            </p>
            <p className="text-gray-400 leading-relaxed">
              By continuing to access or use our Service after any revisions become
              effective, you agree to be bound by the revised terms. If you do not
              agree to the new terms, you are no longer authorized to use the
              Service.
            </p>
          </section>

          {/* Contact Information */}
          <section>
            <h2 className="text-3xl font-bold text-white mb-4">Contact Us</h2>
            <p className="text-gray-400 mb-4 leading-relaxed">
              If you have any questions about these Terms of Service, please
              contact us:
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
            <Link href="/privacy" className="hover:text-white">
              Privacy Policy
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
