import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
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
  Heart,
  ShoppingCart,
  Trash2,
  Share2,
  Eye,
  Star,
  Package,
} from "lucide-react";
import { wishlistAPI } from "../services/api";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";
// import toast from "react-hot-toast";
import { safeToast } from "@/lib/utils";

const Wishlist = () => {
  const [wishlist, setWishlist] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isClearing, setIsClearing] = useState(false);
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      fetchWishlist();
    } else {
      navigate("/login");
    }
  }, [user, navigate]);

  const fetchWishlist = async () => {
    try {
      const response = await wishlistAPI.getWishlist();
      setWishlist(response.data.wishlist);
    } catch (error) {
      console.error("Error fetching wishlist:", error);
      safeToast.error("Failed to load wishlist");
    } finally {
      setIsLoading(false);
    }
  };

  const handleRemoveFromWishlist = async (productId) => {
    try {
      await wishlistAPI.removeFromWishlist(productId);
      setWishlist((prev) => ({
        ...prev,
        products: prev.products.filter(
          (item) => item.product._id !== productId
        ),
      }));
      safeToast.success("Removed from wishlist");
    } catch (error) {
      console.error("Error removing from wishlist:", error);
      safeToast.error("Failed to remove from wishlist");
    }
  };

  const handleAddToCart = async (productId) => {
    const result = await addToCart(productId, 1);
    if (result.success) {
      // Optionally remove from wishlist after adding to cart
      // handleRemoveFromWishlist(productId);
    }
  };

  const handleMoveToCart = async (productId) => {
    try {
      await wishlistAPI.moveToCart(productId, 1);
      setWishlist((prev) => ({
        ...prev,
        products: prev.products.filter(
          (item) => item.product._id !== productId
        ),
      }));
      safeToast.success("Moved to cart");
    } catch (error) {
      console.error("Error moving to cart:", error);
      safeToast.error("Failed to move to cart");
    }
  };

  const handleClearWishlist = async () => {
    setIsClearing(true);
    try {
      await wishlistAPI.clearWishlist();
      setWishlist((prev) => ({ ...prev, products: [] }));
      safeToast.success("Wishlist cleared");
    } catch (error) {
      console.error("Error clearing wishlist:", error);
      safeToast.error("Failed to clear wishlist");
    } finally {
      setIsClearing(false);
    }
  };

  const handleShareWishlist = async () => {
    try {
      const response = await wishlistAPI.generateShareToken();
      const shareUrl = response.data.shareUrl;

      if (navigator.share) {
        await navigator.share({
          title: "My Wishlist",
          text: "Check out my wishlist!",
          url: shareUrl,
        });
      } else {
        await navigator.clipboard.writeText(shareUrl);
        safeToast.success("Share link copied to clipboard");
      }
    } catch (error) {
      console.error("Error sharing wishlist:", error);
      safeToast.error("Failed to share wishlist");
    }
  };

  const ProductCard = ({ item }) => {
    const { product, addedAt, notes } = item;

    return (
      <Card className="group hover:shadow-lg transition-all duration-300">
        <div className="relative overflow-hidden">
          <img
            src={product.images?.[0]?.url || "/placeholder-product.jpg"}
            alt={product.name}
            className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
          />
          {product.discount > 0 && (
            <Badge className="absolute top-2 left-2 bg-destructive">
              -{product.discount}%
            </Badge>
          )}
          <div className="absolute top-2 right-2">
            <Button
              size="sm"
              variant="outline"
              className="bg-white/90 hover:bg-white"
              onClick={() => handleRemoveFromWishlist(product._id)}
            >
              <Heart className="h-4 w-4 text-red-500 fill-current" />
            </Button>
          </div>
        </div>

        <CardContent className="p-4">
          <h3 className="font-semibold text-lg mb-2 line-clamp-2">
            {product.name}
          </h3>

          <div className="flex items-center space-x-1 mb-2">
            {[...Array(5)].map((_, i) => (
              <Star
                key={i}
                className={`h-4 w-4 ${
                  i < Math.floor(product.rating)
                    ? "text-yellow-400 fill-current"
                    : "text-gray-300"
                }`}
              />
            ))}
            <span className="text-sm text-muted-foreground ml-1">
              ({product.numReviews})
            </span>
          </div>

          <div className="flex items-center space-x-2 mb-3">
            <span className="text-2xl font-bold">${product.price}</span>
            {product.originalPrice && product.originalPrice > product.price && (
              <span className="text-muted-foreground line-through">
                ${product.originalPrice}
              </span>
            )}
          </div>

          {notes && (
            <p className="text-sm text-muted-foreground mb-3 italic">
              Note: {notes}
            </p>
          )}

          <p className="text-xs text-muted-foreground">
            Added {new Date(addedAt).toLocaleDateString()}
          </p>
        </CardContent>

        <CardFooter className="p-4 pt-0 flex flex-col gap-2">
          <div className="flex gap-2 w-full">
            <Button
              variant="outline"
              className="flex-1"
              onClick={() => navigate(`/products/${product._id}`)}
            >
              <Eye className="h-4 w-4 mr-2" />
              View
            </Button>
            <Button
              className="flex-1"
              onClick={() => handleMoveToCart(product._id)}
              disabled={!product.isActive}
            >
              <ShoppingCart className="h-4 w-4 mr-2" />
              Move to Cart
            </Button>
          </div>
          <Button
            variant="outline"
            className="w-full"
            onClick={() => handleAddToCart(product._id)}
            disabled={!product.isActive}
          >
            <Package className="h-4 w-4 mr-2" />
            Add to Cart
          </Button>
        </CardFooter>
      </Card>
    );
  };

  const ProductSkeleton = () => (
    <Card>
      <Skeleton className="h-48 w-full" />
      <CardContent className="p-4">
        <Skeleton className="h-6 w-3/4 mb-2" />
        <Skeleton className="h-4 w-full mb-2" />
        <Skeleton className="h-6 w-1/2 mb-3" />
        <Skeleton className="h-4 w-1/3" />
      </CardContent>
      <CardFooter className="p-4 pt-0 space-y-2">
        <div className="flex space-x-2 w-full">
          <Skeleton className="h-10 flex-1" />
          <Skeleton className="h-10 flex-1" />
        </div>
        <Skeleton className="h-10 w-full" />
      </CardFooter>
    </Card>
  );

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <Skeleton className="h-8 w-48" />
          <div className="flex space-x-2">
            <Skeleton className="h-10 w-24" />
            <Skeleton className="h-10 w-24" />
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {[...Array(8)].map((_, i) => (
            <ProductSkeleton key={i} />
          ))}
        </div>
      </div>
    );
  }

  if (!wishlist || wishlist.products.length === 0) {
    return (
      <div className="container mx-auto px-4 py-16">
        <div className="text-center max-w-md mx-auto">
          <Heart className="h-24 w-24 text-muted-foreground mx-auto mb-6" />
          <h1 className="text-3xl font-bold mb-4">Your Wishlist is Empty</h1>
          <p className="text-muted-foreground mb-8">
            Start adding products you love to your wishlist and keep track of
            items you want to buy later.
          </p>
          <Button size="lg" onClick={() => navigate("/products")}>
            Start Shopping
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8 space-y-4 sm:space-y-0">
        <div>
          <h1 className="text-3xl font-bold mb-2">My Wishlist</h1>
          <p className="text-muted-foreground">
            {wishlist.products.length} item
            {wishlist.products.length !== 1 ? "s" : ""} in your wishlist
          </p>
        </div>

        <div className="flex space-x-2">
          <Button variant="outline" onClick={handleShareWishlist}>
            <Share2 className="h-4 w-4 mr-2" />
            Share
          </Button>

          {wishlist.products.length > 0 && (
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="outline" disabled={isClearing}>
                  <Trash2 className="h-4 w-4 mr-2" />
                  Clear All
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Clear Wishlist</AlertDialogTitle>
                  <AlertDialogDescription>
                    Are you sure you want to remove all items from your
                    wishlist? This action cannot be undone.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={handleClearWishlist}>
                    Clear All
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          )}
        </div>
      </div>

      {/* Products Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {wishlist.products.map((item) => (
          <ProductCard key={item.product._id} item={item} />
        ))}
      </div>

      {/* Add to Cart All Button */}
      {wishlist.products.length > 0 && (
        <div className="mt-12 text-center">
          <Button
            size="lg"
            onClick={() => {
              wishlist.products.forEach((item) => {
                if (item.product.isActive) {
                  handleAddToCart(item.product._id);
                }
              });
            }}
            className="px-8"
          >
            <ShoppingCart className="h-5 w-5 mr-2" />
            Add All to Cart
          </Button>
        </div>
      )}
    </div>
  );
};

export default Wishlist;
