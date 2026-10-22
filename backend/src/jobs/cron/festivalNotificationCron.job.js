import cron from 'node-cron';
import { logger } from '../../config/logger.js';
import { dispatchTomorrowFestivalAlerts } from '../../modules/notifications/notification.logic.js';

let cronTask = null;

/**
 * 🎆 DAILY FESTIVAL NOTIFICATION CRON:
 * Runs daily at 9:00 AM (0 9 * * *) in production.
 * Queries festivals occurring tomorrow and streams mobile push alerts to all subscribed business users.
 */
export const initFestivalNotificationCron = () => {
  if (cronTask) return;

  // Run at 09:00 AM everyday
  cronTask = cron.schedule('0 9 * * *', async () => {
    logger.info('⏰ [FestivalCron] 9:00 AM Ticker fired: Checking for tomorrow festivals...');
    try {
      const summary = await dispatchTomorrowFestivalAlerts();
      if (summary.dispatched) {
        logger.info(
          `🎆 [FestivalCron] Successfully dispatched advance alerts for ${summary.festivalsCount} festival(s).`
        );
      }
    } catch (err) {
      logger.error(`❌ [FestivalCron] Error during daily festival alert execution: ${err.message}`);
    }
  });

  logger.info('⏰ [FestivalCron] Daily 9:00 AM Festival Advance Notifier registered.');
};

/**
 * Stop the Festival notification cron scheduler
 */
export const stopFestivalNotificationCron = () => {
  if (cronTask) {
    cronTask.stop();
    cronTask = null;
    logger.info('🛑 [FestivalCron] Stopped daily festival notification cron.');
  }
};

/**
 * Manually trigger festival advance alert run (for testing or admin action)
 */
export const triggerFestivalNotificationNow = async () => {
  logger.info('⚡ [FestivalCron] Manual trigger requested for festival advance alerts.');
  return dispatchTomorrowFestivalAlerts();
};
