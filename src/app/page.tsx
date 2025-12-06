"use client";

import { useState, useRef, useEffect } from "react";
import { CanvasEditor } from "@/components/meme-editor/CanvasEditor";
import { ImageGallery } from "@/components/image-gallery/ImageGallery";
import { TextControls } from "@/components/text-controls/TextControls";
import { ShareModal } from "@/components/share/ShareModal";
import { useCanvas } from "@/hooks/useCanvas";
import { PremadeImage } from "@/types/meme";
import { Button } from "@/components/ui/Button";
import { downloadImage } from "@/lib/utils";

export default function Home() {
  const [selectedImage, setSelectedImage] = useState<PremadeImage | null>(null);
  const [hasCustomImage, setHasCustomImage] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [shareDataUrl, setShareDataUrl] = useState<string | null>(null);
  const [isMobile, setIsMobile] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const buttonsRef = useRef<HTMLDivElement>(null);
  const [buttonsHeight, setButtonsHeight] = useState(0);
  const [defaultImageLoaded, setDefaultImageLoaded] = useState(false);
  const [defaultTextAdded, setDefaultTextAdded] = useState(false);

  useEffect(() => {
    if (buttonsRef.current) {
      setButtonsHeight(buttonsRef.current.offsetHeight + 16); // height + margin-bottom
    }
  }, [selectedImage]);

  // Визначаємо чи це мобільний пристрій
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(
        window.innerWidth < 768 ||
          /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
            navigator.userAgent
          )
      );
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  const {
    canvasRef,
    selectedText,
    loadImage,
    addText,
    updateText,
    deleteText,
    handleMouseDown,
    handleMouseMove,
    handleMouseUp,
    handleTouchStart,
    handleTouchMove,
    handleTouchEnd,
    exportCanvas,
    clearCanvas,
    isCanvasReady,
  } = useCanvas(buttonsHeight);

  // Автоматично завантажуємо головне зображення при завантаженні сторінки
  useEffect(() => {
    if (defaultImageLoaded || selectedImage) return;

    const loadDefaultImage = async () => {
      try {
        const response = await fetch("/api/images/premade");
        const data = await response.json();
        const defaultImage = data.images?.find(
          (img: PremadeImage) =>
            img.name === "lacrima_ridicula_rana_imperialis" ||
            img.path.includes("lacrima_ridicula_rana_imperialis")
        );

        if (defaultImage) {
          setSelectedImage(defaultImage);
          setDefaultImageLoaded(true);
        }
      } catch (error) {
        console.error("Failed to load default image:", error);
      }
    };

    loadDefaultImage();
  }, [defaultImageLoaded, selectedImage]);

  // Автоматично додаємо текст після завантаження зображення
  useEffect(() => {
    if (
      !defaultImageLoaded ||
      !selectedImage ||
      !isCanvasReady ||
      defaultTextAdded
    )
      return;

    // Чекаємо трохи, щоб canvas повністю оновився
    const timer = setTimeout(() => {
      if (canvasRef.current) {
        // Визначаємо чи це мобільний пристрій
        const isMobileDevice = window.innerWidth < 768;

        // Додаємо текст з переносом на нову строку та стилями одразу
        addText("I'm watching as vibe coders and\nAI take my job away", {
          fontSize: isMobileDevice ? 24 : 50,
          fontFamily: "Bangers",
          fill: "#FFFF00",
          stroke: "#000000",
          strokeWidth: isMobileDevice ? 1 : 2,
          position: isMobileDevice ? "center" : "bottom",
        });
        setDefaultTextAdded(true);
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [
    defaultImageLoaded,
    selectedImage,
    isCanvasReady,
    defaultTextAdded,
    addText,
    canvasRef,
  ]);

  const handleImageSelect = (image: PremadeImage) => {
    setSelectedImage(image);
    setHasCustomImage(false);
  };

  const handleAddText = () => {
    addText("Your text here");
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const imageUrl = e.target?.result as string;
      setHasCustomImage(true);
      setSelectedImage(null); // Очищаємо premade зображення якщо було вибрано
      loadImage(imageUrl);
    };
    reader.readAsDataURL(file);
    // Очищаємо input щоб можна було завантажити той самий файл знову
    event.target.value = "";
  };

  const handleShare = () => {
    const dataUrl = exportCanvas("png");
    if (!dataUrl) return;

    if (isMobile) {
      // На мобільних пристроях - відкриваємо модальне вікно з опціями шарингу
      setShareDataUrl(dataUrl);
      setShowShareModal(true);
    } else {
      // На десктопі - просто завантажуємо файл
      downloadImage(dataUrl, "marginalia-meme.png");
    }
  };

  return (
    <main className="min-h-screen p-4 md:p-6">
      <div className="max-w-[1920px] mx-auto">
        <header className="text-center mb-6">
          <h1 className="text-4xl md:text-5xl font-decorative text-medieval-gold mb-2 drop-shadow-lg">
            Marginalia Memes
          </h1>
          <p className="text-lg text-medieval-parchment font-medieval">
            Create memes with medieval flair
          </p>
        </header>

        <div className="flex flex-col lg:flex-row gap-4 lg:h-[calc(100vh-180px)]">
          {/* Left Sidebar */}
          <div className="lg:w-80 xl:w-96 flex flex-col gap-4 flex-shrink-0 order-2 lg:order-1">
            {/* Text Controls */}
            <div className="flex-shrink-0">
              <TextControls
                selectedText={selectedText}
                onUpdateText={updateText}
                onDeleteText={deleteText}
              />
            </div>

            {/* Image Gallery */}
            <div className="flex-1 overflow-y-auto min-h-0">
              <ImageGallery onSelectImage={handleImageSelect} />
            </div>
          </div>

          {/* Main Canvas Area */}
          <div className="flex-1 flex flex-col min-w-0 order-1 lg:order-2 min-h-[400px]">
            {/* Action Buttons and Image Info */}
            <div
              ref={buttonsRef}
              className="flex-shrink-0 mb-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3"
            >
              {/* Buttons - first on mobile, second on desktop */}
              <div className="flex flex-wrap gap-3 order-2 sm:order-1">
                <Button onClick={handleAddText} className="flex-1 sm:flex-none">
                  + Add Text
                </Button>
                <Button
                  onClick={() => fileInputRef.current?.click()}
                  variant="secondary"
                  className="flex-1 sm:flex-none"
                >
                  Upload Image
                </Button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileUpload}
                  className="hidden"
                />
                <Button
                  variant="secondary"
                  onClick={handleShare}
                  className="flex-1 sm:flex-none"
                >
                  {isMobile ? "Share Meme" : "Download Meme"}
                </Button>
              </div>

              {/* Image Info - first on mobile, second on desktop */}
              {(selectedImage || hasCustomImage) && (
                <div className="flex items-center justify-between flex-shrink-0 order-1 sm:order-2">
                  {selectedImage && (
                    <div>
                      <p className="text-medieval-gold font-medieval text-sm">
                        Using: {selectedImage.name}
                      </p>
                    </div>
                  )}
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => {
                      setSelectedImage(null);
                      setHasCustomImage(false);
                      clearCanvas();
                    }}
                    className={`text-xs ${selectedImage ? "ml-3" : ""}`}
                  >
                    Clear
                  </Button>
                </div>
              )}
            </div>
            <div className="flex-1 flex flex-col min-h-0">
              <CanvasEditor
                selectedImage={selectedImage}
                canvasRef={canvasRef}
                loadImage={loadImage}
                handleMouseDown={handleMouseDown}
                handleMouseMove={handleMouseMove}
                handleMouseUp={handleMouseUp}
                handleTouchStart={handleTouchStart}
                handleTouchMove={handleTouchMove}
                handleTouchEnd={handleTouchEnd}
                isCanvasReady={isCanvasReady}
              />
            </div>
          </div>
        </div>
      </div>

      {showShareModal && shareDataUrl && (
        <ShareModal
          isOpen={showShareModal}
          onClose={() => {
            setShowShareModal(false);
            setShareDataUrl(null);
          }}
          dataUrl={shareDataUrl}
          filename="marginalia-meme.png"
        />
      )}

      <footer className="mt-8 pb-4 text-center space-y-2">
        <p className="text-xl font-decorative text-medieval-gold drop-shadow-lg">
          Day I. Vibe coding marathon.
        </p>
        <p className="text-sm text-medieval-parchment">
          Author{" "}
          <a
            href="https://docs.google.com/document/d/1rW7omQzs0aN9SL_IQktzBvr1uqR0B3Ba0RGP1OxVMXI/edit?usp=sharing"
            target="_blank"
            rel="noopener noreferrer"
            className="text-medieval-gold hover:text-medieval-rust underline transition-colors"
          >
            Max Parfeniuk
          </a>{" "}
          — Looking for a job as web-developer
        </p>
      </footer>
    </main>
  );
}
