// src/components/feedback/questions/CreateQuestionModal.js
"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { feedbackService } from "@/lib/api";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { X } from "lucide-react";

// Form validation schema
const formSchema = z.object({
  text: z.string().min(1, "Question text is required"),
  description: z.string().optional(),
  type: z.enum(["rating", "text", "multiplechoice", "checkbox", "dropdown"]),
  required: z.boolean().default(true),
  options: z.array(z.string()).optional(),
});

export default function CreateQuestionModal({
  open,
  onClose,
  formId,
  onSuccess,
  editQuestion = null,
}) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [options, setOptions] = useState([]);
  const [newOption, setNewOption] = useState("");
  const isEditMode = !!editQuestion;

  // Initialize form
  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      text: "",
      description: "",
      type: "rating",
      required: true,
      options: [],
    },
  });

  // Set form values when editing a question
  useEffect(() => {
    if (editQuestion) {
      form.reset({
        text: editQuestion.text || "",
        description: editQuestion.description || "",
        type: editQuestion.type || "rating",
        required:
          editQuestion.required !== undefined ? editQuestion.required : true,
      });

      if (editQuestion.options && Array.isArray(editQuestion.options)) {
        setOptions(editQuestion.options);
      }
    } else {
      form.reset({
        text: "",
        description: "",
        type: "rating",
        required: true,
      });
      setOptions([]);
    }
  }, [editQuestion, form]);

  const watchType = form.watch("type");

  const handleAddOption = () => {
    if (newOption.trim() && !options.includes(newOption.trim())) {
      setOptions([...options, newOption.trim()]);
      setNewOption("");
    }
  };

  const handleRemoveOption = (index) => {
    setOptions(options.filter((_, i) => i !== index));
  };

  // Form submission handler
  const onSubmit = async (data) => {
    if (!formId) {
      toast.error("Form ID is missing");
      return;
    }

    // Add options to data if needed
    if (["multiplechoice", "checkbox", "dropdown"].includes(data.type)) {
      if (options.length === 0) {
        toast.error("Please add at least one option");
        return;
      }
      data.options = options;
    }

    setIsSubmitting(true);

    try {
      await feedbackService.addQuestion(formId, data);
      toast.success(
        `Question ${isEditMode ? "updated" : "added"} successfully`
      );
      form.reset();
      setOptions([]);
      onSuccess();
    } catch (error) {
      console.error("Error saving question", error);
      toast.error(error.response?.data?.message || "Failed to save question");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>
            {isEditMode ? "Edit Question" : "Add New Question"}
          </DialogTitle>
          <DialogDescription>
            {isEditMode
              ? "Update this question in your feedback form"
              : "Add a new question to your feedback form"}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="text"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Question Text</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="How would you rate your experience?"
                      disabled={isSubmitting}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description (Optional)</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Additional information about the question"
                      disabled={isSubmitting}
                      {...field}
                      value={field.value || ""}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Question Type</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                    disabled={isSubmitting}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select question type" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="rating">Rating Stars</SelectItem>
                      <SelectItem value="text">Text Input</SelectItem>
                      <SelectItem value="multiplechoice">
                        Multiple Choice
                      </SelectItem>
                      <SelectItem value="checkbox">
                        Checkbox (Multiple Selection)
                      </SelectItem>
                      <SelectItem value="dropdown">Dropdown</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {["multiplechoice", "checkbox", "dropdown"].includes(watchType) && (
              <div className="space-y-4 p-4 border rounded-md">
                <FormLabel>Options</FormLabel>
                <div className="flex items-center space-x-2">
                  <Input
                    placeholder="Add an option"
                    value={newOption}
                    onChange={(e) => setNewOption(e.target.value)}
                    disabled={isSubmitting}
                  />
                  <Button
                    type="button"
                    onClick={handleAddOption}
                    disabled={isSubmitting || !newOption.trim()}
                  >
                    Add
                  </Button>
                </div>

                {options.length > 0 ? (
                  <div className="space-y-2">
                    {options.map((option, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between p-2 bg-gray-50 rounded"
                      >
                        <span>{option}</span>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => handleRemoveOption(index)}
                          disabled={isSubmitting}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-gray-500">No options added yet</p>
                )}
              </div>
            )}

            <FormField
              control={form.control}
              name="required"
              render={({ field }) => (
                <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                      disabled={isSubmitting}
                    />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel>Required Question</FormLabel>
                    <FormDescription>
                      Mark if this question must be answered
                    </FormDescription>
                  </div>
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting
                  ? "Saving..."
                  : isEditMode
                  ? "Update Question"
                  : "Add Question"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
