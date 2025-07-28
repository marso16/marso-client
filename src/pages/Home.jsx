import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import {
  Star,
  ShoppingCart,
  ArrowRight,
  Zap,
  Shield,
  Truck,
  RotateCcw,
} from "lucide-react";
import { productsAPI } from "../services/api";
import { useCart } from "../context/CartContext";
import { safeToast } from "@/lib/utils";
// import toast from "react-hot-toast";

const Home = () => {
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();
  const { addToCart } = useCart();

  useEffect(() => {
    fetchFeaturedProducts();
  }, []);

  const fetchFeaturedProducts = async () => {
    try {
      const response = await productsAPI.getFeaturedProducts();
      setFeaturedProducts(response.data);
    } catch (error) {
      console.error("Error fetching featured products:", error);
      safeToast.error("Failed to load featured products");
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddToCart = async (productId) => {
    const result = await addToCart(productId, 1);
    if (!result.success) {
      // Error is already handled in the context
    }
  };

  const ProductCard = ({ product }) => (
    <Card className="group hover:shadow-lg transition-all duration-300 overflow-hidden">
      <div className="relative overflow-hidden">
        <img
          src={product.images[0]?.url || "/placeholder-product.jpg"}
          alt={product.name}
          className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
        />
        {product.discount > 0 && (
          <Badge className="absolute top-2 left-2 bg-destructive">
            -{product.discount}%
          </Badge>
        )}
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300" />
      </div>
      <CardContent className="p-4">
        <h3 className="font-semibold text-lg mb-2 line-clamp-2">
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
      <CardFooter className="p-4 pt-0 space-x-2">
        <Button
          variant="outline"
          className="flex-1"
          onClick={() => navigate(`/products/${product._id}`)}
        >
          View Details
        </Button>
        <Button className="flex-1" onClick={() => handleAddToCart(product._id)}>
          <ShoppingCart className="h-4 w-4 mr-2" />
          Add to Cart
        </Button>
      </CardFooter>
    </Card>
  );

  const ProductSkeleton = () => (
    <Card>
      <Skeleton className="h-48 w-full" />
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

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-r from-primary to-primary/80 text-primary-foreground">
        <div className="container mx-auto px-4 py-20">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <h1 className="text-4xl md:text-6xl font-bold leading-tight">
                Discover Amazing Products at
                <span className="block text-yellow-300">Unbeatable Prices</span>
              </h1>
              <p className="text-xl text-primary-foreground/90">
                Shop from thousands of products across multiple categories.
                Quality guaranteed, fast shipping, and excellent customer
                service.
              </p>
              <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
                <Button
                  size="lg"
                  variant="secondary"
                  onClick={() => navigate("/products")}
                  className="text-lg px-8"
                >
                  Shop Now
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
                {/* <Button
                  size="lg"
                  variant="outline"
                  onClick={() => navigate("/deals")}
                  className="text-lg px-8 border-primary-foreground text-primary-foreground hover:bg-primary-foreground hover:text-primary"
                >
                  View Deals
                  <Zap className="ml-2 h-5 w-5" />
                </Button> */}
              </div>
            </div>{" "}
            <div className="relative">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-4">
                  <div className="h-32 rounded-lg overflow-hidden">
                    <img
                      src="https://www.ict.eu/sites/corporate/files/images/ICT_Electronics_website_header.jpg"
                      alt="Image 1"
                      className="object-cover w-full h-full"
                    />
                  </div>
                  <div className="h-48 rounded-lg overflow-hidden">
                    <img
                      src="https://img.freepik.com/free-photo/shop-clothing-clothes-shop-hanger-modern-shop-boutique_1150-8886.jpg?semt=ais_hybrid&w=740&q=80"
                      alt="Image 2"
                      className="object-cover w-full h-full"
                    />
                  </div>
                </div>
                <div className="space-y-4 mt-8">
                  <div className="h-48 rounded-lg overflow-hidden">
                    <img
                      src="https://fantasticcleaners.com.au/blog/wp-content/uploads/2024/09/How-to-Clean-and-Disinfect-Childrens-Toys.jpg"
                      alt="Image 3"
                      className="object-cover w-full h-full"
                    />
                  </div>
                  <div className="h-32 rounded-lg overflow-hidden">
                    <img
                      src="https://sbvpa.org/wp-content/uploads/2022/08/sports-tools_53876-138077-1571x1024.jpg"
                      alt="Image 4"
                      className="object-cover w-full h-full"
                    />
                  </div>
                </div>
              </div>
            </div>
            {/* <div className="relative">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-4">
                  <div className="h-32 bg-primary-foreground/20 rounded-lg backdrop-blur-sm"></div>
                  <div className="h-48 bg-primary-foreground/20 rounded-lg backdrop-blur-sm"></div>
                </div>
                <div className="space-y-4 mt-8">
                  <div className="h-48 bg-primary-foreground/20 rounded-lg backdrop-blur-sm"></div>
                  <div className="h-32 bg-primary-foreground/20 rounded-lg backdrop-blur-sm"></div>
                </div>
              </div>
            </div> */}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="text-center space-y-4">
              <div className="h-16 w-16 mx-auto rounded-full bg-primary/10 flex items-center justify-center">
                <Truck className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-xl font-semibold">Free Shipping</h3>
              <p className="text-muted-foreground">
                Free shipping on all orders over $70
              </p>
            </div>
            <div className="text-center space-y-4">
              <div className="h-16 w-16 mx-auto rounded-full bg-primary/10 flex items-center justify-center">
                <RotateCcw className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-xl font-semibold">Easy Returns</h3>
              <p className="text-muted-foreground">
                30-day hassle-free return policy
              </p>
            </div>
            <div className="text-center space-y-4">
              <div className="h-16 w-16 mx-auto rounded-full bg-primary/10 flex items-center justify-center">
                <Shield className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-xl font-semibold">Secure Payment</h3>
              <p className="text-muted-foreground">
                Your payment information is safe with us
              </p>
            </div>
            <div className="text-center space-y-4">
              <div className="h-16 w-16 mx-auto rounded-full bg-primary/10 flex items-center justify-center">
                <Star className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-xl font-semibold">Quality Products</h3>
              <p className="text-muted-foreground">
                Carefully curated products from trusted brands
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Featured Products
            </h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Discover our handpicked selection of the best products across all
              categories
            </p>
          </div>

          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[...Array(8)].map((_, i) => (
                <ProductSkeleton key={i} />
              ))}
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                {featuredProducts.slice(0, 8).map((product) => (
                  <ProductCard key={product._id} product={product} />
                ))}
              </div>
              <div className="text-center">
                <Button
                  size="lg"
                  onClick={() => navigate("/products")}
                  className="px-8"
                >
                  View All Products
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </div>
            </>
          )}
        </div>
      </section>

      {/* Categories Section */}
      {/* <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Shop by Category
            </h2>
            <p className="text-muted-foreground text-lg">
              Find exactly what you're looking for
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
            {[
              { name: "Electronics", icon: "📱", color: "bg-blue-500" },
              // { name: "Clothing", icon: "👕", color: "bg-purple-500" },
              { name: "Books", icon: "📚", color: "bg-green-500" },
              // { name: "Home", icon: "🏠", color: "bg-orange-500" },
              { name: "Sports", icon: "⚽", color: "bg-red-500" },
              // { name: "Beauty", icon: "💄", color: "bg-pink-500" },
              { name: "Toys", icon: "🪁", color: "bg-purple-500" },
            ].map((category) => (
              <Link
                key={category.name}
                to={`/products?category=${encodeURIComponent(category.name)}`}
                className="group"
              >
                <Card className="text-center hover:shadow-lg transition-all duration-300 group-hover:-translate-y-1">
                  <CardContent className="p-6">
                    <div
                      className={`h-16 w-16 mx-auto rounded-full ${category.color} flex items-center justify-center text-2xl mb-4 group-hover:scale-110 transition-transform duration-300`}
                    >
                      {category.icon}
                    </div>
                    <h3 className="font-semibold">{category.name}</h3>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      </section> */}

      {/* Newsletter Section */}
      {/* <section className="py-16 bg-primary text-primary-foreground">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Stay Updated with Our Latest Offers
          </h2>
          <p className="text-xl mb-8 text-primary-foreground/90">
            Subscribe to our newsletter and never miss a deal
          </p>
          <div className="max-w-md mx-auto flex space-x-4">
            <input
              type="email"
              placeholder="Enter your email"
              className="flex-1 px-4 py-3 rounded-lg text-foreground"
            />
            <Button variant="secondary" size="lg">
              Subscribe
            </Button>
          </div>
        </div>
      </section> */}
    </div>
  );
};

export default Home;
