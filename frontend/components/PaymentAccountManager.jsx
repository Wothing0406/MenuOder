import { useState, useEffect, useRef } from 'react';
import api from '../lib/api';
import toast from 'react-hot-toast';
import { formatVND } from '../lib/utils';
import { TargetIcon, CheckCircleIcon, AlertCircleIcon, EyeIcon, EyeOffIcon, PlusCircleIcon, EditIcon, DeleteIcon, BankIcon, WalletIcon, SparklesIcon, CloseIcon, SearchIcon, RefreshIcon } from './Icons';

export default function PaymentAccountManager({ storeId }) {
  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingAccount, setEditingAccount] = useState(null);
  const [verifying, setVerifying] = useState({});
  const [bankSearchQuery, setBankSearchQuery] = useState('');
  const [bankSearchResults, setBankSearchResults] = useState([]);
  const [showBankDropdown, setShowBankDropdown] = useState(false);
  const bankDropdownRef = useRef(null);
  const bankInputRef = useRef(null);

  const [formData, setFormData] = useState({
    accountType: 'bank_transfer',
    accountName: '',
    isDefault: false,
    isActive: true,
    // Bank fields
    bankAccountNumber: '',
    bankAccountName: '',
    bankName: '',
    bankCode: '',
    // ZaloPay fields
    zaloPayAppId: '',
    zaloPayKey1: '',
    zaloPayKey2: '',
    zaloPayMerchantId: ''
  });

  useEffect(() => {
    if (storeId) {
      console.log(`🔄 useEffect triggered with storeId: ${storeId}`);
      fetchAccounts();
    } else {
      console.error('❌ No storeId in useEffect');
    }
  }, [storeId]);

  // Debug: Log accounts state changes
  useEffect(() => {
    console.log(`📊 Accounts state changed: ${accounts.length} accounts`, accounts.map(acc => ({ id: acc.id, name: acc.accountName })));
  }, [accounts]);

  // Handle click outside to close bank dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        bankDropdownRef.current &&
        !bankDropdownRef.current.contains(event.target) &&
        bankInputRef.current &&
        !bankInputRef.current.contains(event.target)
      ) {
        setShowBankDropdown(false);
      }
    };

    if (showBankDropdown) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => {
        document.removeEventListener('mousedown', handleClickOutside);
      };
    }
  }, [showBankDropdown]);

  const fetchAccounts = async () => {
    if (!storeId) {
      console.error('❌ No storeId provided to fetchAccounts');
      return;
    }
    
    try {
      setLoading(true);
      console.log(`🔍 Fetching payment accounts for storeId: ${storeId}`);
      const res = await api.get(`/payment-accounts/store/${storeId}`);
      
      console.log('📦 Response from backend:', {
        success: res.data.success,
        dataLength: res.data.data?.length,
        data: res.data.data
      });
      
      if (res.data.success && res.data.data) {
        const fetchedAccounts = Array.isArray(res.data.data) ? res.data.data : [];
        console.log(`✅ Fetched ${fetchedAccounts.length} payment accounts from backend`);
        console.log('📋 All accounts:', JSON.stringify(fetchedAccounts, null, 2));
        
        // Log each account in detail
        fetchedAccounts.forEach((acc, index) => {
          console.log(`  [${index + 1}] Account ID: ${acc.id}`, {
            accountName: acc.accountName,
            accountType: acc.accountType,
            ...(acc.accountType === 'bank_transfer' ? {
              bankAccountNumber: acc.bankAccountNumber,
              bankAccountNumberLength: acc.bankAccountNumber?.length,
              bankName: acc.bankName,
            } : {}),
            isActive: acc.isActive !== undefined ? acc.isActive : true,
            isDefault: acc.isDefault !== undefined ? acc.isDefault : false,
            isVerified: acc.isVerified !== undefined ? acc.isVerified : false
          });
        });
        
        // CRITICAL: Always set accounts to the FULL array from backend - no filtering!
        // Ensure all accounts have default values for missing fields
        const normalizedAccounts = fetchedAccounts.map(acc => ({
          ...acc,
          isActive: acc.isActive !== undefined ? acc.isActive : true,
          isDefault: acc.isDefault !== undefined ? acc.isDefault : false,
          isVerified: acc.isVerified !== undefined ? acc.isVerified : false,
          // Ensure bankAccountNumber is string
          ...(acc.accountType === 'bank_transfer' && acc.bankAccountNumber ? {
            bankAccountNumber: String(acc.bankAccountNumber)
          } : {})
        }));
        
        console.log(`💾 Setting ${normalizedAccounts.length} accounts to state (normalized)`);
        setAccounts(normalizedAccounts);
        
        if (normalizedAccounts.length === 0) {
          console.log('⚠️ No payment accounts found for store:', storeId);
          // Don't show toast for empty state on initial load
        } else {
          console.log(`✅ Successfully set ${normalizedAccounts.length} accounts in state`);
          console.log('📊 Current accounts state:', normalizedAccounts.map(acc => ({
            id: acc.id,
            name: acc.accountName,
            type: acc.accountType
          })));
        }
      } else {
        console.error('❌ Failed to fetch payment accounts:', res.data);
        const errorMsg = res.data?.message || 'Không thể tải danh sách tài khoản thanh toán';
        toast.error(errorMsg);
        setAccounts([]); // Set empty array on error
      }
    } catch (error) {
      console.error('❌ Error fetching payment accounts:', error);
      console.error('Error details:', error.response?.data);
      toast.error('Không thể tải danh sách tài khoản thanh toán');
      setAccounts([]); // Set empty array on error
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      setLoading(true);
      
      // Log form data before submitting to ensure full account number
      if (formData.accountType === 'bank_transfer') {
        console.log('Submitting payment account:', {
          bankAccountNumber: formData.bankAccountNumber,
          bankAccountNumberLength: formData.bankAccountNumber?.length,
          bankAccountName: formData.bankAccountName,
          bankName: formData.bankName
        });
      }
      
      if (editingAccount) {
        // Update existing account
        const res = await api.put(`/payment-accounts/${editingAccount.id}`, formData);
        if (res.data.success) {
          toast.success('Cập nhật tài khoản thành công');
          setEditingAccount(null);
        }
      } else {
        // Create new account
        console.log(`➕ Creating new payment account for storeId: ${storeId}`);
        console.log('📝 Form data:', formData);
        try {
          const res = await api.post(`/payment-accounts/store/${storeId}`, formData);
          console.log('📦 Response from backend:', JSON.stringify(res.data, null, 2));
          
          if (res.data.success && res.data.data) {
            console.log(`✅ Account created successfully:`, res.data.data);
            toast.success(res.data.message || 'Tài khoản đã được tạo thành công');
            setShowAddForm(false);
            
            // CRITICAL: Always fetch accounts after create to ensure UI is in sync
            console.log('🔄 Fetching accounts after create...');
            // Small delay to ensure database is updated
            await new Promise(resolve => setTimeout(resolve, 500));
            await fetchAccounts();
            console.log('✅ Accounts refreshed after create');
          } else {
            console.error('❌ Failed to create account:', res.data);
            const errorMsg = res.data?.message || 'Không thể tạo tài khoản';
            toast.error(errorMsg);
          }
        } catch (createError) {
          console.error('❌ Error creating account:', createError);
          console.error('Error response:', createError.response?.data);
          const errorMsg = createError.response?.data?.message || createError.message || 'Lỗi khi tạo tài khoản. Vui lòng thử lại.';
          toast.error(errorMsg);
        }
      }
      
      // Reset form
      setFormData({
        accountType: 'bank_transfer',
        accountName: '',
        isDefault: false,
        isActive: true,
        bankAccountNumber: '',
        bankAccountName: '',
        bankName: '',
        bankCode: '',
        zaloPayAppId: '',
        zaloPayKey1: '',
        zaloPayKey2: '',
        zaloPayMerchantId: ''
      });
      
      // CRITICAL: Always fetch ALL accounts after create/update
      console.log('🔄 Refreshing accounts list after save...');
      await fetchAccounts();
      console.log('✅ Accounts list refreshed');
    } catch (error) {
      console.error('Error saving payment account:', error);
      toast.error(error.response?.data?.message || 'Lỗi khi lưu tài khoản');
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async (accountId) => {
    try {
      setVerifying(prev => ({ ...prev, [accountId]: true }));
      const res = await api.post(`/payment-accounts/${accountId}/verify`);
      
      if (res.data.success) {
        toast.success('Xác thực tài khoản thành công');
      } else {
        toast.error(res.data.message || 'Xác thực thất bại');
      }
      
      await fetchAccounts();
    } catch (error) {
      console.error('Error verifying account:', error);
      toast.error(error.response?.data?.message || 'Lỗi khi xác thực tài khoản');
    } finally {
      setVerifying(prev => ({ ...prev, [accountId]: false }));
    }
  };

  const handleDelete = async (accountId) => {
    if (!confirm('Bạn có chắc muốn xóa tài khoản này?')) return;
    
    try {
      const res = await api.delete(`/payment-accounts/${accountId}`);
      if (res.data.success) {
        toast.success('Xóa tài khoản thành công');
        await fetchAccounts();
      }
    } catch (error) {
      console.error('Error deleting account:', error);
      toast.error(error.response?.data?.message || 'Lỗi khi xóa tài khoản');
    }
  };

  const handleEdit = (account) => {
    setEditingAccount(account);
    setBankSearchQuery(account.bankName || '');
    setFormData({
      accountType: account.accountType,
      accountName: account.accountName,
      isDefault: account.isDefault,
      isActive: account.isActive !== undefined ? account.isActive : true,
      bankAccountNumber: account.bankAccountNumber || '',
      bankAccountName: account.bankAccountName || '',
      bankName: account.bankName || '',
      bankCode: account.bankCode || '',
      zaloPayAppId: account.zaloPayAppId || '',
      zaloPayKey1: '', // Don't pre-fill sensitive data
      zaloPayKey2: '',
      zaloPayMerchantId: account.zaloPayMerchantId || ''
    });
    setShowAddForm(true);
  };


  if (loading && accounts.length === 0) {
    return <div className="text-center py-8">Đang tải...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-bold">Tài khoản thanh toán</h3>
        <button
          onClick={() => {
            setShowAddForm(true);
            setEditingAccount(null);
            setBankSearchQuery('');
            setBankSearchResults([]);
            setShowBankDropdown(false);
            setFormData({
              accountType: 'bank_transfer',
              accountName: '',
              isDefault: false,
              isActive: true,
              bankAccountNumber: '',
              bankAccountName: '',
              bankName: '',
              bankCode: '',
              zaloPayAppId: '',
              zaloPayKey1: '',
              zaloPayKey2: '',
              zaloPayMerchantId: ''
            });
          }}
          className="group relative inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-purple-700 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-300 overflow-hidden"
        >
          <span className="absolute inset-0 bg-gradient-to-r from-purple-700 to-purple-800 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></span>
          <PlusCircleIcon className="w-5 h-5 relative z-10 transform group-hover:rotate-90 transition-transform duration-300" />
          <span className="relative z-10">Thêm tài khoản</span>
          <SparklesIcon className="w-4 h-4 relative z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        </button>
      </div>

      {/* Account List */}
      <div className="grid gap-4">
        {/* Statistics - Always show if has accounts */}
        {accounts.length > 0 && (
          <div className="text-sm text-gray-600 mb-2 p-2 bg-gray-50 rounded">
            <strong>Tổng số tài khoản đã liên kết:</strong> {accounts.length} 
            ({accounts.filter(acc => acc.accountType === 'bank_transfer').length} ngân hàng, {accounts.filter(acc => acc.accountType === 'zalopay').length} ZaloPay)
            <br />
            <span className="text-xs">
              - Active: {accounts.filter(acc => acc.isActive).length} | 
              - Inactive: {accounts.filter(acc => !acc.isActive).length} | 
              - Verified: {accounts.filter(acc => acc.isVerified).length} | 
              - Default: {accounts.filter(acc => acc.isDefault).length}
            </span>
          </div>
        )}

        {/* Section to select default account for QR code generation - ALWAYS SHOW IF HAS BANK ACCOUNTS */}
        {(() => {
          const bankAccounts = accounts.filter(acc => acc.accountType === 'bank_transfer');
          console.log(`🎯 Checking default account section: ${bankAccounts.length} bank accounts found`);
          if (bankAccounts.length > 0) {
            console.log('✅ Showing default account selection section');
          } else {
            console.log('⚠️ No bank accounts found, hiding default account selection section');
          }
          return bankAccounts.length > 0;
        })() && (
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-400 rounded-lg p-5 mb-6 shadow-lg">
            <div className="flex items-center gap-3 mb-3">
              <div className="flex items-center justify-center w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full shadow-lg">
                <TargetIcon className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="font-bold text-lg text-blue-900">
                  Chọn tài khoản ngân hàng để hiển thị QR code
                </h3>
                <p className="text-sm text-blue-700 mt-1">
                  Tài khoản được chọn sẽ được dùng để tạo QR code khi khách hàng đặt hàng. <strong>Chỉ có thể chọn 1 tài khoản.</strong>
                </p>
              </div>
            </div>
            <div className="space-y-2 mt-4">
              {accounts
                .filter(acc => acc.accountType === 'bank_transfer')
                .map(acc => (
                  <div 
                    key={acc.id} 
                    className={`flex items-center gap-3 p-3 bg-white rounded-lg border-2 transition-all ${
                      acc.isDefault 
                        ? 'border-green-400 bg-green-50 shadow-md' 
                        : 'border-blue-200 hover:border-blue-400 hover:shadow'
                    }`}
                  >
                    <input
                      type="radio"
                      name="defaultBankAccountForQR"
                      id={`defaultQR_${acc.id}`}
                      checked={acc.isDefault}
                      onChange={async () => {
                        try {
                          // Update this account to be default
                          const res = await api.put(`/payment-accounts/${acc.id}`, {
                            isDefault: true
                          });
                          if (res.data.success) {
                            toast.success(`Đã chọn "${acc.accountName}" làm tài khoản mặc định cho QR code`);
                            await fetchAccounts(); // Refresh list
                          }
                        } catch (error) {
                          console.error('Error setting default account:', error);
                          toast.error('Không thể cập nhật tài khoản mặc định');
                        }
                      }}
                      className="cursor-pointer w-5 h-5"
                    />
                    <label htmlFor={`defaultQR_${acc.id}`} className="flex-1 cursor-pointer">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-gray-900">{acc.accountName}</span>
                          <span className="text-sm text-gray-600">({acc.bankName})</span>
                          {!acc.isVerified && (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 text-xs bg-yellow-100 text-yellow-700 rounded font-semibold">
                              <AlertCircleIcon className="w-3 h-3" />
                              Chưa xác thực
                            </span>
                          )}
                          {!acc.isActive && (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 text-xs bg-gray-100 text-gray-700 rounded font-semibold">
                              <EyeOffIcon className="w-3 h-3" />
                              Đã ẩn
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="text-sm font-mono text-gray-700 bg-gray-100 px-2 py-1 rounded">
                            STK: {acc.bankAccountNumber}
                          </span>
                          {acc.isDefault && (
                            <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-lg font-bold text-sm shadow-md">
                              <CheckCircleIcon className="w-4 h-4" />
                              ĐANG DÙNG
                            </span>
                          )}
                        </div>
                      </div>
                    </label>
                  </div>
                ))}
            </div>
          </div>
        )}
        {/* Render all accounts - NO FILTERING */}
        {accounts.map((account, index) => {
          // Log rendering for debugging
          if (index === 0) {
            console.log(`🎨 Rendering ${accounts.length} accounts in UI`);
          }
          console.log(`  [${index + 1}] Rendering account:`, account.id, account.accountName);
          return (
            <div key={account.id} className="bg-white rounded-lg border p-4">
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <h4 className="font-semibold">{account.accountName}</h4>
                  <span className={`px-2 py-1 rounded text-xs ${
                    account.accountType === 'bank_transfer' 
                      ? 'bg-blue-100 text-blue-700' 
                      : 'bg-purple-100 text-purple-700'
                  }`}>
                    {account.accountType === 'bank_transfer' ? 'Ngân hàng' : 'ZaloPay'}
                  </span>
                  {account.isDefault && account.accountType === 'bank_transfer' && (
                    <span className="inline-flex items-center gap-1 px-2 py-1 rounded text-xs bg-gradient-to-r from-green-500 to-emerald-600 text-white font-bold">
                      <CheckCircleIcon className="w-3 h-3" />
                      Tài khoản QR mặc định
                    </span>
                  )}
                  <span className={`px-2 py-1 rounded text-xs ${
                    account.isVerified 
                      ? 'bg-green-100 text-green-700' 
                      : 'bg-red-100 text-red-700'
                  }`}>
                    {account.isVerified ? 'Đã xác thực' : 'Chưa xác thực'}
                  </span>
                  <span className={`px-2 py-1 rounded text-xs ${
                    account.isActive 
                      ? 'bg-blue-100 text-blue-700' 
                      : 'bg-gray-100 text-gray-700'
                  }`}>
                    {account.isActive ? 'Hiển thị' : 'Ẩn'}
                  </span>
                </div>
                
                {account.accountType === 'bank_transfer' ? (
                  <div className="text-sm text-gray-600 space-y-1">
                    <p><strong>Ngân hàng:</strong> {account.bankName}</p>
                    <p><strong>STK:</strong> {account.bankAccountNumber}</p>
                    <p><strong>Chủ TK:</strong> {account.bankAccountName}</p>
                  </div>
                ) : (
                  <div className="text-sm text-gray-600 space-y-1">
                    <p><strong>App ID:</strong> {account.zaloPayAppId}</p>
                    <p><strong>Merchant ID:</strong> {account.zaloPayMerchantId || 'Không có'}</p>
                    <p><strong>Key 1:</strong> {account.hasKey1 ? 'Đã cấu hình' : 'Chưa cấu hình'}</p>
                  </div>
                )}
                
                {account.verificationError && (
                  <p className="text-sm text-red-600 mt-2">
                    <strong>Lỗi xác thực:</strong> {account.verificationError}
                  </p>
                )}
              </div>
              
              <div className="flex gap-2 items-center flex-wrap">
                {/* Button to set as default for bank_transfer accounts - Allow even if not verified */}
                {account.accountType === 'bank_transfer' && !account.isDefault && (
                  <button
                    onClick={async () => {
                      try {
                        console.log(`Setting account ${account.id} (${account.accountName}) as default...`);
                        const res = await api.put(`/payment-accounts/${account.id}`, {
                          isDefault: true
                        });
                        if (res.data.success) {
                          console.log(`Successfully set account ${account.id} as default`);
                          toast.success(`Đã chọn "${account.accountName}" làm tài khoản mặc định cho QR code`);
                          await fetchAccounts();
                        } else {
                          console.error('Failed to set default:', res.data);
                          toast.error(res.data.message || 'Không thể cập nhật tài khoản mặc định');
                        }
                      } catch (error) {
                        console.error('Error setting default account:', error);
                        console.error('Error response:', error.response?.data);
                        toast.error(error.response?.data?.message || 'Không thể cập nhật tài khoản mặc định');
                      }
                    }}
                    className="group relative inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white text-sm font-semibold rounded-lg shadow-md hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-200 overflow-hidden"
                  >
                    <span className="absolute inset-0 bg-gradient-to-r from-blue-700 to-blue-800 opacity-0 group-hover:opacity-100 transition-opacity duration-200"></span>
                    <TargetIcon className="w-4 h-4 relative z-10" />
                    <span className="relative z-10">Đặt làm QR mặc định</span>
                  </button>
                )}
                {/* Only show active toggle for verified accounts */}
                {account.isVerified && (
                  <label className="flex items-center gap-2 text-sm">
                    <input
                      type="checkbox"
                      checked={account.isActive}
                      onChange={async (e) => {
                        try {
                          const res = await api.put(`/payment-accounts/${account.id}`, {
                            isActive: e.target.checked
                          });
                          if (res.data.success) {
                            toast.success(e.target.checked ? 'Tài khoản đã được hiển thị' : 'Tài khoản đã được ẩn');
                            await fetchAccounts();
                          }
                        } catch (error) {
                          console.error('Error updating account active status:', error);
                          toast.error(error.response?.data?.message || 'Lỗi khi cập nhật trạng thái');
                        }
                      }}
                      className="w-4 h-4"
                    />
                    <span className="text-xs text-gray-600">Hiển thị cho khách</span>
                  </label>
                )}
                {!account.isVerified && (
                  <button
                    onClick={() => handleVerify(account.id)}
                    disabled={verifying[account.id]}
                    className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
                  >
                    {verifying[account.id] ? 'Đang xác thực...' : 'Xác thực'}
                  </button>
                )}
                <button
                  onClick={() => handleEdit(account)}
                  className="group relative inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-gray-600 to-gray-700 text-white text-sm font-semibold rounded-lg shadow-md hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-200 overflow-hidden"
                >
                  <span className="absolute inset-0 bg-gradient-to-r from-gray-700 to-gray-800 opacity-0 group-hover:opacity-100 transition-opacity duration-200"></span>
                  <EditIcon className="w-4 h-4 relative z-10" />
                  <span className="relative z-10">Sửa</span>
                </button>
                <button
                  onClick={() => handleDelete(account.id)}
                  className="group relative inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-red-600 to-red-700 text-white text-sm font-semibold rounded-lg shadow-md hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-200 overflow-hidden"
                >
                  <span className="absolute inset-0 bg-gradient-to-r from-red-700 to-red-800 opacity-0 group-hover:opacity-100 transition-opacity duration-200"></span>
                  <DeleteIcon className="w-4 h-4 relative z-10" />
                  <span className="relative z-10">Xóa</span>
                </button>
              </div>
            </div>
          </div>
          );
        })}
        
        {accounts.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            Chưa có tài khoản thanh toán nào. Thêm tài khoản để khách hàng có thể thanh toán online.
          </div>
        )}
      </div>

      {/* Add/Edit Form Modal */}
      {showAddForm && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-0 sm:p-4 animate-fadeIn overflow-y-auto">
          <div className="bg-white rounded-none sm:rounded-2xl shadow-2xl max-w-2xl w-full min-h-screen sm:min-h-0 sm:max-h-[90vh] overflow-hidden flex flex-col animate-scaleIn m-0 sm:m-auto">
            {/* Header with gradient */}
            <div className="bg-gradient-to-r from-purple-600 to-blue-600 px-6 py-5 text-white">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {formData.accountType === 'bank_transfer' ? (
                    <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center backdrop-blur-sm">
                      <BankIcon className="w-6 h-6 text-white" />
                    </div>
                  ) : (
                    <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center backdrop-blur-sm">
                      <WalletIcon className="w-6 h-6 text-white" />
                    </div>
                  )}
                  <div>
                    <h3 className="text-xl font-bold">
                      {editingAccount ? 'Sửa tài khoản' : 'Thêm tài khoản thanh toán'}
                    </h3>
                    <p className="text-sm text-white/90 mt-0.5">
                      {formData.accountType === 'bank_transfer' ? 'Chuyển khoản ngân hàng' : 'ZaloPay'}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => {
                    setShowAddForm(false);
                    setEditingAccount(null);
                    setBankSearchQuery('');
                    setBankSearchResults([]);
                    setShowBankDropdown(false);
                  }}
                  className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-white/20 transition-colors"
                >
                  <CloseIcon className="w-5 h-5 text-white" />
                </button>
              </div>
            </div>

            {/* Form Content */}
            <div className="flex-1 overflow-y-auto p-6">
              <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Loại tài khoản</label>
                <select
                  value={formData.accountType}
                  onChange={(e) => setFormData(prev => ({ ...prev, accountType: e.target.value }))}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition-all outline-none bg-white"
                  disabled={editingAccount}
                >
                  <option value="bank_transfer">Chuyển khoản ngân hàng</option>
                  <option value="zalopay">ZaloPay</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  Tên hiển thị <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.accountName}
                  onChange={(e) => setFormData(prev => ({ ...prev, accountName: e.target.value }))}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition-all outline-none"
                  placeholder="VD: Tài khoản chính, TK dự phòng..."
                  required
                />
              </div>

              <div className="space-y-4">
                {/* For bank_transfer: Only allow 1 default account (radio button) */}
                {formData.accountType === 'bank_transfer' ? (
                  <div className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-xl">
                    <label className="block text-sm font-bold mb-3 text-blue-900">
                      Chọn tài khoản mặc định để hiển thị QR
                    </label>
                    <div className="space-y-2">
                      {accounts
                        .filter(acc => acc.accountType === 'bank_transfer')
                        .map(acc => (
                          <div key={acc.id} className="flex items-center gap-2">
                            <input
                              type="radio"
                              name="defaultBankAccount"
                              id={`defaultBank_${acc.id}`}
                              checked={
                                editingAccount 
                                  ? (editingAccount.id === acc.id && formData.isDefault)
                                  : acc.isDefault
                              }
                              onChange={() => {
                                if (editingAccount && editingAccount.id === acc.id) {
                                  // If editing this account, set it as default
                                  setFormData(prev => ({ ...prev, isDefault: true }));
                                }
                                // If not editing, can't change other accounts' default status
                              }}
                              disabled={editingAccount && editingAccount.id !== acc.id}
                            />
                            <label htmlFor={`defaultBank_${acc.id}`} className="text-sm text-gray-700">
                              {acc.accountName} - {acc.bankName} ({acc.bankAccountNumber})
                              {acc.isDefault && !editingAccount && <span className="text-green-600 ml-1">(Hiện tại)</span>}
                            </label>
                          </div>
                        ))}
                      {accounts.filter(acc => acc.accountType === 'bank_transfer').length === 0 && (
                        <p className="text-xs text-gray-500">Chưa có tài khoản ngân hàng nào</p>
                      )}
                      {!editingAccount && (
                        <div className="flex items-center gap-2">
                          <input
                            type="radio"
                            name="defaultBankAccount"
                            id="defaultBank_new"
                            checked={formData.isDefault && !accounts.some(acc => acc.accountType === 'bank_transfer' && acc.isDefault)}
                            onChange={() => setFormData(prev => ({ ...prev, isDefault: true }))}
                          />
                          <label htmlFor="defaultBank_new" className="text-sm text-gray-700">
                            Đặt tài khoản này làm mặc định (chỉ 1 tài khoản được chọn)
                          </label>
                        </div>
                      )}
                      {editingAccount && editingAccount.accountType === 'bank_transfer' && (
                        <div className="flex items-center gap-2">
                          <input
                            type="radio"
                            name="defaultBankAccount"
                            id="defaultBank_edit"
                            checked={formData.isDefault}
                            onChange={() => setFormData(prev => ({ ...prev, isDefault: true }))}
                          />
                          <label htmlFor="defaultBank_edit" className="text-sm text-gray-700">
                            Đặt tài khoản này làm mặc định
                          </label>
                        </div>
                      )}
                    </div>
                    <div className="flex items-start gap-2 mt-3 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                      <AlertCircleIcon className="w-4 h-4 text-yellow-600 mt-0.5 flex-shrink-0" />
                      <p className="text-xs text-yellow-800">
                        Chỉ có 1 tài khoản ngân hàng được chọn làm mặc định. QR code sẽ được tạo từ tài khoản mặc định này.
                      </p>
                    </div>
                  </div>
                ) : (
                  // For ZaloPay: Keep checkbox (can have multiple)
                  <div className="flex items-center gap-3 p-3 bg-purple-50 border border-purple-200 rounded-xl">
                    <input
                      type="checkbox"
                      id="isDefault"
                      checked={formData.isDefault}
                      onChange={(e) => setFormData(prev => ({ ...prev, isDefault: e.target.checked }))}
                      className="w-5 h-5 text-purple-600 rounded focus:ring-purple-500"
                    />
                    <label htmlFor="isDefault" className="text-sm font-semibold text-purple-900 cursor-pointer">
                      Đặt làm tài khoản mặc định
                    </label>
                  </div>
                )}
                <div className="flex items-center gap-3 p-3 bg-gray-50 border border-gray-200 rounded-xl">
                  <input
                    type="checkbox"
                    id="isActive"
                    checked={formData.isActive !== undefined ? formData.isActive : true}
                    onChange={(e) => setFormData(prev => ({ ...prev, isActive: e.target.checked }))}
                    className="w-5 h-5 text-purple-600 rounded focus:ring-purple-500"
                  />
                  <label htmlFor="isActive" className="text-sm font-semibold text-gray-700 cursor-pointer">
                    Hiển thị cho khách hàng (tài khoản này sẽ xuất hiện trong trang thanh toán)
                  </label>
                </div>
              </div>

              {formData.accountType === 'bank_transfer' ? (
                <>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">
                      Ngân hàng <span className="text-red-500">*</span>
                    </label>
                    <div className="relative" ref={bankDropdownRef}>
                      <div className="relative">
                        <SearchIcon className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input
                          ref={bankInputRef}
                          type="text"
                          value={bankSearchQuery || formData.bankName}
                          onChange={(e) => {
                            const query = e.target.value;
                            setBankSearchQuery(query);
                            if (query.trim()) {
                              setShowBankDropdown(true);
                              api.get(`/bank-transfer/banks?search=${encodeURIComponent(query)}`)
                                .then(res => {
                                  if (res.data.success) {
                                    setBankSearchResults(res.data.data);
                                  }
                                })
                                .catch(err => {
                                  console.error('Search banks error:', err);
                                  setBankSearchResults([]);
                                });
                            } else {
                              setBankSearchResults([]);
                              setShowBankDropdown(false);
                            }
                          }}
                          onFocus={() => {
                            if (!bankSearchQuery.trim() && bankSearchResults.length === 0) {
                              api.get('/bank-transfer/banks')
                                .then(res => {
                                  if (res.data.success) {
                                    setBankSearchResults(res.data.data);
                                    setShowBankDropdown(true);
                                  }
                                })
                                .catch(err => {
                                  console.error('Load banks error:', err);
                                  setBankSearchResults([]);
                                });
                            } else if (bankSearchResults.length > 0) {
                              setShowBankDropdown(true);
                            }
                          }}
                          className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition-all outline-none"
                          placeholder="Tìm kiếm ngân hàng (VD: Vietcombank, Techcombank, ACB, MB Bank...)"
                          required
                        />
                      </div>
                      {showBankDropdown && bankSearchResults.length > 0 && (
                        <div
                          className="absolute z-[100] w-full mt-2 bg-white border-2 border-gray-200 rounded-xl shadow-2xl max-h-64 overflow-y-auto"
                          onMouseDown={(e) => e.preventDefault()}
                        >
                          {bankSearchResults.map((bank) => (
                            <div
                              key={bank.code}
                              onMouseDown={(e) => {
                                e.preventDefault();
                                setBankSearchQuery(bank.shortName);
                                setFormData(prev => ({
                                  ...prev,
                                  bankName: bank.shortName,
                                  bankCode: bank.code
                                }));
                                setShowBankDropdown(false);
                              }}
                              className="px-4 py-3 hover:bg-gradient-to-r hover:from-purple-50 hover:to-blue-50 cursor-pointer border-b border-gray-100 last:border-b-0 transition-all"
                            >
                              <div className="font-bold text-sm text-gray-800">{bank.shortName}</div>
                              <div className="text-xs text-gray-500 mt-0.5">{bank.name}</div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                    {formData.bankCode && (
                      <div className="mt-2 px-4 py-2 bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-lg flex items-center gap-2">
                        <CheckCircleIcon className="w-4 h-4 text-green-600" />
                        <p className="text-sm font-semibold text-green-700">
                          Đã chọn: <span className="font-bold">{formData.bankName}</span> (Mã: {formData.bankCode})
                        </p>
                      </div>
                    )}
                    <p className="text-xs text-gray-500 mt-2">
                      Tìm kiếm và chọn ngân hàng từ danh sách được VietQR hỗ trợ. Hỗ trợ hơn 30 ngân hàng tại Việt Nam.
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">
                      Số tài khoản <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      inputMode="numeric"
                      pattern="[0-9]*"
                      value={formData.bankAccountNumber}
                      onChange={(e) => {
                        const rawValue = e.target.value;
                        let value = rawValue.replace(/\D/g, '');
                        if (value.length <= 19) {
                          setFormData(prev => ({ ...prev, bankAccountNumber: value }));
                        }
                      }}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition-all outline-none font-mono text-lg"
                      placeholder="Nhập số tài khoản (chỉ số, tối đa 19 chữ số)"
                      maxLength={19}
                      required
                    />
                    <div className="mt-2 flex items-center justify-between">
                      <p className="text-xs text-gray-500">
                        Đã nhập: <span className="font-semibold">{formData.bankAccountNumber.length}/19</span> chữ số
                      </p>
                      {formData.bankAccountNumber && (
                        <p className="text-xs font-mono text-green-600 font-semibold">
                          {formData.bankAccountNumber}
                        </p>
                      )}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">
                      Tên chủ tài khoản <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={formData.bankAccountName}
                      onChange={(e) => setFormData(prev => ({ ...prev, bankAccountName: e.target.value }))}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition-all outline-none uppercase"
                      placeholder="Tên chủ tài khoản (viết hoa, không dấu)"
                      required
                    />
                  </div>
                </>
              ) : (
                <>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">
                      ZaloPay App ID <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={formData.zaloPayAppId}
                      onChange={(e) => setFormData(prev => ({ ...prev, zaloPayAppId: e.target.value }))}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition-all outline-none"
                      placeholder="Nhập ZaloPay App ID"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">
                      ZaloPay Key 1 <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="password"
                      value={formData.zaloPayKey1}
                      onChange={(e) => setFormData(prev => ({ ...prev, zaloPayKey1: e.target.value }))}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition-all outline-none font-mono"
                      placeholder="Nhập ZaloPay Key 1"
                      required={!editingAccount}
                    />
                    {editingAccount && (
                      <p className="text-xs text-gray-500 mt-1">
                        Để trống nếu không muốn thay đổi
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">ZaloPay Key 2 (Tùy chọn)</label>
                    <input
                      type="password"
                      value={formData.zaloPayKey2}
                      onChange={(e) => setFormData(prev => ({ ...prev, zaloPayKey2: e.target.value }))}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition-all outline-none font-mono"
                      placeholder="Nhập ZaloPay Key 2"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">Merchant ID (Tùy chọn)</label>
                    <input
                      type="text"
                      value={formData.zaloPayMerchantId}
                      onChange={(e) => setFormData(prev => ({ ...prev, zaloPayMerchantId: e.target.value }))}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition-all outline-none"
                      placeholder="Nhập Merchant ID"
                    />
                  </div>
                </>
              )}
              </form>
            </div>

            {/* Footer with buttons */}
            <div className="border-t border-gray-200 px-6 py-4 bg-gray-50">
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setShowAddForm(false);
                    setEditingAccount(null);
                    setBankSearchQuery('');
                    setBankSearchResults([]);
                    setShowBankDropdown(false);
                  }}
                  className="flex-1 px-6 py-3 border-2 border-gray-300 text-gray-700 font-semibold rounded-xl hover:bg-gray-100 transition-all"
                >
                  Hủy
                </button>
                <button
                  type="button"
                  onClick={handleSubmit}
                  disabled={loading}
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                >
                  {loading ? (
                    <span className="flex items-center justify-center gap-2">
                      <RefreshIcon className="w-5 h-5 animate-spin" />
                      Đang lưu...
                    </span>
                  ) : (
                    <span className="flex items-center justify-center gap-2">
                      <CheckCircleIcon className="w-5 h-5" />
                      {editingAccount ? 'Cập nhật' : 'Thêm tài khoản'}
                    </span>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
