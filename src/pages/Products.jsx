import React, { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  Star,
  ShoppingCart,
  Filter,
  Search,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { productsAPI } from "../services/api";
import { useCart } from "../context/CartContext";
import { safeToast } from "@/lib/utils";
import WishlistButton from "../components/WishlistButton";

const Products = () => {
  const [, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [pagination, setPagination] = useState({});
  const [filters, setFilters] = useState({ categories: [], brands: [] });
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();

  // Filter states
  const [priceRange, setPriceRange] = useState([0, 2000]);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedBrand, setSelectedBrand] = useState("");
  const [minRating, setMinRating] = useState(0);
  const [sortBy, setSortBy] = useState("newest");
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    // Initialize filters from URL params
    const category = searchParams.get("category") || "";
    const search = searchParams.get("search") || "";
    const brand = searchParams.get("brand") || "";
    const sort = searchParams.get("sortBy") || "newest";
    const minPrice = searchParams.get("minPrice") || "0";
    const maxPrice = searchParams.get("maxPrice") || "2000";
    const rating = searchParams.get("minRating") || "0";

    setSelectedCategory(category);
    setSearchQuery(search);
    setSelectedBrand(brand);
    setSortBy(sort);
    setPriceRange([parseInt(minPrice), parseInt(maxPrice)]);
    setMinRating(parseInt(rating));

    fetchProducts();
  }, [searchParams]);

  const fetchProducts = async () => {
    try {
      setIsLoading(true);
      const params = Object.fromEntries(searchParams);
      const response = await productsAPI.getProducts(params);
      setProducts(response.data.products);
      setFilteredProducts(response.data.products);
      setPagination(response.data.pagination);
      setFilters(response.data.filters);
    } catch (error) {
      console.error("Error fetching products:", error);
      safeToast.error("Failed to load products");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const params = new URLSearchParams(searchParams);
    if (searchQuery.trim() === "") {
      params.delete("search");
    } else {
      params.set("search", searchQuery);
    }
    setSearchParams(params);
  }, [searchQuery]);

  const updateFilters = (newFilters) => {
    const params = new URLSearchParams(searchParams);

    Object.entries(newFilters).forEach(([key, value]) => {
      if (value && value !== "" && value !== "0") {
        params.set(key, value);
      } else {
        params.delete(key);
      }
    });

    params.delete("page");

    setSearchParams(params);
  };

  const handleAddToCart = async (productId) => {
    const result = await addToCart(productId, 1);
    if (!result.success) {
      // Error is already handled in the context
    }
  };

  const handlePageChange = (page) => {
    const params = new URLSearchParams(searchParams);
    params.set("page", page.toString());
    setSearchParams(params);
  };

  const clearFilters = () => {
    setSearchParams(new URLSearchParams());
    setSelectedCategory("");
    setSelectedBrand("");
    setPriceRange([0, 2000]);
    setMinRating(0);
    setSortBy("newest");
    setSearchQuery("");
  };

  const ProductCard = ({ product }) => (
    <Card className="group hover:shadow-lg transition-all duration-300 overflow-hidden">
      <div className="relative aspect-[4/3] w-full bg-muted flex items-center justify-center overflow-hidden">
        <img
          src={product.images[0]?.url || "/placeholder-product.jpg"}
          alt={product.name}
          className="max-h-full max-w-full object-contain transition-transform duration-300 group-hover:scale-105"
        />
        {product.discount > 0 && (
          <Badge className="absolute top-2 left-2 bg-destructive">
            -{product.discount}%
          </Badge>
        )}
        {product.stock === 0 && (
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
            <Badge variant="secondary">Out of Stock</Badge>
          </div>
        )}
      </div>
      <CardContent className="list">
        <h3 className="font-semibold mb-2 line-clamp-2 text-lg">
          {product.name}
        </h3>
        <p className="text-muted-foreground text-sm mb-3 line-clamp-2">
          {product.description}
        </p>
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
        <div className="flex items-center space-x-2">
          <span className="text-2xl font-bold">${product.price}</span>
          {product.originalPrice && product.originalPrice > product.price && (
            <span className="text-muted-foreground line-through">
              ${product.originalPrice}
            </span>
          )}
        </div>
      </CardContent>
      <CardFooter className="p-4 pt-0 flex flex-col gap-2">
        <div className="flex gap-2 w-full">
          <Button
            variant="outline"
            className="flex-1"
            onClick={() => navigate(`/products/${product._id}`)}
          >
            View Details
          </Button>
          <Button
            className="flex-1"
            onClick={() => handleAddToCart(product._id)}
            disabled={product.stock === 0}
          >
            <ShoppingCart className="h-4 w-4 mr-2" />
            Add to Cart
          </Button>
        </div>
        <WishlistButton
          productId={product._id}
          size="sm"
          variant="outline"
          className="w-full"
        />
      </CardFooter>
    </Card>
  );

  const ProductSkeleton = () => (
    <Card>
      <Skeleton className="w-full h-48" />
      <CardContent className="p-4">
        <Skeleton className="h-6 w-3/4 mb-2" />
        <Skeleton className="h-4 w-full mb-2" />
        <Skeleton className="h-4 w-2/3 mb-3" />
        <Skeleton className="h-6 w-1/2" />
      </CardContent>
      <CardFooter className="p-4 pt-0 space-x-2">
        <Skeleton className="h-10 flex-1" />
        <Skeleton className="h-10 flex-1" />
      </CardFooter>
    </Card>
  );

  const FilterPanel = () => (
    <div className="space-y-6">
      {/* ... same as your original FilterPanel ... */}
      {/* Category filter */}
      <div>
        <h3 className="font-semibold mb-3">Category</h3>
        <Select
          value={selectedCategory || "all"}
          onValueChange={(value) => {
            setSelectedCategory(value === "all" ? "" : value);
            updateFilters({ category: value === "all" ? "" : value });
          }}
        >
          <SelectTrigger>
            <SelectValue placeholder="All Categories" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            {filters.categories.map((category) => (
              <SelectItem key={category} value={category}>
                {category}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      {/* Brand filter */}
      <div>
        <h3 className="font-semibold mb-3">Brand</h3>
        <Select
          value={selectedBrand || "all"}
          onValueChange={(value) => {
            setSelectedBrand(value === "all" ? "" : value);
            updateFilters({ brand: value === "all" ? "" : value });
          }}
        >
          <SelectTrigger>
            <SelectValue placeholder="All Brands" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Brands</SelectItem>
            {filters.brands.map((brand) => (
              <SelectItem key={brand} value={brand}>
                {brand}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      {/* Price Range filter */}
      <div>
        <h3 className="font-semibold mb-3">Price Range</h3>
        <div className="space-y-3">
          <Slider
            value={priceRange}
            onValueChange={setPriceRange}
            max={2000}
            step={10}
            className="w-full"
          />
          <div className="flex items-center space-x-2">
            <Input
              type="number"
              value={priceRange[0]}
              onChange={(e) =>
                setPriceRange([parseInt(e.target.value), priceRange[1]])
              }
              className="w-20"
            />
            <span>-</span>
            <Input
              type="number"
              value={priceRange[1]}
              onChange={(e) =>
                setPriceRange([priceRange[0], parseInt(e.target.value)])
              }
              className="w-20"
            />
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() =>
              updateFilters({
                minPrice: priceRange[0],
                maxPrice: priceRange[1],
              })
            }
          >
            Apply Price Filter
          </Button>
        </div>
      </div>
      {/* Minimum Rating filter */}
      <div>
        <h3 className="font-semibold mb-3">Minimum Rating</h3>
        <Select
          value={minRating.toString()}
          onValueChange={(value) => {
            setMinRating(parseInt(value));
            updateFilters({ minRating: value });
          }}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="0">All Ratings</SelectItem>
            <SelectItem value="1">1+ Stars</SelectItem>
            <SelectItem value="2">2+ Stars</SelectItem>
            <SelectItem value="3">3+ Stars</SelectItem>
            <SelectItem value="4">4+ Stars</SelectItem>
            <SelectItem value="5">5 Stars</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Button variant="outline" onClick={clearFilters} className="w-full">
        Clear All Filters
      </Button>
    </div>
  );

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-4">Products</h1>

        {/* Search and Sort */}
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="flex flex-1">
            <Input
              type="text"
              placeholder="Search products..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="rounded-r-none"
            />
            <Button className="rounded-l-none" disabled>
              <Search className="h-4 w-4" />
            </Button>
          </div>

          <div className="flex ">
            <Select
              value={sortBy}
              onValueChange={(value) => {
                setSortBy(value);
                updateFilters({ sortBy: value });
              }}
            >
              <SelectTrigger className="w-50">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="newest">Newest First</SelectItem>
                <SelectItem value="price_asc">Price: Low to High</SelectItem>
                <SelectItem value="price_desc">Price: High to Low</SelectItem>
                <SelectItem value="rating">Highest Rated</SelectItem>
                <SelectItem value="name">Name A-Z</SelectItem>
              </SelectContent>
            </Select>

            {/* Mobile filter button */}
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="outline" size="icon" className="md:hidden">
                  <Filter className="h-4 w-4" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left">
                <SheetHeader>
                  <SheetTitle>Filters</SheetTitle>
                  <SheetDescription>
                    Refine your product search
                  </SheetDescription>
                </SheetHeader>
                <div className="mt-6">
                  <FilterPanel />
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>

      <div className="flex gap-8">
        {/* Desktop Filters */}
        <div className="hidden md:block w-64 flex-shrink-0">
          <Card className="p-6">
            <h2 className="text-lg font-semibold mb-4">Filters</h2>
            <FilterPanel />
          </Card>
        </div>

        {/* Products */}
        <div className="flex-1">
          {isLoading ? (
            <div className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
              {[...Array(12)].map((_, i) => (
                <ProductSkeleton key={i} />
              ))}
            </div>
          ) : filteredProducts.length > 0 ? (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
                {filteredProducts.map((product) => (
                  <div key={product._id} className="flex">
                    <ProductCard product={product} />
                  </div>
                ))}
              </div>

              {/* Pagination */}
              {pagination.totalPages > 1 && (
                <div className="flex items-center justify-center space-x-2 mt-8">
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => handlePageChange(pagination.currentPage - 1)}
                    disabled={!pagination.hasPrev}
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>

                  {[...Array(pagination.totalPages)].map((_, i) => {
                    const page = i + 1;
                    if (
                      page === 1 ||
                      page === pagination.totalPages ||
                      (page >= pagination.currentPage - 1 &&
                        page <= pagination.currentPage + 1)
                    ) {
                      return (
                        <Button
                          key={page}
                          variant={
                            page === pagination.currentPage
                              ? "default"
                              : "outline"
                          }
                          onClick={() => handlePageChange(page)}
                        >
                          {page}
                        </Button>
                      );
                    } else if (
                      page === pagination.currentPage - 2 ||
                      page === pagination.currentPage + 2
                    ) {
                      return <span key={page}>...</span>;
                    }
                    return null;
                  })}

                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => handlePageChange(pagination.currentPage + 1)}
                    disabled={!pagination.hasNext}
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-12">
              <h3 className="text-lg font-semibold mb-2">No products found</h3>
              <p className="text-muted-foreground mb-4">
                Try adjusting your search criteria or filters
              </p>
              <Button onClick={clearFilters}>Clear Filters</Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Products;
