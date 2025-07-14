import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger} from "@/components/ui/dropdown-menu";
import {BlogItemTypeSchema} from "@/feature/blogs/schema/BlogSchema.ts";
import {CalendarIcon, EditIcon, MoreVerticalIcon, TrashIcon, UserIcon} from "lucide-react";
import {Button} from "@/components/ui/button.tsx";
import {Link, useNavigate} from "react-router-dom";
import { formatDate } from "date-fns";
import {Badge} from "@/components/ui/badge.tsx";
import BlogLoading from "@/feature/blogs/components/BlogLoading.tsx";

interface BlogListProps {
    blogs: BlogItemTypeSchema[];
    loading: boolean;
}

function BlogList({blogs, loading}: BlogListProps) {
    const navigate = useNavigate();

    const getStatusColor = (isPublished: boolean) => {
        return isPublished ? "default" : "secondary"
    }

    if (loading) {
        return (
            <BlogLoading />
        )
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {blogs.map((blog) => (
                <Card key={blog.blogId} className="flex flex-col">
                    <CardHeader className="pb-3">
                        <div className="flex items-start justify-between">
                            <div className="flex-1">
                                <CardTitle className="text-lg line-clamp-2 mb-2">{blog.title}</CardTitle>
                                <CardDescription className="line-clamp-3">{blog.excerpt ? (
                                    blog.excerpt
                                ) : (
                                    "No excerpt available"
                                )}</CardDescription>
                            </div>
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" size="sm">
                                        <MoreVerticalIcon className="w-4 h-4" />
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                    <DropdownMenuItem
                                        onClick={() => navigate(`/dashboard/blogs/${blog.blogId}`)}
                                    >
                                        <EditIcon className="w-4 h-4 mr-2" />
                                        Edit
                                    </DropdownMenuItem>
                                    <DropdownMenuItem>
                                        <TrashIcon className="w-4 h-4 mr-2" />
                                        Delete
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </div>
                    </CardHeader>
                    <CardContent className="flex-1 flex flex-col justify-between">
                            <div className="mb-4">
                                <img
                                    src={ "https://kzmqvc75wfnuk1px6i47.lite.vusercontent.net/placeholder.svg?height=200&width=400"}
                                    alt={blog.title}
                                    className="w-full h-32 object-cover rounded-md"
                                />
                            </div>

                        <div className="space-y-3">
                           {/* <div className="flex flex-wrap gap-1">
                                {blog.tags.slice(0, 3).map((tag) => (
                                    <Badge key={tag} variant="outline" className="text-xs">
                                        <TagIcon className="w-3 h-3 mr-1" />
                                        {tag}
                                    </Badge>
                                ))}
                                {blog.tags.length > 3 && (
                                    <Badge variant="outline" className="text-xs">
                                        +{blog.tags.length - 3}
                                    </Badge>
                                )}
                            </div>*/}

                            <div className="flex items-center justify-between text-sm text-muted-foreground">
                                <div className="flex items-center gap-1">
                                    <UserIcon className="w-3 h-3" />
                                    {blog.user.username}
                                </div>

                                <Badge variant={getStatusColor(blog.isPublished)}>{blog.isPublished ? (
                                    <span className="text-xs">Published</span>
                                ) : (
                                    <span className="text-xs">Draft</span>
                                )}</Badge>

                            </div>

                            <div className="flex items-center gap-4 text-xs text-muted-foreground">
                                <div className="flex items-center gap-1">
                                    <CalendarIcon className="w-3 h-3" />
                                    {blog.isPublished ? (
                                        <Link to={`https://luka-lta.dev/blog/${blog.blogId}`}>
                                            Published on {formatDate(blog.createdAt, 'dd.MM.yyyy')}
                                        </Link>
                                    ) : blog.updatedAt ? (
                                        `Updated ${formatDate(blog.updatedAt, 'dd.MM.yyyy')}`
                                    ) : (
                                        'Not updated yet'
                                    )}
                                </div>
                            </div>

                            <div className="flex gap-2 pt-2">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    className="flex-1"
                                    onClick={() => navigate(`/dashboard/blogs/${blog.blogId}`)}
                                >
                                    <EditIcon className="w-3 h-3 mr-1" />
                                    Edit
                                </Button>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    className="text-destructive hover:text-destructive"
                                >
                                    <TrashIcon className="w-3 h-3" />
                                </Button>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            ))}
        </div>
    );
}

export default BlogList;