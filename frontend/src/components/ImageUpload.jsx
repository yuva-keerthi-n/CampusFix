import { useEffect, useRef, useState } from 'react';
import { ImagePlus, X } from 'lucide-react';

const ALLOWED = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
const MAX_BYTES = 5 * 1024 * 1024;

export default function ImageUpload({ file, onChange, hint = 'JPG, PNG or WEBP — up to 5 MB' }) {
  const [preview, setPreview] = useState(null);
  const [error, setError] = useState('');
  const inputRef = useRef(null);

  // Build (and clean up) a temporary preview URL for the selected file.
  useEffect(() => {
    if (!file) {
      setPreview(null);
      return undefined;
    }
    const url = URL.createObjectURL(file);
    setPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [file]);

  const pick = (picked) => {
    if (!picked) return;
    if (!ALLOWED.includes(picked.type)) {
      setError('Only JPG, JPEG, PNG or WEBP images are allowed.');
      return;
    }
    if (picked.size > MAX_BYTES) {
      setError('Image must be 5 MB or smaller.');
      return;
    }
    setError('');
    onChange(picked);
  };

  const clear = () => {
    setError('');
    onChange(null);
    if (inputRef.current) inputRef.current.value = '';
  };

  return (
    <div>
      {preview ? (
        <div className="relative overflow-hidden rounded-xl border border-slate-200 bg-slate-50">
          <img src={preview} alt="Selected preview" className="max-h-64 w-full object-contain" />
          <button
            type="button"
            onClick={clear}
            className="absolute right-2 top-2 grid h-8 w-8 place-items-center rounded-full bg-ink-900/80 text-white hover:bg-ink-900"
            aria-label="Remove image"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      ) : (
        <label
          onDragOver={(e) => e.preventDefault()}
          onDrop={(e) => {
            e.preventDefault();
            pick(e.dataTransfer.files?.[0]);
          }}
          className="flex cursor-pointer flex-col items-center gap-2 rounded-xl border-2 border-dashed border-slate-300 bg-white px-4 py-8 text-center transition hover:border-brand-500 hover:bg-brand-50/40"
        >
          <ImagePlus className="h-7 w-7 text-slate-400" />
          <span className="text-sm font-medium text-slate-700">Click to upload or drag a photo here</span>
          <span className="text-xs text-slate-500">{hint}</span>
          <input
            ref={inputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            className="sr-only"
            onChange={(e) => pick(e.target.files?.[0])}
          />
        </label>
      )}
      {error && <p className="mt-1.5 text-xs font-medium text-red-600">{error}</p>}
    </div>
  );
}
