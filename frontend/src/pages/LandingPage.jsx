import React from 'react';
import Navbar from '../components/Navbar';
import Hero from '../components/Hero';
import ROICalculator from '../components/ROICalculator';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#040811] selection:bg-[#00E5FF] selection:text-[#040811] font-sans">
      <Navbar />
      <Hero />
      <ROICalculator />
    </div>
  );
}
