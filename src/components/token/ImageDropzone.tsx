import { useCallback, useEffect, useRef, useState, type DragEvent } from 'react';
import { ImagePlus, X } from 'lucide-react';
import toast from 'react-hot-toast';
import { cn } from '@/lib/utils';

const ACCEPTED = new Set(['image/png', 'image/jpeg', 'image/webp', 'image/gif']);
const MAX_BYTES = 2 * 1024 * 1024;

interface ImageDropzoneProps {
  file: File | null;
  onChange: (file: File | null) => void;
  errorText?: string;
  className?: string;
}

/**
 * Drag-drop or click-to-pick image input with a live preview. Validates the
 * MIME type and ≤2 MB size on the client so the user gets immediate feedback —
 * the backend re-validates either way.
 */
export function ImageDropzone({
  file,
  onChange,
  errorText,
  className,
}: ImageDropzoneProps): JSX.Element {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [dragging, setDragging] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  // Manage the object URL lifecycle — revoke when the file changes/unmounts.
  useEffect(() => {
    if (!file) {
      setPreviewUrl(null);
      return;
    }
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [file]);

  const accept = useCallback(
    (f: File | null) => {
      if (!f) return;
      if (!ACCEPTED.has(f.type)) {
        toast.error('Use a PNG, JPEG, WebP, or GIF image');
        return;
      }
      if (f.size > MAX_BYTES) {
        toast.error('Image must be 2 MB or smaller');
        return;
      }
      onChange(f);
    },
    [onChange],
  );

  const onDrop = (e: DragEvent<HTMLDivElement>): void => {
    e.preventDefault();
    setDragging(false);
    const f = e.dataTransfer.files?.[0] ?? null;
    accept(f);
  };

  return (
    <div className="flex flex-col gap-1.5">
      <span className="text-xs font-medium text-text-muted">Image</span>
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={onDrop}
        onClick={() => inputRef.current?.click()}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') inputRef.current?.click();
        }}
        role="button"
        tabIndex={0}
        className={cn(
          'relative flex min-h-[160px] cursor-pointer items-center justify-center rounded-lg border border-dashed transition-colors',
          'focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/60 focus-visible:ring-offset-2 focus-visible:ring-offset-background',
          dragging ? 'border-primary/60 bg-primary/5' : 'border-border bg-surface hover:border-text-muted/40',
          errorText ? 'border-danger/60' : '',
          className,
        )}
      >
        <input
          ref={inputRef}
          type="file"
          accept="image/png,image/jpeg,image/webp,image/gif"
          className="sr-only"
          onChange={(e) => accept(e.target.files?.[0] ?? null)}
        />
        {previewUrl ? (
          <>
            <img
              src={previewUrl}
              alt="Token preview"
              className="h-40 w-40 rounded-lg object-cover border border-border"
            />
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onChange(null);
              }}
              aria-label="Remove image"
              className="absolute top-2 right-2 p-1 rounded-md bg-surface-elevated border border-border text-text-muted hover:text-text-primary"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </>
        ) : (
          <div className="flex flex-col items-center gap-1.5 text-text-muted">
            <ImagePlus className="h-5 w-5" />
            <p className="text-xs">Drop or click to upload</p>
            <p className="text-[10px] text-text-muted/70">PNG, JPEG, WebP, GIF · max 2 MB</p>
          </div>
        )}
      </div>
      {errorText ? <p className="text-xs text-danger">{errorText}</p> : null}
    </div>
  );
}
