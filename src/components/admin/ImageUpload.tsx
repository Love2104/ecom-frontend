import { useState, useRef } from 'react';
import { X, Upload } from 'lucide-react';
import { Input } from '../ui/Input';

interface ImageUploadProps {
  imageUrl: string;
  onImageUrlChange: (url: string) => void;
  onImageFileChange: (file: File | null) => void;
}

const ImageUpload = ({ imageUrl, onImageUrlChange, onImageFileChange }: ImageUploadProps) => {
  const [activeTab, setActiveTab] = useState<'url' | 'upload'>('url');
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onImageUrlChange(e.target.value);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    handleFile(file);
  };

  const handleFile = (file: File | null) => {
    if (file) {
      // Validate file type
      const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/svg+xml'];
      if (!validTypes.includes(file.type)) {
        alert('Please upload a valid image file (JPG, PNG, WebP, or SVG)');
        return;
      }
      
      // Validate file size (max 2MB)
      if (file.size > 2 * 1024 * 1024) {
        alert('File size should be less than 2MB');
        return;
      }
      
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

  const handleDrag = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
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
          <div 
            className={`flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer ${
              dragActive ? 'border-primary bg-primary/5' : 'border-border bg-muted/30'
            } hover:bg-muted/50 transition-colors`}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
          >
            <Upload className="w-6 h-6 text-muted-foreground mb-2" />
            <p className="mb-1 text-sm text-muted-foreground">
              <span className="font-semibold">Click to upload</span> or drag and drop
            </p>
            <p className="text-xs text-muted-foreground">
              SVG, PNG, JPG or WebP (MAX. 2MB)
            </p>
            <input
              id="dropzone-file"
              type="file"
              className="hidden"
              accept="image/*"
              onChange={handleFileChange}
              ref={fileInputRef}
            />
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