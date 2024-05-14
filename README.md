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

The GitHub Actions workflow is configured to build and test the Docker container on every commit to the `main` branch. The workflow is defined in the `.github/workflows/docker-build-test.yml` file.

### Workflow Steps

1. **Checkout code**: Checks out the repository code.
2. **Set up Docker Buildx**: Sets up Docker Buildx for multi-platform builds.
3. **Log in to Azure Container Registry**: Logs in to the Azure Container Registry using GitHub secrets.
4. **Build and push Docker image**: Builds the Docker image and pushes it to the Azure Container Registry.
5. **Run tests**: Runs the tests inside the Docker container using `pytest`.

### GitHub Secrets

The following GitHub secrets are required for the workflow:

- `ACR_LOGIN_SERVER`: The login server for the Azure Container Registry.
- `ACR_USERNAME`: The username for the Azure Container Registry.
- `ACR_PASSWORD`: The password for the Azure Container Registry.

