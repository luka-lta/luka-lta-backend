import { useNavigate } from 'react-router-dom'
import { DataTable } from '@/components/dataTable/DataTable'
import { BlogPostType } from '@/feature/blog/schema/BlogSchema'
import { TableCell, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { EllipsisVertical, Pencil, Trash } from 'lucide-react'
import { cn, formatDate } from '@/lib/utils'
import { useQueryClient } from '@tanstack/react-query'
import { SearchFilter } from '@/components/dataTable/filter/SearchFilter'
import { useBlogContext } from '@/feature/blog/context/blog-context'
import LongText from '@/components/long-text'

interface BlogTableProps {
    posts: BlogPostType[]
    maxPages?: number
    loading: boolean
    setFilterData: (filterData: Record<string, any>) => void
}

function BlogTable({ posts, maxPages, loading, setFilterData }: BlogTableProps) {
    const queryClient = useQueryClient()
    const navigate = useNavigate()
    const { setOpen, setCurrentRow } = useBlogContext()

    return (
        <div className="space-y-4">
            <DataTable
                data={posts}
                header={[
                    { label: 'Title', sortName: 'title' },
                    { label: 'Excerpt' },
                    { label: 'Tags' },
                    { label: 'Status' },
                    { label: 'Created At', sortName: 'bp.created_at' },
                    { label: '' },
                ]}
                maxPages={maxPages}
                loading={loading}
                renderRow={(post) => (
                    <TableRow key={post.blogId}>
                        <TableCell className="font-medium">{post.title}</TableCell>
                        <TableCell>
                            <LongText className="max-w-48">
                                {post.excerpt ?? '—'}
                            </LongText>
                        </TableCell>
                        <TableCell>
                            <div className="flex flex-wrap gap-1">
                                {post.tags.length === 0 ? (
                                    <span className="text-muted-foreground text-sm">—</span>
                                ) : (
                                    post.tags.map((tag) => (
                                        <Badge key={tag.tagId} variant="secondary">
                                            {tag.name}
                                        </Badge>
                                    ))
                                )}
                            </div>
                        </TableCell>
                        <TableCell>
                            <Badge
                                className={cn(
                                    'bg-red-500 text-white',
                                    post.isPublished && 'bg-green-500 text-black'
                                )}
                            >
                                {post.isPublished ? 'Published' : 'Draft'}
                            </Badge>
                        </TableCell>
                        <TableCell>{formatDate(post.createdAt)}</TableCell>
                        <TableCell>
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="ghost">
                                        <EllipsisVertical />
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent>
                                    <DropdownMenuItem
                                        onClick={() => navigate(`/dashboard/blog/${post.blogId}`)}
                                    >
                                        <Pencil />
                                        Edit
                                    </DropdownMenuItem>
                                    <DropdownMenuItem
                                        onClick={() => {
                                            setOpen('delete')
                                            setCurrentRow(post)
                                        }}
                                    >
                                        <Trash />
                                        Delete
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </TableCell>
                    </TableRow>
                )}
                onFilterChange={setFilterData}
                onCreateNew={() => navigate('/dashboard/blog/create')}
                onRefetchData={() =>
                    queryClient.invalidateQueries({ queryKey: ['blog', 'list'] })
                }
                customFilter={[<SearchFilter name="title" key="title-search" />]}
            />
        </div>
    )
}

export default BlogTable
