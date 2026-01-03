const { sequelize } = require('../src/config/database');
const fs = require('fs');
const path = require('path');

/**
 * Backup database structure and data
 * This script exports all tables to SQL files
 */
async function backupDatabase() {
  try {
    console.log('🔌 Đang kết nối đến database...');
    await sequelize.authenticate();
    console.log('✅ Kết nối database thành công!\n');

    const backupDir = path.join(__dirname, '../backups');
    if (!fs.existsSync(backupDir)) {
      fs.mkdirSync(backupDir, { recursive: true });
    }

    const timestamp = new Date().toISOString().replace(/[:.]/g, '-').split('T')[0];
    const backupFile = path.join(backupDir, `backup-${timestamp}.sql`);

    console.log('📦 Đang backup database...');
    
    // Get all table names
    const [tables] = await sequelize.query(`
      SELECT TABLE_NAME 
      FROM INFORMATION_SCHEMA.TABLES 
      WHERE TABLE_SCHEMA = DATABASE()
      AND TABLE_TYPE = 'BASE TABLE'
      ORDER BY TABLE_NAME
    `);

    let sqlContent = `-- Database Backup
-- Generated: ${new Date().toISOString()}
-- Database: ${sequelize.config.database}

SET FOREIGN_KEY_CHECKS = 0;
SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
SET time_zone = "+00:00";

`;

    // Backup each table
    for (const table of tables) {
      const tableName = table.TABLE_NAME;
      console.log(`  📋 Đang backup bảng: ${tableName}...`);

      // Get table structure
      const [createTable] = await sequelize.query(`SHOW CREATE TABLE \`${tableName}\``);
      sqlContent += `\n-- Table structure for table \`${tableName}\`\n`;
      sqlContent += `DROP TABLE IF EXISTS \`${tableName}\`;\n`;
      sqlContent += `${createTable[0]['Create Table']};\n\n`;

      // Get table data
      const [rows] = await sequelize.query(`SELECT * FROM \`${tableName}\``);
      
      if (rows.length > 0) {
        sqlContent += `-- Dumping data for table \`${tableName}\`\n`;
        sqlContent += `LOCK TABLES \`${tableName}\` WRITE;\n`;
        sqlContent += `/*!40000 ALTER TABLE \`${tableName}\` DISABLE KEYS */;\n`;

        // Generate INSERT statements
        const columns = Object.keys(rows[0]);
        for (const row of rows) {
          const values = columns.map(col => {
            const value = row[col];
            if (value === null) return 'NULL';
            if (typeof value === 'string') {
              return `'${value.replace(/'/g, "''")}'`;
            }
            return value;
          });
          sqlContent += `INSERT INTO \`${tableName}\` (\`${columns.join('`, `')}\`) VALUES (${values.join(', ')});\n`;
        }

        sqlContent += `/*!40000 ALTER TABLE \`${tableName}\` ENABLE KEYS */;\n`;
        sqlContent += `UNLOCK TABLES;\n\n`;
      }
    }

    sqlContent += `SET FOREIGN_KEY_CHECKS = 1;\n`;

    // Write to file
    fs.writeFileSync(backupFile, sqlContent, 'utf8');
    console.log(`\n✅ Backup thành công!`);
    console.log(`📁 File: ${backupFile}`);
    console.log(`📊 Tổng số bảng: ${tables.length}`);

    process.exit(0);
  } catch (error) {
    console.error('\n❌ Lỗi:', error.message);
    console.error('Stack:', error.stack);
    process.exit(1);
  }
}

backupDatabase();


const fs = require('fs');
const path = require('path');

/**
 * Backup database structure and data
 * This script exports all tables to SQL files
 */
async function backupDatabase() {
  try {
    console.log('🔌 Đang kết nối đến database...');
    await sequelize.authenticate();
    console.log('✅ Kết nối database thành công!\n');

    const backupDir = path.join(__dirname, '../backups');
    if (!fs.existsSync(backupDir)) {
      fs.mkdirSync(backupDir, { recursive: true });
    }

    const timestamp = new Date().toISOString().replace(/[:.]/g, '-').split('T')[0];
    const backupFile = path.join(backupDir, `backup-${timestamp}.sql`);

    console.log('📦 Đang backup database...');
    
    // Get all table names
    const [tables] = await sequelize.query(`
      SELECT TABLE_NAME 
      FROM INFORMATION_SCHEMA.TABLES 
      WHERE TABLE_SCHEMA = DATABASE()
      AND TABLE_TYPE = 'BASE TABLE'
      ORDER BY TABLE_NAME
    `);

    let sqlContent = `-- Database Backup
-- Generated: ${new Date().toISOString()}
-- Database: ${sequelize.config.database}

SET FOREIGN_KEY_CHECKS = 0;
SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
SET time_zone = "+00:00";

`;

    // Backup each table
    for (const table of tables) {
      const tableName = table.TABLE_NAME;
      console.log(`  📋 Đang backup bảng: ${tableName}...`);

      // Get table structure
      const [createTable] = await sequelize.query(`SHOW CREATE TABLE \`${tableName}\``);
      sqlContent += `\n-- Table structure for table \`${tableName}\`\n`;
      sqlContent += `DROP TABLE IF EXISTS \`${tableName}\`;\n`;
      sqlContent += `${createTable[0]['Create Table']};\n\n`;

      // Get table data
      const [rows] = await sequelize.query(`SELECT * FROM \`${tableName}\``);
      
      if (rows.length > 0) {
        sqlContent += `-- Dumping data for table \`${tableName}\`\n`;
        sqlContent += `LOCK TABLES \`${tableName}\` WRITE;\n`;
        sqlContent += `/*!40000 ALTER TABLE \`${tableName}\` DISABLE KEYS */;\n`;

        // Generate INSERT statements
        const columns = Object.keys(rows[0]);
        for (const row of rows) {
          const values = columns.map(col => {
            const value = row[col];
            if (value === null) return 'NULL';
            if (typeof value === 'string') {
              return `'${value.replace(/'/g, "''")}'`;
            }
            return value;
          });
          sqlContent += `INSERT INTO \`${tableName}\` (\`${columns.join('`, `')}\`) VALUES (${values.join(', ')});\n`;
        }

        sqlContent += `/*!40000 ALTER TABLE \`${tableName}\` ENABLE KEYS */;\n`;
        sqlContent += `UNLOCK TABLES;\n\n`;
      }
    }

    sqlContent += `SET FOREIGN_KEY_CHECKS = 1;\n`;

    // Write to file
    fs.writeFileSync(backupFile, sqlContent, 'utf8');
    console.log(`\n✅ Backup thành công!`);
    console.log(`📁 File: ${backupFile}`);
    console.log(`📊 Tổng số bảng: ${tables.length}`);

    process.exit(0);
  } catch (error) {
    console.error('\n❌ Lỗi:', error.message);
    console.error('Stack:', error.stack);
    process.exit(1);
  }
}

backupDatabase();































