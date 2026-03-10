"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { Button } from "@/components/ui/button";
import {
  ChevronLeft,
  ChevronRight,
  ZoomIn,
  ZoomOut,
  RotateCw,
  Maximize2,
  Share2,
  Download,
  Copy,
  Check,
  X,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";
import { useTranslation } from "@/lib/i18n";
import { toastSuccess } from "@/hooks/use-toast";

interface ImageViewerProps {
  images: string[];
  initialIndex?: number;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  alt?: string;
}

async function fetchImageAsBlob(url: string): Promise<Blob | null> {
  try {
    const res = await fetch(url);
    return await res.blob();
  } catch {
    return null;
  }
}

async function shareNative(imageUrl: string, alt: string): Promise<boolean> {
  if (!navigator.share) return false;

  try {
    const blob = await fetchImageAsBlob(imageUrl);
    if (blob && navigator.canShare) {
      const ext = blob.type.includes("png") ? "png" : "jpg";
      const file = new File([blob], `image.${ext}`, { type: blob.type });
      const shareData = { files: [file] };
      if (navigator.canShare(shareData)) {
        await navigator.share(shareData);
        return true;
      }
    }
    await navigator.share({ title: alt, url: imageUrl });
    return true;
  } catch (e: any) {
    if (e?.name === "AbortError") return true;
    return false;
  }
}

function preloadImage(src: string) {
  const img = new Image();
  img.src = src;
}

function WhatsAppIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
    </svg>
  );
}

function TelegramIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M11.944 0A12 12 0 000 12a12 12 0 0012 12 12 12 0 0012-12A12 12 0 0012 0a12 12 0 00-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 01.171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.479.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z" />
    </svg>
  );
}

function FacebookIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
    </svg>
  );
}

function XIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M18.901 1.153h3.68l-8.04 9.19L24 22.846h-7.406l-5.8-7.584-6.638 7.584H.474l8.6-9.83L0 1.154h7.594l5.243 6.932ZM17.61 20.644h2.039L6.486 3.24H4.298Z" />
    </svg>
  );
}

export function ImageViewer({
  images,
  initialIndex = 0,
  open,
  onOpenChange,
  alt = "Image",
}: ImageViewerProps) {
  const { t } = useTranslation();
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [copied, setCopied] = useState(false);
  // Track whether zoom/rotation is actively being changed (for CSS transition)
  const isTransforming = useRef(false);

  // Reset everything when dialog opens with new images/initialIndex
  useEffect(() => {
    if (open) {
      setCurrentIndex(initialIndex);
      setZoom(1);
      setRotation(0);
    }
  }, [open, initialIndex]);

  // Preload adjacent images whenever currentIndex or images change
  useEffect(() => {
    if (!open || images.length <= 1) return;
    const prevIdx = currentIndex > 0 ? currentIndex - 1 : images.length - 1;
    const nextIdx = currentIndex < images.length - 1 ? currentIndex + 1 : 0;
    preloadImage(images[prevIdx]);
    preloadImage(images[nextIdx]);
  }, [open, currentIndex, images]);

  const handleClose = useCallback(() => {
    // Reset cursor + transforms on close
    setCurrentIndex(initialIndex);
    setZoom(1);
    setRotation(0);
    onOpenChange(false);
  }, [initialIndex, onOpenChange]);

  const goTo = useCallback((index: number) => {
    // Only change index - don't reset zoom/rotation (instant switch)
    setCurrentIndex(index);
  }, []);

  const goPrev = useCallback(() => {
    setCurrentIndex((prev) => (prev > 0 ? prev - 1 : images.length - 1));
  }, [images.length]);

  const goNext = useCallback(() => {
    setCurrentIndex((prev) => (prev < images.length - 1 ? prev + 1 : 0));
  }, [images.length]);

  const zoomIn = useCallback(() => {
    isTransforming.current = true;
    setZoom((z) => Math.min(z + 0.5, 4));
  }, []);

  const zoomOut = useCallback(() => {
    isTransforming.current = true;
    setZoom((z) => Math.max(z - 0.5, 0.5));
  }, []);

  const rotate = useCallback(() => {
    isTransforming.current = true;
    setRotation((r) => (r + 90) % 360);
  }, []);

  const fitToScreen = useCallback(() => {
    isTransforming.current = true;
    setZoom(1);
    setRotation(0);
  }, []);

  const currentImageUrl = images[currentIndex] || "";

  const handleShare = async () => {
    await shareNative(currentImageUrl, alt);
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(currentImageUrl);
    } catch {
      const textarea = document.createElement("textarea");
      textarea.value = currentImageUrl;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand("copy");
      document.body.removeChild(textarea);
    }
    setCopied(true);
    toastSuccess(t("common.linkCopied"));
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = async () => {
    try {
      const blob = await fetchImageAsBlob(currentImageUrl);
      if (blob) {
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        const ext = blob.type.includes("png") ? "png" : "jpg";
        a.download = `image-${currentIndex + 1}.${ext}`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      } else {
        window.open(currentImageUrl, "_blank");
      }
    } catch {
      window.open(currentImageUrl, "_blank");
    }
  };

  const shareToWhatsApp = () => {
    window.open(
      `https://api.whatsapp.com/send?text=${encodeURIComponent(currentImageUrl)}`,
      "_blank",
    );
  };

  const shareToTelegram = () => {
    window.open(
      `https://t.me/share/url?url=${encodeURIComponent(currentImageUrl)}`,
      "_blank",
    );
  };

  const shareToFacebook = () => {
    window.open(
      `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(currentImageUrl)}`,
      "_blank",
    );
  };

  const shareToX = () => {
    window.open(
      `https://x.com/intent/tweet?url=${encodeURIComponent(currentImageUrl)}`,
      "_blank",
    );
  };

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "ArrowLeft") goPrev();
      else if (e.key === "ArrowRight") goNext();
      else if (e.key === "+" || e.key === "=") zoomIn();
      else if (e.key === "-") zoomOut();
      else if (e.key === "r") rotate();
      else if (e.key === "Escape") handleClose();
    },
    [goPrev, goNext, zoomIn, zoomOut, rotate, handleClose],
  );

  // Clear the transforming flag after render so next navigation is instant
  useEffect(() => {
    if (isTransforming.current) {
      const timer = setTimeout(() => {
        isTransforming.current = false;
      }, 250);
      return () => clearTimeout(timer);
    }
  }, [zoom, rotation]);

  if (images.length === 0) return null;

  const supportsNativeShare =
    typeof navigator !== "undefined" && !!navigator.share;

  return (
    <DialogPrimitive.Root
      open={open}
      onOpenChange={(val) => {
        if (!val) {
          handleClose();
        } else {
          onOpenChange(true);
        }
      }}
    >
      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay
          className={cn(
            "fixed inset-0 z-50 bg-black/80",
            "data-[state=open]:animate-in data-[state=closed]:animate-out",
            "data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
          )}
        />
        <DialogPrimitive.Content
          className={cn(
            "fixed inset-0 z-50 flex flex-col",
            "data-[state=open]:animate-in data-[state=closed]:animate-out",
            "data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
          )}
          onKeyDown={handleKeyDown}
          onPointerDownOutside={(e) => {
            // Clicking overlay closes and resets
            handleClose();
          }}
        >
          <VisuallyHidden>
            <DialogPrimitive.Title>{alt}</DialogPrimitive.Title>
          </VisuallyHidden>

          {/* Toolbar */}
          <div className="absolute top-0 inset-x-0 z-20 flex items-center justify-between p-2 bg-gradient-to-b from-black/70 to-transparent">
            <div className="flex items-center gap-1">
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

              <div className="w-px h-5 bg-white/20 mx-1" />

              {/* Share button */}
              {supportsNativeShare ? (
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-white/80 hover:text-white hover:bg-white/20"
                  onClick={handleShare}
                  title={t("common.share")}
                >
                  <Share2 className="h-4 w-4" />
                </Button>
              ) : (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-white/80 hover:text-white hover:bg-white/20"
                      title={t("common.share")}
                    >
                      <Share2 className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="start" sideOffset={8}>
                    <DropdownMenuItem onClick={shareToWhatsApp}>
                      <WhatsAppIcon className="h-4 w-4 me-2" />
                      WhatsApp
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={shareToTelegram}>
                      <TelegramIcon className="h-4 w-4 me-2" />
                      Telegram
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={shareToFacebook}>
                      <FacebookIcon className="h-4 w-4 me-2" />
                      Facebook
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={shareToX}>
                      <XIcon className="h-4 w-4 me-2" />X
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={handleCopyLink}>
                      {copied ? (
                        <Check className="h-4 w-4 me-2" />
                      ) : (
                        <Copy className="h-4 w-4 me-2" />
                      )}
                      {t("common.copyLink")}
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={handleDownload}>
                      <Download className="h-4 w-4 me-2" />
                      {t("common.download")}
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              )}

              {/* Download button */}
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-white/80 hover:text-white hover:bg-white/20"
                onClick={handleDownload}
                title={t("common.download")}
              >
                <Download className="h-4 w-4" />
              </Button>
            </div>

            {/* Counter + Close button */}
            <div className="flex items-center gap-2">
              {images.length > 1 && (
                <span className="text-white/70 text-xs">
                  {currentIndex + 1} / {images.length}
                </span>
              )}
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-white/80 hover:text-white hover:bg-white/20"
                onClick={handleClose}
              >
                <X className="h-5 w-5" />
              </Button>
            </div>
          </div>

          {/* Image area */}
          <div className="flex-1 flex items-center justify-center overflow-auto p-8 pt-14 pb-20">
            <img
              key={currentIndex}
              src={images[currentIndex]}
              alt={`${alt} ${currentIndex + 1}`}
              className={cn(
                "max-w-full max-h-[85dvh] object-contain select-none",
                isTransforming.current && "transition-transform duration-200",
              )}
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
                className="absolute start-2 top-1/2 -translate-y-1/2 z-10 h-10 w-10 rounded-full bg-black/40 text-white hover:bg-black/60 hover:text-white"
                onClick={goPrev}
              >
                <ChevronLeft className="h-6 w-6" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="absolute end-2 top-1/2 -translate-y-1/2 z-10 h-10 w-10 rounded-full bg-black/40 text-white hover:bg-black/60 hover:text-white"
                onClick={goNext}
              >
                <ChevronRight className="h-6 w-6" />
              </Button>
            </>
          )}

          {/* Thumbnails */}
          {images.length > 1 && (
            <div className="absolute bottom-0 inset-x-0 z-10 flex items-center justify-center gap-2 p-3 bg-gradient-to-t from-black/60 to-transparent">
              {images.map((img, i) => (
                <button
                  key={i}
                  onClick={() => goTo(i)}
                  className={cn(
                    "h-12 w-12 rounded-lg overflow-hidden border-2 flex-shrink-0",
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
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
}
