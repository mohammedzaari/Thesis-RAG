/** Triggers a browser download for a Blob received through HttpClient. */
export function saveBlob(blob: Blob, fileName: string): void {
  const url = URL.createObjectURL(blob);
  const anchor = Object.assign(document.createElement('a'), { href: url, download: fileName });
  anchor.click();
  URL.revokeObjectURL(url);
}

/** Opens a Blob (e.g. a PDF) in a new browser tab. */
export function openBlobInNewTab(blob: Blob): void {
  window.open(URL.createObjectURL(blob), '_blank');
}
