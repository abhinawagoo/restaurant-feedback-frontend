"use client";

import { useEffect, useRef, useState } from "react";
import QRCode from "qrcode";

export default function TableQRCode({ url, tableNumber }) {
  const canvasRef = useRef(null);
  const [generatedUrl, setGeneratedUrl] = useState("");

  useEffect(() => {
    if (canvasRef.current && url) {
      // Generate QR code
      QRCode.toCanvas(
        canvasRef.current,
        url,
        {
          width: 180,
          margin: 2,
          errorCorrectionLevel: "H",
          color: {
            dark: "#000000",
            light: "#ffffff",
          },
        },
        (error) => {
          if (error) console.error(error);
          else setGeneratedUrl(url);
        }
      );
    }
  }, [url, canvasRef]);

  return (
    <div className="flex flex-col items-center">
      <canvas ref={canvasRef} className="border rounded shadow-sm" />
      <p className="mt-2 text-sm font-medium">{tableNumber}</p>
      <p className="text-xs text-gray-500 mt-1 text-center max-w-[200px] truncate">
        {generatedUrl}
      </p>
    </div>
  );
}
