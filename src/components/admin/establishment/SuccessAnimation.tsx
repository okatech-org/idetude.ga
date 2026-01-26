import { useEffect, useState } from "react";
import confetti from "canvas-confetti";
import { CheckCircle2, Sparkles, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { GlassButton } from "@/components/ui/glass-button";

interface SuccessAnimationProps {
  establishmentName: string;
  onContinue: () => void;
  autoRedirectDelay?: number;
}

export const SuccessAnimation = ({
  establishmentName,
  onContinue,
  autoRedirectDelay = 4000,
}: SuccessAnimationProps) => {
  const [countdown, setCountdown] = useState(Math.ceil(autoRedirectDelay / 1000));
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Animate in
    setIsVisible(true);

    // Launch confetti
    const duration = 2000;
    const animationEnd = Date.now() + duration;

    const launchConfetti = () => {
      const timeLeft = animationEnd - Date.now();
      if (timeLeft <= 0) return;

      const particleCount = 50 * (timeLeft / duration);

      // Left side
      confetti({
        particleCount: Math.floor(particleCount / 2),
        startVelocity: 30,
        spread: 60,
        origin: { x: 0.2, y: 0.6 },
        colors: ["#22c55e", "#10b981", "#14b8a6", "#06b6d4", "#0ea5e9"],
        ticks: 200,
        gravity: 0.8,
        scalar: 1.2,
        drift: 0.5,
      });

      // Right side
      confetti({
        particleCount: Math.floor(particleCount / 2),
        startVelocity: 30,
        spread: 60,
        origin: { x: 0.8, y: 0.6 },
        colors: ["#22c55e", "#10b981", "#14b8a6", "#06b6d4", "#0ea5e9"],
        ticks: 200,
        gravity: 0.8,
        scalar: 1.2,
        drift: -0.5,
      });

      requestAnimationFrame(launchConfetti);
    };

    launchConfetti();

    // Center burst
    confetti({
      particleCount: 100,
      spread: 100,
      origin: { x: 0.5, y: 0.4 },
      colors: ["#22c55e", "#10b981", "#14b8a6", "#06b6d4", "#0ea5e9", "#fbbf24", "#f59e0b"],
      ticks: 300,
      gravity: 0.6,
      scalar: 1.5,
    });

    // Countdown timer
    const countdownInterval = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(countdownInterval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    // Auto redirect
    const redirectTimeout = setTimeout(() => {
      onContinue();
    }, autoRedirectDelay);

    return () => {
      clearInterval(countdownInterval);
      clearTimeout(redirectTimeout);
    };
  }, [autoRedirectDelay, onContinue]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm">
      <div
        className={cn(
          "relative max-w-lg w-full mx-4 p-8 rounded-2xl bg-gradient-to-br from-green-50 via-background to-emerald-50 dark:from-green-950/30 dark:via-background dark:to-emerald-950/30 border-2 border-green-500/30 shadow-2xl transition-all duration-500",
          isVisible
            ? "opacity-100 scale-100 translate-y-0"
            : "opacity-0 scale-95 translate-y-4"
        )}
      >
        {/* Success icon with animation */}
        <div className="flex justify-center mb-6">
          <div className="relative">
            <div className="absolute inset-0 animate-ping bg-green-500/20 rounded-full" />
            <div className="relative h-20 w-20 rounded-full bg-gradient-to-br from-green-400 to-emerald-500 flex items-center justify-center shadow-lg shadow-green-500/30">
              <CheckCircle2 className="h-10 w-10 text-white" />
            </div>
            <Sparkles className="absolute -top-2 -right-2 h-6 w-6 text-yellow-500 animate-pulse" />
            <Sparkles className="absolute -bottom-1 -left-3 h-5 w-5 text-yellow-400 animate-pulse" style={{ animationDelay: "0.5s" }} />
          </div>
        </div>

        {/* Success message */}
        <div className="text-center space-y-3">
          <h2 className="text-2xl font-bold text-green-600 dark:text-green-400">
            Établissement créé avec succès !
          </h2>
          <p className="text-lg font-semibold text-foreground">
            {establishmentName}
          </p>
          <p className="text-sm text-muted-foreground">
            Votre établissement a été enregistré dans le système.
          </p>
        </div>

        {/* Progress bar */}
        <div className="mt-6 space-y-2">
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>Redirection vers la configuration...</span>
            <span>{countdown}s</span>
          </div>
          <div className="h-1.5 bg-muted rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-green-500 to-emerald-500 transition-all duration-1000 ease-linear rounded-full"
              style={{
                width: `${((autoRedirectDelay / 1000 - countdown) / (autoRedirectDelay / 1000)) * 100}%`,
              }}
            />
          </div>
        </div>

        {/* Action button */}
        <div className="mt-6 flex justify-center">
          <GlassButton
            variant="primary"
            onClick={onContinue}
            className="gap-2 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white border-0"
          >
            Configurer maintenant
            <ArrowRight className="h-4 w-4" />
          </GlassButton>
        </div>
      </div>
    </div>
  );
};
