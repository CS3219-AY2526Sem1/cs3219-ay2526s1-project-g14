require('dotenv').config();
const app = require('./app');
const connectDB = require('./config/db');

const PORT = process.env.PORT || 5050;
connectDB();
console.log("MongoDB connected")

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
