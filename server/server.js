require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { sequelize } = require('./models');

const app = express();

app.use(cors({ origin: process.env.CLIENT_URL, credentials: true }));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/auth', require('./routes/auth.routes'));
app.use('/api/events', require('./routes/events.routes'));
app.use('/api/bookings', require('./routes/bookings.routes'));
app.use('/api/payments', require('./routes/payments.routes'));
app.use('/api/admin', require('./routes/admin.routes'));
app.use('/api/organizer', require('./routes/organizer.routes'));
app.use('/api/notifications', require('./routes/notifications.routes'));

app.get('/api/health', (req, res) => res.json({ status: 'SeaFest BD API running' }));

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ success: false, message: 'Internal server error' });
});

const PORT = process.env.PORT || 5000;

sequelize.sync({ alter: process.env.NODE_ENV === 'development' }).then(() => {
  app.listen(PORT, () => console.log(`SeaFest BD server running on port ${PORT}`));
}).catch(err => {
  console.error('DB connection failed:', err.message);
  process.exit(1);
});
