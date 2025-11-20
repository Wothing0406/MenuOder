import { formatVND } from '../lib/utils';

export default function ItemCard({ item, onAddToCart }) {
  return (
    <div className="card overflow-hidden group cursor-pointer h-full flex flex-col">
      {item.itemImage && (
        <div className="w-full h-48 bg-gray-200 overflow-hidden relative">
          <img
            src={item.itemImage}
            alt={item.itemName}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
        </div>
      )}
      <div className="p-5 flex-1 flex flex-col">
        <h3 className="text-xl font-bold mb-2 text-gray-800 group-hover:text-purple-600 transition-colors">
          {item.itemName}
        </h3>
        {item.itemDescription && (
          <p className="text-gray-600 text-sm mb-4 flex-1 line-clamp-2">{item.itemDescription}</p>
        )}
        <div className="flex justify-between items-center mt-auto pt-3 border-t border-gray-100">
          <span className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-purple-400 bg-clip-text text-transparent">
            {formatVND(item.itemPrice)}
          </span>
          <button
            onClick={() => onAddToCart(item)}
            className="btn btn-primary text-sm px-5 py-2 rounded-lg font-semibold hover:scale-105 transform transition-transform"
          >
            Thêm vào giỏ
          </button>
        </div>
      </div>
    </div>
  );
}
