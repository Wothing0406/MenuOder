import { formatVND } from '../../lib/utils';
import api from '../../lib/api';
import toast from 'react-hot-toast';

export default function StockManagement({
  categories,
  items,
  selectedCategory,
  onCategoryChange
}) {
  const handleUpdateStock = async (itemId, action) => {
    try {
      let payload;
      switch (action) {
        case 'available':
          payload = { remainingStock: null, isAvailable: true };
          break;
        case 'out-of-stock':
          payload = { remainingStock: 0, isAvailable: false };
          break;
        default:
          return;
      }

      await api.put(`/items/${itemId}`, payload);
      toast.success(action === 'available' ? 'Đã đặt món về trạng thái còn món' : 'Đã báo hết món');

      // Refresh items
      if (selectedCategory?.id) {
        // This will be handled by parent component
        window.location.reload(); // Temporary solution, better to pass refresh callback
      }
    } catch (error) {
      toast.error('Không thể cập nhật trạng thái món');
    }
  };

  const handleUpdateQuantity = async (itemId, quantity) => {
    const trimmed = quantity.trim();
    const payload = trimmed === ''
      ? { remainingStock: null, isAvailable: true }
      : {
          remainingStock: parseInt(trimmed, 10),
          isAvailable: parseInt(trimmed, 10) > 0,
        };

    if (payload.remainingStock !== null && (Number.isNaN(payload.remainingStock) || payload.remainingStock < 0)) {
      toast.error('Số lượng phải là số nguyên >= 0');
      return;
    }

    try {
      await api.put(`/items/${itemId}`, payload);
      toast.success('Đã cập nhật số lượng món');

      // Refresh items
      if (selectedCategory?.id) {
        // This will be handled by parent component
        window.location.reload(); // Temporary solution, better to pass refresh callback
      }
    } catch (error) {
      toast.error('Không thể cập nhật số lượng món');
    }
  };

  return (
    <div>
      {categories.length === 0 ? (
        <p className="text-gray-600">
          Vui lòng tạo danh mục và món trước, sau đó bạn có thể báo món tại đây.
        </p>
      ) : (
        <>
          <div className="mb-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
              <div>
                <h2 className="text-xl font-bold text-gray-800">Báo món nhanh</h2>
                <p className="text-xs text-gray-500">
                  Chọn danh mục để xem và cập nhật nhanh trạng thái Còn hàng / Hết món / Số lượng còn lại.
                </p>
              </div>
              <div className="flex items-center gap-2">
                <label className="font-bold text-sm">Danh mục:</label>
                <select
                  value={selectedCategory?.id || ''}
                  onChange={onCategoryChange}
                  className="input-field text-sm"
                >
                  <option value="">-- Chọn --</option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.categoryName}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {selectedCategory ? (
            <>
              {items.length === 0 ? (
                <p className="text-gray-600">
                  Chưa có món nào trong danh mục {selectedCategory.categoryName}.
                </p>
              ) : (
                <div className="space-y-3">
                  {items.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center gap-3 p-3 rounded-lg border border-gray-200 bg-white shadow-sm"
                    >
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold text-gray-800 truncate">
                          {item.itemName}
                        </p>
                        <p className="text-xs text-purple-600 font-semibold">
                          {formatVND(item.itemPrice)}
                        </p>
                        <p className="text-[11px] text-gray-500 truncate">
                          {item.itemDescription || 'Không có mô tả'}
                        </p>
                      </div>
                      <div className="flex flex-col items-end gap-1">
                        <div className="mb-1">
                          {item.remainingStock === null || item.remainingStock === undefined ? (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                              Còn món
                            </span>
                          ) : Number(item.remainingStock) <= 0 ? (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-red-50 text-red-700 border border-red-200">
                              Hết món
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-amber-50 text-amber-700 border border-amber-200">
                              Còn {item.remainingStock} phần
                            </span>
                          )}
                        </div>
                        <div className="flex flex-wrap justify-end gap-1 items-center">
                          <button
                            type="button"
                            onClick={() => handleUpdateStock(item.id, 'available')}
                            className="px-2 py-1 text-[10px] rounded border border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 transition"
                          >
                            Còn món
                          </button>
                          <button
                            type="button"
                            onClick={() => handleUpdateStock(item.id, 'out-of-stock')}
                            className="px-2 py-1 text-[10px] rounded border border-red-200 bg-red-50 text-red-700 hover:bg-red-100 transition"
                          >
                            Hết món
                          </button>
                          <div className="flex items-center gap-1">
                            <span className="text-[10px] text-gray-500">SL:</span>
                            <input
                              type="number"
                              min="0"
                              defaultValue={
                                item.remainingStock === null ||
                                item.remainingStock === undefined
                                  ? ''
                                  : item.remainingStock
                              }
                              className="w-16 px-1 py-0.5 border border-amber-200 rounded text-[10px] focus:outline-none focus:ring-1 focus:ring-amber-400"
                              placeholder="0"
                              onBlur={(e) => handleUpdateQuantity(item.id, e.target.value)}
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                  e.preventDefault();
                                  e.target.blur();
                                }
                              }}
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </>
          ) : (
            <p className="text-gray-600 text-sm">
              Vui lòng chọn một danh mục ở trên để bắt đầu báo món.
            </p>
          )}
        </>
      )}
    </div>
  );
}
