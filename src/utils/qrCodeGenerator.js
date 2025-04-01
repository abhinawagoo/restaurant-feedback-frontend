// src/utils/qrCodeGenerator.js
import QRCode from "qrcode";

// Generate a QR code data URL (for downloading)
export const generateQRDataURL = async (url) => {
  try {
    return await QRCode.toDataURL(url, {
      width: 300,
      margin: 2,
      errorCorrectionLevel: "H",
      color: {
        dark: "#000000",
        light: "#ffffff",
      },
    });
  } catch (error) {
    console.error("Error generating QR code:", error);
    return null;
  }
};

// Generate QR code for a table
export const generateTableQRUrl = (
  baseUrl,
  restaurantId,
  tableId,
  formId = null
) => {
  let url = `${baseUrl}/${restaurantId}?table=${tableId}`;

  // If a specific feedback form is provided, add it to the URL
  if (formId) {
    url += `&formId=${formId}`;
  }

  return url;
};
