import React, { useState } from 'react';
import { ShieldCheck, Users, Activity, FileText, BarChart3, Lock, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { ADMIN_TABS } from '../constants/theme.constants';
import { Card } from '../components/ui/Card';
import { FestivalCalendarView } from '../components/admin/FestivalCalendarView';
import { BaseTemplateManager } from '../components/admin/BaseTemplateManager';

export const SubAdminDashboardPage = () => {
  const { user, allowedTabs } = useAuth();
  
  // Filter tabs allowed for this SubAdmin (or show all if superadmin/all)
  const availableTabs = ADMIN_TABS.filter(
    (tab) => allowedTabs.includes('all') || allowedTabs.includes(tab.id)
  );

  const [activeTab, setActiveTab] = useState(availableTabs[0]?.id || 'users');

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* SubAdmin Header Banner */}
      <div className="glass-panel p-6 sm:p-8 rounded-2xl border border-teal-500/30 bg-gradient-to-r from-teal-500/10 via-slate-900 to-indigo-500/10 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-500/20 text-teal-300 text-xs font-semibold">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>SubAdmin Control Center</span>
          </div>
          <h1 className="font-heading font-extrabold text-2xl sm:text-3xl text-white">
            SubAdmin Workstation
          </h1>
          <p className="text-sm text-slate-400">
            Welcome <span className="text-teal-400 font-semibold">{user?.fullName || user?.email}</span>. You are authorized to manage assigned platform tabs.
          </p>
        </div>

        {/* Security Notice Pill */}
        <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-slate-900/90 border border-slate-800 text-slate-400 text-xs shrink-0">
          <Lock className="w-4 h-4 text-amber-400" />
          <span>Admin Creation Restricted to SuperAdmin</span>
        </div>
      </div>

      {/* Allowed Tabs Navigation */}
      <div className="flex items-center gap-2 overflow-x-auto border-b border-slate-800 pb-2">
        {availableTabs.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2.5 rounded-xl font-semibold text-xs transition-all shrink-0 flex items-center gap-2 ${
                isActive
                  ? 'bg-teal-500 text-slate-950 shadow-glow-teal font-bold'
                  : 'bg-slate-900/60 text-slate-400 hover:text-white border border-slate-800'
              }`}
            >
              <span>{tab.label}</span>
              {isActive && <CheckCircle2 className="w-3.5 h-3.5" />}
            </button>
          );
        })}
      </div>

      {/* Tab Content Display */}
      <div className="space-y-6">
        {activeTab === 'users' && (
          <Card className="border-slate-800 space-y-4">
            <h3 className="font-heading font-bold text-lg text-white flex items-center gap-2">
              <Users className="w-5 h-5 text-teal-400" />
              <span>Users & Tenant Management</span>
            </h3>
            <p className="text-xs text-slate-400">Active tenant monitoring and account status overview.</p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800">
                <p className="text-xs text-slate-400">Total SMB Users</p>
                <p className="text-2xl font-bold text-white mt-1">1,248</p>
              </div>
              <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800">
                <p className="text-xs text-slate-400">Active Tenants</p>
                <p className="text-2xl font-bold text-emerald-400 mt-1">1,190</p>
              </div>
              <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800">
                <p className="text-xs text-slate-400">Trial Users</p>
                <p className="text-2xl font-bold text-amber-400 mt-1">58</p>
              </div>
            </div>
          </Card>
        )}

        {activeTab === 'analytics' && (
          <Card className="border-slate-800 space-y-4">
            <h3 className="font-heading font-bold text-lg text-white flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-teal-400" />
              <span>Platform Analytics</span>
            </h3>
            <p className="text-xs text-slate-400">Real-time usage metrics and AI generation metrics.</p>
            <div className="p-6 rounded-xl bg-slate-900/80 border border-slate-800 text-center text-slate-400 text-sm">
              Analytics report loaded. Total posts generated this month: <strong className="text-white">45,820</strong>
            </div>
          </Card>
        )}

        {activeTab === 'templates' && (
          <div className="space-y-6">
            <BaseTemplateManager />
            <FestivalCalendarView />
          </div>
        )}

        {activeTab === 'posts' && (
          <Card className="border-slate-800 space-y-4">
            <h3 className="font-heading font-bold text-lg text-white flex items-center gap-2">
              <Activity className="w-5 h-5 text-teal-400" />
              <span>Social Posts Audit Queue</span>
            </h3>
            <p className="text-xs text-slate-400">Review publishing status and queue logs.</p>
            <div className="p-6 rounded-xl bg-slate-900/80 border border-slate-800 text-center text-slate-400 text-sm">
              All social publishing workers operating normally.
            </div>
          </Card>
        )}
      </div>
    </div>
  );
};

export default SubAdminDashboardPage;
