import { useGetProduct, useGetRelatedProducts, useAddToCart, getGetProductQueryKey } from "@workspace/api-client-react";
import { useParams, Link } from "wouter";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Star, ShoppingCart, Truck, RefreshCw, ShieldCheck, ChevronRight, Minus, Plus } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import { ProductCard } from "@/components/product/ProductCard";

export default function ProductDetail() {
  const { id } = useParams();
  const productId = parseInt(id || "0");
  const { toast } = useToast();
  
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState(0);

  const { data: product, isLoading, isError } = useGetProduct(productId, { 
    query: { enabled: !!productId, queryKey: getGetProductQueryKey(productId) } 
  });
  
  const { data: relatedProducts, isLoading: loadingRelated } = useGetRelatedProducts(productId, {
    query: { enabled: !!productId }
  });
  
  const addToCart = useAddToCart();

  const handleAddToCart = () => {
    if (!product) return;
    
    addToCart.mutate(
      { data: { productId: product.id, quantity } },
      {
        onSuccess: () => {
          toast({
            title: "Added to cart",
            description: `${quantity}x ${product.name} added to your cart.`,
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

  const decreaseQuantity = () => {
    if (quantity > 1) setQuantity(q => q - 1);
  };

  const increaseQuantity = () => {
    if (product && quantity < product.stock) setQuantity(q => q + 1);
  };

  if (isError) {
    return (
      <div className="container mx-auto px-4 py-20 text-center">
        <h1 className="text-2xl font-bold mb-4">Product not found</h1>
        <p className="text-muted-foreground mb-8">The product you're looking for doesn't exist or has been removed.</p>
        <Button asChild><Link href="/products">Back to Products</Link></Button>
      </div>
    );
  }

  const allImages = product ? [product.imageUrl, ...(product.images || [])] : [];
  const discount = product?.originalPrice 
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100) 
    : 0;

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Breadcrumbs */}
      <div className="flex items-center text-sm text-muted-foreground mb-8">
        <Link href="/" className="hover:text-primary">Home</Link>
        <ChevronRight className="w-4 h-4 mx-2" />
        <Link href="/products" className="hover:text-primary">Products</Link>
        <ChevronRight className="w-4 h-4 mx-2" />
        {isLoading ? (
          <Skeleton className="h-4 w-24" />
        ) : product ? (
          <Link href={`/products?category=${product.categoryId}`} className="hover:text-primary">{product.categoryName}</Link>
        ) : null}
        <ChevronRight className="w-4 h-4 mx-2" />
        <span className="text-foreground font-medium line-clamp-1">
          {isLoading ? <Skeleton className="h-4 w-32" /> : product?.name}
        </span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-16">
        {/* Product Images */}
        <div className="space-y-4">
          {isLoading ? (
            <>
              <Skeleton className="aspect-square w-full rounded-2xl" />
              <div className="grid grid-cols-4 gap-4">
                {Array(4).fill(0).map((_, i) => <Skeleton key={i} className="aspect-square rounded-xl" />)}
              </div>
            </>
          ) : product ? (
            <>
              <div className="aspect-square relative rounded-2xl overflow-hidden bg-muted border">
                <img 
                  src={allImages[selectedImage]} 
                  alt={product.name} 
                  className="w-full h-full object-cover"
                />
                <div className="absolute top-4 left-4 flex flex-col gap-2">
                  {product.isNew && (
                    <Badge className="bg-primary text-primary-foreground border-none px-3 py-1 text-sm font-semibold">New</Badge>
                  )}
                  {discount > 0 && (
                    <Badge variant="destructive" className="border-none px-3 py-1 text-sm font-semibold">{discount}% OFF</Badge>
                  )}
                </div>
              </div>
              {allImages.length > 1 && (
                <div className="grid grid-cols-4 gap-4">
                  {allImages.map((img, i) => (
                    <button 
                      key={i}
                      onClick={() => setSelectedImage(i)}
                      className={`aspect-square rounded-xl overflow-hidden border-2 transition-all ${selectedImage === i ? 'border-primary ring-2 ring-primary/20' : 'border-transparent opacity-70 hover:opacity-100'}`}
                    >
                      <img src={img} alt={`${product.name} ${i+1}`} className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              )}
            </>
          ) : null}
        </div>

        {/* Product Info */}
        <div className="flex flex-col">
          {isLoading ? (
            <div className="space-y-6">
              <Skeleton className="h-10 w-3/4" />
              <Skeleton className="h-6 w-1/4" />
              <div className="space-y-2 py-6 border-y">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-2/3" />
              </div>
              <Skeleton className="h-12 w-full" />
            </div>
          ) : product ? (
            <>
              <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-foreground mb-4">{product.name}</h1>
              
              <div className="flex items-center gap-4 mb-6">
                <div className="flex items-center gap-1 text-yellow-400">
                  {Array(5).fill(0).map((_, i) => (
                    <Star key={i} className={`w-5 h-5 ${i < Math.floor(product.rating) ? 'fill-current' : 'text-muted fill-muted'}`} />
                  ))}
                </div>
                <span className="text-sm font-medium">{product.rating} Rating</span>
                <span className="text-muted-foreground">|</span>
                <span className="text-sm text-muted-foreground">{product.reviewCount} Reviews</span>
              </div>
              
              <div className="flex items-end gap-4 mb-8">
                <span className="text-4xl font-bold text-primary">${product.price.toFixed(2)}</span>
                {product.originalPrice && (
                  <span className="text-xl text-muted-foreground line-through mb-1">${product.originalPrice.toFixed(2)}</span>
                )}
              </div>
              
              <div className="prose prose-sm text-muted-foreground mb-8">
                <p>{product.description}</p>
              </div>

              {/* Action Area */}
              <div className="bg-card border rounded-2xl p-6 mb-8 shadow-sm">
                <div className="flex items-center justify-between mb-6">
                  <span className="font-medium">Availability:</span>
                  {product.stock > 0 ? (
                    <span className="text-green-600 font-medium flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-green-600" />
                      In Stock ({product.stock} available)
                    </span>
                  ) : (
                    <span className="text-destructive font-medium flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-destructive" />
                      Out of Stock
                    </span>
                  )}
                </div>

                <div className="flex flex-col sm:flex-row gap-4">
                  <div className="flex items-center justify-between border rounded-lg h-12 px-2 sm:w-32 bg-background">
                    <button 
                      onClick={decreaseQuantity}
                      disabled={quantity <= 1 || product.stock === 0}
                      className="w-8 h-8 flex items-center justify-center rounded-md hover:bg-muted disabled:opacity-50 disabled:cursor-not-allowed text-muted-foreground hover:text-foreground transition-colors"
                    >
                      <Minus className="w-4 h-4" />
                    </button>
                    <span className="font-semibold text-center w-8">{quantity}</span>
                    <button 
                      onClick={increaseQuantity}
                      disabled={quantity >= product.stock || product.stock === 0}
                      className="w-8 h-8 flex items-center justify-center rounded-md hover:bg-muted disabled:opacity-50 disabled:cursor-not-allowed text-muted-foreground hover:text-foreground transition-colors"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                  
                  <Button 
                    className="flex-1 h-12 text-base font-semibold shadow-lg shadow-primary/20" 
                    size="lg"
                    onClick={handleAddToCart}
                    disabled={addToCart.isPending || product.stock === 0}
                  >
                    <ShoppingCart className="w-5 h-5 mr-2" />
                    {addToCart.isPending ? "Adding..." : "Add to Cart"}
                  </Button>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 border-t pt-8 mt-auto">
                <div className="flex items-center gap-3">
                  <div className="bg-primary/10 p-2 rounded-lg text-primary">
                    <Truck className="w-5 h-5" />
                  </div>
                  <div className="text-sm">
                    <p className="font-semibold">Free Delivery</p>
                    <p className="text-muted-foreground text-xs">Over $100</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="bg-primary/10 p-2 rounded-lg text-primary">
                    <RefreshCw className="w-5 h-5" />
                  </div>
                  <div className="text-sm">
                    <p className="font-semibold">30 Days</p>
                    <p className="text-muted-foreground text-xs">Return policy</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="bg-primary/10 p-2 rounded-lg text-primary">
                    <ShieldCheck className="w-5 h-5" />
                  </div>
                  <div className="text-sm">
                    <p className="font-semibold">Secure</p>
                    <p className="text-muted-foreground text-xs">Payment</p>
                  </div>
                </div>
              </div>
            </>
          ) : null}
        </div>
      </div>

      {/* Related Products */}
      {!isLoading && product && (
        <div className="pt-16 border-t">
          <h2 className="text-2xl font-bold mb-8">You Might Also Like</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {loadingRelated ? (
              Array(4).fill(0).map((_, i) => (
                <div key={i} className="space-y-4">
                  <Skeleton className="aspect-[4/5] rounded-2xl" />
                  <Skeleton className="h-4 w-2/3" />
                  <Skeleton className="h-4 w-1/3" />
                </div>
              ))
            ) : relatedProducts && relatedProducts.length > 0 ? (
              relatedProducts.slice(0, 4).map((p, i) => (
                <ProductCard key={p.id} product={p} index={i} />
              ))
            ) : (
              <p className="text-muted-foreground col-span-full">No related products found.</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
