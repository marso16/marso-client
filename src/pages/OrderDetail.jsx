import React, { useState, useEffect } from "react";
import { useParams, useNavigate, useSearchParams } from "react-router-dom";
import { ordersAPI } from "../services/api";
import { useAuth } from "../context/AuthContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

import {
  Loader2,
  ArrowLeft,
  CheckCircle,
  XCircle,
  CalendarDays,
  DollarSign,
  Link,
  MapPin,
  CreditCard,
} from "lucide-react";
// import toast from "react-hot-toast";
import { safeToast } from "@/lib/utils";

const OrderDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { isAuthenticated } = useAuth();

  const [order, setOrder] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/login", { state: { from: { pathname: `/orders/${id}` } } });
      return;
    }
    fetchOrder();
  }, [id, isAuthenticated, navigate]);

  useEffect(() => {
    if (searchParams.get("success") === "true") {
      safeToast.success("Order placed successfully!");
      // Clear the success param from URL
      navigate(`/orders/${id}`, { replace: true });
    }
  }, [searchParams, id, navigate]);

  const fetchOrder = async () => {
    try {
      setIsLoading(true);
      const response = await ordersAPI.getOrder(id);
      setOrder(response.data);
      setError("");
    } catch (err) {
      console.error("Error fetching order:", err);
      setError(err.response?.data?.message || "Failed to load order details");
      setOrder(null);
    } finally {
      setIsLoading(false);
    }
  };

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

  if (!isAuthenticated) {
    return null; // Redirect handled by useEffect
  }

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-16">
        <div className="flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin" />
          <span className="ml-2">Loading order details...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <h2 className="text-2xl font-bold text-destructive">Error</h2>
        <p className="text-muted-foreground">{error}</p>
        <Button onClick={() => navigate("/orders")} className="mt-4">
          Back to Orders
        </Button>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <h2 className="text-2xl font-bold">Order Not Found</h2>
        <p className="text-muted-foreground">
          The order you are looking for does not exist.
        </p>
        <Button onClick={() => navigate("/orders")} className="mt-4">
          Back to Orders
        </Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center space-x-2 mb-6">
        <Button variant="ghost" size="icon" onClick={() => navigate("/orders")}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <h1 className="text-3xl font-bold">Order Details</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Order Summary */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-xl font-semibold">
                Order #{order._id.substring(0, 8)}
              </CardTitle>
              <Badge variant={getStatusBadgeVariant(order.status)}>
                {order.status}
              </Badge>
            </CardHeader>
            <CardContent className="space-y-4">
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
                <CreditCard className="h-4 w-4 mr-2" />
                <span>Payment Method: {order.paymentMethod}</span>
              </div>
              <div className="flex items-center text-muted-foreground text-sm">
                {order.isPaid ? (
                  <CheckCircle className="h-4 w-4 mr-2 text-green-500" />
                ) : (
                  <XCircle className="h-4 w-4 mr-2 text-red-500" />
                )}
                <span>
                  Payment Status:{" "}
                  {order.isPaid
                    ? `Paid on ${new Date(order.paidAt).toLocaleDateString()}`
                    : "Not Paid"}
                </span>
              </div>
              <div className="flex items-center text-muted-foreground text-sm">
                {order.isDelivered ? (
                  <CheckCircle className="h-4 w-4 mr-2 text-green-500" />
                ) : (
                  <XCircle className="h-4 w-4 mr-2 text-red-500" />
                )}
                <span>
                  Delivery Status:{" "}
                  {order.isDelivered
                    ? `Delivered on ${new Date(
                        order.deliveredAt
                      ).toLocaleDateString()}`
                    : "Not Delivered"}
                </span>
              </div>
            </CardContent>
          </Card>

          {/* Order Items */}
          <Card>
            <CardHeader>
              <CardTitle>Order Items</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {order.orderItems.map((item) => (
                <div
                  key={item.product._id}
                  className="flex items-center space-x-4"
                >
                  <img
                    src={item.image || "/placeholder-product.jpg"}
                    alt={item.name}
                    className="w-20 h-20 object-cover rounded-md"
                  />
                  <div className="flex-1">
                    <h3 className="font-semibold">
                      <Link
                        to={`/products/${item.product}`}
                        className="hover:text-primary"
                      >
                        {item.name}
                      </Link>
                    </h3>
                    <p className="text-muted-foreground text-sm">
                      {item.quantity} x ${item.price.toFixed(2)} = $
                      {(item.quantity * item.price).toFixed(2)}
                    </p>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* Shipping Address */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <MapPin className="h-5 w-5" />
                <span>Shipping Address</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <p className="font-medium">{order.shippingAddress.fullName}</p>
              <p>{order.shippingAddress.address}</p>
              <p>
                {order.shippingAddress.city}, {order.shippingAddress.state}{" "}
              </p>
              <p>{order.shippingAddress.country}</p>
              <p>Phone: {order.shippingAddress.phone}</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default OrderDetail;
