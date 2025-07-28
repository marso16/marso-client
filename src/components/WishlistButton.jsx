import React, { useState, useEffect } from "react";
import { Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "../context/AuthContext";
import { wishlistAPI } from "../services/api";
// import toast from "react-hot-toast";
import { safeToast } from "@/lib/utils";

const WishlistButton = ({
  productId,
  size = "default",
  variant = "outline",
  className = "",
}) => {
  const [isInWishlist, setIsInWishlist] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    if (user && productId) {
      checkWishlistStatus();
    }
  }, [user, productId]);

  const checkWishlistStatus = async () => {
    try {
      const response = await wishlistAPI.checkWishlistStatus(productId);
      setIsInWishlist(response.data.inWishlist);
    } catch (error) {
      console.error("Error checking wishlist status:", error);
    }
  };

  const handleWishlistToggle = async () => {
    if (!user) {
      safeToast.error("Please login to add items to wishlist");
      return;
    }

    setIsLoading(true);
    try {
      if (isInWishlist) {
        await wishlistAPI.removeFromWishlist(productId);
        setIsInWishlist(false);
        safeToast.success("Removed from wishlist");
      } else {
        await wishlistAPI.addToWishlist(productId);
        setIsInWishlist(true);
        safeToast.success("Added to wishlist");
      }
    } catch (error) {
      console.error("Error toggling wishlist:", error);
      safeToast.error(
        error.response?.data?.message || "Failed to update wishlist"
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button
      size={size}
      variant={variant}
      onClick={handleWishlistToggle}
      disabled={isLoading}
      className={`${
        isInWishlist
          ? "text-red-500 border-red-500 hover:bg-red-50"
          : "hover:text-red-500 hover:border-red-500"
      } transition-colors duration-200 ${className}`}
    >
      <Heart
        className={`h-4 w-4 ${isInWishlist ? "fill-current" : ""} ${
          size === "sm" ? "h-3 w-3" : size === "lg" ? "h-5 w-5" : "h-4 w-4"
        }`}
      />
      {size !== "sm" && (
        <span className="ml-2">
          {isInWishlist ? "Remove from Wishlist" : "Add to Wishlist"}
        </span>
      )}
    </Button>
  );
};

export default WishlistButton;
