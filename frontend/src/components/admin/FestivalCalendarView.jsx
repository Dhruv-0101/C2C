import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Plus,
  Trash2,
  Sparkles,
  MapPin,
  Clock,
  X,
  FileCode2,
  Search,
} from 'lucide-react';
import { festivalApi } from '../../services/festival.api';
import { useTemplates } from '../../hooks/useTemplates.js';
import Pagination from '../common/Pagination';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Alert } from '../ui/Alert';
import { FeedbackModal } from '../common/FeedbackModal';
import { useFeedbackModal } from '../../hooks/useFeedbackModal';

export const FestivalCalendarView = () => {
  const queryClient = useQueryClient();
  const { modalProps, showSuccess, showError } = useFeedbackModal();
  const [currentDate, setCurrentDate] = useState(new Date(2026, 7, 1)); // Default August 2026
  const [selectedDay, setSelectedDay] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Festival Templates Modal State with Central Pagination & Search
  const [selectedFestivalForTemplates, setSelectedFestivalForTemplates] = useState(null);
  const [isTemplateModalOpen, setIsTemplateModalOpen] = useState(false);
  const [modalTemplatePage, setModalTemplatePage] = useState(1);
  const [modalTemplateLimit, setModalTemplateLimit] = useState(6);
  const [modalTemplateSearch, setModalTemplateSearch] = useState('');

  // Fetch templates for the selected festival using central modular hook
  const {
    templates: festivalTemplates,
    meta: festivalTemplatesMeta,
    isLoading: isLoadingFestivalTemplates,
  } = useTemplates(
    {
      page: modalTemplatePage,
      limit: modalTemplateLimit,
      search: modalTemplateSearch,
      festivalId: selectedFestivalForTemplates?.id,
    },
    { enabled: !!selectedFestivalForTemplates && isTemplateModalOpen }
  );

  const openFestivalTemplates = (fest) => {
    setSelectedFestivalForTemplates(fest);
    setModalTemplatePage(1);
    setModalTemplateSearch('');
    setIsTemplateModalOpen(true);
  };

  const [formData, setFormData] = useState({
    name: '',
    date: '',
    description: '',
    targetRegion: 'India',
    bannerUrl: '',
  });

  const selectedYear = currentDate.getFullYear();
  const selectedMonth = currentDate.getMonth();

  // Fetch Festivals for current month & year
  const { data: festivalResponse, isLoading: isLoadingFestivals } = useQuery({
    queryKey: ['festivals', selectedYear, selectedMonth + 1],
    queryFn: () => festivalApi.getFestivals({ year: selectedYear, month: selectedMonth + 1 }),
    staleTime: 5 * 60 * 1000,
  });

  const festivals = festivalResponse?.data?.festivals || [];

  // Create Festival Mutation
  const createFestivalMutation = useMutation({
    mutationFn: (data) => festivalApi.createFestival(data),
    onSuccess: (res, variables) => {
      queryClient.invalidateQueries(['festivals']);
      setIsModalOpen(false);
      resetForm();
      showSuccess(
        'Festival Added! 🗓️',
        `Festival event "${variables.name}" added to master calendar successfully.`
      );
    },
    onError: (err) => {
      setErrorMsg(err.message || 'Failed to create festival.');
      showError('Festival Error ⚠️', err.message || 'Failed to add festival event.');
    },
  });

  // Delete Festival Mutation
  const deleteFestivalMutation = useMutation({
    mutationFn: (id) => festivalApi.deleteFestival(id),
    onSuccess: () => {
      queryClient.invalidateQueries(['festivals']);
      showSuccess('Festival Removed 🗑️', 'Festival date removed from calendar.');
    },
    onError: (err) => {
      showError('Delete Failed ⚠️', err.message || 'Failed to remove festival.');
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

  const handlePrevMonth = () => {
    setCurrentDate(new Date(selectedYear, selectedMonth - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(selectedYear, selectedMonth + 1, 1));
  };

  const handleToday = () => {
    setCurrentDate(new Date());
  };

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const daysInMonth = new Date(selectedYear, selectedMonth + 1, 0).getDate();
  const firstDayOfWeek = new Date(selectedYear, selectedMonth, 1).getDay();

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.date) {
      setErrorMsg('Please enter a festival name and select a date.');
      return;
    }
    createFestivalMutation.mutate(formData);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Top Controls Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-[#131B2A] border border-[#2C384E] p-4 rounded-2xl">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400">
            <CalendarIcon className="w-5 h-5" />
          </div>
          <div>
            <h2 className="font-heading font-extrabold text-lg text-white">
              Festival & Special Days Interactive Calendar
            </h2>
            <p className="text-xs text-slate-400">
              Click on any date to add a festival or view admin base templates to generate branded social posts.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <Button variant="primary" icon={Plus} size="sm" onClick={() => setIsModalOpen(true)}>
            Add Festival / Day
          </Button>

          <div className="flex items-center gap-1 bg-[#0B0F17] p-1 rounded-xl border border-[#2C384E]">
            <button
              onClick={handleToday}
              className="px-3 py-1 text-xs font-semibold text-slate-300 hover:text-white rounded-lg hover:bg-slate-800 transition"
            >
              Today
            </button>
            <button
              onClick={handlePrevMonth}
              className="p-1 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition"
              title="Previous Month"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="text-xs font-bold text-white px-2">
              {monthNames[selectedMonth]} {selectedYear}
            </span>
            <button
              onClick={handleNextMonth}
              className="p-1 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition"
              title="Next Month"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Calendar Grid Container */}
      <Card className="border-[#2C384E] bg-[#131B2A] p-4 sm:p-6">
        {isLoadingFestivals ? (
          <div className="p-12 text-center text-slate-400 text-sm">Loading festival calendar...</div>
        ) : (
          <div className="space-y-4">
            {/* Days of Week Header */}
            <div className="grid grid-cols-7 gap-2 text-center text-xs font-bold text-slate-400 uppercase tracking-wider py-2">
              <span className="text-rose-400">Sun</span>
              <span>Mon</span>
              <span>Tue</span>
              <span>Wed</span>
              <span>Thu</span>
              <span>Fri</span>
              <span className="text-amber-400">Sat</span>
            </div>

            {/* Calendar Days Cells Grid */}
            <div className="grid grid-cols-7 gap-2">
              {/* Empty leading offset cells */}
              {Array.from({ length: firstDayOfWeek }).map((_, index) => (
                <div
                  key={`empty-${index}`}
                  className="h-28 sm:h-32 rounded-xl bg-[#0B0F17]/40 border border-[#2C384E]/30 pointer-events-none"
                />
              ))}

              {/* Day Cells */}
              {Array.from({ length: daysInMonth }).map((_, dayIndex) => {
                const dayNumber = dayIndex + 1;
                const formattedDay = `${selectedYear}-${String(selectedMonth + 1).padStart(2, '0')}-${String(dayNumber).padStart(2, '0')}`;

                // Find matching festivals on this day
                const dayFestivals = festivals.filter((f) => {
                  const fDate = f.date ? f.date.split('T')[0] : '';
                  return fDate === formattedDay;
                });

                return (
                  <div
                    key={`day-${dayNumber}`}
                    onClick={() => {
                      if (dayFestivals.length > 0) {
                        openFestivalTemplates(dayFestivals[0]);
                      } else {
                        handleDateClick(dayNumber);
                      }
                    }}
                    className="h-28 sm:h-32 rounded-xl bg-[#0B0F17] border border-[#2C384E] p-2 flex flex-col justify-between hover:border-amber-500/60 transition cursor-pointer group relative overflow-hidden"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-extrabold text-slate-200 group-hover:text-amber-400 transition">
                        {dayNumber}
                      </span>
                      {dayFestivals.length > 0 && (
                        <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
                      )}
                    </div>

                    {/* Render Festival Badges */}
                    <div className="space-y-1 overflow-y-auto max-h-20 scrollbar-thin">
                      {dayFestivals.map((fest) => (
                        <div
                          key={fest.id}
                          onClick={(e) => {
                            e.stopPropagation();
                            openFestivalTemplates(fest);
                          }}
                          className="p-1.5 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-300 hover:bg-amber-500/20 text-[11px] font-semibold flex items-center justify-between gap-1 group/item transition cursor-pointer"
                        >
                          <span className="truncate flex-1">{fest.name}</span>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              deleteFestivalMutation.mutate(fest.id);
                            }}
                            className="text-slate-400 hover:text-rose-400 transition shrink-0"
                            title="Delete Festival"
                          >
                            <Trash2 className="w-3 h-3" />
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
      </Card>

      {/* Add Festival Modal */}
      {isModalOpen &&
        createPortal(
          <div className="fixed inset-0 w-screen h-screen z-[9999] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in overflow-y-auto">
            <div className="w-full max-w-md bg-[#131B2A] border border-[#2C384E] rounded-2xl p-6 space-y-6 shadow-2xl">
              <div className="flex items-center justify-between border-b border-[#2C384E] pb-4">
                <h3 className="font-heading font-bold text-lg text-white flex items-center gap-2">
                  <Plus className="w-5 h-5 text-amber-400" />
                  <span>Add New Festival / Day</span>
                </h3>
                <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-white">
                  <X className="w-5 h-5" />
                </button>
              </div>

              {errorMsg && <Alert variant="error" message={errorMsg} />}

              <form onSubmit={handleSubmit} className="space-y-4">
                <Input
                  label="Festival / Event Name"
                  placeholder="e.g. Diwali Festival"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />

                <Input
                  label="Event Date"
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                />

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-300">Target Region</label>
                  <input
                    type="text"
                    placeholder="e.g. India / Global"
                    value={formData.targetRegion}
                    onChange={(e) => setFormData({ ...formData, targetRegion: e.target.value })}
                    className="w-full px-4 py-2 rounded-xl bg-[#0B0F17] border border-[#2C384E] text-white text-sm focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-300">Event Description</label>
                  <textarea
                    rows={3}
                    placeholder="Short marketing significance..."
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full px-4 py-2 rounded-xl bg-[#0B0F17] border border-[#2C384E] text-white text-sm focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div className="pt-2 flex items-center gap-3">
                  <Button type="button" variant="outline" className="w-full" onClick={() => setIsModalOpen(false)}>
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    variant="primary"
                    className="w-full"
                    isLoading={createFestivalMutation.isPending}
                  >
                    Save Festival
                  </Button>
                </div>
              </form>
            </div>
          </div>,
          document.body
        )}

      {/* Paginated Festival Templates Modal */}
      {isTemplateModalOpen && selectedFestivalForTemplates &&
        createPortal(
          <div className="fixed inset-0 w-screen h-screen z-[9999] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in overflow-y-auto">
            <div className="w-full max-w-4xl bg-[#131B2A] border border-[#2C384E] rounded-2xl p-6 space-y-5 shadow-2xl">
              {/* Modal Header */}
              <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 border-b border-[#2C384E] pb-4">
                <div>
                  <h3 className="font-heading font-bold text-lg text-white flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-amber-400" />
                    <span>{selectedFestivalForTemplates.name} - Base Graphic Templates</span>
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Browse, search & filter templates for {new Date(selectedFestivalForTemplates.date).toLocaleDateString()}
                  </p>
                </div>

                {/* Search Bar & Close Button */}
                <div className="flex items-center gap-3">
                  <div className="relative min-w-[220px]">
                    <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      placeholder="Search templates..."
                      value={modalTemplateSearch}
                      onChange={(e) => {
                        setModalTemplateSearch(e.target.value);
                        setModalTemplatePage(1);
                      }}
                      className="w-full pl-10 pr-4 py-2 rounded-xl bg-[#0B0F17] border border-[#2C384E] text-white text-xs focus:outline-none focus:border-amber-500 placeholder:text-slate-500"
                    />
                  </div>

                  <button
                    onClick={() => setIsTemplateModalOpen(false)}
                    className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Templates Grid Content */}
              {isLoadingFestivalTemplates ? (
                <div className="p-12 text-center text-slate-400 text-sm">Loading festival templates...</div>
              ) : festivalTemplates.length === 0 ? (
                <div className="p-12 text-center border border-dashed border-[#2C384E] rounded-xl space-y-3">
                  <FileCode2 className="w-10 h-10 text-slate-600 mx-auto" />
                  <p className="text-slate-300 font-semibold text-sm">No templates assigned to this festival yet.</p>
                  <p className="text-xs text-slate-500 max-w-sm mx-auto">
                    Upload base templates in the Base Template Manager to feature them on special festival days.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                    {festivalTemplates.map((t) => (
                      <Card key={t.id} className="border-[#2C384E] bg-[#0B0F17] p-3 space-y-3 group hover:border-amber-500/50 transition">
                        <div className="aspect-square rounded-lg bg-slate-950 border border-slate-800 p-2 flex items-center justify-center overflow-hidden relative">
                          <img src={t.baseImageUrl} alt={t.title} className="w-full h-full object-contain" />
                        </div>
                        <div className="truncate">
                          <h4 className="text-xs font-bold text-white truncate">{t.title}</h4>
                          {t.description && <p className="text-[10px] text-slate-400 truncate">{t.description}</p>}
                        </div>
                      </Card>
                    ))}
                  </div>

                  {/* Embedded Central Modular Pagination */}
                  <Pagination
                    meta={festivalTemplatesMeta}
                    onPageChange={(newPage) => setModalTemplatePage(newPage)}
                    onLimitChange={(newLimit) => {
                      setModalTemplateLimit(newLimit);
                      setModalTemplatePage(1);
                    }}
                    pageSizeOptions={[6, 12, 24]}
                  />
                </div>
              )}
            </div>
          </div>,
          document.body
        )}

      {/* Reusable Global Feedback Modal */}
      <FeedbackModal {...modalProps} />
    </div>
  );
};

export default FestivalCalendarView;
