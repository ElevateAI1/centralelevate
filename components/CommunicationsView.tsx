import React, { useState, useRef, useEffect } from 'react';
import { useStore } from '../store';
import { MessageSquare, Heart, Send, Hash, MoreHorizontal, ChevronDown, ChevronUp, Edit2, Trash2 } from 'lucide-react';
import { Post, Comment } from '../types';

export const CommunicationsView: React.FC = () => {
  const { posts, addPost, addComment, deletePost, updatePost, deleteComment, updateComment, user, users, originalUserRole } = useStore();
  const [newPostContent, setNewPostContent] = useState('');
  const [expandedComments, setExpandedComments] = useState<Set<string>>(new Set());
  const [commentInputs, setCommentInputs] = useState<Record<string, string>>({});
  const [activeMenu, setActiveMenu] = useState<string | null>(null);
  const [editingPost, setEditingPost] = useState<string | null>(null);
  const [editingComment, setEditingComment] = useState<string | null>(null);
  const [editPostContent, setEditPostContent] = useState('');
  const [editCommentContent, setEditCommentContent] = useState('');
  const menuRefs = useRef<Record<string, HTMLDivElement | null>>({});
  
  // Check if user can delete posts/comments from others (only CTO and Founder)
  const canDeleteOthers = originalUserRole === 'CTO' || originalUserRole === 'Founder';
  
  // Close menus when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      Object.values(menuRefs.current).forEach(ref => {
        if (ref && !ref.contains(e.target as Node)) {
          setActiveMenu(null);
        }
      });
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  if (!user) return null;

  const handlePostSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newPostContent.trim()) {
      addPost(newPostContent);
      setNewPostContent('');
    }
  };

  const handleCommentSubmit = async (postId: string, e: React.FormEvent) => {
    e.preventDefault();
    const content = commentInputs[postId]?.trim();
    if (content) {
      await addComment(postId, content);
      setCommentInputs({ ...commentInputs, [postId]: '' });
    }
  };

  const toggleComments = (postId: string) => {
    const newExpanded = new Set(expandedComments);
    if (newExpanded.has(postId)) {
      newExpanded.delete(postId);
    } else {
      newExpanded.add(postId);
    }
    setExpandedComments(newExpanded);
  };

  const getAuthor = (id: string) => users.find(u => u.id === id) || users[0];
  
  const handleDeletePost = async (postId: string) => {
    if (window.confirm('¿Estás seguro de que quieres eliminar este post?')) {
      try {
        await deletePost(postId);
        setActiveMenu(null);
      } catch (error) {
        alert('Error al eliminar el post');
      }
    }
  };
  
  const handleEditPost = (post: Post) => {
    setEditingPost(post.id);
    setEditPostContent(post.content);
    setActiveMenu(null);
  };
  
  const handleSavePost = async (postId: string) => {
    if (editPostContent.trim()) {
      try {
        await updatePost(postId, editPostContent);
        setEditingPost(null);
        setEditPostContent('');
      } catch (error) {
        alert('Error al actualizar el post');
      }
    }
  };
  
  const handleDeleteComment = async (commentId: string) => {
    if (window.confirm('¿Estás seguro de que quieres eliminar este comentario?')) {
      try {
        await deleteComment(commentId);
      } catch (error) {
        alert('Error al eliminar el comentario');
      }
    }
  };
  
  const handleEditComment = (comment: Comment) => {
    setEditingComment(comment.id);
    setEditCommentContent(comment.content);
  };
  
  const handleSaveComment = async (commentId: string) => {
    if (editCommentContent.trim()) {
      try {
        await updateComment(commentId, editCommentContent);
        setEditingComment(null);
        setEditCommentContent('');
      } catch (error) {
        alert('Error al actualizar el comentario');
      }
    }
  };
  
  const canEditPost = (post: Post) => post.authorId === user?.id;
  const canDeletePost = (post: Post) => canDeleteOthers || post.authorId === user?.id;
  const canEditComment = (comment: Comment) => comment.authorId === user?.id;
  const canDeleteComment = (comment: Comment) => canDeleteOthers || comment.authorId === user?.id;

  return (
    <div className="max-w-3xl mx-auto h-full flex flex-col animate-in fade-in slide-in-from-bottom-2 duration-500">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-1">Pulso del Equipo</h2>
        <p className="text-slate-600 dark:text-slate-400 text-sm">Actualizaciones, anuncios y logros.</p>
      </div>

      {/* Post Creator */}
      <div className="glass-panel p-4 rounded-2xl mb-8 border border-white/10">
        <div className="flex gap-4">
          <img src={user.avatar} className="w-10 h-10 rounded-full border border-white/10" alt={user.name} />
          <form className="flex-1" onSubmit={handlePostSubmit}>
            <textarea
              value={newPostContent}
              onChange={(e) => setNewPostContent(e.target.value)}
              placeholder="¿Qué está pasando? Comparte una actualización..."
              className="w-full bg-transparent border-none text-slate-900 dark:text-slate-200 placeholder-slate-500 dark:placeholder-slate-500 focus:ring-0 resize-none h-20 text-sm"
            />
            <div className="flex justify-between items-center pt-2 border-t border-white/5">
              <div className="flex gap-2">
                <button type="button" className="text-slate-500 hover:text-violet-400 transition-colors">
                  <Hash size={18} />
                </button>
              </div>
              <button 
                type="submit"
                disabled={!newPostContent.trim()}
                className="bg-violet-600 hover:bg-violet-700 disabled:opacity-50 text-white px-4 py-1.5 rounded-full text-sm font-medium transition-all flex items-center gap-2"
              >
                Publicar <Send size={14} />
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Feed */}
      <div className="space-y-6 pb-6">
        {posts.map(post => {
          const author = getAuthor(post.authorId);
          return (
            <div key={post.id} className="glass-card p-5 rounded-2xl border border-white/5 hover:border-white/10 transition-colors">
               <div className="flex justify-between items-start mb-3">
                 <div className="flex gap-3">
                   <img src={author.avatar} className="w-10 h-10 rounded-full border border-white/10" alt={author.name} />
                   <div>
                     <h4 className="font-semibold text-slate-900 dark:text-white text-sm">{author.name}</h4>
                     <div className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-500">
                       <span>{author.role}</span>
                       <span>•</span>
                       <span>{post.timestamp}</span>
                     </div>
                   </div>
                 </div>
                 <div className="relative" ref={el => menuRefs.current[`post-${post.id}`] = el}>
                   <button 
                     onClick={() => setActiveMenu(activeMenu === `post-${post.id}` ? null : `post-${post.id}`)}
                     className="text-slate-500 hover:text-white transition-colors"
                   >
                     <MoreHorizontal size={18} />
                   </button>
                   
                   {activeMenu === `post-${post.id}` && (
                     <div className="absolute right-0 top-8 w-48 bg-slate-900 dark:bg-black border border-slate-700 dark:border-white/20 rounded-lg shadow-xl py-1 z-50">
                       {canEditPost(post) && (
                         <button
                           onClick={() => handleEditPost(post)}
                           className="w-full text-left px-4 py-2 text-sm text-slate-300 hover:bg-slate-800 dark:hover:bg-white/5 flex items-center gap-2 transition-colors"
                         >
                           <Edit2 size={14} />
                           Editar
                         </button>
                       )}
                       {canDeletePost(post) && (
                         <button
                           onClick={() => handleDeletePost(post.id)}
                           className="w-full text-left px-4 py-2 text-sm text-red-400 hover:bg-red-500/10 flex items-center gap-2 transition-colors"
                         >
                           <Trash2 size={14} />
                           Eliminar
                         </button>
                       )}
                     </div>
                   )}
                 </div>
               </div>

               {editingPost === post.id ? (
                 <div className="mb-4">
                   <textarea
                     value={editPostContent}
                     onChange={(e) => setEditPostContent(e.target.value)}
                     className="w-full bg-slate-100 dark:bg-slate-900/50 border border-slate-300 dark:border-white/10 rounded-lg px-4 py-2 text-sm text-slate-900 dark:text-white placeholder-slate-500 focus:outline-none focus:border-violet-500 transition-colors resize-none h-24"
                     placeholder="Edita tu post..."
                   />
                   <div className="flex gap-2 mt-2">
                     <button
                       onClick={() => handleSavePost(post.id)}
                       className="bg-violet-600 hover:bg-violet-700 text-white px-4 py-1.5 rounded-lg text-sm font-medium transition-colors"
                     >
                       Guardar
                     </button>
                     <button
                       onClick={() => {
                         setEditingPost(null);
                         setEditPostContent('');
                       }}
                       className="bg-slate-700 hover:bg-slate-600 text-white px-4 py-1.5 rounded-lg text-sm font-medium transition-colors"
                     >
                       Cancelar
                     </button>
                   </div>
                 </div>
               ) : (
                 <p className="text-slate-800 dark:text-slate-200 text-sm mb-4 leading-relaxed">
                   {post.content}
                 </p>
               )}

               {post.category === 'Announcement' && (
                 <span className="inline-block bg-violet-500/10 text-violet-300 text-[10px] px-2 py-0.5 rounded-full border border-violet-500/20 mb-4">
                   Anuncio
                 </span>
               )}

               <div className="flex items-center gap-6 pt-3 border-t border-white/5">
                 <button className="flex items-center gap-2 text-slate-500 hover:text-pink-500 text-xs transition-colors group">
                   <Heart size={16} className="group-hover:fill-pink-500/20" />
                   {post.likes}
                 </button>
                 <button 
                   onClick={() => toggleComments(post.id)}
                   className="flex items-center gap-2 text-slate-500 hover:text-blue-400 text-xs transition-colors"
                 >
                   <MessageSquare size={16} />
                   {post.comments.length}
                   {expandedComments.has(post.id) ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                 </button>
               </div>

               {/* Comments Section */}
               {expandedComments.has(post.id) && (
                 <div className="mt-4 pt-4 border-t border-white/5 space-y-4">
                   {/* Existing Comments */}
                   {post.comments.map(comment => {
                     const commentAuthor = getAuthor(comment.authorId);
                     return (
                       <div key={comment.id} className="flex gap-3 pl-4 border-l-2 border-white/10 group">
                         <img 
                           src={commentAuthor.avatar} 
                           className="w-8 h-8 rounded-full border border-white/10" 
                           alt={commentAuthor.name} 
                         />
                         <div className="flex-1">
                           <div className="flex items-center justify-between mb-1">
                             <div className="flex items-center gap-2">
                               <span className="text-xs font-semibold text-slate-900 dark:text-white">{commentAuthor.name}</span>
                               <span className="text-[10px] text-slate-600 dark:text-slate-500">{comment.timestamp}</span>
                             </div>
                             {(canEditComment(comment) || canDeleteComment(comment)) && (
                               <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                 {canEditComment(comment) && (
                                   <button
                                     onClick={() => handleEditComment(comment)}
                                     className="text-slate-500 hover:text-blue-400 p-1 transition-colors"
                                     title="Editar comentario"
                                   >
                                     <Edit2 size={12} />
                                   </button>
                                 )}
                                 {canDeleteComment(comment) && (
                                   <button
                                     onClick={() => handleDeleteComment(comment.id)}
                                     className="text-slate-500 hover:text-red-400 p-1 transition-colors"
                                     title="Eliminar comentario"
                                   >
                                     <Trash2 size={12} />
                                   </button>
                                 )}
                               </div>
                             )}
                           </div>
                           {editingComment === comment.id ? (
                             <div>
                               <textarea
                                 value={editCommentContent}
                                 onChange={(e) => setEditCommentContent(e.target.value)}
                                 className="w-full bg-slate-100 dark:bg-slate-900/50 border border-slate-300 dark:border-white/10 rounded-lg px-3 py-2 text-sm text-slate-900 dark:text-white placeholder-slate-500 focus:outline-none focus:border-violet-500 transition-colors resize-none h-20"
                                 placeholder="Edita tu comentario..."
                               />
                               <div className="flex gap-2 mt-2">
                                 <button
                                   onClick={() => handleSaveComment(comment.id)}
                                   className="bg-violet-600 hover:bg-violet-700 text-white px-3 py-1 rounded text-xs font-medium transition-colors"
                                 >
                                   Guardar
                                 </button>
                                 <button
                                   onClick={() => {
                                     setEditingComment(null);
                                     setEditCommentContent('');
                                   }}
                                   className="bg-slate-700 hover:bg-slate-600 text-white px-3 py-1 rounded text-xs font-medium transition-colors"
                                 >
                                   Cancelar
                                 </button>
                               </div>
                             </div>
                           ) : (
                             <p className="text-sm text-slate-700 dark:text-slate-300">{comment.content}</p>
                           )}
                         </div>
                       </div>
                     );
                   })}

                   {/* Add Comment Form */}
                   <form 
                     onSubmit={(e) => handleCommentSubmit(post.id, e)}
                     className="flex gap-3 pl-4 border-l-2 border-white/10"
                   >
                     <img 
                       src={user.avatar} 
                       className="w-8 h-8 rounded-full border border-white/10" 
                       alt={user.name} 
                     />
                     <div className="flex-1 flex gap-2">
                       <input
                         type="text"
                         value={commentInputs[post.id] || ''}
                         onChange={(e) => setCommentInputs({ ...commentInputs, [post.id]: e.target.value })}
                         placeholder="Escribe un comentario..."
                         className="flex-1 bg-slate-100 dark:bg-slate-900/50 border border-slate-300 dark:border-white/10 rounded-lg px-4 py-2 text-sm text-slate-900 dark:text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 transition-colors"
                       />
                       <button
                         type="submit"
                         disabled={!commentInputs[post.id]?.trim()}
                         className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
                       >
                         <Send size={14} />
                       </button>
                     </div>
                   </form>
                 </div>
               )}
            </div>
          );
        })}
      </div>
    </div>
  );
};