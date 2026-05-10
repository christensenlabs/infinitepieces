import React from 'react';
import Navbar from '../components/Navbar';
import Hero from '../components/Hero';
import ROICalculator from '../components/ROICalculator';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-brand-dark selection:bg-accent selection:text-brand-dark font-sans">
      <Navbar />
      <Hero />
      <ROICalculator />
    </div>
  );
}
