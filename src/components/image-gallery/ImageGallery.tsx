"use client";

import React, { useEffect, useState } from "react";
import { PremadeImage } from "@/types/meme";

interface ImageGalleryProps {
  onSelectImage: (image: PremadeImage) => void;
}

export const ImageGallery: React.FC<ImageGalleryProps> = ({
  onSelectImage,
}) => {
  const [images, setImages] = useState<PremadeImage[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchImages = async () => {
      try {
        const response = await fetch("/api/images/premade");
        const data = await response.json();
        setImages(data.images || []);
      } catch (error) {
        console.error("Failed to fetch images:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchImages();
  }, []);

  if (loading) {
    return (
      <div className="bg-medieval-brown border-medieval border-2 rounded-lg p-3">
        <h2 className="text-base font-decorative text-medieval-gold mb-1.5">
          Premade Images
        </h2>
        <p className="text-medieval-parchment text-xs">Loading images...</p>
      </div>
    );
  }

  if (images.length === 0) {
    return (
      <div className="bg-medieval-brown border-medieval border-2 rounded-lg p-3">
        <h2 className="text-base font-decorative text-medieval-gold mb-1.5">
          Premade Images
        </h2>
        <p className="text-medieval-parchment text-xs">
          No images found. Add images to public/images/premade/
        </p>
      </div>
    );
  }

  return (
    <div className="bg-medieval-brown border-medieval border-2 rounded-lg p-2.5">
      <h2 className="text-base font-decorative text-medieval-gold mb-1.5">
        Premade Images
      </h2>
      <div className="grid grid-cols-3 gap-1.5">
        {images.map((image) => (
          <div
            key={image.id}
            className="relative group cursor-pointer border-2 border-medieval-gold rounded-lg overflow-hidden hover:border-medieval-rust transition-all transform hover:scale-105 aspect-square bg-medieval-dark"
            onClick={() => onSelectImage(image)}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={image.path}
              alt={image.name}
              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
              loading="lazy"
            />
            <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all" />
          </div>
        ))}
      </div>
    </div>
  );
};
