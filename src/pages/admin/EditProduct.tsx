import { useEffect, useState } from 'react';
import ProductForm from '@/components/admin/ProductForm';
import useProducts from '@/hooks/useProducts';
import { useParams } from 'react-router-dom';
import { Product } from '@/types';

const EditProduct = () => {
  const { id } = useParams<{ id: string }>();
  const { fetchProductById, updateProduct, loading } = useProducts();
  const [product, setProduct] = useState<Product | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      if (!id) return;
      const result = await fetchProductById(id);
      if (result.success) setProduct(result.product);
    };
    fetchData();
  }, [fetchProductById, id]);

  const handleSubmit = async (formData: FormData) => {
    if (!id) return { success: false, error: 'Missing product ID' };
    return await updateProduct(id, formData);
  };

  if (!product) return <div>Loading...</div>;

  return (
    <ProductForm
      initialData={product}
      onSubmit={handleSubmit}
      isLoading={loading.update}
    />
  );
};

export default EditProduct;
