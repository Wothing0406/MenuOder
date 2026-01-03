import { PlusIcon, EditIcon, DeleteIcon, DishIcon } from '../../components/Icons';
import { formatVND, getImageUrl } from '../../lib/utils';
import LazyImage from '../../components/LazyImage';

export default function ItemsManagement({
  categories,
  items,
  selectedCategory,
  onCategoryChange,
  onAddItem,
  onEditItem,
  onDeleteItem,
  onOpenOptionModal,
  onOpenAccompanimentModal
}) {
  return (
    <div>
      {categories.length === 0 ? (
        <p className="text-gray-600">Vui lòng tạo danh mục trước khi thêm món.</p>
      ) : (
        <>
          <div className="mb-4">
            <label className="font-bold mr-2">Chọn danh mục:</label>
            <select
              value={selectedCategory?.id || ''}
              onChange={onCategoryChange}
              className="input-field"
            >
              <option value="">-- Chọn --</option>
              {categories.map(cat => (
                <option key={cat.id} value={cat.id}>{cat.categoryName}</option>
              ))}
            </select>
          </div>

          {selectedCategory && (
            <>
              <button
                onClick={onAddItem}
                className="btn btn-primary mb-4 hover:bg-purple-700 transition shadow-lg hover:shadow-xl btn-ripple scale-on-hover flex items-center gap-2"
              >
                <PlusIcon className="w-5 h-5" />
                Thêm món mới
              </button>

              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-3 md:gap-4">
                {items.map(item => (
                  <div key={item.id} className="bg-white rounded-lg border border-gray-200 overflow-hidden hover:shadow-lg transition-all duration-300 transform hover:-translate-y-0.5 flex flex-col hover-lift animate-fadeIn">
                    {/* Image (4:3) */}
                    {item.itemImage ? (
                      <div className="w-full aspect-[4/3] bg-gradient-to-br from-gray-100 to-gray-200 overflow-hidden relative">
                        <LazyImage
                          src={getImageUrl(item.itemImage)}
                          alt={item.itemName}
                          className="w-full h-full object-cover"
                          placeholder={
                            <div className="w-full h-full bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center">
                              <div className="animate-pulse text-gray-400 text-xs">Loading...</div>
                            </div>
                          }
                          onError={(e) => {
                            e.target.style.display = 'none';
                          }}
                        />
                      </div>
                    ) : (
                      <div className="w-full aspect-[4/3] bg-gradient-to-br from-purple-100 to-blue-100 flex items-center justify-center">
                        <DishIcon className="w-10 h-10 md:w-14 md:h-14 text-purple-400" />
                      </div>
                    )}

                    {/* Content - Compact */}
                    <div className="p-2 flex flex-col flex-1">
                      <h3 className="text-xs md:text-sm font-bold mb-1 text-gray-800 line-clamp-2 min-h-[2rem] leading-tight">
                        {item.itemName}
                      </h3>

                      <p className="text-[11px] font-semibold text-purple-600 mb-1">
                        {formatVND(item.itemPrice)}
                      </p>

                      <div className="flex flex-wrap gap-1 mb-2">
                        <button
                          type="button"
                          onClick={() => onOpenOptionModal(item)}
                          className="px-2 py-1 text-[10px] bg-blue-50 text-blue-700 rounded border border-blue-200 hover:bg-blue-100 transition"
                        >
                          Size + giá
                        </button>
                        <button
                          type="button"
                          onClick={() => onOpenAccompanimentModal(item)}
                          className="px-2 py-1 text-[10px] bg-emerald-50 text-emerald-700 rounded border border-emerald-200 hover:bg-emerald-100 transition"
                        >
                          Món kèm
                        </button>
                      </div>

                      <div className="flex gap-1 mt-auto">
                        <button
                          onClick={() => onEditItem(item)}
                          className="flex-1 px-2 py-1.5 text-xs bg-purple-100 text-purple-700 rounded hover:bg-purple-600 hover:text-white transition font-medium flex items-center justify-center gap-1 transform hover:scale-105 active:scale-95"
                          title="Sửa"
                        >
                          <EditIcon className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          onClick={(e) => onDeleteItem(item.id, e)}
                          className="flex-1 px-2 py-1.5 text-xs bg-red-100 text-red-700 rounded hover:bg-red-600 hover:text-white transition font-medium flex items-center justify-center gap-1 transform hover:scale-105 active:scale-95"
                          title="Xóa"
                        >
                          <DeleteIcon className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {items.length === 0 && (
                <p className="text-gray-600">Chưa có món nào trong danh mục {selectedCategory.categoryName}</p>
              )}
            </>
          )}
        </>
      )}
    </div>
  );
}
