import { Storage } from "@google-cloud/storage";

const storage = new Storage({
  projectId: process.env.GCP_PROJECT_ID,
  ...(process.env.GCP_PRIVATE_KEY
    ? {
        credentials: {
          client_email: process.env.GCP_CLIENT_EMAIL,
          private_key: process.env.GCP_PRIVATE_KEY.replace(/\\n/g, "\n"),
        },
      }
    : {}),
});

const bucketName = process.env.GCP_BUCKET_NAME;

if (!bucketName) {
  console.warn(
    "Warning: GCP_BUCKET_NAME is not defined. Google Cloud Storage features will fail if used.",
  );
}

const bucket = bucketName ? storage.bucket(bucketName) : (null as any);

/**
 * Ensures the bucket is configured before proceeding
 */
function ensureBucket() {
  if (!bucketName || !bucket) {
    throw new Error(
      "GCP_BUCKET_NAME is missing. Please set it in your environment variables.",
    );
  }
  return bucket;
}

/**
 * Uploads content to Google Cloud Storage
 * @param filename - The path/name of the file in the bucket
 * @param content - The string or buffer to upload
 */
export async function uploadToGCS(filename: string, content: string | Buffer) {
  try {
    const bucket = ensureBucket();
    const file = bucket.file(filename);

    // Set appropriate content type based on extension
    let contentType = "text/plain";
    if (filename.endsWith(".json")) contentType = "application/json";
    if (filename.endsWith(".md")) contentType = "text/markdown";
    if (filename.endsWith(".mmd")) contentType = "text/vnd.mermaid";

    await file.save(content, {
      contentType,
      resumable: false,
    });

    console.log(`[GCS] Successfully uploaded: ${filename}`);
    return `https://storage.googleapis.com/${bucketName}/${filename}`;
  } catch (error) {
    console.error("[GCS] Upload Error:", error);
    throw error;
  }
}

/**
 * Lists all previous analysis folders in the bucket
 */
export async function listAnalyses() {
  try {
    const bucket = ensureBucket();
    const [files] = await bucket.getFiles({ prefix: "analysis/" });

    // Each analysis has a metadata.json or analysis.json
    // We'll filter for analysis.json to identify complete sessions
    const snapshotFiles = files.filter((f) => f.name.endsWith("analysis.json"));

    const results = await Promise.all(
      snapshotFiles.map(async (file) => {
        const [content] = await file.download();
        const metadata = JSON.parse(content.toString());

        // Extract repo name and timestamp from path
        // Path format: analysis/owner_repo/timestamp/analysis.json
        const parts = file.name.split("/");
        return {
          id: file.name,
          repoName: parts[1].replace("_", "/"),
          timestamp: parts[2].replace(/-/g, ":"),
          summary: metadata.summary,
          path: file.name.replace("/analysis.json", ""),
        };
      }),
    );

    return results.sort(
      (a, b) =>
        new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime(),
    );
  } catch (error) {
    console.error("[GCS] List Error:", error);
    return [];
  }
}

/**
 * Fetches content of a specific file in the bucket
 */
export async function getFileContent(filename: string) {
  try {
    const bucket = ensureBucket();
    const [content] = await bucket.file(filename).download();
    return content.toString();
  } catch (error) {
    console.error(`[GCS] Fetch Error for ${filename}:`, error);
    return null;
  }
}

/**
 * Deletes an entire analysis folder
 */
export async function deleteAnalysis(path: string) {
  try {
    const bucket = ensureBucket();
    // deleteFiles with a prefix removes everything under that "folder"
    await bucket.deleteFiles({ prefix: path });
    console.log(`[GCS] Successfully deleted analysis: ${path}`);
    return true;
  } catch (error) {
    console.error(`[GCS] Delete Error for ${path}:`, error);
    throw error;
  }
}
