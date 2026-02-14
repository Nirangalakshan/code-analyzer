import { NextRequest, NextResponse } from "next/server";
import { uploadToGCS } from "@/lib/gcs";

export async function POST(req: NextRequest) {
  try {
    const { summary, documentation, mermaid, analysis, repoName } =
      await req.json();

    if (!documentation || !mermaid) {
      return NextResponse.json(
        { error: "Insufficient data to save" },
        { status: 400 },
      );
    }

    // Create a unique directory prefix using timestamp and repo name
    const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
    const sanitizedRepoName =
      repoName?.replace(/[^a-zA-Z0-9]/g, "_") || "unknown_repo";
    const baseDir = `analysis/${sanitizedRepoName}/${timestamp}`;

    console.log(
      `[Upload] Saving analysis for ${sanitizedRepoName} to ${baseDir}`,
    );

    // 1. Save Documentation as Markdown
    const docsUrl = await uploadToGCS(
      `${baseDir}/documentation.md`,
      documentation,
    );

    // 2. Save Mermaid Diagram as a .mmd file
    const mermaidUrl = await uploadToGCS(
      `${baseDir}/architecture.mmd`,
      mermaid,
    );

    // 3. Save Summary, Alerts, and Metadata as JSON
    const metadata = {
      summary,
      analysis,
      repoName,
      createdAt: new Date().toISOString(),
      filePaths: {
        documentation: `${baseDir}/documentation.md`,
        mermaid: `${baseDir}/architecture.mmd`,
      },
    };

    const metadataUrl = await uploadToGCS(
      `${baseDir}/metadata.json`,
      JSON.stringify(metadata, null, 2),
    );

    return NextResponse.json({
      success: true,
      message: "Analysis artifacts saved successfully",
      artifacts: {
        documentation: docsUrl,
        mermaid: mermaidUrl,
        metadata: metadataUrl,
      },
    });
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : "Failed to save to storage";
    console.error("[Upload API] Error:", error);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
