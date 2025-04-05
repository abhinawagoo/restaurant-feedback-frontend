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
import { restaurantService, menuService } from "@/lib/api";
import { toast } from "sonner";

export default function RestaurantMenuPage() {
  const [restaurant, setRestaurant] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState("all");
  const [selectedItems, setSelectedItems] = useState([]);
  const [showSelected, setShowSelected] = useState(false);

  const [menuItems, setMenuItems] = useState([]);
  const [menuCategories, setMenuCategories] = useState([]);
  const [error, setError] = useState(null);

  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();

  const restaurantId = params.restaurantId;
  const tableId = searchParams.get("table");

  useEffect(() => {
    const fetchMenuData = async () => {
      try {
        setLoading(true);
        
        // Use the menuService instead of restaurantService
        const [itemsResponse, categoriesResponse] = await Promise.all([
          menuService.getPublicMenuItems(restaurantId),
          menuService.getPublicMenuCategories(restaurantId),
        ]);
        
        // Log the full response to debug the structure
        console.log("API Response - Items:", itemsResponse);
        console.log("API Response - Categories:", categoriesResponse);
        
        // Extract data from the nested structure and filter active items/categories
        const allCategories = categoriesResponse.data.data || [];
        const allItems = itemsResponse.data.data || [];
        
        // Filter only active categories
        const activeCategories = allCategories.filter(category => category.active);
        
        // Filter only active items 
        const activeItems = allItems.filter(item => item.active);
        
        console.log("Active Categories:", activeCategories);
        console.log("Active Items:", activeItems);
        
        setMenuCategories(activeCategories);
        setMenuItems(activeItems);
      } catch (err) {
        console.error("Error fetching menu data:", err);
        console.error("Full error object:", JSON.stringify(err, Object.getOwnPropertyNames(err)));
        setError("Failed to fetch menu data. Please try again later.");
        
        // Fallback to mock data in case of error
        setMenuItems(mockMenuItems.map(item => ({
          ...item,
          _id: item.id.toString()
        })));
        setMenuCategories(mockMenuCategories.map(category => ({
          ...category,
          _id: category.id.toString()
        })));
      } finally {
        setLoading(false);
      }
    };

    fetchMenuData();
  }, [restaurantId]);

  const handleAddItem = (item) => {
    const existingItem = selectedItems.find((i) => i._id === item._id);

    if (existingItem) {
      setSelectedItems(
        selectedItems.map((i) =>
          i._id === item._id ? { ...i, quantity: i.quantity + 1 } : i
        )
      );
    } else {
      setSelectedItems([...selectedItems, { ...item, quantity: 1 }]);
    }

    toast.success(`Added ${item.name} to your selection`);
  };

  const handleUpdateQuantity = (itemId, newQuantity) => {
    if (newQuantity <= 0) {
      setSelectedItems(selectedItems.filter((item) => item._id !== itemId));
    } else {
      setSelectedItems(
        selectedItems.map((item) =>
          item._id === itemId ? { ...item, quantity: newQuantity } : item
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
    if (activeCategory === "all") {
      return menuItems;
    } else {
      // Find the category with the matching name
      const category = menuCategories.find(c => c.name === activeCategory);
      if (!category) return [];
      
      // Filter items by category ID (comparing as strings to handle ObjectId)
      return menuItems.filter(item => {
        const itemCategoryId = item.categoryId || item.category;
        const categoryId = category._id;
        
        // Convert both to strings to compare reliably
        return String(itemCategoryId) === String(categoryId);
      });
    }
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

  if (error) {
    return (
      <CustomerLayout>
        <div className="max-w-2xl mx-auto py-6 px-4">
          <Card>
            <CardHeader>
              <CardTitle>Error</CardTitle>
            </CardHeader>
            <CardContent>
              <p>{error}</p>
              <Button className="mt-4" onClick={() => window.location.reload()}>
                Try Again
              </Button>
            </CardContent>
          </Card>
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
                    key={item._id}
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
                          handleUpdateQuantity(item._id, item.quantity - 1)
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
                          handleUpdateQuantity(item._id, item.quantity + 1)
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
                {menuCategories.map((category) => (
                  <TabsTrigger key={category._id} value={category.name}>
                    {category.name}
                  </TabsTrigger>
                ))}
              </TabsList>

              <TabsContent value={activeCategory} className="mt-0">
                <div className="space-y-4">
                  {getFilteredItems().map((item) => (
                    <div key={item._id} className="border rounded-lg p-4">
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

// Define mock data for fallback or development
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
  // ... other items
  {
    id: 18,
    name: "Espresso",
    description: "Double shot of espresso",
    price: 3.49,
    categoryId: 6,
  },
];