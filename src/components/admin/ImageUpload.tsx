import { useState, useRef } from 'react';
import { X } from 'lucide-react';
import { Input } from '../ui/Input';

interface ImageUploadProps {
  imageUrl: string;
  onImageUrlChange: (url: string) => void;
  onImageFileChange: (file: File | null) => void;
}

const ImageUpload = ({ imageUrl, onImageUrlChange, onImageFileChange }: ImageUploadProps) => {
  const [activeTab, setActiveTab] = useState<'url' | 'upload'>('url');
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onImageUrlChange(e.target.value);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    if (file) {
      onImageFileChange(file);
      const reader = new FileReader();
      reader.onload = () => {
        setPreviewUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    } else {
      onImageFileChange(null);
      setPreviewUrl(null);
    }
  };

  const handleRemoveImage = () => {
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    onImageFileChange(null);
    onImageUrlChange('');
    setPreviewUrl(null);
  };

  return (
    <div className="space-y-4">
      <div className="flex border-b border-border">
        <button
          type="button"
          className={`py-2 px-4 font-medium ${
            activeTab === 'url' ? 'border-b-2 border-primary text-primary' : 'text-muted-foreground'
          }`}
          onClick={() => setActiveTab('url')}
        >
          Image URL
        </button>
        <button
          type="button"
          className={`py-2 px-4 font-medium ${
            activeTab === 'upload' ? 'border-b-2 border-primary text-primary' : 'text-muted-foreground'
          }`}
          onClick={() => setActiveTab('upload')}
        >
          Upload Image
        </button>
      </div>

      {activeTab === 'url' ? (
        <div>
          <Input
            type="url"
            placeholder="https://example.com/image.jpg"
            value={imageUrl}
            onChange={handleUrlChange}
          />
          <p className="text-xs text-muted-foreground mt-1">
            Enter a valid image URL (JPG, PNG, WebP formats)
          </p>
        </div>
      ) : (
        <div>
          <div className="flex items-center justify-center w-full">
            <label
              htmlFor="dropzone-file"
              className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer bg-muted/30 border-border hover:bg-muted/50"
            >
              <div className="flex flex-col items-center justify-center pt-5 pb-6">
                <p className="mb-1 text-sm text-muted-foreground">
                  <span className="font-semibold">Click to upload</span> or drag and drop
                </p>
                <p className="text-xs text-muted-foreground">
                  SVG, PNG, JPG or WebP (MAX. 2MB)
                </p>
              </div>
              <input
                id="dropzone-file"
                type="file"
                className="hidden"
                accept="image/*"
                onChange={handleFileChange}
                ref={fileInputRef}
              />
            </label>
          </div>
        </div>
      )}

      {(imageUrl || previewUrl) && (
        <div className="relative mt-4">
          <div className="relative aspect-square w-full max-w-[300px] rounded-md overflow-hidden border border-border">
            <img
              src={previewUrl || imageUrl}
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
