import tkinter as tk
from tkinter import filedialog, messagebox, ttk
from tkinter.scrolledtext import ScrolledText
import os
import pytesseract
import fitz  # PyMuPDF
import docx
from pdf2image import convert_from_path
from PIL import Image
from google.cloud import vision
import io

# Ensure Tesseract is installed and added to PATH
# Ensure Google Vision credentials are set in environment
os.environ["GOOGLE_APPLICATION_CREDENTIALS"] = "skoolme-ocr-b933da63cd81.json"

class OCRApp:
    def __init__(self, root):
        self.root = root
        self.root.title("Document OCR Analyzer")

        self.file_paths = []

        self.upload_button = tk.Button(root, text="Upload Files", command=self.upload_files)
        self.upload_button.pack(pady=5)

        self.file_listbox = tk.Listbox(root, selectmode=tk.SINGLE, width=80)
        self.file_listbox.pack(pady=5)

        self.analyze_button = tk.Button(root, text="Analyze", command=self.start_analysis)
        self.analyze_button.pack(pady=5)

        self.use_google_var = tk.IntVar()
        self.google_checkbox = tk.Checkbutton(root, text="Use Google Vision OCR", variable=self.use_google_var)
        self.google_checkbox.pack(pady=5)

        self.progress_label = tk.Label(root, text="Status: Waiting...")
        self.progress_label.pack(pady=5)

        self.result_text = ScrolledText(root, height=20, width=100, wrap=tk.WORD)
        self.result_text.pack(pady=5)

    def upload_files(self):
        filetypes = [
            ("Documents", "*.pdf *.docx *.txt *.png *.jpg *.jpeg *.bmp")
        ]
        self.file_paths = filedialog.askopenfilenames(filetypes=filetypes)
        self.file_listbox.delete(0, tk.END)
        for file in self.file_paths:
            self.file_listbox.insert(tk.END, os.path.basename(file) + " - ⏳")

    def start_analysis(self):
        self.result_text.delete(1.0, tk.END)
        for index, file_path in enumerate(self.file_paths):
            filename = os.path.basename(file_path)
            self.update_listbox_status(index, f"{filename} - 🔄 Processing...")
            self.progress_label.config(text=f"Analyzing {filename}...")
            self.root.update()
            try:
                text = self.extract_text(file_path)
                extraction_score = self.calculate_extraction_score(text)
                color = self.get_score_color(extraction_score)
                self.result_text.insert(tk.END, f"[{filename}]\nExtraction Score: {extraction_score:.2f}% ({color})\n{text}\n{'-'*50}\n")
                self.update_listbox_status(index, f"{filename} - ✅ Done")
            except Exception as e:
                self.result_text.insert(tk.END, f"[{filename}]\nError: {e}\n{'-'*50}\n")
                self.update_listbox_status(index, f"{filename} - ❌ Error")
        self.progress_label.config(text="All analysis complete.")

    def update_listbox_status(self, index, status_text):
        self.file_listbox.delete(index)
        self.file_listbox.insert(index, status_text)

    def extract_text(self, file_path):
        if file_path.lower().endswith(".pdf"):
            return self.extract_from_pdf(file_path)
        elif file_path.lower().endswith(".docx"):
            return self.extract_from_docx(file_path)
        elif file_path.lower().endswith(".txt"):
            return self.extract_from_txt(file_path)
        else:
            return self.extract_from_image(file_path)

    def extract_from_pdf(self, file_path):
        text = ""
        doc = fitz.open(file_path)
        for page in doc:
            page_text = page.get_text()
            if page_text.strip():
                text += page_text
        if not text.strip():
            # fallback to OCR
            images = convert_from_path(file_path)
            for img in images:
                if self.use_google_var.get():
                    text += self.ocr_with_google(img)
                else:
                    text += pytesseract.image_to_string(img)
        return text

    def extract_from_docx(self, file_path):
        doc = docx.Document(file_path)
        return '\n'.join([para.text for para in doc.paragraphs])

    def extract_from_txt(self, file_path):
        with open(file_path, 'r', encoding='utf-8') as f:
            return f.read()

    def extract_from_image(self, file_path):
        image = Image.open(file_path)
        if self.use_google_var.get():
            return self.ocr_with_google(image)
        else:
            return pytesseract.image_to_string(image)

    def ocr_with_google(self, image):
        client = vision.ImageAnnotatorClient()
        buffered = io.BytesIO()
        image.save(buffered, format="PNG")
        image_content = buffered.getvalue()

        image = vision.Image(content=image_content)
        response = client.document_text_detection(image=image)
        return response.full_text_annotation.text if response.full_text_annotation else ""

    def calculate_extraction_score(self, text):
        total_chars = len(text.strip())
        return min(100, (total_chars / 1000) * 100) if total_chars > 0 else 0

    def get_score_color(self, score):
        if score >= 80:
            return "Green - Good"
        elif score >= 30:
            return "Yellow - Partial"
        else:
            return "Red - Poor"

if __name__ == "__main__":
    root = tk.Tk()
    app = OCRApp(root)
    root.mainloop()
