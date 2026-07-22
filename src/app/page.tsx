'use client';

import React from 'react';
import { Dashboard } from '@/components/Dashboard';

export default function Home() {
  return (
    <main className="min-h-screen bg-[#090d16] text-slate-100 p-4 sm:p-6 lg:p-8 selection:bg-indigo-500 selection:text-white">
      <Dashboard />
    </main>
  );
}
