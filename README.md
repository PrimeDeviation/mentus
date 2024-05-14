# Mentus

## Setup Instructions

### macOS

1. Install Docker for Mac from [Docker's official website](https://www.docker.com/products/docker-desktop).
2. Clone the repository:
   ```sh
   git clone https://github.com/PrimeDeviation/mentus.git
   cd mentus
   ```
3. Build the Docker container:
   ```sh
   docker build -t mentus .
   ```
4. Run the Docker container:
   ```sh
   docker run -p 5000:5000 mentus
   ```

### WSL2

1. Install Docker Desktop for Windows from [Docker's official website](https://www.docker.com/products/docker-desktop) and ensure WSL2 integration is enabled.
2. Clone the repository:
   ```sh
   git clone https://github.com/PrimeDeviation/mentus.git
   cd mentus
   ```
3. Build the Docker container:
   ```sh
   docker build -t mentus .
   ```
4. Run the Docker container:
   ```sh
   docker run -p 5000:5000 mentus
   ```

## GitHub Actions Workflow

The GitHub Actions workflow is set up to build and test the Docker container on every commit to the `main` branch. The workflow file is located at `.github/workflows/docker-build-test.yml`.

### Workflow Steps

1. **Checkout code**: Checks out the repository code.
2. **Set up Docker Buildx**: Sets up Docker Buildx for building multi-platform images.
3. **Cache Docker layers**: Caches Docker layers to speed up the build process.
4. **Log in to Docker Hub**: Logs in to Docker Hub using secrets for credentials.
5. **Build and push Docker image**: Builds the Docker image but does not push it.
6. **Run tests**: Runs tests inside the Docker container using `pytest`.

The workflow ensures that the Docker container is built and tested on every commit, providing continuous integration and validation of the codebase.

## Consideration for AKS

As we move towards production, we will consider using AKS (Azure Kubernetes Service) for deploying the application to ensure scalability and manageability.
