'use client';

import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { FileText, Shield, AlertTriangle, Scale, Clock, Mail } from 'lucide-react';

export default function TermsPage() {
  const lastUpdated = '1 February 2026';

  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      
      {/* Header */}
      <section className="bg-[#06082C] py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <FileText className="w-16 h-16 text-white mx-auto mb-4" />
            <h1 className="text-4xl font-bold text-white mb-4">
              Terms &amp; Conditions
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
                <Scale className="w-6 h-6 text-[#9B2640]" />
                1. Introduction and Acceptance
              </h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                Welcome to Freight Link Network (&quot;the Platform&quot;, &quot;we&quot;, &quot;us&quot;, or &quot;our&quot;). These Terms and Conditions (&quot;Terms&quot;) govern your access to and use of our logistics platform, which connects transporters and suppliers for freight and cargo transportation services across South Africa and neighbouring countries.
              </p>
              <p className="text-gray-700 leading-relaxed mb-4">
                By creating an account, accessing, or using the Platform, you (&quot;User&quot;, &quot;you&quot;, or &quot;your&quot;) agree to be bound by these Terms. If you do not agree to these Terms, you must not use the Platform.
              </p>
              <p className="text-gray-700 leading-relaxed">
                These Terms constitute a legally binding agreement between you and Freight Link Network (Pty) Ltd, a company registered in South Africa.
              </p>
            </div>

            {/* Definitions */}
            <div className="mb-12">
              <h2 className="text-2xl font-bold text-[#06082C] mb-4">
                2. Definitions
              </h2>
              <ul className="list-disc pl-6 text-gray-700 space-y-2">
                <li><strong>&quot;Transporter&quot;</strong> means a registered user who provides freight transportation services using their own vehicles, drivers, and equipment.</li>
                <li><strong>&quot;Supplier&quot;</strong> means a registered user who posts loads requiring transportation services.</li>
                <li><strong>&quot;Load&quot;</strong> means cargo, freight, or goods posted on the Platform for transportation.</li>
                <li><strong>&quot;Company&quot;</strong> means a business entity registered on the Platform by a Transporter or Supplier.</li>
                <li><strong>&quot;Documents&quot;</strong> means any certificates, licenses, permits, or other documentation uploaded to the Platform.</li>
                <li><strong>&quot;Cross-Border Load&quot;</strong> means a Load requiring transportation across international borders.</li>
              </ul>
            </div>

            {/* User Accounts */}
            <div className="mb-12">
              <h2 className="text-2xl font-bold text-[#06082C] mb-4 flex items-center gap-2">
                <Shield className="w-6 h-6 text-[#9B2640]" />
                3. User Accounts and Registration
              </h2>
              <h3 className="text-xl font-semibold text-[#06082C] mb-3">3.1 Account Creation</h3>
              <p className="text-gray-700 leading-relaxed mb-4">
                To use the Platform, you must create an account by providing accurate, complete, and current information. You are responsible for maintaining the confidentiality of your account credentials and for all activities that occur under your account.
              </p>
              
              <h3 className="text-xl font-semibold text-[#06082C] mb-3">3.2 Eligibility</h3>
              <p className="text-gray-700 leading-relaxed mb-4">
                You must be at least 18 years old and have the legal authority to enter into binding contracts to use this Platform. If registering on behalf of a company, you represent that you have the authority to bind that company to these Terms.
              </p>

              <h3 className="text-xl font-semibold text-[#06082C] mb-3">3.3 Company Verification</h3>
              <p className="text-gray-700 leading-relaxed mb-4">
                Transporters and Suppliers must complete company profile setup and submit required documentation for verification. We reserve the right to approve or reject any company registration based on our verification criteria. Required documents may include:
              </p>
              <ul className="list-disc pl-6 text-gray-700 space-y-2 mb-4">
                <li>Company registration documents (CIPC)</li>
                <li>Tax clearance certificates</li>
                <li>Valid operating licenses</li>
                <li>Insurance certificates</li>
                <li>Vehicle registration and roadworthy certificates (for Transporters)</li>
                <li>Driver&apos;s licenses and Professional Driving Permits (PDP)</li>
              </ul>
            </div>

            {/* Platform Services */}
            <div className="mb-12">
              <h2 className="text-2xl font-bold text-[#06082C] mb-4">
                4. Platform Services
              </h2>
              <h3 className="text-xl font-semibold text-[#06082C] mb-3">4.1 Nature of Service</h3>
              <p className="text-gray-700 leading-relaxed mb-4">
                Freight Link Network operates as an intermediary platform that connects Transporters and Suppliers. We do not:
              </p>
              <ul className="list-disc pl-6 text-gray-700 space-y-2 mb-4">
                <li>Provide transportation services directly</li>
                <li>Own or operate any vehicles</li>
                <li>Employ any drivers</li>
                <li>Take possession of any cargo or goods</li>
                <li>Guarantee the availability of transportation services</li>
              </ul>

              <h3 className="text-xl font-semibold text-[#06082C] mb-3">4.2 Load Posting and Matching</h3>
              <p className="text-gray-700 leading-relaxed mb-4">
                Suppliers may post Loads on the Platform specifying pickup and delivery locations, dates, cargo type, weight, and other relevant details. Transporters may view and express interest in approved Loads that match their capabilities and equipment.
              </p>

              <h3 className="text-xl font-semibold text-[#06082C] mb-3">4.3 No Commission Model</h3>
              <p className="text-gray-700 leading-relaxed">
                Freight Link Network does not charge commissions on completed transactions. However, we reserve the right to introduce subscription fees, premium features, or other service charges with appropriate notice.
              </p>
            </div>

            {/* Responsibilities */}
            <div className="mb-12">
              <h2 className="text-2xl font-bold text-[#06082C] mb-4 flex items-center gap-2">
                <AlertTriangle className="w-6 h-6 text-[#9B2640]" />
                5. User Responsibilities
              </h2>
              <h3 className="text-xl font-semibold text-[#06082C] mb-3">5.1 Transporter Responsibilities</h3>
              <p className="text-gray-700 leading-relaxed mb-2">As a Transporter, you agree to:</p>
              <ul className="list-disc pl-6 text-gray-700 space-y-2 mb-4">
                <li>Maintain valid licenses, permits, and insurance for all vehicles and drivers</li>
                <li>Ensure all vehicles are roadworthy and properly maintained</li>
                <li>Comply with all applicable transportation laws and regulations</li>
                <li>Handle all cargo with due care and diligence</li>
                <li>Deliver Loads within agreed timeframes</li>
                <li>Maintain accurate records of all documentation</li>
                <li>Not transport prohibited, illegal, or undeclared hazardous materials</li>
              </ul>

              <h3 className="text-xl font-semibold text-[#06082C] mb-3">5.2 Supplier Responsibilities</h3>
              <p className="text-gray-700 leading-relaxed mb-2">As a Supplier, you agree to:</p>
              <ul className="list-disc pl-6 text-gray-700 space-y-2 mb-4">
                <li>Provide accurate and complete information about Loads</li>
                <li>Ensure cargo is properly packaged and labeled</li>
                <li>Disclose any hazardous or special handling requirements</li>
                <li>Make cargo available for collection as specified</li>
                <li>Pay agreed transportation fees promptly</li>
                <li>Not post illegal or prohibited goods for transportation</li>
              </ul>
            </div>

            {/* Prohibited Activities */}
            <div className="mb-12">
              <h2 className="text-2xl font-bold text-[#06082C] mb-4">
                6. Prohibited Activities
              </h2>
              <p className="text-gray-700 leading-relaxed mb-4">Users are prohibited from:</p>
              <ul className="list-disc pl-6 text-gray-700 space-y-2">
                <li>Providing false, misleading, or fraudulent information</li>
                <li>Posting or transporting illegal goods, contraband, or stolen property</li>
                <li>Using the Platform for money laundering or other illegal activities</li>
                <li>Attempting to circumvent Platform fees or verification procedures</li>
                <li>Harassing, threatening, or abusing other users</li>
                <li>Interfering with the Platform&apos;s operation or security</li>
                <li>Creating multiple accounts without authorization</li>
                <li>Sharing account credentials with unauthorized parties</li>
                <li>Scraping, copying, or republishing Platform data without permission</li>
              </ul>
            </div>

            {/* Liability */}
            <div className="mb-12">
              <h2 className="text-2xl font-bold text-[#06082C] mb-4">
                7. Limitation of Liability
              </h2>
              <h3 className="text-xl font-semibold text-[#06082C] mb-3">7.1 Platform Disclaimer</h3>
              <p className="text-gray-700 leading-relaxed mb-4">
                THE PLATFORM IS PROVIDED &quot;AS IS&quot; AND &quot;AS AVAILABLE&quot; WITHOUT WARRANTIES OF ANY KIND, EITHER EXPRESS OR IMPLIED. WE DO NOT WARRANT THAT THE PLATFORM WILL BE UNINTERRUPTED, ERROR-FREE, OR SECURE.
              </p>

              <h3 className="text-xl font-semibold text-[#06082C] mb-3">7.2 Transportation Liability</h3>
              <p className="text-gray-700 leading-relaxed mb-4">
                Freight Link Network is not liable for:
              </p>
              <ul className="list-disc pl-6 text-gray-700 space-y-2 mb-4">
                <li>Loss, damage, or delay to cargo during transportation</li>
                <li>Actions or omissions of Transporters or Suppliers</li>
                <li>Disputes between users regarding payment or service quality</li>
                <li>Accuracy of information provided by users</li>
                <li>Losses arising from unauthorized access to accounts</li>
              </ul>

              <h3 className="text-xl font-semibold text-[#06082C] mb-3">7.3 Maximum Liability</h3>
              <p className="text-gray-700 leading-relaxed">
                To the maximum extent permitted by law, our total liability for any claims arising from your use of the Platform shall not exceed the fees paid by you to us in the twelve (12) months preceding the claim.
              </p>
            </div>

            {/* Indemnification */}
            <div className="mb-12">
              <h2 className="text-2xl font-bold text-[#06082C] mb-4">
                8. Indemnification
              </h2>
              <p className="text-gray-700 leading-relaxed">
                You agree to indemnify, defend, and hold harmless Freight Link Network, its directors, officers, employees, and agents from any claims, damages, losses, liabilities, and expenses (including legal fees) arising from your use of the Platform, violation of these Terms, or infringement of any rights of third parties.
              </p>
            </div>

            {/* Intellectual Property */}
            <div className="mb-12">
              <h2 className="text-2xl font-bold text-[#06082C] mb-4">
                9. Intellectual Property
              </h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                All content, trademarks, logos, and intellectual property on the Platform are owned by or licensed to Freight Link Network. You may not use, copy, modify, or distribute any Platform content without our prior written consent.
              </p>
              <p className="text-gray-700 leading-relaxed">
                By uploading content to the Platform, you grant us a non-exclusive, worldwide, royalty-free license to use, display, and distribute such content in connection with operating the Platform.
              </p>
            </div>

            {/* Privacy */}
            <div className="mb-12">
              <h2 className="text-2xl font-bold text-[#06082C] mb-4">
                10. Privacy and Data Protection
              </h2>
              <p className="text-gray-700 leading-relaxed">
                Your privacy is important to us. Our collection and use of personal information is governed by our <a href="/privacy" className="text-[#9B2640] hover:underline">Privacy Policy</a>, which forms part of these Terms. By using the Platform, you consent to our data practices as described in the Privacy Policy.
              </p>
            </div>

            {/* Termination */}
            <div className="mb-12">
              <h2 className="text-2xl font-bold text-[#06082C] mb-4 flex items-center gap-2">
                <Clock className="w-6 h-6 text-[#9B2640]" />
                11. Termination
              </h2>
              <h3 className="text-xl font-semibold text-[#06082C] mb-3">11.1 Termination by User</h3>
              <p className="text-gray-700 leading-relaxed mb-4">
                You may terminate your account at any time by contacting our support team. Any pending transactions must be completed before account closure.
              </p>

              <h3 className="text-xl font-semibold text-[#06082C] mb-3">11.2 Termination by Us</h3>
              <p className="text-gray-700 leading-relaxed mb-4">
                We may suspend or terminate your account immediately if you:
              </p>
              <ul className="list-disc pl-6 text-gray-700 space-y-2 mb-4">
                <li>Violate these Terms or our policies</li>
                <li>Engage in fraudulent or illegal activities</li>
                <li>Provide false information during registration</li>
                <li>Fail to maintain required documentation or licenses</li>
                <li>Receive multiple complaints from other users</li>
              </ul>
            </div>

            {/* Disputes */}
            <div className="mb-12">
              <h2 className="text-2xl font-bold text-[#06082C] mb-4">
                12. Dispute Resolution
              </h2>
              <h3 className="text-xl font-semibold text-[#06082C] mb-3">12.1 Between Users</h3>
              <p className="text-gray-700 leading-relaxed mb-4">
                Disputes between Transporters and Suppliers should be resolved directly between the parties. Freight Link Network may, at its sole discretion, assist in mediation but is not obligated to do so.
              </p>

              <h3 className="text-xl font-semibold text-[#06082C] mb-3">12.2 With Freight Link Network</h3>
              <p className="text-gray-700 leading-relaxed">
                Any disputes with Freight Link Network shall be governed by the laws of the Republic of South Africa and subject to the exclusive jurisdiction of the courts of South Africa. Before initiating legal proceedings, you agree to attempt resolution through our complaints procedure and mediation.
              </p>
            </div>

            {/* Modifications */}
            <div className="mb-12">
              <h2 className="text-2xl font-bold text-[#06082C] mb-4">
                13. Modifications to Terms
              </h2>
              <p className="text-gray-700 leading-relaxed">
                We reserve the right to modify these Terms at any time. Material changes will be notified via email or Platform notification at least 30 days before taking effect. Continued use of the Platform after changes become effective constitutes acceptance of the modified Terms.
              </p>
            </div>

            {/* General */}
            <div className="mb-12">
              <h2 className="text-2xl font-bold text-[#06082C] mb-4">
                14. General Provisions
              </h2>
              <ul className="list-disc pl-6 text-gray-700 space-y-4">
                <li><strong>Entire Agreement:</strong> These Terms constitute the entire agreement between you and Freight Link Network regarding your use of the Platform.</li>
                <li><strong>Severability:</strong> If any provision of these Terms is found invalid, the remaining provisions shall continue in full force and effect.</li>
                <li><strong>Waiver:</strong> Our failure to enforce any right or provision shall not constitute a waiver of such right or provision.</li>
                <li><strong>Assignment:</strong> You may not assign your rights under these Terms without our written consent. We may assign our rights to any successor or affiliate.</li>
                <li><strong>Force Majeure:</strong> We shall not be liable for any failure to perform due to circumstances beyond our reasonable control.</li>
              </ul>
            </div>

            {/* Contact */}
            <div className="mb-12 bg-gray-50 p-6 rounded-xl border border-gray-200">
              <h2 className="text-2xl font-bold text-[#06082C] mb-4 flex items-center gap-2">
                <Mail className="w-6 h-6 text-[#9B2640]" />
                15. Contact Information
              </h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                For questions about these Terms or our Platform, please contact us:
              </p>
              <ul className="text-gray-700 space-y-2">
                <li><strong>Email:</strong> legal@freightlink.co.za</li>
                <li><strong>Phone:</strong> +27 12 345 6789</li>
                <li><strong>Address:</strong> 123 Logistics Drive, Johannesburg, South Africa</li>
              </ul>
            </div>

          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
