/**
 * Safely parses any date string, ISO timestamp, or Date object into a local Date at midnight (00:00:00).
 * Prevents UTC timezone shifting when parsing "YYYY-MM-DD" or "YYYY-MM-DDTHH:mm:ss.sssZ".
 * @param {string|Date|number} dateInput
 * @returns {Date|null}
 */
export const parseCalendarDate = (dateInput) => {
  if (!dateInput) return null;
  if (typeof dateInput === 'string') {
    const match = dateInput.match(/^(\d{4})-(\d{2})-(\d{2})/);
    if (match) {
      const year = parseInt(match[1], 10);
      const month = parseInt(match[2], 10) - 1;
      const day = parseInt(match[3], 10);
      return new Date(year, month, day);
    }
  }
  const d = new Date(dateInput);
  if (isNaN(d.getTime())) return null;
  return new Date(d.getFullYear(), d.getMonth(), d.getDate());
};

/**
 * Calculates calendar day difference between target date and reference date (default: today).
 * Positive = future days (1 = tomorrow, 2 = in 2 days)
 * 0 = today
 * Negative = past days (-1 = yesterday)
 * @param {string|Date} targetDateInput
 * @param {Date} [referenceDate=new Date()]
 * @returns {number|null}
 */
export const getCalendarDaysDifference = (targetDateInput, referenceDate = new Date()) => {
  const target = parseCalendarDate(targetDateInput);
  const ref = parseCalendarDate(referenceDate);
  if (!target || !ref) return null;
  const diffTime = target.getTime() - ref.getTime();
  return Math.round(diffTime / (1000 * 60 * 60 * 24));
};

/**
 * Date and Time Formatter Utility
 */
export const formatDate = (date, options = { month: 'short', day: 'numeric', year: 'numeric' }) => {
  if (!date) return '';
  const d = parseCalendarDate(date);
  return !d || isNaN(d.getTime()) ? '' : d.toLocaleDateString(undefined, options);
};

export const formatDateTime = (date) => {
  if (!date) return '';
  const d = new Date(date);
  return isNaN(d.getTime())
    ? ''
    : d.toLocaleString(undefined, {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
};

export const timeAgo = (date) => {
  if (!date) return '';
  const now = new Date();
  const past = new Date(date);
  const diffInSec = Math.floor((now.getTime() - past.getTime()) / 1000);

  if (diffInSec < 60) return 'just now';
  if (diffInSec < 3600) return `${Math.floor(diffInSec / 60)}m ago`;
  if (diffInSec < 86400) return `${Math.floor(diffInSec / 3600)}h ago`;
  if (diffInSec < 604800) return `${Math.floor(diffInSec / 86400)}d ago`;
  return formatDate(past);
};

export const calculateDaysDifference = (startDate, endDate) => {
  if (!startDate || !endDate) return null;
  const start = new Date(startDate);
  const end = new Date(endDate);
  const diffTime = Math.abs(end.getTime() - start.getTime());
  return Math.max(1, Math.round(diffTime / (1000 * 60 * 60 * 24)) + 1);
};
