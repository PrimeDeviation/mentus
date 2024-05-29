# Release Instructions

## Local Installation and Testing

### Prerequisites
- Node.js (v22.2.0)
- npm (v10.7.0)

### Steps

1. **Clone the repository:**
   ```bash
   git clone <repository-url>
   cd <repository-directory>
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Build the project:**
   ```bash
   npm run build
   ```

4. **Run tests:**
   ```bash
   npm test
   ```

5. **Local Deployment:**
   - Serve the `dist` directory using a static file server or any web server of your choice.

### Notes
- Ensure that you have the required versions of Node.js and npm installed.
- The `build` script copies the frontend source files to the `dist` directory for deployment.

