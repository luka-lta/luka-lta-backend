import {useBlogsList} from "@/feature/blogs/hooks/useBlogs.ts";
import {Badge} from "@/components/ui/badge.tsx";
import {AlertTriangle, PlusIcon, SearchIcon} from "lucide-react";
import {QueryErrorDisplay} from "@/components/QueryErrorDisplay.tsx";
import {Main} from "@/components/layout/main.tsx";
import BlogList from "@/feature/blogs/components/BlogList.tsx";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from "@/components/ui/select.tsx";

function Blogs() {
    const [blogs] = useBlogsList();

    if (blogs.error) {
        return (
            <div className='p-6'>
                <div className='mb-5'>
                    <div className='flex items-center gap-2 mb-2'>
                        <h1 className='text-2xl font-semibold'>Links</h1>
                        <Badge variant='secondary' className='bg-zinc-900 text-red-600 hover:bg-zinc-900'>
                            <AlertTriangle/>
                        </Badge>
                    </div>
                    <QueryErrorDisplay query={blogs}/>
                </div>
            </div>
        )
    }

    return (
        <Main>
            <div className='mb-2 flex flex-wrap items-center justify-between space-y-2'>
                <div>
                    <h2 className='text-2xl font-bold tracking-tight'>Blogs</h2>
                    <p className='text-muted-foreground'>
                        Manage your blogs here.
                    </p>
                </div>
                <Button>
                    <PlusIcon className="w-4 h-4 mr-2" />
                    New Post
                </Button>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 mb-6">
                <div className="relative flex-1">
                    <SearchIcon className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Search posts..."
                        className="pl-10"
                    />
                </div>
                <Select>
                    <SelectTrigger className="w-full sm:w-[180px]">
                        <SelectValue placeholder="Filter by status" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All Status</SelectItem>
                        <SelectItem value="published">Published</SelectItem>
                        <SelectItem value="draft">Draft</SelectItem>
                    </SelectContent>
                </Select>
            </div>

            <BlogList
                blogs={blogs.data?.blogs ?? []}
                loading={blogs.isPending}
            />
        </Main>
    );
}

export default Blogs;