'use client';

import { useState, useEffect, useRef } from 'react';
import { Light as SyntaxHighlighter } from 'react-syntax-highlighter';
import js from 'react-syntax-highlighter/dist/esm/languages/hljs/javascript';
import xml from 'react-syntax-highlighter/dist/esm/languages/hljs/xml';
import css from 'react-syntax-highlighter/dist/esm/languages/hljs/css';
import { atomOneDark } from 'react-syntax-highlighter/dist/esm/styles/hljs';

// Register only the languages we need
if (typeof SyntaxHighlighter !== 'undefined') {
  SyntaxHighlighter.registerLanguage('javascript', js);
  SyntaxHighlighter.registerLanguage('html', xml);
  SyntaxHighlighter.registerLanguage('xml', xml);
  SyntaxHighlighter.registerLanguage('css', css);
}

/**
 * CodeEditor Component
 * Simulates a code editor with:
 * - Syntax highlighting
 * - Typing animation
 * - Terminal-style header
 * - Line numbers
 * - Output section
 */
export default function CodeEditor({
  code = "console.log('Hello World');",
  language = 'javascript',
  showTyping = false,
  typingSpeed = 80,
  typingDelay = 500,
  showOutput = false,
  output = "Hello World",
  outputDelay = 2000,
  fileName = 'index.html',
  theme = 'dark',
  showLineNumbers = true,
  className = '',
}) {
  const [displayCode, setDisplayCode] = useState(showTyping ? '' : code);
  const [showOutputState, setShowOutputState] = useState(!showTyping && showOutput);
  const [isTyping, setIsTyping] = useState(showTyping);
  const [showCursor, setShowCursor] = useState(showTyping);
  const editorRef = useRef(null);
  const typingIndexRef = useRef(0);
  const hasStartedTypingRef = useRef(false);

  useEffect(() => {
    if (!showTyping) {
      setDisplayCode(code);
      hasStartedTypingRef.current = false;
      return;
    }

    // Se showTyping passa da false a true, resetta il display
    if (showTyping && !hasStartedTypingRef.current) {
      setDisplayCode('');
      setIsTyping(true);
      setShowCursor(true);
      typingIndexRef.current = 0;
      hasStartedTypingRef.current = true;
    }

    // Start typing after delay
    const startTimeout = setTimeout(() => {
      setIsTyping(true);

      const typeNextChar = () => {
        if (typingIndexRef.current < code.length) {
          setDisplayCode(code.substring(0, typingIndexRef.current + 1));
          typingIndexRef.current++;

          // Variable speed for more human-like typing
          const variance = (Math.random() - 0.5) * (typingSpeed * 0.3);
          const nextSpeed = Math.max(30, typingSpeed + variance);

          setTimeout(typeNextChar, nextSpeed);
        } else {
          // Typing complete
          setIsTyping(false);
          setShowCursor(false);

          // Show output if needed
          if (showOutput) {
            setTimeout(() => {
              setShowOutputState(true);
            }, outputDelay);
          }
        }
      };

      typeNextChar();
    }, typingDelay);

    return () => {
      clearTimeout(startTimeout);
      typingIndexRef.current = 0;
    };
  }, [showTyping, code, typingSpeed, typingDelay, showOutput, outputDelay]);

  return (
    <div
      ref={editorRef}
      className={`rounded-lg overflow-hidden border border-(--border-subtle) shadow-lg gpu-accelerated ${className}`}
      style={{
        backgroundColor: 'var(--bg-tertiary)',
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4)',
      }}
    >
      {/* Terminal Header */}
      <div
        className="flex items-center justify-between px-4 py-2.5 border-b"
        style={{
          backgroundColor: 'var(--bg-secondary)',
          borderColor: 'var(--border-subtle)',
        }}
      >
        {/* Traffic light buttons */}
        <div className="flex gap-2">
          <div className="w-3 h-3 rounded-full bg-[#ff5f56]" />
          <div className="w-3 h-3 rounded-full bg-[#ffbd2e]" />
          <div className="w-3 h-3 rounded-full bg-[#27c93f]" />
        </div>

        {/* File name */}
        <div
          className="text-sm font-mono"
          style={{ color: 'var(--text-secondary)' }}
        >
          {fileName}
        </div>

        {/* Empty space for symmetry */}
        <div className="w-[52px]" />
      </div>

      {/* Code Section */}
      <div className="relative">
        <SyntaxHighlighter
          language={language}
          style={atomOneDark}
          showLineNumbers={showLineNumbers}
          wrapLines={true}
          customStyle={{
            margin: 0,
            padding: '1rem',
            background: 'var(--code-bg)',
            fontFamily: "'DM Mono', 'Fira Code', 'Courier New', monospace",
            fontSize: '0.875rem',
          }}
        >
          {displayCode}
        </SyntaxHighlighter>
      </div>

      {/* Output Section */}
      {showOutputState && (
        <div
          className="border-t p-4"
          style={{
            backgroundColor: 'var(--bg-secondary)',
            borderColor: 'var(--border-subtle)',
          }}
        >
          <div className="flex items-start gap-2 font-mono text-sm">
            <span style={{ color: 'var(--success)' }}>→</span>
            <span style={{ color: 'var(--text-primary)' }}>{output}</span>
          </div>
        </div>
      )}
    </div>
  );
}

/**
 * SimpleCodeBlock - Simpler version for static code display
 */
export function SimpleCodeBlock({ code, language = 'javascript', className = '' }) {
  return (
    <div className={`rounded-lg overflow-hidden ${className}`}>
      <SyntaxHighlighter
        language={language}
        style={atomOneDark}
        customStyle={{
          background: 'var(--code-bg)',
          margin: 0,
          padding: '1.5rem',
          borderRadius: '0.5rem',
        }}
      >
        {code}
      </SyntaxHighlighter>
    </div>
  );
}

/**
 * Preset code examples
 */
export const CodeExamples = {
  helloWorld: "console.log('Hello World');",
  helloWorldHTML: `<!DOCTYPE html>
<html lang="it">
<head>
  <meta charset="UTF-8">
  <title>Hello World</title>
</head>
<body>
  <h1>Hello World</h1>
</body>
</html>`,
  helloWorldCSS: `h1 {
  color: #333;
  font-size: 2em;
  text-align: center;
}`,
  helloWorldJS: `function saluta() {
  return 'Hello World!';
}

console.log(saluta());`,
  reactComponent: `function Welcome({ name }) {
  return (
    <div className="greeting">
      <h1>Hello, {name}!</h1>
    </div>
  );
}`,
  laravelMigration: `php artisan make:migration create_users_table
php artisan migrate`,
};
