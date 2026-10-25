#!/usr/bin/env node

/**
 * Quick API Test Script
 * Tests the authentication endpoints
 */

const BASE_URL = "http://localhost:5000";

async function testAPI() {
    console.log("🧪 Starting API Tests...\n");

    try {
        // Test 1: Welcome endpoint
        console.log("1️⃣ Testing Welcome Endpoint...");
        let response = await fetch(`${BASE_URL}/`);
        let data = await response.text();
        console.log(`✅ Status: ${response.status}`);
        console.log(`📝 Response: ${data}\n`);

        // Test 2: Register a new user
        console.log("2️⃣ Testing Registration...");
        const testEmail = `test${Date.now()}@example.com`;
        response = await fetch(`${BASE_URL}/register`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                email: testEmail,
                password: "password123"
            })
        });
        data = await response.json();
        console.log(`✅ Status: ${response.status}`);
        console.log(`📝 Response:`, JSON.stringify(data, null, 2));
        console.log();

        // Test 3: Login
        console.log("3️⃣ Testing Login...");
        response = await fetch(`${BASE_URL}/login`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                email: testEmail,
                password: "password123"
            })
        });
        data = await response.json();
        console.log(`✅ Status: ${response.status}`);
        console.log(`📝 User Email: ${data.user?.email}`);
        console.log(`🔑 Token: ${data.token?.substring(0, 50)}...`);
        
        const token = data.token;
        console.log();

        // Test 4: Get user profile (/me)
        console.log("4️⃣ Testing /me Endpoint (Get User Profile)...");
        response = await fetch(`${BASE_URL}/me`, {
            headers: { "Authorization": `Bearer ${token}` }
        });
        data = await response.json();
        console.log(`✅ Status: ${response.status}`);
        console.log(`📝 User:`, JSON.stringify(data, null, 2));
        console.log();

        // Test 5: Create a task
        console.log("5️⃣ Testing Create Task...");
        response = await fetch(`${BASE_URL}/tasks`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            },
            body: JSON.stringify({
                title: "Test Task"
            })
        });
        data = await response.json();
        console.log(`✅ Status: ${response.status}`);
        console.log(`📝 Task:`, JSON.stringify(data, null, 2));
        
        const taskId = data.id;
        console.log();

        // Test 6: Get all tasks
        console.log("6️⃣ Testing Get All Tasks...");
        response = await fetch(`${BASE_URL}/tasks`, {
            headers: { "Authorization": `Bearer ${token}` }
        });
        data = await response.json();
        console.log(`✅ Status: ${response.status}`);
        console.log(`📝 Tasks Count: ${Array.isArray(data) ? data.length : 0}`);
        console.log();

        // Test 7: Update task
        console.log("7️⃣ Testing Update Task...");
        response = await fetch(`${BASE_URL}/tasks/${taskId}`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            },
            body: JSON.stringify({
                completed: true
            })
        });
        data = await response.json();
        console.log(`✅ Status: ${response.status}`);
        console.log(`📝 Updated Task:`, JSON.stringify(data, null, 2));
        console.log();

        // Test 8: Delete task
        console.log("8️⃣ Testing Delete Task...");
        response = await fetch(`${BASE_URL}/tasks/${taskId}`, {
            method: "DELETE",
            headers: { "Authorization": `Bearer ${token}` }
        });
        data = await response.json();
        console.log(`✅ Status: ${response.status}`);
        console.log(`📝 Response:`, JSON.stringify(data, null, 2));
        console.log();

        // Test 9: Test 401 - No token
        console.log("9️⃣ Testing 401 Error (No Token)...");
        response = await fetch(`${BASE_URL}/tasks`);
        data = await response.json();
        console.log(`✅ Status: ${response.status}`);
        console.log(`📝 Response:`, JSON.stringify(data, null, 2));
        console.log();

        // Test 10: Test 401 - Invalid token
        console.log("🔟 Testing 401 Error (Invalid Token)...");
        response = await fetch(`${BASE_URL}/tasks`, {
            headers: { "Authorization": "Bearer invalid_token" }
        });
        data = await response.json();
        console.log(`✅ Status: ${response.status}`);
        console.log(`📝 Response:`, JSON.stringify(data, null, 2));
        console.log();

        console.log("✅ All tests completed!\n");

    } catch (error) {
        console.error("❌ Error during testing:", error.message);
        console.error("\nMake sure the backend server is running on http://localhost:5000");
    }
}

testAPI();
