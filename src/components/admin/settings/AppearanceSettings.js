// src/components/settings/AppearanceSettings.jsx
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import { restaurantService } from "@/lib/api";

// Form schema
const appearanceFormSchema = z.object({
  primaryColor: z.string().regex(/^#[0-9A-F]{6}$/i, {
    message: "Primary color must be a valid hex color code (e.g. #FF5733)",
  }),
  secondaryColor: z.string().regex(/^#[0-9A-F]{6}$/i, {
    message: "Secondary color must be a valid hex color code (e.g. #44403c)",
  }),
  fontFamily: z.string(),
  logoPosition: z.enum(["left", "center", "right"]),
  menuLayout: z.enum(["grid", "list"]),
});

const fontOptions = [
  { value: "Inter", label: "Inter" },
  { value: "Roboto", label: "Roboto" },
  { value: "Poppins", label: "Poppins" },
  { value: "Montserrat", label: "Montserrat" },
  { value: "Open Sans", label: "Open Sans" },
];

export default function AppearanceSettings({ restaurant, onUpdate }) {
  const [submitting, setSubmitting] = useState(false);

  // Preview states
  const [previewPrimary, setPreviewPrimary] = useState(
    restaurant?.primaryColor || "#78716c"
  );
  const [previewSecondary, setPreviewSecondary] = useState(
    restaurant?.secondaryColor || "#44403c"
  );

  // Initialize form with restaurant data
  const form = useForm({
    resolver: zodResolver(appearanceFormSchema),
    defaultValues: {
      primaryColor: restaurant?.primaryColor || "#78716c",
      secondaryColor: restaurant?.secondaryColor || "#44403c",
      fontFamily: restaurant?.fontFamily || "Inter",
      logoPosition: restaurant?.logoPosition || "left",
      menuLayout: restaurant?.menuLayout || "grid",
    },
  });

  // Handle form submission
  const onSubmit = async (data) => {
    setSubmitting(true);

    try {
      const response = await restaurantService.updateAppearance(data);

      if (response.success) {
        toast.success("Appearance settings updated successfully");
        onUpdate(); // Refresh data
      } else {
        throw new Error(
          response.message || "Failed to update appearance settings"
        );
      }
    } catch (error) {
      console.error("Error updating appearance settings:", error);
      toast.error(error.message || "Something went wrong");
    } finally {
      setSubmitting(false);
    }
  };

  // Preview color change
  const handleColorChange = (field, value) => {
    if (field === "primaryColor") {
      setPreviewPrimary(value);
    } else if (field === "secondaryColor") {
      setPreviewSecondary(value);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Appearance Settings</CardTitle>
            <CardDescription>
              Customize your restaurant's colors, fonts, and layout
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Colors Section */}
            <div className="space-y-4">
              <h3 className="text-base font-medium">Brand Colors</h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Primary Color */}
                <FormField
                  control={form.control}
                  name="primaryColor"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Primary Color</FormLabel>
                      <div className="flex items-center gap-4">
                        <div
                          className="h-10 w-10 rounded-md border"
                          style={{ backgroundColor: previewPrimary }}
                        />
                        <FormControl>
                          <Input
                            {...field}
                            type="text"
                            onChange={(e) => {
                              field.onChange(e.target.value);
                              handleColorChange("primaryColor", e.target.value);
                            }}
                          />
                        </FormControl>
                      </div>
                      <FormDescription>
                        Used for buttons, links, and highlights
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Secondary Color */}
                <FormField
                  control={form.control}
                  name="secondaryColor"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Secondary Color</FormLabel>
                      <div className="flex items-center gap-4">
                        <div
                          className="h-10 w-10 rounded-md border"
                          style={{ backgroundColor: previewSecondary }}
                        />
                        <FormControl>
                          <Input
                            {...field}
                            type="text"
                            onChange={(e) => {
                              field.onChange(e.target.value);
                              handleColorChange(
                                "secondaryColor",
                                e.target.value
                              );
                            }}
                          />
                        </FormControl>
                      </div>
                      <FormDescription>
                        Used for accents and secondary elements
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Preview */}
              <div className="rounded-md overflow-hidden border">
                <div
                  className="p-4 text-white flex items-center justify-between"
                  style={{ backgroundColor: previewPrimary }}
                >
                  <span className="font-medium">Preview Header</span>
                  <div
                    className="h-6 w-20 rounded-full"
                    style={{ backgroundColor: previewSecondary }}
                  ></div>
                </div>
                <div className="p-4 space-y-2">
                  <div
                    className="h-4 w-3/4 rounded"
                    style={{ backgroundColor: "#e5e7eb" }}
                  ></div>
                  <div
                    className="h-4 w-1/2 rounded"
                    style={{ backgroundColor: "#e5e7eb" }}
                  ></div>
                  <div
                    className="h-8 w-24 rounded mt-4 text-white flex items-center justify-center"
                    style={{ backgroundColor: previewPrimary }}
                  >
                    Button
                  </div>
                </div>
              </div>
            </div>

            <Separator />

            {/* Font Settings */}
            <div className="space-y-4">
              <h3 className="text-base font-medium">Typography</h3>

              <FormField
                control={form.control}
                name="fontFamily"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Font Family</FormLabel>
                    <FormControl>
                      <select
                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                        {...field}
                      >
                        {fontOptions.map((font) => (
                          <option key={font.value} value={font.value}>
                            {font.label}
                          </option>
                        ))}
                      </select>
                    </FormControl>
                    <FormDescription>
                      The main font used throughout your menu and website
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <Separator />

            {/* Layout Settings */}
            <div className="space-y-4">
              <h3 className="text-base font-medium">Layout Settings</h3>

              <FormField
                control={form.control}
                name="logoPosition"
                render={({ field }) => (
                  <FormItem className="space-y-3">
                    <FormLabel>Logo Position</FormLabel>
                    <FormControl>
                      <RadioGroup
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                        className="flex flex-col space-y-1"
                      >
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="left" id="logo-left" />
                          <Label htmlFor="logo-left">Left</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="center" id="logo-center" />
                          <Label htmlFor="logo-center">Center</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="right" id="logo-right" />
                          <Label htmlFor="logo-right">Right</Label>
                        </div>
                      </RadioGroup>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="menuLayout"
                render={({ field }) => (
                  <FormItem className="space-y-3">
                    <FormLabel>Menu Layout</FormLabel>
                    <FormControl>
                      <RadioGroup
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                        className="flex flex-col space-y-1"
                      >
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="grid" id="menu-grid" />
                          <Label htmlFor="menu-grid">Grid Layout</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="list" id="menu-list" />
                          <Label htmlFor="menu-list">List Layout</Label>
                        </div>
                      </RadioGroup>
                    </FormControl>
                    <FormDescription>
                      How your menu items are displayed to customers
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </CardContent>
          <CardFooter>
            <Button type="submit" disabled={submitting}>
              {submitting ? "Saving..." : "Save Changes"}
            </Button>
          </CardFooter>
        </Card>
      </form>
    </Form>
  );
}
