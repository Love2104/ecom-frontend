import { useState } from 'react';
import ProductForm from '@/components/admin/ProductForm';
import useProducts from '@/hooks/useProducts';

const AddProduct = () => {
  const { createProduct, loading } = useProducts();
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (formData: FormData) => {
    setError(null);
    setSuccess(false);
    const result = await createProduct(formData);
    if (result.success) {
      setSuccess(true);
    } else {
      setError(result.error || 'Unknown error');
    }
    return result;
  };

  return (
    <div>
      <h1 className="text-2xl md:text-3xl font-bold mb-6">Add New Product</h1>
      {success && (
        <div className="bg-green-100 text-green-700 p-4 rounded-md mb-6">
          Product created successfully!
        </div>
      )}
      {error && (
        <div className="bg-destructive/10 text-destructive p-4 rounded-md mb-6">
          {error}
        </div>
      )}
      <ProductForm onSubmit={handleSubmit} isLoading={loading.create} />
    </div>
  );
};

export default AddProduct;