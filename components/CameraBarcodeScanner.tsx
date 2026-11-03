"use client";

import React, { useEffect, useRef, useState } from "react";
import { Camera, X, Flashlight, RefreshCw, Volume2, VolumeX, CheckCircle, AlertCircle } from "lucide-react";

interface CameraBarcodeScannerProps {
  isOpen: boolean;
  onClose: () => void;
  onScan: (barcode: string) => void;
  lastScannedMessage?: string;
  cartCount?: number;
}

export default function CameraBarcodeScanner({
  isOpen,
  onClose,
  onScan,
  lastScannedMessage,
  cartCount = 0,
}: CameraBarcodeScannerProps) {
  const [scannerReady, setScannerReady] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [torchOn, setTorchOn] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [scannedCountInSession, setScannedCountInSession] = useState(0);
  const [facingMode, setFacingMode] = useState<"environment" | "user">("environment");

  const scannerRef = useRef<any>(null);
  const lastScannedBarcodeRef = useRef<string>("");
  const lastScanTimestampRef = useRef<number>(0);

  // Play Cashier Beep
  const playBeep = () => {
    if (!soundEnabled) return;
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.type = "sine";
      osc.frequency.setValueAtTime(1400, audioCtx.currentTime);
      gain.gain.setValueAtTime(0.12, audioCtx.currentTime);
      osc.start();
      osc.stop(audioCtx.currentTime + 0.09);
    } catch {}
  };

  // Haptic Feedback
  const triggerHaptic = () => {
    try {
      if (typeof navigator !== "undefined" && navigator.vibrate) {
        navigator.vibrate([40, 30, 40]);
      }
    } catch {}
  };

  useEffect(() => {
    let html5QrCode: any = null;
    let isMounted = true;

    if (!isOpen) {
      return;
    }

    const initScanner = async () => {
      try {
        setCameraError(null);
        setScannerReady(false);

        const { Html5Qrcode, Html5QrcodeSupportedFormats } = await import("html5-qrcode");

        // Supported barcode formats for supermarkets
        const formatsToSupport = [
          Html5QrcodeSupportedFormats.EAN_13,
          Html5QrcodeSupportedFormats.EAN_8,
          Html5QrcodeSupportedFormats.CODE_128,
          Html5QrcodeSupportedFormats.CODE_39,
          Html5QrcodeSupportedFormats.UPC_A,
          Html5QrcodeSupportedFormats.UPC_E,
          Html5QrcodeSupportedFormats.QR_CODE,
        ];

        const readerElementId = "barcode-scanner-viewport";
        const element = document.getElementById(readerElementId);
        if (!element) return;

        html5QrCode = new Html5Qrcode(readerElementId, {
          formatsToSupport,
          verbose: false,
        });
        scannerRef.current = html5QrCode;

        const config = {
          fps: 15,
          qrbox: (viewfinderWidth: number, viewfinderHeight: number) => {
            // Horizontal rectangular box ideal for supermarket linear barcodes
            const width = Math.min(viewfinderWidth * 0.85, 320);
            const height = Math.min(viewfinderHeight * 0.55, 180);
            return { width: Math.floor(width), height: Math.floor(height) };
          },
          aspectRatio: 1.333,
        };

        await html5QrCode.start(
          { facingMode },
          config,
          (decodedText: string) => {
            const now = Date.now();
            const cleanCode = decodedText.trim();
            // Debounce scanning the same barcode within 1.2s
            if (cleanCode === lastScannedBarcodeRef.current && now - lastScanTimestampRef.current < 1200) {
              return;
            }

            lastScannedBarcodeRef.current = cleanCode;
            lastScanTimestampRef.current = now;

            playBeep();
            triggerHaptic();
            setScannedCountInSession((prev) => prev + 1);
            onScan(cleanCode);
          },
          () => {
            // Frame scan failure (ignored)
          }
        );

        if (isMounted) {
          setScannerReady(true);
        }
      } catch (err: any) {
        console.error("Camera scanner error:", err);
        if (isMounted) {
          setCameraError(
            err.message?.includes("Permission") || err.name === "NotAllowedError"
              ? "يرجى السماح بالوصول لكاميرا الهاتف من إعدادات المتصفح للبدء في مسح الباركود"
              : "تعذر تشغيل كاميرا الهاتف. تأكد من إغلاق أي تطبيق آخر يستخدم الكاميرا."
          );
        }
      }
    };

    // Small delay to ensure DOM is ready
    const timer = setTimeout(initScanner, 200);

    return () => {
      isMounted = false;
      clearTimeout(timer);
      if (scannerRef.current) {
        try {
          if (scannerRef.current.isScanning) {
            scannerRef.current.stop().then(() => {
              scannerRef.current.clear();
            }).catch(() => {});
          } else {
            scannerRef.current.clear();
          }
        } catch {}
      }
    };
  }, [isOpen, facingMode]);

  // Toggle Torch/Flashlight
  const toggleTorch = async () => {
    if (!scannerRef.current || !scannerReady) return;
    try {
      const newStatus = !torchOn;
      await scannerRef.current.applyVideoConstraints({
        advanced: [{ torch: newStatus }],
      });
      setTorchOn(newStatus);
    } catch (e) {
      alert("خاصية الكشاف غير مدعومة على هذه الكاميرا");
    }
  };

  // Flip Camera
  const flipCamera = () => {
    setFacingMode((prev) => (prev === "environment" ? "user" : "environment"));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex flex-col justify-between p-3 select-none">
      {/* Top Controls Bar */}
      <div className="flex items-center justify-between bg-slate-900/90 text-white px-4 py-3 rounded-2xl border border-emerald-500/30 shrink-0">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-bold shadow-md">
            <Camera className="w-4 h-4 animate-pulse" />
          </div>
          <div>
            <h3 className="font-black text-sm text-white flex items-center gap-1.5">
              <span>سكانر كاميرا الموبايل 📱</span>
              <span className="text-[10px] bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-2 py-0.5 rounded-full font-mono">
                مباشر
              </span>
            </h3>
            <p className="text-[10px] text-slate-400">
              وجّه الكاميرا نحو باركود الصنف أو ملصق الميزان
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          {/* Torch Button */}
          <button
            type="button"
            onClick={toggleTorch}
            className={`p-2 rounded-xl text-xs font-bold transition-colors ${
              torchOn
                ? "bg-amber-500 text-slate-950 shadow-md shadow-amber-500/30"
                : "bg-slate-800 text-slate-300 hover:text-white"
            }`}
            title="تشغيل كشاف الهاتف"
          >
            <Flashlight className="w-4 h-4" />
          </button>

          {/* Flip Camera */}
          <button
            type="button"
            onClick={flipCamera}
            className="p-2 rounded-xl text-xs font-bold bg-slate-800 text-slate-300 hover:text-white transition-colors"
            title="تبديل الكاميرا الخلفية / الأمامية"
          >
            <RefreshCw className="w-4 h-4" />
          </button>

          {/* Sound Toggle */}
          <button
            type="button"
            onClick={() => setSoundEnabled(!soundEnabled)}
            className="p-2 rounded-xl text-xs font-bold bg-slate-800 text-slate-300 hover:text-white transition-colors"
            title="تشغيل / كتم صوت البيب"
          >
            {soundEnabled ? <Volume2 className="w-4 h-4 text-emerald-400" /> : <VolumeX className="w-4 h-4 text-slate-500" />}
          </button>

          {/* Close Scanner */}
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl text-xs font-bold bg-rose-600/20 hover:bg-rose-600 text-rose-300 hover:text-white border border-rose-500/30 transition-colors"
            title="إغلاق الكاميرا والعودة للفاتورة"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Center Viewfinder with Laser Scanner Line */}
      <div className="flex-1 my-3 flex flex-col items-center justify-center relative overflow-hidden rounded-3xl border-2 border-emerald-500/40 bg-slate-950">
        {/* The Html5Qrcode Video Container */}
        <div
          id="barcode-scanner-viewport"
          className="w-full h-full flex items-center justify-center overflow-hidden rounded-3xl"
        />

        {/* Viewfinder Target Overlay */}
        {scannerReady && (
          <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
            {/* Dark Mask Around Laser Box */}
            <div className="relative w-[85%] max-w-[320px] h-[55%] max-h-[180px] border-2 border-emerald-400 rounded-2xl shadow-[0_0_0_9999px_rgba(0,0,0,0.55)] flex flex-col justify-between p-2">
              {/* Corner Accents */}
              <div className="flex justify-between">
                <div className="w-5 h-5 border-t-4 border-r-4 border-emerald-400 rounded-tr-lg" />
                <div className="w-5 h-5 border-t-4 border-l-4 border-emerald-400 rounded-tl-lg" />
              </div>

              {/* Red Animated Laser Line */}
              <div className="absolute inset-x-2 top-0 h-0.5 bg-gradient-to-r from-transparent via-red-500 to-transparent shadow-[0_0_12px_#ef4444] animate-scanner-laser" />

              <div className="flex justify-between">
                <div className="w-5 h-5 border-b-4 border-r-4 border-emerald-400 rounded-br-lg" />
                <div className="w-5 h-5 border-b-4 border-l-4 border-emerald-400 rounded-bl-lg" />
              </div>
            </div>
          </div>
        )}

        {/* Camera Loading Spinner */}
        {!scannerReady && !cameraError && (
          <div className="absolute inset-0 bg-slate-950 flex flex-col items-center justify-center gap-3 text-emerald-400 p-4 text-center">
            <RefreshCw className="w-8 h-8 animate-spin" />
            <p className="text-xs font-bold">جاري فتح كاميرا الهاتف وتهيئة السكانر...</p>
            <p className="text-[11px] text-slate-400">تأكد من السماح بإذن الكاميرا عند طلبه</p>
          </div>
        )}

        {/* Camera Error Message */}
        {cameraError && (
          <div className="absolute inset-0 bg-slate-950/95 flex flex-col items-center justify-center gap-3 p-6 text-center">
            <AlertCircle className="w-10 h-10 text-rose-500" />
            <p className="text-xs font-bold text-white max-w-xs">{cameraError}</p>
            <button
              onClick={() => {
                setCameraError(null);
                setFacingMode(facingMode === "environment" ? "user" : "environment");
              }}
              className="mt-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold"
            >
              إعادة المحاولة
            </button>
          </div>
        )}
      </div>

      {/* Bottom Live Feedback Bar */}
      <div className="bg-slate-900/90 text-white p-3 rounded-2xl border border-emerald-500/30 flex items-center justify-between gap-3 shrink-0 shadow-lg">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-300 truncate">
            <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
            <span className="truncate">
              {lastScannedMessage || "السكانر نشط وجاهز لمسح المنتجات باستمرار"}
            </span>
          </div>
          <p className="text-[10px] text-slate-400 mt-0.5">
            تم مسح <span className="font-bold text-emerald-400 font-mono">{scannedCountInSession}</span> أصناف الآن • إجمالي الفاتورة: <span className="font-bold text-white font-mono">{cartCount}</span> صنف
          </p>
        </div>

        <button
          type="button"
          onClick={onClose}
          className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-black shadow-md shrink-0 active:scale-95 transition-all"
        >
          تم، معاينة الفاتورة ({cartCount})
        </button>
      </div>

      {/* Laser Animation Keyframes */}
      <style jsx>{`
        @keyframes scannerLaser {
          0% {
            top: 5%;
            opacity: 0.8;
          }
          50% {
            top: 90%;
            opacity: 1;
          }
          100% {
            top: 5%;
            opacity: 0.8;
          }
        }
        .animate-scanner-laser {
          animation: scannerLaser 2s infinite ease-in-out;
        }
      `}</style>
    </div>
  );
}
