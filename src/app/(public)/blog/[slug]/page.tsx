import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { GetBlogPostBySlugAction } from "@/server/content";

type Params = Promise<{ slug: string }>;

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { slug } = await params;
  const [res] = await GetBlogPostBySlugAction(slug);
  const post = res?.data;
  if (!post) return {};

  return {
    title: post.seoTitle || post.title,
    description: post.seoDescription || post.excerpt,
    openGraph: {
      title: post.seoTitle || post.title,
      description: post.seoDescription || post.excerpt,
      images: post.coverImageUrl ? [post.coverImageUrl] : undefined,
    },
  };
}

export default async function BlogPostPage({ params }: { params: Params }) {
  const { slug } = await params;
  const [res] = await GetBlogPostBySlugAction(slug);
  const post = res?.data;

  if (!post) notFound();

  return (
    <main className="max-w-3xl mx-auto px-6 py-16">
      <Link href="/blog" className="text-sm text-blue-600 hover:underline">
        &larr; Back to blog
      </Link>

      {post.coverImageUrl && (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={post.coverImageUrl} alt={post.title} className="w-full h-72 object-cover rounded-xl mt-6" />
      )}

      <h1 className="text-3xl font-bold text-gray-900 mt-6">{post.title}</h1>
      <p className="text-sm text-gray-400 mt-2">
        {post.author && <>{post.author} · </>}
        {post.publishedAt && new Date(post.publishedAt).toLocaleDateString()}
      </p>

      <div className="prose max-w-none mt-8 whitespace-pre-wrap text-gray-700 leading-relaxed">{post.body}</div>
    </main>
  );
}
