import {useRef, useState} from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import rehypeSanitize from 'rehype-sanitize'
import {Button} from '@/components/ui/button'
import {Separator} from '@/components/ui/separator'
import {Tooltip, TooltipContent, TooltipProvider, TooltipTrigger} from '@/components/ui/tooltip'
import {
    Bold,
    Italic,
    Strikethrough,
    Heading1,
    Heading2,
    Heading3,
    List,
    ListOrdered,
    Code,
    CodeSquare,
    Quote,
    Link,
    Minus,
} from 'lucide-react'
import {cn} from '@/lib/utils'
import {
    Editor, EditorBubbleMenu, EditorCharacterCount, EditorClearFormatting,
    EditorFloatingMenu, EditorFormatBold,
    EditorFormatCode, EditorFormatItalic, EditorFormatStrike,
    EditorFormatSubscript, EditorFormatSuperscript, EditorFormatUnderline, EditorLinkSelector,
    EditorNodeBulletList, EditorNodeCode,
    EditorNodeHeading1,
    EditorNodeHeading2, EditorNodeHeading3, EditorNodeOrderedList, EditorNodeQuote, EditorNodeTable,
    EditorNodeTaskList, EditorNodeText,
    EditorProvider, EditorSelector,
    EditorTableColumnAfter, EditorTableColumnBefore, EditorTableColumnDelete, EditorTableColumnMenu, EditorTableDelete,
    EditorTableFix,
    EditorTableGlobalMenu, EditorTableHeaderColumnToggle, EditorTableHeaderRowToggle, EditorTableMenu,
    EditorTableMergeCells,
    EditorTableRowAfter,
    EditorTableRowBefore, EditorTableRowDelete,
    EditorTableRowMenu, EditorTableSplitCell,
    JSONContent
} from "@/components/kibo-ui/editor";

interface MarkdownEditorProps {
    value: string
    onChange: (value: string) => void
    height?: number
    className?: string
}

type WrapAction = { type: 'wrap'; before: string; after: string }
type PrefixAction = { type: 'prefix'; prefix: string }
type BlockAction = { type: 'block'; before: string; after: string; placeholder: string }
type ToolbarAction = WrapAction | PrefixAction | BlockAction

interface ToolbarItem {
    icon: React.ReactNode
    label: string
    action: ToolbarAction
}

const TOOLBAR: (ToolbarItem | 'separator')[] = [
    {icon: <Bold/>, label: 'Bold', action: {type: 'wrap', before: '**', after: '**'}},
    {icon: <Italic/>, label: 'Italic', action: {type: 'wrap', before: '*', after: '*'}},
    {icon: <Strikethrough/>, label: 'Strikethrough', action: {type: 'wrap', before: '~~', after: '~~'}},
    'separator',
    {icon: <Heading1/>, label: 'Heading 1', action: {type: 'prefix', prefix: '# '}},
    {icon: <Heading2/>, label: 'Heading 2', action: {type: 'prefix', prefix: '## '}},
    {icon: <Heading3/>, label: 'Heading 3', action: {type: 'prefix', prefix: '### '}},
    'separator',
    {icon: <List/>, label: 'Bullet list', action: {type: 'prefix', prefix: '- '}},
    {icon: <ListOrdered/>, label: 'Numbered list', action: {type: 'prefix', prefix: '1. '}},
    {icon: <Quote/>, label: 'Blockquote', action: {type: 'prefix', prefix: '> '}},
    'separator',
    {icon: <Code/>, label: 'Inline code', action: {type: 'wrap', before: '`', after: '`'}},
    {
        icon: <CodeSquare/>,
        label: 'Code block',
        action: {type: 'block', before: '```\n', after: '\n```', placeholder: 'code here'},
    },
    'separator',
    {
        icon: <Link/>,
        label: 'Link',
        action: {type: 'block', before: '[', after: '](url)', placeholder: 'link text'},
    },
    {icon: <Minus/>, label: 'Divider', action: {type: 'prefix', prefix: '---\n'}},
]

function applyAction(textarea: HTMLTextAreaElement, action: ToolbarAction, current: string): string {
    const start = textarea.selectionStart
    const end = textarea.selectionEnd
    const selected = current.slice(start, end)

    if (action.type === 'wrap') {
        const replacement = `${action.before}${selected || 'text'}${action.after}`
        const next = current.slice(0, start) + replacement + current.slice(end)
        requestAnimationFrame(() => {
            textarea.focus()
            const newStart = start + action.before.length
            const newEnd = newStart + (selected || 'text').length
            textarea.setSelectionRange(newStart, newEnd)
        })
        return next
    }

    if (action.type === 'prefix') {
        const lineStart = current.lastIndexOf('\n', start - 1) + 1
        const next = current.slice(0, lineStart) + action.prefix + current.slice(lineStart)
        requestAnimationFrame(() => {
            textarea.focus()
            textarea.setSelectionRange(start + action.prefix.length, end + action.prefix.length)
        })
        return next
    }

    if (action.type === 'block') {
        const inner = selected || action.placeholder
        const replacement = `${action.before}${inner}${action.after}`
        const next = current.slice(0, start) + replacement + current.slice(end)
        requestAnimationFrame(() => {
            textarea.focus()
            const newStart = start + action.before.length
            textarea.setSelectionRange(newStart, newStart + inner.length)
        })
        return next
    }

    return current
}

function MarkdownEditor({value, onChange, height = 520, className}: MarkdownEditorProps) {
    // @ts-ignore
    const [content, setContent] = useState<JSONContent>(value);
    const textareaRef = useRef<HTMLTextAreaElement>(null)

    const handleToolbar = (action: ToolbarAction) => {
        if (!textareaRef.current) return
        const next = applyAction(textareaRef.current, action, value)
        onChange(next)
    }


    const handleUpdate = ({editor}: { editor: Editor }) => {
        const json = editor.getJSON();
        setContent(json);
        console.log(JSON.stringify(json));
    };

    return (
        <TooltipProvider delayDuration={400}>
            <div className={cn('flex flex-col border rounded-lg overflow-hidden', className)}>
                {/* Toolbar */}
                <div className="flex flex-wrap items-center gap-0.5 border-b px-2 py-1.5 bg-muted/40">
                    {TOOLBAR.map((item, i) => {
                        if (item === 'separator') {
                            return (
                                <Separator
                                    key={`sep-${i}`}
                                    orientation="vertical"
                                    className="mx-1 h-5"
                                />
                            )
                        }
                        return (
                            <Tooltip key={item.label}>
                                <TooltipTrigger asChild>
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        size="sm"
                                        className="h-7 w-7 p-0"
                                        onClick={() => handleToolbar(item.action)}
                                    >
                                        {item.icon}
                                    </Button>
                                </TooltipTrigger>
                                <TooltipContent side="bottom">{item.label}</TooltipContent>
                            </Tooltip>
                        )
                    })}
                </div>

                {/* Split pane */}
                {/* Editor */}
                <div className="flex flex-1" style={{height}}>

                    <EditorProvider
                        content={content}
                        className={cn(
                            'flex-1 resize-none bg-background p-4 font-mono text-sm',
                            'outline-none border-r leading-relaxed',
                            'placeholder:text-muted-foreground',
                        )}
                        placeholder="Write your post in Markdown..."
                        onUpdate={handleUpdate}
                    >
                        <EditorFloatingMenu>
                            <EditorNodeHeading1 hideName/>
                            <EditorNodeBulletList hideName/>
                            <EditorNodeQuote hideName/>
                            <EditorNodeCode hideName/>
                            <EditorNodeTable hideName/>
                        </EditorFloatingMenu>

                        <EditorBubbleMenu>
                            <EditorSelector title="Text">
                                <EditorNodeText/>
                                <EditorNodeHeading1/>
                                <EditorNodeHeading2/>
                                <EditorNodeHeading3/>
                                <EditorNodeBulletList/>
                                <EditorNodeOrderedList/>
                                <EditorNodeTaskList/>
                                <EditorNodeQuote/>
                                <EditorNodeCode/>
                            </EditorSelector>
                            <EditorSelector title="Format">
                                <EditorFormatBold/>
                                <EditorFormatItalic/>
                                <EditorFormatUnderline/>
                                <EditorFormatStrike/>
                                <EditorFormatCode/>
                                <EditorFormatSuperscript/>
                                <EditorFormatSubscript/>
                            </EditorSelector>
                            <EditorLinkSelector/>
                            <EditorClearFormatting/>
                            <EditorTableMenu>
                                <EditorTableColumnMenu>
                                    <EditorTableColumnBefore/>
                                    <EditorTableColumnAfter/>
                                    <EditorTableColumnDelete/>
                                </EditorTableColumnMenu>
                                <EditorTableRowMenu>
                                    <EditorTableRowBefore/>
                                    <EditorTableRowAfter/>
                                    <EditorTableRowDelete/>
                                </EditorTableRowMenu>
                                <EditorTableGlobalMenu>
                                    <EditorTableHeaderColumnToggle/>
                                    <EditorTableHeaderRowToggle/>
                                    <EditorTableDelete/>
                                    <EditorTableMergeCells/>
                                    <EditorTableSplitCell/>
                                    <EditorTableFix/>
                                </EditorTableGlobalMenu>
                            </EditorTableMenu>
                        </EditorBubbleMenu>
                        <EditorCharacterCount.Words>Words: </EditorCharacterCount.Words>

                        <div
                            className={cn(
                                'flex-1 overflow-y-auto p-4',
                                'prose prose-sm dark:prose-invert max-w-none'
                            )}
                        >
                            {value ? (
                                <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeSanitize]}>
                                    {value}
                                </ReactMarkdown>
                            ) : (
                                <p className="text-muted-foreground text-sm italic">Preview will appear here…</p>
                            )}
                        </div>
                    </EditorProvider>
                </div>

                {/*                    <textarea
                        ref={textareaRef}
                        value={value}
                        onChange={(e) => onChange(e.target.value)}
                        className={cn(
                            'flex-1 resize-none bg-background p-4 font-mono text-sm',
                            'outline-none border-r leading-relaxed',
                            'placeholder:text-muted-foreground'
                        )}
                        placeholder="Write your post in Markdown..."
                        spellCheck={false}
                    />*/}

                {/* Preview */}
            </div>
        </TooltipProvider>
    )
}

export default MarkdownEditor
