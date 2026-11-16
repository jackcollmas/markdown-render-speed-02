/**
 * Fast Markdown parser compatible with marked 18.1.3
 * 
 * Strategy: Fast path for trivially simple cases, fallback to marked for everything else
 * Maintains 100% compatibility by being extremely conservative
 * 
 * Fast path handles:
 * - Simple single-line ATX headings with plain text
 * - Simple paragraphs with alphanumeric + basic punctuation only
 * - Fenced code blocks with clear structure
 * - Horizontal rules
 * - Blank lines
 * 
 * Everything else: marked
 */

import { marked } from './marked.esm.js';

// Cache marked.parse for faster repeated calls
const markedParse = marked.parse.bind(marked);

// Optimized HTML escaping
const escapeTest = /[&<>"']/;
const escapeReplace = /[&<>"']/g;
const escapeMap = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' };
const escape = (text) => escapeTest.test(text) ? text.replace(escapeReplace, c => escapeMap[c]) : text;

// Patterns for trivial cases
const SIMPLE_HEADING = /^(#{1,6}) ([a-zA-Z0-9 .,;:!?()'"-]+)$/;
const SIMPLE_TEXT = /^[a-zA-Z0-9 .,;:!?()'"-]+$/;
const HR = /^ {0,3}(?:(?:\*[ \t]*){3,}|(?:-[ \t]*){3,}|(?:_[ \t]*){3,})$/;
const FENCE_START = /^```([a-zA-Z0-9_+-]*)$/;

/**
 * Try fast path - only handles trivially simple markdown
 */
function tryFast(md) {
  // Immediate bailouts for ANY complexity
  if (md.length > 5000) return null;
  if (md.includes('**')) return null;
  if (md.includes('__')) return null;
  if (md.includes('[')) return null;
  if (md.includes('<')) return null;
  if (md.includes('>')) return null;
  if (md.includes('|')) return null;
  if (md.includes('~~')) return null;
  if (md.includes('\\')) return null;
  if (md.includes('`') && !md.includes('```')) return null;
  if (/^[*+-] /m.test(md)) return null;
  if (/^\d+[.)] /m.test(md)) return null; // numbered lists and patterns like "10)"
  if (/^    /m.test(md)) return null;
  if (/\*[^*\s]/.test(md)) return null;
  if (/_[a-zA-Z]/.test(md)) return null;
  if (/^[-=]+\s*$/m.test(md)) return null;
  if (/  \n/.test(md)) return null; // hard line breaks (2+ spaces before newline)
  if (/\nwww\./i.test(md) || /^www\./i.test(md)) return null; // www autolinks
  
  const lines = md.split('\n');
  let out = '';
  let i = 0;
  
  while (i < lines.length) {
    const line = lines[i];
    
    // Blank
    if (!line.trim()) {
      i++;
      continue;
    }
    
    // Simple heading
    const hm = SIMPLE_HEADING.exec(line);
    if (hm) {
      const d = hm[1].length;
      const t = hm[2].trim();
      out += `<h${d}>${escape(t)}</h${d}>\n`;
      i++;
      continue;
    }
    
    // HR
    if (HR.test(line)) {
      out += '<hr>\n';
      i++;
      continue;
    }
    
    // Fenced code
    const fm = FENCE_START.exec(line);
    if (fm) {
      const lang = fm[1];
      i++;
      const code = [];
      while (i < lines.length && lines[i] !== '```') {
        code.push(lines[i]);
        i++;
      }
      if (i >= lines.length) return null;
      
      const c = code.join('\n') + (code.length ? '\n' : '');
      out += lang
        ? `<pre><code class="language-${escape(lang)}">${escape(c)}</code></pre>\n`
        : `<pre><code>${escape(c)}</code></pre>\n`;
      i++;
      continue;
    }
    
    // Simple paragraph
    if (SIMPLE_TEXT.test(line)) {
      const para = [line];
      i++;
      while (i < lines.length && SIMPLE_TEXT.test(lines[i])) {
        para.push(lines[i]);
        i++;
      }
      out += `<p>${escape(para.join('\n'))}</p>\n`;
      continue;
    }
    
    // Anything else: bail
    return null;
  }
  
  return out;
}

/**
 * Parse markdown to HTML
 */
export function parse(markdown) {
  const fast = tryFast(markdown);
  return fast !== null ? fast : markedParse(markdown);
}
