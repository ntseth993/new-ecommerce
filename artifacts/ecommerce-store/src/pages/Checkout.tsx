import { useGetCart, useCreateOrder } from "@workspace/api-client-react";
import { useLocation, Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, CheckCircle2 } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { useState } from "react";

const checkoutSchema = z.object({
  customerName: z.string().min(2, "Name must be at least 2 characters"),
  customerEmail: z.string().email("Please enter a valid email address"),
  shippingAddress: z.string().min(10, "Please enter a complete shipping address"),
});

type CheckoutValues = z.infer<typeof checkoutSchema>;

export default function Checkout() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [orderComplete, setOrderComplete] = useState<number | null>(null);
  
  const { data: cart, isLoading: isLoadingCart } = useGetCart();
  const createOrder = useCreateOrder();

  const form = useForm<CheckoutValues>({
    resolver: zodResolver(checkoutSchema),
    defaultValues: {
      customerName: "",
      customerEmail: "",
      shippingAddress: "",
    },
  });

  const onSubmit = (values: CheckoutValues) => {
    createOrder.mutate({ data: values }, {
      onSuccess: (order) => {
        setOrderComplete(order.id);
        toast({
          title: "Order placed successfully!",
          description: `Your order #${order.id} has been confirmed.`,
        });
      },
      onError: () => {
        toast({
          title: "Failed to place order",
          description: "There was a problem processing your order. Please try again.",
          variant: "destructive",
        });
      }
    });
  };

  if (isLoadingCart) {
    return (
      <div className="container mx-auto px-4 py-12 max-w-4xl">
        <Skeleton className="h-10 w-48 mb-8" />
        <div className="grid md:grid-cols-2 gap-12">
          <div className="space-y-6">
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-32 w-full" />
            <Skeleton className="h-12 w-full mt-8" />
          </div>
          <div><Skeleton className="h-[400px] w-full rounded-2xl" /></div>
        </div>
      </div>
    );
  }

  if (orderComplete) {
    return (
      <div className="container mx-auto px-4 py-24 text-center max-w-md">
        <div className="bg-green-100 w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6">
          <CheckCircle2 className="w-12 h-12 text-green-600" />
        </div>
        <h1 className="text-3xl font-bold tracking-tight mb-4">Thank you!</h1>
        <p className="text-muted-foreground mb-8 text-lg">
          Your order #{orderComplete} has been placed successfully. We've sent a confirmation email to {form.getValues().customerEmail}.
        </p>
        <div className="flex flex-col gap-4">
          <Button asChild size="lg" className="w-full">
            <Link href={`/orders/${orderComplete}`}>View Order Details</Link>
          </Button>
          <Button asChild variant="outline" size="lg" className="w-full">
            <Link href="/products">Continue Shopping</Link>
          </Button>
        </div>
      </div>
    );
  }

  if (!cart || cart.items.length === 0) {
    return (
      <div className="container mx-auto px-4 py-24 text-center max-w-md">
        <h1 className="text-2xl font-bold mb-4">Your cart is empty</h1>
        <p className="text-muted-foreground mb-8">You need items in your cart to checkout.</p>
        <Button asChild size="lg"><Link href="/products">Browse Products</Link></Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-12 max-w-6xl">
      <Link href="/cart" className="inline-flex items-center text-sm font-medium text-muted-foreground hover:text-primary mb-8 transition-colors">
        <ArrowLeft className="w-4 h-4 mr-2" /> Back to Cart
      </Link>
      
      <div className="grid md:grid-cols-12 gap-12">
        <div className="md:col-span-7 lg:col-span-8">
          <div className="bg-card border rounded-2xl p-6 md:p-8 shadow-sm">
            <h1 className="text-2xl font-bold tracking-tight mb-6 pb-4 border-b">Shipping Information</h1>
            
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="customerName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Full Name</FormLabel>
                        <FormControl>
                          <Input placeholder="John Doe" {...field} className="h-12" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="customerEmail"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email Address</FormLabel>
                        <FormControl>
                          <Input type="email" placeholder="john@example.com" {...field} className="h-12" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                
                <FormField
                  control={form.control}
                  name="shippingAddress"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Shipping Address</FormLabel>
                      <FormControl>
                        <Input placeholder="123 Main St, Apt 4B, City, State, ZIP" {...field} className="h-12" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="pt-6 border-t mt-8">
                  <h2 className="text-xl font-bold tracking-tight mb-4">Payment</h2>
                  <div className="bg-muted p-4 rounded-xl text-center text-muted-foreground text-sm border border-dashed">
                    This is a demo store. No real payment is required.
                  </div>
                </div>
                
                <Button 
                  type="submit" 
                  size="lg" 
                  className="w-full h-14 text-lg font-bold shadow-lg shadow-primary/20 mt-8"
                  disabled={createOrder.isPending}
                >
                  {createOrder.isPending ? "Processing..." : `Pay $${cart.total.toFixed(2)}`}
                </Button>
              </form>
            </Form>
          </div>
        </div>
        
        <div className="md:col-span-5 lg:col-span-4">
          <div className="bg-muted/50 border rounded-2xl p-6 sticky top-24">
            <h2 className="font-bold tracking-tight mb-6">Order Summary</h2>
            
            <div className="space-y-4 max-h-[40vh] overflow-auto pr-2 mb-6 divide-y">
              {cart.items.map((item) => (
                <div key={item.productId} className="flex gap-4 py-4 first:pt-0">
                  <div className="w-16 h-20 bg-background rounded-md overflow-hidden border shrink-0">
                    <img src={item.imageUrl} alt={item.productName} className="w-full h-full object-cover" />
                  </div>
                  <div className="flex-1 flex flex-col justify-between">
                    <div>
                      <h4 className="text-sm font-semibold line-clamp-2 text-foreground">{item.productName}</h4>
                      <p className="text-xs text-muted-foreground mt-1">Qty: {item.quantity}</p>
                    </div>
                    <p className="text-sm font-medium">${item.subtotal.toFixed(2)}</p>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="border-t pt-4 space-y-3">
              <div className="flex justify-between text-sm text-muted-foreground">
                <span>Subtotal</span>
                <span className="font-medium text-foreground">${cart.total.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm text-muted-foreground">
                <span>Shipping</span>
                <span className="font-medium text-green-600">Free</span>
              </div>
              <div className="flex justify-between text-sm text-muted-foreground">
                <span>Taxes</span>
                <span>$0.00</span>
              </div>
              <div className="border-t pt-3 mt-3 flex justify-between items-center">
                <span className="font-bold">Total</span>
                <span className="text-xl font-bold text-primary">${cart.total.toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
