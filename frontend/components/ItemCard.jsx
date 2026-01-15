import { formatVND, getImageUrl } from '../lib/utils';
import { DishIcon, PlusIcon } from './Icons';
import LazyImage from './LazyImage';

export default function ItemCard({ item, onAddToCart, isStoreClosed = false }) {
  const remainingStock =
    item.remainingStock === null || item.remainingStock === undefined
      ? null
      : Number(item.remainingStock);

  const isOutOfStock = remainingStock !== null && remainingStock <= 0;
  const isDisabled = isOutOfStock || isStoreClosed;

  const handleClick = () => {
    if (isDisabled) return;
    onAddToCart(item);
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden group cursor-pointer flex flex-col shadow-sm hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 hover:scale-[1.02] card-glow hover-lift">
      {item.itemImage ? (
        <div className="w-full aspect-[4/3] bg-gradient-to-br from-gray-100 to-gray-200 overflow-hidden relative">
          <LazyImage
            src={getImageUrl(item.itemImage)}
            alt={item.itemName}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
            placeholder={
              <div className="w-full h-full bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center">
                <div className="animate-pulse text-gray-400">Loading...</div>
              </div>
            }
            onError={(e) => {
              e.target.style.display = 'none';
            }}
          />
          {/* Badge trạng thái tồn kho */}
          {isOutOfStock && (
            <div className="absolute top-1.5 left-1.5 px-2 py-0.5 rounded-full bg-red-600 text-[10px] font-semibold text-white shadow">
              Hết món
            </div>
          )}
          {remainingStock !== null && remainingStock > 0 && remainingStock <= 5 && (
            <div className="absolute top-1.5 left-1.5 px-2 py-0.5 rounded-full bg-orange-500 text-[10px] font-semibold text-white shadow">
              Còn {remainingStock} phần
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
        </div>
      ) : (
        <div className="w-full aspect-[4/3] bg-gradient-to-br from-purple-100 to-blue-100 flex items-center justify-center relative">
          <DishIcon className="w-10 h-10 md:w-14 md:h-14 text-purple-400" strokeWidth={1.5} />
          {isOutOfStock && (
            <div className="absolute top-1.5 left-1.5 px-2 py-0.5 rounded-full bg-red-600 text-[10px] font-semibold text-white shadow">
              Hết món
            </div>
          )}
          {remainingStock !== null && remainingStock > 0 && remainingStock <= 5 && (
            <div className="absolute top-1.5 left-1.5 px-2 py-0.5 rounded-full bg-orange-500 text-[10px] font-semibold text-white shadow">
              Còn {remainingStock} phần
            </div>
          )}
        </div>
      )}
      <div className="p-2 flex flex-col flex-1 min-h-0">
        <div
          className="mb-1.5 line-clamp-3 leading-tight"
          title={item.itemDescription ? `${item.itemName} (${item.itemDescription})` : item.itemName}
        >
          <span className="text-xs md:text-sm font-bold text-gray-800">
            {item.itemName}
          </span>
          {item.itemDescription && (
            <span className="text-[9px] md:text[10px] text-gray-500 ml-1">
              ({item.itemDescription})
            </span>
          )}
        </div>
        {/* Dòng trạng thái nhỏ phía dưới tên món (mobile-friendly) */}
        <span
          className={`text-[9px] md:text-[10px] font-medium ${
            isOutOfStock ? 'text-red-600' : remainingStock !== null && remainingStock <= 5 ? 'text-orange-600' : 'text-emerald-600'
          } mb-0.5`}
        >
          {isOutOfStock
            ? 'Hết món'
            : remainingStock === null
            ? 'Còn món'
            : remainingStock <= 5
            ? `Còn ${remainingStock} phần`
            : 'Còn món'}
        </span>
        <div className="flex items-center justify-between gap-2 mt-auto pt-1.5 border-t border-gray-100">
          <span
            className="text-[10px] sm:text-xs md:text-sm font-bold text-purple-600 leading-tight flex-1 min-w-0 truncate"
            title={formatVND(item.itemPrice)}
          >
            {formatVND(item.itemPrice)}
          </span>
          <button
            onClick={handleClick}
            disabled={isDisabled}
            className={`flex-shrink-0 rounded-lg font-semibold transition-all shadow-sm flex items-center justify-center item-card-btn ${
              isDisabled
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : 'bg-gradient-to-r from-purple-500 to-purple-600 text-white hover:from-purple-600 hover:to-purple-700 hover:shadow-md active:scale-95'
            }`}
            aria-label={
              isStoreClosed
                ? 'Quán đang đóng cửa'
                : isOutOfStock
                ? 'Món đã hết'
                : 'Thêm vào giỏ hàng'
            }
          >
            <PlusIcon className="w-4 h-4" strokeWidth={3} />
          </button>
        </div>
      </div>
    </div>
  );
}
