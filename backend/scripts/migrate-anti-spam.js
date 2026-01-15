const mysql = require('mysql2/promise');

async function runMigration() {
  const connection = await mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'menu_order_db'
  });

  const sqlStatements = [
    // Check and add deviceId column to orders
    `ALTER TABLE orders ADD COLUMN deviceId VARCHAR(255) NULL COMMENT 'Device ID for anti-spam tracking'`,

    // Check and add busy mode columns to stores
    `ALTER TABLE stores ADD COLUMN isBusyModeEnabled BOOLEAN DEFAULT false COMMENT 'Enable/disable busy mode manually'`,
    `ALTER TABLE stores ADD COLUMN maxOrdersPerWindow INT DEFAULT 20 COMMENT 'Maximum orders per time window before auto busy mode'`,
    `ALTER TABLE stores ADD COLUMN timeWindowMinutes INT DEFAULT 15 COMMENT 'Time window in minutes for order counting'`,
    `ALTER TABLE stores ADD COLUMN busyModeStartTime DATETIME NULL COMMENT 'When busy mode was automatically activated'`,

    // Create tables
    `CREATE TABLE IF NOT EXISTS blocked_ips(
      id INT PRIMARY KEY AUTO_INCREMENT,
      ip VARCHAR(45) NOT NULL UNIQUE COMMENT 'IPv4 or IPv6 address',
      reason VARCHAR(255) COMMENT 'Reason for blocking',
      blockedUntil DATETIME NULL COMMENT 'When the block expires, NULL for permanent',
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      INDEX idx_ip (ip),
      INDEX idx_blocked_until (blockedUntil)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`,

    `CREATE TABLE IF NOT EXISTS blocked_devices(
      id INT PRIMARY KEY AUTO_INCREMENT,
      deviceId VARCHAR(255) NOT NULL UNIQUE COMMENT 'Device UUID',
      reason VARCHAR(255) COMMENT 'Reason for blocking',
      blockedUntil DATETIME NULL COMMENT 'When the block expires, NULL for permanent',
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      INDEX idx_device_id (deviceId),
      INDEX idx_blocked_until (blockedUntil)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`,

    `CREATE TABLE IF NOT EXISTS spam_logs(
      id INT PRIMARY KEY AUTO_INCREMENT,
      ip VARCHAR(45) NULL COMMENT 'IP address involved',
      deviceId VARCHAR(255) NULL COMMENT 'Device ID involved',
      storeId INT NULL COMMENT 'Store ID targeted',
      action VARCHAR(100) NOT NULL COMMENT 'Type of action: rate_limit_exceeded, device_spam_attempt, etc.',
      details JSON NULL COMMENT 'Additional details about the incident',
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      INDEX idx_ip (ip),
      INDEX idx_device_id (deviceId),
      INDEX idx_store_id (storeId),
      INDEX idx_action (action),
      INDEX idx_created_at (createdAt)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`
  ];

  try {
    for (const sql of sqlStatements) {
      try {
        await connection.execute(sql);
        console.log('✅ Executed:', sql.split('\n')[0]);
      } catch (error) {
        // Ignore "column already exists" errors
        if (error.code === 'ER_DUP_FIELDNAME') {
          console.log('⚠️  Column already exists, skipping...');
        } else if (error.code === 'ER_TABLE_EXISTS_ERROR') {
          console.log('⚠️  Table already exists, skipping...');
        } else {
          throw error;
        }
      }
    }

    console.log('✅ Anti-spam migration applied successfully!');
  } catch (error) {
    console.error('❌ Migration failed:', error.message);
  } finally {
    await connection.end();
  }
}

runMigration();