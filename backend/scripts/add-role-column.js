const { Sequelize } = require('sequelize');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../src/.env') });

// Connection string
const DATABASE_URL = process.env.DATABASE_URL;

async function addRoleColumn() {
  if (!DATABASE_URL) {
    console.error('❌ DATABASE_URL not found in environment variables');
    process.exit(1);
  }

  console.log('🔧 Adding role column to users table...\n');

  let sequelize;
  
  try {
    // Kết nối với database
    const isProduction = process.env.NODE_ENV === 'production';
    sequelize = new Sequelize(DATABASE_URL, {
      dialect: 'postgres',
      dialectOptions: {
        ssl: isProduction ? {
          require: true,
          rejectUnauthorized: false
        } : false
      },
      logging: console.log
    });

    await sequelize.authenticate();
    console.log('✅ Connected to database\n');

    // Kiểm tra xem cột role đã tồn tại chưa
    const [results] = await sequelize.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'users' AND column_name = 'role'
    `);

    if (results && results.length > 0) {
      console.log('ℹ️  Column "role" already exists in users table');
      console.log('✅ No action needed');
    } else {
      console.log('📝 Column "role" does not exist, adding it...');

      // Tạo ENUM type nếu chưa có
      try {
        await sequelize.query(`
          CREATE TYPE enum_users_role AS ENUM ('store_owner', 'admin')
        `);
        console.log('✅ Created ENUM type enum_users_role');
      } catch (err) {
        if (err.message.includes('already exists')) {
          console.log('ℹ️  ENUM type enum_users_role already exists');
        } else {
          throw err;
        }
      }

      // Thêm cột role
      await sequelize.query(`
        ALTER TABLE users 
        ADD COLUMN role enum_users_role NOT NULL DEFAULT 'store_owner'
      `);

      console.log('✅ Successfully added "role" column to users table');
      console.log('   Default value: "store_owner"');
    }

    // Kiểm tra lại
    const [verify] = await sequelize.query(`
      SELECT column_name, data_type, column_default
      FROM information_schema.columns 
      WHERE table_name = 'users' AND column_name = 'role'
    `);

    if (verify && verify.length > 0) {
      console.log('\n📊 Column details:');
      console.log('   Name:', verify[0].column_name);
      console.log('   Type:', verify[0].data_type);
      console.log('   Default:', verify[0].column_default);
    }

    console.log('\n✅ Migration completed successfully!');

  } catch (error) {
    console.error('\n❌ Error adding role column:');
    console.error('   Message:', error.message);
    console.error('   Code:', error.code);
    
    if (error.message.includes('already exists')) {
      console.log('\n💡 Column might already exist. Checking...');
    } else {
      console.error('\n💡 Please check:');
      console.error('   1. Database connection is correct');
      console.error('   2. You have ALTER TABLE permissions');
      console.error('   3. Database is accessible');
    }
    
    process.exit(1);
  } finally {
    if (sequelize) {
      await sequelize.close();
      console.log('\n🔌 Database connection closed');
    }
  }
}

// Chạy migration
if (require.main === module) {
  addRoleColumn()
    .then(() => {
      console.log('\n✨ Done!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('\n💥 Migration failed:', error);
      process.exit(1);
    });
}

module.exports = { addRoleColumn };

