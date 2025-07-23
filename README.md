# SkoolMe Backend

This is the backend API for the SkoolMe course generation system. It provides
file upload, analysis, and content processing capabilities.

## Features

- **File Upload**: Support for documents (.txt, .pdf, .docx, .png, .jpg, .jpeg,
  .bmp) and audio files (.mp3, .wav, .m4a)
- **Document Processing**: OCR and text extraction from various document formats
- **Audio Processing**: Speech-to-text transcription for audio files
- **Progress Tracking**: Real-time progress updates for file analysis
- **File Size Validation**: 100MB limit for documents, 50MB for audio files
- **Google Cloud Integration**: Uses Google Cloud Speech-to-Text and Vision APIs

## Setup Instructions

### 1. Install Dependencies

```bash
cd backend
pip install -r requirements.txt
```

### 2. Install System Dependencies

**Windows:**

- Install [Tesseract OCR](https://github.com/UB-Mannheim/tesseract/wiki)
- Add Tesseract to your system PATH
- Install [Poppler](https://github.com/oschwartz10612/poppler-windows/releases/)
  for PDF processing

**macOS:**

```bash
brew install tesseract poppler
```

**Linux (Ubuntu/Debian):**

```bash
sudo apt-get install tesseract-ocr poppler-utils
```

### 3. Google Cloud Setup

1. Create a Google Cloud project
2. Enable the following APIs:
   - Speech-to-Text API
   - Cloud Vision API
   - Cloud Storage API
3. Create a service account and download the JSON key file
4. Place the key file as `skoolme-ocr-b933da63cd81.json` in the backend
   directory

### 4. Create Google Cloud Storage Bucket

```bash
gsutil mb gs://skoolme-audio-transcripts
```

### 5. Run the Server

**For Development:**

```bash
python run_server.py
```

**For Production:**

```bash
gunicorn --bind 0.0.0.0:5000 wsgi:app
```

## API Endpoints

### Health Check

```
GET /api/health
```

Returns server status and active sessions count.

### File Upload

```
POST /api/upload
```

Upload files for analysis. Returns a session ID.

**Request:** Multipart form data with `files` field **Response:**

```json
{
    "session_id": "uuid",
    "files": [
        {
            "filename": "document.pdf",
            "original_name": "document.pdf",
            "file_type": "document",
            "size": 1024000
        }
    ],
    "message": "Successfully uploaded 1 files"
}
```

### Start Analysis

```
POST /api/analyze
```

Start analysis of uploaded files.

**Request:**

```json
{
    "session_id": "uuid"
}
```

**Response:**

```json
{
    "session_id": "uuid",
    "message": "Analysis started",
    "status": "processing"
}
```

### Get Progress

```
GET /api/progress/{session_id}
```

Get real-time analysis progress.

**Response:**

```json
{
  "status": "processing|completed|error",
  "progress": 85,
  "message": "Processing file 3 of 5...",
  "results": [...],
  "overall_score": 82.5,
  "generated_title": "Introduction to Physics",
  "error": null
}
```

### Cleanup Session

```
DELETE /api/cleanup/{session_id}
```

Clean up session files and data.

## File Processing

### Document Processing

- **PDF**: Text extraction with OCR fallback
- **DOCX**: Native text extraction
- **TXT**: Direct text reading with encoding detection
- **Images**: OCR using Google Vision API or Tesseract

### Audio Processing

- **Format Support**: MP3, WAV, M4A
- **Conversion**: Auto-converts to 16kHz mono WAV
- **Transcription**: Google Cloud Speech-to-Text with timestamps
- **Speaker Diarization**: Identifies multiple speakers

## Analysis Scoring

The system calculates extraction scores based on:

- **Content Length** (50%): Amount of text extracted
- **Word Diversity** (30%): Unique words vs total words
- **Structure** (20%): Presence of sentences and paragraphs

### Score Categories

- **80-100%**: 🟢 Green - Excellent extraction
- **30-79%**: 🟡 Yellow - Good extraction with some issues
- **0-29%**: 🔴 Red - Poor extraction, unusable content

## Error Handling

The API provides comprehensive error handling:

- File size validation
- File type validation
- Google Cloud API errors
- Processing timeouts
- Storage errors

## Production Deployment

### Environment Variables

```bash
GOOGLE_APPLICATION_CREDENTIALS=path/to/credentials.json
FLASK_ENV=production
```

### Using Docker

```dockerfile
FROM python:3.9-slim

WORKDIR /app
COPY requirements.txt .
RUN pip install -r requirements.txt

# Install system dependencies
RUN apt-get update && apt-get install -y \
    tesseract-ocr \
    poppler-utils \
    && rm -rf /var/lib/apt/lists/*

COPY . .
EXPOSE 5000

CMD ["gunicorn", "--bind", "0.0.0.0:5000", "wsgi:app"]
```

### Scaling Considerations

- Use Redis for session storage in production
- Implement file cleanup jobs
- Set up monitoring and logging
- Use cloud storage for file uploads
- Implement rate limiting

## Development Notes

### Testing

```bash
# Test file upload
curl -X POST -F "files=@test.pdf" http://localhost:5000/api/upload

# Test health check
curl http://localhost:5000/api/health
```

### Debug Mode

Set `FLASK_ENV=development` for detailed error messages and auto-reload.

### File Processing Time

- Documents: Usually < 30 seconds
- Audio files: 1-2 minutes per minute of audio
- Large files: May take longer, progress is tracked

## Security Notes

- File validation prevents malicious uploads
- Temporary files are cleaned up automatically
- Google Cloud credentials should be kept secure
- Implement authentication for production use

## Troubleshooting

### Common Issues

**Import Errors:**

- Ensure all dependencies are installed: `pip install -r requirements.txt`
- Check system dependencies (Tesseract, Poppler)

**Google Cloud Errors:**

- Verify credentials file exists and is valid
- Check API permissions and billing
- Ensure storage bucket exists

**File Processing Errors:**

- Check file format compatibility
- Verify file size limits
- Ensure sufficient disk space

### Logs

Check the console output for detailed error messages and processing status.
