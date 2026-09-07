# md-doctor 🩺

A lightning-fast, zero-dependency CLI tool that scans your markdown files for broken local links. 

If you maintain a large vault of markdown documents (like Obsidian, a personal Wiki, or dense repository documentation), it's easy to accidentally break a link when renaming or moving files. `md-doctor` recursively scans your directories and validates that every relative file path actually points to a real file on disk.

## Features
- **Zero dependencies:** Runs purely on Node.js standard libraries.
- **Lightning fast:** Scans hundreds of files in milliseconds.
- **Smart parsing:** Ignores `http://`, `https://`, `mailto:`, and internal `#anchors`.
- **Space-aware:** Automatically decodes `%20` HTML URL encoding to match local OS paths.

## Usage

You can run it directly using `npx`:

```bash
npx md-doctor .
```

Or install it globally to use anywhere:

```bash
npm install -g .
md-doctor
```

## Example Output

```text
🩺 md-doctor: Scanning for broken links...
📁 Target: /Users/dev/my-brain

📄 memory/MEMORY.md
   ❌ Broken: ../projects/edusystems/context.md
📄 projects/mosaic/README.md
   ❌ Broken: ./docs/setup.md

---
⚠️  Found 2 broken local links (out of 145 total links).
```
