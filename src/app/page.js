// src/app/page.js
"use client";

import Link from "next/link";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  ArrowRight,
  QrCode,
  MessageSquare,
  Utensils,
  Settings,
} from "lucide-react";

export default function HomePage() {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <header className="bg-stone-900 text-white">
        <div className="container mx-auto px-4 py-16 md:py-24">
          <div className="flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="flex-1 space-y-6">
              <h1 className="text-4xl md:text-5xl font-bold tracking-tight">
                Restaurant QR Menu & Feedback System
              </h1>
              <p className="text-xl text-stone-300 max-w-xl">
                Enhance customer experience with digital menus and get valuable
                feedback to improve your restaurant.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 pt-4">
                <Button size="lg" asChild>
                  <Link href="/register">
                    Get Started Free
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  className="bg-transparent border-white text-white hover:bg-white hover:text-stone-900"
                  asChild
                >
                  <Link href="/login">Login</Link>
                </Button>
              </div>
            </div>
            <div className="flex-1 flex justify-center">
              <div className="relative w-full max-w-md">
                <div className="absolute -left-4 -top-4 bg-stone-800 rounded-lg w-full h-full"></div>
                <div className="relative bg-stone-700 rounded-lg p-6 shadow-xl">
                  <div className="flex justify-center mb-4">
                    <QrCode className="h-20 w-20 text-stone-300" />
                  </div>
                  <div className="bg-white rounded-lg p-4 mb-4">
                    <div className="flex flex-col space-y-2">
                      <div className="h-6 bg-stone-100 rounded"></div>
                      <div className="h-6 bg-stone-100 rounded w-3/4"></div>
                      <div className="h-6 bg-stone-100 rounded w-1/2"></div>
                    </div>
                  </div>
                  <div className="grid grid-cols-5 gap-2 mb-4">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <div key={star} className="flex justify-center">
                        <div className="h-8 w-8 rounded-full bg-amber-400"></div>
                      </div>
                    ))}
                  </div>
                  <div className="h-10 bg-stone-600 rounded-md"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Features Section */}
      <section className="py-16 bg-stone-50">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">Key Features</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <FeatureCard
              icon={<QrCode className="h-10 w-10 text-stone-700" />}
              title="QR Code Menus"
              description="Generate unique QR codes for each table that customers can scan to view your menu, no app required."
            />
            <FeatureCard
              icon={<MessageSquare className="h-10 w-10 text-stone-700" />}
              title="Customizable Feedback Forms"
              description="Create custom feedback forms with various question types to collect valuable insights from your customers."
            />
            <FeatureCard
              icon={<Utensils className="h-10 w-10 text-stone-700" />}
              title="Digital Menu Management"
              description="Easily update your menu items, prices, and availability without needing to print new menus."
            />
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-2">How It Works</h2>
          <p className="text-center text-stone-500 mb-12 max-w-2xl mx-auto">
            Our platform makes it easy to set up digital menus and collect
            feedback from your customers.
          </p>

          <div className="grid md:grid-cols-4 gap-8">
            <StepCard
              number="1"
              title="Create Your Account"
              description="Sign up and add your restaurant details to get started."
            />
            <StepCard
              number="2"
              title="Design Your Menu"
              description="Add categories, items, and customize your digital menu."
            />
            <StepCard
              number="3"
              title="Generate QR Codes"
              description="Create unique QR codes for each table in your restaurant."
            />
            <StepCard
              number="4"
              title="Collect Feedback"
              description="Receive and analyze customer feedback to improve your business."
            />
          </div>

          <div className="text-center mt-12">
            <Button size="lg" asChild>
              <Link href="/register">
                Start Your Free Trial
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="py-16 bg-stone-50">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-2">
            Simple Pricing
          </h2>
          <p className="text-center text-stone-500 mb-12 max-w-2xl mx-auto">
            Affordable plans for restaurants of all sizes.
          </p>

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            <PricingCard
              title="Basic"
              price="$49"
              period="per month"
              description="Perfect for small restaurants"
              features={[
                "Digital Menu",
                "QR Code Generation",
                "Basic Feedback Form",
                "Up to 20 Tables",
                "Email Support",
              ]}
              buttonText="Get Started"
              buttonHref="/register"
              highlighted={false}
            />
            <PricingCard
              title="Premium"
              price="$99"
              period="per month"
              description="For growing restaurants"
              features={[
                "Everything in Basic",
                "Advanced Feedback Forms",
                "Custom Branding",
                "Google Review Integration",
                "Up to 50 Tables",
                "Priority Support",
              ]}
              buttonText="Get Started"
              buttonHref="/register"
              highlighted={true}
            />
            <PricingCard
              title="Enterprise"
              price="Custom"
              period="pricing"
              description="For restaurant chains"
              features={[
                "Everything in Premium",
                "Multiple Locations",
                "API Access",
                "White Labeling",
                "Unlimited Tables",
                "Dedicated Support",
              ]}
              buttonText="Contact Us"
              buttonHref="/contact"
              highlighted={false}
            />
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-stone-900 text-white py-12">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <h3 className="text-xl font-bold mb-4">RestaurantQR</h3>
              <p className="text-stone-300">
                Enhancing restaurant experiences with digital solutions.
              </p>
            </div>
            <div>
              <h4 className="font-bold mb-4">Product</h4>
              <ul className="space-y-2">
                <li>
                  <Link href="#" className="text-stone-300 hover:text-white">
                    Features
                  </Link>
                </li>
                <li>
                  <Link href="#" className="text-stone-300 hover:text-white">
                    Pricing
                  </Link>
                </li>
                <li>
                  <Link href="#" className="text-stone-300 hover:text-white">
                    FAQ
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold mb-4">Company</h4>
              <ul className="space-y-2">
                <li>
                  <Link href="#" className="text-stone-300 hover:text-white">
                    About Us
                  </Link>
                </li>
                <li>
                  <Link href="#" className="text-stone-300 hover:text-white">
                    Blog
                  </Link>
                </li>
                <li>
                  <Link href="#" className="text-stone-300 hover:text-white">
                    Contact
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold mb-4">Legal</h4>
              <ul className="space-y-2">
                <li>
                  <Link href="#" className="text-stone-300 hover:text-white">
                    Privacy Policy
                  </Link>
                </li>
                <li>
                  <Link href="#" className="text-stone-300 hover:text-white">
                    Terms of Service
                  </Link>
                </li>
              </ul>
            </div>
          </div>
          <div className="border-t border-stone-700 mt-8 pt-8 text-center text-stone-300">
            <p>
              &copy; {new Date().getFullYear()} RestaurantQR. All rights
              reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}

// Feature Card Component
function FeatureCard({ icon, title, description }) {
  return (
    <div className="bg-white rounded-lg p-6 shadow-md">
      <div className="flex justify-center mb-4">{icon}</div>
      <h3 className="text-xl font-bold text-center mb-2">{title}</h3>
      <p className="text-center text-stone-600">{description}</p>
    </div>
  );
}

// Step Card Component
function StepCard({ number, title, description }) {
  return (
    <div className="flex flex-col items-center">
      <div className="flex items-center justify-center w-12 h-12 rounded-full bg-stone-200 text-stone-700 font-bold text-xl mb-4">
        {number}
      </div>
      <h3 className="text-xl font-bold text-center mb-2">{title}</h3>
      <p className="text-center text-stone-600">{description}</p>
    </div>
  );
}

// Pricing Card Component
function PricingCard({
  title,
  price,
  period,
  description,
  features,
  buttonText,
  buttonHref,
  highlighted,
}) {
  return (
    <div
      className={`rounded-lg p-6 shadow-md ${
        highlighted
          ? "bg-stone-800 text-white ring-2 ring-stone-500"
          : "bg-white"
      }`}
    >
      <h3 className="text-xl font-bold text-center mb-1">{title}</h3>
      <p
        className={`text-center ${
          highlighted ? "text-stone-300" : "text-stone-600"
        } mb-4`}
      >
        {description}
      </p>
      <div className="text-center mb-6">
        <span className="text-3xl font-bold">{price}</span>
        <span
          className={`${highlighted ? "text-stone-300" : "text-stone-500"}`}
        >
          {" "}
          {period}
        </span>
      </div>
      <ul className="space-y-3 mb-6">
        {features.map((feature, index) => (
          <li key={index} className="flex items-center">
            <Check
              className={`h-5 w-5 ${
                highlighted ? "text-stone-300" : "text-stone-700"
              } mr-2`}
            />
            <span>{feature}</span>
          </li>
        ))}
      </ul>
      <Button
        className={`w-full ${
          highlighted ? "bg-white text-stone-800 hover:bg-stone-100" : ""
        }`}
        asChild
      >
        <Link href={buttonHref}>{buttonText}</Link>
      </Button>
    </div>
  );
}

// Check Icon Component
function Check(props) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}
