import { useListOrders, OrderStatus } from "@workspace/api-client-react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Package, ChevronRight, ShoppingBag } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";

export function OrderStatusBadge({ status }: { status: string }) {
  switch (status) {
    case OrderStatus.pending:
      return <Badge variant="secondary" className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100/80 border-none">Pending</Badge>;
    case OrderStatus.processing:
      return <Badge variant="secondary" className="bg-blue-100 text-blue-800 hover:bg-blue-100/80 border-none">Processing</Badge>;
    case OrderStatus.shipped:
      return <Badge variant="secondary" className="bg-indigo-100 text-indigo-800 hover:bg-indigo-100/80 border-none">Shipped</Badge>;
    case OrderStatus.delivered:
      return <Badge variant="secondary" className="bg-green-100 text-green-800 hover:bg-green-100/80 border-none">Delivered</Badge>;
    case OrderStatus.cancelled:
      return <Badge variant="destructive" className="border-none">Cancelled</Badge>;
    default:
      return <Badge variant="outline">{status}</Badge>;
  }
}

export default function Orders() {
  const { data: orders, isLoading } = useListOrders();

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-12 max-w-5xl">
        <h1 className="text-3xl font-bold tracking-tight mb-8">My Orders</h1>
        <div className="space-y-4">
          {[1, 2, 3].map(i => (
            <Skeleton key={i} className="h-32 w-full rounded-2xl" />
          ))}
        </div>
      </div>
    );
  }

  if (!orders || orders.length === 0) {
    return (
      <div className="container mx-auto px-4 py-24 text-center max-w-md">
        <div className="bg-muted w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6">
          <Package className="w-10 h-10 text-muted-foreground" />
        </div>
        <h1 className="text-2xl font-bold mb-4">No orders yet</h1>
        <p className="text-muted-foreground mb-8">When you place an order, it will appear here.</p>
        <Button asChild size="lg"><Link href="/products">Start Shopping</Link></Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-12 max-w-5xl">
      <h1 className="text-3xl font-bold tracking-tight mb-8">My Orders</h1>
      
      <div className="grid gap-6">
        {orders.map((order) => (
          <div key={order.id} className="bg-card border rounded-2xl overflow-hidden hover:shadow-md transition-shadow">
            <div className="bg-muted/30 p-4 sm:px-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm w-full">
                <div>
                  <p className="text-muted-foreground font-medium mb-1 text-xs uppercase tracking-wider">Order Placed</p>
                  <p className="font-semibold">{format(new Date(order.createdAt), "MMM d, yyyy")}</p>
                </div>
                <div>
                  <p className="text-muted-foreground font-medium mb-1 text-xs uppercase tracking-wider">Total</p>
                  <p className="font-semibold">${order.total.toFixed(2)}</p>
                </div>
                <div>
                  <p className="text-muted-foreground font-medium mb-1 text-xs uppercase tracking-wider">Status</p>
                  <OrderStatusBadge status={order.status} />
                </div>
                <div className="sm:text-right">
                  <p className="text-muted-foreground font-medium mb-1 text-xs uppercase tracking-wider">Order #</p>
                  <p className="font-semibold text-primary">{order.id}</p>
                </div>
              </div>
            </div>
            
            <div className="p-4 sm:p-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
              <div className="flex flex-wrap gap-3">
                {order.items.slice(0, 4).map(item => (
                  <div key={item.productId} className="w-16 h-16 sm:w-20 sm:h-20 rounded-xl overflow-hidden bg-muted border relative group">
                    <img src={item.imageUrl} alt={item.productName} className="w-full h-full object-cover" />
                    {item.quantity > 1 && (
                      <div className="absolute top-1 right-1 bg-background/90 text-foreground text-[10px] font-bold px-1.5 py-0.5 rounded backdrop-blur-sm shadow-sm">
                        x{item.quantity}
                      </div>
                    )}
                  </div>
                ))}
                {order.items.length > 4 && (
                  <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-xl bg-muted border flex items-center justify-center text-sm font-medium text-muted-foreground">
                    +{order.items.length - 4}
                  </div>
                )}
              </div>
              
              <div className="w-full sm:w-auto flex sm:flex-col gap-3 justify-end shrink-0">
                <Button asChild className="flex-1 sm:flex-none">
                  <Link href={`/orders/${order.id}`}>View Details</Link>
                </Button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
