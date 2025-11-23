interface SkeletonProps {
  className?: string;
  variant?: "default" | "text" | "circle" | "card";
}

function cn(...classes: (string | undefined)[]) {
  return classes.filter(Boolean).join(" ");
}

export function Skeleton({ className, variant = "default" }: SkeletonProps) {
  const baseClasses = "animate-shimmer bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 bg-[length:200%_100%]";
  
  const variantClasses = {
    default: "rounded-md",
    text: "rounded h-4",
    circle: "rounded-full",
    card: "rounded-xl",
  };

  return (
    <div
      className={cn(
        baseClasses,
        variantClasses[variant],
        className
      )}
    />
  );
}

// Composants spécialisés pour des cas d'usage courants
export function SkeletonText({ className }: { className?: string }) {
  return <Skeleton variant="text" className={className} />;
}

export function SkeletonCard({ className }: { className?: string }) {
  return <Skeleton variant="card" className={cn("p-6", className)} />;
}

export function SkeletonAvatar({ className }: { className?: string }) {
  return <Skeleton variant="circle" className={cn("w-12 h-12", className)} />;
}

