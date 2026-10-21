/**
 * Enterprise Code & Content Quality Gate Validator
 * Verifies email formats, links, HTML structure, placeholders, and security tokens.
 */
const fs = require('fs');

let hasError = false;

function error(msg) {
  console.error(`❌ [QUALITY GATE ERROR] ${msg}`);
  hasError = true;
}

function success(msg) {
  console.log(`✅ [PASSED] ${msg}`);
}

console.log('==========================================================');
console.log('STARTING ENTERPRISE CODE & CONTENT VALIDATION GATE');
console.log('==========================================================');

const requiredFiles = ['index.html', 'password.html', 'script.js', 'style.css'];
const validEmailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

for (const filename of requiredFiles) {
  if (!fs.existsSync(filename)) {
    error(`Required file "${filename}" is missing from the repository!`);
    continue;
  }

  const content = fs.readFileSync(filename, 'utf8');
  const lines = content.split(/\r?\n/);

  // 1. VERIFY MAILTO ATTRIBUTES IN HTML
  if (filename.endsWith('.html')) {
    const mailtoMatches = [...content.matchAll(/mailto:([^"'\s>]+)/gi)];
    for (const match of mailtoMatches) {
      let emailAddress = match[1].split('?')[0].trim();
      if (!validEmailRegex.test(emailAddress)) {
        error(`Invalid mailto address in "${filename}": "${emailAddress}". Missing valid domain or dot (e.g. .com).`);
      } else {
        success(`Verified mailto address in ${filename}: ${emailAddress}`);
      }
    }
  }

  // 2. LINE-BY-LINE CONTENT & TEXT SCAN
  lines.forEach((line, index) => {
    const lineNum = index + 1;
    const trimmed = line.trim();

    // Ignore stylesheet links and Google Fonts parameters (e.g. wght@400)
    const isFontOrCssRule = /fonts\.googleapis\.com|wght@|@import|@media|@keyframes|@charset/i.test(line);

    if (!isFontOrCssRule) {
      // Find candidate email patterns in text (e.g. jacksamsonc@gmailcom or jacksamsonc@gmail.com)
      const emailCandidates = line.match(/\b[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\b/g) || [];
      for (const candidate of emailCandidates) {
        if (!validEmailRegex.test(candidate)) {
          error(`Malformed email address in ${filename}:${lineNum} -> "${candidate}" (missing valid extension like .com)`);
        } else {
          console.log(`   - Verified text email in ${filename}:${lineNum} -> ${candidate}`);
        }
      }
    }

    // Check for dummy placeholder text (Lorem ipsum)
    if (/lorem\s+ipsum/i.test(line)) {
      error(`Found "Lorem ipsum" dummy text in ${filename}:${lineNum} -> "${trimmed}"`);
    }

    // Check for unfinished developer comments (TODO, FIXME, XXX, HACK)
    if (/\b(TODO|FIXME|XXX|HACK)\b/.test(line)) {
      error(`Found uncompleted developer task in ${filename}:${lineNum} -> "${trimmed}"`);
    }

    // Check for local development URLs (localhost, 127.0.0.1, 0.0.0.0)
    if (/https?:\/\/(localhost|127\.0\.0\.1|0\.0\.0\.0)/i.test(line)) {
      error(`Found local development URL (localhost) in ${filename}:${lineNum} -> "${trimmed}"`);
    }

    // Check for dummy testing emails (@example.com, @test.com)
    if (/\b[a-zA-Z0-9._%+-]+@(example\.com|test\.com|domain\.com)\b/i.test(line)) {
      error(`Found dummy placeholder email in ${filename}:${lineNum} -> "${trimmed}"`);
    }

    // Check for dead or empty href links
    if (/href\s*=\s*["'](#|javascript:void\(0\);?|)["']/i.test(line) && !/href\s*=\s*["']#[a-zA-Z0-9_-]+["']/i.test(line)) {
      error(`Found dead or empty link in ${filename}:${lineNum} -> "${trimmed}"`);
    }

    // Check for hardcoded AWS / GitHub credentials
    if (/AKIA[0-9A-Z]{16}/.test(line)) {
      error(`CRITICAL: Hardcoded AWS Access Key ID detected in ${filename}:${lineNum}!`);
    }
    if (/ghp_[0-9a-zA-Z]{36}/.test(line)) {
      error(`CRITICAL: Leaked GitHub token detected in ${filename}:${lineNum}!`);
    }
    if (/BEGIN\s+(RSA|OPENSSH|DSA|EC|PGP)\s+PRIVATE\s+KEY/i.test(line)) {
      error(`CRITICAL: Private key detected in ${filename}:${lineNum}!`);
    }
  });

  // 3. HTML STRUCTURE CHECK
  if (filename.endsWith('.html')) {
    if (!/<html/i.test(content)) error(`Missing <html> tag in ${filename}`);
    if (!/<head/i.test(content)) error(`Missing <head> tag in ${filename}`);
    if (!/<body/i.test(content)) error(`Missing <body> tag in ${filename}`);
  }
}

console.log('==========================================================');
if (hasError) {
  console.error('💥 QUALITY GATE FAILED! Deployment halted.');
  process.exit(1);
} else {
  success('ALL lines, emails, links, and web assets verified 100% clean and valid!');
  console.log('==========================================================');
  process.exit(0);
}
