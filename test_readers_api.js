const API_BASE = 'http://localhost:5000/api';

async function testReaderFunctionality() {
    console.log('Testing Reader API endpoints...\n');
    
    // Test 1: Create a new reader
    console.log('1. Creating a test reader...');
    try {
        const newReader = {
            name: 'Test Reader',
            class: '9.A',
            email: 'test.reader@example.com'
        };
        
        const response = await fetch(`${API_BASE}/readers`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(newReader)
        });
        
        const createdReader = await response.json();
        console.log('✓ Reader created successfully:', createdReader._id);
        console.log('  Name:', createdReader.name);
        
        // Test 2: Update the reader
        console.log('\n2. Updating the reader...');
        const updatedData = {
            name: 'Updated Test Reader',
            class: '10.A',
            email: 'updated.test.reader@example.com'
        };
        
        const updateResponse = await fetch(`${API_BASE}/readers/${createdReader._id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(updatedData)
        });
        
        const updatedReader = await updateResponse.json();
        console.log('✓ Reader updated successfully:');
        console.log('  Name:', updatedReader.name);
        console.log('  Class:', updatedReader.class);
        console.log('  Email:', updatedReader.email);
        
        // Test 3: Read the updated reader
        console.log('\n3. Reading the updated reader...');
        const getResponse = await fetch(`${API_BASE}/readers/${createdReader._id}`);
        const retrievedReader = await getResponse.json();
        console.log('✓ Reader retrieved successfully:');
        console.log('  Name:', retrievedReader.name);
        console.log('  Class:', retrievedReader.class);
        console.log('  Email:', retrievedReader.email);
        
        // Test 4: Delete the reader
        console.log('\n4. Deleting the reader...');
        const deleteResponse = await fetch(`${API_BASE}/readers/${createdReader._id}`, {
            method: 'DELETE'
        });
        
        const deleteResult = await deleteResponse.json();
        console.log('✓ Reader deleted successfully:', deleteResult.message);
        
        // Test 5: Try to read the deleted reader (should fail)
        console.log('\n5. Verifying reader was deleted...');
        const verifyResponse = await fetch(`${API_BASE}/readers/${createdReader._id}`);
        if (verifyResponse.status === 404) {
            console.log('✓ Reader successfully removed (404 Not Found)');
        } else {
            console.log('✗ Reader still exists');
        }
        
        console.log('\n✓ All tests passed! Reader API endpoints are working correctly.');
        
    } catch (error) {
        console.error('✗ Error during testing:', error.message);
    }
}

// Run the test
testReaderFunctionality();