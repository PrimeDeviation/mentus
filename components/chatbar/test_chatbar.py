from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.common.keys import Keys
import time

# Set up the WebDriver (using Chrome in this example)
options = webdriver.ChromeOptions()
options.add_argument('--headless')
options.add_argument('--no-sandbox')
options.add_argument('--disable-dev-shm-usage')
driver = webdriver.Chrome(options=options)

try:
    # Open the test_chatbar.html file
    driver.get(f'file://{__file__.rsplit("/", 1)[0]}/test_chatbar.html')

    # Wait for the chat input to be visible
    chat_input = driver.find_element(By.ID, 'chat-input')
    time.sleep(1)  # Wait for the element to be fully loaded

    # Type a message and click send
    chat_input.send_keys('Hello, world!')
    send_button = driver.find_element(By.ID, 'send-button')
    send_button.click()

    # Wait for the message to appear in the chat
    time.sleep(1)  # Wait for the message to be appended
    messages = driver.find_elements(By.CLASS_NAME, 'message')
    assert len(messages) > 0, "No messages found in the chat history."

    print('Test completed successfully.')

finally:
    driver.quit()
