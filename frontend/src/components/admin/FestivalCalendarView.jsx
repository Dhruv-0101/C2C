import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Plus,
  Trash2,
  Sparkles,
  Globe,
  Tag,
  CheckCircle2,
  X,
  Grid,
  List,
} from 'lucide-react';
import { festivalApi } from '../../services/festival.api';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Alert } from '../ui/Alert';

const MONTH_NAMES = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
];

const WEEKDAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export const FestivalCalendarView = () => {
  const queryClient = useQueryClient();
  const [selectedYear, setSelectedYear] = useState(2026);
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth()); // 0-11
  const [viewMode, setViewMode] = useState('month'); // 'month' | 'year' | 'list'
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    date: `${2026}-${String(new Date().getMonth() + 1).padStart(2, '0')}-15`,
    description: '',
    targetRegion: 'India',
    bannerUrl: '',
  });

  // Fetch Festivals for selected year
  const {
    data: festivalResponse,
    isLoading,
    error,
  } = useQuery({
    queryKey: ['festivals', selectedYear],
    queryFn: () => festivalApi.getFestivals(selectedYear),
    staleTime: 5 * 60 * 1000,
  });

  const festivals = festivalResponse?.data?.festivals || [];

  // Create Festival Mutation
  const createFestivalMutation = useMutation({
    mutationFn: (data) => festivalApi.createFestival(data),
    onSuccess: () => {
      queryClient.invalidateQueries(['festivals']);
      setIsModalOpen(false);
      resetForm();
    },
    onError: (err) => {
      setErrorMsg(err.message || 'Failed to create festival.');
    },
  });

  // Delete Festival Mutation
  const deleteFestivalMutation = useMutation({
    mutationFn: (id) => festivalApi.deleteFestival(id),
    onSuccess: () => {
      queryClient.invalidateQueries(['festivals']);
    },
  });

  const resetForm = () => {
    setFormData({
      name: '',
      date: `${selectedYear}-${String(selectedMonth + 1).padStart(2, '0')}-01`,
      description: '',
      targetRegion: 'India',
      bannerUrl: '',
    });
    setErrorMsg('');
  };

  const handleDateClick = (dayNumber) => {
    const formattedDate = `${selectedYear}-${String(selectedMonth + 1).padStart(2, '0')}-${String(dayNumber).padStart(2, '0')}`;
    setFormData((prev) => ({ ...prev, date: formattedDate }));
    setIsModalOpen(true);
  };

  const handleCreateSubmit = (e) => {
    e.preventDefault();
    setErrorMsg('');
    if (!formData.name.trim() || !formData.date) return;
    createFestivalMutation.mutate(formData);
  };

  // Helper to generate calendar days for selected month & year
  const getDaysInMonth = (year, month) => {
    const date = new Date(year, month, 1);
    const days = [];
    const firstDayIndex = date.getDay(); // 0 is Sun
    const totalDays = new Date(year, month + 1, 0).getDate();

    // Lead padding empty days
    for (let i = 0; i < firstDayIndex; i++) {
      days.push(null);
    }
    // Month days
    for (let i = 1; i <= totalDays; i++) {
      days.push(i);
    }
    return days;
  };

  // Helper to find festivals on a specific day
  const getFestivalsForDay = (day) => {
    if (!day) return [];
    const dateStr = `${selectedYear}-${String(selectedMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    return festivals.filter((f) => {
      const fDate = new Date(f.date).toISOString().split('T')[0];
      return fDate === dateStr;
    });
  };

  const monthDays = getDaysInMonth(selectedYear, selectedMonth);

  return (
    <Card className="border-[#2C384E] bg-[#131B2A] p-6 space-y-6">
      {/* Header Bar: Navigation, Year & Mode Selectors */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-[#2C384E] pb-5">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400">
            <CalendarIcon className="w-5 h-5" />
          </div>
          <div>
            <h2 className="font-heading font-extrabold text-xl text-white">Festivals & Special Days Calendar</h2>
            <p className="text-xs text-slate-400">
              Schedule master promotional events and annual festival graphic presets.
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Year Switcher */}
          <div className="flex items-center bg-[#0B0F17] border border-[#2C384E] rounded-xl p-1">
            <button
              onClick={() => setSelectedYear((y) => y - 1)}
              className="p-1.5 text-slate-400 hover:text-white rounded-lg"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="px-3 font-heading font-bold text-sm text-amber-400">{selectedYear}</span>
            <button
              onClick={() => setSelectedYear((y) => y + 1)}
              className="p-1.5 text-slate-400 hover:text-white rounded-lg"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {/* View Mode Toggle */}
          <div className="flex items-center bg-[#0B0F17] border border-[#2C384E] rounded-xl p-1">
            <button
              onClick={() => setViewMode('month')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                viewMode === 'month' ? 'bg-amber-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-white'
              }`}
            >
              Month Grid
            </button>
            <button
              onClick={() => setViewMode('year')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                viewMode === 'year' ? 'bg-amber-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-white'
              }`}
            >
              Full Year
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                viewMode === 'list' ? 'bg-amber-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-white'
              }`}
            >
              List View
            </button>
          </div>

          {/* Add Festival Button */}
          <Button variant="primary" icon={Plus} onClick={() => setIsModalOpen(true)}>
            Add Festival / Day
          </Button>
        </div>
      </div>

      {/* Month Navigation Pills (Visible in Month mode) */}
      {viewMode === 'month' && (
        <div className="flex items-center gap-1.5 overflow-x-auto pb-2 border-b border-[#2C384E]">
          {MONTH_NAMES.map((monthName, index) => (
            <button
              key={monthName}
              onClick={() => setSelectedMonth(index)}
              className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition shrink-0 ${
                selectedMonth === index
                  ? 'bg-amber-500 text-slate-950 font-bold shadow-md shadow-amber-500/20'
                  : 'bg-[#0B0F17] text-slate-400 hover:text-white border border-[#2C384E]'
              }`}
            >
              {monthName}
            </button>
          ))}
        </div>
      )}

      {/* 1. MONTH GRID VIEW */}
      {viewMode === 'month' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-heading font-bold text-lg text-white">
              {MONTH_NAMES[selectedMonth]} {selectedYear}
            </h3>
            <span className="text-xs text-slate-400">Click any date to add a festival or special day.</span>
          </div>

          {/* Weekday Headers */}
          <div className="grid grid-cols-7 gap-2 text-center text-xs font-bold uppercase tracking-wider text-slate-400">
            {WEEKDAY_NAMES.map((d) => (
              <div key={d} className="py-2 bg-[#0B0F17] rounded-lg border border-[#2C384E]">
                {d}
              </div>
            ))}
          </div>

          {/* Days Grid */}
          <div className="grid grid-cols-7 gap-2">
            {monthDays.map((day, idx) => {
              if (day === null) {
                return <div key={`empty-${idx}`} className="h-28 rounded-xl bg-[#0B0F17]/40 border border-slate-900" />;
              }

              const dayFestivals = getFestivalsForDay(day);

              return (
                <div
                  key={`day-${day}`}
                  onClick={() => handleDateClick(day)}
                  className={`h-28 p-2.5 rounded-xl border transition-all cursor-pointer flex flex-col justify-between group ${
                    dayFestivals.length > 0
                      ? 'bg-amber-500/10 border-amber-500/40 hover:border-amber-500'
                      : 'bg-[#0B0F17] border-[#2C384E] hover:border-slate-600 hover:bg-[#151D2C]'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-heading font-bold text-sm text-white group-hover:text-amber-400">{day}</span>
                    {dayFestivals.length > 0 && (
                      <span className="w-2 h-2 rounded-full bg-amber-400 shadow-glow-amber" />
                    )}
                  </div>

                  {/* Festival Badges */}
                  <div className="space-y-1 overflow-y-auto max-h-16">
                    {dayFestivals.map((fest) => (
                      <div
                        key={fest.id}
                        onClick={(e) => e.stopPropagation()}
                        className="flex items-center justify-between p-1 px-1.5 rounded-md bg-amber-500/20 border border-amber-500/30 text-amber-300 text-[10px] font-bold group/fest"
                      >
                        <span className="truncate">{fest.name}</span>
                        <button
                          onClick={() => deleteFestivalMutation.mutate(fest.id)}
                          className="opacity-0 group-hover/fest:opacity-100 text-rose-400 hover:text-rose-300 transition ml-1"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 2. FULL YEAR 12-MONTH GRID VIEW */}
      {viewMode === 'year' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {MONTH_NAMES.map((monthName, mIdx) => {
            const days = getDaysInMonth(selectedYear, mIdx);
            return (
              <div key={monthName} className="p-4 rounded-2xl bg-[#0B0F17] border border-[#2C384E] space-y-3">
                <div className="flex items-center justify-between border-b border-[#2C384E] pb-2">
                  <h4 className="font-heading font-bold text-sm text-white">{monthName}</h4>
                  <button
                    onClick={() => {
                      setSelectedMonth(mIdx);
                      setViewMode('month');
                    }}
                    className="text-[10px] text-amber-400 hover:underline font-semibold"
                  >
                    Open Month
                  </button>
                </div>

                <div className="grid grid-cols-7 gap-1 text-center text-[10px] font-bold text-slate-500">
                  {WEEKDAY_NAMES.map((w) => (
                    <span key={w}>{w[0]}</span>
                  ))}
                </div>

                <div className="grid grid-cols-7 gap-1 text-center text-xs">
                  {days.map((day, dIdx) => {
                    if (day === null) return <div key={`year-empty-${dIdx}`} />;
                    const dateStr = `${selectedYear}-${String(mIdx + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
                    const hasFest = festivals.some(
                      (f) => new Date(f.date).toISOString().split('T')[0] === dateStr
                    );

                    return (
                      <div
                        key={`year-day-${mIdx}-${day}`}
                        onClick={() => {
                          setSelectedMonth(mIdx);
                          handleDateClick(day);
                        }}
                        className={`py-1 rounded-md cursor-pointer font-medium text-[11px] transition ${
                          hasFest
                            ? 'bg-amber-500 text-slate-950 font-extrabold shadow-sm'
                            : 'hover:bg-slate-800 text-slate-300'
                        }`}
                      >
                        {day}
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* 3. LIST VIEW */}
      {viewMode === 'list' && (
        <div className="space-y-4">
          <h3 className="font-heading font-bold text-lg text-white">All Scheduled Festivals in {selectedYear}</h3>

          {isLoading ? (
            <div className="p-8 text-center text-slate-400 text-sm">Loading festivals...</div>
          ) : festivals.length === 0 ? (
            <div className="p-8 text-center border border-dashed border-[#2C384E] rounded-xl text-slate-400 text-sm">
              No festivals scheduled for {selectedYear}. Click "Add Festival / Day" above to create one.
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {festivals.map((fest) => {
                const dateFormatted = new Date(fest.date).toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric',
                });
                return (
                  <div
                    key={fest.id}
                    className="p-4 rounded-xl bg-[#0B0F17] border border-[#2C384E] space-y-3 hover:border-amber-500/40 transition"
                  >
                    <div className="flex items-start justify-between">
                      <div className="space-y-1">
                        <span className="px-2.5 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 text-[10px] font-bold">
                          {dateFormatted}
                        </span>
                        <h4 className="font-heading font-bold text-base text-white">{fest.name}</h4>
                      </div>

                      <button
                        onClick={() => deleteFestivalMutation.mutate(fest.id)}
                        className="p-1.5 text-slate-400 hover:text-rose-400 rounded-lg hover:bg-rose-500/10 transition"
                        title="Delete Festival"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    {fest.description && <p className="text-xs text-slate-400">{fest.description}</p>}

                    <div className="flex items-center justify-between text-[10px] text-slate-400 border-t border-[#2C384E] pt-2">
                      <span className="flex items-center gap-1">
                        <Globe className="w-3 h-3 text-teal-400" /> {fest.targetRegion}
                      </span>
                      <span className="text-emerald-400 font-semibold flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" /> Active Preset
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Add Festival / Special Day Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-md bg-[#131B2A] border border-[#2C384E] rounded-2xl p-6 space-y-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-[#2C384E] pb-4">
              <h3 className="font-heading font-bold text-lg text-white flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-amber-400" />
                <span>Add Festival or Special Day</span>
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            {errorMsg && <Alert variant="error" message={errorMsg} />}

            <form onSubmit={handleCreateSubmit} className="space-y-4">
              <Input
                label="Festival / Day Title"
                placeholder="e.g. Diwali - Festival of Lights"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />

              <Input
                label="Date"
                type="date"
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                required
              />

              <Input
                label="Target Region"
                placeholder="India, Global, USA, etc."
                value={formData.targetRegion}
                onChange={(e) => setFormData({ ...formData, targetRegion: e.target.value })}
              />

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-300">Description / Theme Notes</label>
                <textarea
                  placeholder="Special festive sale copy & promotion recommendations..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl bg-[#0B0F17] border border-[#2C384E] text-white text-sm focus:outline-none focus:border-amber-500 h-20"
                />
              </div>

              <div className="pt-4 flex items-center gap-3">
                <Button type="button" variant="outline" className="w-full" onClick={() => setIsModalOpen(false)}>
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  className="w-full"
                  isLoading={createFestivalMutation.isPending}
                  isDisabled={!formData.name.trim() || !formData.date}
                >
                  Save Event
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </Card>
  );
};
