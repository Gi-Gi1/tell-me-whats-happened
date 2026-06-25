import { useCallback, useRef, useState } from "react";
import { ImagePlus, X } from "lucide-react";
import { useI18n } from "@/lib/i18n";

const MAX_FILES = 6;
const MAX_SIZE = 5 * 1024 * 1024;
const ACCEPT = ["image/jpeg", "image/png", "image/webp"];

export type LocalImage = {
  id: string;
  file: File;
  previewUrl: string;
};

export function ImageDropzone({
  value,
  onChange,
}: {
  value: LocalImage[];
  onChange: (next: LocalImage[]) => void;
}) {
  const [dragOver, setDragOver] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const { t } = useI18n();

  const addFiles = useCallback(
    (files: FileList | File[]) => {
      setError(null);
      const incoming = Array.from(files);
      const accepted: LocalImage[] = [];
      for (const file of incoming) {
        if (!ACCEPT.includes(file.type)) {
          setError(t("invalidImageType"));
          continue;
        }
        if (file.size > MAX_SIZE) {
          setError(t("imageTooLarge"));
          continue;
        }
        accepted.push({
          id: crypto.randomUUID(),
          file,
          previewUrl: URL.createObjectURL(file),
        });
      }
      const next = [...value, ...accepted].slice(0, MAX_FILES);
      onChange(next);
    },
    [onChange, t, value],
  );

  const removeAt = (id: string) => {
    const target = value.find((v) => v.id === id);
    if (target) URL.revokeObjectURL(target.previewUrl);
    onChange(value.filter((v) => v.id !== id));
  };

  return (
    <div className="space-y-3">
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        onDragOver={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragOver(false);
          if (e.dataTransfer.files) addFiles(e.dataTransfer.files);
        }}
        className={[
          "flex w-full flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed px-4 py-8 text-center transition-colors",
          dragOver
            ? "border-agri-primary bg-agri-primary-soft/50"
            : "border-agri-border bg-white hover:border-agri-primary/50 hover:bg-agri-primary-soft/20",
        ].join(" ")}
      >
        <div className="grid h-12 w-12 place-items-center rounded-2xl bg-agri-primary-soft text-agri-primary">
          <ImagePlus className="h-6 w-6" />
        </div>
        <p className="text-sm font-semibold text-agri-ink">
          {t("imageDrop")}
        </p>
        <p className="text-xs leading-relaxed text-agri-ink/60">
          {t("imageHelp")}
        </p>
        <input
          ref={inputRef}
          type="file"
          accept={ACCEPT.join(",")}
          multiple
          className="hidden"
          onChange={(e) => e.target.files && addFiles(e.target.files)}
        />
      </button>

      {error && <p className="text-xs font-medium text-destructive">{error}</p>}

      {value.length > 0 && (
        <div className="grid grid-cols-3 gap-3 sm:grid-cols-4 md:grid-cols-6">
          {value.map((img) => (
            <div
              key={img.id}
              className="group relative aspect-square overflow-hidden rounded-xl border border-agri-border bg-agri-surface"
            >
              <img
                src={img.previewUrl}
                alt=""
                className="h-full w-full object-cover"
              />
              <button
                type="button"
                aria-label={t("removeImage")}
                onClick={() => removeAt(img.id)}
                className="absolute right-1.5 top-1.5 grid h-7 w-7 place-items-center rounded-full bg-white/95 text-agri-ink shadow-sm transition-colors hover:bg-destructive hover:text-white"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
