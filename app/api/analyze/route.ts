import { NextRequest, NextResponse } from "next/server";
import { Octokit } from "octokit";
import { VertexAI } from "@google-cloud/vertexai";
import { uploadToGCS } from "@/lib/gcs";

// Initialize Octokit with your PAT
const octokit = new Octokit({
  auth: process.env.GITHUB_TOKEN,
});

// Create auth options for Vertex AI
const getAuthOptions = () => {
  // Option 1: Use separate parameters (most reliable for env files)
  const clientEmail = process.env.GCP_CLIENT_EMAIL;
  // Handle both literal and escaped newlines
  const privateKey = process.env.GCP_PRIVATE_KEY?.replace(/\\n/g, "\n");
  const projectId = process.env.GCP_PROJECT_ID;

  if (clientEmail && privateKey && projectId) {
    return {
      credentials: {
        client_email: clientEmail,
        private_key: privateKey,
        project_id: projectId,
      },
    };
  }

  // Option 2: Legacy fallback to full JSON string
  if (process.env.GCP_SERVICE_ACCOUNT_KEY) {
    try {
      return { credentials: JSON.parse(process.env.GCP_SERVICE_ACCOUNT_KEY) };
    } catch {
      console.error("[CodeLens] Error parsing GCP_SERVICE_ACCOUNT_KEY.");
    }
  }

  return {};
};

// Initialize Vertex AI
const project = process.env.GCP_PROJECT_ID || "";
const location = process.env.GCP_LOCATION || "us-central1";
const vertexAI = new VertexAI({
  project: project,
  location,
  googleAuthOptions: getAuthOptions(),
});

const model = vertexAI.getGenerativeModel({
  model: "gemini-2.0-flash",
  generationConfig: {
    responseMimeType: "application/json",
  },
});

// Helper to filter relevant files
const isRelevantFile = (filename: string) => {
  const ignoredExtensions = [
    ".png",
    ".jpg",
    ".jpeg",
    ".gif",
    ".svg",
    ".ico",
    ".pdf",
    ".zip",
    ".lock",
    ".json",
    ".map",
  ];
  const ignoredFiles = [
    "package-lock.json",
    "yarn.lock",
    "pnpm-lock.yaml",
    ".gitignore",
    "LICENSE",
  ];

  if (ignoredFiles.includes(filename)) return false;

  const lastDotIndex = filename.lastIndexOf(".");
  if (lastDotIndex === -1) return true; // Include files without extensions (e.g., README, Dockerfile)

  const ext = filename.slice(lastDotIndex).toLowerCase();
  if (ignoredExtensions.includes(ext)) {
    // Exception for package.json as it gives good metadata
    if (filename === "package.json") return true;
    return false;
  }

  return true;
};

// Recursive function to fetch repo content
async function fetchRepoContent(
  owner: string,
  repo: string,
  path = "",
): Promise<string> {
  let codebase = "";

  try {
    const { data } = await octokit.rest.repos.getContent({
      owner,
      repo,
      path,
    });

    if (Array.isArray(data)) {
      for (const item of data) {
        // Skip ignored directories
        if (
          item.type === "dir" &&
          ["node_modules", ".git", ".next", "dist", "build", "public"].includes(
            item.name,
          )
        )
          continue;

        if (item.type === "file" && isRelevantFile(item.name)) {
          console.log(`[CodeLens] Fetching file: ${item.path}`);
          const { data: fileData } = await octokit.rest.repos.getContent({
            owner,
            repo,
            path: item.path,
          });

          if ("content" in fileData) {
            const content = Buffer.from(fileData.content, "base64").toString();
            codebase += `\nFILE: ${item.path}\n---\n${content}\n`;
          }
        } else if (item.type === "dir") {
          codebase += await fetchRepoContent(owner, repo, item.path);
        }
      }
    }
  } catch (error) {
    console.error(`Error fetching path ${path}:`, error);
  }

  return codebase;
}

export async function POST(req: NextRequest) {
  try {
    // 0. Validate Credentials
    if (!process.env.GITHUB_TOKEN) {
      return NextResponse.json(
        { error: "Missing GITHUB_TOKEN" },
        { status: 500 },
      );
    }

    // Check for either separate parameters OR the full JSON string
    const hasGCPAuth =
      (process.env.GCP_CLIENT_EMAIL && process.env.GCP_PRIVATE_KEY) ||
      process.env.GCP_SERVICE_ACCOUNT_KEY ||
      process.env.GOOGLE_APPLICATION_CREDENTIALS;

    if (!hasGCPAuth) {
      return NextResponse.json(
        {
          error:
            "GCP Authentication missing. Please set GCP_CLIENT_EMAIL and GCP_PRIVATE_KEY in .env.local.",
        },
        { status: 500 },
      );
    }

    const { repoUrl } = await req.json();

    if (!repoUrl) {
      return NextResponse.json(
        { error: "Repository URL is required" },
        { status: 400 },
      );
    }

    // Robust GitHub URL parsing
    const match = repoUrl.match(/github\.com\/([^/]+)\/([^/]+)/);
    if (!match) {
      return NextResponse.json(
        {
          error:
            "Invalid GitHub URL format. Please use https://github.com/owner/repo",
        },
        { status: 400 },
      );
    }

    const owner = match[1];
    const repo = match[2].replace(".git", ""); // Remove .git if present

    console.log(`[CodeLens] Analyzing repository: ${owner}/${repo}`);

    // 1. Fetch Repository Contents
    const codebase = await fetchRepoContent(owner, repo);

    if (!codebase) {
      console.error(
        `[CodeLens] No files found for ${owner}/${repo}. Check permissions/URL.`,
      );
      return NextResponse.json(
        {
          error:
            "No relevant code found in repository. Ensure it's public or your token has access.",
        },
        { status: 404 },
      );
    }

    // 2. Prepare Prompt for Gemini
    const systemInstruction = `
      You are an elite software architect and systems analyst.
      Analyze the provided codebase and generate a comprehensive response in JSON format.
      The JSON must include:
      1. "summary": A concise overview of the project's purpose and technology stack.
      2. "documentation": A detailed technical documentation/README including architecture, key modules, and setup.
      3. "mermaid": A VALID Mermaid.js diagram (strictly flowchart TD or architecture diagram). 
         CRITICAL RULES for Mermaid:
         - DO NOT wrap the mermaid code in markdown code blocks (e.g., no \`\`\`mermaid).
         - ALWAYS wrap node labels in double quotes (e.g., A["Label Text"]).
         - Use only valid Mermaid syntax.
         - Avoid special characters like (), [], {}, <>, :, ; unless they are inside quotes.
      4. "analysis": An array of objects each with "type" (security, performance, quality), "severity" (low, medium, high), and "description".
    `;

    const prompt = `
      ${systemInstruction}

      CODEBASE:
      ${codebase}
    `;

    // 3. Generate Analysis using Vertex AI
    const result = await model.generateContent(prompt);
    const textResponse =
      result.response.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!textResponse) {
      throw new Error("Empty response from Vertex AI");
    }

    const analysisResult = JSON.parse(textResponse);

    // Post-process Mermaid to strip any accidentally included markdown code blocks
    if (analysisResult.mermaid) {
      analysisResult.mermaid = analysisResult.mermaid
        .replace(/```mermaid\n?/g, "")
        .replace(/```\n?/g, "")
        .trim();
    }

    // 4. Save to Google Cloud Storage (Background Save)
    const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
    const baseDir = `analysis/${owner}_${repo}/${timestamp}`;

    try {
      await Promise.all([
        uploadToGCS(
          `${baseDir}/documentation.md`,
          analysisResult.documentation,
        ),
        uploadToGCS(`${baseDir}/architecture.mmd`, analysisResult.mermaid),
        uploadToGCS(
          `${baseDir}/analysis.json`,
          JSON.stringify(
            {
              summary: analysisResult.summary,
              analysis: analysisResult.analysis,
              repoUrl,
              timestamp: new Date().toISOString(),
            },
            null,
            2,
          ),
        ),
      ]);
      console.log(`[CodeLens] All artifacts saved to GCS at: ${baseDir}`);
    } catch (saveError) {
      console.error("[CodeLens] Error auto-saving to GCS:", saveError);
      // We don't fail the request if saving fails, but we log it
    }

    return NextResponse.json({
      ...analysisResult,
      storagePath: baseDir,
      timestamp,
    });
  } catch (error: unknown) {
    console.error("Analysis Error:", error);
    const message =
      error instanceof Error ? error.message : "Failed to analyze repository";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
