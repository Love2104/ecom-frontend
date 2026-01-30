import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Save, Loader2, X, Plus } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/Card';
import { Separator } from '@/components/ui/Separator';
import useApi from '@/hooks/useApi';
import { Product } from '@/types';
import { useSelector } from 'react-redux';
import { RootState } from '@/store';

interface ProductFormProps {
  initialData?: Product;
  onSubmit: (data: FormData) => Promise<{ success: boolean; error?: string }>;
  isLoading: boolean;
}

const ProductForm: React.FC<ProductFormProps> = ({ initialData, onSubmit, isLoading }) => {
  const navigate = useNavigate();
  const { user } = useSelector((state: RootState) => state.auth);
  const { fetchData: fetchCategories } = useApi<any>();

  const [error, setError] = useState('');
  const [categories, setCategories] = useState<{ id: string, name: string }[]>([]);
  const [images, setImages] = useState<string[]>([]);
  const [currentImageInput, setCurrentImageInput] = useState('');

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    originalPrice: '',
    category: '',
    stock: '',
    discount: '',
    tags: '',
  });

  // Fetch Categories on Mount
  useEffect(() => {
    const loadCategories = async () => {
      const res = await fetchCategories({ url: '/categories' });
      if (res && res.success && res.categories) {
        setCategories(res.categories);
      }
    };
    loadCategories();
  }, []);

  // Initialize Form Data
  useEffect(() => {
    if (initialData) {
      setFormData({
        name: initialData.name || '',
        description: initialData.description || '',
        price: initialData.price.toString() || '',
        originalPrice: initialData.originalPrice?.toString() || initialData.original_price?.toString() || '',
        category: initialData.category_id || '',
        stock: initialData.stock.toString() || '',
        discount: initialData.discount?.toString() || '0',
        tags: initialData.tags?.join(', ') || '',
      });

      if (initialData.images && initialData.images.length > 0) {
        setImages(initialData.images);
      } else if (initialData.image) {
        // Fallback for old single image
        setImages([initialData.image]);
      }
    }
  }, [initialData]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleAddImage = () => {
    if (!currentImageInput) return;
    try {
      new URL(currentImageInput);
      setImages([...images, currentImageInput]);
      setCurrentImageInput('');
    } catch {
      setError('Invalid image URL');
    }
  };

  const handleRemoveImage = (index: number) => {
    setImages(images.filter((_, i) => i !== index));
  };

  const validateForm = () => {
    if (!formData.name.trim()) return 'Product name is required';
    if (!formData.description.trim()) return 'Product description is required';
    if (!formData.price || isNaN(Number(formData.price)) || Number(formData.price) <= 0)
      return 'Valid price is required';
    if (!formData.category.trim()) return 'Category is required';
    if (!formData.stock || isNaN(Number(formData.stock)) || Number(formData.stock) < 0)
      return 'Valid stock quantity is required';
    if (images.length === 0) return 'At least one product image is required';

    return '';
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      return;
    }

    const submitData = new FormData();
    if (initialData?.id) {
      submitData.append('id', initialData.id);
    }
    submitData.append('name', formData.name);
    submitData.append('description', formData.description);
    submitData.append('price', formData.price);
    if (formData.originalPrice) {
      submitData.append('original_price', formData.originalPrice);
    }
    submitData.append('category_id', formData.category);
    submitData.append('stock', formData.stock);
    submitData.append('discount', formData.discount || '0');

    // Handle tags
    const tags = formData.tags.split(',')
      .map(tag => tag.trim())
      .filter(tag => tag.length > 0);
    submitData.append('tags', JSON.stringify(tags));

    // Send images. Backend expects 'images' (handled as array or single)
    // We will send JSON string if backend supports it, or individual fields.
    // For now, let's append 'images' as a JSON string and also 'image_url' as the first image for backward compatibility
    submitData.append('images', JSON.stringify(images));
    if (images.length > 0) {
      submitData.append('image_url', images[0]);
    }

    try {
      const result = await onSubmit(submitData);
      if (result.success) {
        if (user?.role === 'SUPPLIER') {
          navigate('/supplier');
        } else {
          navigate('/admin/products');
        }
      } else {
        setError(result.error || 'Failed to save product');
      }
    } catch (err) {
      setError('An unexpected error occurred');
      console.error(err);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{initialData ? 'Edit Product' : 'Add New Product'}</CardTitle>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-6">
          {error && (
            <div className="bg-destructive/10 text-destructive p-3 rounded-md">
              {error}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="name" className="block text-sm font-medium mb-2">Product Name *</label>
              <Input
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Enter product name"
                required
              />
            </div>

            <div>
              <label htmlFor="category" className="block text-sm font-medium mb-2">Category *</label>
              <select
                id="category"
                name="category"
                value={formData.category} // Store ID here
                onChange={handleChange}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                required
              >
                <option value="">Select Category</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label htmlFor="description" className="block text-sm font-medium mb-2">Description *</label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Enter product description"
              className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label htmlFor="price" className="block text-sm font-medium mb-2">Price *</label>
              <Input
                id="price"
                name="price"
                type="number"
                step="0.01"
                value={formData.price}
                onChange={handleChange}
                placeholder="Enter price"
                required
              />
            </div>

            <div>
              <label htmlFor="originalPrice" className="block text-sm font-medium mb-2">Original Price</label>
              <Input
                id="originalPrice"
                name="originalPrice"
                type="number"
                step="0.01"
                value={formData.originalPrice}
                onChange={handleChange}
                placeholder="Original price (optional)"
              />
            </div>

            <div>
              <label htmlFor="stock" className="block text-sm font-medium mb-2">Stock *</label>
              <Input
                id="stock"
                name="stock"
                type="number"
                value={formData.stock}
                onChange={handleChange}
                placeholder="Enter stock quantity"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="discount" className="block text-sm font-medium mb-2">Discount (%)</label>
              <Input
                id="discount"
                name="discount"
                type="number"
                max="100"
                min="0"
                value={formData.discount}
                onChange={handleChange}
                placeholder="Discount percentage"
              />
            </div>

            <div>
              <label htmlFor="tags" className="block text-sm font-medium mb-2">Tags (comma-separated)</label>
              <Input
                id="tags"
                name="tags"
                value={formData.tags}
                onChange={handleChange}
                placeholder="e.g., bestseller, new arrival"
              />
            </div>
          </div>

          {/* Multi Image Upload Section */}
          <div>
            <label className="block text-sm font-medium mb-2">Product Images *</label>
            <div className="space-y-4">
              <div className="flex gap-2">
                <Input
                  value={currentImageInput}
                  onChange={(e) => setCurrentImageInput(e.target.value)}
                  placeholder="Enter image URL"
                />
                <Button type="button" onClick={handleAddImage} variant="outline">
                  <Plus size={16} />
                </Button>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {images.map((img, index) => (
                  <div key={index} className="relative group border rounded-md overflow-hidden aspect-square">
                    <img src={img} alt={`Product ${index + 1}`} className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={() => handleRemoveImage(index)}
                      className="absolute top-1 right-1 bg-destructive text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X size={14} />
                    </button>
                  </div>
                ))}
              </div>
              {images.length === 0 && (
                <p className="text-sm text-muted-foreground italic">No images added yet.</p>
              )}
            </div>
          </div>
        </CardContent>

        <Separator />

        <CardFooter className="flex justify-between pt-6">
          <Button
            type="button"
            variant="outline"
            onClick={() => {
              if (user?.role === 'SUPPLIER') {
                navigate('/supplier');
              } else {
                navigate('/admin/products');
              }
            }}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={isLoading}>
            {isLoading ? (
              <>
                <Loader2 size={16} className="mr-2 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save size={16} className="mr-2" />
                Save Product
              </>
            )}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
};

export default ProductForm;