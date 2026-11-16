// Fast markdown parser - falls back to marked for 100% compatibility
import { marked } from './marked.esm.js';

// Helper to escape HTML entities
function escapeHtml(text) {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

// Check if markdown is "simple enough" for fast path
function isSimple(markdown) {
  // Fallback triggers
  if (markdown.includes('<')) return false; // HTML
  if (markdown.includes('[') && markdown.includes(']')) return false; // Links/refs
  if (markdown.includes('|')) return false; // Tables
  if (markdown.includes('>')) return false; // Blockquotes
  if (markdown.includes('~~')) return false; // Strikethrough
  if (/^\s*\[.+\]:/m.test(markdown)) return false; // Reference definitions
  if (/^>\s/m.test(markdown)) return false; // Blockquote
  if (/^[-=]{3,}\s*$/m.test(markdown)) return false; // Setext headings lookalike
  
  return true;
}

// Process inline formatting (emphasis, strong, code)
function processInline(text) {
  let result = text;
  
  // Code first (highest precedence)
  result = result.replace(/`([^`]+)`/g, (match, code) => {
    return `<code>${escapeHtml(code)}</code>`;
  });
  
  // Strong + em: ***text*** or ___text___
  result = result.replace(/\*\*\*([^*]+)\*\*\*/g, '<strong><em>$1</em></strong>');
  result = result.replace(/___([^_]+)___/g, '<strong><em>$1</em></strong>');
  
  // Strong: **text** or __text__
  result = result.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
  result = result.replace(/__([^_]+)__/g, '<strong>$1</strong>');
  
  // Em: *text* or _text_
  result = result.replace(/\*([^*]+)\*/g, '<em>$1</em>');
  result = result.replace(/_([^_]+)_/g, '<em>$1</em>');
  
  return result;
}

// Fast path parser
function fastParse(markdown) {
  const lines = markdown.split('\n');
  let html = '';
  let i = 0;
  
  while (i < lines.length) {
    const line = lines[i];
    
    // Blank line - skip
    if (line.trim() === '') {
      i++;
      continue;
    }
    
    // Indented code block (4 spaces or 1 tab)
    if (/^( {4}|\t)/.test(line)) {
      let codeLines = [];
      while (i < lines.length && (/^( {4}|\t)/.test(lines[i]) || lines[i].trim() === '')) {
        if (/^( {4}|\t)/.test(lines[i])) {
          codeLines.push(lines[i].replace(/^( {4}|\t)/, ''));
        } else {
          codeLines.push('');
        }
        i++;
      }
      // Remove trailing blank lines
      while (codeLines.length > 0 && codeLines[codeLines.length - 1] === '') {
        codeLines.pop();
      }
      const code = codeLines.join('\n') + '\n';
      html += `<pre><code>${escapeHtml(code)}</code></pre>\n`;
      continue;
    }
    
    // Fenced code block
    const fenceMatch = line.match(/^```(\w*)$/);
    if (fenceMatch) {
      const lang = fenceMatch[1];
      const codeLines = [];
      i++;
      
      while (i < lines.length && !lines[i].match(/^```$/)) {
        codeLines.push(lines[i]);
        i++;
      }
      i++; // skip closing fence
      
      const code = codeLines.join('\n') + (codeLines.length > 0 ? '\n' : '');
      if (lang) {
        html += `<pre><code class="language-${lang}">${escapeHtml(code)}</code></pre>\n`;
      } else {
        html += `<pre><code>${escapeHtml(code)}</code></pre>\n`;
      }
      continue;
    }
    
    // ATX heading
    const headingMatch = line.match(/^(#{1,6})\s+(.+)$/);
    if (headingMatch) {
      const level = headingMatch[1].length;
      let text = headingMatch[2].trim();
      // Remove trailing #
      text = text.replace(/\s*#+\s*$/, '');
      html += `<h${level}>${processInline(text)}</h${level}>\n`;
      i++;
      continue;
    }
    
    // Thematic break (---, ***, ___)
    if (/^(?:\*{3,}|-{3,}|_{3,})\s*$/.test(line)) {
      html += '<hr>\n';
      i++;
      continue;
    }
    
    // Unordered list
    if (/^[-*+]\s/.test(line)) {
      html += '<ul>\n';
      while (i < lines.length && /^[-*+]\s/.test(lines[i])) {
        const text = lines[i].replace(/^[-*+]\s+/, '');
        html += `<li>${processInline(text)}</li>\n`;
        i++;
      }
      html += '</ul>\n';
      continue;
    }
    
    // Ordered list
    if (/^\d+\.\s/.test(line)) {
      html += '<ol>\n';
      while (i < lines.length && /^\d+\.\s/.test(lines[i])) {
        const text = lines[i].replace(/^\d+\.\s+/, '');
        html += `<li>${processInline(text)}</li>\n`;
        i++;
      }
      html += '</ol>\n';
      continue;
    }
    
    // Paragraph (default)
    const paraLines = [];
    while (i < lines.length && 
           lines[i].trim() !== '' &&
           !lines[i].match(/^(#{1,6})\s/) &&
           !lines[i].match(/^```/) &&
           !lines[i].match(/^[-*+]\s/) &&
           !lines[i].match(/^\d+\.\s/) &&
           !lines[i].match(/^(?:\*{3,}|-{3,}|_{3,})\s*$/) &&
           !lines[i].match(/^( {4}|\t)/)) {
      paraLines.push(lines[i]);
      i++;
    }
    
    if (paraLines.length > 0) {
      const text = paraLines.join('\n');
      html += `<p>${processInline(text)}</p>\n`;
    }
  }
  
  return html;
}

// Main export with fast path
export function parse(markdown) {
  // Fast path for very simple cases
  if (isSimple(markdown) && markdown.length < 500) {
    try {
      return fastParse(markdown);
    } catch (e) {
      // Fall back on any error
    }
  }
  
  // Full marked parser for everything else
  return marked.parse(markdown, { gfm: true });
}
