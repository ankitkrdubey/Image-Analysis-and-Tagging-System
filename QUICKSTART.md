# Quick Start Guide

This guide will help you get started with the Image Analysis & Tagging System.

## Installation

No installation required! Just Python 3.6+ and a web browser.

```bash
# Clone the repository
git clone https://github.com/ankitkrdubey/Image-Analysis-and-Tagging-System.git
cd Image-Analysis-and-Tagging-System

# Start the server
python3 server.py
```

Open `http://localhost:8000` in your browser.

## Basic Workflow

### 1. Upload an Image
- Click the upload area or drag and drop an image file
- Supports PNG, JPG, GIF up to 10MB

### 2. Add Tags
There are two ways to tag images:

**Manual Tagging:**
- Type a tag in the input field
- Select from auto-suggestions or press Enter/Comma
- Tags appear below with a remove button (×)

**Auto-Tagging:**
- Click "Generate Auto Tags" button
- Click on suggested tags to add them

### 3. Save Your Work
- Click "Save Tagged Image" when done
- Image is stored in browser localStorage and can be exported

### 4. View Gallery
- Click "Load Gallery" to see all tagged images
- Use search box to filter by tags
- Click "Export JSON" to download data

## Python Backend Examples

### View Statistics
```bash
python3 image_analyzer.py --stats
```

### Search Images
```bash
python3 image_analyzer.py --search nature landscape
```

### List All Images
```bash
python3 image_analyzer.py --list
```

### Export Data
```bash
python3 image_analyzer.py --export
```

### Import Data
```bash
python3 image_analyzer.py --import data/export_file.json
```

## Tips

- **Tag Consistency**: Use lowercase tags for better consistency
- **Multiple Tags**: Separate tags with commas or press Enter after each
- **Regular Exports**: Export your data regularly to avoid localStorage limits
- **Search**: Use comma-separated terms in search (e.g., "nature, landscape")
- **Keyboard Shortcuts**: Enter or Comma key to add tags quickly

## Common Use Cases

### 1. Photo Organization
Tag personal photos by location, people, events, or themes.

### 2. Dataset Preparation
Create labeled datasets for machine learning projects.

### 3. Content Management
Organize and categorize digital assets for projects.

### 4. Research Projects
Annotate images for academic or scientific research.

## Troubleshooting

**Port already in use?**
```bash
# Change the PORT variable in server.py
PORT = 8080  # or any other available port
```

**Storage limit exceeded?**
- Export your current data
- Clear browser localStorage
- Use Python backend for larger datasets

**Images not appearing in gallery?**
- Click "Load Gallery" button to refresh
- Check browser console for errors
- Verify localStorage is enabled

## Next Steps

1. Try uploading and tagging a few images
2. Experiment with the auto-tag feature
3. Search and filter your tagged images
4. Export your data to JSON
5. Explore the Python backend capabilities

Enjoy organizing your images! 🎨📸
