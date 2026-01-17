import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Target, Eye, Heart, Users, Truck, Shield } from 'lucide-react';

const values = [
  {
    icon: <Shield className="w-8 h-8" />,
    title: 'Trust & Transparency',
    description: 'We believe in building trust through transparent practices and verified partnerships.',
  },
  {
    icon: <Heart className="w-8 h-8" />,
    title: 'Customer First',
    description: 'Our platform is designed with our users in mind, making logistics simple and efficient.',
  },
  {
    icon: <Users className="w-8 h-8" />,
    title: 'Community',
    description: 'We are building a community of reliable transporters and suppliers across South Africa.',
  },
];

const team = [
  {
    name: 'Leadership Team',
    description: 'Our experienced leadership team brings decades of combined experience in logistics, technology, and business development.',
  },
  {
    name: 'Operations',
    description: 'Our operations team ensures smooth onboarding, verification, and support for all our partners.',
  },
  {
    name: 'Technology',
    description: 'Our tech team builds and maintains a secure, reliable platform that scales with your business.',
  },
];

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-white">
      <Navbar />

      {/* Hero Section */}
      <section className="bg-[#06082C] py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-6">
            About Freight Link Network
          </h1>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            We&apos;re on a mission to revolutionize logistics in South Africa by connecting 
            transporters and suppliers on a single, trusted platform.
          </p>
        </div>
      </section>

      {/* Story Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold text-[#06082C] mb-6">Our Story</h2>
              <p className="text-gray-600 mb-4">
                Freight Link Network was founded with a simple idea: make it easier for 
                transporters and suppliers to find each other and work together efficiently.
              </p>
              <p className="text-gray-600 mb-4">
                We saw the challenges both sides faced - transporters driving empty trucks 
                back from deliveries, and suppliers struggling to find reliable transport 
                for their goods. Our platform bridges this gap.
              </p>
              <p className="text-gray-600">
                Today, we&apos;re proud to serve hundreds of transporters and suppliers across 
                all nine provinces of South Africa, facilitating thousands of successful 
                deliveries every month.
              </p>
            </div>
            <div className="bg-gray-100 rounded-2xl p-8">
              <div className="grid grid-cols-2 gap-6">
                <div className="text-center p-6 bg-white rounded-xl">
                  <Truck className="w-10 h-10 text-[#06082C] mx-auto mb-3" />
                  <p className="text-2xl font-bold text-[#06082C]">500+</p>
                  <p className="text-sm text-gray-500">Transporters</p>
                </div>
                <div className="text-center p-6 bg-white rounded-xl">
                  <Users className="w-10 h-10 text-[#9B2640] mx-auto mb-3" />
                  <p className="text-2xl font-bold text-[#06082C]">200+</p>
                  <p className="text-sm text-gray-500">Suppliers</p>
                </div>
                <div className="text-center p-6 bg-white rounded-xl">
                  <Target className="w-10 h-10 text-[#06082C] mx-auto mb-3" />
                  <p className="text-2xl font-bold text-[#06082C]">1,000+</p>
                  <p className="text-sm text-gray-500">Loads Completed</p>
                </div>
                <div className="text-center p-6 bg-white rounded-xl">
                  <Eye className="w-10 h-10 text-[#9B2640] mx-auto mb-3" />
                  <p className="text-2xl font-bold text-[#06082C]">9</p>
                  <p className="text-sm text-gray-500">Provinces</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Mission & Vision */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-12">
            <div className="bg-[#06082C] rounded-2xl p-8 text-white">
              <Target className="w-12 h-12 mb-4" />
              <h3 className="text-2xl font-bold mb-4">Our Mission</h3>
              <p className="text-gray-300">
                To create the most efficient and trusted logistics network in South Africa, 
                empowering transporters and suppliers to grow their businesses through 
                technology and transparency.
              </p>
            </div>
            <div className="bg-[#9B2640] rounded-2xl p-8 text-white">
              <Eye className="w-12 h-12 mb-4" />
              <h3 className="text-2xl font-bold mb-4">Our Vision</h3>
              <p className="text-gray-200">
                To become Africa&apos;s leading logistics platform, connecting businesses 
                across borders and driving economic growth through efficient transportation 
                of goods.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-[#06082C] mb-4">Our Values</h2>
            <p className="text-lg text-gray-600">
              These core values guide everything we do
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {values.map((value, index) => (
              <div key={index} className="text-center p-8 bg-white rounded-xl border border-gray-200">
                <div className="w-16 h-16 bg-[#06082C]/5 rounded-full flex items-center justify-center text-[#06082C] mx-auto mb-4">
                  {value.icon}
                </div>
                <h3 className="text-xl font-semibold text-[#06082C] mb-2">{value.title}</h3>
                <p className="text-gray-600">{value.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Team */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-[#06082C] mb-4">Our Team</h2>
            <p className="text-lg text-gray-600">
              Dedicated professionals working to make logistics better
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {team.map((dept, index) => (
              <div key={index} className="p-6 bg-white rounded-xl border border-gray-200">
                <h3 className="text-xl font-semibold text-[#06082C] mb-3">{dept.name}</h3>
                <p className="text-gray-600">{dept.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
