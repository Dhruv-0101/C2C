/**
 * 🔔 Enterprise Audio Chime Engine for BrandFlow Notifications
 * Uses Web Audio API oscillator synthesis (zero external asset dependency).
 * Plays a warm, crisp two-tone bell chime across Desktop, Tablet, and Mobile.
 */

let audioCtx = null;

/**
 * Lazily initialize and resume the Web Audio Context
 * Respects browser autoplay policy by resuming on user interaction.
 *
 * @returns {AudioContext|null}
 */
const getAudioContext = () => {
  if (typeof window === 'undefined') return null;

  try {
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (!AudioContextClass) return null;

    if (!audioCtx) {
      audioCtx = new AudioContextClass();
    }

    if (audioCtx.state === 'suspended') {
      audioCtx.resume().catch(() => {});
    }

    return audioCtx;
  } catch (err) {
    console.warn('[SoundEngine] Web Audio API not supported or blocked:', err);
    return null;
  }
};

/**
 * Play a high-end, pleasant harmonic notification chime
 *
 * Tone 1: E5 (659.25 Hz)
 * Tone 2: B5 (987.77 Hz) -> Harmonic fifth with gentle exponential decay
 *
 * @param {number} [volume=0.35] - Audio gain (0.0 to 1.0)
 */
export const playNotificationChime = (volume = 0.35) => {
  try {
    const ctx = getAudioContext();
    if (!ctx) return;

    const now = ctx.currentTime;

    // Master gain
    const masterGain = ctx.createGain();
    masterGain.gain.setValueAtTime(0, now);
    masterGain.gain.linearRampToValueAtTime(volume, now + 0.02);
    masterGain.connect(ctx.destination);

    // Primary Tone: E5 (659.25 Hz)
    const osc1 = ctx.createOscillator();
    const gain1 = ctx.createGain();
    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(659.25, now);
    gain1.gain.setValueAtTime(0.7, now);
    gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.35);
    osc1.connect(gain1);
    gain1.connect(masterGain);

    // Harmonic Tone: B5 (987.77 Hz) - Starts slightly after for a bell-ring effect
    const osc2 = ctx.createOscillator();
    const gain2 = ctx.createGain();
    osc2.type = 'sine';
    osc2.frequency.setValueAtTime(987.77, now + 0.08);
    gain2.gain.setValueAtTime(0, now);
    gain2.gain.setValueAtTime(0.8, now + 0.08);
    gain2.gain.exponentialRampToValueAtTime(0.0001, now + 0.65);
    osc2.connect(gain2);
    gain2.connect(masterGain);

    // Warm Overtone: E6 (1318.5 Hz) - Subtle shimmer
    const osc3 = ctx.createOscillator();
    const gain3 = ctx.createGain();
    osc3.type = 'triangle';
    osc3.frequency.setValueAtTime(1318.5, now + 0.08);
    gain3.gain.setValueAtTime(0, now);
    gain3.gain.setValueAtTime(0.2, now + 0.08);
    gain3.gain.exponentialRampToValueAtTime(0.0001, now + 0.45);
    osc3.connect(gain3);
    gain3.connect(masterGain);

    // Start oscillators
    osc1.start(now);
    osc1.stop(now + 0.4);

    osc2.start(now + 0.08);
    osc2.stop(now + 0.7);

    osc3.start(now + 0.08);
    osc3.stop(now + 0.5);
  } catch (err) {
    console.warn('[SoundEngine] Play chime failed:', err);
  }
};

/**
 * Initialize audio context on first user click/touch to unlock audio
 */
export const initSoundEngineOnInteraction = () => {
  if (typeof window === 'undefined') return;

  const unlock = () => {
    getAudioContext();
    window.removeEventListener('click', unlock);
    window.removeEventListener('keydown', unlock);
    window.removeEventListener('touchstart', unlock);
  };

  window.addEventListener('click', unlock, { once: true, passive: true });
  window.addEventListener('keydown', unlock, { once: true, passive: true });
  window.addEventListener('touchstart', unlock, { once: true, passive: true });
};
