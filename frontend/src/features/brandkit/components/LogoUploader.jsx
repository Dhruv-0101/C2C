import React from 'react';
import { Upload, Image as ImageIcon } from 'lucide-react';
import { Card } from '../../../components/ui/Card';

export const LogoUploader = ({ logoUrl, onUpload, isUploading }) => {
  return (
    <Card className="p-5 bg-[#131B2A] border-[#2C384E] space-y-3">
      <div className="flex items-center gap-2 border-b border-[#2C384E] pb-3">
        <ImageIcon className="w-4 h-4 text-emerald-400" />
        <h3 className="font-heading font-bold text-sm text-white">Brand Logo (PNG / SVG)</h3>
      </div>
      <div className="flex flex-col sm:flex-row items-center gap-4">
        <div className="w-24 h-24 rounded-2xl bg-slate-900 border border-dashed border-slate-700 flex items-center justify-center overflow-hidden">
          {logoUrl ? (
            <img src={logoUrl} alt="Brand Logo" className="w-full h-full object-contain p-2" />
          ) : (
            <ImageIcon className="w-8 h-8 text-slate-600" />
          )}
        </div>
        <div className="space-y-1.5 text-xs">
          <label className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold cursor-pointer transition shadow-md">
            <Upload className="w-3.5 h-3.5" />
            <span>{isUploading ? 'Uploading...' : 'Upload Logo'}</span>
            <input type="file" accept="image/png,image/svg+xml,image/jpeg" onChange={onUpload} className="hidden" />
          </label>
          <p className="text-[11px] text-slate-400">Recommended: High-resolution PNG with transparent background.</p>
        </div>
      </div>
    </Card>
  );
};

export default LogoUploader;
