const { test, after } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const os = require('os');
const path = require('path');
const { spawnSync } = require('child_process');
const { getMarkdownFiles, checkFile } = require('../index.js');

const CLI = path.join(__dirname, '..', 'index.js');
const tempDirs = [];

// Build a throwaway vault: { 'notes/a.md': 'content', ... }
function makeVault(files) {
    const root = fs.mkdtempSync(path.join(os.tmpdir(), 'md-doctor-test-'));
    tempDirs.push(root);
    for (const [rel, content] of Object.entries(files)) {
        const full = path.join(root, rel);
        fs.mkdirSync(path.dirname(full), { recursive: true });
        fs.writeFileSync(full, content);
    }
    return root;
}

after(() => {
    for (const dir of tempDirs) fs.rmSync(dir, { recursive: true, force: true });
});

test('getMarkdownFiles finds .md files in nested folders', () => {
    const root = makeVault({
        'a.md': '',
        'sub/b.md': '',
        'sub/deeper/c.md': '',
        'notes.txt': '',
    });
    const found = getMarkdownFiles(root).map(f => path.relative(root, f)).sort();
    assert.deepEqual(found, ['a.md', 'sub/b.md', 'sub/deeper/c.md']);
});

test('getMarkdownFiles skips dot-folders, node_modules and dist', () => {
    const root = makeVault({
        'keep.md': '',
        '.hidden/skip.md': '',
        'node_modules/skip.md': '',
        'dist/skip.md': '',
    });
    const found = getMarkdownFiles(root).map(f => path.relative(root, f));
    assert.deepEqual(found, ['keep.md']);
});

test('getMarkdownFiles returns an empty list for a missing folder', () => {
    const root = makeVault({});
    assert.deepEqual(getMarkdownFiles(path.join(root, 'nope')), []);
});

test('checkFile passes a relative link to a file that exists', () => {
    const root = makeVault({
        'index.md': 'See [the note](note.md).',
        'note.md': '',
    });
    const result = checkFile(path.join(root, 'index.md'));
    assert.equal(result.total, 1);
    assert.deepEqual(result.broken, []);
});

test('checkFile reports a relative link to a missing file as broken', () => {
    const root = makeVault({ 'index.md': 'See [gone](missing.md).' });
    const result = checkFile(path.join(root, 'index.md'));
    assert.equal(result.total, 1);
    assert.equal(result.broken.length, 1);
    assert.equal(result.broken[0].link, 'missing.md');
});

test('checkFile resolves ../ links against the linking file folder', () => {
    const root = makeVault({
        'top.md': '',
        'docs/guide.md': 'Back to [top](../top.md) and [nowhere](../nope.md).',
    });
    const result = checkFile(path.join(root, 'docs', 'guide.md'));
    assert.equal(result.total, 2);
    assert.deepEqual(result.broken.map(b => b.link), ['../nope.md']);
});

test('checkFile strips #anchors before checking the file', () => {
    const root = makeVault({
        'index.md': '[ok](docs.md#setup) [bad](gone.md#setup)',
        'docs.md': '',
    });
    const result = checkFile(path.join(root, 'index.md'));
    assert.equal(result.total, 2);
    assert.deepEqual(result.broken.map(b => b.link), ['gone.md#setup']);
});

test('checkFile decodes %20 in link paths', () => {
    const root = makeVault({
        'index.md': '[spaced](my%20note.md)',
        'my note.md': '',
    });
    const result = checkFile(path.join(root, 'index.md'));
    assert.equal(result.total, 1);
    assert.deepEqual(result.broken, []);
});

test('checkFile skips http, https, mailto and #anchor-only links', () => {
    const root = makeVault({
        'index.md': [
            '[web](http://example.com)',
            '[secure](https://example.com)',
            '[mail](mailto:someone@example.com)',
            '[top](#intro)',
        ].join('\n'),
    });
    const result = checkFile(path.join(root, 'index.md'));
    assert.equal(result.total, 0);
    assert.deepEqual(result.broken, []);
});

test('CLI exits 1 and names the broken link when a link is missing', () => {
    const root = makeVault({
        'index.md': 'Good: [a](a.md). Bad: [b](b.md).',
        'a.md': '',
    });
    const run = spawnSync(process.execPath, [CLI, root], { encoding: 'utf8' });
    assert.equal(run.status, 1);
    assert.match(run.stdout, /❌ Broken: b\.md/);
    assert.match(run.stdout, /Found 1 broken local links \(out of 2 total links\)/);
});

test('CLI exits 0 on a vault with only good links', () => {
    const root = makeVault({
        'index.md': '[a](a.md)',
        'a.md': '[back](index.md)',
    });
    const run = spawnSync(process.execPath, [CLI, root], { encoding: 'utf8' });
    assert.equal(run.status, 0);
    assert.match(run.stdout, /Zero broken links/);
});

test('CLI ignores broken links inside dot-folders', () => {
    const root = makeVault({
        'index.md': 'Nothing here.',
        '.claude/notes.md': '[bad](missing.md)',
    });
    const run = spawnSync(process.execPath, [CLI, root], { encoding: 'utf8' });
    assert.equal(run.status, 0);
});
