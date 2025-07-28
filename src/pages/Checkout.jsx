import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { loadStripe } from "@stripe/stripe-js";
import {
  Elements,
  CardElement,
  useStripe,
  useElements,
} from "@stripe/react-stripe-js";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, CreditCard, Lock, ArrowLeft } from "lucide-react";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";
import { ordersAPI, paymentAPI } from "../services/api";
// import toast from "react-hot-toast";
import { safeToast } from "@/lib/utils";

// Initialize Stripe
let stripePromise;

const CheckoutForm = () => {
  const stripe = useStripe();
  const elements = useElements();
  const navigate = useNavigate();
  const { items, totalItems, clearCart } = useCart();
  const { user } = useAuth();

  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState("");
  const [clientSecret, setClientSecret] = useState("");
  const [orderId, setOrderId] = useState("");

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    defaultValues: {
      fullName: user?.name || "",
      email: user?.email || "",
      phone: user?.phone || "",
      address: user?.address?.street || "",
      city: user?.address?.city || "",
      state: user?.address?.state || "",
      country: user?.address?.country || "Lebanon",
    },
  });

  const calculateSubtotal = () => {
    return items.reduce((total, item) => total + item.price * item.quantity, 0);
  };

  const calculateTax = () => {
    return calculateSubtotal() * 0.08; // 8% tax
  };

  const calculateShipping = () => {
    return calculateSubtotal() > 70 ? 0 : 10;
  };

  const calculateTotal = () => {
    return calculateSubtotal() + calculateTax() + calculateShipping();
  };

  const createOrder = async (shippingData) => {
    try {
      const orderData = {
        shippingAddress: {
          fullName: shippingData.fullName,
          address: shippingData.address,
          city: shippingData.city,
          state: shippingData.state,
          country: shippingData.country,
          phone: shippingData.phone,
        },
        paymentMethod: "stripe",
      };

      const response = await ordersAPI.createOrder(orderData);
      return response.data.order;
    } catch (error) {
      throw new Error(
        error.response?.data?.message || "Failed to create order"
      );
    }
  };

  const createPaymentIntent = async (orderId) => {
    try {
      const response = await paymentAPI.createPaymentIntent(orderId);
      return response.data.clientSecret;
    } catch (error) {
      throw new Error(
        error.response?.data?.message || "Failed to create payment intent"
      );
    }
  };

  const onSubmit = async (data) => {
    if (!stripe || !elements) {
      return;
    }

    setIsProcessing(true);
    setError("");

    try {
      // Create order first
      const order = await createOrder(data);
      setOrderId(order._id);

      // Create payment intent
      const clientSecret = await createPaymentIntent(order._id);
      setClientSecret(clientSecret);

      // Confirm payment
      const cardElement = elements.getElement(CardElement);
      const { error: stripeError, paymentIntent } =
        await stripe.confirmCardPayment(clientSecret, {
          payment_method: {
            card: cardElement,
            billing_details: {
              name: data.fullName,
              email: data.email,
              phone: data.phone,
              address: {
                line1: data.address,
                city: data.city,
                state: data.state,
                country: "LB",
              },
            },
          },
        });

      if (stripeError) {
        setError(stripeError.message);
      } else if (paymentIntent.status === "succeeded") {
        // Confirm payment on backend
        await paymentAPI.confirmPayment({
          paymentIntentId: paymentIntent.id,
          orderId: order._id,
        });

        // Clear cart and redirect to success page
        await clearCart();
        safeToast.success("Payment successful! Order placed.");
        navigate(`/orders/${order._id}?success=true`);
      }
    } catch (error) {
      setError(error.message);
      safeToast.error(error.message);
    } finally {
      setIsProcessing(false);
    }
  };

  const cardElementOptions = {
    hidePostalCode: true,
    style: {
      base: {
        fontSize: "16px",
        color: "#424770",
        "::placeholder": {
          color: "#aab7c4",
        },
      },
      invalid: {
        color: "#9e2146",
      },
    },
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center space-x-2 mb-6">
        <Button variant="ghost" size="icon" onClick={() => navigate("/cart")}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <h1 className="text-3xl font-bold">Checkout</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Checkout Form */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <span>Shipping Information</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="fullName">Full Name *</Label>
                    <Input
                      id="fullName"
                      {...register("fullName", {
                        required: "Full name is required",
                      })}
                      className={errors.fullName ? "border-destructive" : ""}
                    />
                    {errors.fullName && (
                      <p className="text-sm text-destructive mt-1">
                        {errors.fullName.message}
                      </p>
                    )}
                  </div>
                  <div>
                    <Label htmlFor="email">Email *</Label>
                    <Input
                      id="email"
                      type="email"
                      {...register("email", {
                        required: "Email is required",
                        pattern: {
                          value: /^\S+@\S+$/i,
                          message: "Invalid email address",
                        },
                      })}
                      className={errors.email ? "border-destructive" : ""}
                    />
                    {errors.email && (
                      <p className="text-sm text-destructive mt-1">
                        {errors.email.message}
                      </p>
                    )}
                  </div>
                </div>

                <div>
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input id="phone" {...register("phone")} />
                </div>

                <div>
                  <Label htmlFor="address">Address *</Label>
                  <Input
                    id="address"
                    {...register("address", {
                      required: "Address is required",
                    })}
                    className={errors.address ? "border-destructive" : ""}
                  />
                  {errors.address && (
                    <p className="text-sm text-destructive mt-1">
                      {errors.address.message}
                    </p>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="city">City *</Label>
                    <Input
                      id="city"
                      {...register("city", { required: "City is required" })}
                      className={errors.city ? "border-destructive" : ""}
                    />
                    {errors.city && (
                      <p className="text-sm text-destructive mt-1">
                        {errors.city.message}
                      </p>
                    )}
                  </div>
                  <div>
                    <Label htmlFor="state">State *</Label>
                    <Input
                      id="state"
                      {...register("state", { required: "State is required" })}
                      className={errors.state ? "border-destructive" : ""}
                    />
                    {errors.state && (
                      <p className="text-sm text-destructive mt-1">
                        {errors.state.message}
                      </p>
                    )}
                  </div>
                </div>

                <div>
                  <Label htmlFor="country">Country *</Label>
                  <Input
                    id="country"
                    {...register("country", {
                      required: "Country is required",
                    })}
                    className={errors.country ? "border-destructive" : ""}
                  />
                  {errors.country && (
                    <p className="text-sm text-destructive mt-1">
                      {errors.country.message}
                    </p>
                  )}
                </div>

                <Separator className="my-6" />

                {/* Payment Information */}
                <div className="space-y-4">
                  <div className="flex items-center space-x-2">
                    <CreditCard className="h-5 w-5" />
                    <h3 className="text-lg font-semibold">
                      Payment Information
                    </h3>
                    <Lock className="h-4 w-4 text-muted-foreground" />
                  </div>

                  {error && (
                    <Alert variant="destructive">
                      <AlertDescription>{error}</AlertDescription>
                    </Alert>
                  )}

                  <div className="p-4 border rounded-lg">
                    <Label className="text-sm font-medium mb-2 block">
                      Card Details
                    </Label>
                    <CardElement options={cardElementOptions} />
                  </div>

                  <div className="text-sm text-muted-foreground flex items-center space-x-1">
                    <Lock className="h-3 w-3" />
                    <span>
                      Your payment information is secure and encrypted
                    </span>
                  </div>
                </div>

                <Button
                  type="submit"
                  className="w-full"
                  size="lg"
                  disabled={!stripe || isProcessing}
                >
                  {isProcessing ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Processing Payment...
                    </>
                  ) : (
                    `Pay $${calculateTotal().toFixed(2)}`
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>

        {/* Order Summary */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Order Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Order Items */}
              <div className="space-y-3">
                {items.map((item) => (
                  <div
                    key={item.product._id}
                    className="flex items-center space-x-3"
                  >
                    <img
                      src={
                        item.product.images[0]?.url ||
                        "/placeholder-product.jpg"
                      }
                      alt={item.product.name}
                      className="w-12 h-12 object-cover rounded"
                    />
                    <div className="flex-1">
                      <h4 className="font-medium text-sm">
                        {item.product.name}
                      </h4>
                      <p className="text-sm text-muted-foreground">
                        Qty: {item.quantity} × ${item.price.toFixed(2)}
                      </p>
                    </div>
                    <span className="font-medium">
                      ${(item.price * item.quantity).toFixed(2)}
                    </span>
                  </div>
                ))}
              </div>

              <Separator />

              {/* Pricing Breakdown */}
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>Subtotal ({totalItems} items)</span>
                  <span>${calculateSubtotal().toFixed(2)}</span>
                </div>

                <div className="flex justify-between">
                  <span>Tax (8%)</span>
                  <span>${calculateTax().toFixed(2)}</span>
                </div>

                <div className="flex justify-between">
                  <span>Shipping</span>
                  <span>
                    {calculateShipping() === 0 ? (
                      <span className="text-green-600">Free</span>
                    ) : (
                      `$${calculateShipping().toFixed(2)}`
                    )}
                  </span>
                </div>

                <Separator />

                <div className="flex justify-between text-lg font-semibold">
                  <span>Total</span>
                  <span>${calculateTotal().toFixed(2)}</span>
                </div>
              </div>

              {/* Security Notice */}
              <div className="bg-muted/50 p-3 rounded-lg">
                <div className="flex items-center space-x-2 text-sm">
                  <Lock className="h-4 w-4 text-green-600" />
                  <span>Secure SSL encrypted payment</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

const Checkout = () => {
  const { items, isLoading } = useCart();
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [stripeKey, setStripeKey] = useState("");

  useEffect(() => {
    // Get Stripe publishable key
    const getStripeKey = async () => {
      try {
        const response = await paymentAPI.getConfig();
        setStripeKey(response.data.publishableKey);
        stripePromise = loadStripe(response.data.publishableKey);
      } catch (error) {
        console.error("Error getting Stripe key:", error);
        safeToast.error("Failed to initialize payment system");
      }
    };

    getStripeKey();
  }, []);

  // Redirect if not authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/login", { state: { from: { pathname: "/checkout" } } });
    }
  }, [isAuthenticated, navigate]);

  // Redirect if cart is empty
  useEffect(() => {
    if (!isLoading && items.length === 0) {
      navigate("/cart");
    }
  }, [items, isLoading, navigate]);

  if (isLoading || !stripeKey) {
    return (
      <div className="container mx-auto px-4 py-16">
        <div className="flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin" />
          <span className="ml-2">Loading checkout...</span>
        </div>
      </div>
    );
  }

  if (!isAuthenticated || items.length === 0) {
    return null; // Will redirect
  }

  return (
    <Elements stripe={stripePromise}>
      <CheckoutForm />
    </Elements>
  );
};

export default Checkout;
