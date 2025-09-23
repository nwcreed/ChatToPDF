import React, { Suspense } from "react"
import Markdown, { Components } from "react-markdown"
import remarkGfm from "remark-gfm"

import { cn } from "@/lib/utils"

interface MarkdownRendererProps {
  children: string
}

export function MarkdownRenderer({ children }: MarkdownRendererProps) {
  return (
    <Markdown
      remarkPlugins={[remarkGfm]}
      components={COMPONENTS}
    >
      {children}
    </Markdown>
  )
}

interface HighlightedPreProps extends React.HTMLAttributes<HTMLPreElement> {
  children: string
  language: string
}

const HighlightedPre = React.memo(
  async ({ children, language, ...props }: HighlightedPreProps) => {
    const { codeToTokens, bundledLanguages } = await import("shiki")

    if (!(language in bundledLanguages)) {
      return <pre {...props}>{children}</pre>
    }

    const { tokens } = await codeToTokens(children, {
      lang: language as keyof typeof bundledLanguages,
      defaultColor: false,
      themes: {
        light: "github-light",
        dark: "github-dark",
      },
    })

    return (
      <pre {...props}>
        <code>
          {tokens.map((line, lineIndex) => (
            <React.Fragment key={lineIndex}>
              <span>
                {line.map((token, tokenIndex) => {
                  const style =
                    typeof token.htmlStyle === "string"
                      ? undefined
                      : token.htmlStyle

                  return (
                    <span
                      key={tokenIndex}
                      className="text-shiki-light bg-shiki-light-bg dark:text-shiki-dark dark:bg-shiki-dark-bg"
                      style={style}
                    >
                      {token.content}
                    </span>
                  )
                })}
              </span>
              {lineIndex !== tokens.length - 1 && "\n"}
            </React.Fragment>
          ))}
        </code>
      </pre>
    )
  }
)
HighlightedPre.displayName = "HighlightedCode"

interface CodeBlockProps extends React.HTMLAttributes<HTMLPreElement> {
  children: React.ReactNode
  className?: string
  language: string
}

const CodeBlock = ({
  children,
  className,
  language,
  ...restProps
}: CodeBlockProps) => {
  const code =
    typeof children === "string"
      ? children
      : childrenTakeAllStringContents(children)

  const preClass = cn(
    "overflow-x-scroll rounded-md border bg-background/50 p-4 font-mono text-sm [scrollbar-width:none]",
    className
  )

  return (
    <div className="relative mb-4">
      <Suspense
        fallback={
          <pre className={preClass} {...restProps}>
            {children}
          </pre>
        }
      >
        <HighlightedPre language={language} className={preClass}>
          {code}
        </HighlightedPre>
      </Suspense>
    </div>
  )
}

function childrenTakeAllStringContents(element: any): string {
  if (typeof element === "string") {
    return element
  }

  if (element?.props?.children) {
    let children = element.props.children

    if (Array.isArray(children)) {
      return children
        .map((child) => childrenTakeAllStringContents(child))
        .join("")
    } else {
      return childrenTakeAllStringContents(children)
    }
  }

  return ""
}

/**
 * Fix typage de react-markdown
 */
const COMPONENTS: Components = {
  h1: ({ node, ...props }) => <h1 className="text-2xl font-semibold" {...props} />,
  h2: ({ node, ...props }) => <h2 className="text-xl font-semibold" {...props} />,
  h3: ({ node, ...props }) => <h3 className="text-lg font-semibold" {...props} />,
  h4: ({ node, ...props }) => <h4 className="text-base font-semibold" {...props} />,
  h5: ({ node, ...props }) => <h5 className="font-medium" {...props} />,
  strong: ({ node, ...props }) => <strong className="font-semibold" {...props} />,
  a: ({ node, ...props }) => (
    <a className="text-primary underline underline-offset-2" {...props} />
  ),
  blockquote: ({ node, ...props }) => (
    <blockquote className="border-l-2 border-primary pl-4" {...props} />
  ),
  code: ({ node, className, children, ...rest }) => {
    const match = /language-(\w+)/.exec(className || "")
    return match ? (
      <CodeBlock className={className} language={match[1]} {...rest}>
        {children}
      </CodeBlock>
    ) : (
      <code
        className={cn(
          "font-mono [:not(pre)>&]:rounded-md [:not(pre)>&]:bg-background/50 [:not(pre)>&]:px-1 [:not(pre)>&]:py-0.5"
        )}
        {...rest}
      >
        {children}
      </code>
    )
  },
  ol: ({ node, ...props }) => <ol className="list-decimal space-y-2 pl-6" {...props} />,
  ul: ({ node, ...props }) => <ul className="list-disc space-y-2 pl-6" {...props} />,
  li: ({ node, ...props }) => <li className="my-1.5" {...props} />,
  table: ({ node, ...props }) => (
    <table
      className="w-full border-collapse overflow-y-auto rounded-md border border-foreground/20"
      {...props}
    />
  ),
  th: ({ node, ...props }) => (
    <th
      className="border border-foreground/20 px-4 py-2 text-left font-bold [&[align=center]]:text-center [&[align=right]]:text-right"
      {...props}
    />
  ),
  td: ({ node, ...props }) => (
    <td
      className="border border-foreground/20 px-4 py-2 text-left [&[align=center]]:text-center [&[align=right]]:text-right"
      {...props}
    />
  ),
  tr: ({ node, ...props }) => (
    <tr className="m-0 border-t p-0 even:bg-muted" {...props} />
  ),
  p: ({ node, ...props }) => <p className="whitespace-pre-wrap" {...props} />,
  hr: ({ node, ...props }) => <hr className="border-foreground/20" {...props} />,
}

export default MarkdownRenderer
