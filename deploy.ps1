# deploy.ps1
# This script deploys the application to Cloud Run, automatically passing your Firebase variables.

# Load .env.local variables
if (Test-Path ".env.local") {
    Get-Content .env.local | ForEach-Object {
        if ($_ -match "^(?<name>[^=]+)=(?<value>.*)$") {
            $name = $Matches['name'].Trim()
            $value = $Matches['value'].Trim().Trim('"').Trim("'")
            if ($name -like "NEXT_PUBLIC_FIREBASE_*" -or $name -eq "GITHUB_TOKEN" -or $name -eq "GCP_BUCKET_NAME") {
                Set-Item -Path "Env:$name" -Value $value
            }
        }
    }
}

$project_id = gcloud config get-value project
if (-not $project_id) {
    Write-Error "Could not determine GCP Project ID. Run 'gcloud init' or 'gcloud config set project'."
    exit
}

Write-Host "--- Building and Deploying Code Analyzer ---" -ForegroundColor Cyan
Write-Host "Project: $project_id"

# 1. Build & Push using Google Cloud Builds
gcloud builds submit --tag "gcr.io/$project_id/code-analyzer" `
    --build-arg "NEXT_PUBLIC_FIREBASE_API_KEY=$Env:NEXT_PUBLIC_FIREBASE_API_KEY" `
    --build-arg "NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=$Env:NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN" `
    --build-arg "NEXT_PUBLIC_FIREBASE_PROJECT_ID=$Env:NEXT_PUBLIC_FIREBASE_PROJECT_ID" `
    --build-arg "NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=$Env:NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET" `
    --build-arg "NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=$Env:NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID" `
    --build-arg "NEXT_PUBLIC_FIREBASE_APP_ID=$Env:NEXT_PUBLIC_FIREBASE_APP_ID"

# 2. Deploy to Cloud Run
gcloud run deploy code-analyzer-service `
    --image "gcr.io/$project_id/code-analyzer" `
    --region us-central1 `
    --allow-unauthenticated `
    --set-env-vars "GITHUB_TOKEN=$Env:GITHUB_TOKEN,GCP_PROJECT_ID=$project_id,GCP_BUCKET_NAME=$Env:GCP_BUCKET_NAME"

Write-Host "--- Deployment Complete ---" -ForegroundColor Green
