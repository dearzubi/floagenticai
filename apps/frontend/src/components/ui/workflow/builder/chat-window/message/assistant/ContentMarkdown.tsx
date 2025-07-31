import ReactMarkdown from "react-markdown";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { oneDark as oneDarkTheme } from "react-syntax-highlighter/dist/esm/styles/prism";
import remarkGfm from "remark-gfm";
import { FC, memo, useMemo, CSSProperties } from "react";

const ContentMarkdown: FC<{
  content: string;
  style?: CSSProperties;
}> = memo(({ content, style }) => {
  const memoizedContent = useMemo(() => content, [content]);

  return (
    <div className="prose-wrapper min-w-0 overflow-hidden">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          a({ href, children, ...props }) {
            return (
              <a
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                className="break-words"
                {...props}
              >
                {children}
              </a>
            );
          },

          p({ children, ...props }) {
            return (
              <p className="break-words" {...props}>
                {children}
              </p>
            );
          },

          pre({ children, ...props }) {
            return (
              <pre
                className="overflow-x-auto whitespace-pre-wrap break-words"
                {...props}
              >
                {children}
              </pre>
            );
          },
          //@ts-expect-error - TODO: not major issue, check later
          code({ inline, className, children, ...props }) {
            const match = /language-(\w+)/.exec(className ?? "");
            return !inline && match ? (
              <div className="overflow-x-auto">
                <SyntaxHighlighter
                  //@ts-expect-error - TODO: not major issue, check later
                  style={style ? style : oneDarkTheme}
                  language={match[1]}
                  PreTag="div"
                  wrapLines={true}
                  wrapLongLines={true}
                  {...props}
                >
                  {String(children).replace(/\n$/, "")}
                </SyntaxHighlighter>
              </div>
            ) : (
              <code className={`${className} break-words`} {...props}>
                {children}
              </code>
            );
          },

          table({ children, ...props }) {
            return (
              <div className="overflow-x-auto">
                <table {...props}>{children}</table>
              </div>
            );
          },
        }}
      >
        {memoizedContent}
      </ReactMarkdown>
    </div>
  );
});

ContentMarkdown.displayName = "ContentMarkdown";

export default ContentMarkdown;
