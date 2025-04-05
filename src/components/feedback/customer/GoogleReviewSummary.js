// src/components/feedback/customer/GoogleReviewSummary.js
"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";

export default function GoogleReviewSummary({
  restaurantId,
  restaurant,
  feedbackId,
  feedbackData,
  onDone,
}) {
  const [generatedReview, setGeneratedReview] = useState("");
  const [editableReview, setEditableReview] = useState("");
  const [generatingReview, setGeneratingReview] = useState(true);

  useEffect(() => {
    // Generate the review on component mount
    generateAIReview();
  }, []);

  const generateAIReview = async () => {
    setGeneratingReview(true);

    try {
      // Extract data for review generation
      const { form, questions, answers } = feedbackData;
      console.log(feedbackData);

      // In a real app, this would call the OpenAI API
      // For this demo, we&apos;ll generate a simple review based on the ratings

      // Extract ratings
      const ratingQuestions = questions.filter((q) => q.type === "rating");
      const ratingAnswers = ratingQuestions.map((q) => {
        const rating = answers[q._id] || 0;
        return { question: q.text, rating };
      });

      const averageRating =
        ratingAnswers.reduce((sum, item) => sum + item.rating, 0) /
        (ratingAnswers.length || 1);

      // Extract text responses
      const textQuestions = questions.filter((q) => q.type === "text");
      const textAnswers = textQuestions.map((q) => {
        const answer = answers[q._id] || "";
        return { question: q.text, answer };
      });

      // Generate review text based on sentiment
      let reviewText = "";
      const restaurantName = restaurant?.name || "this restaurant";

      if (averageRating >= 4) {
        reviewText = `I had a great experience at ${restaurantName}! `;

        if (ratingAnswers.length > 0) {
          const highestRated = [...ratingAnswers].sort(
            (a, b) => b.rating - a.rating
          )[0];
          reviewText += `I was particularly impressed with ${highestRated.question
            .toLowerCase()
            .replace("how would you rate ", "")
            .replace("?", "")}. `;
        }

        // Add some specific details if available
        const specificDetails = textAnswers.find(
          (t) => t.answer && t.answer.length > 5
        );
        if (specificDetails) {
          reviewText += `${specificDetails.answer} `;
        }

        reviewText += `I would definitely recommend this place to others.`;
      } else if (averageRating >= 3) {
        reviewText = `I had a decent experience at ${restaurantName}. `;

        if (ratingAnswers.length > 0) {
          const highestRated = [...ratingAnswers].sort(
            (a, b) => b.rating - a.rating
          )[0];
          reviewText += `The ${highestRated.question
            .toLowerCase()
            .replace("how would you rate ", "")
            .replace("?", "")} was good. `;
        }

        // Add some specific details if available
        const specificDetails = textAnswers.find(
          (t) => t.answer && t.answer.length > 5
        );
        if (specificDetails) {
          reviewText += `${specificDetails.answer} `;
        }

        reviewText += `It&apos;s worth a visit if you&apos;re in the area.`;
      } else {
        reviewText = `My experience at ${restaurantName} was below expectations. `;

        if (ratingAnswers.length > 0) {
          const lowestRated = [...ratingAnswers].sort(
            (a, b) => a.rating - b.rating
          )[0];
          reviewText += `I was disappointed with the ${lowestRated.question
            .toLowerCase()
            .replace("how would you rate ", "")
            .replace("?", "")}. `;
        }

        // Add some specific details if available
        const specificDetails = textAnswers.find(
          (t) => t.answer && t.answer.length > 5
        );
        if (specificDetails) {
          reviewText += `${specificDetails.answer} `;
        }

        reviewText += `I hope they can improve in the future.`;
      }

      // In a real app, this would come from the backend AI service
      setGeneratedReview(reviewText);
      setEditableReview(reviewText);

      // Simulate API delay
      await new Promise((resolve) => setTimeout(resolve, 1000));
    } catch (error) {
      console.error("Error generating review", error);
      // Fallback to a simple template
      const fallbackReview = `Thanks for the great experience at this restaurant! I enjoyed my visit.`;
      setGeneratedReview(fallbackReview);
      setEditableReview(fallbackReview);
    } finally {
      setGeneratingReview(false);
    }
  };

  const handleReviewEdit = (e) => {
    setEditableReview(e.target.value);
  };

  // const handlePostToGoogle = () => {
  //   // In a real app, you would:
  //   // 1. Save the edited review to your database
  //   // 2. Use the Google Place API to navigate users to the review form
  //   const googleReviewUrl = `https://search.google.com/local/writereview?placeid=${
  //     restaurant?.googlePlaceId || "ChIJ..."
  //   }`;

  //   // Optional: Add review text as a parameter if the API allows
  //   const encodedReview = encodeURIComponent(editableReview);
  //   const urlWithReview = `${googleReviewUrl}&review=${encodedReview}`;

  //   // Open Google review page in new tab
  //   window.open(urlWithReview, "_blank");

  //   // Mark as submitted
  //   toast.success("Opening Google review page");

  //   // In a real app, you would also update the database to mark this feedback as submitted to Google
  // };

  const handlePostToGoogle = () => {
    // Check if the editable review is empty
    if (!editableReview.trim()) {
      toast.error(
        "Review content is empty. Please edit the review before posting."
      );
      return;
    }

    // Use a valid Google Place ID for testing
    const googlePlaceId =
      restaurant?.googlePlaceId || "ChIJN1t_tDeuEmsRUsoyG83frY4"; // Example: Sydney Opera House

    // Construct the Google review URL
    const googleReviewUrl = `https://search.google.com/local/writereview?placeid=${googlePlaceId}`;

    // Encode the review text (optional, depending on Google API support)
    const encodedReview = encodeURIComponent(editableReview);
    const urlWithReview = `${googleReviewUrl}&review=${encodedReview}`;

    // Open the Google review page in a new tab
    window.open(urlWithReview, "_blank");

    // Show a success toast message
    toast.success("Opening Google review page. Please submit your review.");

    // In a real app, update the database to mark this feedback as submitted to Google
  };

  return (
    <Card className="w-full max-w-lg mx-auto">
      <CardHeader>
        <CardTitle className="text-center">
          {feedbackData.form.thankYouMessage || "Thank you for your feedback!"}
        </CardTitle>
        <CardDescription className="text-center">
          We appreciate your time and valuable feedback
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="pt-2">
          <h3 className="text-lg font-medium mb-4">Review Summary</h3>
          {generatingReview ? (
            <div className="flex flex-col items-center py-4 space-y-2">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-stone-700"></div>
              <p className="text-sm text-gray-500">
                Generating your review summary...
              </p>
            </div>
          ) : (
            <>
              <Textarea
                value={editableReview}
                onChange={handleReviewEdit}
                placeholder="Your review..."
                rows={5}
                className="mb-2"
              />

              <Button
                className="mt-2"
                onClick={() => {
                  navigator.clipboard.writeText(editableReview);
                  toast.success("Review copied to clipboard!");
                }}
              >
                Copy to Clipboard
              </Button>
            </>
          )}
          <p className="text-sm text-gray-500 mt-1">
            You can edit this review before posting to Google
          </p>
        </div>

        <div className="pt-4">
          <h3 className="text-lg font-medium mb-4">
            Share Your Experience on Google
          </h3>
          <Button
            className="w-full bg-white hover:bg-gray-100 text-gray-800 font-semibold py-2 px-4 border border-gray-400 rounded shadow flex items-center justify-center"
            onClick={handlePostToGoogle}
            disabled={generatingReview}
          >
            <svg className="h-5 w-5 mr-2" viewBox="0 0 24 24">
              <path
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                fill="#4285F4"
              />
              <path
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                fill="#34A853"
              />
              <path
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                fill="#FBBC05"
              />
              <path
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                fill="#EA4335"
              />
            </svg>
            Post to Google Reviews
          </Button>
        </div>
      </CardContent>
      <CardFooter className="justify-center">
        <Button variant="outline" onClick={onDone} disabled={generatingReview}>
          Done
        </Button>
      </CardFooter>
    </Card>
  );
}
