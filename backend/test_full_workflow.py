#!/usr/bin/env python3
"""
Test the complete Reelixx workflow
"""
import requests
import json
import time
import sys

BACKEND_URL = "http://localhost:8000"

def test_health():
    """Test backend health"""
    print("🔍 Testing backend health...")
    response = requests.get(f"{BACKEND_URL}/health")
    print(f"Health endpoint: {response.json()}")
    return response.ok

def test_create_project():
    """Test creating a project"""
    print("\n📝 Testing project creation...")
    payload = {
        "title": "Test Campaign",
        "product_url": "https://example.com/test-product",
        "brief": {
            "title": "Test Product",
            "description": "A test product for verification",
            "price": "99",
            "brand": "TestBrand"
        },
        "brand": {
            "name": "TestBrand",
            "color": "#7C3AED"
        }
    }
    response = requests.post(f"{BACKEND_URL}/projects", json=payload)
    print(f"Create project response: {response.status_code}")
    if response.ok:
        project = response.json()
        print(f"Project ID: {project.get('id')}")
        return project.get('id')
    else:
        print(f"Error: {response.text}")
    return None

def test_generate_variant(project_id):
    """Test generating a variant"""
    print(f"\n✨ Testing variant generation for project {project_id}...")
    payload = {
        "n_variants": 1,
        "tones": ["professional"],
        "persona": "enthusiastic"
    }
    response = requests.post(f"{BACKEND_URL}/projects/{project_id}/generate", json=payload)
    print(f"Generate variant response: {response.status_code}")
    if response.ok:
        job = response.json()
        print(f"Job ID: {job.get('id')}, Status: {job.get('status')}")
        return job.get('id')
    else:
        print(f"Error: {response.text}")
    return None

def test_get_latest_variant(project_id):
    """Test getting latest variant"""
    print(f"\n📊 Testing getting latest variant for project {project_id}...")
    response = requests.get(f"{BACKEND_URL}/projects/{project_id}/variants/latest")
    if response.ok:
        variant = response.json()
        print(f"Variant ID: {variant.get('id')}")
        print(f"Has script: {bool(variant.get('script_json'))}")
        print(f"Has storyboard: {bool(variant.get('storyboard_json'))}")
        return variant
    else:
        print(f"Error: {response.text}")
    return None

def test_assemble_variant(variant_id):
    """Test assembling video from variant"""
    print(f"\n🎬 Testing video assembly for variant {variant_id}...")
    response = requests.post(f"{BACKEND_URL}/variants/{variant_id}/assemble")
    if response.ok:
        result = response.json()
        print(f"Assembly successful: {result.get('mp4_url')}")
        return result
    else:
        print(f"Error: {response.text}")
    return None

def main():
    print("🚀 Starting Reelixx Full Workflow Test\n")
    
    # Test 1: Health check
    if not test_health():
        print("❌ Health check failed")
        sys.exit(1)
    print("✅ Health check passed")
    
    # Test 2: Create project
    project_id = test_create_project()
    if not project_id:
        print("❌ Project creation failed")
        sys.exit(1)
    print("✅ Project created")
    
    # Test 3: Generate variant
    job_id = test_generate_variant(project_id)
    if not job_id:
        print("❌ Variant generation failed")
        sys.exit(1)
    print("✅ Variant generated")
    
    # Wait a moment for processing
    time.sleep(1)
    
    # Test 4: Get latest variant
    variant = test_get_latest_variant(project_id)
    if not variant:
        print("❌ Getting latest variant failed")
        sys.exit(1)
    print("✅ Got latest variant")
    
    # Test 5: Assemble video
    variant_id = variant.get('id')
    assembly_result = test_assemble_variant(variant_id)
    if not assembly_result:
        print("❌ Video assembly failed")
        sys.exit(1)
    print("✅ Video assembled")
    
    print("\n🎉 All tests passed!")

if __name__ == "__main__":
    main()

