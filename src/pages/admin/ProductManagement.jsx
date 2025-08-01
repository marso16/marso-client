import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { productsAPI } from "../../services/api";
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
import { Loader2, PlusCircle, Edit, Trash2, ArrowLeft } from "lucide-react";
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

const ProductManagement = () => {
  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedProductId, setSelectedProductId] = useState(null);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      setIsLoading(true);
      const response = await productsAPI.getProducts();
      setProducts(response.data.products);
      setError("");
    } catch (err) {
      console.error("Error fetching products:", err);
      setError(err.response?.data?.message || "Failed to load products");
      setProducts([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteProduct = async () => {
    try {
      await productsAPI.deleteProduct(selectedProductId);
      safeToast.success("Product deleted successfully!");
      fetchProducts();
    } catch (err) {
      safeToast.error(
        err.response?.data?.message || "Failed to delete product"
      );
    } finally {
      setSelectedProductId(null); // Reset after action
    }
  };

  const handleDeleteAllProducts = async () => {
    if (products.length === 0) {
      safeToast.error("There are no products to delete.");
      return;
    }

    try {
      await productsAPI.deleteAllProducts();
      safeToast.success("All products deleted successfully!");
      fetchProducts();
    } catch (err) {
      console.error("Failed to delete all products:", err);
      safeToast.error(
        err.response?.data?.message || "Failed to delete all products"
      );
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8 flex items-center justify-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin" />
        <span className="ml-2">Loading products...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8 text-center min-h-[60vh]">
        <h2 className="text-2xl font-bold text-destructive">Error</h2>
        <p className="text-muted-foreground">{error}</p>
        <Button onClick={fetchProducts} className="mt-4">
          Retry
        </Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div className="flex flex-col sm:flex-row sm:items-center gap-2">
          <Button variant="ghost" size="icon" asChild>
            <Link to="/admin">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <h1 className="text-2xl sm:text-3xl font-bold">Product Management</h1>
        </div>

        <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
          <Button asChild className="w-full sm:w-auto">
            <Link
              to="/admin/products/new"
              className="flex items-center justify-center"
            >
              <PlusCircle className="mr-2 h-4 w-4" />
              Add New Product
            </Link>
          </Button>

          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button
                variant="destructive"
                className="w-full sm:w-auto"
                disabled={products.length === 0}
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Delete All
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Delete All Products?</AlertDialogTitle>
                <AlertDialogDescription>
                  This will permanently remove <strong>all products</strong>.
                  This action cannot be undone.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  onClick={handleDeleteAllProducts}
                  disabled={products.length === 0}
                >
                  Yes, Delete All
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>

      {products.length === 0 ? (
        <div className="text-center py-12">
          <h3 className="text-lg font-semibold mb-2">No products found</h3>
          <p className="text-muted-foreground mb-4">
            Start by adding a new product.
          </p>
        </div>
      ) : (
        <>
          <p className="text-xs text-muted-foreground sm:hidden mb-2">
            Swipe left/right to view more columns.
          </p>

          <Card className="overflow-hidden">
            <CardContent className="p-4 overflow-x-auto">
              <Table className="min-w-full text-sm">
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[80px]">Image</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead className="text-right">Price</TableHead>
                    <TableHead className="text-right">Stock</TableHead>
                    <TableHead className="text-center">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {products.map((product) => (
                    <TableRow key={product._id}>
                      <TableCell className="align-middle">
                        <img
                          src={
                            product.images[0]?.url || "/placeholder-product.jpg"
                          }
                          alt={product.name}
                          className="w-14 h-14 object-cover rounded"
                        />
                      </TableCell>
                      <TableCell className="font-medium align-middle max-w-[150px] truncate">
                        {product.name}
                      </TableCell>
                      <TableCell className="align-middle text-muted-foreground">
                        {product.category}
                      </TableCell>
                      <TableCell className="text-right align-middle">
                        ${product.price.toFixed(2)}
                      </TableCell>
                      <TableCell className="text-right align-middle">
                        {product.stock}
                      </TableCell>
                      <TableCell className="align-middle">
                        <div className="flex flex-col sm:flex-row justify-center gap-2">
                          <Button variant="outline" size="icon" asChild>
                            <Link to={`/admin/products/${product._id}/edit`}>
                              <Edit className="h-4 w-4" />
                            </Link>
                          </Button>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button
                                variant="destructive"
                                size="icon"
                                onClick={() =>
                                  setSelectedProductId(product._id)
                                }
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>
                                  Delete Product?
                                </AlertDialogTitle>
                                <AlertDialogDescription>
                                  Are you sure you want to delete{" "}
                                  <strong>{product.name}</strong>? This action
                                  cannot be undone.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel
                                  onClick={() => setSelectedProductId(null)}
                                >
                                  Cancel
                                </AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={handleDeleteProduct}
                                >
                                  Yes, Delete
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
};

export default ProductManagement;
