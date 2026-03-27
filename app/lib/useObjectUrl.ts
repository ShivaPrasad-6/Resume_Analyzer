import { useEffect, useState } from "react";

const isDirectBrowserUrl = (path: string) =>
  path.startsWith("http://") ||
  path.startsWith("https://") ||
  path.startsWith("blob:") ||
  path.startsWith("data:");

export const useObjectUrl = (
  path: string | undefined,
  readFile: ((path: string) => Promise<Blob | undefined>) | undefined
) => {
  const [url, setUrl] = useState("");

  useEffect(() => {
    let isActive = true;
    let objectUrl = "";

    const loadUrl = async () => {
      if (!path) {
        setUrl("");
        return;
      }

      if (isDirectBrowserUrl(path)) {
        setUrl(path);
        return;
      }

      if (!readFile) {
        setUrl(path);
        return;
      }

      try {
        const blob = await readFile(path);

        if (!blob || !isActive) {
          setUrl(path);
          return;
        }

        objectUrl = URL.createObjectURL(blob);
        setUrl(objectUrl);
      } catch {
        if (isActive) {
          setUrl(path);
        }
      }
    };

    loadUrl();

    return () => {
      isActive = false;
      if (objectUrl) {
        URL.revokeObjectURL(objectUrl);
      }
    };
  }, [path, readFile]);

  return url;
};
