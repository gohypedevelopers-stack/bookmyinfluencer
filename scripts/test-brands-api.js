const http = require('http');
const fs = require('fs');

http.get('http://localhost:3000/api/public/brands', (res) => {
    let rawData = '';
    res.on('data', (chunk) => { rawData += chunk; });
    res.on('end', () => {
        try {
            fs.writeFileSync('api_response_brands.json', JSON.stringify(JSON.parse(rawData), null, 2));
            console.log("Wrote fully to api_response_brands.json");
        } catch (e) {
            console.error(e.message);
        }
    });
});
