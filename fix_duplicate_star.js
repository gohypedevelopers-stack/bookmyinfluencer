const fs = require('fs');

const files = [
    'app/(public)/login/page.tsx',
    'app/(auth)/brand/login/page.tsx'
];

files.forEach(file => {
    let content = fs.readFileSync(file, 'utf8');
    content = content.replace(/Star,\s*Star/g, 'Star');
    content = content.replace(/Star,([\s\w,]*?)Star/g, 'Star,$1');
    fs.writeFileSync(file, content, 'utf8');
});
