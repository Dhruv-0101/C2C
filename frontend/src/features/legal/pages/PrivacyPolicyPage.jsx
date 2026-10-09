import React from 'react';
import { LegalPageLayout } from '../components/LegalPageLayout';
import { Card } from '@/components/ui/Card';
import { ShieldCheck, Lock, Trash2, Globe, Mail, AlertCircle, CheckCircle2 } from 'lucide-react';

const SECTIONS = [
  { id: 'introduction', title: 'Introduction & Scope' },
  { id: 'data-collected', title: 'Information We Collect' },
  { id: 'meta-compliance', title: 'Meta (Facebook & Instagram) Integration' },
  { id: 'data-deletion', title: 'User Data Deletion Instructions' },
  { id: 'how-we-use-data', title: 'How We Use Your Data' },
  { id: 'ai-processing', title: 'AI Generation & Third-Party Processors' },
  { id: 'security-storage', title: 'Data Security & Encryption' },
  { id: 'cookies-tracking', title: 'Cookies & Session Authentication' },
  { id: 'user-rights', title: 'Your Rights (GDPR & CCPA)' },
  { id: 'retention-policy', title: 'Data Retention' },
  { id: 'contact-us', title: 'Contact Information' },
];

/**
 * 🔒 PrivacyPolicyPage
 * Enterprise Privacy Policy compliant with Meta Platform Terms, GDPR, and CCPA standards.
 */
export const PrivacyPolicyPage = () => {
  return (
    <LegalPageLayout
      title="Privacy Policy"
      subtitle="Transparency regarding how BrandFlow collects, encrypts, and processes your business information and connected Meta social channels."
      lastUpdated="October 9, 2026"
      version="2.4"
      sections={SECTIONS}
    >
      {/* 1. Introduction & Scope */}
      <section id="introduction" className="space-y-4">
        <h2 className="text-xl font-heading font-bold text-white border-b border-slate-800 pb-2">
          1. Introduction & Scope
        </h2>
        <p>
          Welcome to <strong>BrandFlow</strong> ("BrandFlow", "we", "our", or "us"). We provide an AI-powered social media management, brand kit automation, and scheduled publishing platform designed for small businesses, agencies, and enterprise brands.
        </p>
        <p>
          This Privacy Policy explains how we collect, store, utilize, and protect your personal data, business assets, and connected social media profiles when you use our website, APIs, and web application (the "Platform"). By creating an account or connecting social accounts to BrandFlow, you consent to the data practices described in this policy.
        </p>
      </section>

      {/* 2. Information We Collect */}
      <section id="data-collected" className="space-y-4">
        <h2 className="text-xl font-heading font-bold text-white border-b border-slate-800 pb-2">
          2. Information We Collect
        </h2>
        <p>We collect only the minimum necessary data required to deliver our brand customization and scheduled posting services:</p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card className="p-4 bg-[#131B2A] border-slate-800 space-y-2">
            <h3 className="font-bold text-amber-400 text-xs uppercase tracking-wider">Account Credentials</h3>
            <p className="text-xs text-slate-300">
              Your name, email address, hashed passwords (bcrypt), account creation timestamps, and Two-Factor Authentication (2FA) verification secrets.
            </p>
          </Card>

          <Card className="p-4 bg-[#131B2A] border-slate-800 space-y-2">
            <h3 className="font-bold text-sky-400 text-xs uppercase tracking-wider">Brand Kit & Assets</h3>
            <p className="text-xs text-slate-300">
              Business trade name, brand colors, taglines, phone numbers, website addresses, uploaded high-resolution logos, and custom frames.
            </p>
          </Card>

          <Card className="p-4 bg-[#131B2A] border-slate-800 space-y-2">
            <h3 className="font-bold text-emerald-400 text-xs uppercase tracking-wider">Social Channel Access</h3>
            <p className="text-xs text-slate-300">
              OAuth access tokens, Facebook Page IDs, and Instagram Professional Account IDs granted via Meta Business Login for authorized publishing.
            </p>
          </Card>

          <Card className="p-4 bg-[#131B2A] border-slate-800 space-y-2">
            <h3 className="font-bold text-purple-400 text-xs uppercase tracking-wider">Generated Content & Analytics</h3>
            <p className="text-xs text-slate-300">
              Marketing captions generated via AI, post graphics created on canvas, scheduling calendar queues, and publication audit logs.
            </p>
          </Card>
        </div>
      </section>

      {/* 3. Meta (Facebook & Instagram) Compliance */}
      <section id="meta-compliance" className="space-y-4">
        <h2 className="text-xl font-heading font-bold text-white border-b border-slate-800 pb-2">
          3. Meta (Facebook & Instagram) Integration Compliance
        </h2>
        <p>
          BrandFlow integrates with Meta APIs (Facebook Graph API and Instagram Graph API) to allow users to automatically schedule and publish custom marketing graphics directly to their business profiles.
        </p>

        <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-200 text-xs space-y-2">
          <div className="flex items-center gap-2 font-bold text-amber-400">
            <ShieldCheck className="w-4 h-4 shrink-0" />
            <span>Our Commitment to Meta Platform Terms:</span>
          </div>
          <ul className="list-disc pl-5 space-y-1 text-slate-300">
            <li>We <strong>NEVER</strong> sell your Meta user data or Facebook Page information to third parties or data brokers.</li>
            <li>We <strong>NEVER</strong> access or store personal messages, friends lists, or private user feeds.</li>
            <li>All Page Access Tokens are encrypted with AES-256 before being committed to our PostgreSQL database.</li>
            <li>Tokens are utilized strictly for the permissions requested: publishing graphics and reading post performance metrics.</li>
          </ul>
        </div>
      </section>

      {/* 4. User Data Deletion Instructions (MANDATORY FOR META) */}
      <section id="data-deletion" className="space-y-4">
        <h2 className="text-xl font-heading font-bold text-white border-b border-slate-800 pb-2 flex items-center gap-2">
          <span>4. User Data Deletion Instructions</span>
          <span className="text-xs px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
            Meta Compliance
          </span>
        </h2>
        <p>
          In accordance with Meta Platform Terms, users have the right to request the deletion of all data associated with their Facebook or Instagram accounts stored within BrandFlow.
        </p>

        <Card className="p-5 bg-[#131B2A] border-slate-700/80 space-y-3">
          <h3 className="font-bold text-white text-sm flex items-center gap-2">
            <Trash2 className="w-4 h-4 text-rose-400" />
            <span>How to Delete Your Data from BrandFlow:</span>
          </h3>
          
          <div className="space-y-2 text-xs text-slate-300">
            <p><strong>Option 1: Disconnect directly inside BrandFlow</strong></p>
            <ol className="list-decimal pl-5 space-y-1">
              <li>Log in to your BrandFlow dashboard and navigate to <strong>Connections</strong>.</li>
              <li>Click <strong>Disconnect</strong> next to your Facebook or Instagram profile.</li>
              <li>All associated Page Access Tokens and linked profile identifiers are permanently purged immediately.</li>
            </ol>
            
            <p className="pt-2"><strong>Option 2: Revoke via Facebook Business Settings</strong></p>
            <ol className="list-decimal pl-5 space-y-1">
              <li>Log into your Facebook account and go to <strong>Settings & Privacy → Settings</strong>.</li>
              <li>Click on <strong>Business Integrations</strong> or <strong>Apps and Websites</strong>.</li>
              <li>Find <strong>BrandFlow</strong> and click <strong>Remove</strong>.</li>
              <li>Select the checkbox to remove all posts published by BrandFlow if desired, then confirm.</li>
            </ol>

            <p className="pt-2"><strong>Option 3: Email Deletion Request</strong></p>
            <p>
              Send an email to <a href="mailto:privacy@brandflow.io" className="text-amber-400 underline">privacy@brandflow.io</a> with the subject line <em>"Data Deletion Request"</em> from your registered account email. Our data protection team will scrub all account records, brand assets, and analytics within 48 hours and send you a confirmation report.
            </p>
          </div>
        </Card>
      </section>

      {/* 5. How We Use Your Data */}
      <section id="how-we-use-data" className="space-y-4">
        <h2 className="text-xl font-heading font-bold text-white border-b border-slate-800 pb-2">
          5. How We Use Your Data
        </h2>
        <ul className="list-disc pl-5 space-y-2 text-slate-300 text-xs sm:text-sm">
          <li><strong>Frame Generation:</strong> Dynamically overlaying your business logo, contact number, and website onto marketing templates.</li>
          <li><strong>Automated Publishing:</strong> Transmitting scheduled image graphics and captions to Meta Graph API at your chosen time.</li>
          <li><strong>Content Suggestions:</strong> Analyzing your industry niche (e.g. Healthcare, Retail) to recommend relevant festival templates.</li>
          <li><strong>Security & Authentication:</strong> Verifying sessions with secure HTTP-only cookies and protecting against brute-force attacks.</li>
        </ul>
      </section>

      {/* 6. AI Processing & Third-Party Processors */}
      <section id="ai-processing" className="space-y-4">
        <h2 className="text-xl font-heading font-bold text-white border-b border-slate-800 pb-2">
          6. AI Generation & Third-Party Processors
        </h2>
        <p>
          To deliver AI features, BrandFlow interfaces with trusted enterprise service providers under strict data privacy agreements:
        </p>
        <ul className="list-disc pl-5 space-y-1.5 text-xs text-slate-300">
          <li><strong>Google Gemini / OpenAI:</strong> Generates captions and marketing hashtags. Prompts contain business context only and are not used to train public foundational models.</li>
          <li><strong>Cloudinary / AWS S3:</strong> Securely stores user uploaded logos, brand assets, and generated banner graphics.</li>
          <li><strong>Redis / BullMQ:</strong> Manages in-memory queues and background workers for timely post publishing.</li>
        </ul>
      </section>

      {/* 7. Data Security & Encryption */}
      <section id="security-storage" className="space-y-4">
        <h2 className="text-xl font-heading font-bold text-white border-b border-slate-800 pb-2">
          7. Data Security & Encryption
        </h2>
        <p>
          We employ enterprise-grade security protocols across all application tiers:
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 text-xs">
            <Lock className="w-4 h-4 text-amber-400 mb-1" />
            <strong className="text-white block">AES-256 Encryption</strong>
            <span className="text-slate-400">All OAuth social tokens and sensitive secrets encrypted at rest.</span>
          </div>
          <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 text-xs">
            <ShieldCheck className="w-4 h-4 text-emerald-400 mb-1" />
            <strong className="text-white block">TLS 1.3 in Transit</strong>
            <span className="text-slate-400">All browser and API communications protected by HTTPS encryption.</span>
          </div>
          <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 text-xs">
            <AlertCircle className="w-4 h-4 text-sky-400 mb-1" />
            <strong className="text-white block">HTTP-Only Cookies</strong>
            <span className="text-slate-400">JWT tokens protected against XSS theft and CSRF exploits.</span>
          </div>
        </div>
      </section>

      {/* 8. Cookies & Session Authentication */}
      <section id="cookies-tracking" className="space-y-4">
        <h2 className="text-xl font-heading font-bold text-white border-b border-slate-800 pb-2">
          8. Cookies & Session Authentication
        </h2>
        <p>
          BrandFlow uses essential cookies strictly for security and session state management:
        </p>
        <ul className="list-disc pl-5 space-y-1 text-xs text-slate-300">
          <li><code>accessToken</code> & <code>refreshToken</code>: HTTP-only, secure, SameSite=Strict cookies to keep you safely signed in.</li>
          <li><code>brandflow_theme_mode</code>: Local storage token preserving your Dark/Light visual preference.</li>
        </ul>
      </section>

      {/* 9. User Rights (GDPR & CCPA) */}
      <section id="user-rights" className="space-y-4">
        <h2 className="text-xl font-heading font-bold text-white border-b border-slate-800 pb-2">
          9. Your Rights (GDPR & CCPA)
        </h2>
        <p>
          Regardless of your jurisdiction, BrandFlow honors core data rights:
        </p>
        <ul className="list-disc pl-5 space-y-1 text-xs text-slate-300">
          <li><strong>Right to Access:</strong> Export a full copy of your brand kit, posts, and account records.</li>
          <li><strong>Right to Rectification:</strong> Edit and update your business details at any time in Brand Kit settings.</li>
          <li><strong>Right to Erasure:</strong> Delete your account and all associated graphic assets permanently.</li>
          <li><strong>Right to Opt-Out:</strong> Revoke social media publishing authorizations at any time.</li>
        </ul>
      </section>

      {/* 10. Data Retention */}
      <section id="retention-policy" className="space-y-4">
        <h2 className="text-xl font-heading font-bold text-white border-b border-slate-800 pb-2">
          10. Data Retention
        </h2>
        <p>
          We retain active account data as long as your subscription is maintained. Upon account deletion, all brand assets, cached tokens, and queued post schedules are permanently removed from our active database within 30 days.
        </p>
      </section>

      {/* 11. Contact Information */}
      <section id="contact-us" className="space-y-4">
        <h2 className="text-xl font-heading font-bold text-white border-b border-slate-800 pb-2">
          11. Contact Information
        </h2>
        <p>
          If you have any questions or data requests regarding this Privacy Policy or our social media integrations, contact our Data Protection Officer:
        </p>
        <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 text-xs space-y-1">
          <p className="font-semibold text-white">BrandFlow Privacy & Legal Department</p>
          <p className="text-slate-400">Email: <a href="mailto:privacy@brandflow.io" className="text-amber-400 underline">privacy@brandflow.io</a></p>
          <p className="text-slate-400">Support Desk: <a href="mailto:support@brandflow.io" className="text-amber-400 underline">support@brandflow.io</a></p>
        </div>
      </section>
    </LegalPageLayout>
  );
};

export default PrivacyPolicyPage;
