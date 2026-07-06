"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import jsQR from "jsqr";
import { X } from "lucide-react";

interface QrScannerModalProps {
  onClose: () => void;
  onResult: (value: string) => void;
}

export function QrScannerModal({ onClose, onResult }: QrScannerModalProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const frameRef = useRef<number | null>(null);
  const doneRef = useRef(false);
  const [error, setError] = useState<string | null>(null);

  const stopCamera = useCallback(() => {
    if (frameRef.current !== null) {
      cancelAnimationFrame(frameRef.current);
      frameRef.current = null;
    }
    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;
  }, []);

  useEffect(() => {
    let cancelled = false;

    async function startCamera() {
      if (!navigator.mediaDevices?.getUserMedia) {
        setError("Este dispositivo ou navegador não suporta acesso à câmera.");
        return;
      }
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: { ideal: "environment" } },
          audio: false,
        });
        if (cancelled) {
          stream.getTracks().forEach((track) => track.stop());
          return;
        }
        streamRef.current = stream;
        const video = videoRef.current;
        if (video) {
          video.srcObject = stream;
          await video.play();
        }
        tick();
      } catch {
        if (!cancelled) {
          setError("Não foi possível acessar a câmera. Verifique as permissões do navegador.");
        }
      }
    }

    function tick() {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      if (!video || !canvas || doneRef.current) return;

      if (video.readyState === video.HAVE_ENOUGH_DATA) {
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        const context = canvas.getContext("2d");
        if (context) {
          context.drawImage(video, 0, 0, canvas.width, canvas.height);
          const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
          const code = jsQR(imageData.data, imageData.width, imageData.height);
          if (code && code.data) {
            doneRef.current = true;
            stopCamera();
            onResult(code.data);
            return;
          }
        }
      }
      frameRef.current = requestAnimationFrame(tick);
    }

    startCamera();

    return () => {
      cancelled = true;
      stopCamera();
    };
  }, [onResult, stopCamera]);

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-black">
      <div className="flex items-center justify-between p-4">
        <p className="text-sm font-semibold text-white">Escanear QR Code</p>
        <button
          type="button"
          onClick={() => {
            stopCamera();
            onClose();
          }}
          className="flex h-9 w-9 items-center justify-center rounded-full bg-white/10 text-white"
          aria-label="Fechar scanner"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      <div className="relative flex flex-1 items-center justify-center overflow-hidden">
        <video ref={videoRef} className="h-full w-full object-cover" playsInline muted />
        <canvas ref={canvasRef} className="hidden" />

        {!error && (
          <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
            <div className="h-64 w-64 rounded-2xl border-4 border-accent/80" />
          </div>
        )}

        {error && (
          <div className="absolute inset-x-4 top-1/2 -translate-y-1/2 rounded-xl bg-surface p-4 text-center">
            <p className="text-sm text-danger">{error}</p>
          </div>
        )}
      </div>

      <p className="p-4 text-center text-xs text-white/70">
        Aponte a câmera para o QR Code do ponto de inspeção
      </p>
    </div>
  );
}
