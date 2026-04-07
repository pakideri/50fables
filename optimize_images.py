import os
from PIL import Image

def optimize_images(directory):
    for filename in os.listdir(directory):
        if filename.lower().endswith(('.png', '.jpg', '.jpeg')):
            filepath = os.path.join(directory, filename)
            try:
                with Image.open(filepath) as img:
                    # Convert to RGB if it's RGBA/P
                    if img.mode in ('RGBA', 'P'):
                        img = img.convert('RGB')
                    
                    # Resize if width > 1200
                    if img.width > 1200:
                        ratio = 1200 / float(img.width)
                        new_height = int((float(img.height) * float(ratio)))
                        img = img.resize((1200, new_height), Image.Resampling.LANCZOS)
                        
                    # Save optimized
                    img.save(filepath, optimize=True, quality=60)
                print(f"Optimized {filename}")
            except Exception as e:
                print(f"Error optimizing {filename}: {e}")

if __name__ == "__main__":
    optimize_images('images/img')
