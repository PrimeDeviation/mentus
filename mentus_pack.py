import os
import shutil
import json
import zipfile
from csscompressor import compress as compress_css
from jsmin import jsmin

# Define source and destination directories
source_dir = '.'  # Current directory
dest_dir = './mentus-packaged'
zip_name = os.path.join(source_dir, 'mentus-extension.zip')

# Define files and directories to include
files_to_include = [
    'manifest.json',
    'background.js',
    'components',
    'images',
    'lib',
    'styles',
    'public',
    'utils'
]

# Create destination directory
os.makedirs(dest_dir, exist_ok=True)

def minify_js(content):
    return jsmin(content)

def minify_css(content):
    return compress_css(content)

def copy_and_minify(src, dest):
    if os.path.isfile(src):
        with open(src, 'r', encoding='utf-8') as file:
            content = file.read()
        
        if src.endswith('.js'):
            content = minify_js(content)
        elif src.endswith('.css'):
            content = minify_css(content)
        
        with open(dest, 'w', encoding='utf-8') as file:
            file.write(content)
    else:
        if os.path.exists(dest):
            shutil.rmtree(dest)
        shutil.copytree(src, dest)

# Copy and minify files
for item in files_to_include:
    src = os.path.join(source_dir, item)
    dest = os.path.join(dest_dir, item)
    copy_and_minify(src, dest)

# Update manifest.json if needed
manifest_path = os.path.join(dest_dir, 'manifest.json')
with open(manifest_path, 'r', encoding='utf-8') as file:
    manifest = json.load(file)

# Create zip file
with zipfile.ZipFile(zip_name, 'w', zipfile.ZIP_DEFLATED) as zipf:
    for root, _, files in os.walk(dest_dir):
        for file in files:
            file_path = os.path.join(root, file)
            arcname = os.path.relpath(file_path, dest_dir)
            zipf.write(file_path, arcname)

print(f"Extension packaged and zipped as {zip_name}")
