import { Box, Slider, Stack, Typography } from "@mui/material";
import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import ReactCrop, {
  centerCrop,
  type Crop,
  makeAspectCrop,
  type PixelCrop,
} from "react-image-crop";
import "react-image-crop/dist/ReactCrop.css"; // Don't forget to import the CSS!
import { v4 as uuidv4 } from "uuid";
import CustomModal2 from "./CustomModal2";

const MIN_DIMENSION = 500;

export interface CroppedFile {
  name: string;
  size: number;
  type: string;
  url: string;
  file: Blob;
  fileName: string; // This seems to be a full URL path for the file after upload
}

/**
 * Props for the ImageCropper2 component.
 */
interface ImageCropper2Props {
  acceptedFiles: File & { url?: string }; // Modified to allow 'url' for initial display
  setAcceptedFiles: (file: CroppedFile | CroppedFile[]) => void;
  aspectRatio: number;
  multiple?: boolean;
  setValue: (name: string, value: CroppedFile | CroppedFile[]) => void;
  name: string;
  onChange?: (value: CroppedFile | CroppedFile[]) => void;
  folder: string; // S3 folder name
  onHide: () => void; // Function to hide the modal, likely passed from CustomModal
  // [key: string]: any; // Allows for other props passed to CustomModal
}

// ---
// Helper Functions
// ---

/**
 * Helper function to preview the canvas.
 * @param image The HTMLImageElement to draw from.
 * @param canvas The HTMLCanvasElement to draw to.
 * @param crop The crop area in pixels.
 * @param scale The scale factor for the image.
 * @param rotate The rotation angle in degrees.
 */
export async function canvasPreview(
  image: HTMLImageElement,
  canvas: HTMLCanvasElement,
  crop: PixelCrop,
  scale = 1,
  rotate = 0
) {
  const ctx = canvas.getContext("2d");

  if (!ctx) {
    throw new Error("No 2d context");
  }

  const TO_RADIANS = Math.PI / 180;

  const scaleX = image.naturalWidth / image.width;
  const scaleY = image.naturalHeight / image.height;
  const pixelRatio = window.devicePixelRatio;

  canvas.width = Math.floor(crop.width * scaleX * pixelRatio);
  canvas.height = Math.floor(crop.height * scaleY * pixelRatio);

  ctx.scale(pixelRatio, pixelRatio);
  ctx.imageSmoothingQuality = "high";

  const cropX = crop.x * scaleX;
  const cropY = crop.y * scaleY;

  const rotateRads = rotate * TO_RADIANS;
  const centerX = image.naturalWidth / 2;
  const centerY = image.naturalHeight / 2;

  ctx.save();

  // 5) Move the crop origin to the canvas origin (0,0)
  ctx.translate(-cropX, -cropY);
  // 4) Move the origin to the center of the original position
  ctx.translate(centerX, centerY);
  // 3) Rotate around the origin
  ctx.rotate(rotateRads);
  // 2) Scale the image
  ctx.scale(scale, scale);
  // 1) Move the center of the image to the origin (0,0)
  ctx.translate(-centerX, -centerY);
  ctx.drawImage(
    image,
    0,
    0,
    image.naturalWidth,
    image.naturalHeight,
    0,
    0,
    image.naturalWidth,
    image.naturalHeight
  );

  ctx.restore();
}

/**
 * Custom hook for debouncing effects.
 * @param fn The function to debounce.
 * @param waitTime The debounce time in milliseconds.
 * @param deps The dependency array for the effect.
 */
export function useDebounceEffect(
  fn: () => void,
  waitTime: number,
  deps?: React.DependencyList
) {
  useEffect(() => {
    const t = setTimeout(() => {
      fn();
    }, waitTime);

    return () => {
      clearTimeout(t);
    };
  }, deps);
}

// ---
// Main Component
// ---

export default function ImageCropper2({
  acceptedFiles,
  setAcceptedFiles,
  aspectRatio,
  multiple,
  setValue,
  name,
  onChange,
  folder,
  ...props
}: ImageCropper2Props) {
  const { t } = useTranslation();

  const imgRef = useRef<HTMLImageElement>(null);
  const previewCanvasRef = useRef<HTMLCanvasElement>(null);
  const [crop, setCrop] = useState<Crop>();
  const blobUrlRef = useRef<string>("");

  const [completedCrop, setCompletedCrop] = useState<PixelCrop | null>(null);
  const [scale, setScale] = useState<number>(1);
  const [rotate, setRotate] = useState<number>(0);

  const onImageLoad = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
    const { width, height } = e.currentTarget;
    const cropWidthInPercent = (MIN_DIMENSION / width) * 100;

    const initialCrop = makeAspectCrop(
      {
        unit: "%",
        width: cropWidthInPercent,
      },
      aspectRatio,
      width,
      height
    );
    const centeredCrop = centerCrop(initialCrop, width, height);
    setCrop(centeredCrop);
  };

  useEffect(() => {
    if (
      completedCrop?.width &&
      completedCrop?.height &&
      imgRef.current &&
      previewCanvasRef.current
    ) {
      canvasPreview(
        imgRef.current,
        previewCanvasRef.current,
        completedCrop,
        scale,
        rotate
      );
    }
  }, [completedCrop, scale, rotate]);

  const fileGetter = async ({
    file,
    blob,
  }: {
    file: File;
    blob: Blob;
  }): Promise<CroppedFile> => ({
    name: file.name,
    size: blob.size,
    type: blob.type,
    url: URL.createObjectURL(blob),
    file: blob,
    fileName: `https://matrixerpfleet.s3.us-west-2.amazonaws.com/${folder}/${uuidv4()}.${
      file.type.split("/")[1]
    }`,
  });

  const onSave = async () => {
    const image = imgRef.current;
    const previewCanvas = previewCanvasRef.current;

    if (!image || !previewCanvas || !completedCrop) {
      return;
    }

    const scaleX = image.naturalWidth / image.width;
    const scaleY = image.naturalHeight / image.height;

    // Use OffscreenCanvas for better performance, if supported
    const offscreen = new OffscreenCanvas(
      completedCrop.width * scaleX,
      completedCrop.height * scaleY
    );

    const ctx = offscreen.getContext("2d");

    if (!ctx) {
      throw new Error("No 2d context");
    }

    ctx.drawImage(
      previewCanvas,
      0,
      0,
      previewCanvas.width,
      previewCanvas.height,
      0,
      0,
      offscreen.width,
      offscreen.height
    );

    const blob = await offscreen.convertToBlob({
      type: acceptedFiles.type,
    });

    if (blobUrlRef.current) {
      URL.revokeObjectURL(blobUrlRef.current);
    }

    blobUrlRef.current = URL.createObjectURL(blob);

    // If 'multiple' is true, you would typically handle an array of files.
    // The current implementation only handles a single file being cropped.
    // You might need to adjust this logic if `multiple` truly means cropping
    // multiple images in one go or adding to a list of cropped images.
    if (multiple) {
      // Logic for multiple files if needed
    } else {
      const file = await fileGetter({ file: acceptedFiles, blob });
      setAcceptedFiles(file);
      setValue(name, file);
      onChange?.(file); // Call onChange if it exists
    }

    props.onHide();
    setCompletedCrop(null);
    setRotate(0);
    setScale(1);
  };

  return (
    <CustomModal2
      {...props}
      title={"Image Cropper"}
      open={true}
      onClose={props.onHide}
      onSubmit={onSave}
    >
      <Stack py={2} pt={3} px={3} direction={"row"} spacing={5}>
        <Stack flex={1} direction={"row"} spacing={2}>
          <Typography>{t("Rotation")}</Typography>
          <Slider
            size="small"
            min={-180}
            max={180}
            valueLabelDisplay="auto"
            value={rotate}
            onChange={(_, value) => setRotate(value as number)}
          />
        </Stack>
        <Stack flex={1} direction={"row"} spacing={2}>
          <Typography>{t("Scale")}</Typography>
          <Slider
            size="small"
            min={-10}
            max={10}
            step={0.1}
            valueLabelDisplay="auto"
            value={scale}
            onChange={(_, value) => setScale(value as number)}
          />
        </Stack>
      </Stack>
      <Box
        height={"26rem"}
        overflow={"hidden"}
        sx={{
          "& .ReactCrop ": {
            height: "100%",
            position: "relative",
            left: "50%",
            transform: "translateX(-50%)",
            "& .ReactCrop__child-wrapper": {
              height: "100%",
            },
          },
        }}
      >
        <ReactCrop
          crop={crop}
          onChange={(percentCrop) => setCrop(percentCrop)}
          onComplete={(c) => setCompletedCrop(c)}
          keepSelection
          aspect={aspectRatio}
          minWidth={MIN_DIMENSION}
        >
          <img
            ref={imgRef}
            style={{
              height: "100%",
              width: "auto",
              transform: `scale(${scale}) rotate(${rotate}deg)`,
            }}
            src={acceptedFiles?.url || URL.createObjectURL(acceptedFiles)} // Use acceptedFiles.url or create object URL
            alt={"selected_image"}
            onLoad={onImageLoad}
          />
        </ReactCrop>

        <canvas
          ref={previewCanvasRef}
          style={{
            border: "1px solid black",
            objectFit: "contain",
            width: completedCrop?.width,
            height: completedCrop?.height,
            display: "none", // This canvas is for internal processing, not direct display
          }}
        />
      </Box>
    </CustomModal2>
  );
}
