import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { BookOpen, Pencil, Search, Trash2 } from 'lucide-react'
import { BlogPostType } from '@/feature/blog/schema/BlogSchema'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { TimeCell } from '@/components/TimeCell.tsx'
import { PageToolbar } from '@/components/layout/page'
import { SearchInput } from '@/components/data/search-input'
import { RowActions } from '@/components/data/row-actions'
import { TablePagination } from '@/components/data/table-pagination'
import { EmptyState } from '@/components/feedback/empty-state'
import { useDebouncedValue } from '@/hooks/use-debounced-value'
import { useBlogContext } from '@/feature/blog/context/blog-context'
import { BlogPostStatus } from '@/feature/blog/components/BlogPostStatus'

const PAGE_SIZE = 20

const SORT_OPTIONS = [
    { value: 'bp.created_at:desc', label: 'Neueste zuerst', sortColumn: 'bp.created_at', sortDirection: 'desc' },
    { value: 'bp.created_at:asc', label: 'Älteste zuerst', sortColumn: 'bp.created_at', sortDirection: 'asc' },
    { value: 'title:asc', label: 'Titel A–Z', sortColumn: 'title', sortDirection: 'asc' },
    { value: 'title:desc', label: 'Titel Z–A', sortColumn: 'title', sortDirection: 'desc' },
] as const

type SortValue = typeof SORT_OPTIONS[number]['value']

interface BlogTableProps {
    posts: BlogPostType[]
    maxPages?: number
    loading: boolean
    setFilterData: (filterData: Record<string, string>) => void
}

function BlogPostCard({ post, onDelete }: { post: BlogPostType; onDelete: () => void }) {
    const navigate = useNavigate()
    const href = `/dashboard/blog/${post.blogId}`

    return (
        <article className='group relative flex flex-col rounded-xl border bg-card shadow-xs transition-colors duration-fast hover:border-primary/40 focus-within:ring-2 focus-within:ring-ring'>
            <div className='flex items-start justify-between gap-3 p-5 pb-3'>
                <div className='min-w-0 space-y-1'>
                    <h3 className='line-clamp-2 text-base font-semibold leading-snug'>
                        {/* Stretched Link: die ganze Card ist klickbar, bleibt aber ein echter Link. */}
                        <Link to={href} className='outline-none after:absolute after:inset-0 after:rounded-xl'>
                            {post.title}
                        </Link>
                    </h3>
                    <p className='text-xs text-muted-foreground'>von {post.user.username}</p>
                </div>
                <RowActions
                    className='relative z-10 -mr-2 -mt-1'
                    label={post.title}
                    actions={[
                        { label: 'Bearbeiten', icon: Pencil, onSelect: () => navigate(href) },
                        { label: 'Löschen', icon: Trash2, destructive: true, onSelect: onDelete },
                    ]}
                />
            </div>
            <div className='flex-1 space-y-3 px-5'>
                <p className='line-clamp-3 text-sm text-muted-foreground'>
                    {post.excerpt || 'Keine Kurzbeschreibung'}
                </p>
                {post.tags.length > 0 && (
                    <div className='flex flex-wrap gap-1'>
                        {post.tags.map((tag) => (
                            <Badge key={tag.tagId} variant='secondary'>{tag.name}</Badge>
                        ))}
                    </div>
                )}
            </div>
            <div className='mt-4 flex items-center justify-between gap-2 border-t px-5 py-3 text-xs text-muted-foreground'>
                <BlogPostStatus published={post.isPublished} />
                <TimeCell iso={post.createdAt} />
            </div>
        </article>
    )
}

function BlogPostCardSkeleton() {
    return (
        <div className='flex flex-col rounded-xl border bg-card shadow-xs'>
            <div className='space-y-2 p-5 pb-3'>
                <Skeleton className='h-5 w-3/4' />
                <Skeleton className='h-3 w-1/3' />
            </div>
            <div className='flex-1 space-y-2 px-5'>
                <Skeleton className='h-4 w-full' />
                <Skeleton className='h-4 w-2/3' />
            </div>
            <div className='mt-4 flex items-center justify-between border-t px-5 py-3'>
                <Skeleton className='h-5 w-24' />
                <Skeleton className='h-3 w-16' />
            </div>
        </div>
    )
}

function BlogTable({ posts, maxPages, loading, setFilterData }: BlogTableProps) {
    const navigate = useNavigate()
    const { setOpen, setCurrentRow } = useBlogContext()

    const [page, setPage] = useState(1)
    const [search, setSearch] = useState('')
    const debouncedSearch = useDebouncedValue(search)
    const [sort, setSort] = useState<SortValue>(SORT_OPTIONS[0].value)
    const hasFilter = debouncedSearch !== ''

    useEffect(() => setPage(1), [debouncedSearch, sort])

    useEffect(() => {
        const sortOption = SORT_OPTIONS.find((option) => option.value === sort) ?? SORT_OPTIONS[0]
        setFilterData({
            page: String(page),
            pageSize: String(PAGE_SIZE),
            title: debouncedSearch,
            sortColumn: sortOption.sortColumn,
            sortDirection: sortOption.sortDirection,
        })
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [page, debouncedSearch, sort])

    return (
        <div className='space-y-4'>
            <PageToolbar>
                <SearchInput value={search} onChange={setSearch} placeholder='Beiträge durchsuchen…' />
                <Select value={sort} onValueChange={(value) => setSort(value as SortValue)}>
                    <SelectTrigger className='w-full sm:w-44' aria-label='Sortierung'>
                        <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                        {SORT_OPTIONS.map((option) => (
                            <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>
                        ))}
                    </SelectContent>
                </Select>
                {hasFilter && <Button variant='ghost' onClick={() => setSearch('')}>Filter zurücksetzen</Button>}
            </PageToolbar>

            {loading ? (
                <div className='grid gap-4 sm:grid-cols-2 xl:grid-cols-3' aria-busy='true' aria-label='Wird geladen'>
                    {Array.from({ length: 6 }, (_, i) => <BlogPostCardSkeleton key={i} />)}
                </div>
            ) : posts.length === 0 ? (
                hasFilter ? (
                    <EmptyState
                        icon={Search}
                        title='Keine Treffer'
                        description='Kein Beitrag passt zu deiner Suche.'
                        action={<Button variant='outline' size='sm' onClick={() => setSearch('')}>Filter zurücksetzen</Button>}
                    />
                ) : (
                    <EmptyState
                        icon={BookOpen}
                        title='Noch keine Beiträge'
                        description='Schreib deinen ersten Beitrag – als Entwurf oder direkt veröffentlicht.'
                        action={<Button variant='outline' size='sm' onClick={() => navigate('/dashboard/blog/create')}>Beitrag schreiben</Button>}
                    />
                )
            ) : (
                <div className='grid gap-4 sm:grid-cols-2 xl:grid-cols-3'>
                    {posts.map((post) => (
                        <BlogPostCard
                            key={post.blogId}
                            post={post}
                            onDelete={() => {
                                setCurrentRow(post)
                                setOpen('delete')
                            }}
                        />
                    ))}
                </div>
            )}

            {!loading && posts.length > 0 && (
                <div className='rounded-xl border bg-card'>
                    <TablePagination
                        page={page}
                        totalPages={maxPages}
                        rowCount={posts.length}
                        isLoading={loading}
                        onPageChange={setPage}
                    />
                </div>
            )}
        </div>
    )
}

export default BlogTable
