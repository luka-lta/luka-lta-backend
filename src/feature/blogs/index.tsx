import {useBlogsList} from "@/feature/blogs/hooks/useBlogs.ts";
import {Badge} from "@/components/ui/badge.tsx";
import {AlertTriangle} from "lucide-react";
import {QueryErrorDisplay} from "@/components/QueryErrorDisplay.tsx";
import {Main} from "@/components/layout/main.tsx";
import BlogList from "@/feature/blogs/components/BlogList.tsx";

function Blogs() {
    const [blogs, setFilterData] = useBlogsList();

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
            </div>

            <BlogList
                blogs={blogs.data?.blog ?? []}
                loading={blogs.isPending}
                setFilterData={setFilterData}
            />
        </Main>
    );
}

export default Blogs;