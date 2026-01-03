import { PlusIcon, DeleteIcon, ArrowUpIcon, ArrowDownIcon, FolderIcon } from '../../components/Icons';

export default function CategoryManagement({
  categories,
  onAddCategory,
  onMoveCategory,
  onDeleteCategory
}) {
  return (
    <div>
      <button
        onClick={onAddCategory}
        className="btn btn-primary mb-6 hover:bg-purple-700 transition shadow-lg hover:shadow-xl btn-ripple scale-on-hover flex items-center gap-2"
      >
        <PlusIcon className="w-5 h-5" />
        Thêm danh mục mới
      </button>

      <div className="space-y-3">
        {categories.map((category, index) => (
          <div key={category.id} className="card hover:shadow-xl transition-all duration-300 border-2 border-transparent hover:border-purple-300 hover-lift animate-fadeIn">
            <div className="flex items-center gap-3">
              {/* Order Controls */}
              <div className="flex flex-col gap-1">
                <button
                  onClick={() => onMoveCategory(category.id, 'up')}
                  disabled={index === 0}
                  className={`w-8 h-8 flex items-center justify-center rounded-lg transition transform hover:scale-110 ${
                    index === 0
                      ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                      : 'bg-purple-100 text-purple-600 hover:bg-purple-200 active:scale-95'
                  }`}
                  title="Di chuyển lên"
                >
                  <ArrowUpIcon className="w-4 h-4" />
                </button>
                <button
                  onClick={() => onMoveCategory(category.id, 'down')}
                  disabled={index === categories.length - 1}
                  className={`w-8 h-8 flex items-center justify-center rounded-lg transition transform hover:scale-110 ${
                    index === categories.length - 1
                      ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                      : 'bg-purple-100 text-purple-600 hover:bg-purple-200 active:scale-95'
                  }`}
                  title="Di chuyển xuống"
                >
                  <ArrowDownIcon className="w-4 h-4" />
                </button>
              </div>

              {/* Category Info */}
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center text-white font-bold text-lg flex-shrink-0">
                    {index + 1}
                  </div>
                  <h3 className="text-lg font-bold text-gray-800">{category.categoryName}</h3>
                </div>
                {category.categoryDescription && (
                  <p className="text-gray-600 mb-3 text-sm line-clamp-2">{category.categoryDescription}</p>
                )}
              </div>

              {/* Delete Button */}
              <button
                type="button"
                onClick={(e) => onDeleteCategory(category.id, e)}
                className="btn btn-danger text-sm hover:bg-red-600 transition px-4 py-2 flex items-center gap-2"
                title="Xóa danh mục"
              >
                <DeleteIcon className="w-4 h-4" />
                Xóa
              </button>
            </div>
          </div>
        ))}
      </div>

      {categories.length === 0 && (
        <p className="text-gray-600">Chưa có danh mục nào</p>
      )}
    </div>
  );
}
