const http = require('http');
const fs = require('fs');

http.get('http://localhost:3000/api/public/creators', (res) => {
    let rawData = '';
    res.on('data', (chunk) => { rawData += chunk; });
    res.on('end', () => {
        try {
            fs.writeFileSync('api_response_creators.json', JSON.stringify(JSON.parse(rawData), null, 2));
            console.log("Wrote fully to api_response_creators.json");
        } catch (e) {
            console.error(e.message);
        }
    });
});
