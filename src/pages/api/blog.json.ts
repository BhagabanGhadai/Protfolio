import { getCollection } from 'astro:content';

export async function GET() {
  const posts = await getCollection('blog');
  const sortedPosts = posts.sort((a, b) => new Date(b.data.date).getTime() - new Date(a.data.date).getTime());

  const data = sortedPosts.map((post) => {
    // Generate terminal lines dynamically from markdown body
    const body = post.body;
    const lines = body.split('\n');
    const terminalLines: string[] = [];

    // Header card
    terminalLines.push(`<div class="blog-full-article">`);
    terminalLines.push(`  <div class="blog-title">${esc(post.data.title)}</div>`);
    terminalLines.push(`  <div class="blog-meta-row">`);
    terminalLines.push(`    <span>📅 ${esc(post.data.date)}</span>`);
    terminalLines.push(`    <span>⏱ ${esc(post.data.readTime)}</span>`);
    terminalLines.push(`    <span>✍ ${esc(post.data.author)}</span>`);
    post.data.tags.forEach(t => {
      terminalLines.push(`    <span class="blog-tag">${esc(t)}</span>`);
    });
    terminalLines.push(`  </div>`);
    terminalLines.push(``);

    let inCodeBlock = false;
    let codeContent: string[] = [];

    for (let i = 0; i < lines.length; i++) {
      const originalLine = lines[i];
      const trimmedLine = originalLine.trim();
      
      // Handle Code Blocks
      if (trimmedLine.startsWith('```')) {
        if (inCodeBlock) {
          // Close block
          terminalLines.push(`  <pre class="blog-code-container">${codeContent.join('\n')}</pre>`);
          codeContent = [];
          inCodeBlock = false;
        } else {
          inCodeBlock = true;
        }
        continue;
      }

      if (inCodeBlock) {
        codeContent.push(esc(originalLine)); // keep original line indents
        continue;
      }

      // Handle Headers
      if (trimmedLine.startsWith('# ')) {
        const title = trimmedLine.replace(/^#\s+/, '');
        terminalLines.push(`  <div class="blog-title">${esc(title)}</div>`);
        continue;
      }
      if (trimmedLine.startsWith('## ') || trimmedLine.startsWith('### ')) {
        const subtitle = trimmedLine.replace(/^###?\s+/, '');
        terminalLines.push(`  <div class="blog-section-title">${esc(subtitle)}</div>`);
        continue;
      }

      // Handle Blockquotes / Callouts
      if (trimmedLine.startsWith('> ')) {
        const quote = trimmedLine.replace(/^>\s+/, '');
        // Check if it is warning or pro tip
        if (quote.toLowerCase().startsWith('warning:') || quote.toLowerCase().startsWith('caution:')) {
          terminalLines.push(`  <div class="blog-callout warning">${replaceInlineMarkdown(quote)}</div>`);
        } else {
          terminalLines.push(`  <div class="blog-callout">${replaceInlineMarkdown(quote)}</div>`);
        }
        continue;
      }

      // Handle empty line
      if (trimmedLine === '') {
        terminalLines.push(``);
        continue;
      }

      // Handle normal paragraphs / lists
      terminalLines.push(`  <p class="c-text">${replaceInlineMarkdown(originalLine)}</p>`);
    }

    terminalLines.push(`</div>`);

    return {
      id: post.slug,
      title: post.data.title,
      date: post.data.date,
      readTime: post.data.readTime,
      tags: post.data.tags,
      summary: post.data.summary,
      coverImage: post.data.coverImage,
      content: terminalLines,
    };
  });

  return new Response(JSON.stringify(data), {
    headers: { 'Content-Type': 'application/json' }
  });
}

function esc(s: string): string {
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function replaceInlineMarkdown(s: string): string {
  let html = esc(s);
  // `code` -> <code>code</code>
  html = html.replace(/`([^`]+)`/g, '<code>$1</code>');
  // **bold** -> <strong>bold</strong>
  html = html.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
  // [text](url) -> <span class="term-link">$1</span> (url)
  html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<span class="term-link">$1</span> ($2)');
  return html;
}
