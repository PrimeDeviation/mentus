# Chrome Extension Boilerplate

## Project Structure

- `src/`: Source files
  - `popup.html`: HTML file for the extension's popup
  - `popup.js`: JavaScript file for the popup's functionality
  - `background.js`: JavaScript file for background scripts
  - `content.js`: JavaScript file for content scripts
  - `styles.css`: CSS file for styling the extension
- `dist/`: Distribution files
- `assets/`: Images and icons
  - `icon16.png`: 16x16 icon
  - `icon48.png`: 48x48 icon
  - `icon128.png`: 128x128 icon
- `manifest.json`: Configuration file for the Chrome extension
- `webpack.config.js`: Configuration file for Webpack

## Setup

1. Install dependencies:
   ```
   npm install
   ```

2. Build the extension:
   ```
   npm run build
   ```

## Running the Extension

1. Open Chrome and go to `chrome://extensions/`.
2. Enable "Developer mode" if it is not already enabled.
3. Click "Load unpacked" and select the `dist` directory.

## Purpose of Each File and Directory

- `src/`: Contains the source files for the extension.
- `dist/`: Contains the built files for distribution.
- `assets/`: Contains images and icons used in the extension.
- `manifest.json`: Defines the extension's configuration and permissions.
- `webpack.config.js`: Configures Webpack to bundle the source files.

