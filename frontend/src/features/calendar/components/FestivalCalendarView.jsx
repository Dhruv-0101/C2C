import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { createPortal } from 'react-dom';
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Image as ImageIcon,
  Flame,
  X,
  Plus,
  Trash2,
  Search,
} from 'lucide-react';
import { festivalApi } from '../../../services/festival.api';
import { useAuth } from '../../../hooks/useAuth';
import { useTemplates } from '../../../hooks/useTemplates.js';
import Pagination from '../../../components/common/Pagination';
import { Card } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';
import { Input } from '../../../components/ui/Input';
import { Alert } from '../../../components/ui/Alert';
import { PostStudioModal } from './PostStudioModal';

export const FestivalCalendarView = ({ onSelectTemplate }) => {
  const navigate = useNavigate();
  const { isAdmin } = useAuth();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [festivals, setFestivals] = useState([]);
  const [selectedDayFestivals, setSelectedDayFestivals] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // Selected Festival Day Template Search & Central Pagination State
  const [festivalTemplatePage, setFestivalTemplatePage] = useState(1);
  const [festivalTemplateLimit, setFestivalTemplateLimit] = useState(6);
  const [festivalTemplateSearch, setFestivalTemplateSearch] = useState('');

  const activeFestivalId = selectedDayFestivals?.festivals?.[0]?.id;

  const {
    templates: paginatedFestivalTemplates,
    meta: festivalTemplatesMeta,
    isLoading: isLoadingFestivalTemplates,
  } = useTemplates(
    {
      page: festivalTemplatePage,
      limit: festivalTemplateLimit,
      search: festivalTemplateSearch,
      festivalId: activeFestivalId,
    },
    { enabled: !!activeFestivalId && !!selectedDayFestivals }
  );

  // Post Studio Modal State
  const [studioTemplate, setStudioTemplate] = useState(null);
  const [isStudioOpen, setIsStudioOpen] = useState(false);

  // Add Festival Modal State
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newFestName, setNewFestName] = useState('');
  const [newFestDate, setNewFestDate] = useState('');
  const [newFestDescription, setNewFestDescription] = useState('');
  const [newFestRegion, setNewFestRegion] = useState('India');
  const [isSubmittingFest, setIsSubmittingFest] = useState(false);
  const [addFestError, setAddFestError] = useState('');

  useEffect(() => {
    fetchFestivals();
  }, []);

  const fetchFestivals = async () => {
    setIsLoading(true);
    try {
      const response = await festivalApi.getFestivals();
      if (response.data?.festivals) {
        setFestivals(response.data.festivals);
      }
    } catch (error) {
      console.error('Failed to load festival calendar:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddFestivalSubmit = async (e) => {
    e.preventDefault();
    if (!newFestName.trim() || !newFestDate) {
      setAddFestError('Please enter a festival name and select a date.');
      return;
    }

    setIsSubmittingFest(true);
    setAddFestError('');

    try {
      await festivalApi.createFestival({
        name: newFestName.trim(),
        date: newFestDate,
        description: newFestDescription.trim() || undefined,
        targetRegion: newFestRegion || 'India',
      });

      setIsAddModalOpen(false);
      setNewFestName('');
      setNewFestDate('');
      setNewFestDescription('');
      fetchFestivals();
    } catch (err) {
      setAddFestError(err?.response?.data?.message || err?.message || 'Failed to add festival.');
    } finally {
      setIsSubmittingFest(false);
    }
  };

  const handleDeleteFestival = async (id) => {
    if (!window.confirm('Are you sure you want to delete this festival day?')) return;
    try {
      await festivalApi.deleteFestival(id);
      fetchFestivals();
      setSelectedDayFestivals(null);
    } catch (err) {
      console.error('Failed to delete festival:', err);
    }
  };

  // Month navigation helpers
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDayOfWeek = new Date(year, month, 1).getDay();

  const monthName = currentDate.toLocaleString('default', { month: 'long' });

  const prevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  const goToToday = () => {
    setCurrentDate(new Date());
  };

  // Map festivals by YYYY-MM-DD string
  const festivalMap = {};
  festivals.forEach((fest) => {
    const festDate = new Date(fest.date);
    const dateKey = `${festDate.getFullYear()}-${String(festDate.getMonth() + 1).padStart(2, '0')}-${String(festDate.getDate()).padStart(2, '0')}`;
    if (!festivalMap[dateKey]) {
      festivalMap[dateKey] = [];
    }
    festivalMap[dateKey].push(fest);
  });

  // Generate calendar day cells
  const calendarCells = [];
  // Empty leading padding cells
  for (let i = 0; i < firstDayOfWeek; i++) {
    calendarCells.push({ key: `empty-${i}`, isPadding: true });
  }

  // Days of the month
  const today = new Date();
  for (let dayNum = 1; dayNum <= daysInMonth; dayNum++) {
    const dateKey = `${year}-${String(month + 1).padStart(2, '0')}-${String(dayNum).padStart(2, '0')}`;
    const dayFestivals = festivalMap[dateKey] || [];
    const isToday =
      today.getDate() === dayNum &&
      today.getMonth() === month &&
      today.getFullYear() === year;

    calendarCells.push({
      key: `day-${dayNum}`,
      dayNum,
      dateKey,
      festivals: dayFestivals,
      isToday,
      isPadding: false,
    });
  }

  const handleCellClick = (cell) => {
    if (cell.isPadding) return;
    if (cell.festivals && cell.festivals.length > 0) {
      setSelectedDayFestivals({
        dayNum: cell.dayNum,
        dateKey: cell.dateKey,
        festivals: cell.festivals,
      });
    } else if (isAdmin) {
      // Admin only: Pre-fill date for adding new festival on this specific day
      setNewFestDate(cell.dateKey);
      setIsAddModalOpen(true);
    }
  };

  return (
    <div className="space-y-6">
      {/* Calendar Header & Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-[#131B2A] border border-[#2C384E] p-6 rounded-2xl">
        <div className="space-y-1">
          <h2 className="font-heading text-xl font-bold text-white flex items-center gap-2">
            <CalendarIcon className="w-5 h-5 text-amber-400" />
            <span>Festival & Special Days Interactive Calendar</span>
          </h2>
          <p className="text-xs text-slate-400">
            {isAdmin
              ? 'Click on any date to add a festival or view admin base templates to generate branded social posts.'
              : 'Browse upcoming festivals and select base templates to generate branded social posts.'}
          </p>
        </div>

        {/* Action & Navigation Controls */}
        <div className="flex items-center gap-3">
          {isAdmin && (
            <Button
              variant="primary"
              size="sm"
              icon={Plus}
              onClick={() => {
                setNewFestDate('');
                setIsAddModalOpen(true);
              }}
            >
              Add Festival / Day
            </Button>
          )}
          <Button variant="outline" size="sm" onClick={goToToday} className="text-xs">
            Today
          </Button>
          <div className="flex items-center gap-1 bg-[#0B0F17] border border-[#2C384E] rounded-xl p-1">
            <button
              onClick={prevMonth}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
              title="Previous Month"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="px-3 text-xs font-bold text-white min-w-[120px] text-center font-heading">
              {monthName} {year}
            </span>
            <button
              onClick={nextMonth}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
              title="Next Month"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Main Month Grid */}
      <Card className="border-[#2C384E] bg-[#131B2A] p-4 sm:p-6 overflow-hidden">
        {/* Days of Week Header */}
        <div className="grid grid-cols-7 gap-2 text-center text-xs font-bold uppercase tracking-wider text-slate-400 border-b border-[#2C384E] pb-3 mb-3">
          <div className="text-rose-400">Sun</div>
          <div>Mon</div>
          <div>Tue</div>
          <div>Wed</div>
          <div>Thu</div>
          <div>Fri</div>
          <div className="text-amber-400">Sat</div>
        </div>

        {isLoading ? (
          <div className="p-16 text-center text-slate-400">
            <div className="inline-block animate-spin w-8 h-8 border-4 border-amber-500 border-t-transparent rounded-full mb-3" />
            <p className="text-sm">Loading interactive calendar grid...</p>
          </div>
        ) : (
          <div className="grid grid-cols-7 gap-2 auto-rows-fr">
            {calendarCells.map((cell) => {
              if (cell.isPadding) {
                return (
                  <div
                    key={cell.key}
                    className="min-h-[100px] sm:min-h-[120px] p-2 rounded-xl bg-slate-950/20 border border-slate-900/40 opacity-30"
                  />
                );
              }

              const hasFestivals = cell.festivals && cell.festivals.length > 0;
              const isSelected = selectedDayFestivals?.dateKey === cell.dateKey;

              return (
                <div
                  key={cell.key}
                  onClick={() => handleCellClick(cell)}
                  className={`min-h-[100px] sm:min-h-[120px] p-2.5 rounded-xl border transition-all flex flex-col justify-between group cursor-pointer hover:scale-[1.02] hover:shadow-xl ${
                    hasFestivals
                      ? 'bg-[#0B0F17] border-amber-500/40 hover:border-amber-400'
                      : 'bg-[#0B0F17]/60 border-[#2C384E]/60 text-slate-400 hover:border-slate-600 hover:bg-[#131B2A]'
                  } ${
                    isSelected
                      ? 'bg-amber-500/15 border-amber-500 ring-2 ring-amber-500/40'
                      : ''
                  }`}
                >
                  {/* Top Bar: Date Number + Badges */}
                  <div className="flex items-center justify-between">
                    <span
                      className={`text-xs sm:text-sm font-extrabold w-6 h-6 rounded-full flex items-center justify-center ${
                        cell.isToday
                          ? 'bg-amber-500 text-black shadow-md'
                          : 'text-white'
                      }`}
                    >
                      {cell.dayNum}
                    </span>

                    {hasFestivals ? (
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-amber-500/10 text-amber-400 border border-amber-500/30">
                        <Flame className="w-3 h-3 text-amber-400" />
                        Event
                      </span>
                    ) : (
                      isAdmin && (
                        <span className="opacity-0 group-hover:opacity-100 transition-opacity text-[10px] text-amber-400 font-bold flex items-center gap-0.5">
                          <Plus className="w-3 h-3" /> Add
                        </span>
                      )
                    )}
                  </div>

                  {/* Middle / Bottom: Festival Pill Tags */}
                  <div className="mt-2 space-y-1">
                    {cell.festivals.map((fest) => {
                      const tplCount = fest.templates?.length || 0;
                      return (
                        <div
                          key={fest.id}
                          className="p-1.5 rounded-lg bg-amber-500/15 border border-amber-500/40 text-white text-[11px] font-semibold truncate hover:border-amber-300 transition"
                        >
                          <div className="flex items-center justify-between gap-1">
                            <span className="truncate text-amber-200">{fest.name}</span>
                            <span className="shrink-0 text-[9px] px-1.5 py-0.5 rounded bg-amber-500 text-black font-extrabold">
                              {tplCount} {tplCount === 1 ? 'Template' : 'Templates'}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </Card>

      {/* Add Festival / Special Day Modal */}
      {isAddModalOpen &&
        createPortal(
          <div className="fixed inset-0 w-screen h-screen z-[9999] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn overflow-y-auto">
            <div className="relative w-full max-w-lg bg-[#131B2A] border border-[#2C384E] rounded-2xl shadow-2xl overflow-hidden text-slate-100">
              <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-[#0B0F17]/50">
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-400">
                    <Plus className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-heading font-bold text-lg text-white">Add Festival / Special Day</h3>
                    <p className="text-xs text-slate-400">Mark a new event on the interactive calendar</p>
                  </div>
                </div>
                <button
                  onClick={() => setIsAddModalOpen(false)}
                  className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleAddFestivalSubmit} className="p-6 space-y-4">
                {addFestError && <Alert variant="error" message={addFestError} />}

                <Input
                  label="Festival / Day Name"
                  placeholder="e.g. Diwali, Holi, Republic Day"
                  value={newFestName}
                  onChange={(e) => setNewFestName(e.target.value)}
                  required
                />

                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                    Date
                  </label>
                  <input
                    type="date"
                    value={newFestDate}
                    onChange={(e) => setNewFestDate(e.target.value)}
                    className="w-full px-4 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/50 font-mono"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                    Description (Optional)
                  </label>
                  <textarea
                    rows={2}
                    placeholder="Festival background or celebration details..."
                    value={newFestDescription}
                    onChange={(e) => setNewFestDescription(e.target.value)}
                    className="w-full px-4 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/50"
                  />
                </div>

                <div className="flex items-center justify-end gap-3 pt-2 border-t border-slate-800">
                  <Button variant="outline" type="button" onClick={() => setIsAddModalOpen(false)}>
                    Cancel
                  </Button>
                  <Button variant="primary" type="submit" isLoading={isSubmittingFest} icon={Plus}>
                    Save Festival
                  </Button>
                </div>
              </form>
            </div>
          </div>,
          document.body
        )}

      {/* Selected Festival Day Drawer / Modal */}
      {selectedDayFestivals &&
        createPortal(
          <div className="fixed inset-0 w-screen h-screen z-[9999] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn overflow-y-auto">
            <div className="relative w-full max-w-3xl bg-[#131B2A] border border-[#2C384E] rounded-2xl shadow-2xl overflow-hidden text-slate-100 max-h-[85vh] flex flex-col">
              {/* Modal Header */}
              <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between px-6 py-4 border-b border-slate-800 bg-[#0B0F17]/50 gap-4">
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-400">
                    <Flame className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-heading font-bold text-lg text-white">
                      {selectedDayFestivals.festivals.map((f) => f.name).join(', ')}
                    </h3>
                    <p className="text-xs text-slate-400">
                      {selectedDayFestivals.dateKey} • Admin Base Templates Showcase
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  {/* Template Search Bar */}
                  <div className="relative flex-1 min-w-[200px]">
                    <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      placeholder="Search templates..."
                      value={festivalTemplateSearch}
                      onChange={(e) => {
                        setFestivalTemplateSearch(e.target.value);
                        setFestivalTemplatePage(1);
                      }}
                      className="w-full pl-10 pr-4 py-2 rounded-xl bg-[#0B0F17] border border-[#2C384E] text-white text-xs focus:outline-none focus:border-amber-500 placeholder:text-slate-500"
                    />
                  </div>

                  <button
                    onClick={() => {
                      setSelectedDayFestivals(null);
                      setFestivalTemplateSearch('');
                      setFestivalTemplatePage(1);
                    }}
                    className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition shrink-0"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Modal Body */}
              <div className="p-6 overflow-y-auto space-y-6 flex-1">
                {selectedDayFestivals.festivals.map((fest) => {
                  const displayTemplates = (activeFestivalId === fest.id && paginatedFestivalTemplates)
                    ? paginatedFestivalTemplates
                    : (fest.templates?.filter((t) => t.festivalId === fest.id) || []);

                  return (
                    <div key={fest.id} className="space-y-4">
                      <div className="flex items-start justify-between border-b border-slate-800 pb-3">
                        <div>
                          <h4 className="font-heading font-extrabold text-xl text-white">
                            {fest.name}
                          </h4>
                          <p className="text-xs text-slate-400 mt-1">
                            {fest.description || 'Special celebration day.'}
                          </p>
                        </div>

                        {isAdmin && (
                          <button
                            onClick={() => handleDeleteFestival(fest.id)}
                            className="p-1.5 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 transition"
                            title="Delete Festival"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>

                      {isLoadingFestivalTemplates ? (
                        <div className="p-8 text-center text-slate-400 text-sm">Loading festival templates...</div>
                      ) : displayTemplates.length > 0 ? (
                        <div className="space-y-4">
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {displayTemplates.map((tpl) => (
                              <div
                                key={tpl.id}
                                className="group relative rounded-xl border border-slate-800 bg-[#0B0F17] overflow-hidden hover:border-amber-500/60 transition-all shadow-md"
                              >
                                <img
                                  src={tpl.baseImageUrl}
                                  alt={tpl.title}
                                  className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent p-4 flex flex-col justify-end">
                                  <h5 className="font-semibold text-sm text-white line-clamp-1">
                                    {tpl.title}
                                  </h5>
                                  {tpl.description && (
                                    <p className="text-xs text-slate-300 line-clamp-1 mt-0.5">
                                      {tpl.description}
                                    </p>
                                  )}
                                  <div className="mt-3">
                                    <Button
                                      size="sm"
                                      variant="primary"
                                      className="w-full justify-center text-xs"
                                      onClick={() => {
                                        setSelectedDayFestivals(null);
                                        if (onSelectTemplate) {
                                          onSelectTemplate(tpl);
                                        } else {
                                          navigate(`/create-post?templateId=${tpl.id}`, { state: { template: tpl } });
                                        }
                                      }}
                                    >
                                      <Sparkles className="w-3.5 h-3.5 mr-1.5" />
                                      Generate Branded Post
                                    </Button>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>

                          {/* Central Modular Pagination */}
                          {activeFestivalId === fest.id && festivalTemplatesMeta && (
                            <Pagination
                              meta={festivalTemplatesMeta}
                              onPageChange={(newPage) => setFestivalTemplatePage(newPage)}
                              onLimitChange={(newLimit) => {
                                setFestivalTemplateLimit(newLimit);
                                setFestivalTemplatePage(1);
                              }}
                              pageSizeOptions={[6, 12, 24]}
                            />
                          )}
                        </div>
                      ) : (
                        <div className="p-6 text-center border border-dashed border-slate-800 rounded-xl bg-slate-900/40">
                          <ImageIcon className="w-8 h-8 text-slate-600 mx-auto mb-2" />
                          <p className="text-sm font-semibold text-slate-300">
                            No base graphics uploaded yet for {fest.name}.
                          </p>
                          <p className="text-xs text-slate-500 mt-1">
                            SuperAdmins can upload base graphics from the Admin Console.
                          </p>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>,
          document.body
        )}

      {/* Post Studio Compositor Modal */}
      <PostStudioModal
        isOpen={isStudioOpen}
        onClose={() => setIsStudioOpen(false)}
        template={studioTemplate}
      />
    </div>
  );
};

export default FestivalCalendarView;
