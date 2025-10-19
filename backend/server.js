const app = require('./index');
const connectDB = require('./db');

const port = process.env.PORT || 3000;

// Connect to MongoDB before starting the server
connectDB()
  .then(() => {
    app.listen(port, () => {
      console.log('='.repeat(50));
      console.log(`✅ Server is running on port ${port}`);
      console.log(`🌐 API: http://localhost:${port}`);
      console.log(`🏥 Health: http://localhost:${port}/api/v1/health`);
      console.log(`📚 Docs: http://localhost:${port}/api-docs`);
      console.log('='.repeat(50));
    });
  })
  .catch((err) => {
    console.error('❌ Failed to connect to MongoDB. Server not started.');
    console.error('Error:', err.message);
    process.exit(1);
  });
