from selenium import webdriver
from selenium.webdriver.firefox.service import Service
from selenium.webdriver.common.by import By
from selenium.webdriver.firefox.options import Options
from webdriver_manager.firefox import GeckoDriverManager

# Set up Firefox options
firefox_options = Options()
firefox_options.add_argument("--headless")  # Ensure GUI is off
firefox_options.add_argument("--no-sandbox")
firefox_options.add_argument("--disable-dev-shm-usage")

# Set up the WebDriver
service = Service(GeckoDriverManager().install())
driver = webdriver.Firefox(service=service, options=firefox_options)

# Load the test_mentus_tab.html file
driver.get("file://" + "/PrimeDeviation__mentus/test_mentus_tab.html")

# Capture console output
logs = driver.get_log("browser")
for log in logs:
    print(log)

# Close the browser
driver.quit()
