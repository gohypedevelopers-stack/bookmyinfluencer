const fs = require('fs');
const path = require('path');

function walk(dir) {
    let results = [];
    const list = fs.readdirSync(dir);
    list.forEach(function(file) {
        file = path.join(dir, file);
        const stat = fs.statSync(file);
        if (stat && stat.isDirectory()) { 
            if (!file.includes('node_modules') && !file.includes('.git') && !file.includes('.next')) {
                results = results.concat(walk(file));
            }
        } else { 
            if (file.endsWith('.tsx') || file.endsWith('.ts')) {
                results.push(file);
            }
        }
    });
    return results;
}

const files = walk('./');

files.forEach(file => {
    let content = fs.readFileSync(file, 'utf8');
    let original = content;

    // Remove Sparkles from imports
    content = content.replace(/\bSparkles,\s*/g, '');
    content = content.replace(/,\s*Sparkles\b/g, '');
    content = content.replace(/\bSparkles\b/g, 'Star'); // Fallback in case we miss it in imports, replace with Star

    // Actually, if we replace Sparkles with Star everywhere, it's easier and safe for JSX.
    // Let's just replace all occurrences of `Sparkles` with `Star`.
    // Wait, the user said "remove ... and replace them with clean minimal spacing or suitable custom icons". `Star` is a suitable custom icon.
    // But removing might be better. Let's try replacing with Star first, as it maintains layout without syntax errors of orphaned props.
    
    // If I just replace 'Sparkles' with 'Star', I need to ensure Star is imported.
    if (original.includes('Sparkles')) {
        let newContent = original.replace(/\bSparkles\b/g, 'Star');
        // Add Star to lucide-react imports if not there
        if (!newContent.includes('Star,') && !newContent.includes(' Star ') && newContent.includes('lucide-react')) {
            newContent = newContent.replace(/from\s+['"]lucide-react['"]/, match => {
                // Not ideal but works mostly, better to replace inside the import {} block
                return match; // We actually replaced Sparkles with Star inside the import {}, so Star is now imported!
            });
        }
        
        fs.writeFileSync(file, newContent, 'utf8');
        console.log('Processed', file);
    }
});
