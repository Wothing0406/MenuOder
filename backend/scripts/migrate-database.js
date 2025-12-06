const { Sequelize } = require('sequelize');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../src/.env') });

// Import models để sử dụng
const oldDbPath = path.join(__dirname, '../src');
const newDbPath = path.join(__dirname, '../src');

// Connection string mới từ Render
const NEW_DATABASE_URL = process.env.NEW_DATABASE_URL || 
  'postgresql://menu_order_db_wfa4_user:YOuvv1yii0cC34ukdDhzY2rtM88p3pPL@dpg-d4j8lg6uk2gs73bfdtqg-a/menu_order_db_wfa4';

// Thứ tự các bảng để migrate (theo thứ tự phụ thuộc)
const TABLE_ORDER = [
  'users',
  'stores',
  'categories',
  'items',
  'item_options',
  'item_accompaniments',
  'vouchers',
  'orders',
  'order_items',
  'reviews'
];

// Hàm tạo connection cho database cũ
function createOldDatabaseConnection() {
  const hasPostgresUrl = process.env.DATABASE_URL && (
    process.env.DATABASE_URL.includes('postgresql://') || 
    process.env.DATABASE_URL.includes('postgres://') ||
    process.env.DATABASE_URL.includes('postgres')
  );

  if (process.env.DATABASE_URL && hasPostgresUrl) {
    return new Sequelize(process.env.DATABASE_URL, {
      dialect: 'postgres',
      dialectOptions: {
        ssl: process.env.NODE_ENV === 'production' ? {
          require: true,
          rejectUnauthorized: false
        } : false
      },
      logging: false
    });
  } else if (process.env.DB_TYPE === 'postgres') {
    return new Sequelize(
      process.env.DB_NAME || 'menu_order_db',
      process.env.DB_USER || 'postgres',
      process.env.DB_PASSWORD || '',
      {
        host: process.env.DB_HOST || 'localhost',
        port: parseInt(process.env.DB_PORT) || 5432,
        dialect: 'postgres',
        dialectOptions: {
          ssl: process.env.NODE_ENV === 'production' ? {
            require: true,
            rejectUnauthorized: false
          } : false
        },
        logging: false
      }
    );
  } else {
    // MySQL
    return new Sequelize(
      process.env.DB_NAME || 'menu_order_db',
      process.env.DB_USER || 'root',
      process.env.DB_PASSWORD || '',
      {
        host: process.env.DB_HOST || 'localhost',
        port: parseInt(process.env.DB_PORT) || 3306,
        dialect: 'mysql',
        logging: false
      }
    );
  }
}

// Hàm tạo connection cho database mới
function createNewDatabaseConnection() {
  return new Sequelize(NEW_DATABASE_URL, {
    dialect: 'postgres',
    dialectOptions: {
      ssl: {
        require: true,
        rejectUnauthorized: false
      }
    },
    logging: false
  });
}

// Hàm kiểm tra bảng có tồn tại không
async function tableExists(sequelize, tableName) {
  const queryInterface = sequelize.getQueryInterface();
  const tableNames = await queryInterface.showAllTables();
  return tableNames.includes(tableName);
}

// Hàm lấy tất cả dữ liệu từ bảng
async function getAllData(sequelize, tableName) {
  try {
    const query = sequelize.getDialect() === 'postgres' 
      ? `SELECT * FROM "${tableName}"`
      : `SELECT * FROM \`${tableName}\``;
    const [data] = await sequelize.query(query);
    return Array.isArray(data) ? data : [];
  } catch (err) {
    console.error(`Error querying ${tableName}:`, err.message);
    return [];
  }
}

// Hàm copy dữ liệu từ bảng cũ sang bảng mới
async function copyTableData(oldSequelize, newSequelize, tableName) {
  try {
    console.log(`\n📋 Đang copy bảng: ${tableName}...`);
    
    // Kiểm tra bảng có tồn tại trong database cũ không
    const oldTableExists = await tableExists(oldSequelize, tableName);
    if (!oldTableExists) {
      console.log(`   ⚠️  Bảng ${tableName} không tồn tại trong database cũ, bỏ qua.`);
      return { copied: 0, skipped: 0 };
    }

    // Kiểm tra bảng có tồn tại trong database mới không
    const newTableExists = await tableExists(newSequelize, tableName);
    if (!newTableExists) {
      console.log(`   ⚠️  Bảng ${tableName} không tồn tại trong database mới, bỏ qua.`);
      return { copied: 0, skipped: 0 };
    }

    // Lấy dữ liệu từ database cũ
    let oldData;
    try {
      const query = oldSequelize.getDialect() === 'postgres' 
        ? `SELECT * FROM "${tableName}"`
        : `SELECT * FROM \`${tableName}\``;
      const [data] = await oldSequelize.query(query);
      oldData = Array.isArray(data) ? data : [];
    } catch (err) {
      console.error(`   ❌ Lỗi khi đọc dữ liệu từ ${tableName}:`, err.message);
      return { copied: 0, skipped: 0 };
    }

    if (!oldData || oldData.length === 0) {
      console.log(`   ℹ️  Bảng ${tableName} không có dữ liệu, bỏ qua.`);
      return { copied: 0, skipped: 0 };
    }

    console.log(`   📊 Tìm thấy ${oldData.length} bản ghi trong database cũ.`);

    // Kiểm tra dữ liệu đã tồn tại trong database mới chưa
    let existingIds = new Set();
    try {
      const [data] = await newSequelize.query(`SELECT id FROM "${tableName}"`);
      if (Array.isArray(data) && data.length > 0) {
        existingIds = new Set(data.map(row => row.id));
      }
    } catch (err) {
      // Bỏ qua nếu không có cột id hoặc lỗi khác
    }

    // Copy dữ liệu theo batch để tăng hiệu suất
    let copied = 0;
    let skipped = 0;
    const batchSize = 100;

    for (let i = 0; i < oldData.length; i += batchSize) {
      const batch = oldData.slice(i, i + batchSize);
      
      for (const row of batch) {
        // Bỏ qua nếu đã tồn tại
        if (existingIds.has(row.id)) {
          skipped++;
          continue;
        }

          try {
          // Lấy danh sách cột có trong bảng mới
          let newTableColumns = [];
          try {
            const [columnInfo] = await newSequelize.query(
              `SELECT column_name FROM information_schema.columns WHERE table_name = '${tableName}' ORDER BY ordinal_position`
            );
            newTableColumns = columnInfo.map(col => col.column_name);
          } catch (err) {
            // Nếu không lấy được, dùng tất cả cột từ row
            newTableColumns = Object.keys(row);
          }

          // Chuẩn bị dữ liệu - chỉ lấy các cột có trong bảng mới
          const cleanRow = {};
          Object.keys(row).forEach(key => {
            // Chỉ thêm cột nếu có trong bảng mới
            if (newTableColumns.includes(key)) {
              let value = row[key];
              
              // Xử lý Date
              if (value instanceof Date) {
                cleanRow[key] = value;
              } else if (key === 'createdAt' || key === 'updatedAt') {
                cleanRow[key] = value ? new Date(value) : new Date();
              }
              // Xử lý JSON/Object
              else if (value !== null && typeof value === 'object') {
                cleanRow[key] = typeof value === 'string' ? value : JSON.stringify(value);
              }
              // Xử lý các giá trị khác
              else {
                cleanRow[key] = value;
              }
            }
            // Bỏ qua các cột không có trong bảng mới (có thể là cột cũ đã bị xóa)
          });

          // Bỏ qua nếu không có cột nào hợp lệ
          if (Object.keys(cleanRow).length === 0) {
            skipped++;
            continue;
          }

          // Sử dụng parameterized query
          const columns = Object.keys(cleanRow).map(key => `"${key}"`).join(', ');
          const placeholders = Object.keys(cleanRow).map((_, i) => `$${i + 1}`).join(', ');
          const values = Object.values(cleanRow);

          // Insert với ON CONFLICT để tránh duplicate
          try {
            await newSequelize.query(
              `INSERT INTO "${tableName}" (${columns}) VALUES (${placeholders}) ON CONFLICT (id) DO NOTHING`,
              { bind: values }
            );
            copied++;
            existingIds.add(row.id); // Thêm vào set để tránh check lại
          } catch (conflictErr) {
            // Nếu không hỗ trợ ON CONFLICT hoặc lỗi khác, thử cách khác
            if (conflictErr.message.includes('syntax error') || conflictErr.message.includes('ON CONFLICT')) {
              // Kiểm tra lại xem có tồn tại không
              const [check] = await newSequelize.query(
                `SELECT id FROM "${tableName}" WHERE id = $1`,
                { bind: [row.id] }
              );
              if (check && check.length > 0) {
                skipped++;
                existingIds.add(row.id);
              } else {
                // Insert không có ON CONFLICT
                await newSequelize.query(
                  `INSERT INTO "${tableName}" (${columns}) VALUES (${placeholders})`,
                  { bind: values }
                );
                copied++;
                existingIds.add(row.id);
              }
            } else if (conflictErr.message.includes('duplicate') || conflictErr.message.includes('unique')) {
              skipped++;
              existingIds.add(row.id);
            } else {
              throw conflictErr;
            }
          }
        } catch (err) {
          // Nếu lỗi do duplicate key, bỏ qua
          if (err.message.includes('duplicate') || err.message.includes('unique') || err.message.includes('UNIQUE')) {
            skipped++;
            existingIds.add(row.id);
          } else {
            console.error(`   ⚠️  Lỗi khi insert bản ghi ID ${row.id}:`, err.message);
            skipped++;
          }
        }
      }
    }

    console.log(`   ✅ Đã copy ${copied} bản ghi, bỏ qua ${skipped} bản ghi (đã tồn tại hoặc lỗi).`);
    return { copied, skipped };
  } catch (error) {
    console.error(`   ❌ Lỗi khi copy bảng ${tableName}:`, error.message);
    return { copied: 0, skipped: 0 };
  }
}

// Hàm reset sequence cho PostgreSQL (để auto increment hoạt động đúng)
async function resetSequences(newSequelize) {
  try {
    console.log('\n🔄 Đang reset sequences...');
    
    const tables = ['users', 'stores', 'categories', 'items', 'item_options', 
                    'item_accompaniments', 'vouchers', 'orders', 'order_items', 'reviews'];
    
    for (const table of tables) {
      try {
        // Lấy ID lớn nhất
        const [result] = await newSequelize.query(
          `SELECT MAX(id) as max_id FROM "${table}"`
        );
        const maxId = result[0]?.max_id || 0;
        
        // Reset sequence
        await newSequelize.query(
          `SELECT setval('"${table}_id_seq"', ${maxId}, true)`
        );
        console.log(`   ✅ Reset sequence cho ${table} thành ${maxId}`);
      } catch (err) {
        // Sequence có thể không tồn tại, bỏ qua
        console.log(`   ⚠️  Không thể reset sequence cho ${table}: ${err.message}`);
      }
    }
  } catch (error) {
    console.error('   ⚠️  Lỗi khi reset sequences:', error.message);
  }
}

// Hàm sync schema với alter để thêm cột mới
async function syncSchemaWithAlter(newSequelize) {
  try {
    console.log('\n📦 Đang sync schema với alter để thêm bảng/cột mới...');
    console.log('   (Sẽ tạo bảng mới và thêm cột mới, KHÔNG xóa dữ liệu cũ)');
    
    // Tạm thời thay đổi DATABASE_URL để models sử dụng database mới
    const originalDatabaseUrl = process.env.DATABASE_URL;
    const originalDbType = process.env.DB_TYPE;
    const originalDbHost = process.env.DB_HOST;
    const originalDbName = process.env.DB_NAME;
    const originalDbUser = process.env.DB_USER;
    const originalDbPassword = process.env.DB_PASSWORD;
    
    // Set DATABASE_URL để models dùng database mới
    process.env.DATABASE_URL = NEW_DATABASE_URL;
    delete process.env.DB_TYPE;
    delete process.env.DB_HOST;
    delete process.env.DB_NAME;
    delete process.env.DB_USER;
    delete process.env.DB_PASSWORD;
    
    // Clear require cache để load lại models với database mới
    const cacheKeys = Object.keys(require.cache).filter(key => 
      key.includes('config/database') || 
      key.includes('models')
    );
    cacheKeys.forEach(key => delete require.cache[key]);
    
    // Import lại models với database mới
    const { sequelize: sequelizeForSync } = require('../src/config/database');
    require('../src/models'); // Load models và associations
    
    // Sync với alter: true để thêm cột mới, nhưng force: false để không xóa dữ liệu
    await sequelizeForSync.sync({ 
      alter: true,  // Thêm cột mới vào bảng đã tồn tại
      force: false  // KHÔNG xóa bảng/dữ liệu đã có
    });
    
    // Đóng connection
    await sequelizeForSync.close();
    
    // Khôi phục lại config cũ
    if (originalDatabaseUrl) {
      process.env.DATABASE_URL = originalDatabaseUrl;
    } else {
      delete process.env.DATABASE_URL;
    }
    if (originalDbType) process.env.DB_TYPE = originalDbType;
    if (originalDbHost) process.env.DB_HOST = originalDbHost;
    if (originalDbName) process.env.DB_NAME = originalDbName;
    if (originalDbUser) process.env.DB_USER = originalDbUser;
    if (originalDbPassword) process.env.DB_PASSWORD = originalDbPassword;
    
    // Clear cache lại để load lại với config cũ
    cacheKeys.forEach(key => delete require.cache[key]);
    
    console.log('✅ Schema đã được sync thành công (đã thêm bảng/cột mới nếu có)');
  } catch (error) {
    console.error('⚠️  Lỗi khi sync schema:', error.message);
    console.log('   Tiếp tục với migration dữ liệu...');
    console.log('   (Có thể schema đã được sync trước đó hoặc cần sync thủ công)');
  }
}

// Hàm chính
async function migrateDatabase() {
  console.log('🚀 Bắt đầu migration database...\n');
  console.log('📌 Database cũ:', process.env.DATABASE_URL ? 'Từ DATABASE_URL' : 'Từ các biến DB_*');
  console.log('📌 Database mới:', NEW_DATABASE_URL.replace(/:([^:@]+)@/, ':***@'));
  console.log('\n⚠️  LƯU Ý: Script này sẽ COPY dữ liệu, không xóa dữ liệu cũ.\n');

  let oldSequelize, newSequelize;

  try {
    // Kết nối với database cũ
    console.log('🔌 Đang kết nối với database cũ...');
    oldSequelize = createOldDatabaseConnection();
    await oldSequelize.authenticate();
    console.log('✅ Đã kết nối với database cũ thành công!\n');

    // Kết nối với database mới
    console.log('🔌 Đang kết nối với database mới...');
    newSequelize = createNewDatabaseConnection();
    await newSequelize.authenticate();
    console.log('✅ Đã kết nối với database mới thành công!\n');

    // Sync schema với alter để đảm bảo có tất cả bảng và cột mới
    await syncSchemaWithAlter(newSequelize);
    
    // Copy dữ liệu từng bảng theo thứ tự
    let totalCopied = 0;
    let totalSkipped = 0;

    for (const tableName of TABLE_ORDER) {
      const result = await copyTableData(oldSequelize, newSequelize, tableName);
      totalCopied += result.copied;
      totalSkipped += result.skipped;
    }

    // Reset sequences cho PostgreSQL
    await resetSequences(newSequelize);

    // Tóm tắt
    console.log('\n' + '='.repeat(50));
    console.log('📊 TÓM TẮT MIGRATION:');
    console.log(`   ✅ Đã copy: ${totalCopied} bản ghi`);
    console.log(`   ⏭️  Đã bỏ qua: ${totalSkipped} bản ghi (đã tồn tại hoặc lỗi)`);
    console.log('='.repeat(50));
    console.log('\n✅ Migration hoàn tất!');
    console.log('💡 Bây giờ bạn có thể cập nhật DATABASE_URL trong .env để sử dụng database mới.');

  } catch (error) {
    console.error('\n❌ Lỗi trong quá trình migration:', error);
    console.error('Stack:', error.stack);
    process.exit(1);
  } finally {
    // Đóng kết nối
    if (oldSequelize) {
      await oldSequelize.close();
      console.log('\n🔌 Đã đóng kết nối database cũ.');
    }
    if (newSequelize) {
      await newSequelize.close();
      console.log('🔌 Đã đóng kết nối database mới.');
    }
  }
}

// Chạy migration
if (require.main === module) {
  migrateDatabase()
    .then(() => {
      console.log('\n✨ Hoàn thành!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('\n💥 Migration thất bại:', error);
      process.exit(1);
    });
}

module.exports = { migrateDatabase };

