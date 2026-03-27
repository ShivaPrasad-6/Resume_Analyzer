type ConvertPdfToImageOptions = {
  pageNumber?: number;
  scale?: number;
  mimeType?: string;
  quality?: number;
};

type PdfJsModule = typeof import("pdfjs-dist");

let pdfJsPromise: Promise<PdfJsModule> | null = null;

const loadPdfJs = async () => {
  if (typeof window === "undefined" || typeof document === "undefined") {
    throw new Error("PDF conversion is only available in the browser");
  }

  if (!pdfJsPromise) {
    pdfJsPromise = Promise.all([
      import("pdfjs-dist"),
      import("pdfjs-dist/build/pdf.worker.min.mjs?url"),
    ]).then(([pdfJs, workerModule]) => {
      pdfJs.GlobalWorkerOptions.workerSrc = workerModule.default;
      return pdfJs;
    });
  }

  return pdfJsPromise;
};

const canvasToBlob = (
  canvas: HTMLCanvasElement,
  mimeType: string,
  quality?: number
) =>
  new Promise<Blob>((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (!blob) {
        reject(new Error("Failed to convert canvas to image blob"));
        return;
      }

      resolve(blob);
    }, mimeType, quality);
  });

export const convertPdfToImage = async (
  file: File,
  options: ConvertPdfToImageOptions = {}
) => {
  const { getDocument } = await loadPdfJs();
  const {
    pageNumber = 1,
    scale = 2,
    mimeType = "image/png",
    quality,
  } = options;

  const pdfData = await file.arrayBuffer();
  const pdf = await getDocument({ data: pdfData }).promise;

  if (pageNumber < 1 || pageNumber > pdf.numPages) {
    throw new Error(
      `Invalid PDF page ${pageNumber}. The file has ${pdf.numPages} page(s).`
    );
  }

  const page = await pdf.getPage(pageNumber);
  const viewport = page.getViewport({ scale });
  const canvas = document.createElement("canvas");
  const context = canvas.getContext("2d");

  if (!context) {
    throw new Error("Canvas 2D context is not available");
  }

  canvas.width = Math.ceil(viewport.width);
  canvas.height = Math.ceil(viewport.height);

  await page.render({
    canvas,
    canvasContext: context,
    viewport,
  }).promise;

  const blob = await canvasToBlob(canvas, mimeType, quality);
  const extension = mimeType === "image/jpeg" ? "jpg" : "png";
  const outputName = file.name.replace(/\.pdf$/i, `-page-${pageNumber}.${extension}`);

  pdf.destroy();
  canvas.width = 0;
  canvas.height = 0;

  return new File([blob], outputName, { type: mimeType });
};
