// src/components/feedback/customer/questions/CheckboxQuestion.js
"use client";

import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";

export default function CheckboxQuestion({ question, value = [], onChange }) {
  const options = Array.isArray(question.options) ? question.options : [];

  const handleToggle = (option) => {
    const newValue = value.includes(option)
      ? value.filter((item) => item !== option)
      : [...value, option];

    onChange(newValue);
  };

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

      <div className="pt-2 space-y-3">
        {options.map((option, index) => (
          <div key={index} className="flex items-center space-x-2">
            <Checkbox
              id={`checkbox-${question._id}-${index}`}
              checked={value.includes(option)}
              onCheckedChange={() => handleToggle(option)}
            />
            <Label
              htmlFor={`checkbox-${question._id}-${index}`}
              className="cursor-pointer"
            >
              {option}
            </Label>
          </div>
        ))}
      </div>
    </div>
  );
}
