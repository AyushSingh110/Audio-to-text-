# Social Post Ge    url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key={GEMINI_API_KEY}"erator using Gemini API

from flask import Flask, request, jsonify
from flask_cors import CORS
import os
from dotenv import load_dotenv
import requests

load_dotenv()
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")

app = Flask(__name__)
CORS(app)

def call_gemini_api(prompt):
	url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key={GEMINI_API_KEY}"
	headers = {"Content-Type": "application/json"}
	payload = {
		"contents": [{"parts": [{"text": prompt}]}]
	}
	try:
		response = requests.post(url, headers=headers, json=payload)
		response.raise_for_status() # This will raise an error for 4xx or 5xx responses
		result = response.json()
		
		if "candidates" in result and result["candidates"]:
			content = result["candidates"][0].get("content", {})
			parts = content.get("parts", [])
			if parts and "text" in parts[0]:
				return parts[0]["text"]
		
		return "[Gemini API returned an unexpected response format.]"
	except Exception as e:
		return f"[Gemini API Error: {str(e)}] Please check your API key and model access."

def generate_post(text, post_type):
	hashtags = "#trendy #artisan #handmade #viral #colorful #engaging"
	if post_type == "instagram":
		prompt = (
			f"Create an engaging, colorful Instagram post of 10 lines with relevant content only for the following artisan content: '{text}'. "
			"Use emojis, a catchy hook, and add trendy hashtags. Make it visually appealing and audience-attracting."
		)
	elif post_type == "twitter":
		prompt = (
			f"Write a short, punchy Twitter post for this artisan content:do not include instructions '{text}'. "
			"Use relevant hashtags, a call to action, and make it engaging for followers."
		)
	elif post_type == "whatsapp":
		prompt = (
			f"Craft a friendly WhatsApp message for this artisan content with relevant content only. do not include instructions.: '{text}'. "
			"Make it personal, conversational, and encourage sharing."
		)
	elif post_type == "email":
		prompt = (
			f"Write an email campaign for this artisan content:do not include instructions '{text}'. "
			"Include a catchy subject line, engaging body, and a call to action. Make it suitable for a newsletter."
		)
	else:
		prompt = f"Generate a social media post for this content: '{text}'. do not include instructions. Add trendy hashtags."

	post = call_gemini_api(prompt)

	if post_type == "instagram":
		return f"{post}\n\n{hashtags}"
	elif post_type == "twitter":
		return f"{post} {hashtags}"
	elif post_type == "whatsapp":
		return f"WhatsApp message:\n{post}"
	elif post_type == "email":
		return f"Subject: Artisan Campaign\n\n{post}\n\n{hashtags}"
	else:
		return post


@app.route('/api/generate_post', methods=['POST'])
def api_generate_post():
	data = request.json
	text = data.get('text', '')
	post_type = data.get('post_type', 'instagram')
	post = generate_post(text, post_type)
	return jsonify({"post": post})

if __name__ == "__main__":
	app.run(debug=True, port=5000)
