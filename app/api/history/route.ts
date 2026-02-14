import { NextResponse } from "next/server";
import { listAnalyses, getFileContent, deleteAnalysis } from "@/lib/gcs";

export async function GET() {
  try {
    const history = await listAnalyses();
    return NextResponse.json(history);
  } catch (error) {
    console.error("[History API] GET Error:", error);
    return NextResponse.json(
      { error: "Failed to fetch history" },
      { status: 500 },
    );
  }
}

export async function POST(req: Request) {
  try {
    const { path } = await req.json();

    if (!path) {
      return NextResponse.json({ error: "Path is required" }, { status: 400 });
    }

    const [analysisJson, documentation, mermaid] = await Promise.all([
      getFileContent(`${path}/analysis.json`),
      getFileContent(`${path}/documentation.md`),
      getFileContent(`${path}/architecture.mmd`),
    ]);

    if (!analysisJson || !documentation || !mermaid) {
      return NextResponse.json(
        { error: "Analysis files not found" },
        { status: 404 },
      );
    }

    const metadata = JSON.parse(analysisJson);

    return NextResponse.json({
      summary: metadata.summary,
      analysis: metadata.analysis,
      documentation,
      mermaid,
      storagePath: path,
      repoUrl: metadata.repoUrl,
    });
  } catch (error) {
    console.error("[History API] POST Error:", error);
    return NextResponse.json(
      { error: "Failed to fetch analysis details" },
      { status: 500 },
    );
  }
}

export async function DELETE(req: Request) {
  try {
    const { path } = await req.json();
    if (!path) {
      return NextResponse.json({ error: "Path is required" }, { status: 400 });
    }

    await deleteAnalysis(path);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[History API] DELETE Error:", error);
    return NextResponse.json(
      { error: "Failed to delete analysis" },
      { status: 500 },
    );
  }
}
