import { Loader2 } from 'lucide-react';

export default function Loading() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        {/* Animated Logo/Spinner */}
        <div className="relative w-20 h-20 mx-auto mb-6">
          <div className="absolute inset-0 border-4 border-gray-200 rounded-full"></div>
          <div className="absolute inset-0 border-4 border-[#06082C] rounded-full border-t-transparent animate-spin"></div>
          <div className="absolute inset-2 border-4 border-gray-200 rounded-full"></div>
          <div className="absolute inset-2 border-4 border-[#9B2640] rounded-full border-t-transparent animate-spin" style={{ animationDirection: 'reverse', animationDuration: '1s' }}></div>
        </div>

        {/* Loading Text */}
        <h2 className="text-xl font-semibold text-[#06082C] mb-2">
          Loading...
        </h2>
        <p className="text-gray-500 text-sm">
          Please wait while we prepare your content
        </p>
      </div>
    </div>
  );
}
