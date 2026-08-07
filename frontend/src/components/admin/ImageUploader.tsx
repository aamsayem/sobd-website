import { useCallback, useRef, useState } from "react";
import { uploadMedia } from "@/lib/media.functions";
import {
  Upload,
  Loader2,
  Trash2,
  ImageIcon,
  AlertTriangle,
  Crop,
  Check,
  FolderOpen,
} from "lucide-react";
import { toast } from "sonner";
import { getErrorMessage } from "@/lib/utils";
import { MediaPicker } from "./MediaPicker";

export type Aspect = "square" | "wide" | "free";

const ASPECT_RATIO: Record<Aspect, number | null> = { square: 1, wide: 16 / 9, free: null };

export function isExternalUrl(url?: string | null) {
  return !!url && /^https?:\/\//i.test(url);
}

async function fileToDataUrl(file: File | Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const fr = new FileReader();
    fr.onload = () => resolve(fr.result as string);
    fr.onerror = () => reject(new Error("Could not read file"));
    fr.readAsDataURL(file);
  });
}

/** Crops to the requested aspect (center crop) and downscales to maxWidth. */
async function processImage(
  file: File,
  aspect: Aspect,
  maxWidth: number,
): Promise<{ blob: Blob; type: string }> {
  if (file.type === "image/svg+xml" || file.type === "application/pdf")
    return { blob: file, type: file.type };

  const objectUrl = URL.createObjectURL(file);
  try {
    const img = new Image();
    await new Promise<void>((resolve, reject) => {
      img.onload = () => resolve();
      img.onerror = () => reject(new Error("Invalid image file"));
      img.src = objectUrl;
    });

    const ratio = ASPECT_RATIO[aspect];
    let sx = 0,
      sy = 0,
      sw = img.naturalWidth,
      sh = img.naturalHeight;
    if (ratio) {
      if (sw / sh > ratio) {
        const newW = sh * ratio;
        sx = (sw - newW) / 2;
        sw = newW;
      } else {
        const newH = sw / ratio;
        sy = (sh - newH) / 2;
        sh = newH;
      }
    }

    const scale = Math.min(1, maxWidth / sw);
    const cw = Math.max(1, Math.round(sw * scale));
    const ch = Math.max(1, Math.round(sh * scale));

    const canvas = document.createElement("canvas");
    canvas.width = cw;
    canvas.height = ch;
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("Canvas unsupported");
    ctx.imageSmoothingQuality = "high";
    ctx.drawImage(img, sx, sy, sw, sh, 0, 0, cw, ch);

    let hasAlpha = false;
    if (file.type === "image/png") {
      try {
        const imgData = ctx.getImageData(0, 0, cw, ch).data;
        for (let i = 3; i < imgData.length; i += 4) {
          if (imgData[i] < 255) {
            hasAlpha = true;
            break;
          }
        }
      } catch (e) {
        hasAlpha = true;
      }
    }

    const type = file.type === "image/png" && hasAlpha ? "image/png" : "image/jpeg";
    const blob = await new Promise<Blob | null>((r) =>
      canvas.toBlob(r, type, type === "image/jpeg" ? 0.85 : 0.9),
    );
    if (!blob) throw new Error("Could not process image");
    return { blob, type };
  } finally {
    URL.revokeObjectURL(objectUrl);
  }
}

async function blobToBase64(blob: Blob): Promise<string> {
  const dataUrl = await fileToDataUrl(blob);
  return dataUrl.slice(dataUrl.indexOf(",") + 1);
}

export function ImageUploader({
  value,
  onChange,
  folder,
  aspect = "square",
  label = "Image",
  maxWidth = 1600,
  accept = "image/*",
  hint,
}: {
  value?: string | null;
  onChange: (url: string) => void;
  folder: string;
  aspect?: Aspect;
  label?: string;
  maxWidth?: number;
  accept?: string;
  hint?: string;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [drag, setDrag] = useState(false);
  const [picking, setPicking] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const [localPreview, setLocalPreview] = useState<string | null>(null);
  const upload = uploadMedia;

  const handleFiles = useCallback(
    async (files: FileList | null) => {
      const file = files?.[0];
      if (!file) return;

      const allowedTypes = new Set([
        "image/png",
        "image/jpeg",
        "image/jpg",
        "image/webp",
        "image/gif",
        "image/bmp",
        "application/pdf",
      ]);
      if (!allowedTypes.has(file.type.toLowerCase())) {
        toast.error("Unsupported file type. Only PNG, JPEG, JPG, WEBP, GIF, BMP and PDF are allowed.");
        return;
      }

      if (file.size > 12 * 1024 * 1024) {
        toast.error("File size exceeds the 12 MB limit.");
        return;
      }

      setBusy(true);
      setUploadProgress(0);
      const previewUrl = URL.createObjectURL(file);
      setLocalPreview(previewUrl);

      try {
        const { blob, type } = await processImage(file, aspect, maxWidth);
        const base64 = await blobToBase64(blob);
        const res = await upload(
          { data: { folder, filename: file.name, contentType: type, base64 } },
          (percent) => setUploadProgress(percent)
        );
        onChange(res.url);
        toast.success("Uploaded to project storage");
      } catch (error: unknown) {
        toast.error(getErrorMessage(error, "Upload failed"));
      } finally {
        setBusy(false);
        setUploadProgress(0);
        setLocalPreview(null);
        URL.revokeObjectURL(previewUrl);
        if (inputRef.current) inputRef.current.value = "";
      }
    },
    [aspect, folder, maxWidth, onChange, upload],
  );

  const isPdf = !!value && /\.pdf($|\?)/i.test(value);
  const external = isExternalUrl(value);

  return (
    <div>
      <div className="flex items-center justify-between mb-1.5">
        <label className="text-xs font-semibold text-emerald-900 uppercase tracking-wider">
          {label}
        </label>
        <button
          type="button"
          onClick={() => setPicking(true)}
          className="text-[11px] font-semibold text-emerald-700 hover:text-emerald-900 inline-flex items-center gap-1"
        >
          <FolderOpen className="h-3 w-3" /> Media library
        </button>
      </div>

      <div
        onDragOver={(e) => {
          e.preventDefault();
          setDrag(true);
        }}
        onDragLeave={() => setDrag(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDrag(false);
          handleFiles(e.dataTransfer.files);
        }}
        className={`rounded-xl border-2 border-dashed p-3 transition-colors ${
          drag ? "border-emerald-500 bg-emerald-50" : "border-emerald-200 bg-white"
        }`}
      >
        {value || localPreview ? (
          <div className="flex items-start gap-3">
            <div
              className={`relative shrink-0 overflow-hidden rounded-lg bg-emerald-50 border border-emerald-100 ${
                aspect === "wide" ? "w-32 aspect-video" : "w-20 aspect-square"
              }`}
            >
              {isPdf && !localPreview ? (
                <div className="h-full w-full flex items-center justify-center text-emerald-600 text-[10px] font-bold">
                  PDF
                </div>
              ) : (
                <img
                  src={localPreview || value || ""}
                  alt=""
                  referrerPolicy="no-referrer"
                  className="h-full w-full object-cover"
                />
              )}
              {busy && (
                <div className="absolute inset-0 bg-black/60 backdrop-blur-[1px] flex flex-col items-center justify-center p-2 text-white">
                  <Loader2 className="h-4 w-4 animate-spin mb-1 text-emerald-400" />
                  <span className="text-[9px] font-bold">{uploadProgress}%</span>
                  <div className="w-full bg-white/30 h-1 rounded-full overflow-hidden mt-1 max-w-[80%]">
                    <div 
                      className="bg-emerald-400 h-full transition-all duration-300"
                      style={{ width: `${uploadProgress}%` }}
                    />
                  </div>
                </div>
              )}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-[11px] text-emerald-800 break-all leading-snug">{localPreview ? "Uploading local file..." : value}</p>
              {external && !localPreview && (
                <p className="mt-1.5 inline-flex items-center gap-1 rounded-md bg-amber-100 text-amber-800 px-2 py-0.5 text-[10px] font-semibold">
                  <AlertTriangle className="h-3 w-3" /> External link — re-upload recommended
                </p>
              )}
              {!external && !localPreview && (
                <p className="mt-1.5 inline-flex items-center gap-1 rounded-md bg-emerald-100 text-emerald-800 px-2 py-0.5 text-[10px] font-semibold">
                  <Check className="h-3 w-3" /> Stored in project storage
                </p>
              )}
              {localPreview && (
                <p className="mt-1.5 inline-flex items-center gap-1 rounded-md bg-sky-100 text-sky-800 px-2 py-0.5 text-[10px] font-semibold">
                  <Loader2 className="h-3 w-3 animate-spin" /> Uploading to storage...
                </p>
              )}
              <div className="flex gap-2 mt-2">
                <button
                  type="button"
                  disabled={busy}
                  onClick={() => inputRef.current?.click()}
                  className="text-[11px] font-semibold px-2.5 py-1 rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 disabled:opacity-60 inline-flex items-center gap-1"
                >
                  {busy ? (
                    <Loader2 className="h-3 w-3 animate-spin" />
                  ) : (
                    <Upload className="h-3 w-3" />
                  )}
                  {external ? "Re-upload" : "Replace"}
                </button>
                <button
                  type="button"
                  disabled={busy}
                  onClick={() => onChange("")}
                  className="text-[11px] font-semibold px-2.5 py-1 rounded-lg text-red-600 hover:bg-red-50 inline-flex items-center gap-1 disabled:opacity-60"
                >
                  <Trash2 className="h-3 w-3" /> Remove
                </button>
              </div>
            </div>
          </div>
        ) : (
          <button
            type="button"
            disabled={busy}
            onClick={() => inputRef.current?.click()}
            className="w-full py-5 flex flex-col items-center gap-1.5 text-emerald-700 hover:text-emerald-900 disabled:opacity-60"
          >
            {busy ? (
              <Loader2 className="h-6 w-6 animate-spin" />
            ) : (
              <ImageIcon className="h-6 w-6" />
            )}
            <span className="text-xs font-semibold">
              {busy ? "Uploading…" : "Drop a file here or click to upload"}
            </span>
            <span className="text-[10px] opacity-70 inline-flex items-center gap-1">
              <Crop className="h-3 w-3" />
              {hint ??
                (aspect === "square"
                  ? "Auto-cropped to a square"
                  : aspect === "wide"
                    ? "Auto-cropped to 16:9"
                    : "Original ratio kept")}
            </span>
          </button>
        )}
      </div>

      <div className="mt-2">
        <input
          type="url"
          placeholder="Or paste direct media link (e.g. https://...)"
          value={value ?? ""}
          onChange={(e) => onChange(e.target.value)}
          className="w-full px-3.5 py-2.5 rounded-xl border border-emerald-100 bg-white/80 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:border-emerald-400 placeholder:text-emerald-900/40 text-emerald-950 transition-all"
        />
      </div>

      <input
        ref={inputRef}
        type="file"
        accept={accept}
        hidden
        onChange={(e) => handleFiles(e.target.files)}
      />

      {picking && (
        <MediaPicker
          onClose={() => setPicking(false)}
          onSelect={(url) => {
            onChange(url);
            setPicking(false);
          }}
        />
      )}
    </div>
  );
}
