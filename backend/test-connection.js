const axios = require('axios');

const API_URL = 'http://localhost:5001/api';

async function testBackend() {
  console.log('🧪 Testing SoulSync Backend...\n');

  // Test 1: Health Check
  console.log('1️⃣ Testing Health Endpoint...');
  try {
    const health = await axios.get(`${API_URL}/health`);
    console.log('✅ Health Check:', health.data);
  } catch (error) {
    console.log('❌ Health Check Failed:', error.message);
    console.log('👉 Make sure backend is running on port 5001');
    return;
  }

  // Test 2: Registration
  console.log('\n2️⃣ Testing Registration...');
  try {
    const testUser = {
      email: 'testuser123@gmail.com',
      password: 'password123',
      firstName: 'Test',
      dateOfBirth: '1995-06-15',
      gender: 'male'
    };
    
    console.log('Sending data:', testUser);
    const register = await axios.post(`${API_URL}/auth/register`, testUser);
    console.log('✅ Registration Successful:', register.data.message);
    console.log('Token received:', register.data.token ? 'Yes' : 'No');
  } catch (error) {
    console.log('❌ Registration Failed:', error.response?.data || error.message);
    if (error.response?.status === 400) {
      console.log('👉 Error details:', error.response.data);
    }
  }

  // Test 3: Login
  console.log('\n3️⃣ Testing Login...');
  try {
    const login = await axios.post(`${API_URL}/auth/login`, {
      email: 'testuser123@gmail.com',
      password: 'password123'
    });
    console.log('✅ Login Successful:', login.data.token ? 'Token received' : 'No token');
  } catch (error) {
    console.log('❌ Login Failed:', error.response?.data?.error || error.message);
  }

  console.log('\n✨ Test Complete!');
}

testBackend();
