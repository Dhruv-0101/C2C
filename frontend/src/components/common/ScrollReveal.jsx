import React, { useEffect, useRef, useState } from "react";

/**
 * ScrollReveal Component
 * Hardware-accelerated scroll-triggered animation wrapper using IntersectionObserver.
 * 
 * @param {Object} props
 * @param {React.ReactNode} props.children - Content to animate
 * @param {'fade-up'|'fade-down'|'slide-left'|'slide-right'|'zoom-in'|'flip-up'|'glow-pulse'} [props.animation='fade-up'] - Animation preset
 * @param {number} [props.delay=0] - Delay before starting animation in ms
 * @param {number} [props.duration=700] - Duration of animation in ms
 * @param {number} [props.threshold=0.15] - Percentage of target visible before triggering
 * @param {boolean} [props.once=true] - Whether to only animate once
 * @param {string} [props.className=''] - Additional CSS classes
 */
export const ScrollReveal = ({
  children,
  animation = "fade-up",
  delay = 0,
  duration = 700,
  threshold = 0.15,
  once = true,
  className = "",
  style = {},
}) => {
  const ref = useRef(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          if (once) {
            observer.unobserve(entry.target);
          }
        } else if (!once) {
          setIsVisible(false);
        }
      },
      {
        threshold,
        rootMargin: "0px 0px -40px 0px",
      }
    );

    observer.observe(element);

    return () => {
      if (element) observer.unobserve(element);
    };
  }, [threshold, once]);

  // Compute CSS transition classes based on animation type and visibility state
  const getAnimationClasses = () => {
    switch (animation) {
      case "fade-up":
        return isVisible
          ? "opacity-100 translate-y-0 scale-100"
          : "opacity-0 translate-y-12 scale-[0.98]";

      case "fade-down":
        return isVisible
          ? "opacity-100 translate-y-0"
          : "opacity-0 -translate-y-10";

      case "slide-left":
        return isVisible
          ? "opacity-100 translate-x-0"
          : "opacity-0 translate-x-14";

      case "slide-right":
        return isVisible
          ? "opacity-100 translate-x-0"
          : "opacity-0 -translate-x-14";

      case "zoom-in":
        return isVisible
          ? "opacity-100 scale-100"
          : "opacity-0 scale-90";

      case "flip-up":
        return isVisible
          ? "opacity-100 rotate-0 translate-y-0"
          : "opacity-0 [transform:rotateX(15deg)_translateY(25px)]";

      case "glow-pulse":
        return isVisible
          ? "opacity-100 scale-100 shadow-2xl shadow-amber-500/10"
          : "opacity-0 scale-95 shadow-none";

      default:
        return isVisible
          ? "opacity-100 translate-y-0"
          : "opacity-0 translate-y-8";
    }
  };

  return (
    <div
      ref={ref}
      style={{
        transitionDuration: `${duration}ms`,
        transitionDelay: `${delay}ms`,
        ...style,
      }}
      className={`transition-all ease-out will-change-[transform,opacity] ${getAnimationClasses()} ${className}`}
    >
      {children}
    </div>
  );
};

export default ScrollReveal;
