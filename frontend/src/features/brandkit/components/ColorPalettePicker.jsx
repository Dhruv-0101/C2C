import React from 'react';
import { Palette } from 'lucide-react';
import { Card } from '../../../components/ui/Card';
import { ColorPickerInput } from '../../../components/ui/ColorPickerInput';

export const ColorPalettePicker = ({
  primaryColor,
  onChangePrimary,
  secondaryColor,
  onChangeSecondary,
  accentColor,
  onChangeAccent,
}) => {
  return (
    <Card className="p-5 bg-[#131B2A] border-[#2C384E] space-y-4">
      <div className="flex items-center gap-2 border-b border-[#2C384E] pb-3">
        <Palette className="w-4 h-4 text-purple-400" />
        <h3 className="font-heading font-bold text-sm text-white">Brand Color Palette</h3>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-1.5">Primary Color</label>
          <ColorPickerInput value={primaryColor} onChange={onChangePrimary} label="Primary" />
        </div>
        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-1.5">Secondary Color</label>
          <ColorPickerInput value={secondaryColor} onChange={onChangeSecondary} label="Secondary" />
        </div>
        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-1.5">Accent Color</label>
          <ColorPickerInput value={accentColor} onChange={onChangeAccent} label="Accent" />
        </div>
      </div>
    </Card>
  );
};

export default ColorPalettePicker;
