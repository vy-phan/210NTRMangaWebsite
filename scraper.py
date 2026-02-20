import requests
from bs4 import BeautifulSoup
import json
import re
import time

# === CẤU HÌNH CỐ ĐỊNH ===
MANGA_ID = "694524a54cd2040d3b759423"
BACKEND_URL = "http://localhost:7000/api/chapters"
# Token của bạn
ACCESS_TOKEN = "eyJhbGciOiJIUzI1NiIsImtpZCI6IlI5Y3kwSUpSd0htME5HdDYiLCJ0eXAiOiJKV1QifQ.eyJpc3MiOiJodHRwczovL2xwdmplaGloZnlxbmVwbW91aWhxLnN1cGFiYXNlLmNvL2F1dGgvdjEiLCJzdWIiOiI2NTI4MzQ2My1mMjJjLTRjYjEtODYwNi0yYzYxNzY2ZWJjODgiLCJhdWQiOiJhdXRoZW50aWNhdGVkIiwiZXhwIjoxNzcxNTcxNjU5LCJpYXQiOjE3NzE1NjgwNTksImVtYWlsIjoicGhhbmx1dnkxNDEwMjAwNUBnbWFpbC5jb20iLCJwaG9uZSI6IiIsImFwcF9tZXRhZGF0YSI6eyJwcm92aWRlciI6Imdvb2dsZSIsInByb3ZpZGVycyI6WyJnb29nbGUiXX0sInVzZXJfbWV0YWRhdGEiOnsiYXZhdGFyX3VybCI6Imh0dHBzOi8vbGgzLmdvb2dsZXVzZXJjb250ZW50LmNvbS9hL0FDZzhvY0w1VEVwTG9nSEtsenJ0U3VkbEN6TEludTJWcW5maUNQS3huZjNvVjQ3d1dXbDJ3ZS1CPXM5Ni1jIiwiZW1haWwiOiJwaGFubHV2eTE0MTAyMDA1QGdtYWlsLmNvbSIsImVtYWlsX3ZlcmlmaWVkIjp0cnVlLCJmdWxsX25hbWUiOiJCMTE0NSBQaGFuIEx1IFbhu7kiLCJpc3MiOiJodHRwczovL2FjY291bnRzLmdvb2dsZS5jb20iLCJuYW1lIjoiQjExNDUgUGhhbiBMdSBW4bu5IiwicGhvbmVfdmVyaWZpZWQiOmZhbHNlLCJwaWN0dXJlIjoiaHR0cHM6Ly9saDMuZ29vZ2xldXNlcmNvbnRlbnQuY29tL2EvQUNnOG9jTDVURXBMb2dIS2x6cnRTdWRsQ3pMSW51MlZxbmZpQ1BLeG5mM29WNDd3V1dsMndlLUI9czk2LWMiLCJwcm92aWRlcl9pZCI6IjExMzQ2OTk3NTk3NzI3NjQxMTIzMCIsInN1YiI6IjExMzQ2OTk3NTk3NzI3NjQxMTIzMCJ9LCJyb2xlIjoiYXV0aGVudGljYXRlZCIsImFhbCI6ImFhbDEiLCJhbXIiOlt7Im1ldGhvZCI6Im9hdXRoIiwidGltZXN0YW1wIjoxNzY1MjQ3MTgyfV0sInNlc3Npb25faWQiOiJiNjk4MDA0MC05MGQ5LTQ5OTEtYmFhMy1jMWY3MjQzYTBmYTkiLCJpc19hbm9ueW1vdXMiOmZhbHNlfQ.2wmKue7A3Q7XTWYGq2CpxtWhvNjqkd9RS1QKK7Kj8IM"

class DamCoNuongScraper:
    def __init__(self):
        self.headers = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
        }

    def get_images(self, url):
        try:
            response = requests.get(url, headers=self.headers, timeout=10)
            response.raise_for_status()
            soup = BeautifulSoup(response.text, 'html.parser')
            
            image_urls = []
            for img in soup.select('#chapter-content img'):
                img_url = img.get('data-original-src') or img.get('data-src') or img.get('src')
                if img_url:
                    img_url = img_url.strip()
                    if img_url.startswith('//'): 
                        img_url = 'https:' + img_url
                    image_urls.append(img_url)
            
            return image_urls
        except Exception as e:
            print(f"   [!] Lỗi khi cào {url}: {e}")
            return []

    def post_to_backend(self, payload):
        headers = {
            'Authorization': f'Bearer {ACCESS_TOKEN}',
            'Content-Type': 'application/json'
        }
        try:
            response = requests.post(BACKEND_URL, json=payload, headers=headers)
            if response.status_code == 201:
                return True, response.json()
            else:
                return False, response.text
        except Exception as e:
            return False, str(e)

def main():
    scraper = DamCoNuongScraper()
    
    print("=== BATCH MANGA UPLOADER ===")
    base_url = input("Nhập URL cơ sở (ví dụ: https://damconuong.app/truyen/abc/chapter-): ").strip()
    start_idx = int(input("Nhập số chương bắt đầu (ví dụ: 62): ").strip())
    end_idx = int(input("Nhập số chương kết thúc (ví dụ: 73): ").strip())

    print(f"\n🚀 BẮT ĐẦU CHẠY TỪ CHƯƠNG {start_idx} ĐẾN {end_idx}\n")

    success_count = 0
    fail_count = 0

    for i in range(start_idx, end_idx + 1):
        url = f"{base_url}{i}"
        chapter_title = str(i)
        chapter_number = i - 1 # Logic index = title - 1

        print(f"👉 Đang xử lý Chương {chapter_title}...")
        print(f"   - URL: {url}")
        
        # 1. Cào ảnh
        image_urls = scraper.get_images(url)
        if not image_urls:
            print(f"   [!] Bỏ qua chương {chapter_title} vì không tìm thấy ảnh.")
            fail_count += 1
            continue
        
        print(f"   [+] Tìm thấy {len(image_urls)} ảnh.")

        # 2. Tạo payload
        payload = {
            "number": chapter_number,
            "title": chapter_title,
            "manga": MANGA_ID,
            "images": [{"url": u, "pageNumber": idx+1} for idx, u in enumerate(image_urls)]
        }

        # 3. Gửi lên Backend
        success, result = scraper.post_to_backend(payload)
        if success:
            print(f"   ✅ Thành công!")
            success_count += 1
        else:
            print(f"   ❌ Thất bại: {result}")
            fail_count += 1
        
        # Nghỉ 1 chút để tránh bị block hoặc quá tải server
        time.sleep(1)

    print(f"\n=== HOÀN THÀNH ===")
    print(f"🏆 Tổng cộng: {success_count} thành công, {fail_count} thất bại.")

if __name__ == "__main__":
    main()
