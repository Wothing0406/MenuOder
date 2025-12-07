const { Op } = require('sequelize');
const Voucher = require('../models/Voucher');
const Store = require('../models/Store');

const normalizeCode = (code = '') => code.trim().toUpperCase();

const parseNumber = (value, defaultValue = 0) => {
  if (value === undefined || value === null || value === '') return defaultValue;
  const parsed = parseFloat(value);
  return isNaN(parsed) ? defaultValue : parsed;
};

const buildVoucherPayload = (body) => {
  const code = normalizeCode(body.code || '');
  if (!code) {
    throw new Error('Mã voucher là bắt buộc');
  }

  const discountType = body.discountType === 'fixed' ? 'fixed' : 'percentage';
  const discountValue = parseNumber(body.discountValue);

  if (discountValue <= 0) {
    throw new Error('Giá trị giảm phải lớn hơn 0');
  }
  if (discountType === 'percentage' && discountValue > 100) {
    throw new Error('Giảm theo phần trăm không được vượt quá 100%');
  }

  const minOrderAmount = parseNumber(body.minOrderAmount);
  if (minOrderAmount < 0) {
    throw new Error('Giá trị đơn hàng tối thiểu phải lớn hơn hoặc bằng 0');
  }

  const maxDiscountAmount = body.maxDiscountAmount !== undefined
    ? parseNumber(body.maxDiscountAmount, null)
    : null;

  const usageLimit = body.usageLimit !== undefined && body.usageLimit !== null && body.usageLimit !== ''
    ? Math.max(1, parseInt(body.usageLimit, 10))
    : null;

  const neverExpires = Boolean(body.neverExpires);
  const expiresAt = body.expiresAt ? new Date(body.expiresAt) : null;
  const startsAt = body.startsAt ? new Date(body.startsAt) : null;

  if (!neverExpires && expiresAt && Number.isNaN(expiresAt.getTime())) {
    throw new Error('Ngày hết hạn không hợp lệ');
  }

  if (startsAt && Number.isNaN(startsAt.getTime())) {
    throw new Error('Ngày bắt đầu không hợp lệ');
  }

  if (!neverExpires && expiresAt && startsAt && expiresAt <= startsAt) {
    throw new Error('Ngày hết hạn phải sau ngày bắt đầu');
  }

  return {
    code,
    description: body.description?.trim() || null,
    discountType,
    discountValue,
    minOrderAmount,
    maxDiscountAmount: maxDiscountAmount && maxDiscountAmount > 0 ? maxDiscountAmount : null,
    usageLimit,
    neverExpires,
    expiresAt: neverExpires ? null : expiresAt,
    startsAt,
    isActive: body.isActive === undefined ? true : Boolean(body.isActive)
  };
};

const calculateDiscountAmount = (voucher, orderAmount) => {
  if (!orderAmount || orderAmount <= 0) return 0;
  let discount = 0;
  if (voucher.discountType === 'percentage') {
    discount = (orderAmount * Number(voucher.discountValue)) / 100;
  } else {
    discount = Number(voucher.discountValue);
  }

  if (voucher.maxDiscountAmount) {
    discount = Math.min(discount, Number(voucher.maxDiscountAmount));
  }

  return Math.min(discount, orderAmount);
};

const ensureVoucherActive = (voucher) => {
  if (!voucher.isActive) {
    throw new Error('Voucher này đã bị vô hiệu hoá');
  }

  const now = new Date();
  if (voucher.startsAt && now < voucher.startsAt) {
    throw new Error('Voucher chưa đến thời gian sử dụng');
  }

  if (!voucher.neverExpires && voucher.expiresAt && now > voucher.expiresAt) {
    throw new Error('Voucher đã hết hạn');
  }

  if (voucher.usageLimit && voucher.usageCount >= voucher.usageLimit) {
    throw new Error('Voucher đã đạt giới hạn sử dụng');
  }
};

const getStoreByUser = async (userId) => {
  const store = await Store.findOne({ where: { userId } });
  if (!store) {
    throw new Error('Không tìm thấy cửa hàng của bạn');
  }
  return store;
};

const publicVoucherResponse = (voucher, discountAmount = null) => ({
  id: voucher.id,
  storeId: voucher.storeId,
  code: voucher.code,
  description: voucher.description,
  discountType: voucher.discountType,
  discountValue: Number(voucher.discountValue),
  minOrderAmount: Number(voucher.minOrderAmount),
  maxDiscountAmount: voucher.maxDiscountAmount ? Number(voucher.maxDiscountAmount) : null,
  neverExpires: voucher.neverExpires,
  startsAt: voucher.startsAt,
  expiresAt: voucher.expiresAt,
  isActive: voucher.isActive,
  usageLimit: voucher.usageLimit,
  usageCount: voucher.usageCount,
  discountAmount: discountAmount !== null ? Number(discountAmount.toFixed(2)) : undefined
});

exports.getMyStoreVouchers = async (req, res) => {
  try {
    const store = await getStoreByUser(req.user.id);
    const vouchers = await Voucher.findAll({
      where: { storeId: store.id },
      order: [['createdAt', 'DESC']]
    });

    res.json({
      success: true,
      data: vouchers.map((voucher) => publicVoucherResponse(voucher))
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message || 'Không thể tải danh sách voucher'
    });
  }
};

exports.createMyStoreVoucher = async (req, res) => {
  try {
    const store = await getStoreByUser(req.user.id);
    const payload = buildVoucherPayload(req.body);

    const voucher = await Voucher.create({
      ...payload,
      storeId: store.id,
      createdBy: req.user.id
    });

    res.status(201).json({
      success: true,
      message: 'Tạo voucher thành công',
      data: publicVoucherResponse(voucher)
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message || 'Không thể tạo voucher'
    });
  }
};

exports.updateMyStoreVoucher = async (req, res) => {
  try {
    const store = await getStoreByUser(req.user.id);
    const { voucherId } = req.params;

    const voucher = await Voucher.findOne({
      where: { id: voucherId, storeId: store.id }
    });

    if (!voucher) {
      return res.status(404).json({
        success: false,
        message: 'Voucher không tồn tại'
      });
    }

    const payload = buildVoucherPayload({ ...voucher.toJSON(), ...req.body });

    await voucher.update(payload);

    res.json({
      success: true,
      message: 'Cập nhật voucher thành công',
      data: publicVoucherResponse(voucher)
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message || 'Không thể cập nhật voucher'
    });
  }
};

exports.deleteMyStoreVoucher = async (req, res) => {
  try {
    const store = await getStoreByUser(req.user.id);
    const { voucherId } = req.params;

    const voucher = await Voucher.findOne({
      where: { id: voucherId, storeId: store.id }
    });

    if (!voucher) {
      return res.status(404).json({
        success: false,
        message: 'Voucher không tồn tại'
      });
    }

    await voucher.destroy();

    res.json({
      success: true,
      message: 'Đã xoá voucher'
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message || 'Không thể xoá voucher'
    });
  }
};

exports.deleteMyStoreVoucherByCode = async (req, res) => {
  try {
    const store = await getStoreByUser(req.user.id);
    const code = normalizeCode(req.params.code || '');

    const voucher = await Voucher.findOne({
      where: { code, storeId: store.id }
    });

    if (!voucher) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy voucher với mã này'
      });
    }

    await voucher.destroy();

    res.json({
      success: true,
      message: 'Đã xoá voucher'
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message || 'Không thể xoá voucher'
    });
  }
};

exports.adminListVouchers = async (req, res) => {
  try {
    const { storeId, code, status } = req.query;
    const where = {};

    if (storeId) {
      if (storeId === 'global') {
        where.storeId = null;
      } else {
        where.storeId = parseInt(storeId);
      }
    }

    if (code) {
      where.code = normalizeCode(code);
    }

    if (status === 'active') {
      where.isActive = true;
    } else if (status === 'inactive') {
      where.isActive = false;
    }

    const vouchers = await Voucher.findAll({
      where,
      order: [['createdAt', 'DESC']]
    });

    // Convert Sequelize instances to plain objects and map
    const vouchersData = vouchers.map((voucher) => {
      try {
        return publicVoucherResponse(voucher);
      } catch (err) {
        console.error('Error processing voucher:', voucher?.id, err);
        // Return basic voucher data if publicVoucherResponse fails
        return {
          id: voucher.id,
          storeId: voucher.storeId,
          code: voucher.code,
          description: voucher.description,
          discountType: voucher.discountType,
          discountValue: Number(voucher.discountValue || 0),
          minOrderAmount: Number(voucher.minOrderAmount || 0),
          maxDiscountAmount: voucher.maxDiscountAmount ? Number(voucher.maxDiscountAmount) : null,
          neverExpires: voucher.neverExpires,
          startsAt: voucher.startsAt,
          expiresAt: voucher.expiresAt,
          isActive: voucher.isActive,
          usageLimit: voucher.usageLimit,
          usageCount: voucher.usageCount || 0
        };
      }
    });

    res.json({
      success: true,
      data: vouchersData
    });
  } catch (error) {
    console.error('Admin list vouchers error:', error);
    console.error('Error stack:', error.stack);
    res.status(500).json({
      success: false,
      message: 'Không thể tải danh sách voucher',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

exports.adminCreateVoucher = async (req, res) => {
  try {
    const payload = buildVoucherPayload(req.body);
    let storeId = req.body.storeId;

    if (storeId) {
      const store = await Store.findByPk(storeId);
      if (!store) {
        return res.status(404).json({
          success: false,
          message: 'Cửa hàng không tồn tại'
        });
      }
    } else {
      storeId = null; // voucher toàn hệ thống
      // Kiểm tra xem đã có voucher toàn hệ thống với mã này chưa
      const existingSystemVoucher = await Voucher.findOne({
        where: {
          storeId: null,
          code: payload.code
        }
      });
      if (existingSystemVoucher) {
        return res.status(400).json({
          success: false,
          message: 'Mã voucher toàn hệ thống đã tồn tại. Vui lòng sử dụng mã khác.'
        });
      }
    }

    // Admin routes don't have req.user, so createdBy can be null
    const voucher = await Voucher.create({
      ...payload,
      storeId,
      createdBy: null // Admin secret routes don't have user context
    });

    res.status(201).json({
      success: true,
      message: 'Tạo voucher thành công',
      data: publicVoucherResponse(voucher)
    });
  } catch (error) {
    console.error('Admin create voucher error:', error);
    console.error('Error stack:', error.stack);
    
    // Provide more helpful error messages
    let errorMessage = 'Không thể tạo voucher';
    
    if (error.name === 'SequelizeUniqueConstraintError') {
      errorMessage = 'Mã voucher đã tồn tại. Vui lòng sử dụng mã khác.';
    } else if (error.name === 'SequelizeValidationError') {
      errorMessage = 'Dữ liệu không hợp lệ: ' + (error.errors?.map(e => e.message).join(', ') || error.message);
    } else if (error.message) {
      errorMessage = error.message;
    }
    
    res.status(400).json({
      success: false,
      message: errorMessage,
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

exports.adminDeleteVoucher = async (req, res) => {
  try {
    const { voucherId } = req.params;
    const voucher = await Voucher.findByPk(voucherId);

    if (!voucher) {
      return res.status(404).json({
        success: false,
        message: 'Voucher không tồn tại'
      });
    }

    await voucher.destroy();

    res.json({
      success: true,
      message: 'Đã xoá voucher'
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message || 'Không thể xoá voucher'
    });
  }
};

exports.adminDeleteVoucherByCode = async (req, res) => {
  try {
    const code = normalizeCode(req.params.code || '');
    const { storeId } = req.query;

    const where = { code };
    if (storeId) {
      if (storeId === 'global') {
        where.storeId = null;
      } else {
        where.storeId = storeId;
      }
    }

    const voucher = await Voucher.findOne({ where });

    if (!voucher) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy voucher với mã này'
      });
    }

    await voucher.destroy();

    res.json({
      success: true,
      message: 'Đã xoá voucher'
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message || 'Không thể xoá voucher'
    });
  }
};

exports.validateVoucher = async (req, res) => {
  try {
    const code = normalizeCode(req.body.code || req.query.code || '');
    const orderAmount = parseNumber(req.body.orderAmount ?? req.query.orderAmount);
    let storeId = req.body.storeId || req.query.storeId;
    const storeSlug = req.body.storeSlug || req.query.storeSlug;

    if (!code) {
      return res.status(400).json({
        success: false,
        message: 'Vui lòng nhập mã voucher'
      });
    }

    if (storeSlug && !storeId) {
      const store = await Store.findOne({ where: { storeSlug } });
      if (!store) {
        return res.status(404).json({
          success: false,
          message: 'Không tìm thấy cửa hàng'
        });
      }
      storeId = store.id;
    }

    if (!orderAmount || orderAmount <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Giá trị đơn hàng không hợp lệ'
      });
    }

    let voucher = null;

    // Ưu tiên voucher riêng cho cửa hàng
    if (storeId) {
      voucher = await Voucher.findOne({
        where: { storeId, code }
      });
    }

    // Nếu không có, thử voucher toàn hệ thống (storeId IS NULL)
    if (!voucher) {
      voucher = await Voucher.findOne({
        where: {
          storeId: null,
          code
        }
      });
    }

    if (!voucher) {
      return res.status(404).json({
        success: false,
        message: 'Voucher không tồn tại'
      });
    }

    ensureVoucherActive(voucher);

    if (orderAmount < Number(voucher.minOrderAmount)) {
      return res.status(400).json({
        success: false,
        message: `Đơn hàng cần tối thiểu ${voucher.minOrderAmount}đ để dùng voucher này`
      });
    }

    const discountAmount = calculateDiscountAmount(voucher, orderAmount);

    res.json({
      success: true,
      message: 'Voucher hợp lệ',
      data: publicVoucherResponse(voucher, discountAmount)
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message || 'Không thể kiểm tra voucher'
    });
  }
};

