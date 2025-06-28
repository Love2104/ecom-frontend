import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { Input } from '../ui/Input';

interface ImageUploadProps {
  imageUrl: string;
  onImageUrlChange: (url: string) => void;
}

const ImageUpload = ({ imageUrl, onImageUrlChange }: ImageUploadProps) => {
  const [urlError, setUrlError] = useState<string | null>(null);
  const [isImageValid, setIsImageValid] = useState(true);

  useEffect(() => {
    if (!imageUrl) {
      setIsImageValid(false);
      return;
    }

    const validateImage = async () => {
      try {
        new URL(imageUrl); // Checks if it's a valid URL format
        const img = new Image();
        img.onload = () => setIsImageValid(true);
        img.onerror = () => {
          setIsImageValid(false);
          setUrlError('Image failed to load. Please check the URL.');
        };
        img.src = imageUrl;
      } catch {
        setIsImageValid(false);
        setUrlError('Invalid URL format.');
      }
    };

    validateImage();
  }, [imageUrl]);

  const handleUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const url = e.target.value;
    onImageUrlChange(url);
    setUrlError(null);
    setIsImageValid(false); // Assume invalid until proven valid
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
          placeholder="https://example.com/product-image.jpg"
          value={imageUrl}
          onChange={handleUrlChange}
          required
        />
        {urlError && <p className="text-xs text-destructive mt-1">{urlError}</p>}
        <p className="text-xs text-muted-foreground mt-1">
          Enter a valid, direct link to an image (jpg, png, etc.)
        </p>
      </div>

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
