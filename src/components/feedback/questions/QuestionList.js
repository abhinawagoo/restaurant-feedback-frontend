// src/components/feedback/questions/QuestionList.js
"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { feedbackService } from "@/lib/api";
import {
  Pencil,
  Trash2,
  GripVertical,
  Star,
  MessageSquare,
  List,
  CheckSquare,
  ChevronDown,
} from "lucide-react";

const questionTypeIcons = {
  rating: <Star className="h-4 w-4" />,
  text: <MessageSquare className="h-4 w-4" />,
  multiplechoice: <List className="h-4 w-4" />,
  checkbox: <CheckSquare className="h-4 w-4" />,
  dropdown: <ChevronDown className="h-4 w-4" />,
};

const questionTypeLabels = {
  rating: "Rating",
  text: "Text Input",
  multiplechoice: "Multiple Choice",
  checkbox: "Checkbox",
  dropdown: "Dropdown",
};

export default function QuestionList({
  formId,
  questions = [],
  onEdit,
  onDelete,
  onReorder,
}) {
  if (!questions || questions.length === 0) {
    return (
      <div className="text-center py-12 border rounded-lg bg-gray-50">
        <MessageSquare className="h-12 w-12 mx-auto text-gray-400 mb-4" />
        <h3 className="text-lg font-medium mb-2">No Questions Yet</h3>
        <p className="text-gray-500 mb-6">
          Add questions to your feedback form
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {questions.map((question) => (
        <Card key={question._id} className="relative">
          <CardHeader className="pb-2 flex flex-row items-start">
            <div className="mr-2 mt-1 cursor-move opacity-50">
              <GripVertical className="h-5 w-5" />
            </div>
            <div className="flex-1">
              <div className="flex justify-between items-start">
                <CardTitle className="text-base flex items-center">
                  {question.text}
                  {question.required && (
                    <span className="ml-2 text-red-500 text-xs">*</span>
                  )}
                </CardTitle>
                <div className="flex items-center space-x-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => onEdit(question)}
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => onDelete(question._id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              {question.description && (
                <p className="text-sm text-gray-500 mt-1">
                  {question.description}
                </p>
              )}
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex items-center text-sm text-gray-600">
              <div className="bg-stone-100 rounded-full p-1 mr-2">
                {questionTypeIcons[question.type]}
              </div>
              <span>{questionTypeLabels[question.type]}</span>
              <div className="ml-6">
                {question.type === "rating" && (
                  <div className="flex items-center">
                    {Array(5)
                      .fill(0)
                      .map((_, i) => (
                        <Star key={i} className="h-4 w-4 text-amber-400" />
                      ))}
                  </div>
                )}
                {["multiplechoice", "checkbox", "dropdown"].includes(
                  question.type
                ) &&
                  question.options && (
                    <div className="text-xs text-gray-500">
                      {Array.isArray(question.options)
                        ? `${question.options.length} options`
                        : "Options defined"}
                    </div>
                  )}
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
