const https = require('https');

const SUPABASE_URL = 'https://tpkafgnufwbqcdhiviwo.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRwa2FmZ251ZndicWNkaGl2aXdvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQyNDI2MjMsImV4cCI6MjA3OTgxODYyM30.eWdrgGskoly4xwj2gTtVmr_Uot2llRcNCTNViQunAgo';

function checkTable(tableName) {
    const options = {
        hostname: 'tpkafgnufwbqcdhiviwo.supabase.co',
        path: `/rest/v1/${tableName}?select=*&limit=5`,
        method: 'GET',
        headers: {
            'apikey': SUPABASE_KEY,
            'Authorization': `Bearer ${SUPABASE_KEY}`,
            'Content-Type': 'application/json'
        }
    };

    const req = https.request(options, (res) => {
        let data = '';

        res.on('data', (chunk) => {
            data += chunk;
        });

        res.on('end', () => {
            console.log(`\n--- Checking table: ${tableName} ---`);
            console.log(`Status Code: ${res.statusCode}`);
            if (res.statusCode === 200) {
                const parsed = JSON.parse(data);
                console.log(`Data found: ${parsed.length} rows`);
                if (parsed.length > 0) {
                    console.log('Sample data:', JSON.stringify(parsed[0], null, 2));
                } else {
                    console.log('Table exists but is empty.');
                }
            } else {
                console.log('Error:', data);
                if (res.statusCode === 404) {
                    console.log('Diagnosis: Table does not exist.');
                } else if (res.statusCode === 401) {
                    console.log('Diagnosis: Unauthorized. Check API key or RLS policies.');
                }
            }
        });
    });

    req.on('error', (error) => {
        console.error(`Error checking ${tableName}:`, error);
    });

    req.end();
}

console.log('Starting Supabase Diagnostic...');
checkTable('products');
checkTable('categories');
