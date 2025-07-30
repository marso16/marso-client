import React, { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { productsAPI } from "../services/api";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";
import { Button } from "@/components/ui/button";
import { ShoppingCart, Plus, Minus, Loader2, Star } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { safeToast } from "@/lib/utils";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import WishlistButton from "../components/WishlistButton";

const reviewSchema = z.object({
  rating: z.coerce
    .number()
    .min(1, "Rating is required")
    .max(5, "Rating must be between 1 and 5"),
  comment: z
    .string()
    .min(5, "Comment must be at least 5 characters")
    .max(500, "Comment must be less than 500 characters"),
});

const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { isAuthenticated, user } = useAuth();

  const [product, setProduct] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [error, setError] = useState("");

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
    control,
  } = useForm({
    resolver: zodResolver(reviewSchema),
    defaultValues: {
      rating: "",
      comment: "",
    },
  });

  useEffect(() => {
    fetchProduct();
  }, [id]);

  const fetchProduct = async () => {
    try {
      setIsLoading(true);
      const response = await productsAPI.getProduct(id);
      if (!response.data || typeof response.data !== "object") {
        throw new Error("Invalid product data");
      }
      setProduct(response.data);
      setError("");
    } catch (err) {
      console.error("Error fetching product:", err);
      setError(err.response?.data?.message || "Failed to load product");
      setProduct(null);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddToCart = async () => {
    if (!isAuthenticated) {
      safeToast.error("Please login to add items to cart");
      navigate("/login");
      return;
    }
    const result = await addToCart(product._id, quantity);
    if (result.success) {
      // Cart context already shows toast
    }
  };

  const onReviewSubmit = async (data) => {
    try {
      await productsAPI.addReview(id, data);
      safeToast.success("Review added successfully!");
      reset(); // Clear form
      fetchProduct(); // Re-fetch product to show new review
    } catch (err) {
      safeToast.error(err.response?.data?.message || "Failed to add review");
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8 flex items-center justify-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin" />
        <span className="ml-2">Loading product...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8 text-center min-h-[60vh]">
        <h2 className="text-2xl font-bold text-destructive">Error</h2>
        <p className="text-muted-foreground">{error}</p>
        <Button onClick={() => navigate("/products")} className="mt-4">
          Back to Products
        </Button>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="container mx-auto px-4 py-8 text-center min-h-[60vh]">
        <h2 className="text-2xl font-bold">Product Not Found</h2>
        <p className="text-muted-foreground">
          The product you are looking for does not exist or is unavailable.
        </p>
        <Button onClick={() => navigate("/products")} className="mt-4">
          Back to Products
        </Button>
      </div>
    );
  }

  const hasReviewed = product.reviews.some(
    (review) => review.user._id === user?._id
  );

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Product Images */}
        <div className="flex flex-col items-center">
          <img
            src={product.images[0]?.url || "/placeholder-product.jpg"}
            alt={product.name}
            className="w-full max-w-lg h-auto object-contain rounded-lg shadow-md"
          />
          {product.images.length > 1 && (
            <div className="flex space-x-2 mt-4">
              {product.images.map((img, index) => (
                <img
                  key={index}
                  src={img.url}
                  alt={`${product.name} thumbnail ${index + 1}`}
                  className="w-20 h-20 object-cover rounded-md cursor-pointer border border-gray-200 hover:border-primary"
                />
              ))}
            </div>
          )}
        </div>

        {/* Product Details */}
        <div className="space-y-6">
          <h1 className="text-4xl font-bold">{product.name}</h1>
          <div className="flex items-center space-x-2">
            {[...Array(5)].map((_, i) => (
              <Star
                key={i}
                className={`h-5 w-5 ${
                  i < Math.floor(product.rating)
                    ? "text-yellow-400 fill-current"
                    : "text-gray-300"
                }`}
              />
            ))}
            <span className="text-lg text-muted-foreground">
              ({product.numReviews} reviews)
            </span>
          </div>

          {/* Description as bullet points */}
          <ul className="list-disc list-inside text-muted-foreground text-md whitespace-pre-line">
            {product.description
              .split("\n")
              .filter((line) => line.trim() !== "")
              .map((line, index) => (
                <li key={index}>{line.trim()}</li>
              ))}
          </ul>

          <div className="flex items-baseline space-x-4">
            <span className="text-3xl font-extrabold text-primary">
              ${product.price.toFixed(2)}
            </span>
            {product.originalPrice && product.originalPrice > product.price && (
              <span className="text-xl text-muted-foreground line-through">
                ${product.originalPrice.toFixed(2)}
              </span>
            )}
          </div>

          <div className="flex items-center space-x-2">
            <span className="font-semibold">Availability:</span>
            {product.stock > 0 ? (
              <Badge variant="success">In Stock ({product.stock})</Badge>
            ) : (
              <Badge variant="destructive">Out of Stock</Badge>
            )}
          </div>

          <div className="space-y-4">
            <div className="flex items-center space-x-4">
              <Label htmlFor="quantity" className="text-lg">
                Quantity:
              </Label>
              <div className="flex items-center space-x-2">
                <button
                  type="button"
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  disabled={quantity <= 1}
                  className="h-8 w-8 flex items-center justify-center border rounded"
                >
                  <Minus className="h-4 w-4" />
                </button>
                <div
                  id="quantity"
                  className="w-16 h-8 flex items-center justify-center border rounded text-center select-none"
                >
                  {quantity}
                </div>
                <button
                  type="button"
                  onClick={() =>
                    setQuantity((q) => Math.min(product.stock, q + 1))
                  }
                  disabled={quantity >= product.stock}
                  className="h-8 w-8 flex items-center justify-center border rounded"
                >
                  <Plus className="h-4 w-4" />
                </button>
              </div>
            </div>

            <div className="flex space-x-3">
              <Button
                size="lg"
                onClick={handleAddToCart}
                disabled={product.stock === 0}
                className="flex-1"
              >
                <ShoppingCart className="mr-2 h-5 w-5" />
                Add to Cart
              </Button>
              <WishlistButton productId={product._id} size="lg" />
            </div>
          </div>

          <Separator />

          <div className="space-y-2">
            <p>
              <span className="font-semibold">Category:</span>{" "}
              {product.category}
            </p>
            <p>
              <span className="font-semibold">Brand:</span> {product.brand}
            </p>
            <p>
              <span className="font-semibold">Seller:</span>{" "}
              {product.seller?.name || "Unknown"}
            </p>
          </div>
        </div>
      </div>

      {/* Reviews Section */}
      <div className="mt-16">
        <h2 className="text-3xl font-bold mb-6">
          Customer Reviews ({product.numReviews})
        </h2>

        {isAuthenticated && !hasReviewed ? (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Write a Review</CardTitle>
            </CardHeader>
            <CardContent>
              <form
                onSubmit={handleSubmit(onReviewSubmit)}
                className="space-y-4"
              >
                <div>
                  <div className="py-3">
                    <Label htmlFor="rating">Rating</Label>
                  </div>
                  <Controller
                    name="rating"
                    control={control}
                    render={({ field }) => (
                      <Select
                        value={field.value}
                        onValueChange={field.onChange}
                      >
                        <SelectTrigger className="w-[180px]">
                          <SelectValue placeholder="Select a rating" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="1">1 Star</SelectItem>
                          <SelectItem value="2">2 Stars</SelectItem>
                          <SelectItem value="3">3 Stars</SelectItem>
                          <SelectItem value="4">4 Stars</SelectItem>
                          <SelectItem value="5">5 Stars</SelectItem>
                        </SelectContent>
                      </Select>
                    )}
                  />
                  {errors.rating && (
                    <p className="text-sm text-destructive">
                      {errors.rating.message}
                    </p>
                  )}
                </div>

                <div>
                  <div className="py-3">
                    <Label htmlFor="comment">Comment</Label>
                  </div>
                  <Textarea
                    id="comment"
                    placeholder="Share your thoughts on this product..."
                    {...register("comment")}
                  />
                  {errors.comment && (
                    <p className="text-sm text-destructive">
                      {errors.comment.message}
                    </p>
                  )}
                </div>

                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Submitting...
                    </>
                  ) : (
                    "Submit Review"
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
        ) : isAuthenticated && hasReviewed ? (
          <Alert>
            <AlertDescription>
              You have already reviewed this product.
            </AlertDescription>
          </Alert>
        ) : (
          <Alert>
            <AlertDescription>
              Please{" "}
              <Link to="/login" className="text-primary hover:underline">
                log in
              </Link>{" "}
              to write a review.
            </AlertDescription>
          </Alert>
        )}

        {product.reviews.length === 0 ? (
          <p className="text-muted-foreground">
            No reviews yet. Be the first to review this product!
          </p>
        ) : (
          <div className="space-y-8">
            {product.reviews.map((review) => (
              <Card key={review._id}>
                <CardContent className="p-6">
                  <div className="flex items-center mb-2">
                    <div className="font-semibold mr-2">{review.user.name}</div>
                    <div className="flex items-center">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`h-4 w-4 ${
                            i < review.rating
                              ? "text-yellow-400 fill-current"
                              : "text-gray-300"
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                  <p className="text-muted-foreground text-sm mb-2">
                    {new Date(review.createdAt).toLocaleDateString()}
                  </p>
                  <p>{review.comment}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductDetail;
