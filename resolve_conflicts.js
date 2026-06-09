const fs = require('fs');
const path = require('path');

function resolveConflicts(dir) {
    const files = fs.readdirSync(dir);
    for (const file of files) {
        const fullPath = path.join(dir, file);
        if (fs.statSync(fullPath).isDirectory()) {
            if (file !== 'node_modules' && file !== '.git') {
                resolveConflicts(fullPath);
            }
        } else if (file.endsWith('.js') || file.endsWith('.json') || file.endsWith('.env') || file.endsWith('.md')) {
            let content = fs.readFileSync(fullPath, 'utf8');
            if (content.includes('<<<<<<<')) {
                console.log(`Resolving conflicts in ${fullPath}...`);
                // Simple regex to take the 'main' (bottom) part of the conflict
                // <<<<<<< HEAD ... ======= ... >>>>>>> main
                const resolved = content.replace(/<<<<<<< HEAD[\s\S]*?=======([\s\S]*?)>>>>>>> main/g, '$1');
                fs.writeFileSync(fullPath, resolved, 'utf8');
            }
        }
    }
}

resolveConflicts('c:/Study/WebDevelopment/demo/backend');
console.log('All conflicts resolved.');
