from PIL import Image
import pytesseract

pytesseract.pytesseract.tesseract_cmd = r'C:\Program Files\Tesseract-OCR\tesseract.exe'
image_path = "C:\\Users\\USER\\Downloads\\Screenshot 2024-10-17 163359.png"
text = pytesseract.image_to_string(Image.open(image_path))
print(f"Extracted Text:{text}")