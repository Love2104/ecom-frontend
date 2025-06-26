import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Save, Loader2 } from 'lucide-react';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '../ui/Card';
import { Separator } from '../ui/Separator';
import ImageUpload from './ImageUpload';
import { Product } from '@/types';

interface ProductFormProps {
  initialData?: Product;
  onSubmit: (data: FormData) => Promise<{ success: boolean; error?: string }>;
  isLoading: boolean;
}

const ProductForm = ({ initialData, onSubmit, isLoading }: ProductFormProps) => {
  const navigate = useNavigate();
  const [error, setError] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);
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

  useEffect(() => {
    if (initialData) {
      setFormData({
        name: initialData.name || '',
        description: initialData.description || '',
        price: initialData.price.toString() || '',
        originalPrice: initialData.originalPrice?.toString() || initialData.original_price?.toString() || '',
        category: initialData.category || '',
        stock: initialData.stock.toString() || '',
        discount: initialData.discount?.toString() || '0',
        tags: initialData.tags?.join(', ') || '',
      });
      setImageUrl(initialData.image || '');
    }
  }, [initialData]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleImageUrlChange = (url: string) => {
    setImageUrl(url);
    setImageFile(null);
  };

  const handleImageFileChange = (file: File | null) => {
    setImageFile(file);
    if (file) {
      setImageUrl('');
    }
  };

  const validateForm = () => {
    if (!formData.name.trim()) return 'Product name is required';
    if (!formData.description.trim()) return 'Product description is required';
    if (!formData.price || isNaN(Number(formData.price)) || Number(formData.price) <= 0) 
      return 'Valid price is required';
    if (!formData.category.trim()) return 'Category is required';
    if (!formData.stock || isNaN(Number(formData.stock)) || Number(formData.stock) < 0)
      return 'Valid stock quantity is required';
    if (formData.discount && (isNaN(Number(formData.discount)) || Number(formData.discount) < 0 || Number(formData.discount) > 100))
      return 'Discount must be between 0 and 100';
    if (!imageUrl && !imageFile && !initialData?.image) return 'Product image is required';
    
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
    submitData.append('category', formData.category);
    submitData.append('stock', formData.stock);
    submitData.append('discount', formData.discount || '0');
    
    // Handle tags
    const tags = formData.tags.split(',')
      .map(tag => tag.trim())
      .filter(tag => tag.length > 0);
    submitData.append('tags', JSON.stringify(tags));
    
    // Handle image
    if (imageFile) {
      submitData.append('image', imageFile);
    } else if (imageUrl) {
      submitData.append('image_url', imageUrl);
    }
    
    try {
      const result = await onSubmit(submitData);
      if (result.success) {
        navigate('/admin/products');
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
      <form onSubmit={handleSubmit} encType="multipart/form-data">
        <CardContent className="space-y-6">
          {error && (
            <div className="bg-destructive/10 text-destructive p-3 rounded-md text-sm">
              {error}
            </div>
          )}
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <label htmlFor="name" className="block text-sm font-medium mb-1">
                  Product Name *
                </label>
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
                <label htmlFor="description" className="block text-sm font-medium mb-1">
                  Description *
                </label>
                <textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  rows={4}
                  placeholder="Enter product description"
                  className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  required
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="price" className="block text-sm font-medium mb-1">
                    Price ($) *
                  </label>
                  <Input
                    id="price"
                    name="price"
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.price}
                    onChange={handleChange}
                    placeholder="0.00"
                    required
                  />
                </div>
                
                <div>
                  <label htmlFor="originalPrice" className="block text-sm font-medium mb-1">
                    Original Price ($)
                  </label>
                  <Input
                    id="originalPrice"
                    name="originalPrice"
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.originalPrice}
                    onChange={handleChange}
                    placeholder="0.00"
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="category" className="block text-sm font-medium mb-1">
                    Category *
                  </label>
                  <select
                    id="category"
                    name="category"
                    value={formData.category}
                    onChange={handleChange}
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    required
                  >
                    <option value="">Select Category</option>
                    <option value="electronics">Electronics</option>
                    <option value="clothing">Clothing</option>
                    <option value="home">Home & Kitchen</option>
                    <option value="books">Books</option>
                    <option value="accessories">Accessories</option>
                    <option value="sports">Sports & Outdoors</option>
                  </select>
                </div>
                
                <div>
                  <label htmlFor="stock" className="block text-sm font-medium mb-1">
                    Stock Quantity *
                  </label>
                  <Input
                    id="stock"
                    name="stock"
                    type="number"
                    min="0"
                    value={formData.stock}
                    onChange={handleChange}
                    placeholder="0"
                    required
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="discount" className="block text-sm font-medium mb-1">
                    Discount (%)
                  </label>
                  <Input
                    id="discount"
                    name="discount"
                    type="number"
                    min="0"
                    max="100"
                    value={formData.discount}
                    onChange={handleChange}
                    placeholder="0"
                  />
                </div>
                
                <div>
                  <label htmlFor="tags" className="block text-sm font-medium mb-1">
                    Tags (comma separated)
                  </label>
                  <Input
                    id="tags"
                    name="tags"
                    value={formData.tags}
                    onChange={handleChange}
                    placeholder="new, featured, sale"
                  />
                </div>
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-2">
                Product Image *
              </label>
              <ImageUpload
                imageUrl={imageUrl}
                onImageUrlChange={handleImageUrlChange}
                onImageFileChange={handleImageFileChange}
              />
            </div>
          </div>
        </CardContent>
        
        <Separator />
        
        <CardFooter className="flex justify-between pt-6">
          <Button
            type="button"
            variant="outline"
            onClick={() => navigate('/admin/products')}
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