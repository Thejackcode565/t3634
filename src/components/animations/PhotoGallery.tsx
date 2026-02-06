import { useState, useEffect, useCallback } from 'react';
import { ChevronLeft, ChevronRight, X, Maximize2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface PhotoGalleryProps {
  images: string[];
  className?: string;
}

export const PhotoGallery = ({ images, className }: PhotoGalleryProps) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const [kenBurnsState, setKenBurnsState] = useState({ scale: 1, x: 0, y: 0 });
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mediaQuery.matches);
    
    const handler = (e: MediaQueryListEvent) => setPrefersReducedMotion(e.matches);
    mediaQuery.addEventListener('change', handler);
    return () => mediaQuery.removeEventListener('change', handler);
  }, []);
  
  // Ken Burns effect - subtle pan and zoom
  useEffect(() => {
    if (prefersReducedMotion || images.length === 0) return;
    
    const directions = [
      { scale: 1.1, x: 2, y: 2 },
      { scale: 1.1, x: -2, y: 2 },
      { scale: 1.1, x: 2, y: -2 },
      { scale: 1.1, x: -2, y: -2 },
    ];
    
    const randomDirection = directions[Math.floor(Math.random() * directions.length)];
    setKenBurnsState({ scale: 1, x: 0, y: 0 });
    
    const timeout = setTimeout(() => {
      setKenBurnsState(randomDirection);
    }, 100);
    
    return () => clearTimeout(timeout);
  }, [currentIndex, prefersReducedMotion, images.length]);
  
  // Auto-advance carousel
  useEffect(() => {
    if (images.length <= 1 || isFullscreen || prefersReducedMotion) return;
    
    const interval = setInterval(() => {
      goToNext();
    }, 5000);
    
    return () => clearInterval(interval);
  }, [images.length, isFullscreen, prefersReducedMotion]);
  
  const goToNext = useCallback(() => {
    if (isAnimating) return;
    setIsAnimating(true);
    setCurrentIndex(prev => (prev + 1) % images.length);
    setTimeout(() => setIsAnimating(false), 500);
  }, [images.length, isAnimating]);
  
  const goToPrev = useCallback(() => {
    if (isAnimating) return;
    setIsAnimating(true);
    setCurrentIndex(prev => (prev - 1 + images.length) % images.length);
    setTimeout(() => setIsAnimating(false), 500);
  }, [images.length, isAnimating]);
  
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.key === 'ArrowLeft') goToPrev();
    else if (e.key === 'ArrowRight') goToNext();
    else if (e.key === 'Escape') setIsFullscreen(false);
  }, [goToNext, goToPrev]);
  
  useEffect(() => {
    if (isFullscreen) {
      window.addEventListener('keydown', handleKeyDown);
      return () => window.removeEventListener('keydown', handleKeyDown);
    }
  }, [isFullscreen, handleKeyDown]);
  
  if (!images || images.length === 0) return null;
  
  return (
    <>
      {/* Main Gallery */}
      <div className={cn("relative overflow-hidden rounded-xl", className)}>
        {/* Image Container */}
        <div className="relative aspect-[4/3] overflow-hidden bg-black/5">
          {images.map((image, index) => (
            <div
              key={image}
              className={cn(
                "absolute inset-0 transition-all duration-700 ease-out",
                index === currentIndex ? "opacity-100 z-10" : "opacity-0 z-0"
              )}
            >
              <img
                src={image}
                alt={`Photo ${index + 1}`}
                className={cn(
                  "w-full h-full object-contain transition-transform ease-out",
                  !prefersReducedMotion && "duration-[8000ms]"
                )}
                style={
                  index === currentIndex && !prefersReducedMotion
                    ? {
                        transform: `scale(${kenBurnsState.scale}) translate(${kenBurnsState.x}%, ${kenBurnsState.y}%)`,
                      }
                    : undefined
                }
              />
            </div>
          ))}
        </div>
        
        {/* Navigation Arrows */}
        {images.length > 1 && (
          <>
            <Button
              variant="ghost"
              size="icon"
              onClick={goToPrev}
              className={cn(
                "absolute left-2 top-1/2 -translate-y-1/2 z-20",
                "w-10 h-10 rounded-full",
                "bg-background/60 backdrop-blur-sm",
                "hover:bg-background/80",
                "transition-all opacity-0 group-hover:opacity-100",
                "focus:opacity-100"
              )}
            >
              <ChevronLeft className="w-5 h-5" />
            </Button>
            
            <Button
              variant="ghost"
              size="icon"
              onClick={goToNext}
              className={cn(
                "absolute right-2 top-1/2 -translate-y-1/2 z-20",
                "w-10 h-10 rounded-full",
                "bg-background/60 backdrop-blur-sm",
                "hover:bg-background/80",
                "transition-all opacity-0 group-hover:opacity-100",
                "focus:opacity-100"
              )}
            >
              <ChevronRight className="w-5 h-5" />
            </Button>
          </>
        )}
        
        {/* Fullscreen Button */}
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setIsFullscreen(true)}
          className={cn(
            "absolute top-2 right-2 z-20",
            "w-8 h-8 rounded-full",
            "bg-background/60 backdrop-blur-sm",
            "hover:bg-background/80",
            "transition-all opacity-0 group-hover:opacity-100",
            "focus:opacity-100"
          )}
        >
          <Maximize2 className="w-4 h-4" />
        </Button>
        
        {/* Dots Indicator */}
        {images.length > 1 && (
          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 z-20 flex gap-1.5">
            {images.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentIndex(index)}
                className={cn(
                  "w-2 h-2 rounded-full transition-all duration-300",
                  index === currentIndex
                    ? "bg-white w-6"
                    : "bg-white/50 hover:bg-white/75"
                )}
              />
            ))}
          </div>
        )}
      </div>
      
      {/* Fullscreen Modal */}
      {isFullscreen && (
        <div className="fixed inset-0 z-[300] bg-black flex items-center justify-center">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsFullscreen(false)}
            className="absolute top-4 right-4 z-10 w-12 h-12 rounded-full bg-white/10 hover:bg-white/20 text-white"
          >
            <X className="w-6 h-6" />
          </Button>
          
          <img
            src={images[currentIndex]}
            alt={`Photo ${currentIndex + 1}`}
            className="max-w-full max-h-full object-contain"
          />
          
          {images.length > 1 && (
            <>
              <Button
                variant="ghost"
                size="icon"
                onClick={goToPrev}
                className="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white/10 hover:bg-white/20 text-white"
              >
                <ChevronLeft className="w-6 h-6" />
              </Button>
              
              <Button
                variant="ghost"
                size="icon"
                onClick={goToNext}
                className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white/10 hover:bg-white/20 text-white"
              >
                <ChevronRight className="w-6 h-6" />
              </Button>
            </>
          )}
        </div>
      )}
    </>
  );
};
