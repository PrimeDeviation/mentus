# mentus
## Setup Instructions for macOS and WSL2

### macOS

1. Install Docker Desktop from [Docker's official website](https://www.docker.com/products/docker-desktop).
2. Clone the repository:
   ```sh
   git clone https://github.com/PrimeDeviation/mentus.git
   cd mentus
   ```
3. Build the Docker image:
   ```sh
   docker build -t mentus-app .
   ```
4. Run the Docker container:
   ```sh
   docker run -p 5000:5000 mentus-app
   ```

### WSL2

1. Install Docker Desktop from [Docker's official website](https://www.docker.com/products/docker-desktop) and ensure WSL2 integration is enabled.
2. Clone the repository:
   ```sh
   git clone https://github.com/PrimeDeviation/mentus.git
   cd mentus
   ```
3. Build the Docker image:
   ```sh
   docker build -t mentus-app .
   ```
4. Run the Docker container:
   ```sh
   docker run -p 5000:5000 mentus-app
   ```

## GitHub Actions Workflow Setup

The GitHub Actions workflow is configured to build and test the Docker container on every commit to the `main` branch. The workflow performs the following steps:

1. Checks out the code.
2. Sets up Docker Buildx.
3. Caches Docker layers.
4. Logs in to Azure Container Registry (ACR) using the provided secrets.
5. Builds and pushes the Docker image to ACR.
6. Runs tests using the built Docker image.

The workflow uses the following GitHub secrets:
- `ACR_LOGIN_SERVER`
- `ACR_USERNAME`
- `ACR_PASSWORD`

The Docker image is pushed to the ACR instance `godrender.azurecr.io`.

## Consideration for AKS

As we move towards production, we will consider using AKS (Azure Kubernetes Service) for deploying the application to ensure scalability and manageability.
