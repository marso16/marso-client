import React from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  Facebook,
  Twitter,
  Instagram,
  Youtube,
  Mail,
  Phone,
  MapPin,
} from "lucide-react";

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-muted/50 border-t">
      {/* Features section */}
      {/* <div className="border-b">
        <div className="container mx-auto px-4 py-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="flex items-center space-x-3">
              <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                <Truck className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold">Free Shipping</h3>
                <p className="text-sm text-muted-foreground">
                  On orders over $100
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                <RotateCcw className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold">Easy Returns</h3>
                <p className="text-sm text-muted-foreground">
                  30-day return policy
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                <Shield className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold">Secure Payment</h3>
                <p className="text-sm text-muted-foreground">
                  SSL encrypted checkout
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                <CreditCard className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold">Multiple Payment</h3>
                <p className="text-sm text-muted-foreground">
                  Various payment options
                </p>
              </div>
            </div>
          </div>
        </div>
      </div> */}

      {/* Main footer content */}
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Company info */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              {/* <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
                <span className="text-primary-foreground font-bold text-lg">
                  S
                </span>
              </div> */}
              <span className="text-2xl font-bold text-primary">Marso's</span>
            </div>
            <p className="text-muted-foreground">
              Your one-stop destination for quality products at unbeatable
              prices. We're committed to providing exceptional shopping
              experiences.
            </p>
            <div className="flex space-x-4">
              <Button variant="ghost" size="icon">
                <Facebook className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="icon">
                <Twitter className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="icon">
                <Instagram className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="icon">
                <Youtube className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Quick links */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Quick Links</h3>
            <div className="space-y-2">
              <Link
                to="/about"
                className="block text-muted-foreground hover:text-foreground transition-colors"
              >
                About Us
              </Link>
              <Link
                to="/contact"
                className="block text-muted-foreground hover:text-foreground transition-colors"
              >
                Contact Us
              </Link>
              <Link
                to="/faq"
                className="block text-muted-foreground hover:text-foreground transition-colors"
              >
                FAQ
              </Link>
              <Link
                to="/shipping"
                className="block text-muted-foreground hover:text-foreground transition-colors"
              >
                Shipping Info
              </Link>
              <Link
                to="/returns"
                className="block text-muted-foreground hover:text-foreground transition-colors"
              >
                Returns & Exchanges
              </Link>
              <Link
                to="/size-guide"
                className="block text-muted-foreground hover:text-foreground transition-colors"
              >
                Size Guide
              </Link>
            </div>
          </div>

          {/* Categories */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Categories</h3>
            <div className="space-y-2">
              <Link
                to="/products?category=Electronics"
                className="block text-muted-foreground hover:text-foreground transition-colors"
              >
                Electronics
              </Link>
              {/* <Link
                to="/products?category=Clothing"
                className="block text-muted-foreground hover:text-foreground transition-colors"
              >
                Clothing
              </Link> */}
              <Link
                to="/products?category=Books"
                className="block text-muted-foreground hover:text-foreground transition-colors"
              >
                Books
              </Link>
              {/* <Link
                to="/products?category=Home%20%26%20Garden"
                className="block text-muted-foreground hover:text-foreground transition-colors"
              >
                Home
              </Link> */}
              <Link
                to="/products?category=Sports"
                className="block text-muted-foreground hover:text-foreground transition-colors"
              >
                Sports
              </Link>
              {/* <Link
                to="/products?category=Beauty"
                className="block text-muted-foreground hover:text-foreground transition-colors"
              >
                Beauty
              </Link> */}
            </div>
          </div>

          {/* Newsletter & Contact */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Stay Connected</h3>
            {/* <p className="text-muted-foreground">
              Subscribe to our newsletter for exclusive deals and updates.
            </p> */}
            {/* <div className="flex space-x-2">
              <Input placeholder="Enter your email" className="flex-1" />
              <Button>
                <Mail className="h-4 w-4" />
              </Button>
            </div> */}

            <div className="space-y-2 pt-4">
              <div className="flex items-center space-x-2 text-muted-foreground">
                <Phone className="h-4 w-4" />
                <span>+961 76057426</span>
              </div>
              <div className="flex items-center space-x-2 text-muted-foreground">
                <Mail className="h-4 w-4" />
                <span>marckey2345@gmail.com</span>
              </div>
              <div className="flex items-center space-x-2 text-muted-foreground">
                <MapPin className="h-4 w-4" />
                <span>Beirut, Lebanon</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Separator />

      {/* Bottom footer */}
      <div className="container mx-auto px-4 py-6">
        <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
          <div className="flex flex-col md:flex-row items-center space-y-2 md:space-y-0 md:space-x-6">
            <p className="text-muted-foreground">
              © {currentYear} Marso's. All rights reserved.
            </p>
            <div className="flex space-x-4">
              <Link
                to="/privacy"
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                Privacy Policy
              </Link>
              <Link
                to="/terms"
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                Terms of Service
              </Link>
              <Link
                to="/cookies"
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                Cookie Policy
              </Link>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <span className="text-muted-foreground">We accept:</span>
            <div className="flex space-x-2">
              <div className="h-6 w-10 bg-blue-600 rounded text-white text-xs flex items-center justify-center font-bold">
                VISA
              </div>
              <div className="h-6 w-10 bg-red-600 rounded text-white text-xs flex items-center justify-center font-bold">
                MC
              </div>
              <div className="h-6 w-10 bg-blue-500 rounded text-white text-xs flex items-center justify-center font-bold">
                AMEX
              </div>
              <div className="h-6 w-10 bg-yellow-500 rounded text-white text-xs flex items-center justify-center font-bold">
                PP
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
