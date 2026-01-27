import { useState, useEffect, useRef } from "react";

interface UseAnimatedCounterOptions {
  duration?: number;
  delay?: number;
  startFrom?: number;
}

export const useAnimatedCounter = (
  targetValue: number | undefined | null,
  options: UseAnimatedCounterOptions = {}
) => {
  const { duration = 1500, delay = 0, startFrom = 0 } = options;
  const [displayValue, setDisplayValue] = useState(startFrom);
  const animationRef = useRef<number>();
  const startTimeRef = useRef<number>();
  const hasAnimated = useRef(false);

  useEffect(() => {
    if (targetValue === undefined || targetValue === null) return;
    if (hasAnimated.current && displayValue === targetValue) return;

    const animate = (timestamp: number) => {
      if (!startTimeRef.current) {
        startTimeRef.current = timestamp;
      }

      const elapsed = timestamp - startTimeRef.current - delay;
      
      if (elapsed < 0) {
        animationRef.current = requestAnimationFrame(animate);
        return;
      }

      const progress = Math.min(elapsed / duration, 1);
      
      // Easing function for smooth animation (easeOutExpo)
      const easeOutExpo = 1 - Math.pow(2, -10 * progress);
      
      const currentValue = Math.floor(startFrom + (targetValue - startFrom) * easeOutExpo);
      setDisplayValue(currentValue);

      if (progress < 1) {
        animationRef.current = requestAnimationFrame(animate);
      } else {
        setDisplayValue(targetValue);
        hasAnimated.current = true;
      }
    };

    startTimeRef.current = undefined;
    animationRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [targetValue, duration, delay, startFrom]);

  return displayValue;
};

// Component version for easier use
interface AnimatedCounterProps {
  value: number | undefined | null;
  duration?: number;
  delay?: number;
  className?: string;
  formatter?: (value: number) => string;
}

export const AnimatedCounter = ({
  value,
  duration = 1500,
  delay = 0,
  className = "",
  formatter = (v) => v.toLocaleString('fr-FR'),
}: AnimatedCounterProps) => {
  const displayValue = useAnimatedCounter(value, { duration, delay });
  
  return (
    <span className={className}>
      {value !== undefined && value !== null ? formatter(displayValue) : '—'}
    </span>
  );
};
