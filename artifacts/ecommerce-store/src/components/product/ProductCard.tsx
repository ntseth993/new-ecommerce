import { Link } from "wouter";
import { Product } from "@workspace/api-client-react";
import { Star, ShoppingCart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAddToCart } from "@workspace/api-client-react";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";

interface ProductCardProps {
  product: Product;
  index?: number;
}

export function ProductCard({ product, index = 0 }: ProductCardProps) {
  const { toast } = useToast();
  const addToCart = useAddToCart();

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault(); // Prevent navigating to product detail
    addToCart.mutate(
      { data: { productId: product.id, quantity: 1 } },
      {
        onSuccess: () => {
          toast({
            title: "Added to cart",
            description: `${product.name} has been added to your cart.`,
          });
        },
        onError: () => {
          toast({
            title: "Error",
            description: "Failed to add to cart. Please try again.",
            variant: "destructive",
          });
        },
      }
    );
  };

  const discount = product.originalPrice 
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100) 
    : 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.05 }}
    >
      <Link href={`/products/${product.id}`} className="group block relative rounded-2xl bg-card border border-border/50 hover:border-primary/20 hover:shadow-xl hover:shadow-primary/5 transition-all duration-300 overflow-hidden">
        <div className="relative aspect-[4/5] bg-muted overflow-hidden">
          <img 
            src={product.imageUrl} 
            alt={product.name} 
            className="object-cover w-full h-full transition-transform duration-500 group-hover:scale-105"
            loading="lazy"
          />
          
          <div className="absolute top-3 left-3 flex flex-col gap-2">
            {product.isNew && (
              <Badge className="bg-primary text-primary-foreground border-none font-semibold px-2.5 py-0.5">
                New
              </Badge>
            )}
            {discount > 0 && (
              <Badge variant="destructive" className="border-none font-semibold px-2.5 py-0.5">
                {discount}% OFF
              </Badge>
            )}
            {product.badge && !product.isNew && discount === 0 && (
              <Badge variant="secondary" className="bg-background/80 backdrop-blur-sm font-semibold px-2.5 py-0.5">
                {product.badge}
              </Badge>
            )}
          </div>
          
          <div className="absolute inset-x-0 bottom-0 p-4 opacity-0 translate-y-4 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300 flex justify-center">
            <Button 
              size="sm" 
              className="w-full shadow-lg gap-2" 
              onClick={handleAddToCart}
              disabled={addToCart.isPending || product.stock === 0}
            >
              <ShoppingCart className="w-4 h-4" />
              {product.stock > 0 ? "Add to Cart" : "Out of Stock"}
            </Button>
          </div>
        </div>
        
        <div className="p-4 space-y-2">
          <div className="flex justify-between items-start">
            <h3 className="font-semibold text-foreground line-clamp-1 group-hover:text-primary transition-colors">
              {product.name}
            </h3>
          </div>
          
          <div className="flex items-center gap-1.5">
            <div className="flex items-center text-yellow-400">
              <Star className="w-3.5 h-3.5 fill-current" />
              <span className="ml-1 text-xs font-medium text-foreground">{product.rating}</span>
            </div>
            <span className="text-xs text-muted-foreground">({product.reviewCount})</span>
            <span className="text-xs text-muted-foreground ml-auto">{product.categoryName}</span>
          </div>
          
          <div className="flex items-center gap-2 pt-1">
            <span className="text-lg font-bold text-foreground">${product.price.toFixed(2)}</span>
            {product.originalPrice && (
              <span className="text-sm text-muted-foreground line-through">${product.originalPrice.toFixed(2)}</span>
            )}
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
