# Deploying to Google Cloud Run

This guide explains how to deploy your Next.js application to Google Cloud Run using Docker.

## Prerequisites

1.  **Automated Deploy (Windows)**: You can use the provided `deploy.ps1` script to handle build arguments automatically from your `.env.local` file.

    ```powershell
    ./deploy.ps1
    ```

2.  **Docker Desktop**: Ensure Docker is installed and running.
    ```bash
    docker --version
    ```
3.  **Google Cloud SDK**: Install the `gcloud` CLI if not already installed.
    - [Download Google Cloud SDK](https://cloud.google.com/sdk/docs/install)
    - Initialize it:
      ```bash
      gcloud init
      ```
    - Verify installation:
      ```bash
      gcloud --version
      ```

## Step 1: Prepare the Cloud Project

1.  **Enable Required APIs**:
    Enable Cloud Run and Artifact Registry APIs for your project.

    ```bash
    gcloud services enable run.googleapis.com artifactregistry.googleapis.com
    ```

2.  **Authenticate Docker**:
    Configure Docker to authenticate with Google Cloud Registry.

    ```bash
    gcloud auth configure-docker us-central1-docker.pkg.dev
    ```

    _(Note: Replace `us-central1` with your preferred region if different)._

3.  **Create an Artifact Registry Repository**:
    Create a repository to store your Docker images.
    ```bash
    gcloud artifacts repositories create my-repo \
        --repository-format=docker \
        --location=us-central1 \
        --description="Docker repository for Code Analyzer"
    ```

## Step 2: Build and Push the Docker Image

1.  **Build the Image**:
    Build the Docker image locally.

    ```bash
    docker build -t code-analyzer .
    ```

2.  **Tag the Image**:
    Tag the local image with the remote repository path.
    Replace `PROJECT_ID` with your actual Google Cloud Project ID.

    ```bash
    # Get your Project ID
    gcloud config get-value project

    # Tag the image (replace PROJECT_ID with the output from above)
    docker tag code-analyzer us-central1-docker.pkg.dev/PROJECT_ID/my-repo/code-analyzer:latest
    ```

3.  **Push the Image**:
    Push the tagged image to Artifact Registry.
    ```bash
    docker push us-central1-docker.pkg.dev/PROJECT_ID/my-repo/code-analyzer:latest
    ```

## Step 3: Deploy to Cloud Run

Deploy the container to Cloud Run. You need to set the environment variables required by your application.

**Important Environment Variables**:

- `NEXTAUTH_SECRET`: Generate a random string (e.g. `openssl rand -base64 32`).
- `NEXTAUTH_URL`: Your deployed Cloud Run URL (you will get this after deployment). construct it initially as `http://localhost:3000` or similar for first run.
- `GCP_PROJECT_ID`: Your GCP Project ID.
- `GCP_BUCKET_NAME`: Name of your GCS bucket.

**Note**: You do _not_ need `GCP_CLIENT_EMAIL` or `GCP_PRIVATE_KEY` on Cloud Run if the service account has permissions (recommended).

```bash
gcloud run deploy code-analyzer-service \
    --image us-central1-docker.pkg.dev/PROJECT_ID/my-repo/code-analyzer:latest \
    --region us-central1 \
    --allow-unauthenticated \
    --set-env-vars "NEXTAUTH_SECRET=your_secret_here,GCP_PROJECT_ID=your_project_id,GCP_BUCKET_NAME=your_bucket_name"
```

_(Replace `PROJECT_ID`, `your_secret_here`, `your_project_id` and `your_bucket_name` with actual values)_.

After the first deployment, the command outputs the **Service URL**.

## Step 4: Final Configuration

1.  **Update `NEXTAUTH_URL`**:
    Once you have the Service URL (e.g., `https://code-analyzer-service-xyz.a.run.app`), update the `NEXTAUTH_URL` environment variable.

    ```bash
    gcloud run services update code-analyzer-service \
        --region us-central1 \
        --update-env-vars NEXTAUTH_URL=https://code-analyzer-service-xyz.a.run.app
    ```

2.  **Grant Permissions (If needed)**:
    If your app accesses GCS buckets, ensure the **Default Compute Service Account** has the "Storage Object Admin" or "Storage Object User" role.

    ```bash
    # Get the service account email
    gcloud run services describe code-analyzer-service --region us-central1 --format="value(serviceAccountEmail)"

    # Grant Storage Admin role (example)
    gcloud projects add-iam-policy-binding PROJECT_ID \
        --member="serviceAccount:YOUR_SERVICE_ACCOUNT_EMAIL" \
        --role="roles/storage.admin"
    ```
