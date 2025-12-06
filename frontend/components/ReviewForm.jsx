import { useState } from 'react';
import StarRating from './StarRating';
import api from '../lib/api';
import toast from 'react-hot-toast';
import { getImageUrl } from '../lib/utils';

export default function ReviewForm({ 
  storeId, 
  itemId = null, 
  orderId = null,
  onSuccess,
  onCancel 
}) {
  const [rating, setRating] = useState(0);
  const [reviewerName, setReviewerName] = useState('');
  const [reviewerPhone, setReviewerPhone] = useState('');
  const [comment, setComment] = useState('');
  const [reviewImages, setReviewImages] = useState([]);
  const [imagePreviews, setImagePreviews] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [isAnonymous, setIsAnonymous] = useState(false);

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    if (files.length + reviewImages.length > 5) {
      toast.error('Chỉ có thể upload tối đa 5 ảnh');
      return;
    }

    files.forEach(file => {
      if (!file.type.startsWith('image/')) {
        toast.error('Vui lòng chọn file ảnh');
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        toast.error('Kích thước ảnh không được vượt quá 5MB');
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreviews(prev => [...prev, reader.result]);
      };
      reader.readAsDataURL(file);
    });

    setReviewImages(prev => [...prev, ...files]);
  };

  const removeImage = (index) => {
    setReviewImages(prev => prev.filter((_, i) => i !== index));
    setImagePreviews(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (rating === 0) {
      toast.error('Vui lòng chọn số sao đánh giá');
      return;
    }

    if (!reviewerName.trim()) {
      toast.error('Vui lòng nhập tên');
      return;
    }

    if (!reviewerPhone.trim()) {
      toast.error('Vui lòng nhập số điện thoại');
      return;
    }

    setSubmitting(true);

    try {
      // Upload images first if any
      let uploadedImageUrls = [];
      if (reviewImages.length > 0) {
        const formData = new FormData();
        reviewImages.forEach((image) => {
          formData.append('images', image);
        });

        // Upload to Cloudinary via backend
        const uploadRes = await api.post('/reviews/upload-images', formData, {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        });

        if (uploadRes.data.success) {
          uploadedImageUrls = uploadRes.data.data.urls || [];
        }
      }

      // Create review
      // Lưu tên thật vào database, nhưng hiển thị "Ẩn danh" nếu user chọn
      const reviewData = {
        storeId,
        itemId,
        orderId,
        reviewerName: reviewerName.trim(), // Luôn lưu tên thật
        reviewerPhone: reviewerPhone.trim(),
        reviewerEmail: null, // Không cần email
        rating,
        comment: comment.trim() || null,
        reviewImages: uploadedImageUrls.length > 0 ? uploadedImageUrls : null,
        isAnonymous: isAnonymous // Lưu flag ẩn danh
      };

      const res = await api.post('/reviews', reviewData);

      if (res.data.success) {
        toast.success('Cảm ơn bạn đã đánh giá!');
        if (onSuccess) {
          onSuccess(res.data.data);
        }
        // Reset form
        setRating(0);
        setReviewerName('');
        setReviewerPhone('');
        setComment('');
        setReviewImages([]);
        setImagePreviews([]);
        setIsAnonymous(false);
      }
    } catch (error) {
      console.error('Error submitting review:', error);
      toast.error(error.response?.data?.message || 'Không thể gửi đánh giá. Vui lòng thử lại.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          Đánh giá của bạn <span className="text-red-500">*</span>
        </label>
        <StarRating rating={rating} onRatingChange={setRating} />
      </div>

      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          Tên của bạn <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          value={reviewerName}
          onChange={(e) => setReviewerName(e.target.value)}
          className="input-field w-full"
          placeholder="Nhập tên của bạn"
          required
        />
        <label className="flex items-center gap-2 mt-2">
          <input
            type="checkbox"
            checked={isAnonymous}
            onChange={(e) => setIsAnonymous(e.target.checked)}
            className="w-4 h-4 text-purple-600 rounded focus:ring-purple-500"
          />
          <span className="text-sm text-gray-600">
            Hiển thị ẩn danh (tên và số điện thoại sẽ không hiển thị công khai)
          </span>
        </label>
      </div>

      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          Số điện thoại <span className="text-red-500">*</span>
        </label>
        <input
          type="tel"
          value={reviewerPhone}
          onChange={(e) => setReviewerPhone(e.target.value)}
          className="input-field w-full"
          placeholder="Nhập số điện thoại"
          required
        />
        <p className="text-xs text-gray-500 mt-1">
          Số điện thoại chỉ hiển thị cho chủ quán, không hiển thị công khai
        </p>
      </div>

      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          Nhận xét
        </label>
        <textarea
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          className="input-field w-full"
          rows="4"
          placeholder="Chia sẻ trải nghiệm của bạn..."
        />
      </div>

      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          Ảnh đánh giá (tối đa 5 ảnh)
        </label>
        <input
          type="file"
          accept="image/*"
          multiple
          onChange={handleImageChange}
          className="input-field w-full"
        />
        {imagePreviews.length > 0 && (
          <div className="grid grid-cols-5 gap-2 mt-2">
            {imagePreviews.map((preview, index) => (
              <div key={index} className="relative">
                <img
                  src={preview}
                  alt={`Preview ${index + 1}`}
                  className="w-full h-20 object-cover rounded"
                />
                <button
                  type="button"
                  onClick={() => removeImage(index)}
                  className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs hover:bg-red-600"
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="flex gap-3 pt-2">
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="btn btn-secondary flex-1"
          >
            Hủy
          </button>
        )}
        <button
          type="submit"
          disabled={submitting || rating === 0}
          className="btn btn-primary flex-1 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {submitting ? 'Đang gửi...' : 'Gửi đánh giá'}
        </button>
      </div>
    </form>
  );
}

