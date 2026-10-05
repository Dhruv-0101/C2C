import React, { useState, useEffect } from 'react';
import { Modal } from '../../../components/ui/Modal';
import { Button } from '../../../components/ui/Button';
import {
  Facebook,
  Instagram,
  CheckCircle2,
  Sparkles,
  Copy,
  Check,
  ExternalLink,
  UserCheck,
  ShieldCheck,
  Globe,
  KeyRound,
  Inbox,
  MousePointerClick,
  Smartphone,
  ArrowRight,
  BookOpen,
  MessageSquare,
  HelpCircle,
} from 'lucide-react';

/**
 * ClientOnboardingHelpModal Component
 * Ultra-polished, beginner-friendly guide for business owners.
 * Features 2 clear tabs:
 * 1. 1-Click Approval (Fast flow for existing pages)
 * 2. Mobile Setup Guide (Tap-by-tap guide for creating Page, switching Instagram, & linking them)
 */
export const ClientOnboardingHelpModal = ({
  isOpen,
  onClose,
  onboardingData,
  onSubmitPageLink,
  isSubmittingPageLink,
}) => {
  const [activeTab, setActiveTab] = useState('approval'); // 'approval' | 'setup'
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedWhatsApp, setCopiedWhatsApp] = useState(false);
  const [modalPageInput, setModalPageInput] = useState('');
  const [submitSuccess, setSubmitSuccess] = useState(false);

  useEffect(() => {
    if (onboardingData?.facebookPageUrl) {
      setModalPageInput(onboardingData.facebookPageUrl);
    }
  }, [onboardingData?.facebookPageUrl]);

  const handleModalSubmit = async () => {
    if (!modalPageInput.trim() || !onSubmitPageLink) return;
    try {
      await onSubmitPageLink(modalPageInput.trim());
      setSubmitSuccess(true);
      setTimeout(() => setSubmitSuccess(false), 3000);
    } catch {
      // Handled in parent hook
    }
  };

  const APPROVAL_URL = 'https://business.facebook.com/settings/requests';

  const handleCopyLink = () => {
    navigator.clipboard.writeText(APPROVAL_URL);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
  };

  const WHATSAPP_GUIDE_TEXT = `Hello! 👋 Here is how to prepare your Facebook & Instagram for BrandFlow automated posting:

1️⃣ CREATE FACEBOOK PAGE:
• Open Facebook App ➔ Tap Menu (☰) ➔ Tap "Pages" 🚩 ➔ Tap "+ Create" ➔ Enter Page Name & Category ➔ Tap "Done".

2️⃣ CONVERT INSTAGRAM TO BUSINESS:
• Open Instagram App ➔ Go to Profile ➔ Tap Menu (☰) ➔ "Settings and privacy" ➔ "Account type and tools" ➔ "Switch to professional account" ➔ Select "Business".

3️⃣ LINK INSTAGRAM TO FACEBOOK PAGE (Recommended via Facebook):
• Open Facebook App ➔ Switch to your Page ➔ Settings (⚙️) ➔ "Linked Accounts" ➔ "Instagram" ➔ "Connect account" (Enter your Instagram login ➔ Done).
  *(Alternative via Instagram: Profile ➔ "Edit profile" ➔ "Page" ➔ Select Facebook Page).*

4️⃣ 1-CLICK APPROVAL:
• Send your Page name/link to BrandFlow support.
• Once the request is sent, open: https://business.facebook.com/settings/requests
• Go to the "Received" tab and tap "Approve"! 🚀`;

  const handleCopyWhatsAppGuide = () => {
    navigator.clipboard.writeText(WHATSAPP_GUIDE_TEXT);
    setCopiedWhatsApp(true);
    setTimeout(() => setCopiedWhatsApp(false), 2500);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="How to Connect Facebook & Instagram (Complete Guide)"
      description="Step-by-step instructions for 100% automated social media publishing. No technical knowledge required!"
      maxWidth="max-w-2xl"
    >
      <div className="space-y-4 text-xs text-slate-200 font-sans max-h-[75vh] overflow-y-auto pr-2 custom-scrollbar">
        {/* Intro Banner */}
        <div className="p-3.5 rounded-2xl bg-gradient-to-r from-amber-500/15 via-rose-500/15 to-indigo-500/15 border border-amber-500/30 flex items-start gap-3">
          <div className="p-2 rounded-xl bg-amber-500/20 text-amber-400 shrink-0">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <h4 className="font-bold text-white text-sm">
              Automated Social Media Publishing (One-Time Setup)
            </h4>
            <p className="text-slate-300 text-xs mt-0.5 leading-relaxed">
              Meta (Facebook & Instagram) allows automated publishing exclusively to official{' '}
              <strong>Facebook Business Pages</strong> and <strong>Instagram Professional Accounts</strong>. Personal profiles cannot receive automated scheduled posts.
            </p>
          </div>
        </div>

        {/* Tab Switcher: Approval vs Step-by-Step Setup */}
        <div className="grid grid-cols-2 p-1 rounded-xl bg-[#0B0F17] border border-[#2C384E] gap-1">
          <button
            type="button"
            onClick={() => setActiveTab('approval')}
            className={`flex items-center justify-center gap-2 py-2 px-3 rounded-lg font-bold text-xs transition cursor-pointer ${
              activeTab === 'approval'
                ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-[#131B2A]'
            }`}
          >
            <ShieldCheck className="w-4 h-4" />
            <span>1. Approve & Connect (Fast)</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('setup')}
            className={`flex items-center justify-center gap-2 py-2 px-3 rounded-lg font-bold text-xs transition cursor-pointer ${
              activeTab === 'setup'
                ? 'bg-indigo-500/20 text-indigo-400 border border-indigo-500/40 shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-[#131B2A]'
            }`}
          >
            <Smartphone className="w-4 h-4" />
            <span>2. Create Page / Link Accounts</span>
          </button>
        </div>

        {/* TAB 1: 1-CLICK APPROVAL */}
        {activeTab === 'approval' && (
          <div className="space-y-3.5">
            {/* Step 1: Prerequisites with Helper Link */}
            <div className="p-4 rounded-2xl bg-[#0B0F17] border border-[#2C384E] space-y-2.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-amber-400 font-bold text-xs uppercase tracking-wider">
                  <span className="w-5 h-5 rounded-full bg-amber-500 text-black flex items-center justify-center font-black text-[11px]">
                    1
                  </span>
                  <span>Prerequisites (Check Before Connecting)</span>
                </div>
                <button
                  type="button"
                  onClick={() => setActiveTab('setup')}
                  className="text-[11px] text-indigo-400 hover:text-indigo-300 font-semibold inline-flex items-center gap-1 cursor-pointer transition hover:underline"
                >
                  <span>Need to create them? Click here</span>
                  <ArrowRight className="w-3 h-3" />
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-0.5">
                <div className="p-3 rounded-xl bg-[#131B2A] border border-[#2C384E] space-y-1">
                  <div className="flex items-center gap-1.5 font-bold text-white">
                    <Facebook className="w-4 h-4 text-blue-400 shrink-0" />
                    <span>1. Facebook Business Page</span>
                  </div>
                  <p className="text-[11px] text-slate-400 leading-normal">
                    Must have an official Facebook Page (e.g. <em>Sharma Sweets</em>). Personal friend profiles cannot receive automated posts.
                  </p>
                </div>

                <div className="p-3 rounded-xl bg-[#131B2A] border border-[#2C384E] space-y-1">
                  <div className="flex items-center gap-1.5 font-bold text-white">
                    <Instagram className="w-4 h-4 text-pink-400 shrink-0" />
                    <span>2. Instagram Professional</span>
                  </div>
                  <p className="text-[11px] text-slate-400 leading-normal">
                    Must be a <strong>Professional or Creator</strong> account and linked to your Facebook Page (100% Free & instant).
                  </p>
                </div>
              </div>
            </div>

            {/* Step 2: Division of Action */}
            <div className="p-4 rounded-2xl bg-[#0B0F17] border border-[#2C384E] space-y-2.5">
              <div className="flex items-center gap-2 text-indigo-400 font-bold text-xs uppercase tracking-wider">
                <span className="w-5 h-5 rounded-full bg-indigo-500 text-white flex items-center justify-center font-black text-[11px]">
                  2
                </span>
                <span>Your Action vs. BrandFlow Action</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-0.5">
                <div className="p-3 rounded-xl bg-[#131B2A] border border-[#2C384E] space-y-1">
                  <div className="flex items-center gap-1.5 font-bold text-amber-300">
                    <span className="w-2 h-2 rounded-full bg-amber-400 shrink-0" />
                    <span>Your Action (Submit Link Below)</span>
                  </div>
                  <p className="text-[11px] text-slate-300 leading-normal">
                    Paste your Facebook Page URL or exact Page Name in the box below and click Submit.
                  </p>
                </div>

                <div className="p-3 rounded-xl bg-[#131B2A] border border-[#2C384E] space-y-1">
                  <div className="flex items-center gap-1.5 font-bold text-indigo-300">
                    <span className="w-2 h-2 rounded-full bg-indigo-400 shrink-0" />
                    <span>Admin Action (Sends Request)</span>
                  </div>
                  <p className="text-[11px] text-slate-300 leading-normal">
                    BrandFlow Admin immediately receives your Page and dispatches the official publishing request.
                  </p>
                </div>
              </div>

              {/* In-App Direct Submission Box */}
              <div className="p-3 rounded-xl bg-[#131B2A] border border-amber-500/30 space-y-2">
                <div className="flex items-center justify-between">
                  <label className="font-bold text-amber-300 flex items-center gap-1.5 text-xs">
                    <Facebook className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                    <span>Enter Your Facebook Page URL / Name:</span>
                  </label>
                  {onboardingData?.facebookPageUrl && (
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                        onboardingData.socialOnboardingStatus === 'CONNECTED'
                          ? 'bg-emerald-500/20 text-emerald-400'
                          : onboardingData.socialOnboardingStatus === 'REQUEST_SENT'
                          ? 'bg-indigo-500/20 text-indigo-400'
                          : 'bg-amber-500/20 text-amber-300'
                      }`}
                    >
                      {onboardingData.socialOnboardingStatus || 'SUBMITTED'}
                    </span>
                  )}
                </div>

                <div className="flex flex-col sm:flex-row gap-2">
                  <input
                    type="text"
                    value={modalPageInput}
                    onChange={(e) => setModalPageInput(e.target.value)}
                    placeholder="e.g. https://facebook.com/sharmasweets or Sharma Sweets"
                    className="flex-1 px-3 py-2 rounded-xl bg-[#0B0F17] border border-[#2C384E] text-slate-100 placeholder:text-slate-500 text-xs focus:outline-none focus:border-amber-400 font-mono"
                  />
                  <button
                    type="button"
                    disabled={isSubmittingPageLink || !modalPageInput.trim()}
                    onClick={handleModalSubmit}
                    className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-slate-950 font-bold text-xs transition cursor-pointer active:scale-95 shrink-0 flex items-center justify-center gap-1.5"
                  >
                    {isSubmittingPageLink ? 'Saving...' : submitSuccess ? 'Submitted! ✅' : 'Submit Page to Admin'}
                  </button>
                </div>

                {onboardingData?.facebookPageUrl && (
                  <p className="text-[11px] text-emerald-400 flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                    <span>Saved in system: <strong className="font-mono text-white">{onboardingData.facebookPageUrl}</strong></span>
                  </p>
                )}
              </div>
            </div>

            {/* Step 3: Approval Action Bar */}
            <div className="p-4 rounded-2xl bg-[#0B0F17] border border-[#2C384E] space-y-3">
              <div className="flex items-center gap-2 text-emerald-400 font-bold text-xs uppercase tracking-wider">
                <span className="w-5 h-5 rounded-full bg-emerald-500 text-black flex items-center justify-center font-black text-[11px]">
                  3
                </span>
                <span>Your Final Step: 1-Click Request Approval</span>
              </div>

              <p className="text-slate-300 text-xs leading-relaxed">
                Agency partnership requests do not appear in normal personal Facebook notifications. Open this official Meta portal to approve:
              </p>

              {/* Elevated Link Box */}
              <div className="p-3.5 rounded-xl bg-[#131B2A] border border-[#2C384E] space-y-2.5 shadow-inner">
                <div className="flex items-center justify-between text-[11px]">
                  <span className="text-slate-400 flex items-center gap-1.5 font-medium">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Official Meta Approval Portal</span>
                  </span>
                  <span className="text-slate-500 font-mono text-[10px]">business.facebook.com</span>
                </div>

                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                  <div className="flex-1 flex items-center gap-2 px-3 py-2 rounded-xl bg-slate-50 dark:bg-[#0B0F17] border border-slate-200 dark:border-[#2C384E] font-mono text-xs overflow-hidden">
                    <Globe className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                    <span className="text-emerald-600 dark:text-emerald-400 select-none">https://</span>
                    <span className="text-slate-800 dark:text-slate-200 font-semibold truncate">
                      business.facebook.com/settings/requests
                    </span>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      type="button"
                      onClick={handleCopyLink}
                      className="flex-1 sm:flex-none inline-flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 border border-slate-300 text-slate-800 hover:text-slate-900 dark:bg-[#1A2333] dark:hover:bg-[#223046] dark:border-[#2C384E] dark:text-slate-200 dark:hover:text-white font-semibold text-xs transition cursor-pointer active:scale-95 shadow-xs"
                    >
                      {copiedLink ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                          <span className="text-emerald-600 dark:text-emerald-400 font-bold">Copied!</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400" />
                          <span>Copy Link</span>
                        </>
                      )}
                    </button>

                    <a
                      href={APPROVAL_URL}
                      target="_blank"
                      rel="noreferrer"
                      className="flex-1 sm:flex-none inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs transition shadow-md hover:shadow-emerald-500/20 active:scale-95 cursor-pointer"
                    >
                      <span>Open Meta</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  </div>
                </div>
              </div>

              {/* 3 Visual Guidance Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-1">
                <div className="p-2.5 rounded-xl bg-[#131B2A] border border-[#2C384E]/70 flex items-start gap-2.5">
                  <div className="w-6 h-6 rounded-lg bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 font-bold flex items-center justify-center text-xs shrink-0 mt-0.5">
                    <Inbox className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <p className="font-bold text-white text-xs">1. "Received" Tab</p>
                    <p className="text-slate-400 text-[10px] mt-0.5 leading-snug">
                      Open link above & switch to the <strong>Received</strong> tab.
                    </p>
                  </div>
                </div>

                <div className="p-2.5 rounded-xl bg-[#131B2A] border border-[#2C384E]/70 flex items-start gap-2.5">
                  <div className="w-6 h-6 rounded-lg bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 font-bold flex items-center justify-center text-xs shrink-0 mt-0.5">
                    <MousePointerClick className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <p className="font-bold text-white text-xs">2. Tap "Approve"</p>
                    <p className="text-slate-400 text-[10px] mt-0.5 leading-snug">
                      Locate <strong>Brandflow</strong>'s request and click Approve.
                    </p>
                  </div>
                </div>

                <div className="p-2.5 rounded-xl bg-[#131B2A] border border-[#2C384E]/70 flex items-start gap-2.5">
                  <div className="w-6 h-6 rounded-lg bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 font-bold flex items-center justify-center text-xs shrink-0 mt-0.5">
                    <KeyRound className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <p className="font-bold text-white text-xs">3. Enter Password</p>
                    <p className="text-slate-400 text-[10px] mt-0.5 leading-snug">
                      Enter Facebook password to confirm. That is all!
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* What Happens Next Summary */}
            <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 flex items-start gap-2.5">
              <div className="p-1.5 rounded-lg bg-emerald-500/15 text-emerald-400 shrink-0 mt-0.5">
                <UserCheck className="w-4 h-4" />
              </div>
              <div>
                <p className="font-bold text-white text-xs">What Happens Next?</p>
                <p className="text-slate-300 text-xs mt-0.5 leading-relaxed">
                  The BrandFlow team activates your connection in seconds. When you refresh your BrandFlow dashboard, both Facebook and Instagram will show as <strong className="text-emerald-400 font-semibold">Connected</strong>. You can immediately choose designs in Post Studio and click <strong>"Publish Now"</strong>!
                </p>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: STARTING FROM ZERO - TAP-BY-TAP MOBILE SETUP */}
        {activeTab === 'setup' && (
          <div className="space-y-3.5">
            <div className="p-3 rounded-xl bg-indigo-500/10 border border-indigo-500/25 flex items-center justify-between gap-2">
              <p className="text-indigo-200 text-xs">
                Follow these 3 simple mobile steps below. Each step takes less than 60 seconds on your phone!
              </p>
              <button
                type="button"
                onClick={handleCopyWhatsAppGuide}
                className="shrink-0 inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-500/40 text-emerald-300 font-semibold text-[11px] transition cursor-pointer"
              >
                {copiedWhatsApp ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Copied!</span>
                  </>
                ) : (
                  <>
                    <MessageSquare className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Copy for WhatsApp</span>
                  </>
                )}
              </button>
            </div>

            {/* Sub-Step A: Create Facebook Business Page */}
            <div className="p-4 rounded-2xl bg-[#0B0F17] border border-[#2C384E] space-y-2.5">
              <div className="flex items-center gap-2 text-blue-400 font-bold text-xs uppercase tracking-wider">
                <span className="w-5 h-5 rounded-full bg-blue-500 text-white flex items-center justify-center font-black text-[11px]">
                  A
                </span>
                <span>How to Create a Facebook Business Page (60 Seconds)</span>
              </div>

              <div className="p-3 rounded-xl bg-[#131B2A] border border-[#2C384E] space-y-2 text-slate-300 text-xs leading-relaxed">
                <p className="font-semibold text-white flex items-center gap-1.5">
                  <Smartphone className="w-3.5 h-3.5 text-blue-400" />
                  <span>On your phone in the Facebook App:</span>
                </p>

                <ol className="list-decimal list-inside space-y-1.5 text-[11px] text-slate-300 pl-1">
                  <li>
                    Open the <strong>Facebook App</strong>.
                  </li>
                  <li>
                    Tap the <strong>Menu icon (`☰`)</strong> (Top-right on Android, Bottom-right on iPhone).
                  </li>
                  <li>
                    Tap on <strong>"Pages"</strong> (look for the orange flag icon 🚩).
                  </li>
                  <li>
                    Tap the <strong>"+ Create"</strong> button at the top-left, then tap <strong>"Get Started"</strong>.
                  </li>
                  <li>
                    <strong>Page Name:</strong> Type your business or clinic name (e.g. <em>Sharma Sweets</em> or <em>Apex Clinic</em>) ➔ tap <strong>"Next"</strong>.
                  </li>
                  <li>
                    <strong>Category:</strong> Search your business category (e.g. <em>Restaurant</em>, <em>Doctor</em>, <em>Retail</em>) ➔ tap <strong>"Create"</strong> ➔ tap <strong>"Done"</strong>.
                  </li>
                </ol>

                <div className="p-2 rounded-lg bg-blue-500/10 border border-blue-500/20 text-blue-300 text-[11px]">
                  💡 <strong>To copy your Page link:</strong> Go to your Page profile ➔ tap the three dots (<strong>...</strong>) ➔ tap <strong>"Copy link to Page"</strong>.
                </div>
              </div>
            </div>

            {/* Sub-Step B: Switch Instagram to Professional */}
            <div className="p-4 rounded-2xl bg-[#0B0F17] border border-[#2C384E] space-y-2.5">
              <div className="flex items-center gap-2 text-pink-400 font-bold text-xs uppercase tracking-wider">
                <span className="w-5 h-5 rounded-full bg-pink-500 text-white flex items-center justify-center font-black text-[11px]">
                  B
                </span>
                <span>Switch Instagram to Free Professional Account (45 Seconds)</span>
              </div>

              <div className="p-3 rounded-xl bg-[#131B2A] border border-[#2C384E] space-y-2 text-slate-300 text-xs leading-relaxed">
                <p className="font-semibold text-white flex items-center gap-1.5">
                  <Smartphone className="w-3.5 h-3.5 text-pink-400" />
                  <span>On your phone in the Instagram App:</span>
                </p>

                <ol className="list-decimal list-inside space-y-1.5 text-[11px] text-slate-300 pl-1">
                  <li>
                    Open the <strong>Instagram App</strong> and tap your <strong>Profile photo</strong> in the bottom-right corner.
                  </li>
                  <li>
                    Tap the <strong>Menu icon (`☰`)</strong> in the top-right corner.
                  </li>
                  <li>
                    Tap <strong>"Settings and privacy"</strong> (or "Settings").
                  </li>
                  <li>
                    Scroll down to <strong>"For professionals"</strong> and tap <strong>"Account type and tools"</strong>.
                  </li>
                  <li>
                    Tap <strong>"Switch to professional account"</strong> ➔ tap <strong>"Continue"</strong> through the intro screens.
                  </li>
                  <li>
                    Select your business category ➔ when asked, choose <strong>"Business"</strong> ➔ tap <strong>"Next"</strong> ➔ tap <strong>"X"</strong> to exit.
                  </li>
                </ol>

                <div className="p-2 rounded-lg bg-pink-500/10 border border-pink-500/20 text-pink-300 text-[11px]">
                  ✨ Professional Business accounts on Instagram are <strong>100% Free forever</strong>.
                </div>
              </div>
            </div>

            {/* Sub-Step C: Link Instagram to Facebook Page */}
            <div className="p-4 rounded-2xl bg-[#0B0F17] border border-[#2C384E] space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-emerald-400 font-bold text-xs uppercase tracking-wider">
                  <span className="w-5 h-5 rounded-full bg-emerald-500 text-black flex items-center justify-center font-black text-[11px]">
                    C
                  </span>
                  <span>Connect Instagram to Facebook Page (30 Seconds)</span>
                </div>
                <span className="px-2 py-0.5 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-[10px] font-bold">
                  Recommended via Facebook
                </span>
              </div>

              {/* Method 1: Facebook Linked Accounts (Primary) */}
              <div className="p-3 rounded-xl bg-[#131B2A] border border-emerald-500/30 space-y-2 text-slate-300 text-xs leading-relaxed">
                <div className="flex items-center justify-between">
                  <p className="font-bold text-emerald-400 flex items-center gap-1.5 text-xs">
                    <Facebook className="w-4 h-4 text-blue-400" />
                    <span>Method 1 (Recommended): Via Facebook "Linked Accounts"</span>
                  </p>
                  <span className="text-[10px] text-emerald-400 font-semibold">100% Reliable</span>
                </div>

                <p className="text-[11px] text-slate-400">
                  On your phone in the <strong>Facebook App</strong>:
                </p>

                <ol className="list-decimal list-inside space-y-1.5 text-[11px] text-slate-300 pl-1">
                  <li>
                    Switch to your Page: Tap <strong>Menu (`☰`)</strong> ➔ tap your <strong>Page Name</strong>.
                  </li>
                  <li>
                    On your Page, tap the <strong>Settings icon (⚙️ gear)</strong> in the top-right corner.
                  </li>
                  <li>
                    Tap on <strong>"Linked Accounts"</strong> ➔ tap <strong>"Instagram"</strong>.
                  </li>
                  <li>
                    Tap the blue <strong>"Connect account"</strong> button ➔ tap <strong>"Continue"</strong> / <strong>"Confirm"</strong>.
                  </li>
                  <li>
                    Enter your Instagram username & password ➔ tap <strong>"Log in"</strong> ➔ tap <strong>"Confirm"</strong>.
                  </li>
                </ol>

                <div className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-300 text-[10px] flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span>Done! You will see your Instagram profile with a green checkmark.</span>
                </div>
              </div>

              {/* Method 2: Via Instagram App (Alternative) */}
              <div className="p-3 rounded-xl bg-[#131B2A] border border-[#2C384E] space-y-1.5 text-slate-300 text-xs">
                <p className="font-semibold text-slate-200 flex items-center gap-1.5 text-[11px]">
                  <Instagram className="w-3.5 h-3.5 text-pink-400" />
                  <span>Method 2 (Alternative): Via Instagram App "Edit Profile"</span>
                </p>

                <p className="text-[11px] text-slate-400 leading-relaxed pl-1">
                  In Instagram App ➔ Go to your Profile ➔ Tap <strong>"Edit profile"</strong> ➔ Under <em>Public business information</em> tap <strong>"Page"</strong> ➔ Tap <strong>"Connect existing Page"</strong> ➔ Select your Facebook Page ➔ Tap <strong>"Done"</strong>.
                </p>
              </div>

              {/* Ready to connect banner */}
              <div className="pt-1">
                <button
                  type="button"
                  onClick={() => setActiveTab('approval')}
                  className="w-full py-2.5 px-4 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs flex items-center justify-center gap-2 shadow-lg hover:shadow-emerald-500/20 transition cursor-pointer active:scale-98"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Both Accounts Ready! Switch to 1-Click Approval</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Footer Actions */}
        <div className="pt-2 flex items-center justify-between">
          <span className="text-[11px] text-slate-500">
            BrandFlow Enterprise Social Suite
          </span>
          <Button variant="primary" size="sm" onClick={onClose} className="px-6 font-bold">
            Got It, Close
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default ClientOnboardingHelpModal;

