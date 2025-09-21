import os
import uuid
import json
from flask import Flask, request, jsonify
from flask_cors import CORS
from dotenv import load_dotenv
import requests

# AI and audio libraries
import torch
import whisper
from transformers import pipeline
import soundfile as sf
import numpy as np
import noisereduce as nr
# keybert is not used in the code, but keeping the import
from keybert import KeyBERT

# --- 1. INITIALIZATION AND CONFIGURATION ---

# Load environment variables from .env file
load_dotenv()
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")

print("Initializing Flask app and loading AI models...")

app = Flask(__name__)
CORS(app) # Enable CORS for the entire application

# --- Configuration for file storage ---
UPLOAD_FOLDER = 'artisan-upload/uploads'
AUDIO_FOLDER = os.path.join(UPLOAD_FOLDER, 'audio')
DATA_FOLDER = os.path.join(UPLOAD_FOLDER, 'data')
os.makedirs(AUDIO_FOLDER, exist_ok=True)
os.makedirs(DATA_FOLDER, exist_ok=True)
app.config['AUDIO_FOLDER'] = AUDIO_FOLDER
app.config['DATA_FOLDER'] = DATA_FOLDER

# --- AI Model Loading ---
device = "cuda" if torch.cuda.is_available() else "cpu"
print(f"Using device: {device}")
torch_device = 0 if device == "cuda" else -1

# Model 1: Whisper for Transcription
whisper_model = whisper.load_model("base", device=device)
# Model 2: BART for Summarization
summarizer = pipeline("summarization", model="sshleifer/distilbart-cnn-12-6", device=torch_device)
# Model 3: Flan-T5 for Instruction-based Generation
generator = pipeline("text2text-generation", model="google/flan-t5-large", device=torch_device)

print("All models loaded successfully!")


# --- 2. HELPER FUNCTIONS ---

def generate_structured_content(transcript):
    """
    Analyzes the transcript to generate a structured set of content using local models.
    """
    print("-> Generating structured content from transcript...")
    generation_params = {
        "max_new_tokens": 250, "num_beams": 4, "no_repeat_ngram_size": 2, "early_stopping": True
    }
    
    # Task 1: Generate "About Text" (Summary)
    if len(transcript.split()) < 30:
        about_text = transcript
    else:
        summary_result = summarizer(transcript, max_length=100, min_length=25, do_sample=False)
        about_text = summary_result[0]['summary_text']
    print("   - 'About Text' generated.")

    # Task 2: Extract Artisan Name
    name_prompt = f"From the following text, extract the artisan's first name. If a name is not mentioned, respond with 'Artisan'. Text: \"{transcript}\""
    artisan_name = generator(name_prompt, max_new_tokens=20)[0]['generated_text']
    print(f"   - Artisan Name extracted: {artisan_name}")

    # Task 3: Generate Creative Product Description
    description_prompt = f"Act as a creative copywriter. Your task is to take the key information from the artisan's transcript and write a completely original, first-person product description for a marketplace website. DO NOT use the exact sentences from the transcript. Rewrite everything in a more descriptive and professional tone. Here is the artisan's transcript: \"{transcript}\""
    description = generator(description_prompt, **generation_params)[0]['generated_text']
    print("   - Creative 'Description' generated.")

    # Task 4: Generate Marketplace Keywords
    keywords_prompt = f"Based on the following text, generate a list of 7 to 10 commercially relevant trendy keywords for a marketplace listing. The keywords should include product type, material, style, and potential uses. Separate them with commas. Text: \"{transcript + ' ' + description}\""
    keywords_raw = generator(keywords_prompt, **generation_params)[0]['generated_text']
    keyword_list = [kw.strip() for kw in keywords_raw.split(',')]
    print("   - Marketplace 'Keywords' generated.")
    
    return {
        "artisan_name": artisan_name, "about_text": about_text, "description": description, "keywords": keyword_list
    }

def call_gemini_api(prompt):
    """
    Calls the Gemini API with a given prompt and returns the text response.
    """
    if not GEMINI_API_KEY:
        return "[Configuration Error: GEMINI_API_KEY not set on the server.]"
        
    url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key={GEMINI_API_KEY}"
    headers = {"Content-Type": "application/json"}
    payload = {"contents": [{"parts": [{"text": prompt}]}]}
    
    try:
        response = requests.post(url, headers=headers, json=payload)
        response.raise_for_status()
        result = response.json()
        return result['candidates'][0]['content']['parts'][0]['text']
    except requests.exceptions.RequestException as e:
        return f"[Gemini API Error: {e}] Please check your API key and model access."
    except (KeyError, IndexError):
        return "[Gemini API returned an unexpected response format.]"


# --- 3. API ROUTES ---

@app.route('/process-audio-upload', methods=['POST'])
def process_audio_upload_route():
    """
    API route to handle audio file uploads and generate content with local models.
    """
    if 'audio_file' not in request.files:
        return jsonify({"error": "Missing audio file"}), 400
    audio_file = request.files['audio_file']
    if audio_file.filename == '':
        return jsonify({"error": "No selected audio file"}), 400

    try:
        unique_id = str(uuid.uuid4())
        audio_ext = os.path.splitext(audio_file.filename)[1]
        audio_filename = f"{unique_id}{audio_ext}"
        audio_filepath = os.path.join(app.config['AUDIO_FOLDER'], audio_filename)
        audio_file.save(audio_filepath)
        print(f"Saved original audio file: {audio_filename}")

        # Process Audio and Transcribe
        audio_data, rate = sf.read(audio_filepath)
        if audio_data.ndim > 1:
            audio_data = np.mean(audio_data, axis=1)
        reduced_noise_audio = nr.reduce_noise(y=audio_data, sr=rate)
        cleaned_filepath = os.path.join(app.config['AUDIO_FOLDER'], f"cleaned_{audio_filename}")
        sf.write(cleaned_filepath, reduced_noise_audio, rate)
        transcript = whisper_model.transcribe(cleaned_filepath)['text'].strip()
        os.remove(cleaned_filepath)
        print("-> Audio processing and transcription complete.")

        # Generate Content using local models
        structured_content = generate_structured_content(transcript)

        # Store and Respond
        final_data = {
            "id": unique_id, "transcript": transcript, "content": structured_content, "audio_path": audio_filepath
        }
        data_filepath = os.path.join(app.config['DATA_FOLDER'], f"{unique_id}.json")
        with open(data_filepath, 'w') as f:
            json.dump(final_data, f, indent=4)
        print(f"-> All generated data saved to {data_filepath}")
        
        return jsonify(final_data), 200

    except Exception as e:
        print(f"An error occurred: {e}")
        return jsonify({"error": str(e)}), 500

@app.route('/api/generate_post', methods=['POST'])
def generate_post_route():
    """
    API route to generate a social media post using the Gemini API.
    """
    data = request.json
    text = data.get('text', '')
    post_type = data.get('post_type', 'instagram')
    
    # Define prompts for Gemini
    prompts = {
        "instagram": f"Create an engaging, colorful Instagram post of 10 lines with relevant content only for the following artisan content: '{text}'. Use emojis, a catchy hook, and add trendy hashtags. Make it visually appealing and audience-attracting. Do not include instructions.",
        "twitter": f"Write a short, punchy Twitter post for this artisan content: '{text}'. Use relevant hashtags, a call to action, and make it engaging for followers. Do not include instructions.",
        "whatsapp": f"Craft a friendly WhatsApp message for this artisan content with relevant content only: '{text}'. Make it personal, conversational, and encourage sharing. Do not include instructions.",
        "email": f"Write an email campaign for this artisan content: '{text}'. Include a catchy subject line, stick to relevant content, engaging body, and a call to action. Make it suitable for a newsletter. Do not include instructions."
    }
    prompt = prompts.get(post_type, f"Generate a social media post for this content: '{text}'. Add trendy hashtags. Do not include instructions.")

    # Call the Gemini API and return the result
    post_content = call_gemini_api(prompt)
    return jsonify({"post": post_content})


# --- 4. MAIN EXECUTION ---

if __name__ == '__main__':
    app.run(debug=True, port=5000)