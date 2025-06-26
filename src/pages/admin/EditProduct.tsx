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
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadProduct = async () => {
      if (!id) return;
      
      setIsLoading(true);
      setError(null);
      
      try {
        const result = await fetchProductById(id);
        if (result.success && result.product) {
          setProduct(result.product);
        } else {
          setError('Failed to load product details');
        }
      } catch (err) {
        setError('An error occurred while loading the product');
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };

    loadProduct();
  }, [id, fetchProductById]);

  const handleSubmit = async (data: FormData) => {
    if (!id) return { success: false, error: 'Product ID is missing' };
    
    setError(null);
    try {
      const result = await updateProduct(id, data);
      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    }
  };

  if (isLoading) {
    return (
      <div>
        <h1 className="text-2xl md:text-3xl font-bold mb-6">Edit Product</h1>
        <div className="animate-pulse space-y-4">
          <div className="h-12 bg-muted rounded"></div>
          <div className="h-64 bg-muted rounded"></div>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div>
        <h1 className="text-2xl md:text-3xl font-bold mb-6">Edit Product</h1>
        <div className="bg-destructive/10 text-destructive p-4 rounded-md">
          {error || 'Product not found'}
        </div>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-2xl md:text-3xl font-bold mb-6">Edit Product</h1>
      <ProductForm initialData={product} onSubmit={handleSubmit} isLoading={loading} />
    </div>
  );
};

export default EditProduct;