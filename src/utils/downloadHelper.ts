/**
 * Utility to trigger immediate, direct zero-redirect download of the project ZIP
 * using client-side Blob URL generation.
 */
export async function triggerZipDownload(): Promise<void> {
  try {
    const response = await fetch('/leadcatch-project.zip');
    if (!response.ok) {
      throw new Error(`Failed to fetch archive: ${response.statusText}`);
    }
    const blob = await response.blob();
    const blobUrl = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = blobUrl;
    link.download = 'leadcatch-project.zip';
    link.style.display = 'none';
    document.body.appendChild(link);
    link.click();
    setTimeout(() => {
      document.body.removeChild(link);
      window.URL.revokeObjectURL(blobUrl);
    }, 200);
  } catch {
    // Fallback direct anchor trigger
    const directLink = document.createElement('a');
    directLink.href = '/leadcatch-project.zip';
    directLink.download = 'leadcatch-project.zip';
    directLink.style.display = 'none';
    document.body.appendChild(directLink);
    directLink.click();
    setTimeout(() => {
      document.body.removeChild(directLink);
    }, 200);
  }
}
