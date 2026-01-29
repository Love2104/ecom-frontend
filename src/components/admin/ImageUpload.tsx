import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { Input } from '../ui/Input';

interface ImageUploadProps {
  imageUrl: string;
  onImageUrlChange: (url: string) => void;
}

const ImageUpload = ({ imageUrl, onImageUrlChange }: ImageUploadProps) => {
  const [urlError, setUrlError] = useState<string | null>(null);
  const [isImageValid, setIsImageValid] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!imageUrl) {
      setIsImageValid(false);
      setUrlError(null);
      return;
    }

    try {
      new URL(imageUrl); // Throws if not valid URL format
    } catch {
      setIsImageValid(false);
      setUrlError('Invalid URL format. Please enter a complete URL including http:// or https://');
      return;
    }

    setIsLoading(true);
    const img = new Image();
    img.onload = () => {
      setIsImageValid(true);
      setUrlError(null);
      setIsLoading(false);
    };
    img.onerror = () => {
      setIsImageValid(false);
      setUrlError('Image failed to load. Please check the URL and ensure it points directly to an image file.');
      setIsLoading(false);
    };
    img.src = imageUrl;
  }, [imageUrl]);

  const handleUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onImageUrlChange(e.target.value);
    setUrlError(null);
    setIsImageValid(false);
  };

  const handleRemoveImage = () => {
    onImageUrlChange('');
    setUrlError(null);
    setIsImageValid(false);
  };

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium mb-2">
          Product Image URL *
        </label>
        <Input
          type="url"
          placeholder="https://example.com/image.jpg"
          value={imageUrl}
          onChange={handleUrlChange}
          required
        />
        {urlError && <p className="text-xs text-destructive mt-1">{urlError}</p>}
        <p className="text-xs text-muted-foreground mt-1">
          Paste a valid, publicly accessible image URL (e.g., from Unsplash, Cloudinary, etc.)
        </p>
      </div>

      {isLoading && (
        <div className="flex items-center justify-center h-40 bg-muted/30 rounded-md">
          <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
        </div>
      )}

      {imageUrl && isImageValid && (
        <div className="relative mt-4">
          <div className="relative aspect-square w-full max-w-[300px] rounded-md overflow-hidden border border-border">
            <img
              src={imageUrl}
              alt="Product preview"
              className="w-full h-full object-cover"
            />
            <button
              type="button"
              onClick={handleRemoveImage}
              className="absolute top-2 right-2 p-1 bg-background/80 rounded-full text-destructive hover:bg-background"
              aria-label="Remove image"
            >
              <X size={18} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ImageUpload;