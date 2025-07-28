import React, { useState, useEffect, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
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
import {
  ShoppingCart,
  Plus,
  Minus,
  Trash2,
  ArrowLeft,
  ShoppingBag,
  Loader2,
} from "lucide-react";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";
import debounce from "lodash.debounce";

const Cart = () => {
  const { items, updateCartItem, removeFromCart, clearCart, isLoading } =
    useCart();
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  // Manage local quantities state keyed by product ID
  const [localQuantities, setLocalQuantities] = useState({});

  // Initialize localQuantities when items change
  useEffect(() => {
    const quantities = items.reduce((acc, item) => {
      acc[item.product._id] = item.quantity;
      return acc;
    }, {});
    setLocalQuantities(quantities);
  }, [items]);

  // Derive totalItems from localQuantities for instant UI sync
  const totalItems = useMemo(() => {
    return Object.values(localQuantities).reduce((sum, qty) => sum + qty, 0);
  }, [localQuantities]);

  // Calculate subtotal based on localQuantities
  const calculateSubtotal = useMemo(() => {
    return items.reduce((total, item) => {
      const qty = localQuantities[item.product._id] ?? item.quantity;
      return total + item.price * qty;
    }, 0);
  }, [items, localQuantities]);

  // const calculateTax = () => {
  //   return calculateSubtotal * 0.08; // 8% tax
  // };

  // const calculateShipping = () => {
  //   return calculateSubtotal > 70 ? 0 : 10; // Free shipping over $70
  // };

  // const calculateTotal = () => {
  //   return calculateSubtotal + calculateTax() + calculateShipping();
  // };

  // Debounced updateCartItem function
  const debouncedUpdate = useMemo(
    () =>
      debounce((productId, qty) => {
        updateCartItem(productId, qty);
      }, 400),
    [updateCartItem]
  );

  const handleQuantityChange = (productId, newQuantity, stock) => {
    if (newQuantity < 1 || newQuantity > stock) return;

    setLocalQuantities((prev) => ({
      ...prev,
      [productId]: newQuantity,
    }));

    debouncedUpdate(productId, newQuantity);
  };

  const handleRemoveItem = async (productId) => {
    await removeFromCart(productId);
  };

  const handleClearCart = async () => {
    await clearCart();
  };

  if (!isAuthenticated) {
    return (
      <div className="container mx-auto px-4 py-16">
        <div className="text-center max-w-md mx-auto">
          <ShoppingCart className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
          <h2 className="text-2xl font-bold mb-4">Please Login to View Cart</h2>
          <p className="text-muted-foreground mb-6">
            You need to be logged in to access your shopping cart.
          </p>
          <div className="space-x-4">
            <Button onClick={() => navigate("/login")}>Login</Button>
            <Button variant="outline" onClick={() => navigate("/register")}>
              Sign Up
            </Button>
          </div>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-16">
        <div className="flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin" />
          <span className="ml-2">Loading cart...</span>
        </div>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="container mx-auto px-4 py-16">
        <div className="text-center max-w-md mx-auto">
          <ShoppingBag className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
          <h2 className="text-2xl font-bold mb-4">Your Cart is Empty</h2>
          <p className="text-muted-foreground mb-6">
            Looks like you haven't added any items to your cart yet.
          </p>
          <Button onClick={() => navigate("/products")}>
            Continue Shopping
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center space-x-2 mb-6">
        <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <h1 className="text-3xl font-bold">Shopping Cart</h1>
        <Badge variant="secondary" className="ml-2">
          {totalItems} {totalItems === 1 ? "item" : "items"}
        </Badge>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Cart Items */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">Cart Items</h2>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="outline" size="sm">
                  <Trash2 className="h-4 w-4 mr-2" />
                  Clear Cart
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Clear Cart</AlertDialogTitle>
                  <AlertDialogDescription>
                    Are you sure you want to remove all items from your cart?
                    This action cannot be undone.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={handleClearCart}>
                    Clear Cart
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>

          {items.map((item) => (
            <CartItem
              key={item.product._id}
              item={item}
              quantity={localQuantities[item.product._id] ?? item.quantity}
              onQuantityChange={handleQuantityChange}
              onRemove={handleRemoveItem}
            />
          ))}
        </div>

        {/* Order Summary */}
        <div className="lg:col-span-1">
          <Card className="sticky top-4">
            <CardHeader>
              <CardTitle>Order Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between">
                <span>Subtotal ({totalItems} items)</span>
                <span>${calculateSubtotal.toFixed(2)}</span>
              </div>

              <div className="flex justify-between">
                <span>Tax (8%)</span>
                <span>${(calculateSubtotal * 0.08).toFixed(2)}</span>
              </div>

              <div className="flex justify-between">
                <span>Shipping</span>
                <span>
                  {calculateSubtotal > 70 ? (
                    <span className="text-green-600">Free</span>
                  ) : (
                    `$${(calculateSubtotal > 70 ? 0 : 10).toFixed(2)}`
                  )}
                </span>
              </div>

              {calculateSubtotal < 100 && (
                <div className="text-sm text-muted-foreground">
                  Add ${(100 - calculateSubtotal).toFixed(2)} more for free
                  shipping
                </div>
              )}

              <Separator />

              <div className="flex justify-between text-lg font-semibold">
                <span>Total</span>
                <span>
                  $
                  {(
                    calculateSubtotal +
                    calculateSubtotal * 0.08 +
                    (calculateSubtotal > 70 ? 0 : 10)
                  ).toFixed(2)}
                </span>
              </div>
            </CardContent>
            <CardFooter className="flex flex-col space-y-2">
              <Button
                className="w-full"
                size="lg"
                onClick={() => navigate("/checkout")}
              >
                Proceed to Checkout
              </Button>
              <Button
                variant="outline"
                className="w-full"
                onClick={() => navigate("/products")}
              >
                Continue Shopping
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  );
};

const CartItem = ({ item, quantity, onQuantityChange, onRemove }) => {
  const productId = item.product._id;
  const stock = item.product.stock;

  return (
    <Card key={productId}>
      <CardContent className="p-6">
        <div className="flex flex-col md:flex-row gap-4">
          {/* Product Image */}
          <div className="w-full md:w-32 h-32 flex-shrink-0">
            <img
              src={item.product.images[0]?.url || "/placeholder-product.jpg"}
              alt={item.product.name}
              className="w-full h-full object-cover rounded-lg"
            />
          </div>

          {/* Product Details */}
          <div className="flex-1 space-y-2">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="font-semibold text-lg">
                  <Link
                    to={`/products/${productId}`}
                    className="hover:text-primary transition-colors"
                  >
                    {item.product.name}
                  </Link>
                </h3>
                <p className="text-muted-foreground text-sm">
                  {item.product.description?.substring(0, 100)}...
                </p>
              </div>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="ghost" size="icon">
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Remove Item</AlertDialogTitle>
                    <AlertDialogDescription>
                      Are you sure you want to remove "{item.product.name}" from
                      your cart?
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={() => onRemove(productId)}>
                      Remove
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-2 gap-y-2">
                <span className="text-sm text-muted-foreground">Quantity</span>
                <div className="flex items-center space-x-1">
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() =>
                      onQuantityChange(productId, quantity - 1, stock)
                    }
                    disabled={quantity <= 1}
                  >
                    <Minus className="h-3 w-3" />
                  </Button>

                  <div className="w-16 h-8 flex items-center justify-center border rounded text-sm">
                    {quantity}
                  </div>

                  <Button
                    variant="outline"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() =>
                      onQuantityChange(productId, quantity + 1, stock)
                    }
                    disabled={quantity >= stock}
                  >
                    <Plus className="h-3 w-3" />
                  </Button>
                </div>

                {stock < 10 && (
                  <Badge variant="destructive" className="text-xs sm:ml-2">
                    Only {stock} left
                  </Badge>
                )}
              </div>

              <div className="text-left sm:text-right">
                <div className="text-base sm:text-lg font-semibold">
                  ${(item.price * quantity).toFixed(2)}
                </div>
                <div className="text-xs sm:text-sm text-muted-foreground">
                  ${item.price.toFixed(2)} each
                </div>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default Cart;
