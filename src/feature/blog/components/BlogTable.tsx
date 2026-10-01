import {useEffect, useState} from "react";
import {useNavigate} from "react-router-dom";
import {BlogPostType} from "@/feature/blog/schema/BlogSchema";
import {Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle} from "@/components/ui/card";
import {Skeleton} from "@/components/ui/skeleton";
import {Pagination} from "@/components/Pagination";
import {Badge} from "@/components/ui/badge";
import {Button} from "@/components/ui/button";
import {Input} from "@/components/ui/input";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from "@/components/ui/select";
import {BookOpen, EllipsisVertical, FilterX, Pencil, Plus, Search, Trash} from "lucide-react";
import {useQueryClient} from "@tanstack/react-query";
import {useBlogContext} from "@/feature/blog/context/blog-context";
import LongText from "@/components/long-text";
import {Empty, EmptyMedia, EmptyTitle} from "@/components/ui/empty";
import {RefreshButton} from "@/components/refresh-button";
import {TimeCell} from "@/components/TimeCell.tsx";
import {Pill, PillIndicator} from "@/components/ui/kibo-ui/pill/index.tsx";

const PAGE_SIZE = 20;

const SORT_OPTIONS = [
    {value: "bp.created_at:desc", label: "Newest first", sortColumn: "bp.created_at", sortDirection: "desc"},
    {value: "bp.created_at:asc", label: "Oldest first", sortColumn: "bp.created_at", sortDirection: "asc"},
    {value: "title:asc", label: "Title A–Z", sortColumn: "title", sortDirection: "asc"},
    {value: "title:desc", label: "Title Z–A", sortColumn: "title", sortDirection: "desc"},
] as const;

interface BlogTableProps {
    posts: BlogPostType[]
    maxPages?: number
    loading: boolean
    setFilterData: (filterData: Record<string, string>) => void
}

function BlogPostCard({post, onEdit, onDelete}: {
    post: BlogPostType
    onEdit: () => void
    onDelete: () => void
}) {
    return (
        <Card
            className="flex flex-col cursor-pointer transition-shadow hover:shadow-md"
            onClick={onEdit}
        >
            <CardHeader className="flex flex-row items-start justify-between gap-2 space-y-0">
                <div className="space-y-1 min-w-0">
                    <CardTitle className="line-clamp-2">{post.title}</CardTitle>
                    <CardDescription>By {post.user.username}</CardDescription>
                </div>
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="shrink-0" onClick={(e) => e.stopPropagation()}>
                            <EllipsisVertical/>
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent onClick={(e) => e.stopPropagation()}>
                        <DropdownMenuItem onClick={onEdit}>
                            <Pencil/>
                            Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={onDelete}>
                            <Trash/>
                            Delete
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </CardHeader>
            <CardContent className="flex-1 space-y-3">
                <LongText className="max-w-full text-sm text-muted-foreground">
                    {post.excerpt ?? "—"}
                </LongText>
                <div className="flex flex-wrap gap-1">
                    {post.tags.length === 0 ? (
                        <span className="text-muted-foreground text-sm">No tags</span>
                    ) : (
                        post.tags.map((tag) => (
                            <Badge key={tag.tagId} variant="secondary">
                                {tag.name}
                            </Badge>
                        ))
                    )}
                </div>
            </CardContent>
            <CardFooter className="flex items-center justify-between">
                <Pill>
                    <PillIndicator variant={post.isPublished ? "success" : "warning"}/>
                    {post.isPublished ? "Published" : "Draft"}
                </Pill>
                <TimeCell iso={post.createdAt}/>
            </CardFooter>
        </Card>
    );
}

function BlogPostCardSkeleton() {
    return (
        <Card className="flex flex-col">
            <CardHeader className="space-y-2">
                <Skeleton className="h-5 w-3/4"/>
                <Skeleton className="h-4 w-1/3"/>
            </CardHeader>
            <CardContent className="flex-1 space-y-3">
                <Skeleton className="h-4 w-full"/>
                <Skeleton className="h-4 w-2/3"/>
                <div className="flex gap-1">
                    <Skeleton className="h-5 w-14"/>
                    <Skeleton className="h-5 w-14"/>
                </div>
            </CardContent>
            <CardFooter className="flex items-center justify-between">
                <Skeleton className="h-5 w-20"/>
                <Skeleton className="h-4 w-16"/>
            </CardFooter>
        </Card>
    );
}

function BlogTable({posts, maxPages, loading, setFilterData}: BlogTableProps) {
    const queryClient = useQueryClient()
    const navigate = useNavigate()
    const {setOpen, setCurrentRow} = useBlogContext()

    const [page, setPage] = useState(1);
    const [searchInput, setSearchInput] = useState("");
    const [debouncedSearch, setDebouncedSearch] = useState("");
    const [sort, setSort] = useState<typeof SORT_OPTIONS[number]["value"]>(SORT_OPTIONS[0].value);

    useEffect(() => {
        const t = setTimeout(() => {
            setDebouncedSearch(searchInput);
            setPage(1);
        }, 400);
        return () => clearTimeout(t);
    }, [searchInput]);

    useEffect(() => {
        const sortOption = SORT_OPTIONS.find((option) => option.value === sort) ?? SORT_OPTIONS[0];
        setFilterData({
            page: String(page),
            pageSize: String(PAGE_SIZE),
            title: debouncedSearch,
            sortColumn: sortOption.sortColumn,
            sortDirection: sortOption.sortDirection,
        });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [page, debouncedSearch, sort]);

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-2">
                    <div className="relative w-64">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground pointer-events-none"/>
                        <Input
                            placeholder="Search posts..."
                            value={searchInput}
                            onChange={(e) => setSearchInput(e.target.value)}
                            className="pl-8"
                        />
                    </div>
                    <Select value={sort} onValueChange={(value) => setSort(value as typeof sort)}>
                        <SelectTrigger className="w-44">
                            <SelectValue/>
                        </SelectTrigger>
                        <SelectContent>
                            {SORT_OPTIONS.map((option) => (
                                <SelectItem key={option.value} value={option.value}>
                                    {option.label}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
                <div className="flex items-center gap-2">
                    <Button variant="outline" onClick={() => setSearchInput("")}>
                        <FilterX className="h-4 w-4"/>
                        Clear
                    </Button>
                    <RefreshButton onRefresh={() => queryClient.invalidateQueries({queryKey: ['blog', 'list']})}/>
                    <Button onClick={() => navigate('/dashboard/blog/create')}>
                        <Plus className="h-4 w-4"/>
                        New
                    </Button>
                </div>
            </div>

            {loading ? (
                <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                    {Array.from({length: 6}).map((_, i) => (
                        <BlogPostCardSkeleton key={i}/>
                    ))}
                </div>
            ) : posts.length === 0 ? (
                <div className="border rounded-lg">
                    <Empty className="border-0 py-12">
                        <EmptyMedia variant="icon">
                            <BookOpen/>
                        </EmptyMedia>
                        <EmptyTitle>No blog posts found</EmptyTitle>
                    </Empty>
                </div>
            ) : (
                <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                    {posts.map((post) => (
                        <BlogPostCard
                            key={post.blogId}
                            post={post}
                            onEdit={() => navigate(`/dashboard/blog/${post.blogId}`)}
                            onDelete={() => {
                                setOpen('delete');
                                setCurrentRow(post);
                            }}
                        />
                    ))}
                </div>
            )}

            <Pagination
                page={page}
                totalPages={maxPages}
                rowCount={posts.length}
                isLoading={loading}
                onPageChange={setPage}
            />
        </div>
    )
}

export default BlogTable
