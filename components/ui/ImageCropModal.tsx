"use client";

import { useState, useRef, useEffect } from "react";
import { Button } from "./button";
import { X } from "lucide-react";

interface ImageCropModalProps {
  imageUrl: string;
  onCropComplete: (croppedImage: string) => void;
  onClose: () => void;
}

export function ImageCropModal({ imageUrl, onCropComplete, onClose }: ImageCropModalProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const pointerIdRef = useRef<number | null>(null);
  const minScaleRef = useRef<number>(1);
  const [image, setImage] = useState<HTMLImageElement | null>(null);
  const [scale, setScale] = useState<number>(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  const SIZE = 360;

  useEffect(() => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      setImage(img);
      // compute an initial scale so the whole image fits inside the crop area
      const s = Math.min(1, SIZE / Math.max(img.width, img.height));
      setScale(s);
      minScaleRef.current = s;
      // Center the scaled image
      setPosition({ x: (SIZE - img.width * s) / 2, y: (SIZE - img.height * s) / 2 });
    };
    img.src = imageUrl;
    return () => {
      setImage(null);
    };
  }, [imageUrl]);

  useEffect(() => {
    if (image && canvasRef.current) drawCanvas();
  }, [image, position]);

  const drawCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas || !image) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    canvas.width = SIZE;
    canvas.height = SIZE;

    // fill with dark background
    ctx.fillStyle = "#071017";
    ctx.fillRect(0, 0, SIZE, SIZE);

  // draw image at scaled size
  const dw = image.width * scale;
  const dh = image.height * scale;
  ctx.drawImage(image, position.x, position.y, dw, dh);

    // apply circular mask
    ctx.globalCompositeOperation = "destination-in";
    ctx.beginPath();
    ctx.arc(SIZE / 2, SIZE / 2, SIZE / 2, 0, Math.PI * 2);
    ctx.fill();
    ctx.globalCompositeOperation = "source-over";
  };

  const startDrag = (clientX: number, clientY: number) => {
    setIsDragging(true);
    setDragStart({ x: clientX - position.x, y: clientY - position.y });
  };

  const moveDrag = (clientX: number, clientY: number) => {
    if (!isDragging) return;
    setPosition({ x: clientX - dragStart.x, y: clientY - dragStart.y });
  };

  const endDrag = () => {
    setIsDragging(false);
    pointerIdRef.current = null;
  };

  // Pointer (mouse + touch) handlers
  const handlePointerDown = (e: React.PointerEvent) => {
    (e.target as Element).setPointerCapture(e.pointerId);
    pointerIdRef.current = e.pointerId;
    startDrag(e.clientX, e.clientY);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (pointerIdRef.current !== null && pointerIdRef.current !== e.pointerId) return;
    moveDrag(e.clientX, e.clientY);
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    try {
      (e.target as Element).releasePointerCapture(e.pointerId);
    } catch {}
    endDrag();
  };

  // Wheel zoom: zoom centered on pointer
  const handleWheel = (e: React.WheelEvent) => {
    if (!image) return;
    e.preventDefault();
    zoomAt(e.clientX, e.clientY, e.deltaY);
  };

  const zoomAt = (clientX: number, clientY: number, deltaY: number) => {
    if (!image || !canvasRef.current) return;
    const rect = canvasRef.current.getBoundingClientRect();
    const cx = clientX - rect.left;
    const cy = clientY - rect.top;

    // zoom factor: smaller deltaY -> zoom less; invert so wheel up zooms in
    const delta = -deltaY;
    const zoomFactor = Math.exp(delta * 0.0015); // tuned factor

    const oldScale = scale;
    const newScaleUnclamped = oldScale * zoomFactor;
    const maxScale = Math.max(minScaleRef.current * 3, 3);
    const newScale = Math.max(minScaleRef.current, Math.min(maxScale, newScaleUnclamped));

    // Keep the image point under the cursor stable when zooming
    const imgX = (cx - position.x) / oldScale; // image-space coordinate
    const imgY = (cy - position.y) / oldScale;

    const newPosX = cx - imgX * newScale;
    const newPosY = cy - imgY * newScale;

    setScale(newScale);
    setPosition({ x: newPosX, y: newPosY });
  };

  // Attach a native wheel listener with passive: false so preventDefault works on all browsers
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const nativeWheel = (ev: WheelEvent) => {
      // Only handle when pointer is over the canvas
      // Prevent page scroll while zooming
      ev.preventDefault();
      zoomAt(ev.clientX, ev.clientY, ev.deltaY);
    };

    canvas.addEventListener("wheel", nativeWheel, { passive: false });
    return () => canvas.removeEventListener("wheel", nativeWheel as EventListener);
  }, [image, scale, position]);

  const handleCrop = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const cropped = canvas.toDataURL("image/png");
    onCropComplete(cropped);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 backdrop-blur-md p-6">
      <div className="w-full max-w-2xl bg-[#071018] border border-white/7 rounded-3xl p-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h3 className="text-2xl font-semibold">Crop avatar</h3>
            <p className="text-sm text-gray-400 mt-1">Drag the image to position it inside the circle. Click Apply when you're happy.</p>
          </div>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-white/5">
            <X size={20} />
          </button>
        </div>

        <div className="mt-6 flex flex-col items-center">
          <div className="relative rounded-full overflow-hidden" style={{ width: SIZE, height: SIZE }}>
            <canvas
              ref={canvasRef}
              className={`block w-full h-full touch-none ${isDragging ? "cursor-grabbing" : "cursor-grab"}`}
              onPointerDown={handlePointerDown}
              onPointerMove={handlePointerMove}
              onPointerUp={handlePointerUp}
              onPointerCancel={handlePointerUp}
              onWheel={handleWheel}
            />
            <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
              <div className="w-[92%] h-[92%] border-2 border-white/20 rounded-full shadow-inner" />
            </div>
          </div>

          <div className="mt-6 w-full flex gap-3">
            <Button variant="ghost" onClick={onClose} className="flex-1">
              Cancel
            </Button>
            <Button onClick={handleCrop} className="flex-1">
              Apply avatar
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
