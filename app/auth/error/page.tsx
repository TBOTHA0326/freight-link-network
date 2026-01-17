'use client';

import Link from 'next/link';
import { XCircle, Truck, ArrowRight, RefreshCw } from 'lucide-react';

export default function AuthErrorPage() {
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
            {/* Error Icon */}
            <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <XCircle className="w-10 h-10 text-red-600" />
            </div>

            {/* Error Message */}
            <h1 className="text-2xl font-bold text-[#06082C] mb-3">
              Verification Failed
            </h1>
            <p className="text-gray-600 mb-8">
              We couldn&apos;t verify your email. The link may have expired or 
              already been used. Please try again or contact support if the 
              problem persists.
            </p>

            {/* Possible Reasons */}
            <div className="bg-gray-50 rounded-xl p-4 mb-8 text-left">
              <h3 className="font-semibold text-[#06082C] mb-3">This can happen if:</h3>
              <ul className="space-y-2 text-sm text-gray-600">
                <li className="flex items-start gap-2">
                  <span className="text-gray-400">•</span>
                  <span>The verification link has expired</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-gray-400">•</span>
                  <span>The link was already used</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-gray-400">•</span>
                  <span>The link was copied incorrectly</span>
                </li>
              </ul>
            </div>

            {/* Action Buttons */}
            <div className="space-y-3">
              <Link
                href="/register"
                className="w-full inline-flex items-center justify-center gap-2 bg-[#06082C] text-white py-3 px-6 rounded-xl font-semibold hover:bg-[#0a0f4a] transition-colors"
              >
                <RefreshCw className="w-5 h-5" />
                Try Registering Again
              </Link>
              
              <Link
                href="/login"
                className="w-full inline-flex items-center justify-center gap-2 bg-gray-100 text-[#06082C] py-3 px-6 rounded-xl font-semibold hover:bg-gray-200 transition-colors"
              >
                Go to Login
                <ArrowRight className="w-5 h-5" />
              </Link>
            </div>

            {/* Support Link */}
            <div className="mt-6 pt-6 border-t border-gray-200">
              <p className="text-sm text-gray-500">
                Still having trouble?{' '}
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
