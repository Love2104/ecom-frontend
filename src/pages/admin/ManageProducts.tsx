import { useEffect } from 'react';
import ProductList from '@/components/admin/ProductList';
import useProducts from '@/hooks/useProducts';

const ManageProducts = () => {
  const { products, loading, error, fetchProducts, deleteProduct } = useProducts();

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const handleDelete = async (id: string) => {
    const result = await deleteProduct(id);
    if (!result.success) {
      console.error('Failed to delete product:', result.error);
    }
  };

  return (
    <div>
      <h1 className="text-2xl md:text-3xl font-bold mb-6">Manage Products</h1>
      <ProductList
        products={products}
        isLoading={loading.fetch}
        error={error}
        onDelete={handleDelete}
        onRefresh={fetchProducts}
      />
    </div>
  );
};

export default ManageProducts;
