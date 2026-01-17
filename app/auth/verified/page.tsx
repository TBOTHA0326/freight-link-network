'use client';

import Link from 'next/link';
import { CheckCircle, Truck, ArrowRight } from 'lucide-react';

export default function EmailVerifiedPage() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 py-4">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Link href="/" className="flex items-center gap-2 w-fit">
            <div className="w-10 h-10 bg-[#06082C] rounded-lg flex items-center justify-center">
              <Truck className="w-6 h-6 text-white" />
            </div>
            <span className="text-xl font-bold text-[#06082C]">
              Freight Link Network
            </span>
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex items-center justify-center py-12 px-4">
        <div className="w-full max-w-md">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 text-center">
            {/* Success Icon */}
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="w-10 h-10 text-green-600" />
            </div>

            {/* Success Message */}
            <h1 className="text-2xl font-bold text-[#06082C] mb-3">
              Email Verified Successfully!
            </h1>
            <p className="text-gray-600 mb-8">
              Your email has been verified and your account is now active. 
              You can now log in to access your dashboard and start using 
              Freight Link Network.
            </p>

            {/* Benefits Reminder */}
            <div className="bg-gray-50 rounded-xl p-4 mb-8 text-left">
              <h3 className="font-semibold text-[#06082C] mb-3">What&apos;s next?</h3>
              <ul className="space-y-2 text-sm text-gray-600">
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                  <span>Log in to your account</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                  <span>Complete your company profile</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                  <span>Upload required documents for verification</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                  <span>Start connecting with partners</span>
                </li>
              </ul>
            </div>

            {/* CTA Button */}
            <Link
              href="/login"
              className="w-full inline-flex items-center justify-center gap-2 bg-[#06082C] text-white py-3 px-6 rounded-xl font-semibold hover:bg-[#0a0f4a] transition-colors"
            >
              Continue to Login
              <ArrowRight className="w-5 h-5" />
            </Link>

            {/* Additional Links */}
            <div className="mt-6 pt-6 border-t border-gray-200">
              <p className="text-sm text-gray-500">
                Need help getting started?{' '}
                <Link href="/contact" className="text-[#06082C] font-medium hover:underline">
                  Contact Support
                </Link>
              </p>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 py-4">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-sm text-gray-500">
          © {new Date().getFullYear()} Freight Link Network. All rights reserved.
        </div>
      </footer>
    </div>
  );
}
