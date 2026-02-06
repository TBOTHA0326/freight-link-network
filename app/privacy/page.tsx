'use client';

import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Shield, Eye, Lock, Database, Users, Mail, Globe, Clock, AlertTriangle } from 'lucide-react';

export default function PrivacyPage() {
  const lastUpdated = '1 February 2026';

  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      
      {/* Header */}
      <section className="bg-[#06082C] py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <Shield className="w-16 h-16 text-white mx-auto mb-4" />
            <h1 className="text-4xl font-bold text-white mb-4">
              Privacy Policy
            </h1>
            <p className="text-gray-300">
              Last updated: {lastUpdated}
            </p>
          </div>
        </div>
      </section>

      {/* Content */}
      <section className="py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="prose prose-lg max-w-none">
            
            {/* Introduction */}
            <div className="mb-12">
              <h2 className="text-2xl font-bold text-[#06082C] mb-4 flex items-center gap-2">
                <Eye className="w-6 h-6 text-[#9B2640]" />
                1. Introduction
              </h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                Freight Link Network (Pty) Ltd (&quot;we&quot;, &quot;us&quot;, &quot;our&quot;, or &quot;Freight Link Network&quot;) is committed to protecting your privacy and ensuring the security of your personal information. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our logistics platform (&quot;Platform&quot;).
              </p>
              <p className="text-gray-700 leading-relaxed mb-4">
                This policy complies with the Protection of Personal Information Act 4 of 2013 (POPIA) of South Africa and reflects international best practices for data protection.
              </p>
              <p className="text-gray-700 leading-relaxed">
                By using our Platform, you consent to the data practices described in this Privacy Policy. If you do not agree with these practices, please do not use our Platform.
              </p>
            </div>

            {/* Information We Collect */}
            <div className="mb-12">
              <h2 className="text-2xl font-bold text-[#06082C] mb-4 flex items-center gap-2">
                <Database className="w-6 h-6 text-[#9B2640]" />
                2. Information We Collect
              </h2>
              
              <h3 className="text-xl font-semibold text-[#06082C] mb-3">2.1 Personal Information</h3>
              <p className="text-gray-700 leading-relaxed mb-2">We collect the following personal information when you register and use our Platform:</p>
              <ul className="list-disc pl-6 text-gray-700 space-y-2 mb-4">
                <li><strong>Identity Information:</strong> Full name, ID number, date of birth</li>
                <li><strong>Contact Information:</strong> Email address, phone number, physical address</li>
                <li><strong>Account Information:</strong> Username, password (encrypted), account preferences</li>
                <li><strong>Professional Information:</strong> Driver&apos;s license number, Professional Driving Permit (PDP) details, qualifications</li>
              </ul>

              <h3 className="text-xl font-semibold text-[#06082C] mb-3">2.2 Company Information</h3>
              <p className="text-gray-700 leading-relaxed mb-2">For business accounts, we collect:</p>
              <ul className="list-disc pl-6 text-gray-700 space-y-2 mb-4">
                <li>Company name and registration number (CIPC)</li>
                <li>Tax registration number</li>
                <li>Business address and contact details</li>
                <li>Company directors and key personnel information</li>
                <li>Bank account details for payment purposes</li>
              </ul>

              <h3 className="text-xl font-semibold text-[#06082C] mb-3">2.3 Vehicle and Equipment Information</h3>
              <p className="text-gray-700 leading-relaxed mb-2">For transporters, we collect:</p>
              <ul className="list-disc pl-6 text-gray-700 space-y-2 mb-4">
                <li>Vehicle registration numbers and details</li>
                <li>Truck and trailer specifications</li>
                <li>Roadworthy certificates</li>
                <li>Insurance documentation</li>
              </ul>

              <h3 className="text-xl font-semibold text-[#06082C] mb-3">2.4 Documents and Uploads</h3>
              <p className="text-gray-700 leading-relaxed mb-2">We collect documents you upload, including:</p>
              <ul className="list-disc pl-6 text-gray-700 space-y-2 mb-4">
                <li>Identity documents (ID cards, passports)</li>
                <li>Company registration certificates</li>
                <li>Tax clearance certificates</li>
                <li>Licenses and permits</li>
                <li>Vehicle documentation</li>
                <li>Proof of insurance</li>
              </ul>

              <h3 className="text-xl font-semibold text-[#06082C] mb-3">2.5 Location Data</h3>
              <p className="text-gray-700 leading-relaxed mb-4">
                We collect location information including pickup and delivery addresses for loads, and may collect real-time location data from devices with your consent for load tracking purposes.
              </p>

              <h3 className="text-xl font-semibold text-[#06082C] mb-3">2.6 Usage Information</h3>
              <p className="text-gray-700 leading-relaxed mb-2">We automatically collect:</p>
              <ul className="list-disc pl-6 text-gray-700 space-y-2">
                <li>Device information (browser type, operating system, device identifiers)</li>
                <li>Log data (IP address, access times, pages viewed)</li>
                <li>Cookies and similar tracking technologies</li>
                <li>Platform interaction data (searches, clicks, preferences)</li>
              </ul>
            </div>

            {/* How We Use Information */}
            <div className="mb-12">
              <h2 className="text-2xl font-bold text-[#06082C] mb-4 flex items-center gap-2">
                <Users className="w-6 h-6 text-[#9B2640]" />
                3. How We Use Your Information
              </h2>
              <p className="text-gray-700 leading-relaxed mb-2">We use your information for the following purposes:</p>
              
              <h3 className="text-xl font-semibold text-[#06082C] mb-3">3.1 Platform Operations</h3>
              <ul className="list-disc pl-6 text-gray-700 space-y-2 mb-4">
                <li>Creating and managing your account</li>
                <li>Facilitating connections between transporters and suppliers</li>
                <li>Processing and displaying load postings</li>
                <li>Enabling communication between users</li>
                <li>Providing customer support</li>
              </ul>

              <h3 className="text-xl font-semibold text-[#06082C] mb-3">3.2 Verification and Compliance</h3>
              <ul className="list-disc pl-6 text-gray-700 space-y-2 mb-4">
                <li>Verifying your identity and company information</li>
                <li>Validating licenses, permits, and certifications</li>
                <li>Ensuring compliance with legal requirements</li>
                <li>Preventing fraud and unauthorized access</li>
              </ul>

              <h3 className="text-xl font-semibold text-[#06082C] mb-3">3.3 Communications</h3>
              <ul className="list-disc pl-6 text-gray-700 space-y-2 mb-4">
                <li>Sending service-related notifications</li>
                <li>Responding to your inquiries</li>
                <li>Sending marketing communications (with your consent)</li>
                <li>Notifying you of Platform updates and changes</li>
              </ul>

              <h3 className="text-xl font-semibold text-[#06082C] mb-3">3.4 Analytics and Improvement</h3>
              <ul className="list-disc pl-6 text-gray-700 space-y-2">
                <li>Analyzing Platform usage patterns</li>
                <li>Improving our services and user experience</li>
                <li>Developing new features and functionality</li>
                <li>Conducting research and generating statistics</li>
              </ul>
            </div>

            {/* Legal Basis */}
            <div className="mb-12">
              <h2 className="text-2xl font-bold text-[#06082C] mb-4">
                4. Legal Basis for Processing
              </h2>
              <p className="text-gray-700 leading-relaxed mb-2">Under POPIA, we process your personal information based on:</p>
              <ul className="list-disc pl-6 text-gray-700 space-y-2">
                <li><strong>Consent:</strong> You have given us permission to process your information</li>
                <li><strong>Contract:</strong> Processing is necessary to fulfill our agreement with you</li>
                <li><strong>Legal Obligation:</strong> We are required by law to process certain information</li>
                <li><strong>Legitimate Interest:</strong> Processing is necessary for our legitimate business interests, provided this does not override your rights</li>
              </ul>
            </div>

            {/* Information Sharing */}
            <div className="mb-12">
              <h2 className="text-2xl font-bold text-[#06082C] mb-4 flex items-center gap-2">
                <Globe className="w-6 h-6 text-[#9B2640]" />
                5. Information Sharing and Disclosure
              </h2>
              
              <h3 className="text-xl font-semibold text-[#06082C] mb-3">5.1 With Other Users</h3>
              <p className="text-gray-700 leading-relaxed mb-4">
                Certain information is shared with other Platform users to facilitate transactions:
              </p>
              <ul className="list-disc pl-6 text-gray-700 space-y-2 mb-4">
                <li>Company name and verification status</li>
                <li>Contact information for load coordination</li>
                <li>Vehicle and equipment capabilities (for transporters)</li>
                <li>Load details and requirements (for suppliers)</li>
              </ul>

              <h3 className="text-xl font-semibold text-[#06082C] mb-3">5.2 Service Providers</h3>
              <p className="text-gray-700 leading-relaxed mb-4">
                We may share information with trusted third-party service providers who assist us with:
              </p>
              <ul className="list-disc pl-6 text-gray-700 space-y-2 mb-4">
                <li>Cloud hosting and data storage (Supabase)</li>
                <li>Email and communication services</li>
                <li>Payment processing</li>
                <li>Analytics and performance monitoring</li>
                <li>Map and location services (Mapbox)</li>
              </ul>

              <h3 className="text-xl font-semibold text-[#06082C] mb-3">5.3 Legal Requirements</h3>
              <p className="text-gray-700 leading-relaxed mb-4">
                We may disclose your information when required by law, such as:
              </p>
              <ul className="list-disc pl-6 text-gray-700 space-y-2 mb-4">
                <li>Responding to court orders or legal processes</li>
                <li>Cooperating with law enforcement investigations</li>
                <li>Complying with regulatory requirements</li>
                <li>Protecting our legal rights and property</li>
              </ul>

              <h3 className="text-xl font-semibold text-[#06082C] mb-3">5.4 Business Transfers</h3>
              <p className="text-gray-700 leading-relaxed">
                In the event of a merger, acquisition, or sale of assets, your information may be transferred as part of that transaction. You will be notified of any such change.
              </p>
            </div>

            {/* Data Security */}
            <div className="mb-12">
              <h2 className="text-2xl font-bold text-[#06082C] mb-4 flex items-center gap-2">
                <Lock className="w-6 h-6 text-[#9B2640]" />
                6. Data Security
              </h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                We implement appropriate technical and organizational measures to protect your personal information, including:
              </p>
              <ul className="list-disc pl-6 text-gray-700 space-y-2 mb-4">
                <li>Encryption of data in transit (HTTPS/TLS) and at rest</li>
                <li>Secure authentication mechanisms</li>
                <li>Regular security assessments and penetration testing</li>
                <li>Access controls and employee training</li>
                <li>Secure data backup procedures</li>
                <li>Incident response and breach notification procedures</li>
              </ul>
              <p className="text-gray-700 leading-relaxed">
                While we strive to protect your information, no method of transmission over the internet or electronic storage is 100% secure. We cannot guarantee absolute security but are committed to implementing best practices.
              </p>
            </div>

            {/* Data Retention */}
            <div className="mb-12">
              <h2 className="text-2xl font-bold text-[#06082C] mb-4 flex items-center gap-2">
                <Clock className="w-6 h-6 text-[#9B2640]" />
                7. Data Retention
              </h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                We retain your personal information for as long as necessary to:
              </p>
              <ul className="list-disc pl-6 text-gray-700 space-y-2 mb-4">
                <li>Provide our services to you</li>
                <li>Comply with legal obligations</li>
                <li>Resolve disputes and enforce agreements</li>
                <li>Maintain business records as required by law</li>
              </ul>
              <p className="text-gray-700 leading-relaxed">
                Generally, we retain account data for the duration of your account plus five (5) years. Transaction records are retained for seven (7) years as required by South African tax law. After the retention period, data is securely deleted or anonymized.
              </p>
            </div>

            {/* Your Rights */}
            <div className="mb-12">
              <h2 className="text-2xl font-bold text-[#06082C] mb-4">
                8. Your Rights Under POPIA
              </h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                Under the Protection of Personal Information Act, you have the following rights:
              </p>
              <ul className="list-disc pl-6 text-gray-700 space-y-3">
                <li><strong>Right to Access:</strong> Request a copy of the personal information we hold about you</li>
                <li><strong>Right to Correction:</strong> Request correction of inaccurate or incomplete information</li>
                <li><strong>Right to Deletion:</strong> Request deletion of your personal information (subject to legal retention requirements)</li>
                <li><strong>Right to Object:</strong> Object to processing of your information for direct marketing</li>
                <li><strong>Right to Restriction:</strong> Request limitation on how we process your information</li>
                <li><strong>Right to Data Portability:</strong> Request your data in a structured, machine-readable format</li>
                <li><strong>Right to Withdraw Consent:</strong> Withdraw consent where processing is based on consent</li>
                <li><strong>Right to Complain:</strong> Lodge a complaint with the Information Regulator of South Africa</li>
              </ul>
              <p className="text-gray-700 leading-relaxed mt-4">
                To exercise these rights, please contact our Information Officer using the details provided below.
              </p>
            </div>

            {/* Cookies */}
            <div className="mb-12">
              <h2 className="text-2xl font-bold text-[#06082C] mb-4">
                9. Cookies and Tracking Technologies
              </h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                We use cookies and similar technologies to:
              </p>
              <ul className="list-disc pl-6 text-gray-700 space-y-2 mb-4">
                <li><strong>Essential Cookies:</strong> Required for Platform functionality (authentication, security)</li>
                <li><strong>Preference Cookies:</strong> Remember your settings and preferences</li>
                <li><strong>Analytics Cookies:</strong> Understand how users interact with our Platform</li>
                <li><strong>Performance Cookies:</strong> Monitor and improve Platform performance</li>
              </ul>
              <p className="text-gray-700 leading-relaxed">
                You can control cookies through your browser settings. However, disabling certain cookies may affect Platform functionality.
              </p>
            </div>

            {/* Third-Party Services */}
            <div className="mb-12">
              <h2 className="text-2xl font-bold text-[#06082C] mb-4">
                10. Third-Party Services
              </h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                Our Platform integrates with third-party services that have their own privacy policies:
              </p>
              <ul className="list-disc pl-6 text-gray-700 space-y-2 mb-4">
                <li><strong>Supabase:</strong> Database and authentication services</li>
                <li><strong>Mapbox:</strong> Map display and geocoding services</li>
                <li><strong>Cloud Storage:</strong> Document storage services</li>
              </ul>
              <p className="text-gray-700 leading-relaxed">
                We encourage you to review the privacy policies of these third-party services.
              </p>
            </div>

            {/* International Transfers */}
            <div className="mb-12">
              <h2 className="text-2xl font-bold text-[#06082C] mb-4">
                11. International Data Transfers
              </h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                Your information may be transferred to and processed in countries outside South Africa where our service providers are located. We ensure appropriate safeguards are in place for such transfers, including:
              </p>
              <ul className="list-disc pl-6 text-gray-700 space-y-2">
                <li>Standard contractual clauses</li>
                <li>Adequacy decisions</li>
                <li>Binding corporate rules</li>
                <li>Your explicit consent</li>
              </ul>
            </div>

            {/* Children's Privacy */}
            <div className="mb-12">
              <h2 className="text-2xl font-bold text-[#06082C] mb-4 flex items-center gap-2">
                <AlertTriangle className="w-6 h-6 text-[#9B2640]" />
                12. Children&apos;s Privacy
              </h2>
              <p className="text-gray-700 leading-relaxed">
                Our Platform is not intended for individuals under 18 years of age. We do not knowingly collect personal information from children. If we become aware that we have collected information from a child without parental consent, we will take steps to delete such information.
              </p>
            </div>

            {/* Updates */}
            <div className="mb-12">
              <h2 className="text-2xl font-bold text-[#06082C] mb-4">
                13. Updates to This Policy
              </h2>
              <p className="text-gray-700 leading-relaxed">
                We may update this Privacy Policy from time to time. Material changes will be notified via email or Platform notification at least 30 days before taking effect. The &quot;Last updated&quot; date at the top indicates when this policy was last revised. Continued use of the Platform after changes become effective constitutes acceptance of the updated policy.
              </p>
            </div>

            {/* Contact */}
            <div className="mb-12 bg-gray-50 p-6 rounded-xl border border-gray-200">
              <h2 className="text-2xl font-bold text-[#06082C] mb-4 flex items-center gap-2">
                <Mail className="w-6 h-6 text-[#9B2640]" />
                14. Contact Us
              </h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                For privacy-related inquiries, to exercise your rights, or to lodge a complaint:
              </p>
              
              <h3 className="text-lg font-semibold text-[#06082C] mb-2">Information Officer</h3>
              <ul className="text-gray-700 space-y-2 mb-6">
                <li><strong>Name:</strong> Freight Link Network Information Officer</li>
                <li><strong>Email:</strong> privacy@freightlink.co.za</li>
                <li><strong>Phone:</strong> +27 12 345 6789</li>
                <li><strong>Address:</strong> 123 Logistics Drive, Johannesburg, South Africa</li>
              </ul>

              <h3 className="text-lg font-semibold text-[#06082C] mb-2">Information Regulator of South Africa</h3>
              <p className="text-gray-700 leading-relaxed mb-2">
                If you are not satisfied with our response to your privacy concerns, you may lodge a complaint with:
              </p>
              <ul className="text-gray-700 space-y-2">
                <li><strong>Website:</strong> www.inforegulator.org.za</li>
                <li><strong>Email:</strong> complaints.IR@justice.gov.za</li>
                <li><strong>Phone:</strong> +27 10 023 5207</li>
              </ul>
            </div>

          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
