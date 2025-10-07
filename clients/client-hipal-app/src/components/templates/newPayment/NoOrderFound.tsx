import { ShoppingBag } from "lucide-react";
import { Button } from "@/components/ui/button"; // if you use shadcn; otherwise replace with a <button>

interface NoOrderFoundProps {
  onGoBack: () => void;
  ctaText?: string; // optional: customize button label
}

export const NoOrderFound = ({ onGoBack, ctaText = "Go Back" }: NoOrderFoundProps) => {
  return (
    <div className="flex items-center justify-center min-h-[100dvh] p-6">
      <div
        className="
          text-center max-w-md mx-auto transform transition-all duration-500 ease-out
          translate-y-0 opacity-100 scale-100
        "
      >
        {/* Animated Icon */}
        <div className="relative mb-6">
          <div className="animate-bounce">
            <div className="relative">
              <ShoppingBag className="w-16 h-16 mx-auto text-muted-foreground/60" />
              <div className="absolute -top-1 -right-1 w-6 h-6 bg-red-500 rounded-full flex items-center justify-center animate-pulse">
                <span className="text-white text-xs font-bold">!</span>
              </div>
            </div>
          </div>

          {/* Ripple effect */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-20 h-20 border-2 border-muted-foreground/20 rounded-full animate-ping opacity-75"></div>
          </div>
        </div>

        {/* Main Message */}
        <div className="space-y-4">
          <h2 className="text-2xl font-bold text-foreground animate-fade-in-up">
            No Order Found
          </h2>

          <p className="text-muted-foreground text-lg animate-fade-in-up animation-delay-200">
            We couldn't find your order details.
          </p>
        </div>

        {/* CTA */}
        <div className="mt-8 animate-fade-in-up animation-delay-400">
          <Button
            onClick={onGoBack}
            className="h-11 px-6 rounded-xl font-medium"
            aria-label={ctaText}
          >
            {ctaText}
          </Button>
        </div>
      </div>
    </div>
  );
};
