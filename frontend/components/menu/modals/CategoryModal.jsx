import { FolderIcon, ClipboardIcon, CheckIcon, CloseIcon } from '../../../components/Icons';

export default function CategoryModal({ isOpen, onClose, formData, onFormChange, onSubmit, isLoading }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl p-6 max-w-md w-full shadow-2xl">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            <FolderIcon className="w-6 h-6 text-purple-600" />
            Thêm danh mục mới
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 transition-transform hover:rotate-90"
          >
            <CloseIcon className="w-6 h-6" />
          </button>
        </div>
        <form onSubmit={onSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
              <ClipboardIcon className="w-5 h-5 text-purple-600" />
              Tên danh mục <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              placeholder="Ví dụ: Đồ uống, Món chính, Tráng miệng..."
              value={formData.categoryName}
              onChange={(e) => onFormChange({ ...formData, categoryName: e.target.value })}
              className="input-field w-full"
              required
            />
          </div>
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="btn btn-secondary flex-1 hover:bg-gray-400 transition"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="btn btn-primary flex-1 hover:bg-purple-700 transition flex items-center justify-center gap-2 disabled:opacity-50"
            >
              <CheckIcon className="w-5 h-5" />
              {isLoading ? 'Đang tạo...' : 'Tạo danh mục'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
