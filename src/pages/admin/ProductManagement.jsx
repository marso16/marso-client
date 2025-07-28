import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { productsAPI } from "../../services/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Loader2, PlusCircle, Edit, Trash2, ArrowLeft } from "lucide-react";
// import { toast } from "react-hot-toast";
import { safeToast } from "@/lib/utils";

const ProductManagement = () => {
  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      setIsLoading(true);
      const response = await productsAPI.getProducts(); // Assuming admin can get all products without pagination for management
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

  const handleDeleteProduct = async (productId) => {
    if (window.confirm("Are you sure you want to delete this product?")) {
      try {
        await productsAPI.deleteProduct(productId);
        safeToast.success("Product deleted successfully!");
        fetchProducts(); // Refresh the list
      } catch (err) {
        safeToast.error(
          err.response?.data?.message || "Failed to delete product"
        );
      }
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
      {/* <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-2">
          <Button variant="ghost" size="icon" asChild>
            <Link to="/admin"><ArrowLeft className="h-4 w-4" /></Link>
          </Button>
          <h1 className="text-3xl font-bold">Product Management</h1>
        </div>
        <Button asChild>
          <Link to="/admin/products/new">
            <PlusCircle className="mr-2 h-4 w-4" />
            Add New Product
          </Link>
        </Button>
      </div> */}

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div className="flex flex-col sm:flex-row sm:items-center gap-2">
          <Button variant="ghost" size="icon" asChild>
            <Link to="/admin">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <h1 className="text-2xl sm:text-3xl font-bold">Product Management</h1>
        </div>

        <Button asChild className="w-full sm:w-auto">
          <Link
            to="/admin/products/new"
            className="flex items-center justify-center"
          >
            <PlusCircle className="mr-2 h-4 w-4" />
            Add New Product
          </Link>
        </Button>
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
                          <Button
                            variant="destructive"
                            size="icon"
                            onClick={() => handleDeleteProduct(product._id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
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
