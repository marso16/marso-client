import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { authAPI } from "../../services/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Loader2, Trash2, ArrowLeft } from "lucide-react";
import { safeToast } from "@/lib/utils";

import {
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
} from "@/components/ui/alert-dialog";

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedUserId, setSelectedUserId] = useState(null);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setIsLoading(true);
      const response = await authAPI.getAllUsers();
      setUsers(response.data.users);
      setError("");
    } catch (err) {
      console.error("Error fetching users:", err);
      setError(err.response?.data?.message || "Failed to load users");
      setUsers([]);
    } finally {
      setIsLoading(false);
    }
  };

  const currentUser = JSON.parse(localStorage.getItem("user"));

  const handleDeleteUser = async () => {
    if (selectedUserId === currentUser?._id) {
      safeToast.error("You cannot delete your own account while logged in.");
      return;
    }

    try {
      await authAPI.deleteUser(selectedUserId);
      safeToast.success("User deleted successfully!");
      fetchUsers();
    } catch (err) {
      safeToast.error(err.response?.data?.message || "Failed to delete user");
    } finally {
      setSelectedUserId(null);
    }
  };

  const handleUpdateUserRole = async (userId, newRole) => {
    try {
      await authAPI.updateUserRole(userId, { role: newRole });
      safeToast.success("User role updated successfully!");
      fetchUsers();
    } catch (err) {
      safeToast.error(
        err.response?.data?.message || "Failed to update user role"
      );
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8 flex items-center justify-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin" />
        <span className="ml-2">Loading users...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8 text-center min-h-[60vh]">
        <h2 className="text-2xl font-bold text-destructive">Error</h2>
        <p className="text-muted-foreground">{error}</p>
        <Button onClick={fetchUsers} className="mt-4">
          Retry
        </Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center space-x-2 mb-6">
        <Button variant="ghost" size="icon" asChild>
          <Link to="/admin">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <h1 className="text-3xl font-bold">User Management</h1>
      </div>

      {users.length === 0 ? (
        <div className="text-center py-12">
          <h3 className="text-lg font-semibold mb-2">No users found</h3>
          <p className="text-muted-foreground mb-4">
            There are no registered users yet.
          </p>
        </div>
      ) : (
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.map((user) => (
                  <TableRow key={user._id}>
                    <TableCell className="font-medium">{user.name}</TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>
                      <div className="relative">
                        <select
                          value={user.role}
                          onChange={(e) =>
                            handleUpdateUserRole(user._id, e.target.value)
                          }
                          className={`p-2 border rounded-md w-full appearance-none pr-8 transition-all 
                            ${
                              user._id === currentUser?._id
                                ? "bg-muted text-muted-foreground opacity-60 cursor-not-allowed"
                                : "hover:border-primary focus:outline-none focus:ring-2 focus:ring-primary"
                            }`}
                          disabled={user._id === currentUser?._id}
                          title={
                            user._id === currentUser?._id
                              ? "You cannot change your own role"
                              : "Change user role"
                          }
                        >
                          <option value="user">User</option>
                          <option value="admin">Admin</option>
                        </select>

                        {user._id === currentUser?._id && (
                          <div className="absolute top-2 right-2 text-muted-foreground pointer-events-none">
                            🔒
                          </div>
                        )}
                      </div>
                    </TableCell>

                    <TableCell className="flex space-x-2">
                      {user._id === currentUser?._id ? (
                        <Button
                          variant="destructive"
                          size="icon"
                          disabled
                          title="You cannot delete your own account"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      ) : (
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button
                              variant="destructive"
                              size="icon"
                              onClick={() => setSelectedUserId(user._id)}
                              title="Delete user"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Delete User?</AlertDialogTitle>
                              <AlertDialogDescription>
                                Are you sure you want to delete{" "}
                                <strong>{user.name}</strong>? This action cannot
                                be undone.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel
                                onClick={() => setSelectedUserId(null)}
                              >
                                Cancel
                              </AlertDialogCancel>
                              <AlertDialogAction onClick={handleDeleteUser}>
                                Yes, Delete
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default UserManagement;
