const https = require('https');

const SUPABASE_URL = 'tpkafgnufwbqcdhiviwo.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRwa2FmZ251ZndicWNkaGl2aXdvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQyNDI2MjMsImV4cCI6MjA3OTgxODYyM30.eWdrgGskoly4xwj2gTtVmr_Uot2llRcNCTNViQunAgo';

function request(method, path, body = null) {
    return new Promise((resolve, reject) => {
        const options = {
            hostname: SUPABASE_URL,
            path: `/rest/v1/${path}`,
            method: method,
            headers: {
                'apikey': SUPABASE_KEY,
                'Authorization': `Bearer ${SUPABASE_KEY}`,
                'Content-Type': 'application/json',
                'Prefer': 'return=representation' // Ask Supabase to return the modified data
            }
        };

        const req = https.request(options, (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => {
                if (res.statusCode >= 200 && res.statusCode < 300) {
                    resolve(data ? JSON.parse(data) : null);
                } else {
                    reject({ statusCode: res.statusCode, message: data });
                }
            });
        });

        req.on('error', reject);
        if (body) req.write(JSON.stringify(body));
        req.end();
    });
}

async function testAdminPermissions() {
    console.log('--- Testing Admin Write Permissions ---');
    let testId = null;

    try {
        // 1. Test INSERT
        console.log('1. Testing INSERT...');
        const insertData = {
            nama_product: 'TEST_WRITE_PERMISSION',
            kategori: 'DIOSYS & Y2000',
            harga: 12345
        };
        const inserted = await request('POST', 'products', insertData);
        if (inserted && inserted.length > 0) {
            testId = inserted[0].id;
            console.log('✅ INSERT Successful! ID:', testId);
        } else {
            throw new Error('Insert returned no data');
        }

        // 2. Test UPDATE
        console.log('2. Testing UPDATE...');
        const updateData = { harga: 54321 };
        const updated = await request('PATCH', `products?id=eq.${testId}`, updateData);
        if (updated && updated[0].harga === 54321) {
            console.log('✅ UPDATE Successful!');
        } else {
            throw new Error('Update failed');
        }

        // 3. Test DELETE
        console.log('3. Testing DELETE...');
        await request('DELETE', `products?id=eq.${testId}`);
        console.log('✅ DELETE Successful!');

        console.log('\n🎉 SUCCESS: Admin permissions are working correctly!');
    } catch (error) {
        console.error('\n❌ FAILED:', error);
        if (error.statusCode === 401) {
            console.error('Reason: Unauthorized (RLS Policy blocking write access)');
        }
    }
}

testAdminPermissions();
