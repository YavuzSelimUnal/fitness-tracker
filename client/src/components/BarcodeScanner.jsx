import { useEffect, useRef } from "react";
import { Html5Qrcode } from "html5-qrcode";
import { Html5QrcodeSupportedFormats } from "html5-qrcode";

export default function BarcodeScanner({ onScan, onClose }) {
  const scannerRef = useRef(null);
  const containerId = "barcode-scanner-region";

  useEffect(() => {
    const scanner = new Html5Qrcode(containerId);
    scannerRef.current = scanner;

    scanner
    .start(
      { facingMode: "environment" },
      {
        fps: 10,
        qrbox: { width: 280, height: 180 },
        formatsToSupport: [
          Html5QrcodeSupportedFormats.EAN_13,
          Html5QrcodeSupportedFormats.EAN_8,
          Html5QrcodeSupportedFormats.UPC_A,
          Html5QrcodeSupportedFormats.UPC_E,
        ],
      },
      (decodedText) => {
        scanner.stop().then(() => onScan(decodedText));
      },
      () => {}
    )
      .catch((err) => {
        console.error("Camera start failed:", err);
      });

    return () => {
      // Clean up the camera stream when the component unmounts —
      // otherwise the camera light stays on even after leaving this screen
      if (scannerRef.current) {
        scannerRef.current.stop().catch(() => {});
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
      <div id={containerId} className="flex-1" />
      <p className="text-white/60 text-sm text-center p-4">
        Point your camera at a product barcode
      </p>
    </div>
  );
}