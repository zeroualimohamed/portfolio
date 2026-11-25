const preloaded = new Set<string>();

export function preloadImage(url: string): void {
  if (!url || preloaded.has(url)) return;
  preloaded.add(url);
  const img = new Image();
  img.decoding = "async";
  img.src = url;
}

export function decodeImage(url: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.decoding = "async";
    img.onerror = () => reject(new Error(`Failed to load ${url}`));
    img.src = url;
    if (typeof img.decode === "function") {
      img.decode().then(
        () => resolve(url),
        () => {
          if (img.complete && img.naturalWidth > 0) resolve(url);
          else img.onload = () => resolve(url);
        },
      );
    } else {
      img.onload = () => resolve(url);
    }
  });
}

export function pad2(n: number): string {
  return n < 10 ? `0${n}` : String(n);
}

export function formatBytes(n: number): string {
  return n >= 1048576 ? `${(n / 1048576).toFixed(1)} MB` : `${Math.round(n / 1024)} KB`;
}
