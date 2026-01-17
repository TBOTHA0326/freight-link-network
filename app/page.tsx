import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { 
  Truck, 
  Package, 
  Shield, 
  MapPin, 
  Clock, 
  Users,
  ArrowRight,
  CheckCircle2
} from 'lucide-react';

const features = [
  {
    icon: <Truck className="w-8 h-8" />,
    title: 'Fleet Management',
    description: 'Manage your trucks, trailers, and drivers all in one place with comprehensive tracking and documentation.',
  },
  {
    icon: <Package className="w-8 h-8" />,
    title: 'Load Matching',
    description: 'Suppliers can post loads and transporters can find available loads that match their capabilities.',
  },
  {
    icon: <MapPin className="w-8 h-8" />,
    title: 'Interactive Maps',
    description: 'View all available loads on an interactive map with detailed route information and distances.',
  },
  {
    icon: <Shield className="w-8 h-8" />,
    title: 'Verified Partners',
    description: 'All transporters and suppliers go through a verification process to ensure quality and reliability.',
  },
  {
    icon: <Clock className="w-8 h-8" />,
    title: 'Real-time Updates',
    description: 'Stay updated with real-time notifications on load status, approvals, and important changes.',
  },
  {
    icon: <Users className="w-8 h-8" />,
    title: 'Driver Management',
    description: 'Keep track of your drivers, their documents, licenses, and assign them to loads efficiently.',
  },
];

const benefits = [
  'No commissions or hidden fees',
  'Direct connection between transporters and suppliers',
  'Document management and verification',
  'Cross-border load support',
  'Real-time load tracking',
  'Secure platform with role-based access',
];

export default function Home() {
  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      
      {/* Hero Section */}
      <section className="relative bg-[#06082C] overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-[#06082C] via-[#0a0e40] to-[#06082C]" />
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-20 w-72 h-72 bg-[#9B2640] rounded-full blur-3xl" />
          <div className="absolute bottom-20 right-20 w-96 h-96 bg-blue-600 rounded-full blur-3xl" />
        </div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 md:py-32">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold text-white mb-6">
              Connect. Transport. Deliver.
            </h1>
            <p className="text-xl md:text-2xl text-gray-300 max-w-3xl mx-auto mb-10">
              South Africa&apos;s premier logistics platform connecting reliable transporters 
              with suppliers who need their goods moved safely and efficiently.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                href="/register"
                className="inline-flex items-center gap-2 px-8 py-4 bg-[#9B2640] text-white rounded-lg font-medium text-lg hover:bg-[#7a1e33] transition-colors"
              >
                Get Started Free
                <ArrowRight className="w-5 h-5" />
              </Link>
              <Link
                href="/about"
                className="inline-flex items-center gap-2 px-8 py-4 bg-white/10 text-white rounded-lg font-medium text-lg hover:bg-white/20 transition-colors"
              >
                Learn More
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-12 bg-gray-50 border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div>
              <p className="text-4xl font-bold text-[#06082C]">500+</p>
              <p className="text-gray-500 mt-1">Registered Transporters</p>
            </div>
            <div>
              <p className="text-4xl font-bold text-[#06082C]">1,000+</p>
              <p className="text-gray-500 mt-1">Loads Completed</p>
            </div>
            <div>
              <p className="text-4xl font-bold text-[#06082C]">200+</p>
              <p className="text-gray-500 mt-1">Active Suppliers</p>
            </div>
            <div>
              <p className="text-4xl font-bold text-[#06082C]">9</p>
              <p className="text-gray-500 mt-1">Provinces Covered</p>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-[#06082C] mb-4">
              Everything You Need to Manage Logistics
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Our platform provides all the tools you need to streamline your logistics operations, 
              whether you&apos;re a transporter or a supplier.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div
                key={index}
                className="p-6 bg-white rounded-xl border border-gray-200 hover:border-[#06082C] hover:shadow-lg transition-all duration-300"
              >
                <div className="w-14 h-14 bg-[#06082C]/5 rounded-lg flex items-center justify-center text-[#06082C] mb-4">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-semibold text-[#06082C] mb-2">
                  {feature.title}
                </h3>
                <p className="text-gray-600">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-[#06082C] mb-6">
                Why Choose Freight Link Network?
              </h2>
              <p className="text-lg text-gray-600 mb-8">
                We&apos;re building the most trusted logistics network in South Africa. 
                Join hundreds of transporters and suppliers who are already saving time 
                and growing their business with us.
              </p>
              <ul className="space-y-4">
                {benefits.map((benefit, index) => (
                  <li key={index} className="flex items-center gap-3">
                    <CheckCircle2 className="w-5 h-5 text-[#9B2640] flex-shrink-0" />
                    <span className="text-gray-700">{benefit}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="bg-[#06082C] rounded-2xl p-8 text-white">
              <h3 className="text-2xl font-bold mb-4">Ready to Get Started?</h3>
              <p className="text-gray-300 mb-6">
                Join our platform today and start connecting with verified partners. 
                Registration is free and takes only a few minutes.
              </p>
              <div className="space-y-4">
                <Link
                  href="/register?role=transporter"
                  className="block w-full px-6 py-3 bg-white text-[#06082C] rounded-lg font-medium text-center hover:bg-gray-100 transition-colors"
                >
                  Register as Transporter
                </Link>
                <Link
                  href="/register?role=supplier"
                  className="block w-full px-6 py-3 bg-[#9B2640] text-white rounded-lg font-medium text-center hover:bg-[#7a1e33] transition-colors"
                >
                  Register as Supplier
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-[#06082C] mb-4">
              How It Works
            </h2>
            <p className="text-lg text-gray-600">
              Get started in three simple steps
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-[#06082C] rounded-full flex items-center justify-center text-white text-2xl font-bold mx-auto mb-6">
                1
              </div>
              <h3 className="text-xl font-semibold text-[#06082C] mb-2">
                Register & Verify
              </h3>
              <p className="text-gray-600">
                Create your account, upload your company documents, and get verified by our team.
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-[#9B2640] rounded-full flex items-center justify-center text-white text-2xl font-bold mx-auto mb-6">
                2
              </div>
              <h3 className="text-xl font-semibold text-[#06082C] mb-2">
                Add Your Details
              </h3>
              <p className="text-gray-600">
                Transporters add their fleet details. Suppliers can start posting loads immediately.
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-[#06082C] rounded-full flex items-center justify-center text-white text-2xl font-bold mx-auto mb-6">
                3
              </div>
              <h3 className="text-xl font-semibold text-[#06082C] mb-2">
                Connect & Deliver
              </h3>
              <p className="text-gray-600">
                Find matching loads, connect with partners, and complete deliveries efficiently.
              </p>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
