const { sequelize } = require('../src/config/database');
const { Store, PaymentAccount } = require('../src/models');

async function migrateExistingPaymentData() {
  try {
    console.log('🔄 Migrating existing payment data from stores to payment_accounts...');

    // Get all stores with payment configurations
    const { Op } = require('sequelize');
    const stores = await Store.findAll({
      where: {
        [Op.or]: [
          { bankAccountNumber: { [Op.ne]: null } },
          { zaloPayAppId: { [Op.ne]: null } }
        ]
      }
    });

    console.log(`📊 Found ${stores.length} stores with payment configurations`);

    let migratedBankAccounts = 0;
    let migratedZaloPayAccounts = 0;

    for (const store of stores) {
      console.log(`\n🏪 Processing store: ${store.storeName} (ID: ${store.id})`);

      // Migrate bank transfer configuration
      if (store.bankAccountNumber && store.bankAccountName && store.bankName) {
        try {
          const existingBankAccount = await PaymentAccount.findOne({
            where: {
              storeId: store.id,
              accountType: 'bank_transfer',
              bankAccountNumber: store.bankAccountNumber
            }
          });

          if (!existingBankAccount) {
            await PaymentAccount.create({
              storeId: store.id,
              accountType: 'bank_transfer',
              accountName: `${store.bankName} - ${store.bankAccountNumber}`,
              isActive: store.bankTransferQRIsActive || false,
              isDefault: true,
              isVerified: true,
              verifiedAt: new Date(),
              bankAccountNumber: store.bankAccountNumber,
              bankAccountName: store.bankAccountName,
              bankName: store.bankName,
              bankCode: store.bankCode
            });
            migratedBankAccounts++;
            console.log('  ✅ Migrated bank account');
          } else {
            console.log('  ⚠️  Bank account already exists, skipping');
          }
        } catch (error) {
          console.error('  ❌ Error migrating bank account:', error.message);
        }
      }

      // Migrate ZaloPay configuration
      if (store.zaloPayAppId && store.zaloPayKey1) {
        try {
          const existingZaloPayAccount = await PaymentAccount.findOne({
            where: {
              storeId: store.id,
              accountType: 'zalopay',
              zaloPayAppId: store.zaloPayAppId
            }
          });

          if (!existingZaloPayAccount) {
            await PaymentAccount.create({
              storeId: store.id,
              accountType: 'zalopay',
              accountName: `ZaloPay - ${store.zaloPayAppId}`,
              isActive: store.zaloPayIsActive || false,
              isDefault: true,
              isVerified: true, // Assume existing configs are verified
              verifiedAt: new Date(),
              zaloPayAppId: store.zaloPayAppId,
              zaloPayKey1: store.zaloPayKey1,
              zaloPayKey2: store.zaloPayKey2,
              zaloPayMerchantId: store.zaloPayMerchantId
            });
            migratedZaloPayAccounts++;
            console.log('  ✅ Migrated ZaloPay account');
          } else {
            console.log('  ⚠️  ZaloPay account already exists, skipping');
          }
        } catch (error) {
          console.error('  ❌ Error migrating ZaloPay account:', error.message);
        }
      }
    }

    console.log('\n📊 Migration Summary:');
    console.log(`  🏦 Bank accounts migrated: ${migratedBankAccounts}`);
    console.log(`  💳 ZaloPay accounts migrated: ${migratedZaloPayAccounts}`);
    console.log(`  📱 Total accounts migrated: ${migratedBankAccounts + migratedZaloPayAccounts}`);

    // Verify migration
    const totalPaymentAccounts = await PaymentAccount.count();
    console.log(`\n✅ Total payment accounts in database: ${totalPaymentAccounts}`);

    console.log('\n🎉 Migration completed successfully!');
    console.log('\n💡 Next steps:');
    console.log('  1. Test the new payment account system');
    console.log('  2. Update frontend to use new payment accounts API');
    console.log('  3. Consider removing old payment fields from stores table (optional)');

  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  } finally {
    await sequelize.close();
  }
}

// Run the migration
migrateExistingPaymentData();