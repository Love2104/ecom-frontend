import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Package, AlertCircle, Eye } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Separator } from '@/components/ui/Separator';
import { Badge } from '@/components/ui/Badge';
import useOrders from '@/hooks/useOrders';
import { formatPrice, formatDate } from '@/lib/utils';
import useAuth from '@/hooks/useAuth';

const Orders = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const { fetchOrders, orders, loading, error } = useOrders();
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  
  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login', { state: { returnTo: '/orders' } });
      return;
    }
    
    const loadOrders = async () => {
      await fetchOrders();
      setIsInitialLoad(false);
    };
    
    loadOrders();
  }, [isAuthenticated, navigate, fetchOrders]);
  
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="secondary">Pending</Badge>;
      case 'processing':
        return <Badge variant="default">Processing</Badge>;
      case 'shipped':
        return <Badge variant="default">Shipped</Badge>;
      case 'delivered':
        return <Badge variant="success">Delivered</Badge>;
      case 'cancelled':
        return <Badge variant="destructive">Cancelled</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };
  
  if (isInitialLoad || loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-2xl md:text-3xl font-bold mb-8">My Orders</h1>
        <div className="animate-pulse space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-muted rounded-lg h-32"></div>
          ))}
        </div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-2xl md:text-3xl font-bold mb-8">My Orders</h1>
        <Card>
          <CardContent className="p-6 text-center">
            <AlertCircle size={48} className="mx-auto text-destructive mb-4" />
            <h2 className="text-xl font-semibold mb-2">Error Loading Orders</h2>
            <p className="text-muted-foreground mb-6">{error}</p>
            <Button onClick={() => fetchOrders()}>Try Again</Button>
          </CardContent>
        </Card>
      </div>
    );
  }
  
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl md:text-3xl font-bold mb-8">My Orders</h1>
      
      {orders.length === 0 ? (
        <Card>
          <CardContent className="p-6 text-center">
            <Package size={48} className="mx-auto text-muted-foreground mb-4" />
            <h2 className="text-xl font-semibold mb-2">No Orders Yet</h2>
            <p className="text-muted-foreground mb-6">
              You haven't placed any orders yet. Start shopping to see your orders here.
            </p>
            <Button asChild>
              <Link to="/products">Browse Products</Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {orders.map((order) => (
            <Card key={order.id} className="overflow-hidden">
              <CardHeader className="bg-muted/30 py-4">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                  <div>
                    <CardTitle className="text-lg">Order #{order.id.slice(-6)}</CardTitle>
                    <p className="text-sm text-muted-foreground">
                      Placed on {formatDate(order.created_at)}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    {getStatusBadge(order.status)}
                    <Button variant="outline" size="sm" asChild>
                      <Link to={`/orders/${order.id}`}>
                        <Eye size={16} className="mr-2" />
                        View Details
                      </Link>
                    </Button>
                  </div>
                </div>
              </CardHeader>
              
              <CardContent className="p-6">
                <div className="space-y-4">
                  {/* Order Items Summary */}
                  <div>
                    <h3 className="font-medium mb-2">Items</h3>
                    <div className="space-y-2">
                      {order.items && order.items.length > 0 ? (
                        order.items.map((item) => (
                          <div key={item.id} className="flex justify-between">
                            <div className="flex items-center">
                              <span className="text-sm">
                                {item.quantity} x {item.product_name}
                              </span>
                            </div>
                            <span className="text-sm font-medium">
                              {formatPrice(item.price * item.quantity)}
                            </span>
                          </div>
                        ))
                      ) : (
                        <p className="text-sm text-muted-foreground">
                          {order.items?.length || 0} items
                        </p>
                      )}
                    </div>
                  </div>
                  
                  <Separator />
                  
                  {/* Order Details */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                    <div>
                      <h4 className="font-medium mb-1">Shipping Address</h4>
                      <p className="text-muted-foreground">
                        {order.shipping_address?.name}<br />
                        {order.shipping_address?.address}<br />
                        {order.shipping_address?.city}, {order.shipping_address?.state} {order.shipping_address?.zip_code}<br />
                        {order.shipping_address?.country}
                      </p>
                    </div>
                    
                    <div>
                      <h4 className="font-medium mb-1">Payment Method</h4>
                      <p className="text-muted-foreground capitalize">
                        {order.payment_method}
                      </p>
                    </div>
                    
                    <div>
                      <h4 className="font-medium mb-1">Order Total</h4>
                      <p className="text-lg font-bold">
                        {formatPrice(order.total)}
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default Orders;