Vision

OpenAI
Learn how to use vision capabilities to understand images.

Introduction
GPT-4o, GPT-4o mini, and GPT-4 Turbo have vision capabilities, meaning the models can take in images and answer questions about them. Historically, language model systems have been limited by taking in a single input modality, text.

Quickstart
Images are made available to the model in two main ways: by passing a link to the image or by passing the base64 encoded image directly in the request. Images can be passed in the user messages.

What's in this image?
python

python
from openai import OpenAI

client = OpenAI()

response = client.chat.completions.create(
  model="gpt-4o-mini",
  messages=[
    {
      "role": "user",
      "content": [
        {"type": "text", "text": "What’s in this image?"},
        {
          "type": "image_url",
          "image_url": {
            "url": "https://upload.wikimedia.org/wikipedia/commons/thumb/d/dd/Gfp-wisconsin-madison-the-nature-boardwalk.jpg/2560px-Gfp-wisconsin-madison-the-nature-boardwalk.jpg",
          },
        },
      ],
    }
  ],
  max_tokens=300,
)

print(response.choices[0])
The model is best at answering general questions about what is present in the images. While it does understand the relationship between objects in images, it is not yet optimized to answer detailed questions about the location of certain objects in an image. For example, you can ask it what color a car is or what some ideas for dinner might be based on what is in you fridge, but if you show it an image of a room and ask it where the chair is, it may not answer the question correctly.

It is important to keep in mind the limitations of the model as you explore what use-cases visual understanding can be applied to.

Video understanding with vision
Learn how to use use GPT-4 with Vision to understand videos in the OpenAI Cookbook

Uploading base 64 encoded images
If you have an image or set of images locally, you can pass those to the model in base 64 encoded format, here is an example of this in action:

import base64
import requests

# OpenAI API Key
api_key = "YOUR_OPENAI_API_KEY"

# Function to encode the image
def encode_image(image_path):
  with open(image_path, "rb") as image_file:
    return base64.b64encode(image_file.read()).decode('utf-8')

# Path to your image
image_path = "path_to_your_image.jpg"

# Getting the base64 string
base64_image = encode_image(image_path)

headers = {
  "Content-Type": "application/json",
  "Authorization": f"Bearer {api_key}"
}

payload = {
  "model": "gpt-4o-mini",
  "messages": [
    {
      "role": "user",
      "content": [
        {
          "type": "text",
          "text": "What’s in this image?"
        },
        {
          "type": "image_url",
          "image_url": {
            "url": f"data:image/jpeg;base64,{base64_image}"
          }
        }
      ]
    }
  ],
  "max_tokens": 300
}

response = requests.post("https://api.openai.com/v1/chat/completions", headers=headers, json=payload)

print(response.json())
Multiple image inputs
The Chat Completions API is capable of taking in and processing multiple image inputs in both base64 encoded format or as an image URL. The model will process each image and use the information from all of them to answer the question.

Multiple image inputs
python

python
from openai import OpenAI

client = OpenAI()
response = client.chat.completions.create(
  model="gpt-4o-mini",
  messages=[
    {
      "role": "user",
      "content": [
        {
          "type": "text",
          "text": "What are in these images? Is there any difference between them?",
        },
        {
          "type": "image_url",
          "image_url": {
            "url": "https://upload.wikimedia.org/wikipedia/commons/thumb/d/dd/Gfp-wisconsin-madison-the-nature-boardwalk.jpg/2560px-Gfp-wisconsin-madison-the-nature-boardwalk.jpg",
          },
        },
        {
          "type": "image_url",
          "image_url": {
            "url": "https://upload.wikimedia.org/wikipedia/commons/thumb/d/dd/Gfp-wisconsin-madison-the-nature-boardwalk.jpg/2560px-Gfp-wisconsin-madison-the-nature-boardwalk.jpg",
          },
        },
      ],
    }
  ],
  max_tokens=300,
)
print(response.choices[0])
Here the model is shown two copies of the same image and can answer questions about both or each of the images independently.

Low or high fidelity image understanding
By controlling the detail parameter, which has three options, low, high, or auto, you have control over how the model processes the image and generates its textual understanding. By default, the model will use the auto setting which will look at the image input size and decide if it should use the low or high setting.

low will enable the "low res" mode. The model will receive a low-res 512px x 512px version of the image, and represent the image with a budget of 85 tokens. This allows the API to return faster responses and consume fewer input tokens for use cases that do not require high detail.
high will enable "high res" mode, which first allows the model to first see the low res image (using 85 tokens) and then creates detailed crops using 170 tokens for each 512px x 512px tile.
Choosing the detail level
python

python
from openai import OpenAI

client = OpenAI()

response = client.chat.completions.create(
  model="gpt-4o-mini",
  messages=[
    {
      "role": "user",
      "content": [
        {"type": "text", "text": "What’s in this image?"},
        {
          "type": "image_url",
          "image_url": {
            "url": "https://upload.wikimedia.org/wikipedia/commons/thumb/d/dd/Gfp-wisconsin-madison-the-nature-boardwalk.jpg/2560px-Gfp-wisconsin-madison-the-nature-boardwalk.jpg",
            "detail": "high"
          },
        },
      ],
    }
  ],
  max_tokens=300,
)

print(response.choices[0].message.content)
Managing images
The Chat Completions API, unlike the Assistants API, is not stateful. That means you have to manage the messages (including images) you pass to the model yourself. If you want to pass the same image to the model multiple times, you will have to pass the image each time you make a request to the API.

For long running conversations, we suggest passing images via URL's instead of base64. The latency of the model can also be improved by downsizing your images ahead of time to be less than the maximum size they are expected them to be. For low res mode, we expect a 512px x 512px image. For high res mode, the short side of the image should be less than 768px and the long side should be less than 2,000px.

After an image has been processed by the model, it is deleted from OpenAI servers and not retained. We do not use data uploaded via the OpenAI API to train our models.

Limitations
While GPT-4 with vision is powerful and can be used in many situations, it is important to understand the limitations of the model. Here are some of the limitations we are aware of:

Medical images: The model is not suitable for interpreting specialized medical images like CT scans and shouldn't be used for medical advice.
Non-English: The model may not perform optimally when handling images with text of non-Latin alphabets, such as Japanese or Korean.
Small text: Enlarge text within the image to improve readability, but avoid cropping important details.
Rotation: The model may misinterpret rotated / upside-down text or images.
Visual elements: The model may struggle to understand graphs or text where colors or styles like solid, dashed, or dotted lines vary.
Spatial reasoning: The model struggles with tasks requiring precise spatial localization, such as identifying chess positions.
Accuracy: The model may generate incorrect descriptions or captions in certain scenarios.
Image shape: The model struggles with panoramic and fisheye images.
Metadata and resizing: The model doesn't process original file names or metadata, and images are resized before analysis, affecting their original dimensions.
Counting: May give approximate counts for objects in images.
CAPTCHAS: For safety reasons, we have implemented a system to block the submission of CAPTCHAs.
Calculating costs
Image inputs are metered and charged in tokens, just as text inputs are. The token cost of a given image is determined by two factors: its size, and the detail option on each image_url block. All images with detail: low cost 85 tokens each. detail: high images are first scaled to fit within a 2048 x 2048 square, maintaining their aspect ratio. Then, they are scaled such that the shortest side of the image is 768px long. Finally, we count how many 512px squares the image consists of. Each of those squares costs 170 tokens. Another 85 tokens are always added to the final total.

Here are some examples demonstrating the above.

A 1024 x 1024 square image in detail: high mode costs 765 tokens
1024 is less than 2048, so there is no initial resize.
The shortest side is 1024, so we scale the image down to 768 x 768.
4 512px square tiles are needed to represent the image, so the final token cost is 170 * 4 + 85 = 765.
A 2048 x 4096 image in detail: high mode costs 1105 tokens
We scale down the image to 1024 x 2048 to fit within the 2048 square.
The shortest side is 1024, so we further scale down to 768 x 1536.
6 512px tiles are needed, so the final token cost is 170 * 6 + 85 = 1105.
A 4096 x 8192 image in detail: low most costs 85 tokens
Regardless of input size, low detail images are a fixed cost.
FAQ
Can I fine-tune the image capabilities in gpt-4?
No, we do not support fine-tuning the image capabilities of gpt-4 at this time.

Can I use gpt-4 to generate images?
No, you can use dall-e-3 to generate images and gpt-4o, gpt-4o-mini or gpt-4-turbo to understand images.

What type of files can I upload?
We currently support PNG (.png), JPEG (.jpeg and .jpg), WEBP (.webp), and non-animated GIF (.gif).

Is there a limit to the size of the image I can upload?
Yes, we restrict image uploads to 20MB per image.

Can I delete an image I uploaded?
No, we will delete the image for you automatically after it has been processed by the model.

Where can I learn more about the considerations of GPT-4 with Vision?
You can find details about our evaluations, preparation, and mitigation work in the GPT-4 with Vision system card.

We have further implemented a system to block the submission of CAPTCHAs.

How do rate limits for GPT-4 with Vision work?
We process images at the token level, so each image we process counts towards your tokens per minute (TPM) limit. See the calculating costs section for details on the formula used to determine token count per image.

Can GPT-4 with Vision understand image metadata?
No, the model does not receive image metadata.

What happens if my image is unclear?
If an image is ambiguous or unclear, the model will do its best to interpret it. However, the results may be less accurate. A good rule of thumb is that if an average human cannot see the info in an image at the resolutions used in low/high res mode, then the model cannot either.

Build with Claude
Vision
The Claude 3 family of models comes with new vision capabilities that allow Claude to understand and analyze images, opening up exciting possibilities for multimodal interaction.

This guide describes how to work with images in Claude, including best practices, code examples, and limitations to keep in mind.

​
How to use vision
Use Claude’s vision capabilities via:

claude.ai. Upload an image like you would a file, or drag and drop an image directly into the chat window.
The Console Workbench. If you select a model that accepts images (Claude 3 models only), a button to add images appears at the top right of every User message block.
API request. See the examples in this guide.
​
Before you upload
​
Evaluate image size
You can include multiple images in a single request (up to 5 for claude.ai and 100 for API requests). Claude will analyze all provided images when formulating its response. This can be helpful for comparing or contrasting images.

For optimal performance, we recommend resizing images before uploading if they exceed size or token limits. If your image’s long edge is more than 1568 pixels, or your image is more than ~1,600 tokens, it will first be scaled down, preserving aspect ratio, until it’s within the size limits.

If your input image is too large and needs to be resized, it will increase latency of time-to-first-token, without giving you any additional model performance. Very small images under 200 pixels on any given edge may degrade performance.

To improve time-to-first-token, we recommend resizing images to no more than 1.15 megapixels (and within 1568 pixels in both dimensions).
Here is a table of maximum image sizes accepted by our API that will not be resized for common aspect ratios. With the Claude 3.5 Sonnet model, these images use approximately 1,600 tokens and around $4.80/1K images.

Aspect ratio	Image size
1:1	1092x1092 px
3:4	951x1268 px
2:3	896x1344 px
9:16	819x1456 px
1:2	784x1568 px
​
Calculate image costs
Each image you include in a request to Claude counts towards your token usage. To calculate the approximate cost, multiply the approximate number of image tokens by the per-token price of the model you’re using.

If your image does not need to be resized, you can estimate the number of tokens used through this algorithm: tokens = (width px * height px)/750

Here are examples of approximate tokenization and costs for different image sizes within our API’s size constraints based on Claude 3.5 Sonnet per-token price of $3 per million input tokens:

Image size	# of Tokens	Cost / image	Cost / 1K images
200x200 px(0.04 megapixels)	~54	~$0.00016	~$0.16
1000x1000 px(1 megapixel)	~1334	~$0.004	~$4.00
1092x1092 px(1.19 megapixels)	~1590	~$0.0048	~$4.80
​
Ensuring image quality
When providing images to Claude, keep the following in mind for best results:

Image format: Use a supported image format: JPEG, PNG, GIF, or WebP.
Image clarity: Ensure images are clear and not too blurry or pixelated.
Text: If the image contains important text, make sure it’s legible and not too small. Avoid cropping out key visual context just to enlarge the text.
​
Prompt examples
Many of the prompting techniques that work well for text-based interactions with Claude can also be applied to image-based prompts.

These examples demonstrate best practice prompt structures involving images.

Just as with document-query placement, Claude works best when images come before text. Images placed after text or interpolated with text will still perform well, but if your use case allows it, we recommend an image-then-text structure.
​
About the prompt examples
These prompt examples use the Anthropic Python SDK, and fetch images from Wikipedia using the httpx library. You can use any image source.

The example prompts use these variables.

Python

import base64
import httpx

image1_url = "https://upload.wikimedia.org/wikipedia/commons/a/a7/Camponotus_flavomarginatus_ant.jpg"
image1_media_type = "image/jpeg"
image1_data = base64.b64encode(httpx.get(image1_url).content).decode("utf-8")

image2_url = "https://upload.wikimedia.org/wikipedia/commons/b/b5/Iridescent.green.sweat.bee1.jpg"
image2_media_type = "image/jpeg"
image2_data = base64.b64encode(httpx.get(image2_url).content).decode("utf-8")
To utilize images when making an API request, you can provide images to Claude as a base64-encoded image in image content blocks. Here is simple example in Python showing how to include a base64-encoded image in a Messages API request:

Python

import anthropic

client = anthropic.Anthropic()
message = client.messages.create(
    model="claude-3-5-sonnet-20240620",
    max_tokens=1024,
    messages=[
        {
            "role": "user",
            "content": [
                {
                    "type": "image",
                    "source": {
                        "type": "base64",
                        "media_type": image1_media_type,
                        "data": image1_data,
                    },
                },
                {
                    "type": "text",
                    "text": "Describe this image."
                }
            ],
        }
    ],
)
print(message)
See Messages API examples for more example code and parameter details.


Example: One image


Example: Multiple images


Example: Multiple images with a system prompt


Example: Four images across two conversation turns

​
Limitations
While Claude’s image understanding capabilities are cutting-edge, there are some limitations to be aware of:

People identification: Claude cannot be used to identify (i.e., name) people in images and will refuse to do so.
Accuracy: Claude may hallucinate or make mistakes when interpreting low-quality, rotated, or very small images under 200 pixels.
Spatial reasoning: Claude’s spatial reasoning abilities are limited. It may struggle with tasks requiring precise localization or layouts, like reading an analog clock face or describing exact positions of chess pieces.
Counting: Claude can give approximate counts of objects in an image but may not always be precisely accurate, especially with large numbers of small objects.
AI generated images: Claude does not know if an image is AI-generated and may be incorrect if asked. Do not rely on it to detect fake or synthetic images.
Inappropriate content: Claude will not process inappropriate or explicit images that violate our Acceptable Use Policy.
Healthcare applications: While Claude can analyze general medical images, it is not designed to interpret complex diagnostic scans such as CTs or MRIs. Claude’s outputs should not be considered a substitute for professional medical advice or diagnosis.
Always carefully review and verify Claude’s image interpretations, especially for high-stakes use cases. Do not use Claude for tasks requiring perfect precision or sensitive image analysis without human oversight.

