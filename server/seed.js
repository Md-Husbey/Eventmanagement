require('dotenv').config();
const sequelize = require('./config/database');
const User = require('./models/User');

const users = [
  {
    name: 'Admin User',
    email: 'admin@seafest.com',
    password: 'Admin@1234',
    role: 'admin',
    phone: '01700000001',
  },
  {
    name: 'Event Manager',
    email: 'manager@seafest.com',
    password: 'Manager@1234',
    role: 'manager',
    phone: '01700000002',
  },
  {
    name: 'Demo Customer',
    email: 'customer@seafest.com',
    password: 'Customer@1234',
    role: 'customer',
    phone: '01700000003',
  },
];

async function seed() {
  await sequelize.authenticate();
  await User.sync();

  for (const u of users) {
    const [user, created] = await User.findOrCreate({
      where: { email: u.email },
      defaults: u,
    });
    console.log(`${created ? 'Created' : 'Already exists'}: ${user.role} — ${user.email}`);
  }

  console.log('\nDemo Accounts:');
  console.log('  Admin    → admin@seafest.com     / Admin@1234');
  console.log('  Manager  → manager@seafest.com   / Manager@1234');
  console.log('  Customer → customer@seafest.com  / Customer@1234');

  await sequelize.close();
}

seed().catch(err => { console.error(err); process.exit(1); });
