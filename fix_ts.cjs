const fs = require('fs');
const path = require('path');

const srcDir = path.join(process.cwd(), 'src');

function walk(dir, callback) {
    fs.readdirSync(dir).forEach(f => {
        let dirPath = path.join(dir, f);
        let isDirectory = fs.statSync(dirPath).isDirectory();
        isDirectory ? walk(dirPath, callback) : callback(dirPath);
    });
}

function fixTsErrors(filePath) {
    if (!filePath.endsWith('.ts') && !filePath.endsWith('.tsx')) return;
    
    let content = fs.readFileSync(filePath, 'utf8');
    let original = content;

    // Fix imports in hooks
    if (filePath.includes('hooks')) {
        content = content.replace(/['"]\.\.\/components\/BackEnd_Data\/([^'"]+)['"]/g, "'@/services/api/$1'");
        content = content.replace(/['"]\.\/components\/BackEnd_Data\/([^'"]+)['"]/g, "'@/services/api/$1'");
    }

    // Fix 'isCorrect' missing properties in GameFooter
    if (filePath.includes('LessonPage.tsx')) {
        content = content.replace(/<GameFooter\s+isCorrect=\{isCorrect\}\s*\/>/g, "<GameFooter isCorrect={isCorrect} setLevelComplete={() => {}} setShowCodeWhisper={() => {}} setAlreadyComplete={() => {}} />");
    }

    if (content !== original) {
        fs.writeFileSync(filePath, content);
        console.log(`Fixed errors in ${filePath}`);
    }
}

walk(srcDir, fixTsErrors);
