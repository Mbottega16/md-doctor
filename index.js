#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

function getMarkdownFiles(dir, fileList = []) {
    let files;
    try {
        files = fs.readdirSync(dir);
    } catch (e) {
        return fileList;
    }

    for (const file of files) {
        if (file === 'node_modules' || file === '.git' || file === 'dist' || file.startsWith('.')) continue;
        const filePath = path.join(dir, file);
        if (fs.statSync(filePath).isDirectory()) {
            getMarkdownFiles(filePath, fileList);
        } else if (filePath.endsWith('.md')) {
            fileList.push(filePath);
        }
    }
    return fileList;
}

const targetDir = process.argv[2] ? path.resolve(process.argv[2]) : process.cwd();
console.log(`\n🩺 md-doctor: Scanning for broken links...\n📁 Target: ${targetDir}\n`);

const mdFiles = getMarkdownFiles(targetDir);
let brokenLinks = 0;
let totalLinks = 0;

mdFiles.forEach(file => {
    const content = fs.readFileSync(file, 'utf8');
    // Match standard markdown links: [text](link)
    const regex = /\[.*?\]\((.*?)\)/g;
    let match;
    const fileBroken = [];

    while ((match = regex.exec(content)) !== null) {
        const link = match[1].trim();
        
        // Skip external URLs, emails, and internal-only anchors
        if (link.startsWith('http') || link.startsWith('mailto:') || link.startsWith('#')) {
            continue;
        }

        totalLinks++;
        
        // Remove anchors from local files (e.g., docs.md#section -> docs.md)
        const pureLink = link.split('#')[0];
        if (!pureLink) continue; 

        // Resolve the relative path against the current file's directory
        // We use decodeURIComponent to handle spaces like %20
        const targetPath = path.resolve(path.dirname(file), decodeURIComponent(pureLink));

        if (!fs.existsSync(targetPath)) {
            fileBroken.push({ link, resolved: targetPath });
            brokenLinks++;
        }
    }

    if (fileBroken.length > 0) {
        console.log(`\n📄 ${path.relative(targetDir, file)}`);
        fileBroken.forEach(b => {
            console.log(`   ❌ Broken: ${b.link}`);
        });
    }
});

console.log(`\n---`);
if (brokenLinks === 0) {
    console.log(`✅ Healthy! Checked ${totalLinks} local links across ${mdFiles.length} markdown files. Zero broken links.`);
} else {
    console.log(`⚠️  Found ${brokenLinks} broken local links (out of ${totalLinks} total links).`);
    process.exit(1);
}
