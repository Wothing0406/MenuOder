import StarRating from './StarRating';
import { getImageUrl } from '../lib/utils';

export default function ReviewCard({ review, showItem = false }) {
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) {
      return 'Hôm nay';
    } else if (diffDays === 1) {
      return 'Hôm qua';
    } else if (diffDays < 7) {
      return `${diffDays} ngày trước`;
    } else if (diffDays < 30) {
      const weeks = Math.floor(diffDays / 7);
      return `${weeks} tuần trước`;
    } else {
      return date.toLocaleDateString('vi-VN');
    }
  };

  return (
    <div className="bg-white rounded-lg p-2 md:p-3 hover:bg-gray-50 transition-colors">
      <div className="flex items-start justify-between mb-2">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5 mb-1.5 flex-wrap">
            <h4 className="font-semibold text-sm md:text-base text-gray-800 truncate">{review.reviewerName}</h4>
            {review.isAnonymous && (
              <span className="px-1.5 py-0.5 bg-gray-100 text-gray-600 text-[10px] md:text-xs font-medium rounded flex-shrink-0">
                Ẩn danh
              </span>
            )}
            {review.isVerified && (
              <span className="px-1.5 py-0.5 bg-blue-100 text-blue-700 text-[10px] md:text-xs font-medium rounded flex-shrink-0">
                ✓
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            <StarRating rating={review.rating} readonly size="sm" />
            <span className="text-[10px] md:text-xs text-gray-400">{formatDate(review.createdAt)}</span>
          </div>
        </div>
      </div>

      {showItem && review.item && (
        <div className="mb-2 p-1.5 bg-gray-50 rounded flex items-center gap-1.5">
          {review.item.itemImage && (
            <img
              src={getImageUrl(review.item.itemImage)}
              alt={review.item.itemName}
              className="w-8 h-8 object-cover rounded flex-shrink-0"
            />
          )}
          <span className="text-xs md:text-sm text-gray-700 truncate">{review.item.itemName}</span>
        </div>
      )}

      {review.comment && (
        <p className="text-xs md:text-sm text-gray-700 mb-2 leading-relaxed line-clamp-3">{review.comment}</p>
      )}

      {review.reviewImages && review.reviewImages.length > 0 && (
        <div className="grid grid-cols-3 gap-1.5 mb-2">
          {review.reviewImages.map((imageUrl, index) => (
            <img
              key={index}
              src={getImageUrl(imageUrl)}
              alt={`Review image ${index + 1}`}
              className="w-full h-16 md:h-20 object-cover rounded cursor-pointer hover:opacity-80 transition"
              onClick={() => {
                window.open(getImageUrl(imageUrl), '_blank');
              }}
            />
          ))}
        </div>
      )}

      {review.helpfulCount > 0 && (
        <div className="text-[10px] md:text-xs text-gray-400">
          {review.helpfulCount} người thấy hữu ích
        </div>
      )}
    </div>
  );
}


