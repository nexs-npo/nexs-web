import { useState } from 'react';
import { Icons } from '@/components/Icons';

interface CopyForAIProps {
  articleId: string;
  articleTitle: string;
  articleSummary: string;
  articleContent: string;
}

export default function CopyForAI({
  articleId,
  articleTitle,
  articleSummary,
  articleContent,
}: CopyForAIProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    // Collect all knowledge links from the page
    const knowledgeLinks = document.querySelectorAll('.knowledge-link');
    const references: { id: string; title: string; summary: string }[] = [];

    knowledgeLinks.forEach((link) => {
      const id = link.getAttribute('data-id');
      const title = link.getAttribute('data-title');
      const summary = link.getAttribute('data-summary');

      if (id && title && summary) {
        // Avoid duplicates
        if (!references.find((r) => r.id === id)) {
          references.push({ id, title, summary });
        }
      }
    });

    // Build Markdown content
    let markdown = `# ${articleId} ${articleTitle}\n\n`;
    markdown += `> ${articleSummary}\n\n`;
    markdown += `${articleContent}\n\n`;

    if (references.length > 0) {
      markdown += `---\n\n## Referenced Knowledge\n\n`;
      references.forEach((ref) => {
        markdown += `### ${ref.id} ${ref.title}\n`;
        markdown += `${ref.summary}\n\n`;
      });
    }

    try {
      // Try modern clipboard API first
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(markdown);
      } else {
        // Fallback for older browsers or non-secure contexts
        const textArea = document.createElement('textarea');
        textArea.value = markdown;
        textArea.style.position = 'fixed';
        textArea.style.left = '-999999px';
        textArea.style.top = '-999999px';
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        document.execCommand('copy');
        textArea.remove();
      }
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
      alert('コピーに失敗しました');
    }
  };

  return (
    <button
      onClick={handleCopy}
      className="flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-3 text-xs font-bold text-gray-800 hover:bg-gray-50 transition-colors"
      type="button"
    >
      {copied ? (
        <>
          <Icons.Check className="w-4 h-4 text-green-600" />
          <span className="text-green-600">Copied!</span>
        </>
      ) : (
        <>
          <Icons.Copy className="w-4 h-4" />
          <span>Copy for AI</span>
        </>
      )}
    </button>
  );
}
