import { Link } from "wouter";
import { ShoppingBag, Search, Menu, User, X } from "lucide-react";
import { useGetCart } from "@workspace/api-client-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";

export function Navbar() {
  const { data: cart } = useGetCart();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <div className="flex items-center gap-6 md:gap-10">
          <Link href="/" className="flex items-center space-x-2">
            <span className="text-2xl font-bold tracking-tight text-primary">ShopNow</span>
          </Link>
          <nav className="hidden md:flex gap-6">
            <Link href="/" className="text-sm font-medium transition-colors hover:text-primary">
              Home
            </Link>
            <Link href="/products" className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary">
              All Products
            </Link>
            <Link href="/products?category=clothing" className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary">
              Clothing
            </Link>
            <Link href="/products?category=accessories" className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary">
              Accessories
            </Link>
          </nav>
        </div>

        <div className="flex items-center gap-4">
          <Link href="/products" className="hidden md:flex items-center justify-center w-10 h-10 rounded-full hover:bg-muted transition-colors">
            <Search className="w-5 h-5" />
          </Link>
          <Link href="/orders" className="hidden md:flex items-center justify-center w-10 h-10 rounded-full hover:bg-muted transition-colors">
            <User className="w-5 h-5" />
          </Link>
          <Link href="/cart" className="relative flex items-center justify-center w-10 h-10 rounded-full hover:bg-muted transition-colors">
            <ShoppingBag className="w-5 h-5" />
            {cart && cart.itemCount > 0 && (
              <span className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[10px] font-medium text-primary-foreground">
                {cart.itemCount}
              </span>
            )}
          </Link>
          <Button 
            variant="ghost" 
            size="icon" 
            className="md:hidden"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </Button>
        </div>
      </div>

      {isMobileMenuOpen && (
        <div className="md:hidden border-t p-4 bg-background">
          <nav className="flex flex-col gap-4">
            <Link href="/" className="text-sm font-medium transition-colors hover:text-primary" onClick={() => setIsMobileMenuOpen(false)}>
              Home
            </Link>
            <Link href="/products" className="text-sm font-medium transition-colors hover:text-primary" onClick={() => setIsMobileMenuOpen(false)}>
              All Products
            </Link>
            <Link href="/orders" className="text-sm font-medium transition-colors hover:text-primary" onClick={() => setIsMobileMenuOpen(false)}>
              My Orders
            </Link>
          </nav>
        </div>
      )}
    </header>
  );
}
