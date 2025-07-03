import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Edit, Trash2, Plus, Search, AlertCircle, Loader2 } from 'lucide-react';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { Product } from '@/types';
import { formatPrice } from '@/lib/utils';

interface ProductListProps {
  products: Product[];
  isLoading: boolean;
  error: string | null;
  onDelete: (id: string) => Promise<void>;
  onRefresh: () => void;
}

const ProductList = ({ products, isLoading, error, onDelete, onRefresh }: ProductListProps) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  
  const filteredProducts = products.filter(product => 
    product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleDeleteClick = (id: string) => {
    setDeleteConfirmId(id);
  };

  const confirmDelete = async (id: string) => {
    setIsDeleting(true);
    try {
      await onDelete(id);
    } catch (error) {
      console.error("Error deleting product:", error);
    } finally {
      setIsDeleting(false);
      setDeleteConfirmId(null);
    }
  };

  const cancelDelete = () => {
    setDeleteConfirmId(null);
  };

  if (error) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col items-center justify-center text-center p-4">
            <AlertCircle size={48} className="text-destructive mb-4" />
            <h3 className="text-lg font-medium mb-2">Error Loading Products</h3>
            <p className="text-muted-foreground mb-4">{error}</p>
            <Button onClick={onRefresh}>Try Again</Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <CardTitle>Products</CardTitle>
        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" size={18} />
            <Input
              placeholder="Search products..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 w-full sm:w-auto min-w-[200px]"
            />
          </div>
          <Button asChild>
            <Link to="/admin/products/add">
              <Plus size={16} className="mr-2" />
              Add Product
            </Link>
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="animate-pulse">
                <div className="h-16 bg-muted rounded"></div>
              </div>
            ))}
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-muted-foreground">
              {searchTerm ? 'No products match your search' : 'No products found'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-4 font-medium">Product</th>
                  <th className="text-left py-3 px-4 font-medium">Category</th>
                  <th className="text-right py-3 px-4 font-medium">Price</th>
                  <th className="text-right py-3 px-4 font-medium">Stock</th>
                  <th className="text-right py-3 px-4 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredProducts.map((product) => (
                  <tr key={product.id} className="border-b hover:bg-muted/30">
                    <td className="py-3 px-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-muted rounded overflow-hidden flex-shrink-0">
                          <img
                            src={product.image}
                            alt={product.name}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              (e.target as HTMLImageElement).src = 'https://placehold.co/100x100?text=No+Image';
                            }}
                          />
                        </div>
                        <div className="truncate max-w-[200px]" title={product.name}>
                          {product.name}
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4 capitalize">{product.category}</td>
                    <td className="py-3 px-4 text-right">
                      <div>
                        <span className="font-medium">{formatPrice(product.price)}</span>
                        {product.discount > 0 && (
                          <Badge variant="destructive" className="ml-2">
                            {product.discount}% OFF
                          </Badge>
                        )}
                      </div>
                      {product.originalPrice && (
                        <div className="text-sm text-muted-foreground line-through">
                          {formatPrice(product.originalPrice)}
                        </div>
                      )}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <span className={product.stock === 0 ? 'text-destructive' : product.stock < 10 ? 'text-amber-500' : ''}>
                        {product.stock}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      {deleteConfirmId === product.id ? (
                        <div className="flex items-center justify-end space-x-2">
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => confirmDelete(product.id)}
                            disabled={isDeleting}
                          >
                            {isDeleting ? (
                              <>
                                <Loader2 size={14} className="mr-1 animate-spin" />
                                Deleting...
                              </>
                            ) : 'Confirm'}
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={cancelDelete}
                            disabled={isDeleting}
                          >
                            Cancel
                          </Button>
                        </div>
                      ) : (
                        <div className="flex items-center justify-end space-x-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            asChild
                          >
                            <Link to={`/admin/products/edit/${product.id}`}>
                              <Edit size={16} />
                            </Link>
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteClick(product.id)}
                            className="text-destructive hover:text-destructive/90 hover:bg-destructive/10"
                          >
                            <Trash2 size={16} />
                          </Button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ProductList;