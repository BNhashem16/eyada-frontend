"use client";

import { useState, useCallback } from "react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  ChevronLeft,
  ChevronRight,
  ZoomIn,
  ZoomOut,
  RotateCw,
  Maximize2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";

interface ImageViewerProps {
  images: string[];
  initialIndex?: number;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  alt?: string;
}

export function ImageViewer({
  images,
  initialIndex = 0,
  open,
  onOpenChange,
  alt = "Image",
}: ImageViewerProps) {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);

  const resetTransforms = useCallback(() => {
    setZoom(1);
    setRotation(0);
  }, []);

  const goTo = useCallback(
    (index: number) => {
      setCurrentIndex(index);
      resetTransforms();
    },
    [resetTransforms],
  );

  const goPrev = useCallback(() => {
    goTo(currentIndex > 0 ? currentIndex - 1 : images.length - 1);
  }, [currentIndex, images.length, goTo]);

  const goNext = useCallback(() => {
    goTo(currentIndex < images.length - 1 ? currentIndex + 1 : 0);
  }, [currentIndex, images.length, goTo]);

  const zoomIn = () => setZoom((z) => Math.min(z + 0.5, 4));
  const zoomOut = () => setZoom((z) => Math.max(z - 0.5, 0.5));
  const rotate = () => setRotation((r) => (r + 90) % 360);
  const fitToScreen = () => resetTransforms();

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "ArrowLeft") goPrev();
      else if (e.key === "ArrowRight") goNext();
      else if (e.key === "+" || e.key === "=") zoomIn();
      else if (e.key === "-") zoomOut();
      else if (e.key === "r") rotate();
    },
    [goPrev, goNext],
  );

  if (images.length === 0) return null;

  return (
    <Dialog
      open={open}
      onOpenChange={(val) => {
        if (!val) resetTransforms();
        onOpenChange(val);
      }}
    >
      <DialogContent
        className="max-w-[95vw] max-h-[95dvh] w-auto p-0 bg-black/95 border-none sm:rounded-2xl overflow-hidden"
        onKeyDown={handleKeyDown}
      >
        <VisuallyHidden>
          <DialogTitle>{alt}</DialogTitle>
        </VisuallyHidden>

        {/* Toolbar */}
        <div className="absolute top-0 inset-x-0 z-10 flex items-center justify-center gap-1 p-2 bg-gradient-to-b from-black/60 to-transparent">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-white/80 hover:text-white hover:bg-white/20"
            onClick={zoomOut}
          >
            <ZoomOut className="h-4 w-4" />
          </Button>
          <span className="text-white/70 text-xs min-w-[3rem] text-center">
            {Math.round(zoom * 100)}%
          </span>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-white/80 hover:text-white hover:bg-white/20"
            onClick={zoomIn}
          >
            <ZoomIn className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-white/80 hover:text-white hover:bg-white/20"
            onClick={rotate}
          >
            <RotateCw className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-white/80 hover:text-white hover:bg-white/20"
            onClick={fitToScreen}
          >
            <Maximize2 className="h-4 w-4" />
          </Button>
        </div>

        {/* Image */}
        <div className="flex items-center justify-center min-h-[60vh] max-h-[85dvh] overflow-auto p-8">
          <img
            src={images[currentIndex]}
            alt={`${alt} ${currentIndex + 1}`}
            className="max-w-full max-h-[80dvh] object-contain transition-transform duration-200 select-none"
            style={{
              transform: `scale(${zoom}) rotate(${rotation}deg)`,
            }}
            draggable={false}
          />
        </div>

        {/* Navigation arrows */}
        {images.length > 1 && (
          <>
            <Button
              variant="ghost"
              size="icon"
              className="absolute start-2 top-1/2 -translate-y-1/2 h-10 w-10 rounded-full bg-black/40 text-white hover:bg-black/60 hover:text-white"
              onClick={goPrev}
            >
              <ChevronLeft className="h-6 w-6" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="absolute end-2 top-1/2 -translate-y-1/2 h-10 w-10 rounded-full bg-black/40 text-white hover:bg-black/60 hover:text-white"
              onClick={goNext}
            >
              <ChevronRight className="h-6 w-6" />
            </Button>
          </>
        )}

        {/* Thumbnails */}
        {images.length > 1 && (
          <div className="absolute bottom-0 inset-x-0 flex items-center justify-center gap-2 p-3 bg-gradient-to-t from-black/60 to-transparent">
            {images.map((img, i) => (
              <button
                key={i}
                onClick={() => goTo(i)}
                className={cn(
                  "h-12 w-12 rounded-lg overflow-hidden border-2 transition-all flex-shrink-0",
                  i === currentIndex
                    ? "border-white opacity-100 scale-110"
                    : "border-transparent opacity-50 hover:opacity-80",
                )}
              >
                <img
                  src={img}
                  alt={`Thumbnail ${i + 1}`}
                  className="w-full h-full object-cover"
                />
              </button>
            ))}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
