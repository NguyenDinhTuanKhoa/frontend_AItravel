#!/bin/bash

echo "🔧 QUICK FIX - Clear Cache & Restart Frontend"
echo "============================================="
echo ""

# Check if in frontend directory
if [ ! -f "package.json" ]; then
    echo "⚠️  Cảnh báo: Không phải thư mục frontend"
    echo "Vui lòng chạy: cd d:/travelai/frontend"
    exit 1
fi

echo "📍 Bước 1: Xóa .next cache folder..."
if [ -d ".next" ]; then
    rm -rf .next
    echo "✅ Đã xóa .next"
else
    echo "⚠️  Folder .next không tồn tại"
fi

echo ""
echo "📍 Bước 2: Xóa node_modules/.cache..."
if [ -d "node_modules/.cache" ]; then
    rm -rf node_modules/.cache
    echo "✅ Đã xóa node_modules/.cache"
fi

echo ""
echo "✨ Hoàn thành!"
echo ""
echo "📍 Tiếp theo:"
echo "   1. Chạy: npm run dev"
echo "   2. Mở browser: http://localhost:3000/destinations"
echo "   3. Nhấn: Ctrl + Shift + R (Hard Refresh)"
echo ""
echo "🗺️  Sau đó kiểm tra Bãi Sao:"
echo "   → Phải hiển thị ở Phú Quốc"
echo "   → Tọa độ: 10.1599, 103.9959"
echo ""
