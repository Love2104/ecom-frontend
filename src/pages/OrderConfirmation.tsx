import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { CheckCircle, Package, Truck, Calendar, ArrowLeft } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Separator } from '@/components/ui/Separator';
import { Badge } from '@/components/ui/Badge';
import useOrders from '@/hooks/useOrders';
import { formatPrice, formatDate } from '@/lib/utils';
import { Order } from '@/types';

const OrderConfirmation = () => {
  const { orderId } = useParams<{ orderId: string }>();
  const { fetchOrderById } = useOrders();
  
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    const getOrderDetails = async () => {
      if (!orderId) {
        setError('Order ID is missing');
        setLoading(false);
        return;
      }
      
      try {
        const result = await fetchOrderById(orderId);
        
        if (result.success && result.order) {
          setOrder(result.order);
        } else {
          setError(result.error || 'Failed to fetch order details');
        }
      } catch (err) {
        setError('An unexpected error occurred');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    
    getOrderDetails();
  }, [orderId, fetchOrderById]);
  
  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-3xl mx-auto">
          <div className="animate-pulse space-y-4">
            <div className="h-12 bg-muted rounded w-1/2"></div>
            <div className="h-64 bg-muted rounded"></div>
            <div className="h-32 bg-muted rounded"></div>
          </div>
        </div>
      </div>
    );
  }
  
  if (error || !order) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-3xl mx-auto">
          <Card>
            <CardContent className="p-6 text-center">
              <h2 className="text-2xl font-bold mb-4">Order Not Found</h2>
              <p className="text-muted-foreground mb-6">
                {error || "We couldn't find the order you're looking for."}
              </p>
              <Button asChild>
                <Link to="/orders">View Your Orders</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }
  
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-3xl mx-auto">
        <div className="mb-8 text-center">
          <CheckCircle size={64} className="mx-auto text-success mb-4" />
          <h1 className="text-2xl md:text-3xl font-bold mb-2">Order Confirmed!</h1>
          <p className="text-muted-foreground">
            Thank you for your purchase. Your order has been received and is being processed.
          </p>
        </div>
        
        <Card className="mb-8">
          <CardHeader className="bg-muted/30">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <CardTitle className="text-lg">Order #{order.id.slice(-6)}</CardTitle>
                <p className="text-sm text-muted-foreground">
                  Placed on {formatDate(order.created_at)}
                </p>
              </div>
              <Badge variant={
                order.status === 'delivered' ? 'success' : 
                order.status === 'cancelled' ? 'destructive' : 'secondary'
              } className="capitalize">
                {order.status}
              </Badge>
            </div>
          </CardHeader>
          
          <CardContent className="p-6">
            <div className="space-y-6">
              {/* Order Timeline */}
              <div className="flex items-center justify-between mb-6">
                <div className="flex flex-col items-center">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${order.status !== 'cancelled' ? 'bg-primary/10 text-primary' : 'bg-muted text-muted-foreground'}`}>
                    <Package size={20} />
                  </div>
                  <span className="text-xs mt-1">Confirmed</span>
                </div>
                <div className={`flex-1 h-1 mx-2 ${order.status !== 'pending' && order.status !== 'cancelled' ? 'bg-primary' : 'bg-muted'}`}></div>
                <div className="flex flex-col items-center">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${order.status === 'processing' || order.status === 'shipped' || order.status === 'delivered' ? 'bg-primary/10 text-primary' : 'bg-muted text-muted-foreground'}`}>
                    <Calendar size={20} />
                  </div>
                  <span className="text-xs mt-1">Processing</span>
                </div>
                <div className={`flex-1 h-1 mx-2 ${order.status === 'shipped' || order.status === 'delivered' ? 'bg-primary' : 'bg-muted'}`}></div>
                <div className="flex flex-col items-center">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${order.status === 'shipped' || order.status === 'delivered' ? 'bg-primary/10 text-primary' : 'bg-muted text-muted-foreground'}`}>
                    <Truck size={20} />
                  </div>
                  <span className="text-xs mt-1">Shipped</span>
                </div>
                <div className={`flex-1 h-1 mx-2 ${order.status === 'delivered' ? 'bg-primary' : 'bg-muted'}`}></div>
                <div className="flex flex-col items-center">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${order.status === 'delivered' ? 'bg-success/10 text-success' : 'bg-muted text-muted-foreground'}`}>
                    <CheckCircle size={20} />
                  </div>
                  <span className="text-xs mt-1">Delivered</span>
                </div>
              </div>
              
              {/* Order Items */}
              <div>
                <h3 className="font-medium mb-3">Items</h3>
                <div className="space-y-3">
                  {order.items && order.items.map((item) => (
                    <div key={item.id} className="flex justify-between items-center py-2 border-b border-border">
                      <div className="flex items-center">
                        <div className="mr-4">
                          <span className="text-sm font-medium">{item.quantity} x</span>
                        </div>
                        <div>
                          <p className="font-medium">{item.product_name}</p>
                          <p className="text-sm text-muted-foreground">Unit Price: {formatPrice(item.price)}</p>
                        </div>
                      </div>
                      <div className="font-medium">
                        {formatPrice(item.price * item.quantity)}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Shipping Information */}
                <div>
                  <h3 className="font-medium mb-3">Shipping Information</h3>
                  <div className="bg-muted/30 p-4 rounded-md">
                    <p className="font-medium">{order.shipping_address?.name}</p>
                    <p>{order.shipping_address?.address}</p>
                    <p>{order.shipping_address?.city}, {order.shipping_address?.state} {order.shipping_address?.zip_code}</p>
                    <p>{order.shipping_address?.country}</p>
                  </div>
                </div>
                
                {/* Payment Information */}
                <div>
                  <h3 className="font-medium mb-3">Payment Information</h3>
                  <div className="bg-muted/30 p-4 rounded-md">
                    <p><span className="text-muted-foreground">Method:</span> <span className="font-medium capitalize">{order.payment_method}</span></p>
                    <p><span className="text-muted-foreground">Status:</span> <span className="font-medium text-success">Paid</span></p>
                    
                    <Separator className="my-3" />
                    
                    <div className="space-y-1">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Subtotal:</span>
                        <span>{formatPrice(order.total - (order.total * 0.08))}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Tax:</span>
                        <span>{formatPrice(order.total * 0.08)}</span>
                      </div>
                      <div className="flex justify-between font-medium">
                        <span>Total:</span>
                        <span>{formatPrice(order.total)}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-between">
          <Button variant="outline" asChild>
            <Link to="/orders">
              <ArrowLeft size={16} className="mr-2" />
              View All Orders
            </Link>
          </Button>
          <Button asChild>
            <Link to="/products">Continue Shopping</Link>
          </Button>
        </div>
      </div>
    </div>
  );
};

export default OrderConfirmation;