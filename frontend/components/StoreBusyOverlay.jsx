import { motion } from 'framer-motion';

const StoreBusyOverlay = ({ isVisible, storeName, estimatedWaitMinutes }) => {
  if (!isVisible) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
      className="fixed inset-0 z-50 flex items-center justify-center"
    >
      {/* Backdrop with blur */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />

      {/* Content */}
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="relative z-10 max-w-md mx-4 p-8 bg-gradient-to-br from-orange-900 via-yellow-800 to-orange-900
                   rounded-2xl shadow-2xl border border-orange-700/50"
      >
        {/* Glow effect */}
        <div className="absolute inset-0 bg-gradient-to-r from-orange-500/20 via-yellow-500/20 to-red-500/20
                        rounded-2xl blur-xl opacity-50 animate-pulse" />

        <div className="relative text-center">
          {/* Animated busy icon */}
          <motion.div
            animate={{
              scale: [1, 1.1, 1],
              rotate: [0, 5, -5, 0]
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut"
            }}
            className="mx-auto mb-6 w-20 h-20 bg-gradient-to-br from-orange-500 to-yellow-600
                       rounded-full flex items-center justify-center shadow-lg"
          >
            <svg
              className="w-10 h-10 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </motion.div>

          {/* Title */}
          <motion.h2
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.6 }}
            className="text-2xl font-bold text-white mb-3 tracking-tight"
          >
            QUÁN ĐANG BẬN
          </motion.h2>

          {/* Subtitle */}
          <motion.p
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.4, duration: 0.6 }}
            className="text-gray-300 text-lg leading-relaxed mb-4"
          >
            Hiện tại quán đang xử lý nhiều đơn hàng.
            <br />
            Vui lòng đặt lại sau ít phút.
          </motion.p>

          {/* Wait time estimate */}
          {estimatedWaitMinutes && (
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.5, duration: 0.6 }}
              className="bg-orange-800/50 rounded-lg p-3 mb-6 border border-orange-600/30"
            >
              <p className="text-orange-200 text-sm">
                Ước tính chờ: <span className="font-semibold">{estimatedWaitMinutes} phút</span>
              </p>
            </motion.div>
          )}

          {/* Store name */}
          {storeName && (
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.6, duration: 0.6 }}
              className="text-gray-400 text-sm"
            >
              {storeName}
            </motion.div>
          )}

          {/* Animated loading dots */}
          <motion.div
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 1.5, repeat: Infinity }}
            className="mt-6 flex justify-center space-x-2"
          >
            <div className="w-2 h-2 bg-orange-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
            <div className="w-2 h-2 bg-yellow-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
            <div className="w-2 h-2 bg-orange-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
          </motion.div>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default StoreBusyOverlay;
