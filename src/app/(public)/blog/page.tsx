import Link from "next/link";
import type { Metadata } from "next";
import { GetBlogPostsAction } from "@/server/content";

export const metadata: Metadata = {
  title: "Blog",
};

export default async function BlogPage() {
  const [res] = await GetBlogPostsAction();
  const posts = res?.data ?? [];

  return (
    <main className="max-w-5xl mx-auto px-6 py-16">
      <h1 className="text-3xl font-bold text-gray-900 mb-2">Blog</h1>
      <p className="text-gray-500 mb-10">News, tips, and stories from STC Tutors.</p>

      {posts.length === 0 ? (
        <p className="text-gray-500">No posts yet - check back soon.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {posts.map((post) => (
            <Link
              key={post.id}
              href={`/blog/${post.slug}`}
              className="block bg-white rounded-xl shadow-sm overflow-hidden hover:shadow-md transition"
            >
              {post.coverImageUrl && (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={post.coverImageUrl} alt={post.title} className="w-full h-48 object-cover" />
              )}
              <div className="p-5">
                {post.publishedAt && (
                  <p className="text-xs text-gray-400 mb-1">{new Date(post.publishedAt).toLocaleDateString()}</p>
                )}
                <h2 className="text-lg font-semibold text-gray-900">{post.title}</h2>
                <p className="text-sm text-gray-500 mt-1 line-clamp-3">{post.excerpt}</p>
              </div>
            </Link>
          ))}
        </div>
      )}
    </main>
  );
}
