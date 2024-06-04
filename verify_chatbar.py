from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.common.keys import Keys
import time

# Set up the WebDriver (assuming Chrome)
options = webdriver.ChromeOptions()
options.add_argument('--headless')
options.add_argument('--no-sandbox')
options.add_argument('--disable-dev-shm-usage')
driver = webdriver.Chrome(options=options)

# Load the test_chatbar.html file
driver.get("file:///path/to/your/repo/PrimeDeviation__mentus/test_chatbar.html")

# Verify the presence of the chat bar
try:
    chat_container = driver.find_element(By.ID, "chat-container")
    print("Chat bar is present.")
except:
    print("Chat bar is not present.")

# Verify responsiveness
driver.set_window_size(500, 800)  # Simulate a small screen size
time.sleep(1)  # Wait for the layout to adjust

try:
    chat_container = driver.find_element(By.ID, "chat-container")
    print("Chat bar is responsive.")
except:
    print("Chat bar is not responsive.")

driver.quit()
