import { useGetOrder, getGetOrderQueryKey } from "@workspace/api-client-react";
import { useParams, Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeft, Package, Truck, MapPin, Mail, User, CreditCard } from "lucide-react";
import { OrderStatusBadge } from "./Orders";
import { format } from "date-fns";

export default function OrderDetail() {
  const { id } = useParams();
  const orderId = parseInt(id || "0");
  
  const { data: order, isLoading, isError } = useGetOrder(orderId, {
    query: { enabled: !!orderId, queryKey: getGetOrderQueryKey(orderId) }
  });

  if (isError) {
    return (
      <div className="container mx-auto px-4 py-24 text-center max-w-md">
        <h1 className="text-2xl font-bold mb-4">Order not found</h1>
        <p className="text-muted-foreground mb-8">We couldn't find the order you're looking for.</p>
        <Button asChild size="lg"><Link href="/orders">Back to Orders</Link></Button>
      </div>
    );
  }

  if (isLoading || !order) {
    return (
      <div className="container mx-auto px-4 py-12 max-w-4xl">
        <Skeleton className="h-6 w-32 mb-8" />
        <div className="grid md:grid-cols-3 gap-8">
          <div className="md:col-span-2 space-y-6">
            <Skeleton className="h-48 w-full rounded-2xl" />
            <Skeleton className="h-64 w-full rounded-2xl" />
          </div>
          <div>
            <Skeleton className="h-96 w-full rounded-2xl" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-12 max-w-5xl">
      <div className="flex items-center justify-between mb-8">
        <Link href="/orders" className="inline-flex items-center text-sm font-medium text-muted-foreground hover:text-primary transition-colors">
          <ArrowLeft className="w-4 h-4 mr-2" /> Back to Orders
        </Link>
      </div>

      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Order #{order.id}</h1>
          <p className="text-muted-foreground mt-1">
            Placed on {format(new Date(order.createdAt), "MMMM d, yyyy 'at' h:mm a")}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-sm font-medium text-muted-foreground">Status:</span>
          <OrderStatusBadge status={order.status} />
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-8">
        <div className="md:col-span-2 space-y-8">
          {/* Items */}
          <div className="bg-card border rounded-2xl overflow-hidden shadow-sm">
            <div className="p-6 border-b bg-muted/20">
              <h2 className="text-xl font-bold tracking-tight flex items-center gap-2">
                <Package className="w-5 h-5 text-primary" /> Items Ordered
              </h2>
            </div>
            <div className="divide-y">
              {order.items.map((item) => (
                <div key={item.productId} className="flex gap-6 p-6">
                  <Link href={`/products/${item.productId}`} className="shrink-0">
                    <div className="w-24 h-24 rounded-xl overflow-hidden bg-muted border">
                      <img src={item.imageUrl} alt={item.productName} className="w-full h-full object-cover" />
                    </div>
                  </Link>
                  <div className="flex-1 flex flex-col justify-center">
                    <div className="flex justify-between items-start gap-4">
                      <div>
                        <Link href={`/products/${item.productId}`} className="font-semibold text-lg hover:text-primary transition-colors line-clamp-1">
                          {item.productName}
                        </Link>
                        <p className="text-sm text-muted-foreground mt-1">Qty: {item.quantity}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-foreground">${item.subtotal.toFixed(2)}</p>
                        <p className="text-xs text-muted-foreground mt-1">${item.price.toFixed(2)} each</p>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          {/* Shipping Update (Dummy) */}
          <div className="bg-card border rounded-2xl overflow-hidden shadow-sm">
            <div className="p-6 border-b bg-muted/20">
              <h2 className="text-xl font-bold tracking-tight flex items-center gap-2">
                <Truck className="w-5 h-5 text-primary" /> Shipping Updates
              </h2>
            </div>
            <div className="p-6">
              <div className="relative pl-6 border-l-2 border-primary/30 space-y-6">
                <div className="relative">
                  <div className="absolute -left-[31px] bg-primary rounded-full w-4 h-4 ring-4 ring-background" />
                  <p className="font-semibold">{order.status === 'pending' ? 'Order Received' : 'Order Processed'}</p>
                  <p className="text-sm text-muted-foreground">{format(new Date(order.createdAt), "MMM d, h:mm a")}</p>
                </div>
                {['processing', 'shipped', 'delivered'].includes(order.status) && (
                  <div className="relative">
                    <div className="absolute -left-[31px] bg-primary rounded-full w-4 h-4 ring-4 ring-background" />
                    <p className="font-semibold">Package Processing</p>
                    <p className="text-sm text-muted-foreground">Preparing for shipment</p>
                  </div>
                )}
                {['shipped', 'delivered'].includes(order.status) && (
                  <div className="relative">
                    <div className="absolute -left-[31px] bg-primary rounded-full w-4 h-4 ring-4 ring-background" />
                    <p className="font-semibold">Shipped</p>
                    <p className="text-sm text-muted-foreground">Handed over to carrier</p>
                  </div>
                )}
                {['delivered'].includes(order.status) && (
                  <div className="relative">
                    <div className="absolute -left-[31px] bg-green-500 rounded-full w-4 h-4 ring-4 ring-background" />
                    <p className="font-semibold text-green-600">Delivered</p>
                    <p className="text-sm text-muted-foreground">Package arrived</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-8">
          {/* Order Summary */}
          <div className="bg-muted/50 border rounded-2xl p-6">
            <h2 className="font-bold tracking-tight mb-4 flex items-center gap-2">
              <CreditCard className="w-5 h-5" /> Payment Summary
            </h2>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between text-muted-foreground">
                <span>Subtotal</span>
                <span className="font-medium text-foreground">${order.total.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-muted-foreground">
                <span>Shipping</span>
                <span className="font-medium text-green-600">Free</span>
              </div>
              <div className="flex justify-between text-muted-foreground">
                <span>Tax</span>
                <span className="font-medium text-foreground">$0.00</span>
              </div>
              <div className="border-t pt-3 mt-3 flex justify-between items-center">
                <span className="font-bold text-base">Total</span>
                <span className="font-bold text-xl text-primary">${order.total.toFixed(2)}</span>
              </div>
            </div>
          </div>

          {/* Customer Info */}
          <div className="bg-card border rounded-2xl p-6">
            <h2 className="font-bold tracking-tight mb-6">Customer Details</h2>
            
            <div className="space-y-6">
              <div className="flex gap-3 items-start">
                <User className="w-5 h-5 text-muted-foreground shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-1">Contact</p>
                  <p className="font-medium">{order.customerName}</p>
                  <p className="text-sm text-muted-foreground">{order.customerEmail}</p>
                </div>
              </div>
              
              <div className="flex gap-3 items-start">
                <MapPin className="w-5 h-5 text-muted-foreground shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-1">Shipping Address</p>
                  <p className="text-sm leading-relaxed">{order.shippingAddress}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
