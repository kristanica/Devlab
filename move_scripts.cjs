const fs = require('fs');
const path = require('path');

const srcDir = path.join(process.cwd(), 'src');

function moveAndConvert(srcPath, destPath) {
    if (fs.existsSync(srcPath)) {
        const content = fs.readFileSync(srcPath, 'utf8');
        const dir = path.dirname(destPath);
        if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
        
        // Very basic TS conversion
        let tsContent = content;
        
        fs.writeFileSync(destPath, tsContent);
        fs.unlinkSync(srcPath);
        console.log(`Moved ${srcPath} -> ${destPath}`);
    }
}

// Custom Hooks -> hooks
const hooksDir = path.join(srcDir, 'components', 'Custom Hooks');
if (fs.existsSync(hooksDir)) {
    for (const file of fs.readdirSync(hooksDir)) {
        if (file.endsWith('.jsx')) {
            moveAndConvert(path.join(hooksDir, file), path.join(srcDir, 'hooks', file.replace('.jsx', '.ts')));
        }
    }
}

// BackEnd_Data -> services/api
const backendDataDir = path.join(srcDir, 'components', 'BackEnd_Data');
if (fs.existsSync(backendDataDir)) {
    for (const file of fs.readdirSync(backendDataDir)) {
        if (file.endsWith('.jsx')) {
            moveAndConvert(path.join(backendDataDir, file), path.join(srcDir, 'services', 'api', file.replace('.jsx', '.ts')));
        }
    }
}

// BackEnd_Functions -> services/api
const backendFnDir = path.join(srcDir, 'components', 'BackEnd_Functions');
if (fs.existsSync(backendFnDir)) {
    for (const file of fs.readdirSync(backendFnDir)) {
        if (file.endsWith('.jsx')) {
            moveAndConvert(path.join(backendFnDir, file), path.join(srcDir, 'services', 'api', file.replace('.jsx', '.ts')));
        }
    }
}

// OpenAI Prompts -> services/openai
const openaiDir = path.join(srcDir, 'components', 'OpenAI Prompts');
if (fs.existsSync(openaiDir)) {
    for (const file of fs.readdirSync(openaiDir)) {
        if (file.endsWith('.jsx')) {
            if (file === 'useBugBustStore.jsx') {
                moveAndConvert(path.join(openaiDir, file), path.join(srcDir, 'store', 'useBugBustStore.ts'));
            } else {
                moveAndConvert(path.join(openaiDir, file), path.join(srcDir, 'services', 'openai', file.replace('.jsx', '.ts')));
            }
        }
    }
}

// Items-Store -> store
const itemsStoreDir = path.join(srcDir, 'ItemsLogics', 'Items-Store');
if (fs.existsSync(itemsStoreDir)) {
    for (const file of fs.readdirSync(itemsStoreDir)) {
        if (file.endsWith('.jsx')) {
            moveAndConvert(path.join(itemsStoreDir, file), path.join(srcDir, 'store', file.replace('.jsx', '.ts')));
        }
    }
}

// Also gameMode/GameModes_Utils/useAttemptStore.jsx -> store
const attemptStorePath = path.join(srcDir, 'gameMode', 'GameModes_Utils', 'useAttemptStore.jsx');
if (fs.existsSync(attemptStorePath)) {
    moveAndConvert(attemptStorePath, path.join(srcDir, 'store', 'useAttemptStore.ts'));
}
