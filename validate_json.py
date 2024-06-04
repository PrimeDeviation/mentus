import json

with open('package.json', 'r') as file:
    try:
        data = json.load(file)
        print("JSON is valid.")
    except json.JSONDecodeError as e:
        print(f"JSON is invalid: {e}")
