import { useEffect, useState } from 'react';
import { Eye, Filter, Search } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Input } from '@/components/ui/Input';
import { Separator } from '@/components/ui/Separator';
import useOrders from '@/hooks/useOrders';
import { formatDate, formatPrice } from '@/lib/utils';

const AllOrders = () => {
  const { fetchOrders, orders, loading, error, updateOrderStatus } = useOrders();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [updatingOrderId, setUpdatingOrderId] = useState<string | null>(null);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  // Filter orders based on search term and status
  const filteredOrders = orders.filter(order => {
    const matchesSearch =
      order.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (order.shipping_address?.name && order.shipping_address.name.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesStatus = statusFilter === 'all' || order.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const handleStatusChange = async (orderId: string, newStatus: string) => {
    setUpdatingOrderId(orderId);

    try {
      const result = await updateOrderStatus(orderId, newStatus);

      if (result.success) {
        // Refresh orders list
        fetchOrders();
      } else {
        alert(`Failed to update order status: ${result.error}`);
      }
    } catch (error) {
      console.error('Error updating order status:', error);
      alert('An error occurred while updating the order status');
    } finally {
      setUpdatingOrderId(null);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'PENDING':
        return <Badge variant="secondary">Pending</Badge>;
      case 'PROCESSING':
        return <Badge variant="default">Processing</Badge>;
      case 'SHIPPED':
        return <Badge variant="default">Shipped</Badge>;
      case 'DELIVERED':
        return <Badge variant="success">Delivered</Badge>;
      case 'CANCELLED':
        return <Badge variant="destructive">Cancelled</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <div>
      <h1 className="text-2xl md:text-3xl font-bold mb-6">All Orders</h1>

      {error && (
        <div className="bg-destructive/10 text-destructive p-4 rounded-md mb-6">
          {error}
        </div>
      )}

      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" size={18} />
          <Input
            placeholder="Search by order ID or customer name"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>

        <div className="flex items-center gap-2">
          <Filter size={18} className="text-muted-foreground" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="h-10 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          >
            <option value="all">All Statuses</option>
            <option value="PENDING">Pending</option>
            <option value="PROCESSING">Processing</option>
            <option value="SHIPPED">Shipped</option>
            <option value="DELIVERED">Delivered</option>
            <option value="CANCELLED">Cancelled</option>
          </select>
        </div>
      </div>

      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="animate-pulse">
              <div className="h-12 bg-muted rounded mb-2"></div>
              <div className="h-32 bg-muted/50 rounded"></div>
            </div>
          ))}
        </div>
      ) : filteredOrders.length === 0 ? (
        <Card>
          <CardContent className="p-6 text-center">
            <p className="text-muted-foreground">No orders found matching your criteria.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {filteredOrders.map((order) => (
            <Card key={order.id} className="overflow-hidden">
              <CardHeader className="bg-muted/30 py-4">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                  <div>
                    <CardTitle className="text-lg">Order #{order.id.slice(-6)}</CardTitle>
                    <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-4">
                      <p className="text-sm text-muted-foreground">
                        Placed on {formatDate(order.created_at)}
                      </p>
                      <p className="text-sm">
                        Customer: <span className="font-medium">{order.shipping_address?.name}</span>
                      </p>
                    </div>
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

                  {/* Admin Actions */}
                  <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                      <h4 className="font-medium mb-1">Update Status</h4>
                      <div className="flex flex-wrap gap-2">
                        <Button
                          size="sm"
                          variant={order.status === 'PENDING' ? 'default' : 'outline'}
                          onClick={() => handleStatusChange(order.id, 'PENDING')}
                          disabled={updatingOrderId === order.id || order.status === 'PENDING'}
                        >
                          Pending
                        </Button>
                        <Button
                          size="sm"
                          variant={order.status === 'PROCESSING' ? 'default' : 'outline'}
                          onClick={() => handleStatusChange(order.id, 'PROCESSING')}
                          disabled={updatingOrderId === order.id || order.status === 'PROCESSING'}
                        >
                          Processing
                        </Button>
                        <Button
                          size="sm"
                          variant={order.status === 'SHIPPED' ? 'default' : 'outline'}
                          onClick={() => handleStatusChange(order.id, 'SHIPPED')}
                          disabled={updatingOrderId === order.id || order.status === 'SHIPPED'}
                        >
                          Shipped
                        </Button>
                        <Button
                          size="sm"
                          variant={order.status === 'DELIVERED' ? 'success' : 'outline'}
                          onClick={() => handleStatusChange(order.id, 'DELIVERED')}
                          disabled={updatingOrderId === order.id || order.status === 'DELIVERED'}
                          className={order.status === 'DELIVERED' ? 'bg-success text-success-foreground hover:bg-success/90' : ''}
                        >
                          Delivered
                        </Button>
                        <Button
                          size="sm"
                          variant={order.status === 'CANCELLED' ? 'destructive' : 'outline'}
                          onClick={() => handleStatusChange(order.id, 'CANCELLED')}
                          disabled={updatingOrderId === order.id || order.status === 'CANCELLED'}
                        >
                          Cancelled
                        </Button>
                      </div>
                    </div>

                    <div className="text-right">
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

export default AllOrders;