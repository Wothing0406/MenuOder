import { useState, useCallback, useEffect } from 'react';
import Cropper from 'react-easy-crop';
import { getCroppedImg } from '../lib/imageUtils';
import toast from 'react-hot-toast';
import 'react-easy-crop/react-easy-crop.css';

export default function ImageCrop({ imageSrc, onClose, onCropComplete }) {
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);
  const [loading, setLoading] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);

  useEffect(() => {
    if (imageSrc) {
      setImageLoaded(false);
      const img = new Image();
      img.onload = () => {
        setImageLoaded(true);
      };
      img.onerror = () => {
        console.error('Failed to load image:', imageSrc);
        toast.error('Không thể tải ảnh. Vui lòng thử lại.');
        setImageLoaded(false);
      };
      img.src = imageSrc;
      
      // Fallback: set loaded after a short delay if image is already cached
      setTimeout(() => {
        if (img.complete && img.naturalWidth > 0) {
          setImageLoaded(true);
        }
      }, 100);
    } else {
      setImageLoaded(false);
    }
  }, [imageSrc]);

  const onCropChange = useCallback((crop) => {
    setCrop(crop);
  }, []);

  const onZoomChange = useCallback((zoom) => {
    setZoom(zoom);
  }, []);

  const onCropCompleteCallback = useCallback((croppedArea, croppedAreaPixels) => {
    setCroppedAreaPixels(croppedAreaPixels);
  }, []);

  const handleSave = async () => {
    if (!croppedAreaPixels) {
      toast.error('Vui lòng điều chỉnh ảnh trước khi lưu');
      return;
    }

    try {
      setLoading(true);
      const croppedImage = await getCroppedImg(imageSrc, croppedAreaPixels);
      onCropComplete(croppedImage);
      onClose();
    } catch (error) {
      console.error('Error cropping image:', error);
      toast.error('Không thể xử lý ảnh');
    } finally {
      setLoading(false);
    }
  };

  if (!imageSrc) {
    return null;
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 z-50 overflow-y-auto">
      <div className="min-h-full flex items-center justify-center p-2">
        <div className="bg-white rounded-lg p-2 md:p-3 max-w-xs md:max-w-sm w-full my-2 shadow-2xl flex flex-col max-h-[95vh]">
          {/* Header - Very Compact */}
          <div className="flex items-center justify-between mb-1.5 flex-shrink-0">
            <h2 className="text-sm md:text-base font-bold text-gray-800">🖼️ Điều chỉnh ảnh</h2>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 text-lg md:text-xl font-bold w-6 h-6 md:w-7 md:h-7 flex items-center justify-center hover:bg-gray-100 rounded-full transition"
            >
              ×
            </button>
          </div>

          {/* Instructions - Very Compact */}
          <div className="bg-gradient-to-br from-purple-50 to-blue-50 p-1.5 rounded mb-1.5 border border-purple-200 flex-shrink-0">
            <p className="text-[10px] md:text-xs text-gray-700 text-center leading-tight">
              💡 Kéo di chuyển • Zoom • Crop vuông
            </p>
          </div>
          
          {/* Crop Area - Compact */}
          <div className="relative w-full bg-gray-900 rounded-lg overflow-hidden shadow-inner mb-1.5 flex-shrink-0" 
               style={{ 
                 aspectRatio: '1',
                 maxHeight: 'calc(100vh - 160px)',
                 minHeight: '160px'
               }}>
            {!imageLoaded ? (
              <div className="w-full h-full flex items-center justify-center" style={{ minHeight: '160px' }}>
                <div className="text-center">
                  <div className="animate-spin rounded-full h-6 w-6 md:h-8 md:w-8 border-b-2 border-white mx-auto mb-2"></div>
                  <p className="text-white text-[10px] md:text-xs">Đang tải...</p>
                </div>
              </div>
            ) : (
              <Cropper
                image={imageSrc}
                crop={crop}
                zoom={zoom}
                aspect={1}
                onCropChange={onCropChange}
                onZoomChange={onZoomChange}
                onCropComplete={onCropCompleteCallback}
                cropShape="rect"
                showGrid={true}
                restrictPosition={true}
              />
            )}
          </div>

          {/* Controls - Very Compact */}
          <div className="space-y-1.5 flex-shrink-0">
            <div>
              <label className="block text-[10px] md:text-xs font-medium text-gray-700 mb-0.5">
                🔍 Zoom: {Math.round(zoom * 100)}%
              </label>
              <input
                type="range"
                min={1}
                max={3}
                step={0.1}
                value={zoom}
                onChange={(e) => setZoom(parseFloat(e.target.value))}
                className="w-full h-1 md:h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-purple-600"
                style={{
                  background: `linear-gradient(to right, #8b5cf6 0%, #8b5cf6 ${((zoom - 1) / 2) * 100}%, #e2e8f0 ${((zoom - 1) / 2) * 100}%, #e2e8f0 100%)`
                }}
              />
            </div>

            <div className="flex gap-1.5">
              <button
                onClick={onClose}
                className="flex-1 px-2 py-1.5 md:px-3 md:py-2 bg-gray-200 text-gray-700 rounded-lg font-medium hover:bg-gray-300 transition text-xs md:text-sm"
              >
                ❌ Hủy
              </button>
              <button
                onClick={handleSave}
                disabled={loading}
                className="flex-1 px-2 py-1.5 md:px-3 md:py-2 bg-purple-600 text-white rounded-lg font-medium hover:bg-purple-700 transition disabled:opacity-50 disabled:cursor-not-allowed shadow-lg text-xs md:text-sm"
              >
                {loading ? '⏳...' : '✅ Lưu'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
