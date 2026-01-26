const mongoose = require('mongoose');

async function testConnection() {
  try {
    await mongoose.connect('mongodb://localhost:27017/library_db_test', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('Connected to MongoDB successfully');
    
    // Test creating a simple record
    const testSchema = new mongoose.Schema({
      name: String,
      createdAt: { type: Date, default: Date.now }
    });
    
    const TestModel = mongoose.model('Test', testSchema);
    const testRecord = new TestModel({ name: 'Connection Test' });
    await testRecord.save();
    
    console.log('Test record saved successfully');
    
    // Clean up
    await TestModel.deleteMany({ name: 'Connection Test' });
    console.log('Test cleanup completed');
    
    mongoose.connection.close();
    console.log('Connection closed');
  } catch (error) {
    console.error('Connection failed:', error.message);
    process.exit(1);
  }
}

testConnection();