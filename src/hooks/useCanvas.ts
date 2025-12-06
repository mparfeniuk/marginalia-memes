"use client";

import { useEffect, useRef, useState, useCallback, useMemo } from "react";
import {
  Canvas as FabricCanvas,
  IText,
  Image as FabricImage,
  Control,
} from "fabric";

interface TextObject {
  id: string;
  text: string;
  x: number;
  y: number;
  fontSize: number;
  fontFamily: string;
  fill: string;
  stroke: string;
  strokeWidth: number;
  width?: number;
  height?: number;
}

// Функція для визначення наявності кириличних символів у тексті
const hasCyrillic = (text: string): boolean => {
  return /[\u0400-\u04FF]/.test(text);
};

const getCanvasDimensions = (
  containerWidth?: number,
  containerHeight?: number,
  extraHeightOffset: number = 0,
  imageWidth?: number,
  imageHeight?: number
) => {
  if (typeof window === "undefined") {
    return { width: 1200, height: 900 };
  }

  const isMobile = window.innerWidth < 768;

  // На мобільних використовуємо ширину вікна мінус відступи
  const mobileWidth = window.innerWidth - 32; // padding 16px з обох боків
  const mobileHeight = Math.min(window.innerHeight * 0.5, 400); // Половина висоти або максимум 400

  // Якщо є зображення, обчислюємо розміри з урахуванням як ширини, так і висоти
  if (imageWidth && imageHeight) {
    const maxWidth = 800;
    // Для високих зображень використовуємо більшу частину viewport
    // Враховуємо також доступну висоту контейнера, але віддаємо перевагу viewport
    const viewportMaxHeight = isMobile
      ? window.innerHeight * 0.8 // 80% висоти екрану на мобільних
      : window.innerHeight - 120; // Мінімальний відступ на десктопі (120px)

    // Використовуємо більшу з двох: viewport або контейнер (якщо контейнер більший)
    const containerMaxHeight = containerHeight
      ? containerHeight - extraHeightOffset - 20 // Відступ від контейнера
      : 0;

    const maxHeight = Math.max(
      viewportMaxHeight,
      containerMaxHeight || viewportMaxHeight
    );

    const availableWidth = isMobile
      ? Math.min(mobileWidth, maxWidth)
      : Math.min(containerWidth || window.innerWidth - 400 - 64, maxWidth);

    const aspectRatio = imageWidth / imageHeight;

    // Обчислюємо розміри на основі ширини
    const widthBasedWidth = Math.max(300, Math.min(availableWidth, maxWidth));
    const widthBasedHeight = widthBasedWidth / aspectRatio;

    // Обчислюємо розміри на основі висоти
    // Використовуємо 99% від максимальної висоти для гарантії, що все вміститься
    const safeMaxHeight = maxHeight * 0.99;
    const heightBasedHeight = Math.min(safeMaxHeight, widthBasedHeight);
    const heightBasedWidth = heightBasedHeight * aspectRatio;

    // Для високих зображень (портретна орієнтація) завжди використовуємо height-based
    // або якщо width-based висота перевищує maxHeight
    const isPortrait = imageHeight > imageWidth;
    if (isPortrait || widthBasedHeight > safeMaxHeight) {
      return {
        width: heightBasedWidth,
        height: heightBasedHeight,
      };
    }

    return {
      width: widthBasedWidth,
      height: widthBasedHeight,
    };
  }

  // Якщо немає зображення, використовуємо стару логіку
  if (isMobile) {
    return {
      width: mobileWidth,
      height: mobileWidth * 0.75, // 4:3 aspect ratio
    };
  }

  const sidePadding = 400;
  const topPadding = 200;

  const availableWidth = containerWidth || window.innerWidth - sidePadding - 64;
  const availableHeight =
    (containerHeight || window.innerHeight - topPadding) - extraHeightOffset;

  const minHeight = 500;
  const maxHeight = Math.max(minHeight, availableHeight);

  const aspectRatio = 4 / 3;

  // Calculate height based on width
  const widthBasedHeight = availableWidth / aspectRatio;

  // Use the smaller dimension to fit both constraints
  let width: number;
  let height: number;

  if (widthBasedHeight <= maxHeight) {
    // Width is the limiting factor
    width = Math.max(600, Math.min(1400, availableWidth));
    height = width / aspectRatio;
  } else {
    // Height is the limiting factor
    height = maxHeight;
    width = height * aspectRatio;
  }

  return {
    width,
    height,
  };
};

export function useCanvas(extraHeightOffset: number = 0) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fabricCanvasRef = useRef<FabricCanvas | null>(null);
  const imageRef = useRef<FabricImage | null>(null);
  const canvasDimensionsRef = useRef<{ width: number; height: number } | null>(
    null
  );
  const textObjectsMapRef = useRef<Map<string, IText>>(new Map());
  const [selectedTextId, setSelectedTextId] = useState<string | null>(null);
  const [isCanvasReady, setIsCanvasReady] = useState(false);
  const [forceUpdate, setForceUpdate] = useState(0);
  const isTouchDevice = useRef(false);

  // Конвертуємо IText в TextObject для сумісності
  const fabricTextToTextObject = useCallback(
    (fabricText: IText, id: string): TextObject => {
      return {
        id,
        text: fabricText.text || "",
        x: fabricText.left || 0,
        y: fabricText.top || 0,
        fontSize: fabricText.fontSize || 40,
        fontFamily: fabricText.fontFamily || "Bangers",
        fill: fabricText.fill?.toString() || "#FFFFFF",
        stroke: fabricText.stroke?.toString() || "#000000",
        strokeWidth: fabricText.strokeWidth || 0,
        width: fabricText.width,
        height: fabricText.height,
      };
    },
    []
  );

  // Функція для налаштування курсора при редагуванні тексту
  const setupTextEditingCursor = useCallback((textObj: IText) => {
    // Налаштовуємо властивості курсора безпосередньо на об'єкті
    textObj.set({
      cursorColor: "#FF0000", // Червоний курсор для контрасту
      cursorWidth: 3, // Ширина курсора
      cursorDuration: 600, // Тривалість блимання (мс)
      cursorDelay: 300, // Затримка перед блиманням (мс)
    });

    // Використовуємо обробник події на текстових об'єктах
    textObj.on("editing:entered", () => {
      setTimeout(() => {
        try {
          const textLength = textObj.text?.length || 0;

          // Встановлюємо курсор в кінець тексту
          if (textObj.selectionStart !== undefined) {
            textObj.selectionStart = textLength;
          }
          if (textObj.selectionEnd !== undefined) {
            textObj.selectionEnd = textLength;
          }

          // Знаходимо та фокусуємо textarea
          const textarea = canvasRef.current?.parentElement?.querySelector(
            "textarea"
          ) as HTMLTextAreaElement;
          if (textarea) {
            textarea.focus();
            textarea.setSelectionRange(textLength, textLength);
          }

          // Перемальовуємо канвас для відображення курсора
          if (fabricCanvasRef.current) {
            fabricCanvasRef.current.renderAll();
          }
        } catch (error) {
          console.warn("Error setting cursor in editing:entered:", error);
        }
      }, 50);
    });
  }, []);

  const updateCanvasDimensions = useCallback(() => {
    const canvas = canvasRef.current;
    const fabricCanvas = fabricCanvasRef.current;
    if (!canvas || !fabricCanvas) return;

    // Перевіряємо чи canvas все ще в DOM
    if (!canvas.parentNode || !document.body.contains(canvas)) {
      return;
    }

    // Очікуємо поки контейнер має розміри
    const container = canvas.parentElement;
    if (!container || !container.parentNode) return;

    const containerWidth = container.clientWidth;
    const containerHeight = container.clientHeight;

    // Якщо контейнер ще не має розмірів, чекаємо трохи
    if (containerWidth === 0 || containerHeight === 0) {
      setTimeout(() => updateCanvasDimensions(), 100);
      return;
    }

    const img = imageRef.current;

    const { width, height } = img
      ? getCanvasDimensions(
          containerWidth,
          containerHeight,
          extraHeightOffset,
          img.width || 0,
          img.height || 0
        )
      : getCanvasDimensions(containerWidth, containerHeight, extraHeightOffset);

    // Переконаємося що розміри мінімальні
    const minWidth = 300;
    const minHeight = 200;
    const finalWidth = Math.max(minWidth, width);
    const finalHeight = Math.max(minHeight, height);

    // Only update if dimensions actually changed
    if (
      !canvasDimensionsRef.current ||
      canvasDimensionsRef.current.width !== finalWidth ||
      canvasDimensionsRef.current.height !== finalHeight
    ) {
      // Додаткова перевірка перед зміною розмірів
      if (canvas.parentNode && document.body.contains(canvas)) {
        try {
          // Плавно оновлюємо розміри canvas
          fabricCanvas.setDimensions({
            width: finalWidth,
            height: finalHeight,
          });
          canvasDimensionsRef.current = {
            width: finalWidth,
            height: finalHeight,
          };

          // Якщо є зображення, оновлюємо його позицію та масштаб, щоб воно займало весь canvas
          if (img) {
            // Canvas має aspect ratio зображення, тому зображення має займати весь canvas
            // Масштабуємо зображення так, щоб воно заповнило весь canvas
            // Оскільки canvas має правильний aspect ratio, використовуємо scaleX
            const scale = finalWidth / (img.width || 1);

            // Плавно оновлюємо масштаб та позицію зображення через requestAnimationFrame
            requestAnimationFrame(() => {
              img.scale(scale);
              img.set({
                left: 0,
                top: 0,
              });
              fabricCanvas.renderAll();
            });
          }

          fabricCanvas.renderAll();
        } catch (error) {
          console.warn("Error updating canvas dimensions:", error);
        }
      }
    }
  }, [extraHeightOffset]);

  // Ініціалізація Fabric.js canvas
  useEffect(() => {
    // Перевіряємо чи canvas елемент існує та чи не ініціалізований вже
    if (!canvasRef.current || fabricCanvasRef.current) return;

    // Перевіряємо чи canvas все ще в DOM
    if (!canvasRef.current.parentNode) return;

    const { width, height } = getCanvasDimensions();

    let fabricCanvas: FabricCanvas;
    try {
      fabricCanvas = new FabricCanvas(canvasRef.current, {
        width,
        height,
        backgroundColor: "#ffffff",
        selection: true,
        preserveObjectStacking: true,
        allowTouchScrolling: true, // Дозволяємо скрол на мобільних
      });

      // Переконаємося, що контейнер canvas має правильну структуру для DOM маніпуляцій
      const container = canvasRef.current.parentElement;
      if (container) {
        // Встановлюємо position для правильного позиціонування DOM елементів
        const computedStyle = window.getComputedStyle(container);
        if (computedStyle.position === "static") {
          container.style.position = "relative";
        }
      }
    } catch (error) {
      console.error("Error creating fabric canvas:", error);
      return;
    }

    // Налаштування стилів виділення
    fabricCanvas.selectionColor = "rgba(212, 175, 55, 0.3)";
    fabricCanvas.selectionBorderColor = "#D4AF37";
    fabricCanvas.selectionLineWidth = 2;

    // Обробка подвійного кліку - відкриваємо режим редагування тексту
    fabricCanvas.on("mouse:dblclick", (e) => {
      if (!fabricCanvasRef.current || !canvasRef.current) return;

      const target = e.target;
      if (target && target.type === "i-text") {
        const textObj = target as IText;

        try {
          // Перевіряємо чи canvas все ще в DOM перед редагуванням
          if (
            !canvasRef.current.parentNode ||
            !document.body.contains(canvasRef.current)
          ) {
            return;
          }

          // Виходимо з режиму редагування інших текстів
          textObjectsMapRef.current.forEach((text) => {
            if (text !== textObj && text.isEditing) {
              try {
                text.exitEditing();
              } catch (error) {
                console.warn("Error exiting editing mode:", error);
              }
            }
          });

          // Входимо в режим редагування для вибраного тексту
          fabricCanvas.setActiveObject(textObj);

          // Налаштовуємо властивості курсора перед входом в режим редагування
          textObj.set({
            cursorColor: "#FF0000", // Яскравий червоний курсор
            cursorWidth: 4,
            cursorDuration: 500,
            cursorDelay: 250,
          });

          // Входимо в режим редагування
          textObj.enterEditing();

          // Встановлюємо курсор в кінець тексту
          const textLength = textObj.text?.length || 0;
          textObj.selectionStart = textLength;
          textObj.selectionEnd = textLength;

          // Примусово запускаємо блимання курсора
          if (typeof (textObj as any)._tick === "function") {
            (textObj as any)._tick();
          }

          // Перемальовуємо канвас для відображення курсора
          fabricCanvas.requestRenderAll();

          console.log("Editing mode activated:", {
            isEditing: textObj.isEditing,
            cursorColor: textObj.cursorColor,
            cursorWidth: textObj.cursorWidth,
            selectionStart: textObj.selectionStart,
            selectionEnd: textObj.selectionEnd,
            fill: textObj.fill,
          });

          fabricCanvas.renderAll();

          // Знаходимо id тексту для оновлення selectedTextId
          for (const [id, text] of textObjectsMapRef.current.entries()) {
            if (text === textObj) {
              setSelectedTextId(id);
              break;
            }
          }
        } catch (error) {
          console.warn("Error entering text editing mode:", error);
        }
      }
    });

    // Оновлення selectedTextId при виборі об'єкта
    fabricCanvas.on("selection:created", (e) => {
      const activeObject = e.selected?.[0];
      if (activeObject && activeObject.type === "i-text") {
        const fabricText = activeObject as IText;
        // Знаходимо id по fabric об'єкту
        for (const [id, text] of textObjectsMapRef.current.entries()) {
          if (text === fabricText) {
            setSelectedTextId(id);
            break;
          }
        }
      } else {
        setSelectedTextId(null);
      }
    });

    fabricCanvas.on("selection:updated", (e) => {
      const activeObject = e.selected?.[0];
      if (activeObject && activeObject.type === "i-text") {
        const fabricText = activeObject as IText;
        for (const [id, text] of textObjectsMapRef.current.entries()) {
          if (text === fabricText) {
            setSelectedTextId(id);
            break;
          }
        }
      } else {
        setSelectedTextId(null);
      }
    });

    fabricCanvas.on("selection:cleared", () => {
      // Виходимо з режиму редагування всіх текстів при очищенні виділення
      textObjectsMapRef.current.forEach((text) => {
        if (text.isEditing) {
          try {
            text.exitEditing();
          } catch (error) {
            console.warn("Error exiting editing mode:", error);
          }
        }
      });
      setSelectedTextId(null);
    });

    // Оновлення тексту при редагуванні
    fabricCanvas.on("text:changed", (e) => {
      if (!fabricCanvasRef.current || !canvasRef.current) return;
      const fabricText = e.target as IText;
      for (const [id, text] of textObjectsMapRef.current.entries()) {
        if (text === fabricText) {
          try {
            // Автоматично змінюємо шрифт на PT Sans, якщо текст містить кирилицю
            const currentText = fabricText.text || "";
            const shouldUsePTSans = hasCyrillic(currentText);
            const currentFontFamily = fabricText.fontFamily || "Bangers";

            if (shouldUsePTSans && currentFontFamily !== "PT Sans") {
              fabricText.set({
                text: currentText,
                fontFamily: "PT Sans",
              });
            } else if (!shouldUsePTSans && currentFontFamily === "PT Sans") {
              // Якщо кирилиці немає, але шрифт PT Sans, можна залишити як є або змінити на Bangers
              // Поки що залишаємо PT Sans, щоб не змінювати шрифт без потреби
              fabricText.set({
                text: currentText,
              });
            } else {
              fabricText.set({
                text: currentText,
              });
            }

            fabricCanvas.renderAll();
            // Force update для синхронізації з React
            // Використовуємо функціональне оновлення для отримання актуального значення
            setSelectedTextId((currentId) => {
              if (id === currentId) {
                setForceUpdate((prev) => prev + 1);
              }
              return currentId;
            });
          } catch (error) {
            console.warn("Error updating text:", error);
          }
          break;
        }
      }
    });

    // Оновлення позиції та розміру при зміні об'єкта
    fabricCanvas.on("object:modified", (e) => {
      const obj = e.target;
      if (obj && obj.type === "i-text") {
        const fabricText = obj as IText;

        // Конвертуємо scale в fontSize тільки після завершення масштабування
        // Перевіряємо, чи є scale (якщо користувач масштабував через кутові маркери)
        if (
          (fabricText.scaleX !== undefined && fabricText.scaleX !== 1) ||
          (fabricText.scaleY !== undefined && fabricText.scaleY !== 1)
        ) {
          // Беремо середнє значення scaleX і scaleY для більш точного розрахунку
          const avgScale =
            ((fabricText.scaleX || 1) + (fabricText.scaleY || 1)) / 2;
          const baseFontSize =
            (fabricText as any).__baseFontSize || fabricText.fontSize || 40;
          const newFontSize = Math.round(baseFontSize * avgScale); // Округлюємо до цілого числа

          // Оновлюємо fontSize та скидаємо scale
          fabricText.set({
            fontSize: newFontSize,
            scaleX: 1,
            scaleY: 1,
          });

          // Оновлюємо базовий розмір для подальших розрахунків
          (fabricText as any).__baseFontSize = newFontSize;
        }

        fabricCanvas.renderAll();

        // Оновлюємо forceUpdate для синхронізації з React, якщо це вибраний текст
        for (const [id, text] of textObjectsMapRef.current.entries()) {
          if (text === fabricText) {
            setSelectedTextId((currentId) => {
              if (id === currentId) {
                setForceUpdate((prev) => prev + 1);
              }
              return currentId;
            });
            break;
          }
        }
      }
    });

    // Оновлення розмірів canvas при зміні розміру вікна
    const handleResize = () => {
      if (fabricCanvasRef.current && canvasRef.current) {
        updateCanvasDimensions();
      }
    };

    const handleOrientationChange = () => {
      if (fabricCanvasRef.current && canvasRef.current) {
        setTimeout(() => {
          updateCanvasDimensions();
        }, 300);
      }
    };

    window.addEventListener("resize", handleResize);
    window.addEventListener("orientationchange", handleOrientationChange);

    // Використовуємо ResizeObserver для відстеження розмірів контейнера
    let resizeObserver: ResizeObserver | null = null;
    if (
      canvasRef.current &&
      canvasRef.current.parentElement &&
      typeof ResizeObserver !== "undefined"
    ) {
      resizeObserver = new ResizeObserver(() => {
        if (fabricCanvasRef.current && canvasRef.current) {
          updateCanvasDimensions();
        }
      });
      resizeObserver.observe(canvasRef.current.parentElement);
    }

    fabricCanvasRef.current = fabricCanvas;
    canvasDimensionsRef.current = { width, height };

    // Ініціалізуємо canvas з правильними розмірами
    setTimeout(() => {
      if (fabricCanvasRef.current && canvasRef.current) {
        updateCanvasDimensions();
        setIsCanvasReady(true);
      }
    }, 100);

    return () => {
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("orientationchange", handleOrientationChange);
      if (resizeObserver) {
        resizeObserver.disconnect();
      }
      // Видаляємо всі обробники подій перед dispose
      fabricCanvas.off();
      // Перевіряємо чи canvas все ще в DOM перед dispose
      if (canvasRef.current && canvasRef.current.parentNode) {
        try {
          fabricCanvas.dispose();
        } catch (error) {
          console.warn("Error disposing fabric canvas:", error);
        }
      }
      fabricCanvasRef.current = null;
      textObjectsMapRef.current.clear();
      imageRef.current = null;
    };
  }, [updateCanvasDimensions, setupTextEditingCursor]);

  const loadImage = useCallback(
    (imageUrl: string) => {
      console.log("Loading image:", imageUrl);
      setIsCanvasReady(false);
      const fabricCanvas = fabricCanvasRef.current;
      if (!fabricCanvas || !canvasRef.current) return;

      // Перевіряємо чи canvas все ще в DOM
      if (!canvasRef.current.parentNode) {
        console.warn("Canvas not in DOM, skipping image load");
        setIsCanvasReady(true);
        return;
      }

      const img = new Image();
      img.crossOrigin = "anonymous";

      img.onload = () => {
        // Використовуємо requestAnimationFrame для забезпечення готовності DOM
        requestAnimationFrame(() => {
          // Перевіряємо чи canvas все ще існує та в DOM
          const fabricCanvas = fabricCanvasRef.current;
          const canvas = canvasRef.current;

          if (!fabricCanvas || !canvas) {
            setIsCanvasReady(true);
            return;
          }

          if (!canvas.parentNode || !document.body.contains(canvas)) {
            console.warn("Canvas not in DOM, skipping image load");
            setIsCanvasReady(true);
            return;
          }

          console.log("Image loaded:", img.width, "x", img.height);

          try {
            // Зберігаємо посилання на старе зображення для плавного переходу
            const oldImage = imageRef.current;

            // Створюємо нове fabric image з opacity 0 для плавного fade-in
            const fabricImg = new FabricImage(img, {
              left: 0,
              top: 0,
              selectable: false,
              evented: false,
              excludeFromExport: false,
              opacity: 0, // Починаємо з невидимого
            });

            // Додаємо зображення на canvas з перевірками
            if (canvas.parentNode && document.body.contains(canvas)) {
              // Спочатку додаємо нове зображення на canvas (невидиме)
              fabricCanvas.add(fabricImg);
              // У Fabric.js v6 використовується sendObjectToBack замість sendToBack
              fabricCanvas.sendObjectToBack(fabricImg);

              // Оновлюємо розміри canvas під aspect ratio нового зображення
              // Це викличе updateCanvasDimensions, яка оновить позицію та масштаб зображення
              requestAnimationFrame(() => {
                requestAnimationFrame(() => {
                  if (
                    fabricCanvasRef.current &&
                    canvasRef.current &&
                    canvasRef.current.parentNode
                  ) {
                    try {
                      // Оновлюємо посилання на зображення перед оновленням розмірів
                      imageRef.current = fabricImg;

                      // Оновлюємо розміри canvas (це також оновить позицію нового зображення)
                      updateCanvasDimensions();

                      // Плавно робимо старе зображення невидимим та видаляємо його
                      if (oldImage) {
                        // Fade out старого зображення через requestAnimationFrame
                        const fadeOutStart = performance.now();
                        const fadeOutDuration = 200; // 200ms
                        const fadeOut = (currentTime: number) => {
                          const elapsed = currentTime - fadeOutStart;
                          const progress = Math.min(
                            elapsed / fadeOutDuration,
                            1
                          );
                          const opacity = 1 - progress;

                          oldImage.set("opacity", opacity);
                          fabricCanvas.renderAll();

                          if (progress < 1) {
                            requestAnimationFrame(fadeOut);
                          } else {
                            try {
                              fabricCanvas.remove(oldImage);
                              fabricCanvas.renderAll();
                            } catch (error) {
                              console.warn("Error removing old image:", error);
                            }
                          }
                        };
                        requestAnimationFrame(fadeOut);
                      }

                      // Fade in нового зображення через requestAnimationFrame
                      const fadeInStart = performance.now();
                      const fadeInDuration = 300; // 300ms
                      const fadeIn = (currentTime: number) => {
                        const elapsed = currentTime - fadeInStart;
                        const progress = Math.min(elapsed / fadeInDuration, 1);
                        const opacity = progress;

                        fabricImg.set("opacity", opacity);
                        fabricCanvas.renderAll();

                        if (progress < 1) {
                          requestAnimationFrame(fadeIn);
                        }
                      };
                      requestAnimationFrame(fadeIn);
                    } catch (error) {
                      console.warn("Error updating canvas dimensions:", error);
                    }
                  }
                });
              });

              // Переміщуємо всі тексти на передній план, щоб вони були поверх зображення
              // У Fabric.js v6 використовується bringObjectToFront замість bringToFront
              textObjectsMapRef.current.forEach((textObj) => {
                try {
                  fabricCanvas.bringObjectToFront(textObj);
                } catch (error) {
                  console.warn("Error bringing text to front:", error);
                }
              });

              fabricCanvas.renderAll();
            }

            // Даємо час на оновлення canvas перед показом
            requestAnimationFrame(() => {
              requestAnimationFrame(() => {
                if (
                  fabricCanvasRef.current &&
                  canvasRef.current &&
                  canvasRef.current.parentNode
                ) {
                  setIsCanvasReady(true);
                }
              });
            });
          } catch (error) {
            console.error("Error loading image to canvas:", error);
            setIsCanvasReady(true);
          }
        });
      };

      img.onerror = (error) => {
        console.error("Failed to load image:", error);
        setIsCanvasReady(true); // Показуємо canvas навіть якщо зображення не завантажилося
      };

      img.src = imageUrl;
    },
    [updateCanvasDimensions]
  );

  const deleteText = useCallback(
    (id: string) => {
      const fabricCanvas = fabricCanvasRef.current;
      if (!fabricCanvas || !canvasRef.current) return;

      const fabricText = textObjectsMapRef.current.get(id);
      if (fabricText) {
        try {
          // Виходимо з режиму редагування якщо текст зараз редагується
          if (fabricText.isEditing) {
            fabricText.exitEditing();
          }
          fabricCanvas.remove(fabricText);
          textObjectsMapRef.current.delete(id);
          fabricCanvas.renderAll();
        } catch (error) {
          console.warn("Error deleting text:", error);
        }
      }

      if (selectedTextId === id) {
        setSelectedTextId(null);
      }
    },
    [selectedTextId]
  );

  // Функція для видалення тексту через fabric об'єкт
  const deleteTextByFabricObject = useCallback(
    (fabricText: IText) => {
      // Знаходимо ID тексту
      for (const [id, text] of textObjectsMapRef.current.entries()) {
        if (text === fabricText) {
          deleteText(id);
          break;
        }
      }
    },
    [deleteText]
  );

  const addText = useCallback(
    (
      text: string = "Your text here",
      options?: {
        fontSize?: number;
        fontFamily?: string;
        fill?: string;
        stroke?: string;
        strokeWidth?: number;
        position?: "center" | "bottom";
      }
    ) => {
      const fabricCanvas = fabricCanvasRef.current;
      if (!fabricCanvas || !canvasRef.current) return;

      const canvasWidth = fabricCanvas.width || 800;
      const canvasHeight = fabricCanvas.height || 600;

      const id = `text-${Date.now()}`;

      try {
        // Визначаємо стилі з опцій або використовуємо значення за замовчуванням
        const fontSize = options?.fontSize ?? 40;
        // Визначаємо шрифт: з опцій, або на основі наявності кириличних символів
        const fontFamily =
          options?.fontFamily ?? (hasCyrillic(text) ? "PT Sans" : "Bangers");
        const fill = options?.fill ?? "#FFFFFF";
        const stroke = options?.stroke ?? "#000000";
        const strokeWidth = options?.strokeWidth ?? 2;

        // Визначаємо позицію: center або bottom
        const position = options?.position ?? "center";
        const topPosition =
          position === "bottom" ? canvasHeight - 100 : canvasHeight / 2;

        const fabricText = new IText(text, {
          left: canvasWidth / 2,
          top: topPosition,
          originX: "center",
          originY: "center",
          fontFamily: fontFamily,
          fontSize: fontSize,
          fill: fill,
          stroke: stroke,
          strokeWidth: strokeWidth,
          textAlign: "center",
          editable: true,
          selectable: true,
          // Налаштування курсора
          cursorColor: "#FF0000",
          cursorWidth: 3,
          editingBorderColor: "#D4AF37",
        });

        // Зберігаємо базовий розмір шрифту для подальших розрахунків при масштабуванні
        (fabricText as any).__baseFontSize = fontSize;

        // Додаємо кастомний контрол для видалення (хрестик в правому верхньому кутку)
        const deleteControl = new Control({
          x: 0.5, // Правий край
          y: -0.5, // Верхній край
          offsetX: 10,
          offsetY: -10,
          cursorStyle: "pointer",
          mouseUpHandler: (eventData: any, transformData: any) => {
            const target = transformData.target as IText;
            if (target && target.type === "i-text") {
              deleteTextByFabricObject(target);
            }
            return true;
          },
          render: (
            ctx: CanvasRenderingContext2D,
            left: number,
            top: number,
            styleOverride: any,
            fabricObject: IText
          ) => {
            const size = 20;
            ctx.save();
            ctx.translate(left, top);
            ctx.fillStyle = "#ff0000"; // Червоний фон
            ctx.strokeStyle = "#ffffff"; // Білий хрестик
            ctx.lineWidth = 2;

            // Малюємо круглий фон
            ctx.beginPath();
            ctx.arc(0, 0, size / 2, 0, Math.PI * 2);
            ctx.fill();
            ctx.stroke();

            // Малюємо хрестик
            const crossSize = size * 0.4;
            ctx.beginPath();
            ctx.moveTo(-crossSize / 2, -crossSize / 2);
            ctx.lineTo(crossSize / 2, crossSize / 2);
            ctx.moveTo(crossSize / 2, -crossSize / 2);
            ctx.lineTo(-crossSize / 2, crossSize / 2);
            ctx.stroke();

            ctx.restore();
          },
        });

        // Додаємо контрол до тексту
        if (!fabricText.controls) {
          fabricText.controls = {};
        }
        (fabricText.controls as any).deleteControl = deleteControl;

        fabricCanvas.add(fabricText);
        // Переміщуємо текст на передній план, щоб він був поверх зображення
        // У Fabric.js v6 використовується bringObjectToFront замість bringToFront
        fabricCanvas.bringObjectToFront(fabricText);
        fabricCanvas.setActiveObject(fabricText);

        // Налаштовуємо обробник для відображення курсора при редагуванні
        setupTextEditingCursor(fabricText);

        textObjectsMapRef.current.set(id, fabricText);
        setSelectedTextId(id);
        fabricCanvas.renderAll();

        // Не входимо автоматично в режим редагування
        // Користувач може редагувати текст через подвійний клік або бічну панель
      } catch (error) {
        console.error("Error adding text:", error);
      }
    },
    [setupTextEditingCursor, deleteTextByFabricObject]
  );

  const updateText = useCallback(
    (id: string, updates: Partial<TextObject>) => {
      const fabricCanvas = fabricCanvasRef.current;
      if (!fabricCanvas || !canvasRef.current) return;

      const fabricText = textObjectsMapRef.current.get(id);
      if (!fabricText) return;

      try {
        // Виходимо з режиму редагування якщо текст зараз редагується
        if (fabricText.isEditing) {
          fabricText.exitEditing();
        }

        // Оновлюємо властивості fabric тексту
        if (updates.text !== undefined) {
          fabricText.set("text", updates.text);
          // Автоматично змінюємо шрифт на PT Sans, якщо текст містить кирилицю
          if (
            hasCyrillic(updates.text) &&
            fabricText.fontFamily !== "PT Sans"
          ) {
            fabricText.set("fontFamily", "PT Sans");
          }
        }
        if (updates.x !== undefined) {
          fabricText.set("left", updates.x);
        }
        if (updates.y !== undefined) {
          fabricText.set("top", updates.y);
        }
        if (updates.fontSize !== undefined) {
          fabricText.set("fontSize", updates.fontSize);
          // Оновлюємо базовий розмір шрифту для подальших розрахунків при масштабуванні
          (fabricText as any).__baseFontSize = updates.fontSize;
        }
        if (updates.fontFamily !== undefined) {
          fabricText.set("fontFamily", updates.fontFamily);
        }
        if (updates.fill !== undefined) {
          fabricText.set("fill", updates.fill);
        }
        if (updates.stroke !== undefined) {
          fabricText.set("stroke", updates.stroke);
        }
        if (updates.strokeWidth !== undefined) {
          fabricText.set("strokeWidth", updates.strokeWidth);
        }

        fabricCanvas.renderAll();

        // Force update для синхронізації з React
        if (id === selectedTextId) {
          setForceUpdate((prev) => prev + 1);
        }
      } catch (error) {
        console.warn("Error updating text:", error);
      }
    },
    [selectedTextId]
  );

  // Обробники подій миші (для сумісності з існуючим API)
  const handleMouseDown = useCallback(
    (e: React.MouseEvent<HTMLCanvasElement>) => {
      // Fabric.js обробляє події миші сам, але ми можемо додати додаткову логіку
      if (isTouchDevice.current) return;
      // Fabric.js обробляє все автоматично
    },
    []
  );

  const handleMouseMove = useCallback(
    (e: React.MouseEvent<HTMLCanvasElement>) => {
      // Fabric.js обробляє події миші сам
      if (isTouchDevice.current) return;
    },
    []
  );

  const handleMouseUp = useCallback(() => {
    // Fabric.js обробляє події миші сам
  }, []);

  // Обробники touch подій для мобільних пристроїв
  const handleTouchStart = useCallback(
    (e: React.TouchEvent<HTMLCanvasElement>) => {
      isTouchDevice.current = true;
      // Не блокуємо скрол - CSS touchAction вже обробляє це
    },
    []
  );

  const handleTouchMove = useCallback(
    (e: React.TouchEvent<HTMLCanvasElement>) => {
      // Не блокуємо скрол - CSS touchAction вже обробляє це
    },
    []
  );

  const handleTouchEnd = useCallback(
    (e: React.TouchEvent<HTMLCanvasElement>) => {
      // Не блокуємо стандартну поведінку при touchEnd
    },
    []
  );

  const exportCanvas = useCallback((format: "png" | "jpeg" = "png"): string => {
    const fabricCanvas = fabricCanvasRef.current;
    if (!fabricCanvas) return "";

    return fabricCanvas.toDataURL({ format, quality: 1, multiplier: 1 });
  }, []);

  const clearCanvas = useCallback(() => {
    const fabricCanvas = fabricCanvasRef.current;
    if (!fabricCanvas || !canvasRef.current) return;

    try {
      // Видаляємо зображення
      if (imageRef.current) {
        fabricCanvas.remove(imageRef.current);
        imageRef.current = null;
      }

      // Видаляємо всі тексти
      textObjectsMapRef.current.forEach((text) => {
        try {
          if (text.isEditing) {
            text.exitEditing();
          }
          fabricCanvas.remove(text);
        } catch (error) {
          console.warn("Error removing text:", error);
        }
      });
      textObjectsMapRef.current.clear();

      setSelectedTextId(null);
      fabricCanvas.renderAll();
    } catch (error) {
      console.warn("Error clearing canvas:", error);
    }
  }, []);

  // Отримуємо поточний вибраний текст для сумісності з TextControls
  // Використовуємо useMemo з forceUpdate для оновлення при зміні тексту на canvas
  const selectedText = useMemo(() => {
    if (!selectedTextId) return null;
    const fabricText = textObjectsMapRef.current.get(selectedTextId);
    return fabricText
      ? fabricTextToTextObject(fabricText, selectedTextId)
      : null;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedTextId, forceUpdate]);

  return {
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
  };
}
