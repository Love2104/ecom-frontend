import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';

import ProductForm from '@/components/admin/ProductForm';
import useProducts from '@/hooks/useProducts';
import { Product } from '@/types';

const EditProduct = () => {
  const { id } = useParams<{ id: string }>();
  const { fetchProductById, updateProduct, loading } = useProducts();

  const [product, setProduct] = useState<Product | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Fetch product data when component mounts
  useEffect(() => {
    const fetchData = async () => {
      if (!id) return;
      const result = await fetchProductById(id);
      if (result.success) {
        setProduct(result.product);
      } else {
        setError(result.error || 'Failed to fetch product');
      }
    };
    fetchData();
  }, [fetchProductById, id]);

  // Form submission handler
  const handleSubmit = async (formData: FormData) => {
    if (!id) return { success: false, error: 'Missing product ID' };
    setError(null);
    const result = await updateProduct(id, formData);
    if (!result.success) {
      setError(result.error || 'Failed to update product');
    }
    return result;
  };

  // Render loading state
  if (loading.fetch && !product) {
    return <div className="text-center py-8">Loading product details...</div>;
  }

  // Render error state
  if (error && !product) {
    return (
      <div className="bg-destructive/10 text-destructive p-4 rounded-md max-w-xl mx-auto mt-8 text-center">
        {error}
      </div>
    );
  }

  // Product not found
  if (!product) {
    return <div className="text-center py-8">Product not found.</div>;
  }

  // Render the product form with initial data
  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Edit Product</h1>
      {error && (
        <div className="bg-destructive/10 text-destructive p-4 rounded-md mb-4">
          {error}
        </div>
      )}
      <ProductForm
        initialData={product}
        onSubmit={handleSubmit}
        isLoading={loading.update}
      />
    </div>
  );
};

export default EditProduct;
