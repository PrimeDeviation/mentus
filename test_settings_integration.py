from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.common.keys import Keys
import time

# Set up the WebDriver
driver = webdriver.Chrome()

# Open the index.html file
driver.get("file:///path/to/your/index.html")

# Click on the settings link
settings_link = driver.find_element(By.ID, "settings")
settings_link.click()

# Wait for the settings content to load
time.sleep(2)

# Check if the settings form is displayed
settings_form = driver.find_element(By.ID, "settings-form")
assert settings_form.is_displayed(), "Settings form is not displayed"

# Fill in the settings form
enable_feature_checkbox = driver.find_element(By.ID, "enable-feature")
enable_feature_checkbox.click()

preference_input = driver.find_element(By.ID, "preference")
preference_input.send_keys("Test Preference")

# Submit the form
submit_button = driver.find_element(By.CSS_SELECTOR, "button[type='submit']")
submit_button.click()

# Wait for the alert
time.sleep(2)

# Check if the alert is displayed
alert = driver.switch_to.alert
assert alert.text == "Settings saved", "Settings not saved correctly"
alert.accept()

# Close the browser
driver.quit()

print("Test completed successfully, no errors.")
