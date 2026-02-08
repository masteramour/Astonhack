
import React from 'react';
import { MOCK_BLOGS, MOCK_USERS } from '../constants';

const BlogPage: React.FC = () => {
  return (
    <div className="max-w-6xl mx-auto space-y-12">
      <div className="text-center md:text-left">
        <h1 className="text-5xl font-black mb-4">8vents Community Blog</h1>
        <p className="text-slate-500">Stories, tips, and updates from the heart of our network.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        <div className="lg:col-span-2 space-y-12">
          {MOCK_BLOGS.map(post => {
            const author = MOCK_USERS.find(u => u.id === post.authorId);
            return (
              <article key={post.id} className="group cursor-pointer">
                <div className="relative h-[400px] rounded-[3rem] overflow-hidden mb-6 shadow-xl">
                  <img src={post.image} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" alt={post.title} />
                  <div className="absolute top-6 left-6">
                    <span className="bg-brand text-white px-4 py-2 rounded-xl font-black text-sm uppercase shadow-lg">
                      {post.category}
                    </span>
                  </div>
                </div>
                <div className="space-y-4 px-4">
                  <div className="flex items-center gap-3">
                    <img src={author?.avatar} className="w-10 h-10 rounded-full border-2 border-brand" alt={author?.name} />
                    <div>
                      <div className="text-sm font-bold">{author?.name}</div>
                      <div className="text-xs text-slate-400">{new Date(post.date).toLocaleDateString()}</div>
                    </div>
                  </div>
                  <h2 className="text-4xl font-black group-hover:text-brand transition-colors">{post.title}</h2>
                  <p className="text-lg text-slate-500 leading-relaxed">{post.content}</p>
                  <button className="text-brand font-black flex items-center gap-2 group-hover:gap-4 transition-all">
                    Read Story <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>
                  </button>
                </div>
              </article>
            );
          })}
        </div>

        <aside className="space-y-12">
          <div className="bg-white dark:bg-slate-800 p-8 rounded-[2rem] shadow-lg border border-slate-100 dark:border-slate-700">
            <h3 className="text-xl font-bold mb-6">Trending Topics</h3>
            <div className="space-y-4">
              {['#VolunteerLife', '#CommunitySpirit', '#OceanCleanup', '#HelpingHands', '#Events2024'].map(tag => (
                <div key={tag} className="flex justify-between items-center group cursor-pointer">
                  <span className="text-slate-500 group-hover:text-brand font-medium transition-colors">{tag}</span>
                  <span className="text-[10px] bg-slate-100 dark:bg-slate-700 px-2 py-1 rounded font-bold">1.2k posts</span>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-brand p-8 rounded-[2rem] text-white shadow-xl shadow-brand/20">
            <h3 className="text-xl font-bold mb-4">Write for us!</h3>
            <p className="text-white/80 text-sm mb-6">Have a story to share? We love hearing about our community's successes.</p>
            <button className="w-full py-4 bg-white text-brand font-black rounded-2xl shadow-lg hover:bg-slate-100 transition-all">
              Submit Draft
            </button>
          </div>
        </aside>
      </div>
    </div>
  );
};

export default BlogPage;
