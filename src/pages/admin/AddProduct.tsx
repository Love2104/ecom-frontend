import { useState } from 'react';
import ProductForm from '@/components/admin/ProductForm';
import useProducts from '@/hooks/useProducts';

const AddProduct = () => {
  const { createProduct, loading } = useProducts();
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (data: FormData) => {
    setError(null);
    try {
      const result = await createProduct(data);
      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    }
  };

  return (
    <div>
      <h1 className="text-2xl md:text-3xl font-bold mb-6">Add New Product</h1>
      {error && (
        <div className="bg-destructive/10 text-destructive p-4 rounded-md mb-6">
          {error}
        </div>
      )}
      <ProductForm onSubmit={handleSubmit} isLoading={loading} />
    </div>
  );
};

export default AddProduct;