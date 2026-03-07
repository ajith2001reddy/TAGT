import cp from 'child_process';
import fs from 'fs';
try {
    cp.execSync('npx eslint src/**/*.js -f json');
} catch (e) {
    const results = JSON.parse(e.stdout.toString());
    const formatted = results
        .filter(r => r.errorCount > 0)
        .map(r => `FILE: ${r.filePath}\nERRORS:\n` + r.messages.map(m => `  ${m.line}:${m.column} ${m.message}`).join('\n'))
        .join('\n\n');
    fs.writeFileSync('lint-errors.log', formatted);
}
