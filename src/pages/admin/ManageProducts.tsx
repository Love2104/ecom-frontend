import { useEffect, useState } from 'react';
import ProductList from '@/components/admin/ProductList';
import useProducts from '@/hooks/useProducts';

const ManageProducts = () => {
  const { products, loading, error, fetchProducts, deleteProduct } = useProducts();
  const [deleteError, setDeleteError] = useState<string | null>(null);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const handleDelete = async (id: string) => {
    try {
      setDeleteError(null);
      const result = await deleteProduct(id);
      
      if (!result.success) {
        setDeleteError(result.error || 'Failed to delete product');
        console.error('Failed to delete product:', result.error);
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred';
      setDeleteError(errorMessage);
      console.error('Error deleting product:', errorMessage);
    }
  };

  return (
    <div>
      <h1 className="text-2xl md:text-3xl font-bold mb-6">Manage Products</h1>
      
      {deleteError && (
        <div className="bg-destructive/10 text-destructive p-4 rounded-md mb-6">
          {deleteError}
        </div>
      )}
      
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