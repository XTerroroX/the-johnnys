// src/pages/PrivacyPolicy.tsx
import React from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

const PrivacyPolicy = () => {
  return (
    <>
      <Navbar />
      <main className="min-h-screen pt-24 pb-20 px-4">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-3xl font-bold mb-4">Privacy Policy</h1>
          <p className="mb-4">
            This Privacy Policy explains how The Johnnys ("we", "us", or "our") collect, use, disclose, and safeguard your information when you visit our website and use our services.
          </p>
          <h2 className="text-2xl font-semibold mt-6">Information We Collect</h2>
          <p className="mb-4">
            We collect information that you voluntarily provide when you register on our site, book an appointment, or communicate with us. This may include your name, email address, phone number, and any other information you provide.
          </p>
          <h2 className="text-2xl font-semibold mt-6">How We Use Your Information</h2>
          <p className="mb-4">
            We use your information to provide and improve our services, process your bookings, and communicate with you regarding updates or promotional offers. Your information is used solely to enhance your experience and will not be sold or shared with third parties for marketing purposes.
          </p>
          <h2 className="text-2xl font-semibold mt-6">Disclosure of Your Information</h2>
          <p className="mb-4">
            We may share your personal information with third-party service providers that help us operate our website and deliver our services. All such providers are contractually obligated to protect your information and only use it for the purposes for which it was provided.
          </p>
          <h2 className="text-2xl font-semibold mt-6">Security</h2>
          <p className="mb-4">
            We implement various security measures to maintain the safety of your personal information. However, no method of transmission over the Internet or method of electronic storage is completely secure.
          </p>
          <h2 className="text-2xl font-semibold mt-6">Changes to This Privacy Policy</h2>
          <p className="mb-4">
            We may update this Privacy Policy periodically. We will notify you of any significant changes by posting the new Privacy Policy on this page. Your continued use of our website constitutes your acceptance of any changes.
          </p>
          <h2 className="text-2xl font-semibold mt-6">Contact Us</h2>
          <p className="mb-4">
            If you have any questions about this Privacy Policy, please contact us at <a href="tel:+16029442535" className="text-blue-600 hover:underline">(602) 944-2535</a>.
          </p>
        </div>
      </main>
      <Footer />
    </>
  );
};

export default PrivacyPolicy;
