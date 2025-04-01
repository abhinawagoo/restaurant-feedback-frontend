// // src/components/feedback/customer/CustomerFeedbackForm.js
// 'use client';

// import { useState, useEffect } from 'react';
// import { useRouter, useSearchParams } from 'next/navigation';
// import { Button } from '@/components/ui/button';
// import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
// import { Progress } from '@/components/ui/progress';
// import { feedbackService, restaurantService } from '@/lib/api';
// import { toast } from 'sonner';
// import RatingQuestion from './questions/RatingQuestion';
// import TextQuestion from './questions/TextQuestion';
// import MultipleChoiceQuestion from './questions/MultipleChoiceQuestion';
// import CheckboxQuestion from './questions/CheckboxQuestion';
// import DropdownQuestion from './questions/DropdownQuestion';
// import GoogleReviewSummary from './GoogleReviewSummary';

// export default function CustomerFeedbackForm({ formId, restaurantId, visitId, onComplete }) {
//   const searchParams = useSearchParams();
//   const phoneNumber = searchParams.get('phone');
//   const router = useRouter();

//   const [form, setForm] = useState(null);
//   const [restaurant, setRestaurant] = useState(null);
//   const [questions, setQuestions] = useState([]);
//   const [currentStep, setCurrentStep] = useState(0);
//   const [answers, setAnswers] = useState({});
//   const [loading, setLoading] = useState(true);
//   const [submitting, setSubmitting] = useState(false);
//   const [completed, setCompleted] = useState(false);
//   const [feedbackId, setFeedbackId] = useState(null);

//   useEffect(() => {
//     async function loadData() {
//       try {
//         if (!formId) {
//           toast.error('Feedback form not specified');
//           return;
//         }

//         // Load restaurant data
//         const restaurantResponse = await restaurantService.getRestaurantPublic(restaurantId);
//         setRestaurant(restaurantResponse.data.data);

//         // Load form data
//         const response = await feedbackService.getFeedbackForm(formId);
//         setForm(response.data.data.form);
//         setQuestions(response.data.data.questions);
//       } catch (error) {
//         console.error('Error loading feedback form', error);
//         toast.error('Failed to load feedback form');
//       } finally {
//         setLoading(false);
//       }
//     }

//     loadData();
//   }, [formId, restaurantId]);

//   const handleAnswer = (questionId, value) => {
//     setAnswers((prev) => ({
//       ...prev,
//       [questionId]: value,
//     }));
//   };

//   const handleNext = () => {
//     const currentQuestion = questions[currentStep];

//     // Check if current question is required and has an answer
//     if (currentQuestion.required && !answers[currentQuestion._id]) {
//       toast.error('Please answer this question to continue');
//       return;
//     }

//     if (currentStep < questions.length - 1) {
//       setCurrentStep(currentStep + 1);
//     } else {
//       handleSubmit();
//     }
//   };

//   const handleBack = () => {
//     if (currentStep > 0) {
//       setCurrentStep(currentStep - 1);
//     }
//   };

//   const handleSubmit = async () => {
//     setSubmitting(true);

//     try {
//       const response = await feedbackService.submitFeedback(formId, {
//         answers,
//         restaurantId,
//         customerVisitId: visitId || null,
//         customerPhone: phoneNumber || null
//       });

//       setFeedbackId(response.data.data.responseId);
//       setCompleted(true);
//       toast.success('Thank you for your feedback!');

//       if (onComplete) {
//         onComplete(response.data.data);
//       }
//     } catch (error) {
//       console.error('Error submitting feedback', error);
//       toast.error('Failed to submit feedback. Please try again.');
//       setSubmitting(false);
//     }
//   };

//   if (loading) {
//     return (
//       <div className="flex justify-center p-8">
//         <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-stone-700"></div>
//       </div>
//     );
//   }

//   if (!form || !questions || questions.length === 0) {
//     return (
//       <Card className="w-full max-w-lg mx-auto">
//         <CardHeader>
//           <CardTitle>Feedback Form Not Available</CardTitle>
//         </CardHeader>
//         <CardContent>
//           <p className="text-gray-500">Sorry, this feedback form is not available.</p>
//         </CardContent>
//         <CardFooter>
//           <Button onClick={() => router.back()}>Go Back</Button>
//         </CardFooter>
//       </Card>
//     );
//   }

//   if (completed) {
//     return (
//       <GoogleReviewSummary
//         restaurantId={restaurantId}
//         restaurant={restaurant}
//         feedbackId={feedbackId}
//         feedbackData={{
//           form,
//           questions,
//           answers
//         }}
//         onDone={() => router.push(`/${restaurantId}`)}
//       />
//     );
//   }

//   const currentQuestion = questions[currentStep];
//   const progressPercentage = ((currentStep + 1) / questions.length) * 100;

//   return (
//     <Card className="w-full max-w-lg mx-auto">
//       <CardHeader>
//         <div className="flex justify-between items-center mb-2">
//           <CardTitle>{form.name}</CardTitle>
//           <span className="text-sm text-gray-500">
//             {currentStep + 1} of {questions.length}
//           </span>
//         </div>
//         <Progress value={progressPercentage} className="h-2" />
//       </CardHeader>

//       <CardContent>
//         <div className="py-4">
//           {currentQuestion.type === 'rating' && (
//             <RatingQuestion
//               question={currentQuestion}
//               value={answers[currentQuestion._id]}
//               onChange={(value) => handleAnswer(currentQuestion._id, value)}
//             />
//           )}

//           {currentQuestion.type === 'text' && (
//             <TextQuestion
//               question={currentQuestion}
//               value={answers[currentQuestion._id]}
//               onChange={(value) => handleAnswer(currentQuestion._id, value)}
//             />
//           )}

//           {currentQuestion.type === 'multiplechoice' && (
//             <MultipleChoiceQuestion
//               question={currentQuestion}
//               value={answers[currentQuestion._id]}
//               onChange={(value) => handleAnswer(currentQuestion._id, value)}
//             />
//           )}

//           {currentQuestion.type === 'checkbox' && (
//             <CheckboxQuestion
//               question={currentQuestion}
//               value={answers[currentQuestion._id] || []}
//               onChange={(value) => handleAnswer(currentQuestion._id, value)}
//             />
//           )}

//           {currentQuestion.type === 'dropdown' && (
//             <DropdownQuestion
//               question={currentQuestion}
//               value={answers[currentQuestion._id]}
//               onChange={(value) => handleAnswer(currentQuestion._id, value)}
//             />
//           )}
//         </div>
//       </CardContent>

//       <CardFooter className="flex justify-between">
//         <Button
//           variant="outline"
//           onClick={handleBack}
//           disabled={currentStep === 0 || submitting}
//         >
//           Back
//         </Button>

//         <Button
//           onClick={handleNext}
//           disabled={submitting}
//         >
//           {submitting ? 'Submitting...' : currentStep < questions.length - 1 ? 'Next' : 'Submit'}
//         </Button>
//       </CardFooter>
//     </Card>
//   );
// }

// src/components/feedback/customer/CustomerFeedbackForm.js
"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { feedbackService, restaurantService } from "@/lib/api";
import { toast } from "sonner";
import RatingQuestion from "./questions/RatingQuestion";
import TextQuestion from "./questions/TextQuestion";
import MultipleChoiceQuestion from "./questions/MultipleChoiceQuestion";
import CheckboxQuestion from "./questions/CheckboxQuestion";
import DropdownQuestion from "./questions/DropdownQuestion";
import GoogleReviewSummary from "./GoogleReviewSummary";

export default function CustomerFeedbackForm({
  formId,
  restaurantId,
  visitId,
  onComplete,
}) {
  const searchParams = useSearchParams();
  const phoneNumber = searchParams.get("phone");
  const router = useRouter();

  const [form, setForm] = useState(null);
  const [restaurant, setRestaurant] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [completed, setCompleted] = useState(false);
  const [feedbackId, setFeedbackId] = useState(null);

  useEffect(() => {
    async function loadData() {
      try {
        if (!formId) {
          toast.error("Feedback form not specified");
          return;
        }

        // Load restaurant data
        const restaurantResponse = await restaurantService.getRestaurantPublic(
          restaurantId
        );
        setRestaurant(restaurantResponse.data.data);

        // Load form data
        const response = await feedbackService.getFeedbackForm(formId);
        setForm(response.data.data.form);
        setQuestions(response.data.data.questions);
      } catch (error) {
        console.error("Error loading feedback form", error);
        toast.error("Failed to load feedback form");
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, [formId, restaurantId]);

  const handleAnswer = (questionId, value) => {
    setAnswers((prev) => ({
      ...prev,
      [questionId]: value,
    }));
  };

  const handleNext = () => {
    const currentQuestion = questions[currentStep];

    // Check if current question is required and has an answer
    if (currentQuestion.required && !answers[currentQuestion._id]) {
      toast.error("Please answer this question to continue");
      return;
    }

    if (currentStep < questions.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      handleSubmit();
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = async () => {
    setSubmitting(true);

    try {
      const response = await feedbackService.submitFeedback(formId, {
        answers,
        restaurantId,
        customerVisitId: visitId || null,
        customerPhone: phoneNumber || null,
      });

      setFeedbackId(response.data.data.responseId);
      setCompleted(true);
      toast.success("Thank you for your feedback!");

      if (onComplete) {
        onComplete(response.data.data);
      }
    } catch (error) {
      console.error("Error submitting feedback", error);
      toast.error("Failed to submit feedback. Please try again.");
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-stone-700"></div>
      </div>
    );
  }

  if (!form || !questions || questions.length === 0) {
    return (
      <Card className="w-full max-w-lg mx-auto">
        <CardHeader>
          <CardTitle>Feedback Form Not Available</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-500">
            Sorry, this feedback form is not available.
          </p>
        </CardContent>
        <CardFooter>
          <Button onClick={() => router.back()}>Go Back</Button>
        </CardFooter>
      </Card>
    );
  }

  if (completed) {
    return (
      <GoogleReviewSummary
        restaurantId={restaurantId}
        restaurant={restaurant}
        feedbackId={feedbackId}
        feedbackData={{
          form,
          questions,
          answers,
        }}
        onDone={() => router.push(`/${restaurantId}`)}
      />
    );
  }

  const currentQuestion = questions[currentStep];
  const progressPercentage = ((currentStep + 1) / questions.length) * 100;

  return (
    <Card className="w-full max-w-lg mx-auto">
      <CardHeader>
        <div className="flex justify-between items-center mb-2">
          <CardTitle>{form.name}</CardTitle>
          <span className="text-sm text-gray-500">
            {currentStep + 1} of {questions.length}
          </span>
        </div>
        <Progress value={progressPercentage} className="h-2" />
      </CardHeader>

      <CardContent>
        <div className="py-4">
          {currentQuestion.type === "rating" && (
            <RatingQuestion
              question={currentQuestion}
              value={answers[currentQuestion._id]}
              onChange={(value) => handleAnswer(currentQuestion._id, value)}
            />
          )}

          {currentQuestion.type === "text" && (
            <TextQuestion
              question={currentQuestion}
              value={answers[currentQuestion._id]}
              onChange={(value) => handleAnswer(currentQuestion._id, value)}
            />
          )}

          {currentQuestion.type === "multiplechoice" && (
            <MultipleChoiceQuestion
              question={currentQuestion}
              value={answers[currentQuestion._id]}
              onChange={(value) => handleAnswer(currentQuestion._id, value)}
            />
          )}

          {currentQuestion.type === "checkbox" && (
            <CheckboxQuestion
              question={currentQuestion}
              value={answers[currentQuestion._id] || []}
              onChange={(value) => handleAnswer(currentQuestion._id, value)}
            />
          )}

          {currentQuestion.type === "dropdown" && (
            <DropdownQuestion
              question={currentQuestion}
              value={answers[currentQuestion._id]}
              onChange={(value) => handleAnswer(currentQuestion._id, value)}
            />
          )}
        </div>
      </CardContent>

      <CardFooter className="flex justify-between">
        <Button
          variant="outline"
          onClick={handleBack}
          disabled={currentStep === 0 || submitting}
        >
          Back
        </Button>

        <Button onClick={handleNext} disabled={submitting}>
          {submitting
            ? "Submitting..."
            : currentStep < questions.length - 1
            ? "Next"
            : "Submit"}
        </Button>
      </CardFooter>
    </Card>
  );
}
