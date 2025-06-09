import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter, Route, Routes } from 'react-router';
import './index.css';
import { Navbar } from './navbar/navbar.tsx';
import { Tuner } from './pages/tuner/tuner.tsx';
import { Songs } from './pages/songs/songs.tsx';
import { Metronome } from './pages/metronome/metronome.tsx';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <div className="container mx-auto flex h-full max-w-md flex-col justify-between p-4">
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Tuner />} />
          <Route path="/metronome" element={<Metronome />} />
          <Route path="/songs" element={<Songs />} />
        </Routes>
        <Navbar />
      </BrowserRouter>
    </div>
  </StrictMode>
);
