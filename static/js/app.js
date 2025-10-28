// Image Analysis & Tagging System - Main JavaScript

class ImageTaggingSystem {
    constructor() {
        this.currentImage = null;
        this.currentTags = [];
        this.taggedImages = [];
        this.commonTags = [
            'person', 'people', 'outdoor', 'indoor', 'nature', 'landscape',
            'animal', 'cat', 'dog', 'bird', 'building', 'architecture',
            'food', 'vehicle', 'car', 'sky', 'water', 'tree', 'flower',
            'sunset', 'beach', 'mountain', 'city', 'street', 'portrait',
            'business', 'technology', 'computer', 'phone', 'abstract',
            'art', 'design', 'colorful', 'black and white', 'vintage'
        ];
        
        this.initializeElements();
        this.attachEventListeners();
        this.loadFromLocalStorage();
    }

    // Helper function to escape HTML to prevent XSS
    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    initializeElements() {
        // File input and upload
        this.imageInput = document.getElementById('imageInput');
        this.uploadArea = document.getElementById('uploadArea');
        
        // Preview
        this.previewSection = document.getElementById('previewSection');
        this.imagePreview = document.getElementById('imagePreview');
        this.removeImageBtn = document.getElementById('removeImage');
        this.imageInfo = document.getElementById('imageInfo');
        
        // Tagging
        this.taggingSection = document.getElementById('taggingSection');
        this.tagInput = document.getElementById('tagInput');
        this.addTagBtn = document.getElementById('addTagBtn');
        this.suggestions = document.getElementById('suggestions');
        this.tagsDisplay = document.getElementById('tagsDisplay');
        this.generateAutoTagsBtn = document.getElementById('generateAutoTags');
        this.autoTags = document.getElementById('autoTags');
        
        // Actions
        this.actionsSection = document.getElementById('actionsSection');
        this.saveBtn = document.getElementById('saveBtn');
        this.clearBtn = document.getElementById('clearBtn');
        
        // Gallery
        this.searchTags = document.getElementById('searchTags');
        this.loadGalleryBtn = document.getElementById('loadGallery');
        this.exportDataBtn = document.getElementById('exportData');
        this.galleryGrid = document.getElementById('galleryGrid');
    }

    attachEventListeners() {
        // Image upload
        this.imageInput.addEventListener('change', (e) => this.handleImageSelect(e));
        
        // Drag and drop
        this.uploadArea.addEventListener('dragover', (e) => this.handleDragOver(e));
        this.uploadArea.addEventListener('dragleave', (e) => this.handleDragLeave(e));
        this.uploadArea.addEventListener('drop', (e) => this.handleDrop(e));
        
        // Remove image
        this.removeImageBtn.addEventListener('click', () => this.clearAll());
        
        // Tag input
        this.tagInput.addEventListener('input', (e) => this.handleTagInput(e));
        this.tagInput.addEventListener('keydown', (e) => this.handleTagKeydown(e));
        this.addTagBtn.addEventListener('click', () => this.addTag());
        
        // Auto tags
        this.generateAutoTagsBtn.addEventListener('click', () => this.generateAutoTags());
        
        // Actions
        this.saveBtn.addEventListener('click', () => this.saveTaggedImage());
        this.clearBtn.addEventListener('click', () => this.clearAll());
        
        // Gallery
        this.loadGalleryBtn.addEventListener('click', () => this.loadGallery());
        this.exportDataBtn.addEventListener('click', () => this.exportToJSON());
        this.searchTags.addEventListener('input', (e) => this.filterGallery(e.target.value));
    }

    handleDragOver(e) {
        e.preventDefault();
        this.uploadArea.classList.add('drag-over');
    }

    handleDragLeave(e) {
        e.preventDefault();
        this.uploadArea.classList.remove('drag-over');
    }

    handleDrop(e) {
        e.preventDefault();
        this.uploadArea.classList.remove('drag-over');
        
        const files = e.dataTransfer.files;
        if (files.length > 0 && files[0].type.startsWith('image/')) {
            this.loadImage(files[0]);
        }
    }

    handleImageSelect(e) {
        const file = e.target.files[0];
        if (file && file.type.startsWith('image/')) {
            this.loadImage(file);
        }
    }

    loadImage(file) {
        if (file.size > 10 * 1024 * 1024) {
            alert('File size should not exceed 10MB');
            return;
        }

        const reader = new FileReader();
        reader.onload = (e) => {
            this.currentImage = {
                data: e.target.result,
                name: file.name,
                size: file.size,
                type: file.type,
                lastModified: file.lastModified
            };
            
            this.imagePreview.src = e.target.result;
            this.displayImageInfo();
            this.showSections();
        };
        reader.readAsDataURL(file);
    }

    displayImageInfo() {
        const sizeKB = (this.currentImage.size / 1024).toFixed(2);
        this.imageInfo.innerHTML = `
            <p><strong>Name:</strong> ${this.escapeHtml(this.currentImage.name)}</p>
            <p><strong>Size:</strong> ${this.escapeHtml(sizeKB)} KB</p>
            <p><strong>Type:</strong> ${this.escapeHtml(this.currentImage.type)}</p>
        `;
    }

    showSections() {
        this.previewSection.style.display = 'block';
        this.taggingSection.style.display = 'block';
        this.actionsSection.style.display = 'block';
    }

    handleTagInput(e) {
        const value = e.target.value.trim().toLowerCase();
        
        if (value.length > 0) {
            const filtered = this.commonTags.filter(tag => 
                tag.toLowerCase().includes(value) && !this.currentTags.includes(tag)
            );
            this.showSuggestions(filtered);
        } else {
            this.hideSuggestions();
        }
    }

    handleTagKeydown(e) {
        if (e.key === 'Enter') {
            e.preventDefault();
            this.addTag();
        } else if (e.key === ',') {
            e.preventDefault();
            this.addTag();
        }
    }

    showSuggestions(tags) {
        if (tags.length === 0) {
            this.hideSuggestions();
            return;
        }

        this.suggestions.innerHTML = tags.map(tag => {
            const escapedTag = this.escapeHtml(tag);
            return `<div class="suggestion-item" data-tag="${escapedTag}">${escapedTag}</div>`;
        }).join('');

        this.suggestions.classList.add('active');

        // Add click listeners to suggestions
        this.suggestions.querySelectorAll('.suggestion-item').forEach(item => {
            item.addEventListener('click', () => {
                this.addTag(item.dataset.tag);
                this.tagInput.value = '';
                this.hideSuggestions();
            });
        });
    }

    hideSuggestions() {
        this.suggestions.classList.remove('active');
        this.suggestions.innerHTML = '';
    }

    addTag(tag = null) {
        const tagValue = tag || this.tagInput.value.trim().toLowerCase();
        
        if (!tagValue) return;
        
        if (!this.currentTags.includes(tagValue)) {
            this.currentTags.push(tagValue);
            this.renderTags();
            this.tagInput.value = '';
            this.hideSuggestions();
        } else {
            alert('Tag already added!');
        }
    }

    removeTag(tag) {
        this.currentTags = this.currentTags.filter(t => t !== tag);
        this.renderTags();
    }

    renderTags() {
        this.tagsDisplay.innerHTML = this.currentTags.map(tag => {
            const escapedTag = this.escapeHtml(tag);
            return `
            <div class="tag">
                <span>${escapedTag}</span>
                <button class="remove-tag" data-tag="${escapedTag}">&times;</button>
            </div>
        `;
        }).join('');

        // Add click listeners to remove buttons
        this.tagsDisplay.querySelectorAll('.remove-tag').forEach(btn => {
            btn.addEventListener('click', () => this.removeTag(btn.dataset.tag));
        });
    }

    generateAutoTags() {
        if (!this.currentImage) {
            alert('Please upload an image first');
            return;
        }

        // Simulate auto-tagging based on image analysis
        // In a real system, this would use ML/AI for image recognition
        const autoGeneratedTags = this.simulateImageAnalysis();
        
        this.autoTags.innerHTML = autoGeneratedTags.map(tag => {
            const escapedTag = this.escapeHtml(tag);
            return `<div class="auto-tag" data-tag="${escapedTag}">${escapedTag}</div>`;
        }).join('');

        // Add click listeners to auto-tags
        this.autoTags.querySelectorAll('.auto-tag').forEach(tagEl => {
            tagEl.addEventListener('click', () => {
                this.addTag(tagEl.dataset.tag);
            });
        });
    }

    simulateImageAnalysis() {
        // Simulate basic image analysis
        // In production, this would connect to an AI service
        const possibleTags = [];
        
        // Random selection of relevant tags
        const categories = {
            general: ['photo', 'image', 'digital'],
            nature: ['outdoor', 'nature', 'landscape', 'sky'],
            objects: ['object', 'item', 'thing'],
            quality: ['colorful', 'bright', 'vivid']
        };

        // Randomly select tags from different categories
        Object.values(categories).forEach(category => {
            if (Math.random() > 0.5) {
                const randomTag = category[Math.floor(Math.random() * category.length)];
                if (!this.currentTags.includes(randomTag)) {
                    possibleTags.push(randomTag);
                }
            }
        });

        return possibleTags.slice(0, 5);
    }

    saveTaggedImage() {
        if (!this.currentImage) {
            alert('Please upload an image first');
            return;
        }

        if (this.currentTags.length === 0) {
            alert('Please add at least one tag');
            return;
        }

        const taggedImage = {
            id: Date.now(),
            image: this.currentImage.data,
            name: this.currentImage.name,
            tags: [...this.currentTags],
            timestamp: new Date().toISOString(),
            size: this.currentImage.size,
            type: this.currentImage.type
        };

        this.taggedImages.push(taggedImage);
        this.saveToLocalStorage();
        
        alert(`Image saved successfully with ${this.currentTags.length} tags!`);
        this.clearAll();
        this.loadGallery();
    }

    clearAll() {
        this.currentImage = null;
        this.currentTags = [];
        this.imagePreview.src = '';
        this.imageInfo.innerHTML = '';
        this.tagsDisplay.innerHTML = '';
        this.autoTags.innerHTML = '';
        this.tagInput.value = '';
        this.imageInput.value = '';
        
        this.previewSection.style.display = 'none';
        this.taggingSection.style.display = 'none';
        this.actionsSection.style.display = 'none';
        
        this.hideSuggestions();
    }

    loadGallery(filterText = '') {
        let imagesToDisplay = this.taggedImages;

        if (filterText) {
            const searchTerms = filterText.toLowerCase().split(',').map(t => t.trim());
            imagesToDisplay = this.taggedImages.filter(img => 
                searchTerms.some(term => 
                    img.tags.some(tag => tag.includes(term))
                )
            );
        }

        if (imagesToDisplay.length === 0) {
            this.galleryGrid.innerHTML = '<p style="grid-column: 1/-1; text-align: center; color: #7f8c8d;">No tagged images found</p>';
            return;
        }

        this.galleryGrid.innerHTML = imagesToDisplay.reverse().map(img => {
            const escapedName = this.escapeHtml(img.name);
            const escapedTags = img.tags.map(tag => `<span class="gallery-item-tag">${this.escapeHtml(tag)}</span>`).join('');
            return `
            <div class="gallery-item">
                <img src="${this.escapeHtml(img.image)}" alt="${escapedName}">
                <div class="gallery-item-info">
                    <strong>${escapedName}</strong>
                    <div class="gallery-item-tags">
                        ${escapedTags}
                    </div>
                    <div class="gallery-item-date">${this.escapeHtml(new Date(img.timestamp).toLocaleString())}</div>
                </div>
            </div>
        `;
        }).join('');
    }

    filterGallery(filterText) {
        this.loadGallery(filterText);
    }

    saveToLocalStorage() {
        try {
            localStorage.setItem('taggedImages', JSON.stringify(this.taggedImages));
        } catch (e) {
            console.error('Error saving to localStorage:', e);
            alert('Storage limit exceeded. Please export and clear old images.');
        }
    }

    loadFromLocalStorage() {
        try {
            const stored = localStorage.getItem('taggedImages');
            if (stored) {
                this.taggedImages = JSON.parse(stored);
                this.loadGallery();
            }
        } catch (e) {
            console.error('Error loading from localStorage:', e);
        }
    }

    exportToJSON() {
        if (this.taggedImages.length === 0) {
            alert('No images to export');
            return;
        }

        // Create export data without base64 images for lighter file
        const exportData = this.taggedImages.map(img => ({
            id: img.id,
            name: img.name,
            tags: img.tags,
            timestamp: img.timestamp,
            size: img.size,
            type: img.type,
            hasImage: true
        }));

        const dataStr = JSON.stringify(exportData, null, 2);
        const dataBlob = new Blob([dataStr], { type: 'application/json' });
        
        const url = URL.createObjectURL(dataBlob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `tagged-images-${Date.now()}.json`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
        
        alert('Data exported successfully!');
    }
}

// Initialize the application when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    const app = new ImageTaggingSystem();
    console.log('Image Analysis & Tagging System initialized');
});
