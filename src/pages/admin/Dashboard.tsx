import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Package, DollarSign, ShoppingCart, TrendingUp } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import useOrders from '@/hooks/useOrders';
import { formatPrice } from '@/lib/utils';

const Dashboard = () => {
  const { fetchOrders, orders, loading, error } = useOrders();
  const [stats, setStats] = useState({
    totalOrders: 0,
    totalRevenue: 0,
    pendingOrders: 0,
    deliveredOrders: 0,
    cancelledOrders: 0,
    averageOrderValue: 0
  });
  
  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);
  
  useEffect(() => {
    if (orders.length > 0) {
      const totalOrders = orders.length;
      const totalRevenue = orders.reduce((sum, order) => sum + order.total, 0);
      const pendingOrders = orders.filter(order => order.status === 'pending').length;
      const deliveredOrders = orders.filter(order => order.status === 'delivered').length;
      const cancelledOrders = orders.filter(order => order.status === 'cancelled').length;
      const averageOrderValue = totalRevenue / totalOrders;
      
      setStats({
        totalOrders,
        totalRevenue,
        pendingOrders,
        deliveredOrders,
        cancelledOrders,
        averageOrderValue
      });
    }
  }, [orders]);
  
  const recentOrders = orders.slice(0, 5);
  
  return (
    <div>
      <h1 className="text-2xl md:text-3xl font-bold mb-6">Admin Dashboard</h1>
      
      {error && (
        <div className="bg-destructive/10 text-destructive p-4 rounded-md mb-6">
          {error}
        </div>
      )}
      
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Orders</p>
                <h3 className="text-2xl font-bold">{stats.totalOrders}</h3>
              </div>
              <div className="p-3 bg-primary/10 rounded-full">
                <Package size={24} className="text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Revenue</p>
                <h3 className="text-2xl font-bold">{formatPrice(stats.totalRevenue)}</h3>
              </div>
              <div className="p-3 bg-success/10 rounded-full">
                <DollarSign size={24} className="text-success" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Pending Orders</p>
                <h3 className="text-2xl font-bold">{stats.pendingOrders}</h3>
              </div>
              <div className="p-3 bg-secondary/10 rounded-full">
                <ShoppingCart size={24} className="text-secondary" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Average Order Value</p>
                <h3 className="text-2xl font-bold">{formatPrice(stats.averageOrderValue || 0)}</h3>
              </div>
              <div className="p-3 bg-primary/10 rounded-full">
                <TrendingUp size={24} className="text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Recent Orders */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Recent Orders</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="animate-pulse h-12 bg-muted rounded"></div>
              ))}
            </div>
          ) : recentOrders.length === 0 ? (
            <p className="text-center text-muted-foreground py-4">No orders found.</p>
          ) : (
            <div className="space-y-4">
              <div className="grid grid-cols-4 text-sm text-muted-foreground">
                <div>Order ID</div>
                <div>Customer</div>
                <div>Status</div>
                <div className="text-right">Amount</div>
              </div>
              
              {recentOrders.map((order) => (
                <div key={order.id} className="grid grid-cols-4 items-center py-2 border-b border-border">
                  <div className="font-medium">#{order.id.slice(-6)}</div>
                  <div>{order.shipping_address?.name || 'N/A'}</div>
                  <div>
                    <span className={`inline-block px-2 py-1 text-xs rounded-full ${
                      order.status === 'delivered' ? 'bg-success/10 text-success' :
                      order.status === 'cancelled' ? 'bg-destructive/10 text-destructive' :
                      'bg-secondary/10 text-secondary'
                    }`}>
                      {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                    </span>
                  </div>
                  <div className="text-right font-medium">{formatPrice(order.total)}</div>
                </div>
              ))}
            </div>
          )}
          
          <div className="mt-6 text-center">
            <Button asChild>
              <Link to="/admin/orders">View All Orders</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
      
      {/* Order Status Distribution */}
      <Card>
        <CardHeader>
          <CardTitle>Order Status Distribution</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center">
              <div className="w-40 text-sm">Pending</div>
              <div className="flex-1 h-4 bg-muted rounded-full overflow-hidden">
                <div 
                  className="h-full bg-secondary" 
                  style={{ width: `${orders.length ? (stats.pendingOrders / orders.length) * 100 : 0}%` }}
                ></div>
              </div>
              <div className="w-16 text-right text-sm">{stats.pendingOrders}</div>
            </div>
            
            <div className="flex items-center">
              <div className="w-40 text-sm">Processing</div>
              <div className="flex-1 h-4 bg-muted rounded-full overflow-hidden">
                <div 
                  className="h-full bg-primary" 
                  style={{ width: `${orders.length ? (orders.filter(o => o.status === 'processing').length / orders.length) * 100 : 0}%` }}
                ></div>
              </div>
              <div className="w-16 text-right text-sm">{orders.filter(o => o.status === 'processing').length}</div>
            </div>
            
            <div className="flex items-center">
              <div className="w-40 text-sm">Shipped</div>
              <div className="flex-1 h-4 bg-muted rounded-full overflow-hidden">
                <div 
                  className="h-full bg-primary/70" 
                  style={{ width: `${orders.length ? (orders.filter(o => o.status === 'shipped').length / orders.length) * 100 : 0}%` }}
                ></div>
              </div>
              <div className="w-16 text-right text-sm">{orders.filter(o => o.status === 'shipped').length}</div>
            </div>
            
            <div className="flex items-center">
              <div className="w-40 text-sm">Delivered</div>
              <div className="flex-1 h-4 bg-muted rounded-full overflow-hidden">
                <div 
                  className="h-full bg-success" 
                  style={{ width: `${orders.length ? (stats.deliveredOrders / orders.length) * 100 : 0}%` }}
                ></div>
              </div>
              <div className="w-16 text-right text-sm">{stats.deliveredOrders}</div>
            </div>
            
            <div className="flex items-center">
              <div className="w-40 text-sm">Cancelled</div>
              <div className="flex-1 h-4 bg-muted rounded-full overflow-hidden">
                <div 
                  className="h-full bg-destructive" 
                  style={{ width: `${orders.length ? (stats.cancelledOrders / orders.length) * 100 : 0}%` }}
                ></div>
              </div>
              <div className="w-16 text-right text-sm">{stats.cancelledOrders}</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Dashboard;