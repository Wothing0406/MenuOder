// Script to run migrations on production database
process.env.DATABASE_URL = 'postgresql://menu_order_db_wfa4_user:YOuvv1yii0cC34ukdDhzY2rtM88p3pPL@dpg-d4j8lg6uk2gs73bfdtqg-a/menu_order_db_wfa4?sslmode=require';

console.log('🔄 Running production database migration...');
console.log('Database URL:', process.env.DATABASE_URL ? 'Set' : 'Not set');

// Import and run the migration script
require('./scripts/run-all-migrations.js');
