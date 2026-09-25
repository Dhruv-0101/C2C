import React from 'react';
import { Check } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { formatCurrency } from '@/shared/utils/currency.util';

export const PricingCard = ({
  title,
  price,
  currency = 'INR',
  features = [],
  isPopular = false,
  onSelect,
  buttonText = 'Choose Plan',
}) => {
  return (
    <Card
      className={`p-6 bg-[#131B2A] border ${
        isPopular ? 'border-amber-500 shadow-xl shadow-amber-500/10' : 'border-[#2C384E]'
      } space-y-4 relative flex flex-col justify-between`}
    >
      {isPopular && (
        <span className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full bg-amber-500 text-slate-950 font-bold text-[10px] uppercase font-mono tracking-wider">
          Most Popular
        </span>
      )}
      <div className="space-y-2">
        <h3 className="font-heading font-extrabold text-lg text-white">{title}</h3>
        <div className="flex items-baseline gap-1">
          <span className="text-3xl font-bold text-white font-mono">
            {formatCurrency(price, currency)}
          </span>
          <span className="text-xs text-slate-400">/mo</span>
        </div>
        <ul className="space-y-2 pt-3 text-xs text-slate-300">
          {features.map((feat, idx) => (
            <li key={idx} className="flex items-center gap-2">
              <Check className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>{feat}</span>
            </li>
          ))}
        </ul>
      </div>

      <Button
        variant={isPopular ? 'primary' : 'outline'}
        onClick={onSelect}
        className="w-full text-xs font-bold py-2 mt-4"
      >
        {buttonText}
      </Button>
    </Card>
  );
};

export default PricingCard;
