import html5lib
from bs4 import BeautifulSoup

# Load the settings.html file
with open("components/settings/settings.html", "r", encoding="utf-8") as file:
    html_content = file.read()

# Parse the HTML content
soup = BeautifulSoup(html_content, "html5lib")

# Check the structure and alignment of the form elements
form_groups = soup.find_all(class_="form-group")
for group in form_groups:
    label = group.find("label")
    input_field = group.find("input")
    if label and input_field:
        print(f"Label: {label.text.strip()}, Input ID: {input_field.get('id')}")

print("HTML structure and alignment check completed.")
