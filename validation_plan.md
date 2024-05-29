# Validation Cycle Plan for Mentus Chrome Extension

## Step-by-Step Instructions

### 1. Clone the Repository
```sh
git clone https://github.com/PrimeDeviation/mentus.git
cd mentus
```

### 2. Make Incremental Changes
- Make the necessary changes to the codebase.
- Ensure that each change is small and incremental.

### 3. Load the Extension in Chrome
1. Open Chrome and navigate to `chrome://extensions/`.
2. Enable "Developer mode" by toggling the switch in the top right.
3. Click "Load unpacked" and select the cloned directory.

### 4. Validate the Changes
- Open the extension by clicking on the icon in the Chrome toolbar.
- Perform the following checks:
  - Ensure the extension loads without errors.
  - Verify that the main functionalities (e.g., adding a subject) work as expected.
  - Check the console for any errors or warnings.

### 5. Repeat
- Repeat steps 2-4 for each incremental change.

### 6. Final Validation
- After all changes are made, perform a final validation to ensure the extension works seamlessly.
- Document any issues found and fix them before finalizing the changes.

