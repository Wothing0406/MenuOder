import { useState } from 'react';
import StarRating from './StarRating';
import { getImageUrl } from '../lib/utils';

export default function ReviewCard({ review, showItem = false }) {
  const [selectedImageIndex, setSelectedImageIndex] = useState(null);

  // Normalize reviewImages to always be an array
  const getReviewImages = () => {
    if (!review.reviewImages) return [];
    if (Array.isArray(review.reviewImages)) return review.reviewImages;
    if (typeof review.reviewImages === 'string') {
      try {
        const parsed = JSON.parse(review.reviewImages);
        return Array.isArray(parsed) ? parsed : [];
      } catch {
        return [];
      }
    }
    return [];
  };

  const reviewImages = getReviewImages();

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

  const openImageModal = (index) => {
    setSelectedImageIndex(index);
  };

  const closeImageModal = () => {
    setSelectedImageIndex(null);
  };

  const navigateImage = (direction) => {
    if (!reviewImages || reviewImages.length === 0) return;
    if (direction === 'next') {
      setSelectedImageIndex((prev) => 
        prev === reviewImages.length - 1 ? 0 : prev + 1
      );
    } else {
      setSelectedImageIndex((prev) => 
        prev === 0 ? reviewImages.length - 1 : prev - 1
      );
    }
  };

  return (
    <>
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

        {reviewImages && reviewImages.length > 0 && (
          <div className="mb-2">
            <div className={`grid gap-1.5 ${
              reviewImages.length === 1 
                ? 'grid-cols-1' 
                : reviewImages.length === 2 
                ? 'grid-cols-2' 
                : reviewImages.length === 3
                ? 'grid-cols-2'
                : 'grid-cols-2'
            }`}>
              {reviewImages.slice(0, 4).map((imageUrl, index) => (
                <div 
                  key={index} 
                  className="relative group rounded overflow-hidden bg-gray-50"
                  style={{
                    aspectRatio: reviewImages.length === 1 ? '16/9' : '1/1'
                  }}
                >
                  <img
                    src={getImageUrl(imageUrl)}
                    alt={`Review image ${index + 1}`}
                    className="w-full h-full object-contain rounded cursor-pointer hover:opacity-90 transition-opacity"
                    onClick={() => openImageModal(index)}
                  />
                  {reviewImages.length > 4 && index === 3 && (
                    <div 
                      className="absolute inset-0 bg-black/60 rounded flex items-center justify-center cursor-pointer hover:bg-black/70 transition"
                      onClick={() => openImageModal(3)}
                    >
                      <span className="text-white font-bold text-sm md:text-base">
                        +{reviewImages.length - 4}
                      </span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {review.helpfulCount > 0 && (
          <div className="text-[10px] md:text-xs text-gray-400">
            {review.helpfulCount} người thấy hữu ích
          </div>
        )}
      </div>

      {/* Image Modal */}
      {selectedImageIndex !== null && reviewImages && reviewImages.length > 0 && (
        <div 
          className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4"
          onClick={closeImageModal}
        >
          <div className="relative max-w-4xl max-h-full w-full">
            <button
              onClick={closeImageModal}
              className="absolute top-2 right-2 md:top-4 md:right-4 w-8 h-8 md:w-10 md:h-10 bg-white/20 hover:bg-white/30 rounded-full flex items-center justify-center text-white text-xl md:text-2xl font-bold z-10 transition"
            >
              ×
            </button>
            
            {reviewImages.length > 1 && (
              <>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    navigateImage('prev');
                  }}
                  className="absolute left-2 md:left-4 top-1/2 -translate-y-1/2 w-10 h-10 md:w-12 md:h-12 bg-white/20 hover:bg-white/30 rounded-full flex items-center justify-center text-white text-xl md:text-2xl font-bold z-10 transition"
                >
                  ‹
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    navigateImage('next');
                  }}
                  className="absolute right-2 md:right-4 top-1/2 -translate-y-1/2 w-10 h-10 md:w-12 md:h-12 bg-white/20 hover:bg-white/30 rounded-full flex items-center justify-center text-white text-xl md:text-2xl font-bold z-10 transition"
                >
                  ›
                </button>
              </>
            )}

            <img
              src={getImageUrl(reviewImages[selectedImageIndex])}
              alt={`Review image ${selectedImageIndex + 1}`}
              className="w-full h-auto max-h-[90vh] object-contain rounded"
              onClick={(e) => e.stopPropagation()}
            />
            
            {reviewImages.length > 1 && (
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/50 text-white px-3 py-1 rounded text-sm">
                {selectedImageIndex + 1} / {reviewImages.length}
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}


