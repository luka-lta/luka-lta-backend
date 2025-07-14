import {Main} from "@/components/layout/main.tsx";
import {Button} from '@/components/ui/button';
import {AlertTriangle, ArrowLeftIcon, EyeIcon, SaveIcon, SendIcon} from 'lucide-react';
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from "@/components/ui/select.tsx";
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from "@/components/ui/card.tsx";
import {Badge} from '@/components/ui/badge';
import {Separator} from "@/components/ui/separator.tsx";
import {Label} from "@/components/ui/label.tsx";
import {Switch} from "@/components/ui/switch.tsx";
import {Input} from '@/components/ui/input';
import {Textarea} from "@/components/ui/textarea.tsx";
import {QueryErrorDisplay} from "@/components/QueryErrorDisplay.tsx";
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';
import {z} from "zod";
import {useMutation, useQueryClient} from "@tanstack/react-query";
import {SubmitHandler, useForm} from "react-hook-form";
import {zodResolver} from "@hookform/resolvers/zod";
import {blogData} from "../schema/BlogSchema";
import {FetchWrapper} from "@/lib/fetchWrapper.ts";
import {toast} from "sonner";
import {useState} from "react";
import {TextInput} from "@/components/form/TextInput.tsx";
import {TextAreaInput} from "@/components/form/TextAreaInput.tsx";

const blogCreateSchema = z.object({
    id: z.string().optional(),
    title: z.string().min(1, "Title is required").max(255, "Title cannot exceed 255 characters"),
    content: z.string().min(1, "Content is required"),
    excerpt: z.string().max(500, "Excerpt cannot exceed 500 characters").optional(),
    userId: z.string().optional(),
    isPublished: z.boolean().default(false),
});

function NewBlog() {
    const queryClient = useQueryClient();
    const [isPreview, setIsPreview] = useState(false)

    const form = useForm<blogData>({
        resolver: zodResolver(blogCreateSchema),
    });

    const createBlog = useMutation({
        mutationFn: async ({title, excerpt, content, isPublished}: blogData) => {
            const fetchWrapper = new FetchWrapper(FetchWrapper.baseUrl);
            await fetchWrapper.post('/blog/', {
                title,
                excerpt,
                content,
                isPublished,
            })
        },
        onSuccess: () => {
            toast.success('Link created successfully!');
        },
        onError: (error) => {
            const errorMessage = error.message;

            toast.error(errorMessage);
            console.error(error);
        },
        onSettled: () => {
            setTimeout(() => {
                queryClient.invalidateQueries({
                    queryKey: ['blogs', 'list'],
                });
            }, 500)
        }
    })

    const onSubmit: SubmitHandler<blogData> = (data) => createBlog.mutate(data);

    return (
        <Main>
            <div className="container mx-auto py-8 px-4 max-w-7xl">
                <form onSubmit={form.handleSubmit(onSubmit)}>
                    <div className="flex items-center justify-between mb-8">
                        <div className="flex items-center gap-4">
                            <Button variant="outline" onClick={() => window.history.back()}>
                                <ArrowLeftIcon className="w-4 h-4 mr-2"/>
                                Back to Overview
                            </Button>
                            <div>
                                <h1 className="text-3xl font-bold">{"Edit Post"}</h1>
                                <p className="text-muted-foreground">
                                    Create and publish your blog post
                                </p>
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            <Button variant="outline" onClick={() => setIsPreview(!isPreview)}>
                                <EyeIcon className="w-4 h-4 mr-2"/>
                                {isPreview ? "Edit" : "Preview"}
                            </Button>
                            <Button variant="outline">
                                <SaveIcon className="w-4 h-4 mr-2"/>
                                Save Draft
                            </Button>
                            <Button>
                                <SendIcon className="w-4 h-4 mr-2"/>
                                Publish
                            </Button>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        <div className="lg:col-span-2">
                            <Card>
                                <CardHeader>
                                    <CardTitle>Content</CardTitle>
                                    <CardDescription>Write your blog post content here</CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-6">
                                    {!isPreview ? (
                                        <>
                                            <TextInput
                                                name={'title'}
                                                id={'blog-title-create-form'}
                                                label={'Title'}
                                                form={form}
                                            />

                                            <TextAreaInput
                                                name={'excerpt'}
                                                id={'blog-excerpt-create-form'}
                                                label={'Excerpt'}
                                                form={form}
                                            />

                                            <TextAreaInput
                                                name={'content'}
                                                id={'blog-content-create-form'}
                                                label={'Content'}
                                                className='min-h-[500px]'
                                                rows={20}
                                                form={form}
                                            />
                                        </>
                                    ) : (
                                        <div className="prose prose-gray max-w-none">
                                            <h1 className="text-3xl font-bold mb-4">{form.getValues('title') || "Untitled Post"}</h1>
                                            <div className="text-base leading-relaxed">
                                                {form.getValues('content') ? (
                                                    <ReactMarkdown
                                                        children={form.getValues('content')}
                                                        remarkPlugins={[remarkGfm]}
                                                        rehypePlugins={[rehypeRaw]}
                                                    />
                                                ) : (
                                                    <p className="text-muted-foreground italic">No content yet...</p>
                                                )}
                                            </div>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        </div>
                    </div>

                    <div className="space-y-6">
                        <Card>
                            <CardHeader>
                                <CardTitle>Post Settings</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                <div className="space-y-2">
                                    <Label htmlFor="category">Category</Label>
                                    <Select>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select a category"/>
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="technology">Technology</SelectItem>
                                            <SelectItem value="design">Design</SelectItem>
                                            <SelectItem value="business">Business</SelectItem>
                                            <SelectItem value="lifestyle">Lifestyle</SelectItem>
                                            <SelectItem value="tutorial">Tutorial</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>


                                <div className="flex items-center justify-between">
                                    <Label htmlFor="published">Published</Label>
                                    <Switch
                                        id="published"
                                        checked={currentPost.isPublished}
                                        /*
                                                                            onCheckedChange={(checked) => handleInputChange("status", checked ? "published" : "draft")}
                                        */
                                    />
                                </div>

                                <Separator/>

                                {/* <div className="space-y-3">
                                <Label>Tags</Label>
                                <div className="flex gap-2">
                                    <Input
                                        placeholder="Add a tag..."
                                        value={newTag}
                                        onChange={(e) => setNewTag(e.target.value)}
                                        onKeyPress={handleKeyPress}
                                        className="flex-1"
                                    />
                                    <Button onClick={addTag} size="sm">
                                        <TagIcon className="w-4 h-4" />
                                    </Button>
                                </div>
                                <div className="flex flex-wrap gap-2">
                                    {currentPost.tags.map((tag) => (
                                        <Badge key={tag} variant="secondary" className="flex items-center gap-1">
                                            {tag}
                                            <button onClick={() => removeTag(tag)} className="ml-1 hover:text-destructive">
                                                <X className="w-3 h-3" />
                                            </button>
                                        </Badge>
                                    ))}
                                </div>
                            </div>*/}
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle>Post Statistics</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="flex justify-between">
                                    <span className="text-sm text-muted-foreground">Word Count</span>
                                    <span className="text-sm font-medium">
                                    {currentPost.content.split(/\s+/).filter((word) => word.length > 0).length}
                                </span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-sm text-muted-foreground">Character Count</span>
                                    <span className="text-sm font-medium">{3}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-sm text-muted-foreground">Reading Time</span>
                                    <span className="text-sm font-medium">
                                    {Math.ceil(currentPost.content.split(/\s+/).filter((word) => word.length > 0).length / 200)} min
                                </span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-sm text-muted-foreground">Status</span>
                                    <Badge variant={currentPost.isPublished ? "default" : "secondary"}>
                                        {currentPost.isPublished ? "Published" : "Draft"}
                                    </Badge>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </form>
            </div>
        </Main>
    );
}

export default NewBlog;