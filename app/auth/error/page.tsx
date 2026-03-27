import Link from "next/link";
import { AlertTriangle } from "lucide-react";

export default function AuthErrorPage() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8 max-w-sm w-full text-center animate-fade-in">
        <div className="w-14 h-14 bg-red-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <AlertTriangle size={24} className="text-red-600" />
        </div>
        <h1 className="text-lg font-bold text-gray-900 mb-2">Authentication Error</h1>
        <p className="text-sm text-gray-500 mb-6">Something went wrong during authentication. Please try again.</p>
        <Link href="/login" className="block w-full bg-[#06082C] hover:bg-[#0a0e40] text-white font-semibold py-3 rounded-xl transition-colors text-sm">
          Back to Sign In
        </Link>
      </div>
    </div>
  );
}
