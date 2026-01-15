import { motion } from 'framer-motion';

const StoreClosedOverlay = ({ isVisible, storeName }) => {
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
        className="relative z-10 max-w-md mx-4 p-8 bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900
                   rounded-2xl shadow-2xl border border-gray-700/50"
      >
        {/* Glow effect */}
        <div className="absolute inset-0 bg-gradient-to-r from-red-500/20 via-orange-500/20 to-yellow-500/20
                        rounded-2xl blur-xl opacity-50 animate-pulse" />

        <div className="relative text-center">
          {/* Animated warning icon */}
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
            className="mx-auto mb-6 w-20 h-20 bg-gradient-to-br from-red-500 to-orange-600
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
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
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
            CỬA HÀNG TẠM THỜI ĐÓNG CỬA
          </motion.h2>

          {/* Subtitle */}
          <motion.p
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.4, duration: 0.6 }}
            className="text-gray-300 text-lg leading-relaxed mb-6"
          >
            Chúng tôi hiện chưa nhận đơn hàng vào thời điểm này.
            <br />
            Vui lòng quay lại sau.
          </motion.p>

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

          {/* Animated dots */}
          <motion.div
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 1.5, repeat: Infinity }}
            className="mt-6 flex justify-center space-x-2"
          >
            <div className="w-2 h-2 bg-red-400 rounded-full" />
            <div className="w-2 h-2 bg-orange-400 rounded-full" />
            <div className="w-2 h-2 bg-yellow-400 rounded-full" />
          </motion.div>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default StoreClosedOverlay;


