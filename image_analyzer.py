#!/usr/bin/env python3
"""
Image Analysis & Tagging System - Python Backend
Provides image processing, analysis, and data management capabilities
"""

import json
import os
import base64
from datetime import datetime
from pathlib import Path
from typing import List, Dict, Any
import hashlib


class ImageAnalyzer:
    """Handles image analysis and metadata extraction"""
    
    def __init__(self, data_dir: str = "data"):
        self.data_dir = Path(data_dir)
        self.data_dir.mkdir(exist_ok=True)
        self.tags_file = self.data_dir / "tagged_images.json"
        self.tags_db = self.data_dir / "tags_database.json"
        
    def save_tagged_image(self, image_data: Dict[str, Any]) -> bool:
        """Save a tagged image to the database"""
        try:
            images = self.load_all_images()
            
            # Add unique ID if not present
            if 'id' not in image_data:
                image_data['id'] = self._generate_id(image_data)
            
            # Add timestamp
            if 'timestamp' not in image_data:
                image_data['timestamp'] = datetime.now().isoformat()
            
            images.append(image_data)
            
            with open(self.tags_file, 'w') as f:
                json.dump(images, f, indent=2)
            
            self._update_tags_database(image_data['tags'])
            return True
        except Exception as e:
            print(f"Error saving image: {e}")
            return False
    
    def load_all_images(self) -> List[Dict[str, Any]]:
        """Load all tagged images from the database"""
        if not self.tags_file.exists():
            return []
        
        try:
            with open(self.tags_file, 'r') as f:
                return json.load(f)
        except Exception as e:
            print(f"Error loading images: {e}")
            return []
    
    def search_by_tags(self, tags: List[str]) -> List[Dict[str, Any]]:
        """Search images by tags"""
        images = self.load_all_images()
        results = []
        
        for img in images:
            img_tags = set(tag.lower() for tag in img.get('tags', []))
            search_tags = set(tag.lower() for tag in tags)
            
            if search_tags.intersection(img_tags):
                results.append(img)
        
        return results
    
    def get_image_by_id(self, image_id: str) -> Dict[str, Any]:
        """Get a specific image by ID"""
        images = self.load_all_images()
        for img in images:
            if str(img.get('id')) == str(image_id):
                return img
        return None
    
    def delete_image(self, image_id: str) -> bool:
        """Delete an image from the database"""
        try:
            images = self.load_all_images()
            images = [img for img in images if str(img.get('id')) != str(image_id)]
            
            with open(self.tags_file, 'w') as f:
                json.dump(images, f, indent=2)
            
            return True
        except Exception as e:
            print(f"Error deleting image: {e}")
            return False
    
    def get_all_tags(self) -> List[str]:
        """Get all unique tags from the database"""
        if not self.tags_db.exists():
            return []
        
        try:
            with open(self.tags_db, 'r') as f:
                data = json.load(f)
                return data.get('tags', [])
        except Exception as e:
            print(f"Error loading tags: {e}")
            return []
    
    def get_tag_statistics(self) -> Dict[str, int]:
        """Get statistics about tag usage"""
        images = self.load_all_images()
        tag_counts = {}
        
        for img in images:
            for tag in img.get('tags', []):
                tag_lower = tag.lower()
                tag_counts[tag_lower] = tag_counts.get(tag_lower, 0) + 1
        
        return dict(sorted(tag_counts.items(), key=lambda x: x[1], reverse=True))
    
    def export_to_json(self, output_file: str = None) -> str:
        """Export all data to a JSON file"""
        if output_file is None:
            output_file = f"export_{datetime.now().strftime('%Y%m%d_%H%M%S')}.json"
        
        images = self.load_all_images()
        tags_stats = self.get_tag_statistics()
        
        export_data = {
            'export_date': datetime.now().isoformat(),
            'total_images': len(images),
            'tag_statistics': tags_stats,
            'images': images
        }
        
        output_path = self.data_dir / output_file
        with open(output_path, 'w') as f:
            json.dump(export_data, f, indent=2)
        
        return str(output_path)
    
    def import_from_json(self, input_file: str) -> bool:
        """Import data from a JSON file"""
        try:
            with open(input_file, 'r') as f:
                data = json.load(f)
            
            if 'images' in data:
                images = data['images']
            else:
                images = data
            
            for img in images:
                self.save_tagged_image(img)
            
            return True
        except Exception as e:
            print(f"Error importing data: {e}")
            return False
    
    def _generate_id(self, image_data: Dict[str, Any]) -> str:
        """Generate a unique ID for an image"""
        content = f"{image_data.get('name', '')}{datetime.now().isoformat()}"
        return hashlib.md5(content.encode()).hexdigest()[:16]
    
    def _update_tags_database(self, new_tags: List[str]):
        """Update the tags database with new tags"""
        all_tags = set(self.get_all_tags())
        all_tags.update(tag.lower() for tag in new_tags)
        
        with open(self.tags_db, 'w') as f:
            json.dump({'tags': sorted(list(all_tags))}, f, indent=2)
    
    def analyze_image_basic(self, image_name: str) -> Dict[str, Any]:
        """
        Basic image analysis based on filename and extension
        In production, this would use ML models for actual image content analysis
        """
        analysis = {
            'suggested_tags': [],
            'category': 'general',
            'confidence': 0.5
        }
        
        # Simple heuristic-based analysis
        name_lower = image_name.lower()
        
        # Check for common patterns in filename
        patterns = {
            'nature': ['tree', 'flower', 'plant', 'garden', 'forest', 'nature'],
            'animal': ['cat', 'dog', 'bird', 'animal', 'pet'],
            'landscape': ['mountain', 'beach', 'ocean', 'landscape', 'scenery'],
            'people': ['person', 'people', 'portrait', 'selfie', 'group'],
            'food': ['food', 'meal', 'dish', 'recipe', 'cooking'],
            'technology': ['tech', 'computer', 'phone', 'device', 'gadget'],
            'architecture': ['building', 'house', 'architecture', 'city']
        }
        
        for category, keywords in patterns.items():
            for keyword in keywords:
                if keyword in name_lower:
                    analysis['category'] = category
                    analysis['suggested_tags'].append(category)
                    analysis['confidence'] = 0.7
                    break
        
        # Add generic tags
        if not analysis['suggested_tags']:
            analysis['suggested_tags'] = ['image', 'photo']
        
        return analysis


def main():
    """Main function for command-line usage"""
    import argparse
    
    parser = argparse.ArgumentParser(description='Image Analysis & Tagging System')
    parser.add_argument('--export', action='store_true', help='Export all data to JSON')
    parser.add_argument('--import', dest='import_file', help='Import data from JSON file')
    parser.add_argument('--stats', action='store_true', help='Show tag statistics')
    parser.add_argument('--search', nargs='+', help='Search images by tags')
    parser.add_argument('--list', action='store_true', help='List all tagged images')
    
    args = parser.parse_args()
    
    analyzer = ImageAnalyzer()
    
    if args.export:
        output = analyzer.export_to_json()
        print(f"Data exported to: {output}")
    
    elif args.import_file:
        if analyzer.import_from_json(args.import_file):
            print("Data imported successfully")
        else:
            print("Failed to import data")
    
    elif args.stats:
        stats = analyzer.get_tag_statistics()
        print("\nTag Statistics:")
        print("-" * 40)
        for tag, count in stats.items():
            print(f"{tag:20s} : {count:3d}")
        print("-" * 40)
        print(f"Total unique tags: {len(stats)}")
    
    elif args.search:
        results = analyzer.search_by_tags(args.search)
        print(f"\nFound {len(results)} images matching tags: {', '.join(args.search)}")
        for img in results:
            print(f"  - {img.get('name')} [{', '.join(img.get('tags', []))}]")
    
    elif args.list:
        images = analyzer.load_all_images()
        print(f"\nTotal tagged images: {len(images)}")
        for img in images:
            print(f"  - {img.get('name')} [{', '.join(img.get('tags', []))}]")
    
    else:
        parser.print_help()


if __name__ == '__main__':
    main()
