import React from 'react';
import { Layers } from 'lucide-react';
import { Card } from '../components/ui/Card';

export const FramesPage = () => {
  return (
    <Card className="p-8 text-center space-y-4 border-[#2C384E] bg-[#131B2A]">
      <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-400 flex items-center justify-center mx-auto">
        <Layers className="w-6 h-6" />
      </div>
      <h2 className="font-heading font-extrabold text-2xl text-white">Canva Vector Frames Studio</h2>
      <p className="text-sm text-slate-400 max-w-md mx-auto">
        Explore transparent Canva PNG frames, photo placeholders, and custom badge overlays.
      </p>
    </Card>
  );
};

export default FramesPage;
