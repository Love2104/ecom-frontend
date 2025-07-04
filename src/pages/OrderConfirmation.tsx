import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import useApi from '@/hooks/useApi';
import { formatPrice } from '@/lib/utils';

const OrderConfirmation = () => {
  const { orderId } = useParams();
  const [order, setOrder] = useState<any>(null);
  const { fetchData, loading, error } = useApi({ requireAuth: true });

  useEffect(() => {
    const fetchOrder = async () => {
      const res = await fetchData({
        url: `/orders/${orderId}`,
        method: 'GET',
      });

      if (res?.success) {
        setOrder(res.order);
      }
    };

    fetchOrder();
  }, [orderId]);

  if (loading || !order) return <p className="p-4">Loading order...</p>;
  if (error) return <p className="text-red-500 p-4">{error}</p>;

  return (
    <div className="container mx-auto py-12 px-4">
      <h1 className="text-2xl font-bold mb-4">Thank you for your purchase!</h1>
      <p className="mb-6">Your order has been placed successfully.</p>

      <div className="border p-4 rounded shadow-sm space-y-3">
        <p><strong>Order ID:</strong> {order.id}</p>
        <p><strong>Total:</strong> {formatPrice(order.total)}</p>
        <p><strong>Status:</strong> {order.status}</p>
        <p><strong>Items:</strong></p>
        <ul className="list-disc list-inside">
          {order.items.map((item: any) => (
            <li key={item.id}>
              {item.product_name} x {item.quantity} — {formatPrice(item.price * item.quantity)}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default OrderConfirmation;
