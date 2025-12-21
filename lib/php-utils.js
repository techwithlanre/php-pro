const vscode = require('vscode');
const { spawn } = require('child_process');

function findMatchingBrace(text, startIndex) {
  let depth = 0;
  for (let i = startIndex; i < text.length; i++) {
    const ch = text[i];
    if (ch === '{') depth++;
    else if (ch === '}') {
      depth--;
      if (depth === 0) return i;
    }
  }
  return -1;
}

function escapeRegExp(value) {
  return String(value).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function getPhpNamespace(text) {
  const match = text.match(/^\s*namespace\s+([^;{]+)\s*[;{]/m);
  if (!match) return '';
  return match[1].trim();
}

function findEnclosingPhpClassName(document, position) {
  const offset = document.offsetAt(position);
  const head = document.getText(new vscode.Range(new vscode.Position(0, 0), position));
  const classRe = /\b(class|interface|trait|enum)\s+([A-Za-z_\x80-\xff][\w\x80-\xff]*)\b/g;
  let match;
  let last = null;
  while ((match = classRe.exec(head))) last = match[2];
  if (!last) return;
  const idx = head.lastIndexOf(last, offset);
  if (idx === -1) return last;
  return last;
}

function findPhpClassMemberRange(text, className) {
  const classRe = new RegExp(`\\b(class|interface|trait|enum)\\s+${escapeRegExp(className)}\\b`, 'g');
  const match = classRe.exec(text);
  if (!match) return;
  const braceStart = text.indexOf('{', match.index);
  if (braceStart === -1) return;
  const braceEnd = findMatchingBrace(text, braceStart);
  if (braceEnd === -1) return;
  return { start: braceStart, end: braceEnd + 1 };
}

function resolvePhpClassTokenInDocument(text, classToken) {
  if (!classToken || classToken.includes('\\')) return classToken;
  const uses = parsePhpUseAliases(text);
  return uses[classToken] || classToken;
}

function parsePhpUseAliases(text) {
  const map = Object.create(null);
  const useRe = /^\s*use\s+([^;]+);/gm;
  let match;
  while ((match = useRe.exec(text))) {
    const clause = match[1].trim();
    if (!clause) continue;
    if (clause.startsWith('function ') || clause.startsWith('const ')) continue;
    const parts = clause.split(',').map((p) => p.trim()).filter(Boolean);
    for (const part of parts) {
      const asMatch = part.match(/^(.*)\s+as\s+([A-Za-z_\x80-\xff][\w\x80-\xff]*)$/i);
      const fqn = (asMatch ? asMatch[1] : part).trim().replace(/^\\+/, '');
      const alias = (asMatch ? asMatch[2] : fqn.split('\\').pop()).trim();
      if (alias && fqn) map[alias] = fqn;
    }
  }
  return map;
}

function parsePhpClassExtendsImplements(header) {
  const extendsMatch = header.match(/\bextends\s+([\\A-Za-z_\x80-\xff][\\\w\x80-\xff]*)/i);
  const implementsMatch = header.match(/\bimplements\s+([^{]+)$/i);
  const extendsList = extendsMatch ? [extendsMatch[1].trim()] : [];
  const implementsList = implementsMatch
    ? implementsMatch[1].split(',').map((s) => s.trim()).filter(Boolean).map((s) => s.replace(/\s*\{.*$/, '').trim())
    : [];
  return { extends: extendsList, implements: implementsList };
}

function resolvePhpTypeTokenToFqn(token, namespace, useAliases) {
  const raw = String(token || '').trim();
  if (!raw) return '';
  const cleaned = raw.replace(/^\?/, '').replace(/^\\+/, '');
  if (cleaned.includes('\\')) return cleaned;
  const aliased = useAliases && useAliases[cleaned] ? useAliases[cleaned] : cleaned;
  if (aliased.includes('\\')) return aliased.replace(/^\\+/, '');
  if (namespace) return `${namespace}\\${aliased}`;
  return aliased;
}

function findPhpDocblockBeforeOffset(text, offset) {
  const head = text.slice(0, Math.max(0, offset));
  const end = head.lastIndexOf('*/');
  if (end === -1) return '';
  const start = head.lastIndexOf('/**', end);
  if (start === -1) return '';
  const between = head.slice(end + 2);
  if (/[^\s]/.test(between)) return '';
  return head.slice(start, end + 2);
}

function parsePhpDocblock(docblock) {
  const result = { params: Object.create(null), returns: '' };
  if (!docblock) return result;
  const lines = String(docblock).split(/\r?\n/);
  for (const line of lines) {
    const paramMatch = line.match(/@\s*(?:param|phpstan-param|psalm-param)\s+([^\s]+)\s+(\$[A-Za-z_\x80-\xff][\w\x80-\xff]*)/i);
    if (paramMatch) result.params[paramMatch[2]] = paramMatch[1];
    const returnMatch = line.match(/@\s*(?:return|phpstan-return|psalm-return)\s+([^\s]+)/i);
    if (returnMatch && !result.returns) result.returns = returnMatch[1];
  }
  return result;
}

function splitPhpParameters(paramList) {
  const parts = [];
  let current = '';
  let depthParen = 0;
  let depthBracket = 0;
  let depthBrace = 0;
  let inSingle = false;
  let inDouble = false;
  let escape = false;
  for (let i = 0; i < paramList.length; i++) {
    const ch = paramList[i];
    if (inSingle || inDouble) {
      current += ch;
      if (escape) {
        escape = false;
        continue;
      }
      if (ch === '\\') {
        escape = true;
        continue;
      }
      if (inSingle && ch === '\'') inSingle = false;
      if (inDouble && ch === '"') inDouble = false;
      continue;
    }
    if (ch === '\'') {
      inSingle = true;
      current += ch;
      continue;
    }
    if (ch === '"') {
      inDouble = true;
      current += ch;
      continue;
    }
    if (ch === '(') depthParen++;
    else if (ch === ')') depthParen = Math.max(0, depthParen - 1);
    else if (ch === '[') depthBracket++;
    else if (ch === ']') depthBracket = Math.max(0, depthBracket - 1);
    else if (ch === '{') depthBrace++;
    else if (ch === '}') depthBrace = Math.max(0, depthBrace - 1);
    if (ch === ',' && depthParen === 0 && depthBracket === 0 && depthBrace === 0) {
      const trimmed = current.trim();
      if (trimmed) parts.push(trimmed);
      current = '';
      continue;
    }
    current += ch;
  }
  const trimmed = current.trim();
  if (trimmed) parts.push(trimmed);
  return parts;
}

function parsePhpParameter(paramText, docParams) {
  const text = String(paramText || '').trim();
  if (!text) return null;
  const nameMatch = text.match(/(\$[A-Za-z_\x80-\xff][\w\x80-\xff]*)/);
  if (!nameMatch) return null;
  const name = nameMatch[1];
  const before = text.slice(0, nameMatch.index).trim();
  const hasVariadic = /\.\.\./.test(before);
  const cleanBefore = before.replace(/\.\.\./g, '').replace(/\s*&\s*/g, ' ').trim();
  const typeText = cleanBefore ? cleanBefore.split(/\s+/)[0] : '';
  const docType = docParams && docParams[name] ? docParams[name] : '';
  const type = typeText || docType || 'mixed';
  return { name, type, variadic: hasVariadic, raw: text };
}

function extractPhpFunctionSignatureNearOffset(text, nameIndex) {
  const sliceStart = Math.max(0, nameIndex - 800);
  const sliceEnd = Math.min(text.length, nameIndex + 800);
  const window = text.slice(sliceStart, sliceEnd);
  const localIndex = nameIndex - sliceStart;
  const head = window.slice(0, localIndex + 200);
  const declMatch = head.match(/\bfunction\s+&?\s*([A-Za-z_\x80-\xff][\w\x80-\xff]*)\s*\(([\s\S]*?)\)\s*(?::\s*([\\A-Za-z_\x80-\xff][\\\w\x80-\xff|?]+))?/);
  if (!declMatch) return null;
  const fnName = declMatch[1];
  const paramList = declMatch[2] || '';
  const returnTypeHint = (declMatch[3] || '').trim();
  const docblock = findPhpDocblockBeforeOffset(text, nameIndex);
  const doc = parsePhpDocblock(docblock);
  const params = splitPhpParameters(paramList).map((p) => parsePhpParameter(p, doc.params)).filter(Boolean);
  const returnType = returnTypeHint || doc.returns || 'mixed';
  const formattedParams = params.map((p) => `${p.type} ${p.variadic ? '...' : ''}${p.name}`.replace(/\s+/g, ' ').trim());
  const label = `${fnName}(${formattedParams.join(', ')}): ${returnType}`;
  return {
    label,
    documentation: docblock ? new vscode.MarkdownString(docblock) : undefined,
    parameters: params.map((p) => ({ label: `${p.type} ${p.variadic ? '...' : ''}${p.name}`.replace(/\s+/g, ' ').trim() }))
  };
}

function countPhpActiveParameter(argText) {
  let depthParen = 0;
  let depthBracket = 0;
  let depthBrace = 0;
  let inSingle = false;
  let inDouble = false;
  let escape = false;
  let commas = 0;
  for (let i = 0; i < argText.length; i++) {
    const ch = argText[i];
    if (inSingle || inDouble) {
      if (escape) {
        escape = false;
        continue;
      }
      if (ch === '\\') {
        escape = true;
        continue;
      }
      if (inSingle && ch === '\'') inSingle = false;
      if (inDouble && ch === '"') inDouble = false;
      continue;
    }
    if (ch === '\'') { inSingle = true; continue; }
    if (ch === '"') { inDouble = true; continue; }
    if (ch === '(') depthParen++;
    else if (ch === ')') depthParen = Math.max(0, depthParen - 1);
    else if (ch === '[') depthBracket++;
    else if (ch === ']') depthBracket = Math.max(0, depthBracket - 1);
    else if (ch === '{') depthBrace++;
    else if (ch === '}') depthBrace = Math.max(0, depthBrace - 1);
    if (ch === ',' && depthParen === 0 && depthBracket === 0 && depthBrace === 0) commas++;
  }
  return commas;
}

function runPhpLint(phpPath, filePath) {
  return new Promise((resolve, reject) => {
    const php = spawn(phpPath, ['-l', filePath]);
    let stdout = '';
    let stderr = '';
    php.stdout.on('data', (data) => { stdout += data.toString(); });
    php.stderr.on('data', (data) => { stderr += data.toString(); });
    php.on('error', reject);
    php.on('close', (code) => resolve({ code, stdout, stderr }));
  });
}

function parsePhpLintOutput(output) {
  const diagnostics = [];
  const lines = String(output || '').split(/\r?\n/);
  for (const line of lines) {
    const match = line.match(/(?:PHP\s+)?(?:Parse|Fatal)\s+error:\s*(.*?)\s+in\s+.*?\s+on\s+line\s+(\d+)/i);
    if (!match) continue;
    const lineNum = Math.max(0, parseInt(match[2], 10) - 1);
    const message = match[1] || line.trim();
    diagnostics.push({ lineNum, message });
  }
  return diagnostics;
}

function runPhpReflectionForFunction(phpPath, functionName) {
  return new Promise((resolve) => {
    const code = `
$name = ${JSON.stringify(functionName)};
try {
  $rf = new ReflectionFunction($name);
  $params = [];
  foreach ($rf->getParameters() as $p) {
    $t = $p->getType();
    $params[] = [
      "name" => $p->getName(),
      "type" => $t ? (string)$t : "",
      "variadic" => $p->isVariadic(),
      "byReference" => $p->isPassedByReference()
    ];
  }
  $rt = $rf->getReturnType();
  echo json_encode([
    "name" => $rf->getName(),
    "returnType" => $rt ? (string)$rt : "",
    "parameters" => $params
  ]);
} catch (Throwable $e) {
  echo "";
}
`.trim();
    const php = spawn(phpPath, ['-r', code]);
    let stdout = '';
    php.stdout.on('data', (d) => { stdout += d.toString(); });
    php.on('close', () => {
      const text = String(stdout || '').trim();
      if (!text) return resolve(null);
      try {
        return resolve(JSON.parse(text));
      } catch {
        return resolve(null);
      }
    });
    php.on('error', () => resolve(null));
    setTimeout(() => {
      try { php.kill(); } catch {}
      resolve(null);
    }, 1500);
  });
}

module.exports = {
  findMatchingBrace,
  escapeRegExp,
  getPhpNamespace,
  findEnclosingPhpClassName,
  findPhpClassMemberRange,
  resolvePhpClassTokenInDocument,
  parsePhpUseAliases,
  parsePhpClassExtendsImplements,
  resolvePhpTypeTokenToFqn,
  findPhpDocblockBeforeOffset,
  parsePhpDocblock,
  splitPhpParameters,
  parsePhpParameter,
  extractPhpFunctionSignatureNearOffset,
  countPhpActiveParameter,
  runPhpLint,
  parsePhpLintOutput,
  runPhpReflectionForFunction
};
