// src/components/feedback/customer/questions/MultipleChoiceQuestion.js
"use client";

import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";

export default function MultipleChoiceQuestion({
  question,
  value = "",
  onChange,
}) {
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
        <RadioGroup
          value={value}
          onValueChange={onChange}
          className="space-y-3"
        >
          {options.map((option, index) => (
            <div key={index} className="flex items-center space-x-2">
              <RadioGroupItem
                value={option}
                id={`option-${question._id}-${index}`}
              />
              <Label
                htmlFor={`option-${question._id}-${index}`}
                className="cursor-pointer"
              >
                {option}
              </Label>
            </div>
          ))}
        </RadioGroup>
      </div>
    </div>
  );
}
