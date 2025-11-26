import { formatVND } from '../lib/utils';

export default function ItemCard({ item, onAddToCart }) {
  return (
    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden group cursor-pointer flex flex-col shadow-sm hover:shadow-md transition-shadow">
      {item.itemImage && (
        <div className="w-full h-20 bg-gray-100 overflow-hidden relative">
          <img
            src={item.itemImage}
            alt={item.itemName}
            className="w-full h-full object-cover"
          />
        </div>
      )}
      <div className="p-2.5 flex flex-col flex-1">
        <h3 className="text-sm font-bold mb-1.5 text-gray-800 line-clamp-2">
          {item.itemName}
          {item.itemDescription && (
            <span className="text-xs font-normal text-gray-500 ml-1">
              ({item.itemDescription})
            </span>
          )}
        </h3>
        <div className="flex items-center justify-between gap-2 mt-auto">
          <span className="text-base font-bold text-purple-600">
            {formatVND(item.itemPrice)}
          </span>
          <button
            onClick={() => onAddToCart(item)}
            className="btn btn-primary text-xs px-3 py-1.5 rounded-md font-medium whitespace-nowrap"
          >
            Thêm vào giỏ
          </button>
        </div>
      </div>
    </div>
  );
}
