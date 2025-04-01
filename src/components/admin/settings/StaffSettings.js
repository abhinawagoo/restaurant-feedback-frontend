// src/components/settings/StaffSettings.jsx
import { useState, useEffect } from "react";
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
import { Badge } from "@/components/ui/badge";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Plus, UserPlus, Users, Shield, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { staffService } from "@/lib/api";

// Form schema for inviting staff
const inviteStaffSchema = z.object({
  email: z.string().email({
    message: "Please enter a valid email address",
  }),
  role: z.enum(["owner", "manager", "staff"], {
    required_error: "Please select a role",
  }),
  permissions: z.object({
    manageMenu: z.boolean().default(false),
    viewAnalytics: z.boolean().default(false),
    manageFeedback: z.boolean().default(false),
    manageSettings: z.boolean().default(false),
    manageStaff: z.boolean().default(false),
  }),
});

export default function StaffSettings({ restaurant, subscription, onUpdate }) {
  const [staffMembers, setStaffMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [inviteDialogOpen, setInviteDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedStaffId, setSelectedStaffId] = useState(null);

  // Get staff limit from subscription
  const staffLimit = subscription?.limits?.staffAccounts || 3;
  const canAddMoreStaff = staffMembers.length < staffLimit;

  // Fetch staff members
  useEffect(() => {
    const fetchStaffMembers = async () => {
      try {
        const data = await staffService.getStaffMembers();
        setStaffMembers(data);
      } catch (error) {
        console.error("Error fetching staff members:", error);
        toast.error("Failed to load staff members");
      } finally {
        setLoading(false);
      }
    };

    fetchStaffMembers();
  }, []);

  // Initialize invite form
  const form = useForm({
    resolver: zodResolver(inviteStaffSchema),
    defaultValues: {
      email: "",
      role: "staff",
      permissions: {
        manageMenu: false,
        viewAnalytics: false,
        manageFeedback: false,
        manageSettings: false,
        manageStaff: false,
      },
    },
  });

  // Handle invite submission
  const onSubmit = async (data) => {
    try {
      const response = await staffService.inviteStaffMember(data);

      if (response.success) {
        toast.success(`Invitation sent to ${data.email}`);
        setInviteDialogOpen(false);
        // Refresh staff list
        const updatedStaff = await staffService.getStaffMembers();
        setStaffMembers(updatedStaff);
        form.reset();
      } else {
        throw new Error(response.message || "Failed to send invitation");
      }
    } catch (error) {
      console.error("Error inviting staff member:", error);
      toast.error(error.message || "Something went wrong");
    }
  };

  // Handle staff deletion
  const handleDeleteStaff = async () => {
    if (!selectedStaffId) return;

    try {
      const response = await staffService.removeStaffMember(selectedStaffId);

      if (response.success) {
        toast.success("Staff member removed successfully");
        // Remove from local state
        setStaffMembers(
          staffMembers.filter((member) => member._id !== selectedStaffId)
        );
      } else {
        throw new Error(response.message || "Failed to remove staff member");
      }
    } catch (error) {
      console.error("Error removing staff member:", error);
      toast.error(error.message || "Something went wrong");
    } finally {
      setDeleteDialogOpen(false);
      setSelectedStaffId(null);
    }
  };

  // Set permissions based on role
  const setPermissionsByRole = (role) => {
    switch (role) {
      case "owner":
        form.setValue("permissions", {
          manageMenu: true,
          viewAnalytics: true,
          manageFeedback: true,
          manageSettings: true,
          manageStaff: true,
        });
        break;
      case "manager":
        form.setValue("permissions", {
          manageMenu: true,
          viewAnalytics: true,
          manageFeedback: true,
          manageSettings: false,
          manageStaff: false,
        });
        break;
      case "staff":
        form.setValue("permissions", {
          manageMenu: false,
          viewAnalytics: false,
          manageFeedback: true,
          manageSettings: false,
          manageStaff: false,
        });
        break;
      default:
        break;
    }
  };

  // Format role name for display
  const formatRoleName = (role) => {
    return role.charAt(0).toUpperCase() + role.slice(1);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <div>
            <CardTitle>Staff Members</CardTitle>
            <CardDescription>
              Manage staff accounts and permissions
            </CardDescription>
          </div>
          <Dialog open={inviteDialogOpen} onOpenChange={setInviteDialogOpen}>
            <DialogTrigger asChild>
              <Button disabled={!canAddMoreStaff}>
                <UserPlus className="mr-2 h-4 w-4" />
                Invite Staff
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Invite Staff Member</DialogTitle>
                <DialogDescription>
                  Send an invitation to add a new staff member to your
                  restaurant.
                </DialogDescription>
              </DialogHeader>

              <Form {...form}>
                <form
                  onSubmit={form.handleSubmit(onSubmit)}
                  className="space-y-4 py-4"
                >
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email</FormLabel>
                        <FormControl>
                          <Input placeholder="staff@example.com" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="role"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Role</FormLabel>
                        <Select
                          onValueChange={(value) => {
                            field.onChange(value);
                            setPermissionsByRole(value);
                          }}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select a role" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="owner">Owner</SelectItem>
                            <SelectItem value="manager">Manager</SelectItem>
                            <SelectItem value="staff">Staff</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormDescription>
                          This determines their default permissions.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="space-y-4">
                    <h4 className="text-sm font-medium">Permissions</h4>

                    <FormField
                      control={form.control}
                      name="permissions.manageMenu"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                          <FormControl>
                            <Checkbox
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                          <div className="space-y-1 leading-none">
                            <FormLabel>Manage Menu</FormLabel>
                            <FormDescription>
                              Can add, edit, and delete menu items
                            </FormDescription>
                          </div>
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="permissions.viewAnalytics"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                          <FormControl>
                            <Checkbox
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                          <div className="space-y-1 leading-none">
                            <FormLabel>View Analytics</FormLabel>
                            <FormDescription>
                              Can access and view analytics data
                            </FormDescription>
                          </div>
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="permissions.manageFeedback"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                          <FormControl>
                            <Checkbox
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                          <div className="space-y-1 leading-none">
                            <FormLabel>Manage Feedback</FormLabel>
                            <FormDescription>
                              Can view and respond to customer feedback
                            </FormDescription>
                          </div>
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="permissions.manageSettings"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                          <FormControl>
                            <Checkbox
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                          <div className="space-y-1 leading-none">
                            <FormLabel>Manage Settings</FormLabel>
                            <FormDescription>
                              Can modify restaurant settings
                            </FormDescription>
                          </div>
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="permissions.manageStaff"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                          <FormControl>
                            <Checkbox
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                          <div className="space-y-1 leading-none">
                            <FormLabel>Manage Staff</FormLabel>
                            <FormDescription>
                              Can invite and manage other staff members
                            </FormDescription>
                          </div>
                        </FormItem>
                      )}
                    />
                  </div>

                  <DialogFooter>
                    <Button type="submit">Send Invitation</Button>
                  </DialogFooter>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center py-8">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
            </div>
          ) : staffMembers.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <Users className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium">No staff members yet</h3>
              <p className="text-sm text-muted-foreground">
                Invite staff members to help manage your restaurant
              </p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {staffMembers.map((staff) => (
                  <TableRow key={staff._id}>
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-2">
                        <Avatar className="h-8 w-8">
                          <AvatarImage
                            src={staff.user?.image}
                            alt={staff.user?.name}
                          />
                          <AvatarFallback>
                            {staff.user?.name?.charAt(0) || "U"}
                          </AvatarFallback>
                        </Avatar>
                        {staff.user?.name || "Invited User"}
                      </div>
                    </TableCell>
                    <TableCell>{staff.user?.email || staff.email}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className="capitalize">
                        {formatRoleName(staff.role)}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {staff.status === "active" ? (
                        <Badge
                          variant="success"
                          className="bg-green-100 text-green-800"
                        >
                          Active
                        </Badge>
                      ) : staff.status === "invited" ? (
                        <Badge
                          variant="warning"
                          className="bg-yellow-100 text-yellow-800"
                        >
                          Invited
                        </Badge>
                      ) : (
                        <Badge
                          variant="default"
                          className="bg-gray-100 text-gray-800"
                        >
                          {staff.status}
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <AlertDialog
                        open={deleteDialogOpen && selectedStaffId === staff._id}
                        onOpenChange={(open) => {
                          setDeleteDialogOpen(open);
                          if (!open) setSelectedStaffId(null);
                        }}
                      >
                        <AlertDialogTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="text-red-500 hover:text-red-600 hover:bg-red-50"
                            onClick={() => setSelectedStaffId(staff._id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                            <AlertDialogDescription>
                              This will remove {staff.user?.name || staff.email}{" "}
                              from your restaurant staff. This action cannot be
                              undone.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={handleDeleteStaff}
                              className="bg-red-500 hover:bg-red-600"
                            >
                              Remove Staff
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
        <CardFooter className="border-t px-6 py-4">
          <div className="flex items-center text-sm text-muted-foreground">
            <Shield className="mr-2 h-4 w-4" />
            <span>
              {staffMembers.length} of {staffLimit} staff accounts used
              {!canAddMoreStaff && (
                <span className="ml-1">
                  -{" "}
                  <a href="#" className="text-primary underline">
                    Upgrade your plan
                  </a>{" "}
                  for more staff accounts
                </span>
              )}
            </span>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}
