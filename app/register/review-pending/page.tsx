import Link from "next/link";
import Image from "next/image";
import { Clock, CheckCircle2, Mail } from "lucide-react";

export default function ReviewPendingPage() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full text-center">
        <Link href="/" className="inline-block bg-[#06082C] rounded-xl px-4 py-2 mb-8">
          <Image src="/FLNSITELOGONAV.png" alt="Freight Link Network" width={140} height={35} style={{ height: "auto" }} className="object-contain" />
        </Link>
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8 animate-fade-in">
          <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center mx-auto mb-5">
            <Clock size={28} className="text-blue-600" />
          </div>
          <h1 className="text-xl font-bold text-gray-900 mb-2">Under Review</h1>
          <p className="text-sm text-gray-500 mb-6 leading-relaxed">
            Your company setup has been submitted and is currently being reviewed by our admin team.
            This typically takes 1–2 business days.
          </p>
          <div className="space-y-3 mb-6 text-left">
            {[
              { icon: CheckCircle2, text: "Account created successfully", done: true },
              { icon: CheckCircle2, text: "Company profile submitted", done: true },
              { icon: Clock, text: "Document review in progress", done: false },
              { icon: Mail, text: "Activation email on approval", done: false },
            ].map((s, i) => (
              <div key={i} className="flex items-center gap-3">
                <s.icon size={16} className={s.done ? "text-green-500" : "text-gray-300"} />
                <span className={`text-sm ${s.done ? "text-gray-700" : "text-gray-400"}`}>{s.text}</span>
              </div>
            ))}
          </div>
          <Link
            href="/login"
            className="block w-full bg-[#06082C] hover:bg-[#0a0e40] text-white font-semibold py-3 rounded-xl transition-colors text-sm text-center"
          >
            Back to Sign In
          </Link>
        </div>
      </div>
    </div>
  );
}
