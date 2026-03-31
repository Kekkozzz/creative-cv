"use client";

import { useState } from "react";
import { Download, Maximize2, X } from "lucide-react";

type Props = {
  id: string;
  signedUrl: string | null;
  alt?: string;
};

export function InteractivePreview({ id, signedUrl, alt = "AI Preview" }: Props) {
  const [isFullscreen, setIsFullscreen] = useState(false);

  const handleDownload = async (url: string, filename: string) => {
    try {
      const response = await fetch(url);
      const blob = await response.blob();
      const blobUrl = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = blobUrl;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(blobUrl);
    } catch (error) {
      console.error("Error downloading image:", error);
      // Fallback: open in new tab if fetch fails due to CORS or other issues
      window.open(url, "_blank");
    }
  };

  if (!signedUrl) {
    return (
      <div className="w-full aspect-video bg-surface flex items-center justify-center">
        <span className="text-xs text-muted">Immagine non disponibile</span>
      </div>
    );
  }

  return (
    <>
      <div className="relative group overflow-hidden bg-black/10 aspect-video block w-full h-full">
        <button
          onClick={() => setIsFullscreen(true)}
          className="w-full h-full block cursor-zoom-in"
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={signedUrl}
            alt={alt}
            className="w-full h-full object-cover transition-transform group-hover:scale-105 duration-500"
          />
        </button>
        <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity gap-2 flex">
          <button
            onClick={() => setIsFullscreen(true)}
            className="bg-black/50 p-2 rounded hover:bg-black/80 text-white backdrop-blur flex items-center justify-center transition"
            title="Fullscreen"
          >
            <Maximize2 size={16} />
          </button>
          <button
            onClick={() => handleDownload(signedUrl, `preview-${id}.png`)}
            className="bg-black/50 p-2 rounded hover:bg-black/80 text-white backdrop-blur flex items-center justify-center transition"
            title="Scarica"
          >
            <Download size={16} />
          </button>
        </div>
      </div>

      {isFullscreen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm p-4 md:p-8">
          <button
            onClick={() => setIsFullscreen(false)}
            className="absolute top-4 right-4 md:top-8 md:right-8 bg-black/50 p-3 rounded-full hover:bg-black/80 text-white transition-colors"
          >
            <X size={24} />
          </button>

          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={signedUrl}
            alt={alt}
            className="max-w-full max-h-full object-contain shadow-2xl ring-1 ring-white/10 rounded-sm"
          />
        </div>
      )}
    </>
  );
}
