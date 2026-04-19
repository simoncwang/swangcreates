"use client";

import Image from "next/image";
import { useCallback, useEffect, useState } from "react";
import type { Photo } from "@/lib/galleryLoader";

export default function GalleryComponent({ photos }: { photos: Photo[] }) {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [touchStartX, setTouchStartX] = useState<number | null>(null);

  const closeModal = useCallback(() => setSelectedIndex(null), []);

  const showPrev = useCallback(() => {
    setSelectedIndex((currentIndex) => {
      if (currentIndex === null) return null;
      return (currentIndex - 1 + photos.length) % photos.length;
    });
  }, [photos.length]);

  const showNext = useCallback(() => {
    setSelectedIndex((currentIndex) => {
      if (currentIndex === null) return null;
      return (currentIndex + 1) % photos.length;
    });
  }, [photos.length]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (selectedIndex === null) return;
      if (e.key === "Escape") closeModal();
      if (e.key === "ArrowLeft") showPrev();
      if (e.key === "ArrowRight") showNext();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [closeModal, selectedIndex, showNext, showPrev]);

  // Preload adjacent optimized images so arrow navigation feels immediate.
  useEffect(() => {
    if (selectedIndex === null || photos.length < 2) return;

    const adjacentIndexes = [
      (selectedIndex - 1 + photos.length) % photos.length,
      (selectedIndex + 1) % photos.length,
    ];

    for (const index of adjacentIndexes) {
      const image = new window.Image();
      image.src = `/_next/image?url=${encodeURIComponent(photos[index].src)}&w=1920&q=75`;
    }
  }, [photos, selectedIndex]);

   // Touch swipe handlers for mobile
  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStartX(e.touches[0].clientX);
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX === null) return;
    const touchEndX = e.changedTouches[0].clientX;
    const deltaX = touchEndX - touchStartX;

    if (deltaX > 50) {
      showPrev(); // swipe right → previous
    } else if (deltaX < -50) {
      showNext(); // swipe left → next
    }
    setTouchStartX(null);
  };

  return (
    <>
      {/* Thumbnail Grid */}
      <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
        {photos.map((photo, i) => (
          <div
            key={photo.src}
            className="overflow-hidden rounded-2xl shadow-md cursor-pointer"
            onClick={() => setSelectedIndex(i)}
          >
            <Image
              src={photo.src}
              alt={photo.alt}
              width={500}
              height={400}
              sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
              className="object-cover w-full h-64 hover:scale-105 transition-transform"
            />
          </div>
        ))}
      </div>

      {/* Modal */}
      {selectedIndex !== null && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm"
          onClick={closeModal}
        >
          <div
            className="relative max-w-5xl w-full flex flex-col items-center" 
            onClick={(e) => e.stopPropagation()}
            onTouchStart={handleTouchStart}
            onTouchEnd={handleTouchEnd}
          >
            {/* Close button */}
            <button
              className="absolute p-6 -top-12 -right-12 text-white text-xl bg-black/40 hover:bg-black/70 rounded-full w-10 h-10 flex items-center justify-center"
              onClick={closeModal}
            >
              ✕
            </button>

            {/* Image */}
            <div className="relative h-[80vh] w-full">
              <Image
                src={photos[selectedIndex].src}
                alt={photos[selectedIndex].alt}
                fill
                priority
                sizes="100vw"
                className="object-contain"
              />
            </div>

            {/* Description below the image */}
            {photos[selectedIndex].caption && (
              <p className="mt-4 text-gray-200 text-center text-md max-w-3xl">
                {photos[selectedIndex].caption}
              </p>
            )}

            {/* Arrows (still relative to image edges) */}
            <button
              className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-full
                        text-white bg-black/40 hover:bg-black/70 
                        rounded-full w-12 h-12 flex items-center justify-center"
              onClick={showPrev}
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="w-6 h-6">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>

            <button
              className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-full 
                        text-white bg-black/40 hover:bg-black/70 
                        rounded-full w-12 h-12 flex items-center justify-center"
              onClick={showNext}
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="w-6 h-6">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        </div>
      )}
    </>
  );
}
