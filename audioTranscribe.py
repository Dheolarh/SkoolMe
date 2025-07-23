import os
import threading
import time
from tkinter import Tk, filedialog, Button, Text, Label, Scrollbar, END, RIGHT, Y
from datetime import timedelta
from collections import defaultdict

from pydub import AudioSegment
from google.cloud import speech_v1p1beta1 as speech
from google.cloud import storage

# === CONFIG ===
GCS_BUCKET_NAME = "skoolme-audio-transcripts"
GOOGLE_APPLICATION_CREDENTIALS = "skoolme-ocr-b933da63cd81.json"
os.environ["GOOGLE_APPLICATION_CREDENTIALS"] = GOOGLE_APPLICATION_CREDENTIALS

# === GUI SETUP ===
root = Tk()
root.title("Audio Transcriber")
root.geometry("700x500")

label = Label(root, text="Upload your audio file:")
label.pack()

transcript_display = Text(root, wrap='word')
scrollbar = Scrollbar(root, command=transcript_display.yview)
transcript_display.config(yscrollcommand=scrollbar.set)
scrollbar.pack(side=RIGHT, fill=Y)
transcript_display.pack(expand=True, fill='both')

selected_file_path = ""

def update_status(message):
    transcript_display.insert(END, f"{message}\n")
    transcript_display.see(END)

def select_file():
    global selected_file_path
    selected_file_path = filedialog.askopenfilename(filetypes=[("Audio Files", "*.wav *.mp3 *.m4a")])
    update_status(f"Selected file: {selected_file_path}")

select_button = Button(root, text="Select Audio File", command=select_file)
select_button.pack(pady=5)

def upload_to_gcs(local_path, bucket_name, blob_name):
    update_status("Uploading to GCS...")
    storage_client = storage.Client()
    bucket = storage_client.bucket(bucket_name)
    blob = bucket.blob(blob_name)
    blob.upload_from_filename(local_path)
    update_status("Uploaded to GCS.")
    return f"gs://{bucket_name}/{blob_name}"

def transcribe_gcs_with_progress(gcs_uri):
    update_status("Starting transcription...")
    client = speech.SpeechClient()
    audio = speech.RecognitionAudio(uri=gcs_uri)

    config = speech.RecognitionConfig(
        encoding=speech.RecognitionConfig.AudioEncoding.LINEAR16,
        sample_rate_hertz=16000,
        language_code="en-US",
        enable_word_time_offsets=True,
        enable_automatic_punctuation=True,
        model="latest_long",
    )

    operation = client.long_running_recognize(config=config, audio=audio)
    update_status("Transcribing (0%)")

    # Poll operation and simulate progress
    progress = 0
    while not operation.done():
        time.sleep(5)
        progress = min(progress + 5, 95)  # Simulate progress until done
        update_status(f"Transcribing ({progress}%)")

    result = operation.result(timeout=1000)
    update_status("Transcribing (100%)\nCompleted.")

    full_transcript = ""
    chunk_transcripts = defaultdict(list)
    chunk_duration = 120  # seconds

    for result_chunk in result.results:
        alternative = result_chunk.alternatives[0]
        for word_info in alternative.words:
            start_sec = word_info.start_time.total_seconds()
            chunk_index = int(start_sec // chunk_duration)
            chunk_transcripts[chunk_index].append((word_info.start_time, word_info.word))

    for chunk_index in sorted(chunk_transcripts):
        start_time = str(timedelta(seconds=chunk_index * chunk_duration))[:-3]
        end_time = str(timedelta(seconds=(chunk_index + 1) * chunk_duration))[:-3]
        full_transcript += f"\n\nTimestamp: {start_time} - {end_time}\n"

        chunk_text = " ".join(word for _, word in chunk_transcripts[chunk_index])
        full_transcript += chunk_text

    return full_transcript

def convert_audio_to_wav(audio_path, output_path):
    update_status("Converting to WAV...")
    audio = AudioSegment.from_file(audio_path)
    audio = audio.set_frame_rate(16000).set_channels(1)
    audio.export(output_path, format="wav")
    update_status("Conversion complete.")
    return output_path

def run_transcription():
    if not selected_file_path:
        update_status("No file selected.")
        return

    transcript_display.delete(1.0, END)
    update_status("Starting process...")

    def task():
        try:
            file_name = os.path.basename(selected_file_path)
            wav_path = os.path.splitext(file_name)[0] + "_converted.wav"

            update_status("Step 1: Converting audio...")
            converted = convert_audio_to_wav(selected_file_path, wav_path)

            update_status("Step 2: Uploading to GCS...")
            gcs_uri = upload_to_gcs(converted, GCS_BUCKET_NAME, wav_path)

            update_status("Step 3: Transcribing audio...")
            transcript = transcribe_gcs_with_progress(gcs_uri)

            transcript_display.insert(END, "\n--- Transcript ---\n")
            transcript_display.insert(END, transcript)
        except Exception as e:
            update_status(f"[ERROR] {str(e)}")

    threading.Thread(target=task).start()

transcribe_button = Button(root, text="Transcribe Audio", command=run_transcription)
transcribe_button.pack(pady=5)

root.mainloop()
