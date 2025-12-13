/**
 * Danh sách đầy đủ các ngân hàng được VietQR hỗ trợ
 * Source: https://vietqr.io/
 */

const VIETQR_BANKS = [
  { code: '970436', name: 'Ngân hàng TMCP Ngoại Thương Việt Nam', shortName: 'Vietcombank', alias: ['vcb', 'vietcombank', 'ngoại thương'] },
  { code: '970415', name: 'Ngân hàng TMCP Công thương Việt Nam', shortName: 'VietinBank', alias: ['vietinbank', 'vietin', 'công thương'] },
  { code: '970418', name: 'Ngân hàng TMCP Đầu tư và Phát triển Việt Nam', shortName: 'BIDV', alias: ['bidv', 'đầu tư phát triển'] },
  { code: '970416', name: 'Ngân hàng TMCP Á Châu', shortName: 'ACB', alias: ['acb', 'á châu'] },
  { code: '970407', name: 'Ngân hàng TMCP Kỹ thương Việt Nam', shortName: 'Techcombank', alias: ['tcb', 'techcombank', 'kỹ thương'] },
  { code: '970422', name: 'Ngân hàng TMCP Quân đội', shortName: 'MB Bank', alias: ['mbbank', 'mbb', 'quân đội'] },
  { code: '970432', name: 'Ngân hàng TMCP Việt Nam Thịnh Vượng', shortName: 'VPBank', alias: ['vpbank', 'vp', 'thịnh vượng'] },
  { code: '970423', name: 'Ngân hàng TMCP Tiên Phong', shortName: 'TPBank', alias: ['tpbank', 'tp', 'tiên phong'] },
  { code: '970403', name: 'Ngân hàng TMCP Sài Gòn Thương Tín', shortName: 'Sacombank', alias: ['sacombank', 'stb', 'sài gòn thương tín'] },
  { code: '970437', name: 'Ngân hàng TMCP Phát triển Thành phố Hồ Chí Minh', shortName: 'HDBank', alias: ['hdbank', 'hd', 'phát triển hcm'] },
  { code: '970443', name: 'Ngân hàng TMCP Sài Gòn - Hà Nội', shortName: 'SHB', alias: ['shb', 'sài gòn hà nội'] },
  { code: '970431', name: 'Ngân hàng TMCP Xuất Nhập khẩu Việt Nam', shortName: 'Eximbank', alias: ['eximbank', 'exim', 'xuất nhập khẩu'] },
  { code: '970426', name: 'Ngân hàng TMCP Hàng Hải', shortName: 'MSB', alias: ['msb', 'hàng hải', 'maritime'] },
  { code: '970441', name: 'Ngân hàng TMCP Quốc tế Việt Nam', shortName: 'VIB', alias: ['vib', 'quốc tế'] },
  { code: '970448', name: 'Ngân hàng TMCP Phương Đông', shortName: 'OCB', alias: ['ocb', 'phương đông', 'orient'] },
  { code: '970429', name: 'Ngân hàng TMCP Sài Gòn', shortName: 'SCB', alias: ['scb', 'sài gòn commercial'] },
  { code: '970427', name: 'Ngân hàng TMCP Việt Á', shortName: 'VietABank', alias: ['vietabank', 'viet a', 'việt á'] },
  { code: '970439', name: 'Ngân hàng TMCP Đại Chúng Việt Nam', shortName: 'PVcomBank', alias: ['pvbank', 'pv', 'đại chúng'] },
  { code: '970414', name: 'Ngân hàng TMCP Bắc Á', shortName: 'BacABank', alias: ['bacabank', 'bắc á'] },
  { code: '970405', name: 'Ngân hàng TMCP An Bình', shortName: 'ABBank', alias: ['abbank', 'an bình'] },
  { code: '970409', name: 'Ngân hàng TMCP Bản Việt', shortName: 'VietCapitalBank', alias: ['vietcapitalbank', 'bản việt'] },
  { code: '970424', name: 'Ngân hàng TMCP Quốc Dân', shortName: 'NCB', alias: ['ncb', 'quốc dân'] },
  { code: '970428', name: 'Ngân hàng TMCP Xăng dầu Petrolimex', shortName: 'PGBank', alias: ['pgbank', 'pg', 'xăng dầu'] },
  { code: '970440', name: 'Ngân hàng TNHH MTV Shinhan Việt Nam', shortName: 'ShinhanBank', alias: ['shinhanbank', 'shinhan'] },
  { code: '970433', name: 'Ngân hàng TMCP Việt Nam Thương Tín', shortName: 'VietBank', alias: ['vietbank', 'thương tín'] },
  { code: '970434', name: 'Ngân hàng TMCP Đông Nam Á', shortName: 'SeaBank', alias: ['seabank', 'sea', 'đông nam á'] },
  { code: '970435', name: 'Ngân hàng TMCP Bưu Điện Liên Việt', shortName: 'LienVietPostBank', alias: ['lienvietpostbank', 'lienviet', 'bưu điện'] },
  { code: '970449', name: 'Ngân hàng TMCP Kiên Long', shortName: 'KienLongBank', alias: ['kienlongbank', 'kiên long'] },
  { code: '970452', name: 'Ngân hàng TMCP Nam Á', shortName: 'NamABank', alias: ['namabank', 'nam á'] },
  { code: '970454', name: 'Ngân hàng TMCP Đại Dương', shortName: 'OceanBank', alias: ['oceanbank', 'đại dương'] },
  { code: '970456', name: 'Ngân hàng TMCP Dầu Khí Toàn Cầu', shortName: 'GPBank', alias: ['gpbank', 'gp', 'dầu khí'] },
  { code: '970458', name: 'Ngân hàng TMCP Xây dựng Việt Nam', shortName: 'CBBank', alias: ['cbbank', 'cb', 'xây dựng'] },
  { code: '970461', name: 'Ngân hàng TMCP Việt Nam Thịnh Vượng - Chi nhánh Ngân hàng số', shortName: 'VPBank NGS', alias: ['vpbank ngs', 'vp ngs'] },
  { code: '970462', name: 'Ngân hàng TMCP Việt Nam Thịnh Vượng - Chi nhánh Ngân hàng số', shortName: 'VPBank NGS 2', alias: ['vpbank ngs 2'] }
];

/**
 * Tìm ngân hàng theo tên hoặc mã
 */
function findBank(query) {
  if (!query) return VIETQR_BANKS;
  
  const queryLower = query.toLowerCase().trim();
  
  return VIETQR_BANKS.filter(bank => {
    // Tìm theo tên đầy đủ
    if (bank.name.toLowerCase().includes(queryLower)) return true;
    // Tìm theo tên ngắn
    if (bank.shortName.toLowerCase().includes(queryLower)) return true;
    // Tìm theo mã
    if (bank.code.includes(queryLower)) return true;
    // Tìm theo alias
    return bank.alias.some(alias => alias.includes(queryLower));
  });
}

/**
 * Lấy ngân hàng theo mã
 */
function getBankByCode(code) {
  return VIETQR_BANKS.find(bank => bank.code === code);
}

/**
 * Lấy mã ngân hàng từ tên
 */
function getBankCode(bankName) {
  if (!bankName) return null;
  
  const bankNameLower = bankName.toLowerCase().trim();
  
  // Tìm exact match trước
  const exactMatch = VIETQR_BANKS.find(bank => 
    bank.shortName.toLowerCase() === bankNameLower ||
    bank.name.toLowerCase() === bankNameLower
  );
  if (exactMatch) return exactMatch.code;
  
  // Tìm theo alias
  const aliasMatch = VIETQR_BANKS.find(bank =>
    bank.alias.some(alias => bankNameLower.includes(alias) || alias.includes(bankNameLower))
  );
  if (aliasMatch) return aliasMatch.code;
  
  return null;
}

module.exports = {
  VIETQR_BANKS,
  findBank,
  getBankByCode,
  getBankCode
};

