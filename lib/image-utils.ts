export function getImageUrl(key: string | undefined): string {
  console.log("============", key);
  if (!key) return "";
  if (
    key.startsWith("http://") ||
    key.startsWith("https://") ||
    key.startsWith("/")
  ) {
    return key;
  }
  const s3BaseUrl =
    process.env.NEXT_PUBLIC_S3_BASE_URL ||
    "https://privora.s3.ap-south-1.amazonaws.com";

  if (!s3BaseUrl) {
    console.warn(
      "NEXT_PUBLIC_S3_BASE_URL is not configured. Images may not display correctly.",
    );
    return key;
  }
  const baseUrl = s3BaseUrl.endsWith("/") ? s3BaseUrl.slice(0, -1) : s3BaseUrl;
  return `${baseUrl}/${key}`;
}
