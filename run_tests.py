import chromedriver_autoinstaller
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.chrome.options import Options

# Install ChromeDriver
chromedriver_autoinstaller.install()

# Set up Chrome options
chrome_options = Options()
chrome_options.add_argument("--headless")  # Ensure GUI is off
chrome_options.add_argument("--no-sandbox")
chrome_options.add_argument("--disable-dev-shm-usage")
chrome_options.binary_location = "/usr/bin/chromium-browser"  # Use Chromium

# Set up the WebDriver
service = Service()
driver = webdriver.Chrome(service=service, options=chrome_options)

# Load the settings.html file
driver.get("file://" + "/PrimeDeviation__mentus/components/settings/settings.html")

# Capture console output
logs = driver.get_log("browser")
for log in logs:
    print(log)

# Close the browser
driver.quit()
