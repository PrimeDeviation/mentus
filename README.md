# mentus
## Setup Instructions for macOS and WSL2

### macOS

1. Install Docker Desktop for Mac from [Docker's official website](https://www.docker.com/products/docker-desktop).
2. Clone the repository:
   ```sh
   git clone https://github.com/PrimeDeviation/mentus.git
   cd mentus
   ```
3. Build the Docker container:
   ```sh
   docker build -t mentus-app .
   ```
4. Run the Docker container:
   ```sh
   docker run -p 5000:5000 mentus-app
   ```
5. Open your browser and navigate to `http://localhost:5000` to see the application running.

### WSL2

1. Install Docker Desktop for Windows from [Docker's official website](https://www.docker.com/products/docker-desktop) and ensure WSL2 integration is enabled.
2. Clone the repository:
   ```sh
   git clone https://github.com/PrimeDeviation/mentus.git
   cd mentus
   ```
3. Build the Docker container:
   ```sh
   docker build -t mentus-app .
   ```
4. Run the Docker container:
   ```sh
   docker run -p 5000:5000 mentus-app
   ```
5. Open your browser and navigate to `http://localhost:5000` to see the application running.

## GitHub Actions Workflow

The GitHub Actions workflow is configured to build and test the Docker container on every commit to the `main` branch. The workflow performs the following steps:

1. **Checkout code**: Checks out the repository code.
2. **Set up Docker Buildx**: Sets up Docker Buildx for multi-platform builds.
3. **Cache Docker layers**: Caches Docker layers to speed up the build process.
4. **Log in to Azure Container Registry**: Logs in to ACR using the provided secrets.
5. **Build and push Docker image**: Builds the Docker image and pushes it to ACR.
6. **Run tests**: Runs the tests inside the Docker container.

The workflow uses the following GitHub secrets:
- `ACR_LOGIN_SERVER`
- `ACR_USERNAME`
- `ACR_PASSWORD`

The Docker images are pushed to `godrender.azurecr.io`.

