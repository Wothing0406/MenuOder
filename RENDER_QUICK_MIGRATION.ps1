# Quick Migration Script cho Render PostgreSQL
# Sử dụng: .\RENDER_QUICK_MIGRATION.ps1

$DATABASE_URL = "postgresql://menu_order_db_wfa4_user:YOuvv1yii0cC34ukdDhzY2rtM88p3pPL@dpg-d4j8lg6uk2gs73bfdtqg-a/menu_order_db_wfa4"

Write-Host "🔌 Đang kết nối đến Render PostgreSQL..." -ForegroundColor Cyan

# Kiểm tra psql
$psqlPath = Get-Command psql -ErrorAction SilentlyContinue
if (-not $psqlPath) {
    Write-Host "❌ Lỗi: psql không được tìm thấy!" -ForegroundColor Red
    Write-Host "💡 Cài đặt: winget install PostgreSQL.PostgreSQL" -ForegroundColor Yellow
    exit 1
}

# SQL command
$sql = "ALTER TABLE orders DROP CONSTRAINT IF EXISTS orders_status_check; ALTER TABLE orders ADD CONSTRAINT orders_status_check CHECK (status IN ('pending', 'confirmed', 'preparing', 'ready', 'delivered', 'completed', 'cancelled'));"

Write-Host "📝 Đang apply migration..." -ForegroundColor Cyan

try {
    $result = echo $sql | psql $DATABASE_URL 2>&1
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ Migration thành công!" -ForegroundColor Green
        Write-Host "📊 Đã thêm trạng thái 'completed' vào orders.status" -ForegroundColor Cyan
    } else {
        Write-Host "❌ Lỗi: $result" -ForegroundColor Red
    }
} catch {
    Write-Host "❌ Lỗi: $_" -ForegroundColor Red
}

