const express = require('express');
const cors = require('cors');
const authRoutes = require('./routes/authRoutes');
const eventRoutes = require('./routes/eventRoutes');
const adminRoutes = require('./routes/adminRoutes');
const { notFound, errorHandler } = require('./middlewares/errorHandler');

const app = express();

app.use(cors());
app.use(express.json({ limit: '15mb' }));

app.use('/api/auth', authRoutes);
app.use('/api/eventos', eventRoutes);
app.use('/api/admin', adminRoutes);
app.get('/api/health', (req, res) => res.json({ status: 'ok' }));

app.use(notFound);
app.use(errorHandler);

module.exports = app;
