import React, { useState, useEffect } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import { productsAPI } from "../../services/api";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, ArrowLeft } from "lucide-react";
import { safeToast } from "@/lib/utils";

const productSchema = z.object({
  name: z
    .string()
    .min(2, "Product name must be at least 2 characters")
    .max(100, "Product name must be less than 100 characters"),
  description: z
    .string()
    .min(10, "Description must be at least 10 characters")
    .max(2000, "Description must be less than 2000 characters"),
  price: z.coerce.number().min(0, "Price must be a positive number"),
  category: z.string().min(1, "Category is required"),
  brand: z.string().min(1, "Brand is required"),
  stock: z.coerce.number().min(0, "Stock must be a non-negative integer"),
  images: z
    .array(
      z.object({
        url: z.string().url("Invalid image URL"),
        alt: z.string().optional(),
      })
    )
    .optional(),
});

const ProductForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditing = Boolean(id);

  const [isLoading, setIsLoading] = useState(isEditing);
  const [error, setError] = useState("");
  const [imageUrls, setImageUrls] = useState([""]);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
    watch,
  } = useForm({
    resolver: zodResolver(productSchema),
    defaultValues: {
      name: "",
      description: "",
      price: 0,
      category: "",
      brand: "",
      stock: 0,
    },
  });

  const watchDescription = watch("description");

  useEffect(() => {
    if (isEditing) {
      fetchProduct();
    }
  }, [id, isEditing]);

  const fetchProduct = async () => {
    try {
      setIsLoading(true);
      const response = await productsAPI.getProduct(id);
      const product = response.data;

      reset({
        name: product.name,
        description: product.description,
        price: product.price,
        category: product.category,
        brand: product.brand,
        stock: product.stock,
      });

      setImageUrls(
        product.images.length > 0 ? product.images.map((img) => img.url) : [""]
      );
      setError("");
    } catch (err) {
      console.error("Error fetching product:", err);
      setError(err.response?.data?.message || "Failed to load product");
    } finally {
      setIsLoading(false);
    }
  };

  const onSubmit = async (data) => {
    try {
      const validImageUrls = imageUrls.filter((url) => url.trim() !== "");
      const productData = {
        ...data,
        images: validImageUrls.map((url) => ({ url, alt: data.name })),
      };

      if (isEditing) {
        await productsAPI.updateProduct(id, productData);
        safeToast.success("Product updated successfully!");
      } else {
        await productsAPI.createProduct(productData);
        safeToast.success("Product created successfully!");
      }

      navigate("/admin/products");
    } catch (err) {
      safeToast.error(
        err.response?.data?.message ||
          `Failed to ${isEditing ? "update" : "create"} product`
      );
    }
  };

  const handleImageUrlChange = (index, value) => {
    const newImageUrls = [...imageUrls];
    newImageUrls[index] = value;
    setImageUrls(newImageUrls);
  };

  const addImageUrl = () => {
    setImageUrls([...imageUrls, ""]);
  };

  const removeImageUrl = (index) => {
    if (imageUrls.length > 1) {
      const newImageUrls = imageUrls.filter((_, i) => i !== index);
      setImageUrls(newImageUrls);
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
        <Button onClick={() => navigate("/admin/products")} className="mt-4">
          Back to Products
        </Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center space-x-2 mb-6">
        <Button variant="ghost" size="icon" asChild>
          <Link to="/admin/products">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <h1 className="text-3xl font-bold">
          {isEditing ? "Edit Product" : "Add New Product"}
        </h1>
      </div>

      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle>
            {isEditing ? "Edit Product" : "Add New Product"}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <Label htmlFor="name">Product Name</Label>
              <Input id="name" {...register("name")} />
              {errors.name && (
                <p className="text-sm text-destructive">
                  {errors.name.message}
                </p>
              )}
            </div>

            <div>
              <Label htmlFor="description">
                Description{" "}
                <span className="text-muted-foreground">
                  (Enter one bullet point per line)
                </span>
              </Label>
              <Textarea
                id="description"
                placeholder={`Example:\n- High-quality material\n- Lightweight and durable\n- 2-year warranty`}
                {...register("description")}
                rows={6}
              />
              {errors.description && (
                <p className="text-sm text-destructive">
                  {errors.description.message}
                </p>
              )}
              {watchDescription?.trim() && (
                <div className="mt-2 p-2 border rounded bg-muted text-sm">
                  <p className="font-semibold mb-1">Preview:</p>
                  <ul className="list-disc list-inside">
                    {watchDescription
                      .split("\n")
                      .filter((line) => line.trim() !== "")
                      .map((line, idx) => (
                        <li key={idx}>{line.trim()}</li>
                      ))}
                  </ul>
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="price">Price ($)</Label>
                <Input
                  id="price"
                  type="number"
                  step="0.01"
                  {...register("price")}
                />
                {errors.price && (
                  <p className="text-sm text-destructive">
                    {errors.price.message}
                  </p>
                )}
              </div>
              <div>
                <Label htmlFor="stock">Stock</Label>
                <Input id="stock" type="number" {...register("stock")} />
                {errors.stock && (
                  <p className="text-sm text-destructive">
                    {errors.stock.message}
                  </p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="category">Category</Label>
                <Input id="category" {...register("category")} />
                {errors.category && (
                  <p className="text-sm text-destructive">
                    {errors.category.message}
                  </p>
                )}
              </div>
              <div>
                <Label htmlFor="brand">Brand</Label>
                <Input id="brand" {...register("brand")} />
                {errors.brand && (
                  <p className="text-sm text-destructive">
                    {errors.brand.message}
                  </p>
                )}
              </div>
            </div>

            <div>
              <Label>Product Images</Label>
              {imageUrls.map((url, index) => (
                <div key={index} className="flex items-center space-x-2 mt-2">
                  <Input
                    type="url"
                    placeholder="Image URL"
                    value={url}
                    onChange={(e) =>
                      handleImageUrlChange(index, e.target.value)
                    }
                    className="flex-1"
                  />
                  {imageUrls.length > 1 && (
                    <Button
                      type="button"
                      variant="destructive"
                      size="sm"
                      onClick={() => removeImageUrl(index)}
                    >
                      Remove
                    </Button>
                  )}
                </div>
              ))}
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={addImageUrl}
                className="mt-2"
              >
                Add Another Image
              </Button>
            </div>

            <div className="flex justify-end space-x-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate("/admin/products")}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {isEditing ? "Updating..." : "Creating..."}
                  </>
                ) : isEditing ? (
                  "Update Product"
                ) : (
                  "Create Product"
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default ProductForm;
