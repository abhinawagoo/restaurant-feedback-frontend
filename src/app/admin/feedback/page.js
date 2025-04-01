// src/app/admin/feedback/page.js
"use client";

import { useState } from "react";
import AdminLayout from "@/components/layout/AdminLayout";
import FeedbackFormList from "@/components/feedback/FeedbackFormList";
import CreateFormModal from "@/components/feedback/CreateFormModal";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

export default function FeedbackManagementPage() {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  const handleFormCreated = () => {
    setShowCreateModal(false);
    setRefreshKey((prev) => prev + 1);
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">Feedback Forms</h1>
            <p className="text-gray-500">Manage your customer feedback forms</p>
          </div>
          <Button onClick={() => setShowCreateModal(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Create New Form
          </Button>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <FeedbackFormList
            key={refreshKey}
            onCreateNew={() => setShowCreateModal(true)}
          />
        </div>

        <CreateFormModal
          open={showCreateModal}
          onClose={() => setShowCreateModal(false)}
          onSuccess={handleFormCreated}
        />
      </div>
    </AdminLayout>
  );
}
