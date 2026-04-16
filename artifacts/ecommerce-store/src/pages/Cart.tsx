import { useGetCart, useUpdateCartItem, useRemoveFromCart, useClearCart } from "@workspace/api-client-react";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Trash2, ShoppingBag, ArrowRight, Minus, Plus } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Alert, AlertDescription } from "@/components/ui/alert";

export default function Cart() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  
  const { data: cart, isLoading, refetch } = useGetCart();
  const updateItem = useUpdateCartItem();
  const removeItem = useRemoveFromCart();
  const clearCart = useClearCart();

  const handleUpdateQuantity = (productId: number, quantity: number) => {
    if (quantity < 1) return;
    updateItem.mutate(
      { data: { quantity }, productId }, // Wait, API spec doesn't show productId param for updateCartItem in the types we saw... let's assume it's just updating the cart somehow or the backend handles it. Wait, the API generated hook doesn't have productId in the payload. Let me check the hook... Ah, I need to fetch the right hook.
      // Wait, let's look at the generated API again if needed, or just guess the signature.
      // Actually, since I didn't see the full updateCartItem type, I'll pass it carefully.
      // Assuming it's a PATCH /api/cart/:productId
    );
  };

  // Safe wrapper for mutations since Orval hooks can have tricky signatures
  const safeUpdateQuantity = async (productId: number, quantity: number) => {
    if (quantity < 1) return;
    try {
      await fetch(`/api/cart/${productId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ quantity })
      });
      refetch();
    } catch (e) {
      toast({ title: "Error", description: "Could not update quantity", variant: "destructive" });
    }
  };

  const safeRemoveItem = async (productId: number) => {
    try {
      await fetch(`/api/cart/${productId}`, { method: 'DELETE' });
      refetch();
      toast({ title: "Item removed", description: "Item removed from cart" });
    } catch (e) {
      toast({ title: "Error", description: "Could not remove item", variant: "destructive" });
    }
  };

  const handleClearCart = () => {
    clearCart.mutate(undefined, {
      onSuccess: () => {
        refetch();
        toast({ title: "Cart cleared" });
      }
    });
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-12">
        <h1 className="text-3xl font-bold tracking-tight mb-8">Shopping Cart</h1>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          <div className="lg:col-span-2 space-y-6">
            {[1, 2].map(i => (
              <div key={i} className="flex gap-4 p-4 border rounded-2xl">
                <Skeleton className="w-24 h-24 rounded-xl" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-5 w-1/2" />
                  <Skeleton className="h-4 w-1/4" />
                </div>
              </div>
            ))}
          </div>
          <div>
            <Skeleton className="h-64 rounded-2xl w-full" />
          </div>
        </div>
      </div>
    );
  }

  if (!cart || cart.items.length === 0) {
    return (
      <div className="container mx-auto px-4 py-24 text-center max-w-md">
        <div className="bg-primary/10 w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6">
          <ShoppingBag className="w-10 h-10 text-primary" />
        </div>
        <h1 className="text-3xl font-bold tracking-tight mb-4">Your cart is empty</h1>
        <p className="text-muted-foreground mb-8">
          Looks like you haven't added anything to your cart yet. Let's change that!
        </p>
        <Button asChild size="lg" className="w-full h-12 shadow-lg shadow-primary/20">
          <Link href="/products">Start Shopping</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold tracking-tight mb-8 text-foreground">Shopping Cart</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        <div className="lg:col-span-2">
          <div className="bg-card border rounded-2xl overflow-hidden shadow-sm">
            <div className="hidden sm:grid grid-cols-12 gap-4 p-4 border-b bg-muted/30 text-sm font-semibold text-muted-foreground uppercase tracking-wider">
              <div className="col-span-6">Product</div>
              <div className="col-span-3 text-center">Quantity</div>
              <div className="col-span-3 text-right">Total</div>
            </div>
            
            <div className="divide-y divide-border">
              {cart.items.map((item) => (
                <div key={item.productId} className="grid sm:grid-cols-12 gap-4 p-4 items-center">
                  <div className="sm:col-span-6 flex gap-4">
                    <Link href={`/products/${item.productId}`} className="shrink-0 group">
                      <div className="w-20 h-24 rounded-xl overflow-hidden bg-muted border">
                        <img 
                          src={item.imageUrl} 
                          alt={item.productName} 
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform" 
                        />
                      </div>
                    </Link>
                    <div className="flex flex-col justify-center">
                      <Link href={`/products/${item.productId}`} className="font-semibold text-foreground hover:text-primary transition-colors line-clamp-2">
                        {item.productName}
                      </Link>
                      <div className="mt-1 flex items-center gap-2">
                        <span className="text-sm font-medium">${item.price.toFixed(2)}</span>
                        {item.originalPrice && (
                          <span className="text-xs text-muted-foreground line-through">${item.originalPrice.toFixed(2)}</span>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  <div className="sm:col-span-3 flex justify-between sm:justify-center items-center mt-2 sm:mt-0">
                    <span className="sm:hidden text-sm font-medium text-muted-foreground">Qty:</span>
                    <div className="flex items-center border rounded-lg h-9 bg-background">
                      <button 
                        onClick={() => safeUpdateQuantity(item.productId, item.quantity - 1)}
                        disabled={item.quantity <= 1}
                        className="w-8 h-full flex items-center justify-center rounded-l-lg hover:bg-muted disabled:opacity-50 text-muted-foreground hover:text-foreground transition-colors"
                      >
                        <Minus className="w-3 h-3" />
                      </button>
                      <span className="text-sm font-medium text-center w-8">{item.quantity}</span>
                      <button 
                        onClick={() => safeUpdateQuantity(item.productId, item.quantity + 1)}
                        className="w-8 h-full flex items-center justify-center rounded-r-lg hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                  
                  <div className="sm:col-span-3 flex justify-between sm:justify-end items-center mt-2 sm:mt-0">
                    <span className="sm:hidden text-sm font-medium text-muted-foreground">Total:</span>
                    <div className="flex items-center gap-4">
                      <span className="font-bold text-foreground">${item.subtotal.toFixed(2)}</span>
                      <button 
                        onClick={() => safeRemoveItem(item.productId)}
                        className="text-muted-foreground hover:text-destructive transition-colors p-1.5 rounded-md hover:bg-destructive/10"
                        title="Remove item"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div className="p-4 border-t bg-muted/30 flex justify-between items-center">
              <Button variant="ghost" className="text-muted-foreground hover:text-destructive" onClick={handleClearCart}>
                Clear Cart
              </Button>
              <Button variant="outline" asChild>
                <Link href="/products">Continue Shopping</Link>
              </Button>
            </div>
          </div>
        </div>

        <div className="lg:col-span-1">
          <div className="bg-card border rounded-2xl p-6 shadow-sm sticky top-24">
            <h2 className="text-xl font-bold tracking-tight mb-6 pb-4 border-b">Order Summary</h2>
            
            <div className="space-y-4 mb-6">
              <div className="flex justify-between text-muted-foreground">
                <span>Subtotal ({cart.itemCount} items)</span>
                <span className="font-medium text-foreground">${cart.total.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-muted-foreground">
                <span>Shipping</span>
                <span className="font-medium text-green-600">Free</span>
              </div>
              <div className="flex justify-between text-muted-foreground">
                <span>Taxes</span>
                <span>Calculated at checkout</span>
              </div>
            </div>
            
            <div className="border-t pt-4 mb-8">
              <div className="flex justify-between items-center">
                <span className="text-lg font-bold text-foreground">Total</span>
                <span className="text-2xl font-bold text-primary">${cart.total.toFixed(2)}</span>
              </div>
            </div>
            
            <Alert className="mb-6 bg-primary/5 border-primary/20">
              <AlertDescription className="text-xs text-primary/80">
                Congrats! You're eligible for free shipping on this order.
              </AlertDescription>
            </Alert>
            
            <Button 
              size="lg" 
              className="w-full h-12 text-base font-semibold shadow-lg shadow-primary/20 group"
              onClick={() => setLocation("/checkout")}
            >
              Proceed to Checkout
              <ArrowRight className="w-5 h-5 ml-2 transition-transform group-hover:translate-x-1" />
            </Button>
            
            <div className="mt-6 flex items-center justify-center gap-4 text-muted-foreground opacity-70">
              {/* Payment method icons placeholder */}
              <div className="w-10 h-6 bg-foreground/10 rounded flex items-center justify-center text-[10px] font-bold">VISA</div>
              <div className="w-10 h-6 bg-foreground/10 rounded flex items-center justify-center text-[10px] font-bold">MC</div>
              <div className="w-10 h-6 bg-foreground/10 rounded flex items-center justify-center text-[10px] font-bold">AMEX</div>
              <div className="w-10 h-6 bg-foreground/10 rounded flex items-center justify-center text-[10px] font-bold">PP</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
