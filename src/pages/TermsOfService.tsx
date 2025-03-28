// src/pages/TermsOfService.tsx
import React from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

const TermsOfService = () => {
  return (
    <>
      <Navbar />
      <main className="min-h-screen pt-24 pb-20 px-4">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-3xl font-bold mb-4">Terms of Service</h1>
          <p className="mb-4">
            These Terms of Service ("Terms") govern your use of The Johnnys website ("Site") and the services provided by us. By using our Site, you agree to these Terms.
          </p>
          <h2 className="text-2xl font-semibold mt-6">Use of Our Services</h2>
          <p className="mb-4">
            You agree to use our services only for lawful purposes and in accordance with these Terms. You must not use our services in any manner that could damage, disable, or impair our services.
          </p>
          <h2 className="text-2xl font-semibold mt-6">Booking Appointments</h2>
          <p className="mb-4">
            When you book an appointment through our Site, you agree to provide accurate and complete information. We reserve the right to cancel or modify appointments in the event of a scheduling conflict or error.
          </p>
          <h2 className="text-2xl font-semibold mt-6">Intellectual Property</h2>
          <p className="mb-4">
            All content on this Site, including text, images, graphics, logos, and software, is the property of The Johnnys or its licensors and is protected by applicable intellectual property laws.
          </p>
          <h2 className="text-2xl font-semibold mt-6">Limitation of Liability</h2>
          <p className="mb-4">
            In no event shall The Johnnys be liable for any indirect, incidental, special, consequential, or punitive damages arising out of or in connection with your use of our services.
          </p>
          <h2 className="text-2xl font-semibold mt-6">Changes to These Terms</h2>
          <p className="mb-4">
            We reserve the right to modify these Terms at any time. Any changes will be posted on this page. Your continued use of our Site after the changes constitutes your acceptance of the new Terms.
          </p>
          <h2 className="text-2xl font-semibold mt-6">Governing Law</h2>
          <p className="mb-4">
            These Terms shall be governed by and construed in accordance with the laws of the jurisdiction in which The Johnnys operates.
          </p>
          <h2 className="text-2xl font-semibold mt-6">Contact Us</h2>
          <p className="mb-4">
            If you have any questions about these Terms, please contact us at <a href="mailto:terms@thejohnnys.com" className="text-blue-600 hover:underline">terms@thejohnnys.com</a>.
          </p>
        </div>
      </main>
      <Footer />
    </>
  );
};

export default TermsOfService;
