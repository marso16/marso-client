import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ordersAPI } from "../services/api";
import { useAuth } from "../context/AuthContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Loader2,
  Package,
  CalendarDays,
  DollarSign,
  ShoppingCart,
} from "lucide-react";

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/login", { state: { from: { pathname: "/orders" } } });
      return;
    }
    fetchOrders();
  }, [isAuthenticated, navigate]);

  const fetchOrders = async () => {
    try {
      setIsLoading(true);
      const response = await ordersAPI.getMyOrders();
      setOrders(response.data.orders);
      setError("");
    } catch (err) {
      console.error("Error fetching orders:", err);
      setError(err.response?.data?.message || "Failed to load orders");
      setOrders([]);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isAuthenticated) {
    return null; // Redirect handled by useEffect
  }

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-16">
        <div className="flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin" />
          <span className="ml-2">Loading orders...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <h2 className="text-2xl font-bold text-destructive">Error</h2>
        <p className="text-muted-foreground">{error}</p>
        <Button onClick={fetchOrders} className="mt-4">
          Retry
        </Button>
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="container mx-auto px-4 py-16">
        <div className="text-center max-w-md mx-auto">
          <Package className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
          <h2 className="text-2xl font-bold mb-4">No Orders Found</h2>
          <p className="text-muted-foreground mb-6">
            You haven't placed any orders yet. Start shopping now!
          </p>
          <Button onClick={() => navigate("/products")}>Browse Products</Button>
        </div>
      </div>
    );
  }

  const getStatusBadgeVariant = (status) => {
    switch (status) {
      case "pending":
        return "warning";
      case "processing":
        return "info";
      case "shipped":
        return "default";
      case "delivered":
        return "success";
      case "cancelled":
        return "destructive";
      case "refunded":
        return "secondary";
      default:
        return "secondary";
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8 text-center">My Orders</h1>

      <div className="space-y-6">
        {orders.map((order) => (
          <Card key={order._id}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-xl font-semibold">
                Order #{order._id.substring(0, 8)}
              </CardTitle>
              <Badge variant={getStatusBadgeVariant(order.status)}>
                {order.status}
              </Badge>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center text-muted-foreground text-sm">
                <CalendarDays className="h-4 w-4 mr-2" />
                <span>
                  Order Date: {new Date(order.createdAt).toLocaleDateString()}
                </span>
              </div>
              <div className="flex items-center text-muted-foreground text-sm">
                <DollarSign className="h-4 w-4 mr-2" />
                <span>Total: ${order.totalPrice.toFixed(2)}</span>
              </div>
              <div className="flex items-center text-muted-foreground text-sm">
                <ShoppingCart className="h-4 w-4 mr-2" />
                <span>Items: {order.orderItems.length}</span>
              </div>
              <Button asChild className="w-full md:w-auto">
                <Link to={`/orders/${order._id}`}>View Details</Link>
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default Orders;
