import { formatVND, getImageUrl } from '../lib/utils';
import { DishIcon, PlusIcon } from './Icons';

export default function ItemCard({ item, onAddToCart }) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden group cursor-pointer flex flex-col shadow-sm hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 hover:scale-[1.02] card-glow hover-lift">
      {item.itemImage ? (
        <div className="w-full aspect-square bg-gradient-to-br from-gray-100 to-gray-200 overflow-hidden relative">
          <img
            src={getImageUrl(item.itemImage)}
            alt={item.itemName}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
            onError={(e) => {
              e.target.style.display = 'none';
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
        </div>
      ) : (
        <div className="w-full aspect-square bg-gradient-to-br from-purple-100 to-blue-100 flex items-center justify-center">
          <DishIcon className="w-12 h-12 md:w-16 md:h-16 text-purple-400" strokeWidth={1.5} />
        </div>
      )}
      <div className="p-2 flex flex-col flex-1 min-h-0">
        <div 
          className="mb-1.5 line-clamp-3 leading-tight"
          title={item.itemDescription ? `${item.itemName} (${item.itemDescription})` : item.itemName}
          style={{ 
            WebkitLineClamp: 3,
            display: '-webkit-box',
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden'
          }}
        >
          <span className="text-xs md:text-sm font-bold text-gray-800">
            {item.itemName}
          </span>
          {item.itemDescription && (
            <span className="text-[9px] md:text-[10px] text-gray-500 ml-1">
              ({item.itemDescription})
            </span>
          )}
        </div>
        <div className="flex items-center justify-between gap-2 mt-auto pt-1.5 border-t border-gray-100">
          <span 
            className="text-[10px] sm:text-xs md:text-sm font-bold text-purple-600 leading-tight flex-1 min-w-0 truncate"
            title={formatVND(item.itemPrice)}
          >
            {formatVND(item.itemPrice)}
          </span>
          <button
            onClick={() => onAddToCart(item)}
            className="flex-shrink-0 bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-lg font-semibold hover:from-purple-600 hover:to-purple-700 transition-all shadow-sm hover:shadow-md active:scale-95 flex items-center justify-center"
            style={{ 
              minWidth: '28px', 
              height: '28px', 
              padding: '0 8px',
            }}
            aria-label="Thêm vào giỏ hàng"
          >
            <PlusIcon className="w-4 h-4" strokeWidth={3} />
          </button>
        </div>
      </div>
    </div>
  );
}
