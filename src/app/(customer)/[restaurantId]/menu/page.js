// src/app/(customer)/[restaurantId]/menu/page.js
"use client";

import { useState, useEffect } from "react";
import { useParams, useSearchParams, useRouter } from "next/navigation";
import CustomerLayout from "@/components/layout/CustomerLayout";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  ShoppingBag,
  Plus,
  Minus,
  MessageSquare,
  ArrowLeft,
} from "lucide-react";
import { restaurantService } from "@/lib/api";
import { toast } from "sonner";

// Mock menu data for the MVP
const mockMenuCategories = [
  { id: 1, name: "Appetizers" },
  { id: 2, name: "Main Courses" },
  { id: 3, name: "Pizzas" },
  { id: 4, name: "Pastas" },
  { id: 5, name: "Desserts" },
  { id: 6, name: "Drinks" },
];

const mockMenuItems = [
  {
    id: 1,
    name: "Garlic Bread",
    description: "Freshly baked bread with garlic butter",
    price: 4.99,
    categoryId: 1,
    popular: true,
    dietary: ["Vegetarian"],
  },
  {
    id: 2,
    name: "Chicken Wings",
    description: "Spicy buffalo wings with blue cheese dip",
    price: 8.99,
    categoryId: 1,
    dietary: ["Spicy"],
  },
  {
    id: 3,
    name: "Mozzarella Sticks",
    description: "Breaded and fried mozzarella with marinara sauce",
    price: 6.99,
    categoryId: 1,
    dietary: ["Vegetarian"],
  },

  {
    id: 4,
    name: "Grilled Salmon",
    description: "Fresh salmon with lemon butter sauce and seasonal vegetables",
    price: 18.99,
    categoryId: 2,
  },
  {
    id: 5,
    name: "Ribeye Steak",
    description: "10oz ribeye with mashed potatoes and grilled asparagus",
    price: 24.99,
    categoryId: 2,
    popular: true,
  },
  {
    id: 6,
    name: "Chicken Parmesan",
    description:
      "Breaded chicken topped with marinara and mozzarella, served with spaghetti",
    price: 16.99,
    categoryId: 2,
  },

  {
    id: 7,
    name: "Margherita Pizza",
    description: "Classic tomato sauce, fresh mozzarella, and basil",
    price: 12.99,
    categoryId: 3,
    dietary: ["Vegetarian"],
    popular: true,
  },
  {
    id: 8,
    name: "Pepperoni Pizza",
    description: "Tomato sauce, mozzarella, and pepperoni",
    price: 14.99,
    categoryId: 3,
  },
  {
    id: 9,
    name: "Vegetarian Pizza",
    description:
      "Tomato sauce, mozzarella, bell peppers, onions, and mushrooms",
    price: 13.99,
    categoryId: 3,
    dietary: ["Vegetarian"],
  },

  {
    id: 10,
    name: "Spaghetti Bolognese",
    description: "Spaghetti with hearty meat sauce",
    price: 14.99,
    categoryId: 4,
  },
  {
    id: 11,
    name: "Fettuccine Alfredo",
    description: "Fettuccine pasta in a creamy parmesan sauce",
    price: 13.99,
    categoryId: 4,
    dietary: ["Vegetarian"],
  },
  {
    id: 12,
    name: "Shrimp Scampi",
    description: "Linguine with garlic butter shrimp",
    price: 17.99,
    categoryId: 4,
    popular: true,
  },

  {
    id: 13,
    name: "Tiramisu",
    description: "Classic Italian coffee-flavored dessert",
    price: 6.99,
    categoryId: 5,
  },
  {
    id: 14,
    name: "Chocolate Lava Cake",
    description:
      "Warm chocolate cake with a molten center, served with vanilla ice cream",
    price: 7.99,
    categoryId: 5,
    popular: true,
    dietary: ["Vegetarian"],
  },
  {
    id: 15,
    name: "New York Cheesecake",
    description: "Creamy cheesecake with a graham cracker crust",
    price: 6.99,
    categoryId: 5,
    dietary: ["Vegetarian"],
  },

  {
    id: 16,
    name: "Soft Drinks",
    description: "Coke, Diet Coke, Sprite, or Fanta",
    price: 2.99,
    categoryId: 6,
  },
  {
    id: 17,
    name: "Iced Tea",
    description: "Sweetened or unsweetened",
    price: 2.99,
    categoryId: 6,
  },
  {
    id: 18,
    name: "Espresso",
    description: "Double shot of espresso",
    price: 3.49,
    categoryId: 6,
  },
];

export default function RestaurantMenuPage() {
  const [restaurant, setRestaurant] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState("all");
  const [selectedItems, setSelectedItems] = useState([]);
  const [showSelected, setShowSelected] = useState(false);

  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();

  const restaurantId = params.restaurantId;
  const tableId = searchParams.get("table");

  useEffect(() => {
    async function loadRestaurant() {
      if (!restaurantId) return;

      try {
        const response = await restaurantService.getRestaurantPublic(
          restaurantId
        );
        setRestaurant(response.data.data);
      } catch (error) {
        console.error("Error loading restaurant", error);
        toast.error("Could not load restaurant information");
      } finally {
        setLoading(false);
      }
    }

    loadRestaurant();
  }, [restaurantId]);

  const handleAddItem = (item) => {
    const existingItem = selectedItems.find((i) => i.id === item.id);

    if (existingItem) {
      setSelectedItems(
        selectedItems.map((i) =>
          i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i
        )
      );
    } else {
      setSelectedItems([...selectedItems, { ...item, quantity: 1 }]);
    }

    toast.success(`Added ${item.name} to your selection`);
  };

  const handleUpdateQuantity = (itemId, newQuantity) => {
    if (newQuantity <= 0) {
      setSelectedItems(selectedItems.filter((item) => item.id !== itemId));
    } else {
      setSelectedItems(
        selectedItems.map((item) =>
          item.id === itemId ? { ...item, quantity: newQuantity } : item
        )
      );
    }
  };

  const handleGoToFeedback = () => {
    router.push(
      `/${restaurantId}/feedback${tableId ? `?table=${tableId}` : ""}`
    );
  };

  const handleGoBack = () => {
    router.push(`/${restaurantId}${tableId ? `?table=${tableId}` : ""}`);
  };

  const getFilteredItems = () => {
    return activeCategory === "all"
      ? mockMenuItems
      : mockMenuItems.filter((item) => {
          const category = mockMenuCategories.find(
            (c) => c.id === item.categoryId
          );
          return category?.name === activeCategory;
        });
  };

  const totalAmount = selectedItems.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  if (loading) {
    return (
      <CustomerLayout>
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-stone-700"></div>
        </div>
      </CustomerLayout>
    );
  }

  return (
    <CustomerLayout>
      <div className="max-w-2xl mx-auto py-6 px-4">
        <div className="flex items-center justify-between mb-6">
          <Button variant="outline" size="sm" onClick={handleGoBack}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>

          {selectedItems.length > 0 && (
            <Button
              variant={showSelected ? "default" : "outline"}
              size="sm"
              onClick={() => setShowSelected(!showSelected)}
            >
              <ShoppingBag className="h-4 w-4 mr-2" />
              {selectedItems.length}{" "}
              {selectedItems.length === 1 ? "item" : "items"}
            </Button>
          )}
        </div>

        {/* Selection Summary */}
        {showSelected && selectedItems.length > 0 && (
          <Card className="mb-6">
            <CardHeader className="pb-3">
              <div className="flex justify-between items-center">
                <CardTitle>Your Selection</CardTitle>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowSelected(false)}
                >
                  Continue Browsing
                </Button>
              </div>
              <CardDescription>
                Show this to your server to place your order
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {selectedItems.map((item) => (
                  <div
                    key={item.id}
                    className="flex justify-between items-center py-2 border-b last:border-0"
                  >
                    <div>
                      <div className="font-medium">{item.name}</div>
                      <div className="text-sm text-gray-500">
                        ${item.price.toFixed(2)} each
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() =>
                          handleUpdateQuantity(item.id, item.quantity - 1)
                        }
                      >
                        <Minus className="h-3 w-3" />
                      </Button>
                      <span className="w-8 text-center">{item.quantity}</span>
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() =>
                          handleUpdateQuantity(item.id, item.quantity + 1)
                        }
                      >
                        <Plus className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
            <CardFooter className="flex-col items-stretch space-y-4">
              <div className="flex justify-between font-bold text-lg">
                <span>Total:</span>
                <span>${totalAmount.toFixed(2)}</span>
              </div>
              <Button onClick={handleGoToFeedback}>
                <MessageSquare className="h-4 w-4 mr-2" />
                Give Feedback
              </Button>
            </CardFooter>
          </Card>
        )}

        {/* Menu Categories */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle>Menu</CardTitle>
            <CardDescription>
              Browse our menu and select items for your order
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs
              value={activeCategory}
              onValueChange={setActiveCategory}
              className="w-full"
            >
              <TabsList className="mb-4 flex flex-wrap h-auto">
                <TabsTrigger value="all">All</TabsTrigger>
                {mockMenuCategories.map((category) => (
                  <TabsTrigger key={category.id} value={category.name}>
                    {category.name}
                  </TabsTrigger>
                ))}
              </TabsList>

              <TabsContent value={activeCategory} className="mt-0">
                <div className="space-y-4">
                  {getFilteredItems().map((item) => (
                    <div key={item.id} className="border rounded-lg p-4">
                      <div className="flex justify-between">
                        <div>
                          <div className="flex items-center">
                            <h3 className="font-medium">{item.name}</h3>
                            {item.popular && (
                              <Badge className="ml-2 bg-amber-100 text-amber-800 hover:bg-amber-100">
                                Popular
                              </Badge>
                            )}
                          </div>
                          {item.dietary && item.dietary.length > 0 && (
                            <div className="flex flex-wrap gap-1 mt-1">
                              {item.dietary.map((tag) => (
                                <Badge
                                  key={tag}
                                  variant="outline"
                                  className="text-xs"
                                >
                                  {tag}
                                </Badge>
                              ))}
                            </div>
                          )}
                          <p className="text-sm text-gray-500 mt-1">
                            {item.description}
                          </p>
                        </div>
                        <div className="flex flex-col items-end justify-between">
                          <div className="font-bold">
                            ${item.price.toFixed(2)}
                          </div>
                          <Button
                            size="sm"
                            variant="outline"
                            className="mt-2"
                            onClick={() => handleAddItem(item)}
                          >
                            <Plus className="h-4 w-4 mr-1" />
                            Add
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
          <CardFooter>
            <div className="w-full text-center">
              <Button variant="outline" onClick={handleGoToFeedback}>
                <MessageSquare className="h-4 w-4 mr-2" />
                Give Feedback
              </Button>
            </div>
          </CardFooter>
        </Card>
      </div>
    </CustomerLayout>
  );
}
