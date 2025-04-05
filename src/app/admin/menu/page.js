// src/app/admin/menu/page.js
"use client";

import { useState, useEffect } from "react";
import AdminLayout from "@/components/layout/AdminLayout";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import {
  Plus,
  Search,
  Filter,
  Edit,
  Trash,
  Eye,
  EyeOff,
  MoreVertical,
  CirclePlus,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/contexts/AuthContext";
import { menuService } from "@/lib/api";
import { toast } from "sonner";
import AddMenuItemModal from "@/components/menu/AddMenuItemModal";
import AddCategoryModal from "@/components/menu/AddCategoryModal";

// Mock data - would come from API in real app
const mockCategories = [
  { id: 1, name: "Appetizers", active: true, itemCount: 4 },
  { id: 2, name: "Main Courses", active: true, itemCount: 6 },
  { id: 3, name: "Pizzas", active: true, itemCount: 3 },
  { id: 4, name: "Pastas", active: true, itemCount: 3 },
  { id: 5, name: "Desserts", active: true, itemCount: 3 },
  { id: 6, name: "Drinks", active: true, itemCount: 3 },
  { id: 7, name: "Specials", active: false, itemCount: 2 },
];

const mockMenuItems = [
  {
    id: 1,
    name: "Garlic Bread",
    description: "Freshly baked bread with garlic butter",
    price: 4.99,
    categoryId: 1,
    active: true,
    popular: true,
    dietary: ["Vegetarian"],
  },
  {
    id: 2,
    name: "Chicken Wings",
    description: "Spicy buffalo wings with blue cheese dip",
    price: 8.99,
    categoryId: 1,
    active: true,
    dietary: ["Spicy"],
  },
  {
    id: 3,
    name: "Mozzarella Sticks",
    description: "Breaded and fried mozzarella with marinara sauce",
    price: 6.99,
    categoryId: 1,
    active: true,
    dietary: ["Vegetarian"],
  },
  {
    id: 4,
    name: "Bruschetta",
    description: "Toasted bread topped with tomatoes, basil, and olive oil",
    price: 5.99,
    categoryId: 1,
    active: false,
    dietary: ["Vegetarian", "Vegan"],
  },

  {
    id: 5,
    name: "Grilled Salmon",
    description: "Fresh salmon with lemon butter sauce and seasonal vegetables",
    price: 18.99,
    categoryId: 2,
    active: true,
  },
  {
    id: 6,
    name: "Ribeye Steak",
    description: "10oz ribeye with mashed potatoes and grilled asparagus",
    price: 24.99,
    categoryId: 2,
    active: true,
    popular: true,
  },
  {
    id: 7,
    name: "Chicken Parmesan",
    description:
      "Breaded chicken topped with marinara and mozzarella, served with spaghetti",
    price: 16.99,
    categoryId: 2,
    active: true,
  },
];

export default function MenuManagementPage() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("items");
  const [searchTerm, setSearchTerm] = useState("");
  const [categories, setCategories] = useState([]);
  const [menuItems, setMenuItems] = useState([]);
  const [filteredItems, setFilteredItems] = useState([]);
  const [activeCategory, setActiveCategory] = useState("all");
  const [loading, setLoading] = useState(true);
  const [showAddItemModal, setShowAddItemModal] = useState(false);
  const [showAddCategoryModal, setShowAddCategoryModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [editingCategory, setEditingCategory] = useState(null);

  // Load menu data
  useEffect(() => {
    const loadData = async () => {
      if (!user?.restaurantId) return;

      setLoading(true);

      try {
        // Load categories
        const categoriesResponse = await menuService.getMenuCategories(
          user.restaurantId
        );
        console.log(categoriesResponse);
        const categoriesData = categoriesResponse.data.data || [];
        setCategories(categoriesData);

        // Load menu items
        const itemsResponse = await menuService.getMenuItems(user.restaurantId);
        const itemsData = itemsResponse.data.data || [];
        setMenuItems(itemsData);
        setFilteredItems(itemsData);
      } catch (error) {
        console.error("Error loading menu data", error);
        toast.error("Failed to load menu data");
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [user]);

  // Filter items based on search and category
  useEffect(() => {
    let items = [...menuItems];

    // Apply category filter
    if (activeCategory !== "all") {
      const categoryId = parseInt(activeCategory);
      items = items.filter((item) => item.categoryId === categoryId);
    }

    // Apply search filter
    if (searchTerm) {
      const search = searchTerm.toLowerCase();
      items = items.filter(
        (item) =>
          item.name.toLowerCase().includes(search) ||
          item.description.toLowerCase().includes(search)
      );
    }

    setFilteredItems(items);
  }, [menuItems, searchTerm, activeCategory]);

  /// Handle adding a new menu item
  const handleAddItem = async (newItem) => {
    try {
      const response = await menuService.addMenuItem(user.restaurantId, {
        ...newItem,
        price: parseFloat(newItem.price),
      });

      setMenuItems([...menuItems, response.data.data]);
      toast.success("Menu item added successfully");
      setShowAddItemModal(false);
      setEditingItem(null);
    } catch (error) {
      console.error("Error adding menu item", error);
      toast.error(error.response?.data?.message || "Failed to add menu item");
    }
  };

  // Handle updating a menu item
  const handleUpdateItem = async (updatedItem) => {
    try {
      const response = await menuService.updateMenuItem(updatedItem.id, {
        ...updatedItem,
        price: parseFloat(updatedItem.price),
      });

      const updatedItems = menuItems.map((item) =>
        item._id === response.data.data._id ? response.data.data : item
      );

      setMenuItems(updatedItems);
      toast.success("Menu item updated successfully");
      setShowAddItemModal(false);
      setEditingItem(null);
    } catch (error) {
      console.error("Error updating menu item", error);
      toast.error(
        error.response?.data?.message || "Failed to update menu item"
      );
    }
  };
  // Handle toggling item availability
  const handleToggleItemAvailability = async (itemId) => {
    try {
      const item = menuItems.find((i) => i._id === itemId);
      const newStatus = !item.active;

      const response = await menuService.toggleItemAvailability(
        itemId,
        newStatus
      );

      const updatedItems = menuItems.map((item) =>
        item._id === itemId ? response.data.data : item
      );

      setMenuItems(updatedItems);
      toast.success(
        `${item.name} is now ${newStatus ? "available" : "unavailable"}`
      );
    } catch (error) {
      console.error("Error toggling item availability", error);
      toast.error(
        error.response?.data?.message || "Failed to update item status"
      );
    }
  };

  // Handle deleting a menu item
  const handleDeleteItem = async (itemId) => {
    try {
      await menuService.deleteMenuItem(itemId);

      const updatedItems = menuItems.filter((item) => item._id !== itemId);
      setMenuItems(updatedItems);
      toast.success("Menu item deleted successfully");
    } catch (error) {
      console.error("Error deleting menu item", error);
      toast.error(
        error.response?.data?.message || "Failed to delete menu item"
      );
    }
  };
  // Handle adding a new category
  const handleAddCategory = async (newCategory) => {
    try {
      const response = await menuService.addCategory(
        user.restaurantId,
        newCategory
      );

      const categoryToAdd = response.data.data;
      categoryToAdd.itemCount = 0; // No items in a new category

      setCategories([...categories, categoryToAdd]);
      toast.success("Category added successfully");
      setShowAddCategoryModal(false);
      setEditingCategory(null);
    } catch (error) {
      console.error("Error adding category", error);
      toast.error(error.response?.data?.message || "Failed to add category");
    }
  };

  // Handle editing a menu item
  const handleEditItem = (item) => {
    setEditingItem(item);
    setShowAddItemModal(true);
  };

  // Handle updating a category
  const handleUpdateCategory = async (updatedCategory) => {
    try {
      const response = await menuService.updateCategory(updatedCategory._id, {
        name: updatedCategory.name,
      });

      const updatedCategories = categories.map((cat) =>
        cat._id === response.data.data._id
          ? {
              ...response.data.data,
              itemCount: cat.itemCount,
            }
          : cat
      );

      setCategories(updatedCategories);
      toast.success("Category updated successfully");
      setShowAddCategoryModal(false);
      setEditingCategory(null);
    } catch (error) {
      console.error("Error updating category", error);
      toast.error(error.response?.data?.message || "Failed to update category");
    }
  };

  //   // Handle toggling category availability
  //   const handleToggleCategoryAvailability = (categoryId) => {
  //     // In a real app, this would be an API call
  //     const updatedCategories = categories.map((cat) =>
  //       cat.id === categoryId ? { ...cat, active: !cat.active } : cat
  //     );

  //     setCategories(updatedCategories);
  //     const category = updatedCategories.find((c) => c.id === categoryId);
  //     toast.success(
  //       `${category.name} is now ${category.active ? "visible" : "hidden"}`
  //     );
  //   };

  // Handle editing a category
  const handleEditCategory = (category) => {
    setEditingCategory(category);
    setShowAddCategoryModal(true);
  };

  // Handle toggling category visibility
  const handleToggleCategoryAvailability = async (categoryId) => {
    try {
      const category = categories.find((c) => c._id === categoryId);
      const newStatus = !category.active;

      const response = await menuService.toggleCategoryVisibility(
        categoryId,
        newStatus
      );

      const updatedCategories = categories.map((cat) =>
        cat._id === categoryId
          ? {
              ...response.data.data,
              itemCount: cat.itemCount,
            }
          : cat
      );

      setCategories(updatedCategories);
      toast.success(
        `${category.name} is now ${newStatus ? "visible" : "hidden"}`
      );
    } catch (error) {
      console.error("Error toggling category visibility", error);
      toast.error(
        error.response?.data?.message || "Failed to update category status"
      );
    }
  };

  // Handle deleting a category
  const handleDeleteCategory = async (categoryId) => {
    try {
      // Check if there are items in this category
      const hasItems = menuItems.some((item) => item.categoryId === categoryId);

      if (hasItems) {
        toast.error(
          "Cannot delete category with menu items. Please move or delete the items first."
        );
        return;
      }

      await menuService.deleteCategory(categoryId);

      const updatedCategories = categories.filter(
        (cat) => cat._id !== categoryId
      );
      setCategories(updatedCategories);
      toast.success("Category deleted successfully");
    } catch (error) {
      console.error("Error deleting category", error);
      toast.error(error.response?.data?.message || "Failed to delete category");
    }
  };

  // Loading state
  if (loading) {
    return (
      <AdminLayout>
        <div className="flex justify-center p-8">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-stone-700"></div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">Menu Management</h1>
            <p className="text-gray-500">
              Manage your restaurant's menu items and categories
            </p>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid grid-cols-2 w-[400px]">
            <TabsTrigger value="items">Menu Items</TabsTrigger>
            <TabsTrigger value="categories">Categories</TabsTrigger>
          </TabsList>

          <TabsContent value="items" className="space-y-4">
            <div className="flex justify-between items-center">
              <div className="relative w-full max-w-sm">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
                <Input
                  type="search"
                  placeholder="Search menu items..."
                  className="pl-8"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>

              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <Label htmlFor="show-all" className="text-sm">
                    Show inactive
                  </Label>
                  <Switch id="show-all" />
                </div>

                <Button
                  onClick={() => {
                    setEditingItem(null);
                    setShowAddItemModal(true);
                  }}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Item
                </Button>
              </div>
            </div>

            <div className="bg-white p-4 rounded-md shadow">
              <div className="flex flex-wrap gap-2 mb-4">
                <Button
                  variant={activeCategory === "all" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setActiveCategory("all")}
                >
                  All
                </Button>

                {categories
                  .filter((c) => c.active)
                  .map((category) => (
                    <Button
                      key={category._id}
                      variant={
                        activeCategory === category._id.toString()
                          ? "default"
                          : "outline"
                      }
                      size="sm"
                      onClick={() => setActiveCategory(category._id.toString())}
                    >
                      {category.name}
                    </Button>
                  ))}
              </div>

              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-2 px-4">Name</th>
                      <th className="text-left py-2 px-4">Category</th>
                      <th className="text-left py-2 px-4">Price</th>
                      <th className="text-left py-2 px-4">Status</th>
                      <th className="text-right py-2 px-4">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredItems.length === 0 ? (
                      <tr>
                        <td
                          colSpan="5"
                          className="text-center py-4 text-gray-500"
                        >
                          No items found
                        </td>
                      </tr>
                    ) : (
                      filteredItems.map((item) => {
                        const category = categories.find(
                          (c) => c._id === item.categoryId
                        );
                        return (
                          <tr
                            key={item._id}
                            className="border-b hover:bg-gray-50"
                          >
                            <td className="py-3 px-4">
                              <div className="flex items-center">
                                <div>
                                  <p className="font-medium">{item.name}</p>
                                  <p className="text-sm text-gray-500 truncate max-w-xs">
                                    {item.description}
                                  </p>
                                </div>
                              </div>
                            </td>
                            <td className="py-3 px-4">
                              {category ? category.name : "Uncategorized"}
                            </td>
                            <td className="py-3 px-4">
                              ${item.price.toFixed(2)}
                            </td>
                            <td className="py-3 px-4">
                              <Badge
                                variant={item.active ? "default" : "secondary"}
                              >
                                {item.active ? "Available" : "Unavailable"}
                              </Badge>
                              {item.popular && (
                                <Badge
                                  variant="outline"
                                  className="ml-2 bg-amber-100 text-amber-800 hover:bg-amber-100"
                                >
                                  Popular
                                </Badge>
                              )}
                            </td>
                            <td className="py-3 px-4 text-right">
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="ghost" size="sm">
                                    <MoreVertical className="h-4 w-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                  <DropdownMenuItem
                                    onClick={() => handleEditItem(item)}
                                  >
                                    <Edit className="h-4 w-4 mr-2" /> Edit Item
                                  </DropdownMenuItem>
                                  <DropdownMenuItem
                                    onClick={() =>
                                      handleToggleItemAvailability(item._id)
                                    }
                                  >
                                    {item.active ? (
                                      <>
                                        <EyeOff className="h-4 w-4 mr-2" /> Mark
                                        Unavailable
                                      </>
                                    ) : (
                                      <>
                                        <Eye className="h-4 w-4 mr-2" /> Mark
                                        Available
                                      </>
                                    )}
                                  </DropdownMenuItem>
                                  <DropdownMenuSeparator />
                                  <DropdownMenuItem
                                    className="text-red-600"
                                    onClick={() => handleDeleteItem(item._id)}
                                  >
                                    <Trash className="h-4 w-4 mr-2" /> Delete
                                    Item
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="categories" className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold">Menu Categories</h2>
              <Button
                onClick={() => {
                  setEditingCategory(null);
                  setShowAddCategoryModal(true);
                }}
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Category
              </Button>
            </div>

            <div className="bg-white p-4 rounded-md shadow">
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-2 px-4">Name</th>
                      <th className="text-left py-2 px-4">Items</th>
                      <th className="text-left py-2 px-4">Status</th>
                      <th className="text-right py-2 px-4">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {categories.length === 0 ? (
                      <tr>
                        <td
                          colSpan="4"
                          className="text-center py-4 text-gray-500"
                        >
                          No categories found
                        </td>
                      </tr>
                    ) : (
                      categories.map((category) => (
                        <tr
                          key={category._id}
                          className="border-b hover:bg-gray-50"
                        >
                          <td className="py-3 px-4">
                            <p className="font-medium">{category.name}</p>
                          </td>
                          <td className="py-3 px-4">{category.itemCount}</td>
                          <td className="py-3 px-4">
                            <Badge
                              variant={
                                category.active ? "default" : "secondary"
                              }
                            >
                              {category.active ? "Visible" : "Hidden"}
                            </Badge>
                          </td>
                          <td className="py-3 px-4 text-right">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="sm">
                                  <MoreVertical className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                <DropdownMenuItem
                                  onClick={() => handleEditCategory(category)}
                                >
                                  <Edit className="h-4 w-4 mr-2" /> Edit
                                  Category
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  onClick={() =>
                                    handleToggleCategoryAvailability(
                                      category._id
                                    )
                                  }
                                >
                                  {category.active ? (
                                    <>
                                      <EyeOff className="h-4 w-4 mr-2" /> Hide
                                      Category
                                    </>
                                  ) : (
                                    <>
                                      <Eye className="h-4 w-4 mr-2" /> Show
                                      Category
                                    </>
                                  )}
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem
                                  className="text-red-600"
                                  onClick={() =>
                                    handleDeleteCategory(category._id)
                                  }
                                >
                                  <Trash className="h-4 w-4 mr-2" /> Delete
                                  Category
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* Add/Edit Menu Item Modal */}
      <AddMenuItemModal
        open={showAddItemModal}
        onClose={() => {
          setShowAddItemModal(false);
          setEditingItem(null);
        }}
        onSubmit={editingItem ? handleUpdateItem : handleAddItem}
        categories={categories.filter((c) => c.active)}
        editingItem={editingItem}
      />

      {/* Add/Edit Category Modal */}
      <AddCategoryModal
        open={showAddCategoryModal}
        onClose={() => {
          setShowAddCategoryModal(false);
          setEditingCategory(null);
        }}
        onSubmit={editingCategory ? handleUpdateCategory : handleAddCategory}
        editingCategory={editingCategory}
      />
    </AdminLayout>
  );
}
