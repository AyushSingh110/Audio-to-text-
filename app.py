import os
import uuid
from flask import Flask, request, jsonify
import json

# AI and audio libraries
import torch
import whisper
from transformers import pipeline
import soundfile as sf
import numpy as np
import noisereduce as nr
from keybert import KeyBERT

print("Initializing Flask app and loading AI models...")

app = Flask(__name__)

# --- Configuration for file storage ---
UPLOAD_FOLDER = 'uploads'
AUDIO_FOLDER = os.path.join(UPLOAD_FOLDER, 'audio')
DATA_FOLDER = os.path.join(UPLOAD_FOLDER, 'data')
os.makedirs(AUDIO_FOLDER, exist_ok=True)
os.makedirs(DATA_FOLDER, exist_ok=True)
app.config['AUDIO_FOLDER'] = AUDIO_FOLDER
app.config['DATA_FOLDER'] = DATA_FOLDER


device = "cuda" if torch.cuda.is_available() else "cpu"
print(f"Using device: {device}")
torch_device = 0 if device == "cuda" else -1

# Model 1: Whisper for Transcription
whisper_model = whisper.load_model("base", device=device)

# Model 2: BART for Summarization (our "About Text")
summarizer = pipeline("summarization", model="sshleifer/distilbart-cnn-12-6", device=torch_device)

# Model 3: KeyBERT (We will no longer use this for keywords)
# kw_model = KeyBERT()

# Model 4: Flan-T5 for Instruction-based Generation (UPGRADED MODEL)
generator = pipeline("text2text-generation", model="google/flan-t5-large", device=torch_device)

print("All models loaded successfully!")


# ======================================================================
# 2. UPDATED: COMPREHENSIVE CONTENT GENERATION FUNCTION
# ======================================================================
# ======================================================================
# 2. FINAL, CORRECTED: COMPREHENSIVE CONTENT GENERATION FUNCTION
# ======================================================================
def generate_structured_content(transcript):
    """
    Analyzes the transcript to generate a structured set of content.
    """
    print("-> Generating structured content from transcript...")

    # --- Task 1: Generate "About Text" (The Summary) ---
    if len(transcript.split()) < 30:
        about_text = transcript
    else:
        summary_result = summarizer(transcript, max_length=100, min_length=25, do_sample=False)
        about_text = summary_result[0]['summary_text']
    print("   - 'About Text' generated.")

    # --- Task 2: Extract Artisan Name ---
    name_prompt = f"From the following text, extract the artisan's first name. If a name is not mentioned, respond with 'Artisan'. Text: \"{transcript}\""
    # NOTE: We don't need advanced generation for this simple task.
    artisan_name = generator(name_prompt, max_new_tokens=20)[0]['generated_text']
    print(f"   - Artisan Name extracted: {artisan_name}")

    # --- Task 3: Generate a Creative Product Description (with generation controls) ---
    description_prompt = f"""
    Act as a creative copywriter. Your task is to take the key information from the artisan's transcript and write a completely original, first-person product description for a marketplace website.
    DO NOT use the exact sentences from the transcript. Rewrite everything in a more descriptive and professional tone.
    For example, if the artisan says "Each basket is made with love, strong and lasting", you could write "I pour my heart into each basket, weaving them with traditional techniques to ensure they are not only beautiful but also strong enough to last a lifetime."

    Here is the artisan's transcript: \"{transcript}\"
    """
    # ADDED a dict of generation parameters to fix the looping issue
    generation_params = {
        "max_new_tokens": 250,
        "num_beams": 4,
        "no_repeat_ngram_size": 2,
        "early_stopping": True
    }
    description = generator(description_prompt, **generation_params)[0]['generated_text']
    print("   - Creative 'Description' generated.")

    # --- Task 4: Generate Marketplace Keywords (with generation controls) ---
    keywords_prompt = f"""
    Based on the following text, generate a list of 7 to 10 commercially relevant keywords for a marketplace listing.
    The keywords should include the product type, material, style, potential uses, and origin. Separate them with commas.

    Text: \"{transcript + ' ' + description}\"
    """
    # REUSING the generation parameters to ensure high-quality, non-repetitive keywords
    keywords_raw = generator(keywords_prompt, **generation_params)[0]['generated_text']
    keyword_list = [kw.strip() for kw in keywords_raw.split(',')]
    print("   - Marketplace 'Keywords' generated.")
    
    return {
        "artisan_name": artisan_name,
        "about_text": about_text,
        "description": description,
        "keywords": keyword_list
    }


# ======================================================================
# 3. MAIN API ROUTE (No changes needed here)
# ======================================================================
@app.route('/process-audio-upload', methods=['POST'])
def process_audio_upload():
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

        # --- Step 1: Process Audio ---
        audio_data, rate = sf.read(audio_filepath)
        if audio_data.ndim > 1:
            audio_data = np.mean(audio_data, axis=1)
        
        reduced_noise_audio = nr.reduce_noise(y=audio_data, sr=rate)
        cleaned_filepath = os.path.join(app.config['AUDIO_FOLDER'], f"cleaned_{audio_filename}")
        sf.write(cleaned_filepath, reduced_noise_audio, rate)

        transcription_result = whisper_model.transcribe(cleaned_filepath)
        transcript = transcription_result['text'].strip()
        os.remove(cleaned_filepath)
        print("-> Audio processing and transcription complete.")

        # --- Step 2: Generate All Content ---
        structured_content = generate_structured_content(transcript)

        # --- Step 3: Store Results and Send Response ---
        final_data = {
            "id": unique_id,
            "transcript": transcript,
            "content": structured_content,
            "audio_path": audio_filepath
        }
        
        data_filepath = os.path.join(app.config['DATA_FOLDER'], f"{unique_id}.json")
        with open(data_filepath, 'w') as f:
            json.dump(final_data, f, indent=4)
        print(f"-> All generated data saved to {data_filepath}")
        
        return jsonify(final_data), 200

    except Exception as e:
        print(f"An error occurred: {e}")
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True, port=5000)