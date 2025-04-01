// src/components/feedback/customer/questions/RatingQuestion.js
"use client";

import { useState } from "react";
import { Star } from "lucide-react";

export default function RatingQuestion({ question, value = 0, onChange }) {
  const [hoverRating, setHoverRating] = useState(0);
  const maxRating = question.settings?.max || 5;

  const handleMouseEnter = (rating) => {
    setHoverRating(rating);
  };

  const handleMouseLeave = () => {
    setHoverRating(0);
  };

  const handleClick = (rating) => {
    onChange(rating);
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

      <div className="flex justify-center py-4">
        <div className="flex gap-2">
          {Array.from({ length: maxRating }, (_, i) => i + 1).map((rating) => (
            <button
              key={rating}
              type="button"
              className="focus:outline-none"
              onMouseEnter={() => handleMouseEnter(rating)}
              onMouseLeave={handleMouseLeave}
              onClick={() => handleClick(rating)}
            >
              <Star
                className={`h-8 w-8 ${
                  (hoverRating || value) >= rating
                    ? "fill-yellow-400 text-yellow-400"
                    : "text-gray-300"
                } transition-colors`}
              />
            </button>
          ))}
        </div>
      </div>

      {value > 0 && (
        <p className="text-center text-sm font-medium">
          {value} out of {maxRating} stars
        </p>
      )}
    </div>
  );
}
