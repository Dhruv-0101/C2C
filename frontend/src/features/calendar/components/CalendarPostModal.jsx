import React, { useState } from 'react';
import { Calendar, Clock, Sparkles, Send, X, AlertCircle } from 'lucide-react';
import { Modal } from '../../../components/ui/Modal';
import { Button } from '../../../components/ui/Button';
import { Input } from '../../../components/ui/Input';

/**
 * CalendarPostModal
 * Schedule post dialog for social media planner
 */
export const CalendarPostModal = ({
  isOpen,
  onClose,
  selectedDate,
  festivalName,
  onSchedule,
  isScheduling = false,
}) => {
  const [caption, setCaption] = useState(
    festivalName ? `Wishing everyone a joyous ${festivalName}! ✨🎉` : ''
  );
  const [time, setTime] = useState('09:00');
  const [platforms, setPlatforms] = useState({
    instagram: true,
    facebook: true,
    linkedin: false,
    twitter: false,
  });

  const togglePlatform = (key) => {
    setPlatforms((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const scheduledDateTime = selectedDate
      ? `${selectedDate}T${time}:00`
      : new Date().toISOString();
    if (onSchedule) {
      onSchedule({
        caption,
        scheduledAt: scheduledDateTime,
        platforms: Object.keys(platforms).filter((k) => platforms[k]),
      });
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={festivalName ? `Schedule Post: ${festivalName}` : 'Schedule Post'}
      className="max-w-lg"
    >
      <form onSubmit={handleSubmit} className="space-y-5 p-1">
        {/* Date & Time Header info */}
        <div className="flex items-center gap-3 p-3.5 rounded-xl bg-slate-900/60 border border-slate-800 text-slate-300">
          <Calendar className="w-5 h-5 text-indigo-400 shrink-0" />
          <div className="text-xs">
            <span className="font-semibold text-white block">
              {selectedDate ? new Date(selectedDate).toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }) : 'Today'}
            </span>
            {festivalName && (
              <span className="text-indigo-400 font-medium">{festivalName} Event</span>
            )}
          </div>
        </div>

        {/* Time Selector */}
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
            Schedule Time
          </label>
          <div className="relative">
            <Clock className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <Input
              type="time"
              value={time}
              onChange={(e) => setTime(e.target.value)}
              className="pl-10"
              required
            />
          </div>
        </div>

        {/* Target Platforms */}
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
            Publish Channels
          </label>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
            {Object.entries(platforms).map(([platform, active]) => (
              <button
                type="button"
                key={platform}
                onClick={() => togglePlatform(platform)}
                className={`py-2 px-3 text-xs font-semibold rounded-xl border capitalize transition-all ${
                  active
                    ? 'bg-indigo-600/20 border-indigo-500 text-indigo-300 shadow-sm shadow-indigo-500/20'
                    : 'bg-slate-900 border-slate-800 text-slate-400 hover:border-slate-700'
                }`}
              >
                {platform}
              </button>
            ))}
          </div>
        </div>

        {/* Caption */}
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
            Post Caption
          </label>
          <textarea
            value={caption}
            onChange={(e) => setCaption(e.target.value)}
            rows={4}
            className="w-full bg-[#0d131f] border border-slate-800 rounded-xl p-3 text-sm text-slate-100 placeholder-slate-600 focus:outline-none focus:border-indigo-500 transition"
            placeholder="Write engaging caption or holiday greetings..."
            required
          />
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button
            type="submit"
            variant="primary"
            disabled={isScheduling}
            className="flex items-center gap-2"
          >
            <Clock className="w-4 h-4" />
            {isScheduling ? 'Scheduling...' : 'Schedule Post'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default CalendarPostModal;
