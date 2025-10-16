"use client";

import Link from "next/link";
import { Mail, MessageSquare, Phone, MapPin, Send } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    // Simulate form submission
    await new Promise((resolve) => setTimeout(resolve, 1000));
    setLoading(false);
    setSubmitted(true);
    setFormData({ name: "", email: "", subject: "", message: "" });
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  return (
    <div className="min-h-screen pt-20">
      {/* Hero Section */}
      <div className="relative py-20 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-block px-4 py-1.5 rounded-full bg-white/10 border border-white/20 text-white text-sm font-medium mb-6">
            Contact Us
          </div>
          <h1 className="text-5xl md:text-6xl font-bold text-white mb-6">
            Get in Touch
          </h1>
          <p className="text-xl text-gray-400 leading-relaxed">
            Have a question or need assistance? We're here to help. Reach out to
            our team and we'll get back to you as soon as possible.
          </p>
        </div>
      </div>

      {/* Contact Card */}
      <div className="max-w-4xl mx-auto px-6 pb-12">
        <div className="flex justify-center">
          <div className="bg-white/5 border border-white/10 rounded-2xl p-8 hover:bg-white/10 transition-colors max-w-md w-full">
            <div className="w-16 h-16 rounded-xl bg-blue-500/20 border border-blue-500/30 flex items-center justify-center mb-6 mx-auto">
              <Mail className="text-blue-400" size={32} />
            </div>
            <h3 className="text-white font-semibold text-2xl mb-3 text-center">Email Support</h3>
            <p className="text-gray-400 text-sm mb-4 text-center">
              Send us an email and we'll get back to you within 24 hours
            </p>
            <div className="text-center">
              <a
                href="mailto:2025retrack@gmail.com"
                className="text-blue-400 hover:text-blue-300 text-lg font-medium inline-block"
              >
                2025retrack@gmail.com
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* FAQ Section */}
      <div className="max-w-4xl mx-auto px-6 pb-20">
        <h2 className="text-3xl font-bold text-white mb-6 text-center">
          Frequently Asked Questions
        </h2>
        <div className="space-y-4">
          <div className="bg-white/5 border border-white/10 rounded-xl p-6">
            <h3 className="text-white font-semibold mb-2">
              What are your support hours?
            </h3>
            <p className="text-gray-400 text-sm">
              Our support team is available Monday to Friday, 9 AM to 6 PM EST.
              We typically respond to all inquiries within 24 hours.
            </p>
          </div>

          <div className="bg-white/5 border border-white/10 rounded-xl p-6">
            <h3 className="text-white font-semibold mb-2">
              Do you offer refunds?
            </h3>
            <p className="text-gray-400 text-sm">
              No, all sales are final. We do not offer refunds for our services. 
              However, you can cancel your subscription at any time to prevent 
              future charges.
            </p>
          </div>

          <div className="bg-white/5 border border-white/10 rounded-xl p-6">
            <h3 className="text-white font-semibold mb-2">
              How can I report a bug?
            </h3>
            <p className="text-gray-400 text-sm">
              Please email us at 2025retrack@gmail.com with a detailed description
              of the issue, including screenshots if possible. Our technical team
              will investigate and respond promptly.
            </p>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="border-t border-white/10 py-8">
        <div className="max-w-7xl mx-auto px-6 text-center text-gray-400 text-sm">
          <p>
            © {new Date().getFullYear()} Retrack. All rights reserved. •{" "}
            <Link href="/privacy" className="hover:text-white">
              Privacy Policy
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
