import { useState, useEffect } from 'react'
import MDEditor from '@uiw/react-md-editor'
import remarkGfm from 'remark-gfm'
import { useTheme } from '@/context/theme-provider'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card } from '@/components/ui/card'
import { 
  Eye, 
  Edit3, 
  Code, 
  Type, 
  List, 
  Quote, 
  Link,
  ImageIcon,
  Bold,
  Italic,
  Hash,
  Minus
} from 'lucide-react'

interface MarkdownEditorProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  height?: number
  preview?: 'live' | 'edit' | 'preview'
}

export function MarkdownEditor({ 
  value, 
  onChange, 
  placeholder = "Write your content in Markdown...", 
  height = 400,
  preview = 'live'
}: MarkdownEditorProps) {
  const { theme } = useTheme()
  const [previewMode, setPreviewMode] = useState(preview)
  const [colorMode, setColorMode] = useState<'light' | 'dark'>('light')

  useEffect(() => {
    const updateColorMode = () => {
      if (theme === 'dark') {
        setColorMode('dark')
      } else if (theme === 'light') {
        setColorMode('light')
      } else {
        // System theme - check actual applied theme
        const isDark = document.documentElement.classList.contains('dark')
        setColorMode(isDark ? 'dark' : 'light')
      }
    }

    updateColorMode()

    // Listen for system theme changes when using 'system' theme
    if (theme === 'system') {
      const observer = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
          if (mutation.type === 'attributes' && mutation.attributeName === 'class') {
            updateColorMode()
          }
        })
      })

      observer.observe(document.documentElement, {
        attributes: true,
        attributeFilter: ['class']
      })

      return () => observer.disconnect()
    }
  }, [theme])

  const insertText = (before: string, after: string = '', placeholder: string = '') => {
    const textarea = document.querySelector('.w-md-editor-text-textarea') as HTMLTextAreaElement
    if (!textarea) return

    const start = textarea.selectionStart
    const end = textarea.selectionEnd
    const selectedText = value.substring(start, end)
    const textToInsert = selectedText || placeholder
    const newText = before + textToInsert + after
    
    const newValue = value.substring(0, start) + newText + value.substring(end)
    onChange(newValue)
    
    // Set cursor position
    setTimeout(() => {
      const newPosition = start + before.length + textToInsert.length
      textarea.setSelectionRange(newPosition, newPosition)
      textarea.focus()
    }, 10)
  }

  const quickInsertButtons = [
    { icon: Bold, label: 'Bold', onClick: () => insertText('**', '**', 'bold text') },
    { icon: Italic, label: 'Italic', onClick: () => insertText('*', '*', 'italic text') },
    { icon: Hash, label: 'Heading', onClick: () => insertText('## ', '', 'heading') },
    { icon: List, label: 'List', onClick: () => insertText('- ', '', 'list item') },
    { icon: Quote, label: 'Quote', onClick: () => insertText('> ', '', 'quote') },
    { icon: Code, label: 'Code', onClick: () => insertText('`', '`', 'code') },
    { icon: Link, label: 'Link', onClick: () => insertText('[', '](url)', 'link text') },
    { icon: ImageIcon, label: 'Image', onClick: () => insertText('![', '](image-url)', 'alt text') },
    { icon: Minus, label: 'Divider', onClick: () => insertText('\n---\n', '', '') },
  ]

  const templates = [
    {
      name: 'Grammar Lesson',
      content: `# Grammar Topic: Present Simple

## Overview
Explain the main grammar rule here...

## Structure
**Affirmative:** Subject + verb (+ s/es for 3rd person singular)
- I work
- He works
- They work

**Negative:** Subject + do/does + not + verb
- I don't work
- He doesn't work

**Question:** Do/Does + subject + verb?
- Do you work?
- Does he work?

## Examples
### Simple Examples
1. **I work** in an office
2. **She studies** English every day
3. **They don't like** coffee

### Complex Examples
1. **He usually gets up** at 7 AM and **goes** to work
2. **Do you always eat** breakfast before work?

## Common Mistakes
- ❌ He work every day → ✅ He works every day
- ❌ Does you like it? → ✅ Do you like it?

## Practice Tips
- Remember to add -s/es for 3rd person singular
- Use auxiliary verbs (do/does) for questions and negatives
- Practice with daily routine vocabulary

## Summary
Present Simple is used for habits, facts, and regular actions.`
    },
    {
      name: 'Vocabulary Lesson',
      content: `# Vocabulary: Family Members

## Core Vocabulary

| English | Russian | Uzbek |
|---------|---------|-------|
| Mother | Мать | Ona |
| Father | Отец | Ota |
| Sister | Сестра | Opa |
| Brother | Брат | Aka |

## Usage Examples
- **My mother** is a doctor
- **His father** works in a bank
- **She has two sisters**

## Common Phrases
- Family reunion - семейная встреча
- Close family - близкая семья
- Extended family - дальние родственники

## Practice Activities
1. Draw your family tree
2. Describe each family member
3. Use possessive pronouns with family words`
    },
    {
      name: 'Pronunciation Guide',
      content: `# Pronunciation: TH Sounds

## The Problem
Russian and Uzbek speakers often struggle with TH sounds.

## Two Types of TH

### Voiceless TH /θ/ (like in "think")
**Words:** thing, thank, three, mouth
**Tip:** Put tongue between teeth and blow air

### Voiced TH /ð/ (like in "this")  
**Words:** this, that, they, breathe
**Tip:** Put tongue between teeth and vibrate vocal cords

## Common Mistakes
- ❌ "sink" → ✅ "think"
- ❌ "dis" → ✅ "this" 
- ❌ "tree" → ✅ "three"

## Practice Sentences
1. **This** and **that** are **things** I need
2. **They** **think** **three** **thousand** **thoughts**
3. **The** **weather** is getting **warmer**

## Audio Practice
🎵 Listen and repeat: [Audio link would go here]`
    }
  ]

  return (
    <div className="space-y-4">
      {/* Quick Action Bar */}
      <Card className="p-3">
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-1">
            {quickInsertButtons.map((button, index) => (
              <Button
                key={index}
                variant="ghost"
                size="sm"
                onClick={button.onClick}
                className="h-8 w-8 p-0"
                title={button.label}
              >
                <button.icon className="h-3 w-3" />
              </Button>
            ))}
          </div>
          <div className="flex items-center gap-2 ml-auto">
            <Badge variant="secondary" className="text-xs">
              {value.length} characters
            </Badge>
            <Badge variant="secondary" className="text-xs">
              {value.split(/\s+/).filter(word => word.length > 0).length} words
            </Badge>
          </div>
        </div>
      </Card>

      {/* Template Selector */}
      <Card className="p-3">
        <div className="flex items-center gap-2 mb-2">
          <Type className="h-4 w-4" />
          <span className="text-sm font-medium">Quick Templates:</span>
        </div>
        <div className="flex flex-wrap gap-2">
          {templates.map((template, index) => (
            <Button
              key={index}
              variant="outline"
              size="sm"
              onClick={() => onChange(template.content)}
              className="text-xs"
            >
              {template.name}
            </Button>
          ))}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onChange('')}
            className="text-xs text-red-600 hover:text-red-700"
          >
            Clear All
          </Button>
        </div>
      </Card>

      {/* Main Editor */}
      <div className="rounded-md border overflow-hidden">
        <div className="flex items-center justify-between p-2 bg-muted/50 border-b">
          <div className="flex items-center gap-2">
            <Edit3 className="h-4 w-4" />
            <span className="text-sm font-medium">Markdown Editor</span>
          </div>
          <div className="flex items-center gap-1">
            <Button
              variant={previewMode === 'edit' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setPreviewMode('edit')}
              className="h-7 text-xs"
            >
              <Edit3 className="h-3 w-3 mr-1" />
              Edit
            </Button>
            <Button
              variant={previewMode === 'live' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setPreviewMode('live')}
              className="h-7 text-xs"
            >
              <Eye className="h-3 w-3 mr-1" />
              Live
            </Button>
            <Button
              variant={previewMode === 'preview' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setPreviewMode('preview')}
              className="h-7 text-xs"
            >
              <Eye className="h-3 w-3 mr-1" />
              Preview
            </Button>
          </div>
        </div>
        
        <MDEditor
          value={value}
          onChange={(val) => onChange(val || '')}
          preview={previewMode}
          height={height}
          data-color-mode={colorMode}
          hideToolbar
          visibleDragbar={false}
          textareaProps={{
            placeholder,
            className: 'font-mono text-sm',
            style: { fontSize: '14px', lineHeight: '1.5' }
          }}
          previewOptions={{
            remarkPlugins: [remarkGfm],
            components: {
              h1: ({children}) => <h1 className="text-2xl font-bold mb-4 text-foreground border-b border-border pb-2">{children}</h1>,
              h2: ({children}) => <h2 className="text-xl font-semibold mb-3 mt-6 text-foreground">{children}</h2>,
              h3: ({children}) => <h3 className="text-lg font-semibold mb-2 mt-4 text-foreground">{children}</h3>,
              h4: ({children}) => <h4 className="text-base font-semibold mb-2 mt-3 text-foreground">{children}</h4>,
              p: ({children}) => <p className="mb-3 text-foreground leading-relaxed">{children}</p>,
              ul: ({children}) => <ul className="mb-4 ml-4 space-y-1 text-foreground list-disc">{children}</ul>,
              ol: ({children}) => <ol className="mb-4 ml-4 space-y-1 text-foreground list-decimal">{children}</ol>,
              li: ({children}) => <li className="text-foreground leading-relaxed ml-1">{children}</li>,
              strong: ({children}) => <strong className="font-bold text-foreground">{children}</strong>,
              em: ({children}) => <em className="italic text-foreground">{children}</em>,
              code: ({children}) => <code className="bg-muted px-2 py-1 rounded text-sm font-mono text-foreground border border-border">{children}</code>,
              pre: ({children}) => <pre className="bg-muted border border-border p-4 rounded-md overflow-x-auto mb-4 text-sm text-foreground">{children}</pre>,
              blockquote: ({children}) => <blockquote className="border-l-4 border-primary pl-4 italic text-muted-foreground mb-4 bg-muted/30 py-2">{children}</blockquote>,
              table: ({children}) => <div className="overflow-x-auto mb-4"><table className="min-w-full border border-border">{children}</table></div>,
              thead: ({children}) => <thead className="bg-muted">{children}</thead>,
              tbody: ({children}) => <tbody>{children}</tbody>,
              tr: ({children}) => <tr className="border-b border-border">{children}</tr>,
              th: ({children}) => <th className="border border-border px-4 py-2 text-left font-semibold text-foreground">{children}</th>,
              td: ({children}) => <td className="border border-border px-4 py-2 text-foreground">{children}</td>,
              hr: () => <hr className="my-6 border-t border-border" />
            }
          }}
        />
      </div>

      {/* Help Section */}
      <Card className="p-3">
        <details className="group">
          <summary className="flex items-center gap-2 cursor-pointer text-sm font-medium hover:text-primary">
            <Hash className="h-4 w-4" />
            Markdown Syntax Help
            <span className="ml-auto text-xs text-muted-foreground group-open:hidden">Click to expand</span>
          </summary>
          <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div className="space-y-2">
              <h4 className="font-medium">Basic Formatting</h4>
              <div className="space-y-1 text-xs font-mono">
                <div><code>**bold**</code> → <strong>bold</strong></div>
                <div><code>*italic*</code> → <em>italic</em></div>
                <div><code>`code`</code> → <code>code</code></div>
                <div><code># Heading 1</code></div>
                <div><code>## Heading 2</code></div>
                <div><code>### Heading 3</code></div>
              </div>
            </div>
            <div className="space-y-2">
              <h4 className="font-medium">Lists & Links</h4>
              <div className="space-y-1 text-xs font-mono">
                <div><code>- List item</code></div>
                <div><code>1. Numbered item</code></div>
                <div><code>[Link](url)</code></div>
                <div><code>![Image](url)</code></div>
                <div><code>{'>'} Quote</code></div>
                <div><code>---</code> (divider)</div>
              </div>
            </div>
          </div>
        </details>
      </Card>
    </div>
  )
}