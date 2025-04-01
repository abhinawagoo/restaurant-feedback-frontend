// src/components/feedback/customer/questions/DropdownQuestion.js
"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function DropdownQuestion({ question, value = "", onChange }) {
  const options = Array.isArray(question.options) ? question.options : [];

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
        <Select value={value} onValueChange={onChange}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Select an option" />
          </SelectTrigger>
          <SelectContent>
            {options.map((option, index) => (
              <SelectItem key={index} value={option}>
                {option}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
