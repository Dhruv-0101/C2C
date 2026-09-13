import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import {
  Zap,
  Sparkles,
  CheckCircle2,
  Lock,
  X,
  CreditCard,
  Percent,
  Sliders,
  DollarSign,
  IndianRupee,
} from 'lucide-react';
import Button from '../../../components/ui/Button';
import { billingApi } from '../../../services/billing.api';
import StripeElementsCheckoutModal from './StripeElementsCheckoutModal';

// Dynamic pricing calculation constants for frontend slider
const BASE_PRICES = { INR: 40, USD: 0.8 };
const calculatePlanPricingClient = (postCount, currency = 'INR') => {
  const count = Math.max(10, Math.min(100, Number(postCount) || 15));
  const isUsd = currency === 'USD';
  const basePricePerPost = isUsd ? BASE_PRICES.USD : BASE_PRICES.INR;

  let discountPercentage = 0;
  if (count >= 51) discountPercentage = 0.3;
  else if (count >= 21) discountPercentage = 0.2;
  else if (count >= 10) discountPercentage = 0.1;

  const rawTotal = count * basePricePerPost;
  const discountAmount = rawTotal * discountPercentage;
  const finalTotal = Math.round((rawTotal - discountAmount) * 100) / 100;
  const effectivePricePerPost = Math.round((finalTotal / count) * 100) / 100;

  return {
    postCount: count,
    currency: isUsd ? 'USD' : 'INR',
    currencySymbol: isUsd ? '$' : '₹',
    discountPercentage: Math.round(discountPercentage * 100),
    rawTotal,
    discountAmount: Math.round(discountAmount * 100) / 100,
    finalTotal,
    effectivePricePerPost,
  };
};

export const PlanSelectionModal = ({
  isOpen,
  onClose,
  currentPlan = 'FREE',
  postsRemaining = 0,
  onSuccess,
}) => {
  const [currency, setCurrency] = useState('INR');
  const [postCount, setPostCount] = useState(15);
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [showStripeModal, setShowStripeModal] = useState(false);
  const [stripeIntentData, setStripeIntentData] = useState(null);

  // Dynamically load Razorpay SDK Script if missing
  React.useEffect(() => {
    if (isOpen && typeof window !== 'undefined' && !window.Razorpay) {
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.async = true;
      document.body.appendChild(script);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const pricing = calculatePlanPricingClient(postCount, currency);

  // Handle Free Plan Activation (5 Posts Limit)
  const handleActivateFree = async () => {
    try {
      setIsProcessing(true);
      setErrorMsg('');
      const data = await billingApi.activateFreePlan();
      setIsProcessing(false);
      if (onSuccess) onSuccess(data);
      onClose();
    } catch (err) {
      setIsProcessing(false);
      setErrorMsg(err?.response?.data?.message || err?.message || 'Failed to activate Free Plan.');
    }
  };

  // Handle Razorpay Payment Flow (INR ₹)
  const handleRazorpayPayment = async () => {
    try {
      setIsProcessing(true);
      setErrorMsg('');

      // 1. Create Razorpay Order via Backend API
      const orderData = await billingApi.createRazorpayOrder(postCount);

      // Check if Razorpay JS SDK script is loaded in browser
      if (window.Razorpay) {
        const options = {
          key: orderData.keyId,
          amount: Math.round(orderData.finalTotal * 100),
          currency: 'INR',
          name: 'BrandFlow Pro Plan',
          description: `Subscription for ${orderData.postCount} Post Creations`,
          order_id: orderData.orderId,
          handler: async (response) => {
            try {
              // 2. Direct API Verification upon Razorpay Payment Completion
              const verifyData = await billingApi.verifyRazorpayPayment({
                orderId: response.razorpay_order_id || orderData.orderId,
                paymentId: response.razorpay_payment_id || `pay_${Date.now()}`,
                signature: response.razorpay_signature || '',
                postCount: orderData.postCount,
              });
              setIsProcessing(false);
              if (onSuccess) onSuccess(verifyData);
              onClose();
            } catch (vErr) {
              setIsProcessing(false);
              setErrorMsg(vErr?.response?.data?.message || 'Razorpay payment verification failed.');
            }
          },
          prefill: { name: 'BrandFlow Member' },
          theme: { color: '#F59E0B' },
        };
        const rzp = new window.Razorpay(options);
        rzp.open();
      } else {
        // Instant Direct API Verification Fallback for Sandbox Test Mode
        const verifyData = await billingApi.verifyRazorpayPayment({
          orderId: orderData.orderId,
          paymentId: `pay_rzp_mock_${Date.now()}`,
          signature: 'mock_signature',
          postCount: orderData.postCount,
        });
        setIsProcessing(false);
        if (onSuccess) onSuccess(verifyData);
        onClose();
      }
    } catch (err) {
      setIsProcessing(false);
      setErrorMsg(err?.response?.data?.message || err?.message || 'Failed to initiate Razorpay payment.');
    }
  };

  // Handle Stripe Payment Flow (USD $)
  const handleStripePayment = async () => {
    try {
      setIsProcessing(true);
      setErrorMsg('');

      // 1. Create Stripe Intent via Backend API
      const intentData = await billingApi.createStripeIntent(postCount);
      setStripeIntentData(intentData);
      setIsProcessing(false);
      setShowStripeModal(true);
    } catch (err) {
      setIsProcessing(false);
      setErrorMsg(err?.response?.data?.message || err?.message || 'Failed to initiate Stripe payment.');
    }
  };

  return createPortal(
    <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4 sm:p-6 bg-black/90 backdrop-blur-lg animate-in fade-in duration-200 overflow-y-auto">
      <div className="relative w-full max-w-4xl bg-[#131B2A] border border-[#2C384E] rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6 my-auto">
        {/* Header Section */}
        <div className="flex items-start justify-between border-b border-[#2C384E] pb-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/15 border border-amber-500/40 text-amber-400 text-xs font-bold uppercase tracking-wider mb-2">
              <Lock className="w-3.5 h-3.5" /> Plan Required To Create & Schedule Posts
            </div>
            <h2 className="text-2xl font-heading font-extrabold text-white flex items-center gap-2">
              <span>Choose Subscription Plan</span>
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              Select Free Plan (5 Posts) or customize your Paid Pro Plan with an interactive post slider & volume discounts.
            </p>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {errorMsg && (
          <div className="p-3 rounded-xl bg-red-500/15 border border-red-500/40 text-red-400 text-xs font-semibold text-center">
            ⚠️ {errorMsg}
          </div>
        )}

        {/* Currency Switcher Bar */}
        <div className="flex items-center justify-between p-3 rounded-2xl bg-[#0B0F17] border border-[#2C384E]">
          <span className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
            <CreditCard className="w-4 h-4 text-amber-400" />
            Select Payment Currency:
          </span>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setCurrency('INR')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1 ${
                currency === 'INR'
                  ? 'bg-amber-500 text-slate-950 shadow-md'
                  : 'bg-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              <IndianRupee className="w-3.5 h-3.5" />
              <span>INR (₹ - Razorpay)</span>
            </button>

            <button
              type="button"
              onClick={() => setCurrency('USD')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1 ${
                currency === 'USD'
                  ? 'bg-amber-500 text-slate-950 shadow-md'
                  : 'bg-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              <DollarSign className="w-3.5 h-3.5" />
              <span>USD ($ - Stripe)</span>
            </button>
          </div>
        </div>

        {/* Plan Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* CARD 1: FREE PLAN */}
          <div className="relative p-6 rounded-2xl bg-[#0B0F17] border border-[#2C384E] flex flex-col justify-between space-y-5">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="px-3 py-1 rounded-full bg-slate-800 text-slate-300 text-xs font-bold uppercase">
                  FREE PLAN
                </span>
                <span className="text-2xl font-extrabold text-white">₹0 / $0</span>
              </div>

              <div>
                <h3 className="text-lg font-bold text-white">Starter Trial Plan</h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Allows max 5 post creations. Automatically expires after 5th post.
                </p>
              </div>

              <ul className="space-y-2.5 text-xs text-slate-300 pt-2 border-t border-[#2C384E]">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Max 5 HD Post Creations</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Full BrandKit Overlay Support</span>
                </li>
                <li className="flex items-center gap-2 text-slate-500">
                  <Lock className="w-4 h-4 text-slate-500 shrink-0" />
                  <span>Auto-Expires upon 5th post completion</span>
                </li>
              </ul>
            </div>

            <Button
              variant="outline"
              disabled={isProcessing || (currentPlan === 'FREE' && postsRemaining <= 0)}
              onClick={handleActivateFree}
              className="w-full justify-center py-3 text-xs font-bold border-[#2C384E]"
            >
              {currentPlan === 'FREE' && postsRemaining <= 0
                ? 'Free Plan Expired'
                : 'Activate Free Plan (5 Posts)'}
            </Button>
          </div>

          {/* CARD 2: PAID PRO PLAN WITH INTERACTIVE SLIDER */}
          <div className="relative p-6 rounded-2xl bg-gradient-to-b from-[#1E293B] to-[#0B0F17] border-2 border-amber-500/60 shadow-xl space-y-5 flex flex-col justify-between">
            {/* Top Recommended Pill */}
            <div className="absolute -top-3.5 right-6 px-3 py-0.5 rounded-full bg-amber-500 text-slate-950 font-extrabold text-[10px] uppercase tracking-wider shadow-md">
              ⚡ MOST POPULAR & DISCOUNTED
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="px-3 py-1 rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/40 text-xs font-bold uppercase flex items-center gap-1">
                  <Zap className="w-3.5 h-3.5 fill-amber-400" /> PRO PAID PLAN
                </span>
                {pricing.discountPercentage > 0 && (
                  <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 text-xs font-extrabold flex items-center gap-0.5">
                    <Percent className="w-3 h-3" /> {pricing.discountPercentage}% OFF
                  </span>
                )}
              </div>

              {/* Price Display */}
              <div>
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-extrabold text-white font-mono">
                    {pricing.currencySymbol} {pricing.finalTotal}
                  </span>
                  {pricing.discountAmount > 0 && (
                    <span className="text-xs text-slate-500 line-through">
                      {pricing.currencySymbol} {pricing.rawTotal}
                    </span>
                  )}
                </div>
                <p className="text-[11px] text-amber-400 font-medium mt-0.5">
                  ({pricing.currencySymbol} {pricing.effectivePricePerPost} / post for {pricing.postCount} posts)
                </p>
              </div>

              {/* Interactive Post Count Slider */}
              <div className="p-3.5 rounded-xl bg-[#0B0F17] border border-[#2C384E] space-y-3">
                <div className="flex justify-between items-center text-xs font-bold">
                  <span className="text-slate-300 flex items-center gap-1">
                    <Sliders className="w-3.5 h-3.5 text-amber-400" /> Select Post Quota:
                  </span>
                  <span className="text-amber-400 font-mono text-sm font-extrabold">
                    {postCount} Posts
                  </span>
                </div>

                <input
                  type="range"
                  min="10"
                  max="100"
                  step="5"
                  value={postCount}
                  onChange={(e) => setPostCount(Number(e.target.value))}
                  className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-amber-500"
                />

                <div className="flex justify-between text-[10px] font-semibold text-slate-500">
                  <span>10 Posts (10% OFF)</span>
                  <span>50 Posts (20% OFF)</span>
                  <span>100 Posts (30% OFF)</span>
                </div>
              </div>

              <ul className="space-y-2 text-xs text-slate-300 pt-1">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0" />
                  <span>{postCount} HD Post Creations Allowed</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0" />
                  <span>Unlimited Social Accounts & Multi-Publishing</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0" />
                  <span>Access to Custom & Admin Frames</span>
                </li>
              </ul>
            </div>

            {/* Payment Trigger Buttons */}
            <div className="space-y-2 pt-2">
              {currency === 'INR' ? (
                <Button
                  variant="primary"
                  isLoading={isProcessing}
                  onClick={handleRazorpayPayment}
                  className="w-full justify-center py-3 text-xs font-extrabold bg-gradient-to-r from-amber-500 to-teal-500 text-slate-950 border-0 shadow-lg shadow-amber-500/20"
                >
                  <Sparkles className="w-4 h-4 mr-1" />
                  Pay {pricing.currencySymbol} {pricing.finalTotal} with Razorpay (UPI / Card)
                </Button>
              ) : (
                <Button
                  variant="primary"
                  isLoading={isProcessing}
                  onClick={handleStripePayment}
                  className="w-full justify-center py-3 text-xs font-extrabold bg-gradient-to-r from-indigo-500 to-purple-500 text-white border-0 shadow-lg shadow-indigo-500/20"
                >
                  <CreditCard className="w-4 h-4 mr-1" />
                  Pay {pricing.currencySymbol} {pricing.finalTotal} with Stripe (Card)
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Official Stripe Card Checkout Modal */}
      <StripeElementsCheckoutModal
        isOpen={showStripeModal}
        onClose={() => setShowStripeModal(false)}
        clientSecret={stripeIntentData?.clientSecret}
        publishableKey={stripeIntentData?.publishableKey}
        intentId={stripeIntentData?.intentId}
        postCount={postCount}
        pricing={pricing}
        onSuccess={(data) => {
          if (onSuccess) onSuccess(data);
          onClose();
        }}
      />
    </div>,
    document.body
  );
};
export default PlanSelectionModal;
