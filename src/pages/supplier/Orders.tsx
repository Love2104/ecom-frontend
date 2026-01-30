import { useEffect, useState } from 'react';
import { Eye, Filter, Search, MapPin, User, Package } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Input } from '@/components/ui/Input';
import { Separator } from '@/components/ui/Separator';
import useOrders from '@/hooks/useOrders';
import { formatDate, formatPrice } from '@/lib/utils';

const SupplierOrders = () => {
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
        <div className="container mx-auto">
            <h1 className="text-2xl md:text-3xl font-bold mb-6">Manage My Orders</h1>

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
                    <CardContent className="p-6 text-center text-muted-foreground">
                        No orders found for your products.
                    </CardContent>
                </Card>
            ) : (
                <div className="space-y-6">
                    {filteredOrders.map((order) => (
                        <Card key={order.id} className="overflow-hidden border-l-4 border-l-primary">
                            <CardHeader className="bg-muted/10 py-4">
                                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                                    <div>
                                        <div className="flex items-center gap-2">
                                            <CardTitle className="text-lg">Order #{order.id.slice(-6)}</CardTitle>
                                            {getStatusBadge(order.status)}
                                        </div>
                                        <p className="text-sm text-muted-foreground">
                                            Placed on {formatDate(order.created_at)}
                                        </p>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <Button variant="outline" size="sm" asChild>
                                            <Link to={`/orders/${order.id}`}>
                                                <Eye size={16} className="mr-2" />
                                                Full Invoice
                                            </Link>
                                        </Button>
                                    </div>
                                </div>
                            </CardHeader>

                            <CardContent className="p-6">
                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                                    {/* Left: Shipping & Items */}
                                    <div className="space-y-6">
                                        <div>
                                            <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-3 flex items-center">
                                                <User className="mr-2 h-4 w-4" /> Customer Information
                                            </h3>
                                            <div className="bg-muted/30 p-4 rounded-lg space-y-2">
                                                <p className="font-medium">{order.shipping_address?.name}</p>
                                                <div className="flex items-start gap-2 text-sm">
                                                    <MapPin className="h-4 w-4 mt-0.5 text-muted-foreground shrink-0" />
                                                    <span>
                                                        {order.shipping_address?.address}, {order.shipping_address?.city},<br />
                                                        {order.shipping_address?.state} - {order.shipping_address?.zip_code}, {order.shipping_address?.country}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>

                                        <div>
                                            <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-3 flex items-center">
                                                <Package className="mr-2 h-4 w-4" /> Your Items In This Order
                                            </h3>
                                            <div className="space-y-3">
                                                {order.items?.map((item) => (
                                                    <div key={item.id} className="flex justify-between items-center p-3 border rounded-md">
                                                        <div>
                                                            <p className="font-medium">{item.product_name}</p>
                                                            <p className="text-sm text-muted-foreground">Qty: {item.quantity}</p>
                                                        </div>
                                                        <div className="text-right">
                                                            <p className="font-medium">{formatPrice(item.price * item.quantity)}</p>
                                                            <p className="text-xs text-muted-foreground">{formatPrice(item.price)} each</p>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Right: Actions */}
                                    <div className="flex flex-col justify-between border-t lg:border-t-0 lg:border-l lg:pl-8 pt-6 lg:pt-0">
                                        <div>
                                            <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-4">
                                                Order Fulfillment
                                            </h3>
                                            <div className="grid grid-cols-1 gap-2">
                                                <Button
                                                    variant={order.status === 'PROCESSING' ? 'default' : 'outline'}
                                                    onClick={() => handleStatusChange(order.id, 'PROCESSING')}
                                                    disabled={updatingOrderId === order.id || order.status !== 'PENDING'}
                                                    className="justify-start"
                                                >
                                                    Mark as Processing
                                                </Button>
                                                <Button
                                                    variant={order.status === 'SHIPPED' ? 'default' : 'outline'}
                                                    onClick={() => handleStatusChange(order.id, 'SHIPPED')}
                                                    disabled={updatingOrderId === order.id || order.status !== 'PROCESSING'}
                                                    className="justify-start"
                                                >
                                                    Mark as Shipped
                                                </Button>
                                                <Button
                                                    variant={order.status === 'DELIVERED' ? 'success' : 'outline'}
                                                    onClick={() => handleStatusChange(order.id, 'DELIVERED')}
                                                    disabled={updatingOrderId === order.id || order.status !== 'SHIPPED'}
                                                    className={`justify-start ${order.status === 'DELIVERED' ? 'bg-success text-success-foreground hover:bg-success/90' : ''}`}
                                                >
                                                    Mark as Delivered
                                                </Button>
                                                <Separator className="my-2" />
                                                <Button
                                                    variant="ghost"
                                                    className="text-destructive hover:bg-destructive/10 justify-start"
                                                    onClick={() => handleStatusChange(order.id, 'CANCELLED')}
                                                    disabled={updatingOrderId === order.id || ['DELIVERED', 'CANCELLED'].includes(order.status)}
                                                >
                                                    Cancel Order
                                                </Button>
                                            </div>
                                        </div>

                                        <div className="mt-8 p-4 bg-primary/5 rounded-lg border border-primary/10">
                                            <p className="text-sm text-muted-foreground mb-1 font-medium underline">Seller Revenue For This Order</p>
                                            <p className="text-2xl font-bold text-primary">
                                                {formatPrice(order.items?.reduce((sum, item) => sum + (item.price * item.quantity), 0) || 0)}
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

export default SupplierOrders;
