const express = require('express');
const router = express.Router();

const voucherController = require('../controllers/voucherController');
const authMiddleware = require('../middleware/auth');
const requireRole = require('../middleware/role');
const adminSecret = require('../middleware/adminSecret');

// Public route for customers to validate voucher
router.post('/validate', voucherController.validateVoucher);

// Admin routes protected by secret key (no login required) - define BEFORE auth middleware
router.get('/admin', adminSecret, voucherController.adminListVouchers);
router.post('/admin', adminSecret, voucherController.adminCreateVoucher);
router.delete('/admin/:voucherId', adminSecret, voucherController.adminDeleteVoucher);
router.delete('/admin/code/:code', adminSecret, voucherController.adminDeleteVoucherByCode);

// Protected routes for store owners/admins
router.use(authMiddleware);

router.get('/my-store', requireRole('store_owner', 'admin'), voucherController.getMyStoreVouchers);
router.post('/my-store', requireRole('store_owner', 'admin'), voucherController.createMyStoreVoucher);
router.put('/my-store/:voucherId', requireRole('store_owner', 'admin'), voucherController.updateMyStoreVoucher);
router.delete('/my-store/:voucherId', requireRole('store_owner', 'admin'), voucherController.deleteMyStoreVoucher);
router.delete('/my-store/code/:code', requireRole('store_owner', 'admin'), voucherController.deleteMyStoreVoucherByCode);

module.exports = router;





