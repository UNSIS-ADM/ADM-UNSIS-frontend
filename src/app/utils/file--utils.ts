/**
 * Extrae el nombre de archivo del header Content-Disposition
 */
export function extractFilename(
  contentDisposition: string | null,
  defaultName: string
): string {
  if (!contentDisposition) return defaultName;

  // Buscar filename*=UTF-8''encodedName
  const fnStar = /filename\*=UTF-8''(.+)$/.exec(contentDisposition);
  if (fnStar && fnStar[1]) return decodeURIComponent(fnStar[1]);

  // Buscar filename="name"
  const fn = /filename=\"?([^\";]+)\"?/.exec(contentDisposition);
  return (fn && fn[1]) || defaultName;
}
