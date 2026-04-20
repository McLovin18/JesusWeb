import React from 'react';
import { Navbar } from '@/components/Navbar/Navbar';
import { Hero } from '@/components/Hero/Hero';
import { Window } from '@/components/Window/Window';

export default function Home() {
  return (
    <>
      <Navbar />
      <Hero />
      <Window />
    </>
  );
}
