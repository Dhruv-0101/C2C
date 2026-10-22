import { useState, useEffect, useCallback } from 'react';
import { notificationApi } from '../api/notification.api';
import { playNotificationChime, initSoundEngineOnInteraction } from '../utils/soundEngine';

/**
 * Convert a Base64 URL string to a Uint8Array buffer
 * Required by standard Web Push API for applicationServerKey
 * @param {string} base64String
 * @returns {Uint8Array}
 */
const urlBase64ToUint8Array = (base64String) => {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
};

/**
 * Enterprise Web Push Notifications Hook
 * Handles Service Worker registration, VAPID key subscription,
 * permission status, and backend synchronization.
 */
export const usePushNotifications = () => {
  const [isSupported, setIsSupported] = useState(false);
  const [unsupportedReason, setUnsupportedReason] = useState(null);
  const [permission, setPermission] = useState('default');
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [loading, setLoading] = useState(true);
  const [isSubscribing, setIsSubscribing] = useState(false);
  const [isTestingPush, setIsTestingPush] = useState(false);
  const [error, setError] = useState(null);

  // Initialize Web Audio unlock on interaction
  useEffect(() => {
    initSoundEngineOnInteraction();
  }, []);

  // Detect browser capability & security context
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const isSecure = window.isSecureContext || window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
    const isIOS = /iPhone|iPad|iPod/i.test(navigator.userAgent);
    const isStandalone = window.navigator.standalone || window.matchMedia('(display-mode: standalone)').matches;
    const hasSW = 'serviceWorker' in navigator;
    const hasPush = 'PushManager' in window;
    const hasNotification = 'Notification' in window;

    if (!isSecure) {
      setIsSupported(false);
      setUnsupportedReason('INSECURE_HTTP');
      setLoading(false);
      return;
    }

    if (isIOS && !isStandalone) {
      setIsSupported(false);
      setUnsupportedReason('IOS_REQUIRES_SAFARI_PWA');
      setLoading(false);
      return;
    }

    const supported = Boolean(hasSW && hasPush && hasNotification);
    setIsSupported(supported);

    if (supported) {
      setPermission(Notification.permission);
      checkExistingSubscription();
    } else {
      setUnsupportedReason('NO_PUSH_SUPPORT');
      setLoading(false);
    }
  }, []);

  /**
   * Check if the current browser already has an active push subscription
   */
  const checkExistingSubscription = useCallback(async () => {
    try {
      setLoading(true);
      const registration = await navigator.serviceWorker.getRegistration('/service-worker.js');
      if (registration) {
        registration.update().catch(() => {});
        const subscription = await registration.pushManager.getSubscription();
        setIsSubscribed(Boolean(subscription));
      } else {
        setIsSubscribed(false);
      }
    } catch (err) {
      console.error('[WebPush] Error inspecting active subscription:', err);
      setIsSubscribed(false);
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Register service worker and subscribe current device to push notifications
   */
  const subscribeToPush = useCallback(async () => {
    if (!isSupported) {
      throw new Error('Push notifications are not supported in this browser.');
    }

    setIsSubscribing(true);
    setError(null);

    try {
      // 1. Request user permission
      const userPermission = await Notification.requestPermission();
      setPermission(userPermission);

      if (userPermission !== 'granted') {
        throw new Error('Notification permission was denied or dismissed.');
      }

      // 2. Register Service Worker & ensure latest version is active
      const registration = await navigator.serviceWorker.register('/service-worker.js', {
        scope: '/',
      });
      await registration.update().catch(() => {});
      await navigator.serviceWorker.ready;

      // 3. Fetch server VAPID Public Key
      const { publicKey } = await notificationApi.getVapidPublicKey();
      if (!publicKey) {
        throw new Error('VAPID public key unavailable from server.');
      }

      // 4. Create Push Subscription
      const convertedVapidKey = urlBase64ToUint8Array(publicKey);
      const pushSubscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: convertedVapidKey,
      });

      // 5. Serialize subscription keys and register with backend
      const subscriptionJson = pushSubscription.toJSON();
      const isMobile = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);

      await notificationApi.subscribeDevice({
        endpoint: pushSubscription.endpoint,
        keys: subscriptionJson.keys,
        deviceType: isMobile ? 'MOBILE' : 'DESKTOP',
      });

      setIsSubscribed(true);
      playNotificationChime(0.4);
      return true;
    } catch (err) {
      const message = err?.response?.data?.message || err?.message || 'Failed to enable push notifications.';
      setError(message);
      throw new Error(message);
    } finally {
      setIsSubscribing(false);
    }
  }, [isSupported]);

  /**
   * Unsubscribe current device from push notifications
   */
  const unsubscribeFromPush = useCallback(async () => {
    if (!isSupported) return;

    setIsSubscribing(true);
    setError(null);

    try {
      const registration = await navigator.serviceWorker.getRegistration('/service-worker.js');
      if (registration) {
        const subscription = await registration.pushManager.getSubscription();
        if (subscription) {
          await notificationApi.unsubscribeDevice(subscription.endpoint);
          await subscription.unsubscribe();
        }
      }

      setIsSubscribed(false);
      return true;
    } catch (err) {
      const message = err?.response?.data?.message || err?.message || 'Failed to disable push notifications.';
      setError(message);
      throw new Error(message);
    } finally {
      setIsSubscribing(false);
    }
  }, [isSupported]);

  /**
   * Send an immediate test notification to verify delivery
   */
  const sendTestNotification = useCallback(async () => {
    setIsTestingPush(true);
    setError(null);

    // Play immediate harmonic acoustic chime
    playNotificationChime(0.4);

    try {
      const result = await notificationApi.sendTestPush({
        title: '🎆 Festival Alert Test',
        body: 'Festival reminder test delivered successfully! Ready for upcoming events.',
        url: '/studio',
      });
      return result;
    } catch (err) {
      const message = err?.response?.data?.message || err?.message || 'Failed to trigger test push.';
      setError(message);
      throw new Error(message);
    } finally {
      setIsTestingPush(false);
    }
  }, []);

  return {
    isSupported,
    unsupportedReason,
    permission,
    isSubscribed,
    loading,
    isSubscribing,
    isTestingPush,
    error,
    subscribeToPush,
    unsubscribeFromPush,
    sendTestNotification,
    playChimePreview: () => playNotificationChime(0.4),
    refreshStatus: checkExistingSubscription,
  };
};

export default usePushNotifications;
