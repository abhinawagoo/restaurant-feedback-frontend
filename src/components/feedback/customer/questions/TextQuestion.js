// src/components/feedback/customer/questions/TextQuestion.js
"use client";

import { Textarea } from "@/components/ui/textarea";

export default function TextQuestion({ question, value = "", onChange }) {
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <h2 className="text-xl font-medium">
          {question.text}
          {question.required && <span className="text-red-500 ml-1">*</span>}
        </h2>
        {question.description && (
          <p className="text-gray-500">{question.description}</p>
        )}
      </div>

      <div className="pt-2">
        <Textarea
          placeholder={
            question.settings?.placeholder || "Enter your answer here..."
          }
          value={value}
          onChange={(e) => onChange(e.target.value)}
          rows={question.settings?.rows || 4}
          className="w-full"
        />
      </div>
    </div>
  );
}
