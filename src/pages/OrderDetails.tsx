import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Package, Truck, Calendar, CheckCircle } from 'lucide-react';
import useOrders from '@/hooks/useOrders';
import { formatPrice, formatDate } from '@/lib/utils';
import { Order } from '@/types';

const OrderDetail = () => {
  const { id } = useParams<{ id: string }>();
  const { fetchOrderById } = useOrders();

  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const getOrderDetails = async () => {
      if (!id) {
        setError('Order ID is missing');
        setLoading(false);
        return;
      }

      try {
        const result = await fetchOrderById(id);

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
  }, [id, fetchOrderById]);

  if (loading) {
    return (
      <div className="bg-background-light min-h-[calc(100vh-64px)] flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-primary/10 border-t-primary rounded-full animate-spin"></div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="bg-background-light min-h-[calc(100vh-64px)] flex flex-col items-center justify-center p-6 text-center">
        <span className="material-symbols-outlined text-accent-red text-5xl mb-4">search_off</span>
        <h2 className="font-display font-bold text-2xl text-primary mb-2">Order Not Found</h2>
        <p className="text-primary/60 mb-8 max-w-md">
          {error || "We couldn't find the order you're looking for. It may have been removed or the ID is incorrect."}
        </p>
        <Link to="/account" state={{ tab: 'orders' }} className="inline-block bg-primary text-white font-sans font-bold text-sm px-8 py-3 rounded-full hover:bg-primary/90 transition-all">
          View Your Orders
        </Link>
      </div>
    );
  }

  return (
    <div className="bg-background-light font-display text-primary min-h-[calc(100vh-64px)] py-12 px-6">
      <div className="max-w-4xl mx-auto">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8 pb-6 border-b border-primary/10 gap-4">
          <div>
            <Link to="/account" state={{ tab: 'orders' }} className="inline-flex items-center text-primary/60 hover:text-primary transition-colors font-sans text-sm font-bold mb-4">
              <ArrowLeft size={16} className="mr-2" /> Back to Orders
            </Link>
            <h1 className="text-3xl font-extrabold tracking-tight">Order Details</h1>
          </div>
          <div className="text-left sm:text-right">
            <p className="font-sans text-sm text-primary/40 uppercase tracking-widest font-bold mb-1">Order Number</p>
            <p className="font-bold text-lg">{order.id}</p>
          </div>
        </div>

        <div className="bg-white border border-primary/5 rounded-3xl p-6 sm:p-10 shadow-sm mb-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-10">
             <div>
                <p className="font-sans text-sm text-primary/60 mb-1">Placed on</p>
                <p className="font-bold">{formatDate(order.created_at)}</p>
             </div>
             <div>
                <span className={`inline-block px-4 py-2 rounded-full text-xs font-bold uppercase tracking-widest ${
                   order.status === 'DELIVERED' ? 'bg-success/10 text-success' :
                   order.status === 'CANCELLED' ? 'bg-destructive/10 text-destructive' :
                   'bg-primary/5 text-primary'
                }`}>
                   {order.status}
                </span>
             </div>
          </div>

          {/* Order Timeline */}
          <div className="py-8 border-t border-b border-primary/10 mb-10 overflow-x-auto">
            <div className="flex items-center justify-between min-w-[600px] px-4">
              <div className="flex flex-col items-center">
                <div className={`w-12 h-12 rounded-full flex items-center justify-center ${order.status !== 'CANCELLED' ? 'bg-primary text-white' : 'bg-primary/5 text-primary/40'}`}>
                  <Package size={20} />
                </div>
                <span className="font-sans font-bold text-xs mt-3 uppercase tracking-widest">Confirmed</span>
              </div>
              <div className={`flex-1 h-0.5 mx-4 ${order.status !== 'PENDING' && order.status !== 'CANCELLED' ? 'bg-primary' : 'bg-primary/10'}`}></div>
              <div className="flex flex-col items-center">
                <div className={`w-12 h-12 rounded-full flex items-center justify-center ${['PROCESSING', 'SHIPPED', 'DELIVERED'].includes(order.status) ? 'bg-primary text-white' : 'bg-primary/5 text-primary/40'}`}>
                  <Calendar size={20} />
                </div>
                <span className="font-sans font-bold text-xs mt-3 uppercase tracking-widest">Processing</span>
              </div>
              <div className={`flex-1 h-0.5 mx-4 ${['SHIPPED', 'DELIVERED'].includes(order.status) ? 'bg-primary' : 'bg-primary/10'}`}></div>
              <div className="flex flex-col items-center">
                <div className={`w-12 h-12 rounded-full flex items-center justify-center ${['SHIPPED', 'DELIVERED'].includes(order.status) ? 'bg-primary text-white' : 'bg-primary/5 text-primary/40'}`}>
                  <Truck size={20} />
                </div>
                <span className="font-sans font-bold text-xs mt-3 uppercase tracking-widest">Shipped</span>
              </div>
              <div className={`flex-1 h-0.5 mx-4 ${order.status === 'DELIVERED' ? 'bg-primary' : 'bg-primary/10'}`}></div>
              <div className="flex flex-col items-center">
                <div className={`w-12 h-12 rounded-full flex items-center justify-center ${order.status === 'DELIVERED' ? 'bg-success text-white' : 'bg-primary/5 text-primary/40'}`}>
                  <CheckCircle size={20} />
                </div>
                <span className="font-sans font-bold text-xs mt-3 uppercase tracking-widest">Delivered</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
            {/* Items */}
            <div className="lg:col-span-2">
               <h3 className="font-display font-bold text-xl mb-6">Items Ordered</h3>
               <div className="space-y-6">
                  {order.items?.map((item) => (
                    <div key={item.id} className="flex gap-4 items-center p-4 bg-primary/5 rounded-2xl">
                      <div className="w-16 h-16 bg-white rounded-xl flex items-center justify-center flex-shrink-0 shadow-sm">
                         <span className="material-symbols-outlined text-primary/20">loyalty</span>
                      </div>
                      <div className="flex-1">
                        <h4 className="font-bold">{item.product_name}</h4>
                        <p className="font-sans text-sm text-primary/60">Qty: {item.quantity} × {formatPrice(item.price)}</p>
                      </div>
                      <div className="font-bold whitespace-nowrap">
                        {formatPrice(item.price * item.quantity)}
                      </div>
                    </div>
                  ))}
               </div>
            </div>

            {/* Summary & Shipping */}
            <div className="space-y-8">
               <div className="bg-primary/5 rounded-2xl p-6">
                  <h3 className="font-display font-bold text-xl mb-4">Summary</h3>
                  <div className="space-y-3 font-sans text-sm">
                    <div className="flex justify-between text-primary/60">
                      <span>Subtotal</span>
                      <span>{formatPrice(order.total - (order.total * 0.08))}</span>
                    </div>
                    <div className="flex justify-between text-primary/60">
                      <span>Tax (8%)</span>
                      <span>{formatPrice(order.total * 0.08)}</span>
                    </div>
                    <div className="pt-3 border-t border-primary/10 flex justify-between font-bold text-base text-primary">
                      <span>Total</span>
                      <span>{formatPrice(order.total)}</span>
                    </div>
                  </div>
               </div>

               <div className="bg-primary/5 rounded-2xl p-6">
                  <h3 className="font-display font-bold text-lg mb-4">Shipping Info</h3>
                  <div className="font-sans text-sm text-primary/80 space-y-1">
                    <p className="font-bold text-primary">{order.shipping_address?.name}</p>
                    <p>{order.shipping_address?.address}</p>
                    <p>{order.shipping_address?.city}, {order.shipping_address?.state} {order.shipping_address?.zip_code}</p>
                    <p>{order.shipping_address?.country}</p>
                  </div>
               </div>

               <div className="bg-primary/5 rounded-2xl p-6">
                  <h3 className="font-display font-bold text-lg mb-4">Payment</h3>
                  <div className="font-sans text-sm text-primary/80">
                    <p className="mb-2"><span className="text-primary/60 uppercase tracking-widest text-xs font-bold mr-2">Method</span> <span className="capitalize font-bold">{order.payment_method}</span></p>
                    <p><span className="text-primary/60 uppercase tracking-widest text-xs font-bold mr-2">Status</span> <span className="text-success font-bold">Paid</span></p>
                  </div>
               </div>
            </div>
          </div>

        </div>

        <div className="flex justify-center mb-12">
           <Link to="/products" className="bg-primary text-white font-sans font-bold text-sm px-8 py-4 rounded-full hover:bg-primary/90 transition-all text-center inline-flex items-center">
              Continue Shopping
           </Link>
        </div>
      </div>
    </div>
  );
};

export default OrderDetail;