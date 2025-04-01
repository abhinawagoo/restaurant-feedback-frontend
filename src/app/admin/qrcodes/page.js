
// src/app/admin/qrcodes/page.js
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import AdminLayout from "@/components/layout/AdminLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Plus,
  Printer,
  Download,
  QrCode,
  Trash,
  ExternalLink,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { feedbackService, tableService } from "@/lib/api";
import { toast } from "sonner";
import CreateTableModal from "@/components/qrcode/CreateTableModal";
import { generateQRDataURL, generateTableQRUrl } from "@/utils/qrCodeGenerator";

// Dynamically import the QR code component with no SSR
const TableQRCode = dynamic(() => import("@/components/qrcode/TableQRCode"), {
  ssr: false,
  loading: () => (
    <div className="w-[180px] h-[180px] bg-gray-100 animate-pulse rounded" />
  ),
});


export default function QRCodeManagementPage() {
  const { user } = useAuth();
  const [tables, setTables] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [refreshKey, setRefreshKey] = useState(0);
  const [defaultFormId, setDefaultFormId] = useState(null);
  const router = useRouter();
  const baseUrl = typeof window !== "undefined" ? window.location.origin : "";
  useEffect(() => {
    async function loadTablesAndForm() {
      if (!user?.restaurantId) return;

      setLoading(true);
      try {
        // Simulate API delay for tables
        // await new Promise((resolve) => setTimeout(resolve, 500));
        // setTables(mockTables);

        // Load actual tables from API
        const tablesResponse = await tableService.getTables(user.restaurantId);
        console.log("Tables response:", tablesResponse); // Log the entire response for debugging

        if (tablesResponse.data && tablesResponse.data.success) {
          setTables(tablesResponse.data.tables);
        } else {
          toast.error("Failed to load tables");
        }

        // Load default feedback form
        const response = await feedbackService.getFeedbackForms(
          user.restaurantId
        );
        const forms = response.data.data;

        if (forms && forms.length > 0) {
          const defaultForm = forms.find((form) => form.isDefault) || forms[0];
          setDefaultFormId(defaultForm._id);
        }
      } catch (error) {
        console.error("Error loading data", error);
        toast.error("Failed to load data");
      } finally {
        setLoading(false);
      }
    }

    loadTablesAndForm();
  }, [user, refreshKey]);

  

  const handleCreateTable = async (data) => {
    try {
      setLoading(true); // Add a loading state if you haven't already

      // Get restaurant ID from state or context
      const restaurantId = user.restaurantId; // Adjust according to your app structure

      // Make the API call to create a table
      const response = await tableService.createTable({
        restaurantId,
        tableNumber: data.tableNumber,
      });
      // console.log("Create table response:", response); // Log the entire response for debugging
      // Check if the request was successful
      if (response.data.success) {
        // Add the new table to the state
        setTables([...tables, response.data.table]);
        setShowModal(false);
        toast.success("Table created successfully");
      } else {
        // Handle error from API
        toast.error(response.message || "Failed to create table");
      }
    } catch (error) {
      console.error("Error creating table:", error);
      toast.error("Failed to create table. Please try again.");
    } finally {
      setLoading(false); // Reset loading state
    }
  };


  const handleDeleteTable = async (tableId) => {
    try {
      // Get the restaurantId from your state or context
      const restaurantId = user.restaurantId; // Adjust based on how you store the current restaurant

      // Call the API service to delete the table
      await tableService.deleteTable(restaurantId, tableId);

      // Update the local state after successful deletion
      setTables(tables.filter((table) => table._id !== tableId));

      // Show success message
      toast.success("Table deleted successfully");
    } catch (error) {
      // Handle errors
      console.error("Error deleting table:", error);
      toast.error(error.response?.data?.message || "Failed to delete table");
    }
  };

  const handlePrint = (tableId) => {
    const tableElement = document.getElementById(`table-qr-${tableId}`);
    if (tableElement) {
      const printWindow = window.open("", "_blank");
      printWindow.document.write(`
        <html>
          <head>
            <title>Print QR Code - ${
              tables.find((t) => t._id === tableId)?.tableNumber || "Table"
            }</title>
            <style>
              body { font-family: Arial, sans-serif; margin: 0; padding: 20px; text-align: center; }
              .container { max-width: 400px; margin: 0 auto; padding: 20px; border: 1px solid #ccc; }
              img { max-width: 100%; height: auto; }
              h3 { margin-top: 10px; }
              p { color: #666; font-size: 14px; }
            </style>
          </head>
          <body>
            <div class="container">
              ${tableElement.outerHTML}
              <p>Scan this QR code to view our menu and give feedback</p>
            </div>
            <script>
              window.onload = function() { window.print(); }
            </script>
          </body>
        </html>
      `);
      printWindow.document.close();
    } else {
      toast.error("Could not print QR code");
    }
  };

  const handleDownload = async (tableId, tableNumber) => {
    try {
      const table = tables.find((t) => t._id === tableId);
      if (!table) throw new Error("Table not found");

      const qrUrl = generateTableQRUrl(
        baseUrl,
        user?.restaurantId,
        tableId,
        defaultFormId
      );
      const dataUrl = await generateQRDataURL(qrUrl);

      if (dataUrl) {
        const link = document.createElement("a");
        link.href = dataUrl;
        link.download = `${tableNumber.replace(/\s+/g, "-")}-QR.png`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      } else {
        throw new Error("Failed to generate QR code");
      }
    } catch (error) {
      console.error("Download error:", error);
      toast.error("Failed to download QR code");
    }
  };

  const handlePreviewQR = (tableId) => {
    // Navigate to the customer view for this table
    window.open(`${baseUrl}/${user?.restaurantId}?table=${tableId}`, "_blank");
  };

  // Filter tables based on search term
  const filteredTables = searchTerm
    ? tables.filter((table) =>
        table.tableNumber.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : tables;

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">QR Code Management</h1>
            <p className="text-gray-500">
              Generate and manage QR codes for your tables
            </p>
          </div>
          <Button onClick={() => setShowModal(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Add New Table
          </Button>
        </div>

        <div className="bg-white p-6 rounded-lg shadow space-y-6">
          <div className="flex justify-between items-center">
            <Input
              placeholder="Search tables..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="max-w-xs"
            />
            <span className="text-sm text-gray-500">
              {filteredTables.length} table
              {filteredTables.length !== 1 ? "s" : ""}
            </span>
          </div>

          {loading ? (
            <div className="flex justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-stone-700"></div>
            </div>
          ) : filteredTables.length === 0 ? (
            <div className="text-center py-12">
              <QrCode className="h-12 w-12 mx-auto text-gray-400 mb-4" />
              <h3 className="text-lg font-medium mb-2">No Tables Found</h3>
              <p className="text-gray-500 mb-6">
                {searchTerm
                  ? "No tables match your search"
                  : "Add your first table to generate QR codes"}
              </p>
              {!searchTerm && (
                <Button onClick={() => setShowModal(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add New Table
                </Button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredTables.map((table) => (
                <Card key={table._id} className="overflow-hidden">
                  <CardHeader className="pb-3">
                    <CardTitle>{table.tableNumber}</CardTitle>
                  </CardHeader>
                  <CardContent className="flex justify-center p-6 bg-gray-50">
                    <div id={`table-qr-${table._id}`}>
                      <TableQRCode
                        url={generateTableQRUrl(
                          baseUrl,
                          user?.restaurantId || "demo",
                          table._id,
                          defaultFormId
                        )}
                        tableNumber={table.tableNumber}
                      />
                    </div>
                  </CardContent>
                  <CardFooter className="flex flex-col pt-6 space-y-3">
                    <div className="flex w-full space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1"
                        onClick={() => handlePrint(table._id)}
                      >
                        <Printer className="h-4 w-4 mr-2" />
                        Print
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1"
                        onClick={() =>
                          handleDownload(table._id, table.tableNumber)
                        }
                      >
                        <Download className="h-4 w-4 mr-2" />
                        Download
                      </Button>
                    </div>

                    <div className="flex w-full space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1"
                        onClick={() => handlePreviewQR(table._id)}
                      >
                        <ExternalLink className="h-4 w-4 mr-2" />
                        Preview
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-red-500 hover:text-red-700 hover:bg-red-50 flex-1"
                        onClick={() => handleDeleteTable(table._id)}
                      >
                        <Trash className="h-4 w-4 mr-2" />
                        Delete
                      </Button>
                    </div>
                  </CardFooter>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>

      <CreateTableModal
        open={showModal}
        onClose={() => setShowModal(false)}
        onSubmit={handleCreateTable}
      />
    </AdminLayout>
  );
}
