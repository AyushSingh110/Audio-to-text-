import os
import soundfile as sf
import numpy as np
import noisereduce as nr
import whisper
from transformers import pipeline
import torch


AUDIO_FILE_PATH = "noisy_speech.mp3" 
# Can choose 'tiny', 'base', 'small', 'medium', 'large'. 'base' is a good it is faster as well as can run all the low memory device as well.
WHISPER_MODEL_SIZE = "base" 

SUMMARIZATION_MODEL = "sshleifer/distilbart-cnn-12-6"      #Pre trained summarisation model

def process_audio_file(filepath):
   
    if not os.path.exists(filepath):
        print(f"Error: The file '{filepath}' was not found.")
        return

    try:
       
        print("Loading models")
        
        # Check if a GPU is available for faster processing
        device = "cuda" if torch.cuda.is_available() else "cpu"
        print(f"Using device: {device}")

        whisper_model = whisper.load_model(WHISPER_MODEL_SIZE, device=device)
        summarizer = pipeline("summarization", model=SUMMARIZATION_MODEL, device=0 if device == "cuda" else -1)
        print("Models loaded successfully!")
        
        # Reduce or clean noise from the background
        print(f"\nProcessing audio file: {filepath}")
        print("-> Starting noise reduction...")
        
        # Load audio data using soundfile
        audio_data, rate = sf.read(filepath)
        
        # If stereo, convert to mono by averaging channels
        if audio_data.ndim > 1:
            audio_data = np.mean(audio_data, axis=1)

        # Perform noise reduction
        reduced_noise_audio = nr.reduce_noise(y=audio_data, sr=rate)
        
        cleaned_filepath = "cleaned_" + os.path.basename(filepath)
        sf.write(cleaned_filepath, reduced_noise_audio, rate)
        print(f"-> Noise reduction complete. Cleaned audio saved to '{cleaned_filepath}'")

        print("-> Starting transcription...")
        transcription_result = whisper_model.transcribe(cleaned_filepath)
        transcript = transcription_result['text'].strip()
        print("-> Transcription complete.")

        print("-> Starting summarization...")
       
        if len(transcript.split()) < 40:
            summary = "The description is too short to summarize, but here is the full text: " + transcript
            print("-> Text too short, using full transcript as summary.")
        else:
            summary_result = summarizer(transcript, max_length=150, min_length=30, do_sample=False)
            summary = summary_result[0]['summary_text']
            print("-> Summarization complete.")
        
        # --- STEP 5: DISPLAY RESULTS & CLEAN UP ---
        print("\n" + "="*50)
        print("           PROCESSING RESULTS")
        print("="*50)
        
        print("\n--- FULL TRANSCRIPT ---")
        print(transcript)
        
        print("\n--- GENERATED SUMMARY ---")
        print(summary)
        print("\n" + "="*50)
        
      

    except Exception as e:
        print(f"\nAn unexpected error occurred: {e}")

        if 'cleaned_filepath' in locals() and os.path.exists(cleaned_filepath):
            os.remove(cleaned_filepath)

if __name__ == '__main__':
    process_audio_file(AUDIO_FILE_PATH)