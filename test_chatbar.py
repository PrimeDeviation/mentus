from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.common.keys import Keys
import time

# Set up the WebDriver (assuming you have ChromeDriver installed and in your PATH)
driver = webdriver.Chrome()

# Open the test HTML file
driver.get("file:///PrimeDeviation__mentus/test_chatbar.html")

# Wait for the page to load
time.sleep(2)

# Find the chat input, send button, and chat messages elements
chat_input = driver.find_element(By.ID, "chat-input")
send_button = driver.find_element(By.ID, "send-button")
chat_messages = driver.find_element(By.ID, "chat-messages")

# Check if elements are found
if chat_input and send_button and chat_messages:
    print("Elements found successfully.")

    # Test the send button click event
    send_button.click()
    print("Send button clicked.")

    # Test the Enter key press event in chat input
    chat_input.send_keys("Test message")
    chat_input.send_keys(Keys.ENTER)
    print("Enter key pressed in chat input.")
else:
    print("One or more elements not found.")

# Close the browser
driver.quit()
