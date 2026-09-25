import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { loadStripe } from '@stripe/stripe-js';
import {
  Elements,
  PaymentElement,
  useStripe,
  useElements,
} from '@stripe/react-stripe-js';
import { Lock, X, ShieldCheck, CreditCard, Sparkles } from 'lucide-react';
import Button from '@/components/ui/Button';
import { billingApi } from '@/features/billing/api/billing.api';

/**
 * Inner Form Component using Stripe hooks
 */
const StripeCheckoutForm = ({
  clientSecret,
  intentId,
  postCount,
  pricing,
  onSuccess,
  onClose,
}) => {
  const stripe = useStripe();
  const elements = useElements();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!stripe || !elements) {
      return;
    }

    setIsSubmitting(true);
    setErrorMessage('');

    // 1. Submit elements for client validation
    const { error: submitErr } = await elements.submit();
    if (submitErr) {
      setErrorMessage(submitErr.message || 'Please check your card details.');
      setIsSubmitting(false);
      return;
    }

    try {
      // 2. Confirm Payment via Stripe SDK with required export billing details
      const { paymentIntent, error } = await stripe.confirmPayment({
        elements,
        clientSecret,
        confirmParams: {
          return_url: `${window.location.origin}/billing/success`,
          payment_method_data: {
            billing_details: {
              name: 'BrandFlow Member',
              address: {
                line1: '510 Townsend St',
                city: 'San Francisco',
                state: 'CA',
                postal_code: '98140',
                country: 'US',
              },
            },
          },
        },
        redirect: 'if_required',
      });

      if (error) {
        setErrorMessage(error.message || 'Payment confirmation failed.');
        setIsSubmitting(false);
        return;
      }

      // 3. Payment Succeeded or Processing on Stripe! Verify API to activate Pro Plan
      const paymentId = paymentIntent?.id || intentId;
      const verifyData = await billingApi.verifyStripePayment({
        intentId: paymentId,
        postCount: postCount || 15,
      });

      setIsSubmitting(false);
      if (onSuccess) onSuccess(verifyData);
      onClose();
    } catch (err) {
      setIsSubmitting(false);
      setErrorMessage(err?.response?.data?.message || err?.message || 'Stripe payment verification failed.');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {errorMessage && (
        <div className="p-3 rounded-xl bg-red-500/15 border border-red-500/40 text-red-400 text-xs font-semibold">
          ⚠️ {errorMessage}
        </div>
      )}

      {/* Real Stripe Card Payment Element */}
      <div className="p-4 rounded-2xl bg-[#0B0F17] border border-[#2C384E]">
        <PaymentElement
          options={{
            layout: 'tabs',
            fields: {
              billingDetails: 'auto',
            },
          }}
        />
      </div>

      <div className="flex items-center gap-2 text-[11px] text-slate-400 bg-slate-800/40 p-2.5 rounded-xl border border-slate-700/50">
        <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
        <span>Encrypted & processed securely via Stripe.</span>
      </div>

      <Button
        type="submit"
        variant="primary"
        isLoading={isSubmitting}
        disabled={!stripe || !elements || isSubmitting}
        className="w-full justify-center py-3.5 text-xs font-extrabold bg-gradient-to-r from-indigo-500 via-purple-500 to-amber-500 text-white border-0 shadow-lg shadow-indigo-500/20"
      >
        <Lock className="w-4 h-4 mr-1.5" />
        Pay ${pricing?.finalTotal || '0'} USD Now
      </Button>
    </form>
  );
};

// Singleton caching for loadStripe instance
let stripePromiseCache = null;
const getStripePromise = (publishableKey) => {
  if (!stripePromiseCache) {
    const key =
      publishableKey ||
      import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY ||
      'pk_test_51O7iHlSAP8eyRYOVMSRmnh22wxkhX33MCA93aTN90g3LXaW2h7RYvnb3sM85JRRUxFTsLGXiexCqLo426Pu10thG000RTns3P6';
    stripePromiseCache = loadStripe(key);
  }
  return stripePromiseCache;
};

/**
 * StripeElementsModal Component
 * Secure Stripe Card Input Modal Dialog
 */
export const StripeElementsModal = ({
  isOpen,
  onClose,
  clientSecret,
  publishableKey,
  intentId,
  postCount,
  pricing,
  onSuccess,
}) => {
  if (!isOpen || !clientSecret) return null;

  const stripePromise = getStripePromise(publishableKey);

  const options = {
    clientSecret,
    appearance: {
      theme: 'night',
      variables: {
        colorPrimary: '#6366F1',
        colorBackground: '#0B0F17',
        colorText: '#FFFFFF',
        colorDanger: '#EF4444',
        fontFamily: 'Inter, system-ui, sans-serif',
        borderRadius: '12px',
        spacingUnit: '4px',
      },
      rules: {
        '.Input': {
          border: '1px solid #2C384E',
          backgroundColor: '#0B0F17',
          color: '#FFFFFF',
        },
        '.Input:focus': {
          border: '2px solid #6366F1',
          boxShadow: '0 0 0 4px rgba(99, 102, 241, 0.15)',
        },
        '.Label': {
          color: '#94A3B8',
          fontWeight: '600',
          fontSize: '12px',
        },
      },
    },
  };

  return createPortal(
    <div className="fixed inset-0 z-[100000] flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg bg-[#131B2A] border border-indigo-500/50 rounded-3xl p-6 sm:p-7 shadow-2xl space-y-5">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#2C384E] pb-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
              <CreditCard className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white tracking-tight">Stripe Card Checkout</h3>
              <p className="text-xs text-slate-400">Complete your Pro Plan subscription</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-xl bg-slate-800 text-slate-400 hover:text-white transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Order Summary Card */}
        <div className="p-4 rounded-2xl bg-[#0B0F17] border border-[#2C384E] flex items-center justify-between">
          <div>
            <span className="text-xs text-slate-400 font-medium block">Total Subscription Amount</span>
            <span className="text-2xl font-black text-white font-mono">${pricing?.finalTotal || '0'} USD</span>
          </div>
          <div className="text-right">
            <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 text-xs font-bold">
              <Sparkles className="w-3.5 h-3.5" /> {postCount} Posts Quota
            </span>
          </div>
        </div>

        {/* Stripe Elements Provider */}
        <Elements stripe={stripePromise} options={options}>
          <StripeCheckoutForm
            clientSecret={clientSecret}
            intentId={intentId}
            postCount={postCount}
            pricing={pricing}
            onSuccess={onSuccess}
            onClose={onClose}
          />
        </Elements>
      </div>
    </div>,
    document.body
  );
};

export { StripeElementsModal as StripeElementsCheckoutModal };
export default StripeElementsModal;
