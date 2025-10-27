# backend/app/storage.py
from __future__ import annotations

import os
from pathlib import Path
from typing import Optional

# Optional AWS imports
try:
    import boto3
    from botocore.exceptions import ClientError
    AWS_AVAILABLE = True
except ImportError:
    AWS_AVAILABLE = False


class StorageManager:
    """Handles file storage with S3 for production and local for development"""
    
    def __init__(self):
        self.use_s3 = bool(os.getenv("AWS_ACCESS_KEY_ID")) and AWS_AVAILABLE
        self.bucket_name = os.getenv("S3_BUCKET_NAME", "reelixx-storage")
        
        if self.use_s3 and AWS_AVAILABLE:
            self.s3_client = boto3.client(
                's3',
                aws_access_key_id=os.getenv("AWS_ACCESS_KEY_ID"),
                aws_secret_access_key=os.getenv("AWS_SECRET_ACCESS_KEY"),
                region_name=os.getenv("AWS_REGION", "us-east-1")
            )
        else:
            self.s3_client = None
        
        # Local storage fallback
        self.local_storage_dir = Path(__file__).resolve().parent / "exports"
        self.local_storage_dir.mkdir(parents=True, exist_ok=True)
    
    def save_file(self, file_path: str, content: bytes) -> str:
        """Save file content and return the URL/path"""
        if self.use_s3 and self.s3_client:
            try:
                self.s3_client.put_object(
                    Bucket=self.bucket_name,
                    Key=file_path,
                    Body=content
                )
                return f"https://{self.bucket_name}.s3.amazonaws.com/{file_path}"
            except Exception as e:
                print(f"S3 upload failed: {e}")
                # Fallback to local storage
                return self._save_local(file_path, content)
        else:
            return self._save_local(file_path, content)
    
    def save_file_from_path(self, local_path: Path, s3_key: str) -> str:
        """Upload a local file to storage and return URL"""
        if self.use_s3 and self.s3_client:
            try:
                self.s3_client.upload_file(
                    str(local_path),
                    self.bucket_name,
                    s3_key
                )
                return f"https://{self.bucket_name}.s3.amazonaws.com/{s3_key}"
            except Exception as e:
                print(f"S3 upload failed: {e}")
                # Return local path as fallback
                return f"/exports/{local_path.name}"
        else:
            # Copy to exports directory for consistency
            dest_path = self.local_storage_dir / local_path.name
            import shutil
            shutil.copy2(local_path, dest_path)
            return f"/exports/{local_path.name}"
    
    def get_file_url(self, file_path: str) -> str:
        """Get the public URL for a file"""
        if self.use_s3 and self.s3_client:
            return f"https://{self.bucket_name}.s3.amazonaws.com/{file_path}"
        else:
            return f"/exports/{file_path}"
    
    def delete_file(self, file_path: str) -> bool:
        """Delete a file from storage"""
        if self.use_s3 and self.s3_client:
            try:
                self.s3_client.delete_object(Bucket=self.bucket_name, Key=file_path)
                return True
            except Exception as e:
                print(f"S3 delete failed: {e}")
                return False
        else:
            try:
                local_path = self.local_storage_dir / file_path
                if local_path.exists():
                    local_path.unlink()
                return True
            except Exception as e:
                print(f"Local delete failed: {e}")
                return False
    
    def _save_local(self, file_path: str, content: bytes) -> str:
        """Save file locally"""
        local_path = self.local_storage_dir / file_path
        local_path.parent.mkdir(parents=True, exist_ok=True)
        
        with open(local_path, 'wb') as f:
            f.write(content)
        
        return f"/exports/{file_path}"
    
    def cleanup_old_files(self, max_age_hours: int = 24):
        """Clean up old files to stay within free tier limits"""
        if not self.use_s3 or not self.s3_client:
            return  # Only needed for S3 free tier
        
        try:
            # List objects older than max_age_hours
            response = self.s3_client.list_objects_v2(Bucket=self.bucket_name)
            
            if 'Contents' not in response:
                return
            
            import datetime
            cutoff_time = datetime.datetime.now() - datetime.timedelta(hours=max_age_hours)
            
            for obj in response['Contents']:
                if obj['LastModified'].replace(tzinfo=None) < cutoff_time:
                    self.s3_client.delete_object(Bucket=self.bucket_name, Key=obj['Key'])
                    print(f"Deleted old file: {obj['Key']}")
                    
        except Exception as e:
            print(f"Cleanup failed: {e}")


# Global storage manager instance
storage = StorageManager()
