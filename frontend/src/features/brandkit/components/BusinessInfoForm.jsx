import React from 'react';
import { Building2 } from 'lucide-react';
import { Card } from '../../../components/ui/Card';
import { Input } from '../../../components/ui/Input';

export const BusinessInfoForm = ({ register, errors = {} }) => {
  return (
    <Card className="p-5 bg-[#131B2A] border-[#2C384E] space-y-4">
      <div className="flex items-center gap-2 border-b border-[#2C384E] pb-3">
        <Building2 className="w-4 h-4 text-amber-400" />
        <h3 className="font-heading font-bold text-sm text-white">Business Information</h3>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
        <div>
          <label className="block text-slate-300 font-semibold mb-1">Business Name</label>
          <Input {...register('businessName')} placeholder="e.g. Acme Studio" className="bg-[#0B0F17] text-xs" />
          {errors.businessName && <p className="text-[11px] text-rose-400 mt-1">{errors.businessName.message}</p>}
        </div>
        <div>
          <label className="block text-slate-300 font-semibold mb-1">Tagline</label>
          <Input {...register('tagline')} placeholder="e.g. Your Brand Slogan" className="bg-[#0B0F17] text-xs" />
        </div>
        <div>
          <label className="block text-slate-300 font-semibold mb-1">Phone Number</label>
          <Input {...register('phone')} placeholder="+91 98765 43210" className="bg-[#0B0F17] text-xs" />
        </div>
        <div>
          <label className="block text-slate-300 font-semibold mb-1">Website URL</label>
          <Input {...register('website')} placeholder="https://example.com" className="bg-[#0B0F17] text-xs" />
        </div>
      </div>
    </Card>
  );
};

export default BusinessInfoForm;
