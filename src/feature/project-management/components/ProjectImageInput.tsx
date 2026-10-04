import { useEffect, useRef, useState } from "react";
import { XIcon } from "lucide-react";
import { Dropzone, DropzoneEmptyState } from "@/components/kibo-ui/dropzone";
import {
  ImageCrop,
  ImageCropApply,
  ImageCropContent,
  ImageCropReset,
} from "@/components/kibo-ui/image-crop";
import { Button } from "@/components/ui/button.tsx";
import { cn } from "@/lib/utils.ts";
import { getApiErrorMessage } from "@/lib/apiError.ts";
import type { ProjectAssetType } from "@/api/projects/schema.ts";

/**
 * 1 MiB in bytes. Unter dem kleinsten Deckel der Kette (nginx in Produktion
 * begrenzt Request-Bodies derzeit auf 1 MiB, obwohl die Anwendung 5 MiB
 * erlaubt). Ziel ist, unabhaengig von dieser offenen Infrastrukturfrage zu
 * funktionieren.
 */
const MAX_OUTPUT_BYTES = 1024 * 1024;

/** Exakte Allowlist der API — alles andere wird vor dem Zuschnitt abgewiesen. */
const ACCEPTED_MIME_TYPES = ["image/jpeg", "image/png", "image/webp"] as const;

/** Dateiendungen fuer react-dropzone's `accept`-Option, passend zur Allowlist oben. */
const DROPZONE_ACCEPT: Record<string, string[]> = {
  "image/jpeg": [".jpg", ".jpeg"],
  "image/png": [".png"],
  "image/webp": [".webp"],
};

const ASPECT_RATIOS: Record<ProjectAssetType, number | undefined> = {
  logo: 1,
  cover: 16 / 9,
  screenshot: undefined,
};

/** Startqualitaet fuer die WebP-Umkodierung, wird bei Bedarf schrittweise gesenkt. */
const INITIAL_WEBP_QUALITY = 0.9;
const MIN_WEBP_QUALITY = 0.5;
const QUALITY_STEP = 0.1;

/**
 * Maximale Anzahl an Halbierungen der Canvas-Dimensionen, falls selbst die
 * niedrigste WebP-Qualitaet bei nativer Groesse noch ueber `MAX_OUTPUT_BYTES`
 * liegt. Nach drei Halbierungen (1/8 der Kantenlaenge) wird abgebrochen und
 * ein Fehler geworfen statt ein zu grosses Blob zurueckzugeben.
 */
const MAX_DIMENSION_HALVINGS = 3;

async function dataUrlToBlob(dataUrl: string): Promise<Blob> {
  const response = await fetch(dataUrl);
  return response.blob();
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error("Failed to load cropped image for compression"));
    image.src = src;
  });
}

function canvasToBlob(canvas: HTMLCanvasElement, type: string, quality: number): Promise<Blob | null> {
  return new Promise((resolve) => {
    canvas.toBlob(resolve, type, quality);
  });
}

/** Durchlaeuft die Qualitaetsstufen einmal fuer die gegebene Canvas-Groesse. */
async function smallestBlobAtCurrentSize(
  canvas: HTMLCanvasElement,
  floor: Blob,
): Promise<Blob> {
  let smallestBlob = floor;

  for (let quality = INITIAL_WEBP_QUALITY; quality >= MIN_WEBP_QUALITY; quality -= QUALITY_STEP) {
    const webpBlob = await canvasToBlob(canvas, "image/webp", quality);

    if (!webpBlob) {
      continue;
    }

    if (webpBlob.size < smallestBlob.size) {
      smallestBlob = webpBlob;
    }

    if (webpBlob.size <= MAX_OUTPUT_BYTES) {
      return webpBlob;
    }
  }

  return smallestBlob;
}

/**
 * Verkleinert ein PNG-Data-URL-Ergebnis des Zuschnitts auf unter
 * `MAX_OUTPUT_BYTES`. PNG ist fuer fotografische Screenshots verlustfrei und
 * damit gross; liegt es ueber dem Ziel, wird ueber ein Canvas nach WebP
 * umkodiert und die Qualitaet in festen Schritten gesenkt. Bleibt das Ergebnis
 * selbst bei der niedrigsten Qualitaet ueber dem Ziel (z. B. weil der Browser
 * WebP nicht kodieren kann und `toBlob` lautlos auf PNG zurueckfaellt, oder
 * weil der Crop bei `MAX_CROP_EDGE_PX` zu detailreich ist), werden die
 * Canvas-Dimensionen bis zu `MAX_DIMENSION_HALVINGS` mal halbiert und die
 * Qualitaetsschleife erneut durchlaufen. Beides zusammen begrenzt die
 * Gesamtzahl an Versuchen fest — es gibt weder Rekursion noch einen Pfad ohne
 * Obergrenze. Wird das Ziel danach immer noch nicht erreicht, wird ein Fehler
 * geworfen statt ein zu grosses Blob stillschweigend zurueckzugeben.
 */
async function compressToTarget(dataUrl: string): Promise<Blob> {
  const pngBlob = await dataUrlToBlob(dataUrl);

  if (pngBlob.size <= MAX_OUTPUT_BYTES) {
    return pngBlob;
  }

  const image = await loadImage(dataUrl);
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");
  if (!ctx) {
    throw new Error("Could not get canvas context for image compression");
  }

  let smallestBlob = pngBlob;
  let width = image.naturalWidth;
  let height = image.naturalHeight;

  for (let attempt = 0; attempt <= MAX_DIMENSION_HALVINGS; attempt += 1) {
    canvas.width = width;
    canvas.height = height;
    ctx.clearRect(0, 0, width, height);
    ctx.drawImage(image, 0, 0, width, height);

    const blobAtSize = await smallestBlobAtCurrentSize(canvas, smallestBlob);

    if (blobAtSize.size < smallestBlob.size) {
      smallestBlob = blobAtSize;
    }

    if (smallestBlob.size <= MAX_OUTPUT_BYTES) {
      return smallestBlob;
    }

    width = Math.round(width / 2);
    height = Math.round(height / 2);
  }

  throw new Error(
    `Image is too large to compress under ${MAX_OUTPUT_BYTES} bytes (smallest result: ${smallestBlob.size} bytes)`,
  );
}

function extensionForMimeType(mimeType: string): string {
  if (mimeType === "image/webp") return "webp";
  if (mimeType === "image/jpeg") return "jpg";
  return "png";
}

interface Props {
  type: ProjectAssetType;
  currentUrl: string | null;
  onSelect: (blob: Blob, fileName: string) => void;
  onClear: () => void;
  disabled: boolean;
}

export function ProjectImageInput({ type, currentUrl, onSelect, onClear, disabled }: Props) {
  const [pendingFile, setPendingFile] = useState<File | null>(null);
  const [resultPreviewUrl, setResultPreviewUrl] = useState<string | null>(null);
  const [rejectionMessage, setRejectionMessage] = useState<string | null>(null);
  const previousObjectUrl = useRef<string | null>(null);

  const previewUrl = resultPreviewUrl ?? currentUrl;

  useEffect(() => {
    return () => {
      if (previousObjectUrl.current) {
        URL.revokeObjectURL(previousObjectUrl.current);
      }
    };
  }, []);

  function handleDrop(acceptedFiles: File[]) {
    const file = acceptedFiles.at(0);
    if (!file) {
      return;
    }

    if (!ACCEPTED_MIME_TYPES.includes(file.type as (typeof ACCEPTED_MIME_TYPES)[number])) {
      setRejectionMessage(`Unsupported file type: ${file.type || "unknown"}`);
      return;
    }

    setRejectionMessage(null);
    setPendingFile(file);
  }

  function handleDropError(error: Error) {
    setRejectionMessage(error.message);
  }

  async function handleCrop(dataUrl: string) {
    try {
      const blob = await compressToTarget(dataUrl);
      const fileName = `${type}.${extensionForMimeType(blob.type)}`;

      if (previousObjectUrl.current) {
        URL.revokeObjectURL(previousObjectUrl.current);
      }

      const objectUrl = URL.createObjectURL(blob);
      previousObjectUrl.current = objectUrl;

      setResultPreviewUrl(objectUrl);
      setPendingFile(null);
      onSelect(blob, fileName);
    } catch (error) {
      setRejectionMessage(getApiErrorMessage(error));
      setPendingFile(null);
    }
  }

  function handleCancelCrop() {
    setPendingFile(null);
  }

  function handleClear() {
    if (previousObjectUrl.current) {
      URL.revokeObjectURL(previousObjectUrl.current);
      previousObjectUrl.current = null;
    }

    setResultPreviewUrl(null);
    setPendingFile(null);
    setRejectionMessage(null);
    onClear();
  }

  if (pendingFile) {
    return (
      <div className="space-y-2">
        <ImageCrop
          file={pendingFile}
          aspect={ASPECT_RATIOS[type]}
          onCrop={handleCrop}
        >
          <ImageCropContent />
          <div className="flex items-center gap-2">
            <ImageCropApply type="button" size="sm" disabled={disabled}>Apply</ImageCropApply>
            <ImageCropReset type="button" size="sm" disabled={disabled}>Reset</ImageCropReset>
            <Button type="button" variant="ghost" size="sm" disabled={disabled} onClick={handleCancelCrop}>
              Cancel
            </Button>
          </div>
        </ImageCrop>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <Dropzone
        accept={DROPZONE_ACCEPT}
        maxFiles={1}
        disabled={disabled}
        onDrop={handleDrop}
        onError={handleDropError}
      >
        {previewUrl ? (
          <div className="flex w-full flex-col items-center gap-2">
            <img
              src={previewUrl}
              alt={`${type} preview`}
              className={cn("max-h-40 w-auto rounded-md object-contain", type === "logo" && "aspect-square")}
            />
            <p className="text-wrap text-muted-foreground text-xs">Drag and drop or click to replace</p>
          </div>
        ) : (
          <DropzoneEmptyState />
        )}
      </Dropzone>

      {rejectionMessage && <p className="text-destructive text-xs">{rejectionMessage}</p>}

      {previewUrl && (
        <Button type="button" variant="ghost" size="sm" disabled={disabled} onClick={handleClear}>
          <XIcon className="size-4" />
          Remove {type}
        </Button>
      )}
    </div>
  );
}
