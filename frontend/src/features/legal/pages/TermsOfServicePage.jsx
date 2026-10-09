import React from 'react';
import { LegalPageLayout } from '../components/LegalPageLayout';
import { Card } from '@/components/ui/Card';
import { Scale, CheckCircle2, AlertOctagon, DollarSign, ShieldAlert, Award } from 'lucide-react';

const SECTIONS = [
  { id: 'agreement', title: 'Agreement to Terms' },
  { id: 'eligibility-accounts', title: 'Accounts & Security' },
  { id: 'platform-services', title: 'BrandFlow Services & AI Features' },
  { id: 'social-publishing', title: 'Social Media Publishing & Meta Terms' },
  { id: 'ip-ownership', title: 'Intellectual Property & Content Rights' },
  { id: 'acceptable-use', title: 'Acceptable Use Policy' },
  { id: 'billing-quotas', title: 'Subscription Plans & Post Quotas' },
  { id: 'disclaimers', title: 'Disclaimers of Warranties' },
  { id: 'limitation-liability', title: 'Limitation of Liability' },
  { id: 'termination', title: 'Termination & Suspension' },
  { id: 'governing-law', title: 'Governing Law & Contact' },
];

/**
 * ⚖️ TermsOfServicePage
 * Enterprise Terms of Service governing BrandFlow platform usage, AI generation, and Meta publishing.
 */
export const TermsOfServicePage = () => {
  return (
    <LegalPageLayout
      title="Terms of Service"
      subtitle="The contractual terms and usage policies governing your access to the BrandFlow creative suite and automated social publishing tools."
      lastUpdated="October 9, 2026"
      version="2.4"
      sections={SECTIONS}
    >
      {/* 1. Agreement to Terms */}
      <section id="agreement" className="space-y-4">
        <h2 className="text-xl font-heading font-bold text-white border-b border-slate-800 pb-2">
          1. Agreement to Terms
        </h2>
        <p>
          These Terms of Service ("Terms") constitute a legally binding agreement between you ("User", "you", or "your") and <strong>BrandFlow</strong> ("BrandFlow", "we", "us", or "our").
        </p>
        <p>
          By accessing or using our application, website, AI frame editors, or automated social publishing tools, you agree to be bound by these Terms. If you are entering into these Terms on behalf of a company or other legal entity, you represent that you have the legal authority to bind such entity.
        </p>
      </section>

      {/* 2. Accounts & Security */}
      <section id="eligibility-accounts" className="space-y-4">
        <h2 className="text-xl font-heading font-bold text-white border-b border-slate-800 pb-2">
          2. Accounts & Security
        </h2>
        <div className="space-y-3 text-xs sm:text-sm text-slate-300">
          <p>
            <strong>Eligibility:</strong> You must be at least 18 years of age or the age of legal majority in your jurisdiction to use BrandFlow.
          </p>
          <p>
            <strong>Account Responsibility:</strong> You are responsible for maintaining the confidentiality of your account credentials, including passwords and Two-Factor Authentication (2FA) verification codes. You agree to notify us immediately of any unauthorized access to your account.
          </p>
          <p>
            <strong>Accurate Information:</strong> You agree to provide true, accurate, and current business information when configuring your Brand Kit.
          </p>
        </div>
      </section>

      {/* 3. Platform Services & AI Features */}
      <section id="platform-services" className="space-y-4">
        <h2 className="text-xl font-heading font-bold text-white border-b border-slate-800 pb-2">
          3. BrandFlow Services & AI Features
        </h2>
        <p>
          BrandFlow provides small businesses and creators with dynamic marketing frames, AI-generated captions, festival promotional templates, and automated publishing workflows.
        </p>
        <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-200 space-y-1">
          <strong className="text-amber-400 block font-bold">AI-Generated Content:</strong>
          <span>
            Marketing captions, hashtags, and suggestions are generated using machine learning models. While we continuously tune these models for accuracy and brand safety, you are solely responsible for reviewing and verifying all generated copy before publishing to public channels.
          </span>
        </div>
      </section>

      {/* 4. Social Media Publishing & Meta Platform Compliance */}
      <section id="social-publishing" className="space-y-4">
        <h2 className="text-xl font-heading font-bold text-white border-b border-slate-800 pb-2">
          4. Social Media Publishing & Meta Platform Compliance
        </h2>
        <p>
          BrandFlow connects with third-party social networks, including Meta (Facebook & Instagram) and LinkedIn, via official APIs.
        </p>
        <ul className="list-disc pl-5 space-y-2 text-xs sm:text-sm text-slate-300">
          <li>
            <strong>Authorized Ownership:</strong> By connecting a Facebook Page or Instagram Professional account to BrandFlow, you warrant that you are an authorized administrator or editor of that page with full publishing permissions.
          </li>
          <li>
            <strong>Meta Policies:</strong> You agree to comply with all applicable <a href="https://developers.facebook.com/terms/" target="_blank" rel="noreferrer" className="text-amber-400 underline">Meta Developer Terms</a> and <a href="https://www.facebook.com/communitystandards/" target="_blank" rel="noreferrer" className="text-amber-400 underline">Community Standards</a>.
          </li>
          <li>
            <strong>Prohibited Content:</strong> You may not use BrandFlow to publish spam, misleading promotions, counterfeit goods, discriminatory or defamatory content, or any material infringing on third-party intellectual property.
          </li>
        </ul>
      </section>

      {/* 5. Intellectual Property & Content Rights */}
      <section id="ip-ownership" className="space-y-4">
        <h2 className="text-xl font-heading font-bold text-white border-b border-slate-800 pb-2">
          5. Intellectual Property & Content Rights
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card className="p-4 bg-[#131B2A] border-slate-800 space-y-2">
            <h3 className="font-bold text-emerald-400 text-xs uppercase tracking-wider flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4" />
              <span>Your Content (100% Yours)</span>
            </h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              You retain full, exclusive ownership of your business trademarks, logos, uploaded photos, and brand slogans. You grant BrandFlow only the limited license necessary to render frames and publish posts on your behalf.
            </p>
          </Card>

          <Card className="p-4 bg-[#131B2A] border-slate-800 space-y-2">
            <h3 className="font-bold text-amber-400 text-xs uppercase tracking-wider flex items-center gap-1.5">
              <Award className="w-4 h-4" />
              <span>BrandFlow Platform Rights</span>
            </h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              BrandFlow and its licensors retain all proprietary rights, copyright, and trade secrets in the platform software, frame rendering engine, UI designs, and festival graphic template libraries.
            </p>
          </Card>
        </div>
      </section>

      {/* 6. Acceptable Use Policy */}
      <section id="acceptable-use" className="space-y-4">
        <h2 className="text-xl font-heading font-bold text-white border-b border-slate-800 pb-2">
          6. Acceptable Use Policy
        </h2>
        <p>When using BrandFlow, you agree NOT to:</p>
        <ul className="list-disc pl-5 space-y-1.5 text-xs text-slate-300">
          <li>Reverse engineer, decompile, or extract the source code of BrandFlow.</li>
          <li>Bypass rate limits, subscription quotas, or API authentication mechanisms.</li>
          <li>Scrape, index, or harvest user data or marketing templates without authorization.</li>
          <li>Use the platform to distribute viruses, trojans, or automated bot attacks.</li>
          <li>Resell or redistribute BrandFlow template assets as standalone digital clipart.</li>
        </ul>
      </section>

      {/* 7. Subscription Plans & Post Quotas */}
      <section id="billing-quotas" className="space-y-4">
        <h2 className="text-xl font-heading font-bold text-white border-b border-slate-800 pb-2">
          7. Subscription Plans & Post Quotas
        </h2>
        <div className="space-y-2 text-xs sm:text-sm text-slate-300">
          <p>
            <strong>Billing Cycles:</strong> Paid subscriptions renew automatically on a monthly or annual basis unless cancelled prior to the renewal date.
          </p>
          <p>
            <strong>Post Quotas:</strong> Each plan allocates a specific quota of publishable posts per billing period. Unused quotas do not roll over to subsequent billing cycles unless explicitly specified.
          </p>
          <p>
            <strong>Refunds:</strong> Subscriptions are non-refundable once activated and used to publish live posts or generate AI frames. You may cancel at any time to avoid future renewals.
          </p>
        </div>
      </section>

      {/* 8. Disclaimers of Warranties */}
      <section id="disclaimers" className="space-y-4">
        <h2 className="text-xl font-heading font-bold text-white border-b border-slate-800 pb-2">
          8. Disclaimers of Warranties
        </h2>
        <p className="text-xs text-slate-300 leading-relaxed uppercase tracking-wide">
          THE BRANDFLOW PLATFORM IS PROVIDED ON AN "AS IS" AND "AS AVAILABLE" BASIS WITHOUT WARRANTIES OF ANY KIND, WHETHER EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, OR UNINTERRUPTED UPTIME. WE DO NOT GUARANTEE THAT THIRD-PARTY SOCIAL NETWORKS (FACEBOOK, INSTAGRAM) WILL ACCEPT EVERY SCHEDULED POST WITHOUT API RESTRICTIONS.
        </p>
      </section>

      {/* 9. Limitation of Liability */}
      <section id="limitation-liability" className="space-y-4">
        <h2 className="text-xl font-heading font-bold text-white border-b border-slate-800 pb-2">
          9. Limitation of Liability
        </h2>
        <p className="text-xs text-slate-300 leading-relaxed">
          IN NO EVENT SHALL BRANDFLOW, ITS DIRECTORS, EMPLOYEES, OR AFFILIATES BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES (INCLUDING LOSS OF PROFITS, DATA, OR BUSINESS REPUTATION) ARISING OUT OF OR IN CONNECTION WITH YOUR USE OF THE PLATFORM, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGES.
        </p>
      </section>

      {/* 10. Termination & Suspension */}
      <section id="termination" className="space-y-4">
        <h2 className="text-xl font-heading font-bold text-white border-b border-slate-800 pb-2">
          10. Termination & Suspension
        </h2>
        <p>
          We reserve the right to suspend or terminate your account immediately if you breach these Terms, violate Meta Platform policies, or engage in fraudulent payment activity. You may terminate your account at any time via your Profile settings.
        </p>
      </section>

      {/* 11. Governing Law & Contact */}
      <section id="governing-law" className="space-y-4">
        <h2 className="text-xl font-heading font-bold text-white border-b border-slate-800 pb-2">
          11. Governing Law & Contact Information
        </h2>
        <p>
          These Terms shall be governed by and construed in accordance with the laws of Delaware, United States, without regard to conflict of law principles.
        </p>
        <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 text-xs space-y-1">
          <p className="font-semibold text-white">BrandFlow Legal Department</p>
          <p className="text-slate-400">Email: <a href="mailto:legal@brandflow.io" className="text-amber-400 underline">legal@brandflow.io</a></p>
          <p className="text-slate-400">Headquarters: BrandFlow Technologies Inc.</p>
        </div>
      </section>
    </LegalPageLayout>
  );
};

export default TermsOfServicePage;
