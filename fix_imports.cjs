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

function replaceInFile(filePath) {
    if (!filePath.endsWith('.ts') && !filePath.endsWith('.tsx') && !filePath.endsWith('.js') && !filePath.endsWith('.jsx')) return;
    
    let content = fs.readFileSync(filePath, 'utf8');
    let original = content;

    // Custom Hooks -> hooks
    content = content.replace(/['"](\.\.\/)+components\/Custom Hooks\/([^'"]+)['"]/g, "'@/hooks/$2'");
    content = content.replace(/['"]\.\/components\/Custom Hooks\/([^'"]+)['"]/g, "'@/hooks/$1'");
    content = content.replace(/['"]\.\/Custom Hooks\/([^'"]+)['"]/g, "'@/hooks/$1'");
    content = content.replace(/['"]\.\.\/Custom Hooks\/([^'"]+)['"]/g, "'@/hooks/$1'");

    // BackEnd_Data -> services/api
    content = content.replace(/['"](\.\.\/)+components\/BackEnd_Data\/([^'"]+)['"]/g, "'@/services/api/$2'");
    content = content.replace(/['"]\.\.\/BackEnd_Data\/([^'"]+)['"]/g, "'@/services/api/$1'");

    // BackEnd_Functions -> services/api
    content = content.replace(/['"](\.\.\/)+components\/BackEnd_Functions\/([^'"]+)['"]/g, "'@/services/api/$2'");
    content = content.replace(/['"]\.\.\/BackEnd_Functions\/([^'"]+)['"]/g, "'@/services/api/$1'");

    // OpenAI Prompts -> services/openai
    content = content.replace(/['"](\.\.\/)+components\/OpenAI Prompts\/([^'"]+)['"]/g, "'@/services/openai/$2'");
    content = content.replace(/['"]\.\.\/OpenAI Prompts\/([^'"]+)['"]/g, "'@/services/openai/$1'");

    // useBugBustStore went to store
    content = content.replace(/['"]@\/services\/openai\/useBugBustStore['"]/g, "'@/store/useBugBustStore'");
    
    // Items-Store -> store
    content = content.replace(/['"](\.\.\/)+ItemsLogics\/Items-Store\/([^'"]+)['"]/g, "'@/store/$2'");
    content = content.replace(/['"]\.\/Items-Store\/([^'"]+)['"]/g, "'@/store/$1'");
    
    // GameModes_Utils/useAttemptStore -> store
    content = content.replace(/['"](\.\.\/)+gameMode\/GameModes_Utils\/useAttemptStore['"]/g, "'@/store/useAttemptStore'");
    content = content.replace(/['"]\.\/useAttemptStore['"]/g, "'@/store/useAttemptStore'");

    // .jsx extensions in imports
    content = content.replace(/['"](@\/[^'"]+)\.jsx['"]/g, "'$1'");

    if (content !== original) {
        fs.writeFileSync(filePath, content);
        console.log(`Updated imports in ${filePath}`);
    }
}

walk(srcDir, replaceInFile);

// Also tests
const testsDir = path.join(process.cwd(), 'tests');
if (fs.existsSync(testsDir)) {
    walk(testsDir, replaceInFile);
}
