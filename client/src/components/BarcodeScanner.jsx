import { useEffect, useRef } from "react";
import { BrowserMultiFormatReader } from "@zxing/browser";

export default function BarcodeScanner({ onScan, onClose }) {
  const videoRef = useRef(null);
  const readerRef = useRef(null);
  const hasScannedRef = useRef(false);

  useEffect(() => {
    const reader = new BrowserMultiFormatReader();
    readerRef.current = reader;
    hasScannedRef.current = false;

    reader
      .decodeFromConstraints(
        { video: { facingMode: "environment" } },
        videoRef.current,
        (result, err) => {
          if (result && !hasScannedRef.current) {
            hasScannedRef.current = true;
            onScan(result.getText());
          }
          // err fires constantly for "no barcode found in this frame" —
          // that's normal and expected, not a real error to react to
        }
      )
      .catch((err) => {
        console.error("Camera start failed:", err);
      });

    return () => {
      // Stop the camera stream when leaving this screen
      const stream = videoRef.current?.srcObject;
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
      }
    };
  }, [onScan]);

  return (
    <div className="fixed inset-0 bg-black z-50 flex flex-col">
      <div className="flex justify-between items-center p-4">
        <p className="text-white font-medium">Scan a barcode</p>
        <button onClick={onClose} className="text-white">
          Close
        </button>
      </div>
      <video ref={videoRef} className="flex-1 object-cover" />
      <p className="text-white/60 text-sm text-center p-4">
        Point your camera at a product barcode
      </p>
    </div>
  );
}