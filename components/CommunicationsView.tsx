import React, { useState, useRef, useEffect } from 'react';
import { useStore } from '../store';
import { MessageSquare, Heart, Send, MoreHorizontal, ChevronDown, ChevronUp, Edit2, Trash2, AtSign, X, AlertCircle } from 'lucide-react';
import { Post, Comment } from '../types';

export const CommunicationsView: React.FC = () => {
  const { posts, addPost, addComment, deletePost, updatePost, deleteComment, updateComment, user, users, originalUserRole } = useStore();
  const [newPostContent, setNewPostContent] = useState('');
  const [selectedMentions, setSelectedMentions] = useState<string[]>([]);
  const [isEveryoneTagged, setIsEveryoneTagged] = useState(false);
  const [showMentionPicker, setShowMentionPicker] = useState(false);
  const [mentionSearch, setMentionSearch] = useState('');
  const [mentionStartPos, setMentionStartPos] = useState<number | null>(null);
  const [expandedComments, setExpandedComments] = useState<Set<string>>(new Set());
  const [commentInputs, setCommentInputs] = useState<Record<string, string>>({});
  const [activeMenu, setActiveMenu] = useState<string | null>(null);
  const [editingPost, setEditingPost] = useState<string | null>(null);
  const [editingComment, setEditingComment] = useState<string | null>(null);
  const [editPostContent, setEditPostContent] = useState('');
  const [editCommentContent, setEditCommentContent] = useState('');
  const menuRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const mentionPickerRef = useRef<HTMLDivElement | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  
  // Check if user can delete posts/comments from others (only CTO and Founder)
  const canDeleteOthers = originalUserRole === 'CTO' || originalUserRole === 'Founder';
  
  // Mark mentions as read when viewing communications
  useEffect(() => {
    if (!user) return;
    
    // Mark all current mentions as read
    const allPostIds = posts
      .filter(p => p.mentions?.includes(user.id) || p.isEveryoneTagged)
      .map(p => p.id);
    
    if (allPostIds.length > 0) {
      const lastReadMentions = localStorage.getItem(`read_mentions_${user.id}`);
      const readMentionPostIds = lastReadMentions ? JSON.parse(lastReadMentions) : [];
      const newReadMentions = [...new Set([...readMentionPostIds, ...allPostIds])];
      localStorage.setItem(`read_mentions_${user.id}`, JSON.stringify(newReadMentions));
    }
  }, [posts, user]);

  // Close menus when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      
      // Check if click is inside any menu
      let clickedInsideMenu = false;
      Object.values(menuRefs.current).forEach(ref => {
        if (ref && ref.contains(target)) {
          clickedInsideMenu = true;
        }
      });
      
      // If clicked inside menu, don't close it
      if (clickedInsideMenu) {
        return;
      }
      
      // Close all menus if clicked outside
      Object.values(menuRefs.current).forEach(ref => {
        if (ref && !ref.contains(target)) {
          setActiveMenu(null);
        }
      });
      
      if (mentionPickerRef.current && !mentionPickerRef.current.contains(target)) {
        setShowMentionPicker(false);
      }
    };
    
    // Use click instead of mousedown to allow button clicks to process first
    document.addEventListener('click', handleClickOutside, true);
    return () => document.removeEventListener('click', handleClickOutside, true);
  }, []);

  // Filter users for mention picker
  const filteredUsers = users.filter(u => 
    u.id !== user?.id && 
    (u.name.toLowerCase().includes(mentionSearch.toLowerCase()) || 
     u.role.toLowerCase().includes(mentionSearch.toLowerCase()))
  );

  // Handle textarea input and detect @ mentions
  const handleTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    const cursorPos = e.target.selectionStart;
    setNewPostContent(value);

    // Check if there's an @ symbol before cursor
    const textBeforeCursor = value.substring(0, cursorPos);
    const lastAtIndex = textBeforeCursor.lastIndexOf('@');
    
    // Check if @ is followed by whitespace or newline (not a mention)
    if (lastAtIndex !== -1) {
      const textAfterAt = textBeforeCursor.substring(lastAtIndex + 1);
      // If there's no space/newline after @, it's a potential mention
      if (!textAfterAt.match(/[\s\n]/)) {
        const searchTerm = textAfterAt.toLowerCase();
        
        // Check for @everyone
        if (searchTerm === '' || 'everyone'.startsWith(searchTerm)) {
          setMentionStartPos(lastAtIndex);
          setMentionSearch(searchTerm);
          setShowMentionPicker(true);
          return;
        }
        
        // Check for user mentions
        const hasMatchingUsers = users.some(u => 
          u.id !== user?.id && 
          (u.name.toLowerCase().startsWith(searchTerm) || 
           u.role.toLowerCase().startsWith(searchTerm))
        );
        
        if (hasMatchingUsers || searchTerm === '') {
          setMentionStartPos(lastAtIndex);
          setMentionSearch(searchTerm);
          setShowMentionPicker(true);
          return;
        }
      }
    }
    
    // Hide mention picker if no valid @ mention
    setShowMentionPicker(false);
    setMentionStartPos(null);
  };

  // Handle keyboard navigation in mention picker
  const handleTextareaKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (showMentionPicker && filteredUsers.length > 0) {
      if (e.key === 'ArrowDown' || e.key === 'ArrowUp' || e.key === 'Enter' || e.key === 'Escape') {
        e.preventDefault();
        // Keyboard navigation could be added here if needed
        if (e.key === 'Escape') {
          setShowMentionPicker(false);
          setMentionStartPos(null);
        }
      }
    }
  };

  // Insert mention into textarea at cursor position
  const insertMentionInText = (mentionText: string, userId?: string) => {
    if (mentionStartPos === null || !textareaRef.current) return;

    const textarea = textareaRef.current;
    const textBefore = newPostContent.substring(0, mentionStartPos);
    const textAfter = newPostContent.substring(textarea.selectionStart);
    const newText = `${textBefore}@${mentionText} ${textAfter}`;
    
    setNewPostContent(newText);
    setShowMentionPicker(false);
    setMentionStartPos(null);
    setMentionSearch('');

    // Add to selected mentions if userId provided
    if (userId && !selectedMentions.includes(userId)) {
      setSelectedMentions([...selectedMentions, userId]);
    }

    // Set cursor position after inserted mention
    setTimeout(() => {
      if (textareaRef.current) {
        const newCursorPos = mentionStartPos + mentionText.length + 2; // +2 for @ and space
        textareaRef.current.setSelectionRange(newCursorPos, newCursorPos);
        textareaRef.current.focus();
      }
    }, 0);
  };

  // Handle selecting a user from mention picker
  const handleSelectMention = (userId: string) => {
    const mentionedUser = users.find(u => u.id === userId);
    if (mentionedUser) {
      insertMentionInText(mentionedUser.name, userId);
    }
  };

  // Handle selecting @everyone
  const handleSelectEveryone = () => {
    insertMentionInText('everyone');
    setIsEveryoneTagged(true);
  };

  if (!user) return null;

  const handlePostSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newPostContent.trim()) {
      // Extract mentions from text content (format: @username or @everyone)
      const extractedMentions: string[] = [];
      let extractedEveryone = false;
      
      // Check for @everyone in text
      if (newPostContent.includes('@everyone')) {
        extractedEveryone = true;
      }
      
      // Extract user mentions from text
      const mentionRegex = /@(\w+)/g;
      let match;
      while ((match = mentionRegex.exec(newPostContent)) !== null) {
        const mentionName = match[1];
        if (mentionName.toLowerCase() !== 'everyone') {
          const mentionedUser = users.find(u => 
            u.name.toLowerCase() === mentionName.toLowerCase() || 
            u.name.toLowerCase().replace(/\s+/g, '').toLowerCase() === mentionName.toLowerCase()
          );
          if (mentionedUser && !extractedMentions.includes(mentionedUser.id)) {
            extractedMentions.push(mentionedUser.id);
          }
        }
      }
      
      // Use extracted mentions or fallback to selectedMentions
      const finalMentions = extractedMentions.length > 0 ? extractedMentions : 
                           (selectedMentions.length > 0 ? selectedMentions : undefined);
      const finalEveryone = extractedEveryone || isEveryoneTagged;
      
      addPost(newPostContent, finalMentions, finalEveryone);
      setNewPostContent('');
      setSelectedMentions([]);
      setIsEveryoneTagged(false);
      setShowMentionPicker(false);
      setMentionStartPos(null);
    }
  };

  const handleAddMention = (userId: string) => {
    if (!selectedMentions.includes(userId)) {
      setSelectedMentions([...selectedMentions, userId]);
    }
    setShowMentionPicker(false);
    setMentionSearch('');
  };

  const handleRemoveMention = (userId: string) => {
    setSelectedMentions(selectedMentions.filter(id => id !== userId));
  };

  const handleToggleEveryone = () => {
    setIsEveryoneTagged(!isEveryoneTagged);
    if (!isEveryoneTagged) {
      setShowMentionPicker(false);
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
      setActiveMenu(null);
      // Optimistic update - remove from UI immediately
      try {
        // Delete in background without blocking UI
        deletePost(postId).catch(error => {
          console.error('Error al eliminar el post:', error);
          alert('Error al eliminar el post. Por favor, recarga la página.');
        });
      } catch (error) {
        console.error('Error al eliminar el post:', error);
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

  // Render post content with highlighted mentions
  const renderPostContent = (content: string, mentions?: string[]) => {
    if (!mentions || mentions.length === 0) {
      // No mentions, just render plain text
      return <span>{content}</span>;
    }

    // Create a map of user names by their IDs for quick lookup
    const mentionMap = new Map<string, string>();
    mentions.forEach(userId => {
      const mentionedUser = users.find(u => u.id === userId);
      if (mentionedUser) {
        mentionMap.set(mentionedUser.name.toLowerCase(), userId);
      }
    });

    // Parse content and highlight @mentions
    const parts: Array<{ text: string; isMention: boolean; userId?: string }> = [];
    const mentionRegex = /@(\w+)/g;
    let lastIndex = 0;
    let match;

    while ((match = mentionRegex.exec(content)) !== null) {
      // Add text before the mention
      if (match.index > lastIndex) {
        parts.push({ text: content.substring(lastIndex, match.index), isMention: false });
      }

      const mentionName = match[1];
      const userId = mentionMap.get(mentionName.toLowerCase());
      
      // Check if it's @everyone
      if (mentionName.toLowerCase() === 'everyone') {
        parts.push({ text: `@${mentionName}`, isMention: true });
      } else if (userId) {
        // It's a valid mention
        parts.push({ text: `@${mentionName}`, isMention: true, userId });
      } else {
        // Not a valid mention, render as plain text
        parts.push({ text: `@${mentionName}`, isMention: false });
      }

      lastIndex = match.index + match[0].length;
    }

    // Add remaining text
    if (lastIndex < content.length) {
      parts.push({ text: content.substring(lastIndex), isMention: false });
    }

    return (
      <span>
        {parts.map((part, index) => {
          if (part.isMention) {
            const mentionedUser = part.userId ? users.find(u => u.id === part.userId) : null;
            const isCurrentUser = part.userId === user?.id;
            return (
              <span
                key={index}
                className={`inline font-medium ${
                  part.text === '@everyone'
                    ? 'text-amber-400 dark:text-amber-300'
                    : isCurrentUser
                    ? 'text-violet-400 dark:text-violet-300'
                    : 'text-violet-500 dark:text-violet-400'
                }`}
                title={mentionedUser ? `@${mentionedUser.name}` : part.text}
              >
                {part.text}
              </span>
            );
          }
          return <span key={index}>{part.text}</span>;
        })}
      </span>
    );
  };

  return (
    <div className="max-w-3xl mx-auto h-full flex flex-col animate-in fade-in slide-in-from-bottom-2 duration-500">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-1">Pulso del Equipo</h2>
        <p className="text-slate-600 dark:text-slate-400 text-sm">Actualizaciones, anuncios y logros.</p>
      </div>

      {/* Post Creator */}
      <div className="glass-panel p-4 rounded-2xl mb-8 border border-slate-300 dark:border-white/10">
        <div className="flex gap-4">
          <img src={user.avatar} className="w-10 h-10 rounded-full border border-white/10" alt={user.name} />
          <div className="flex-1 relative">
            <form onSubmit={handlePostSubmit}>
              <textarea
                ref={textareaRef}
                value={newPostContent}
                onChange={handleTextareaChange}
                onKeyDown={handleTextareaKeyDown}
                placeholder="¿Qué está pasando? Comparte una actualización... (Escribe @ para mencionar)"
                className="w-full bg-transparent border-none text-slate-900 dark:text-slate-200 placeholder-slate-500 dark:placeholder-slate-500 focus:ring-0 resize-none h-20 text-sm"
              />
              
              {/* Selected Mentions Display */}
              {(selectedMentions.length > 0 || isEveryoneTagged) && (
                <div className="flex flex-wrap gap-2 mb-2 pb-2 border-b border-slate-300 dark:border-white/5">
                  {isEveryoneTagged && (
                    <span className="inline-flex items-center gap-1 bg-amber-500/20 text-amber-400 px-2.5 py-1 rounded-full text-xs font-medium border border-amber-500/30">
                      <AlertCircle size={12} />
                      @everyone
                      <button
                        type="button"
                        onClick={handleToggleEveryone}
                        className="ml-1 hover:text-amber-300"
                      >
                        <X size={12} />
                      </button>
                    </span>
                  )}
                  {selectedMentions.map(userId => {
                    const mentionedUser = users.find(u => u.id === userId);
                    if (!mentionedUser) return null;
                    return (
                      <span
                        key={userId}
                        className="inline-flex items-center gap-1 bg-violet-500/20 text-violet-400 px-2.5 py-1 rounded-full text-xs font-medium border border-violet-500/30"
                      >
                        <AtSign size={12} />
                        {mentionedUser.name}
                        <button
                          type="button"
                          onClick={() => handleRemoveMention(userId)}
                          className="ml-1 hover:text-violet-300"
                        >
                          <X size={12} />
                        </button>
                      </span>
                    );
                  })}
                </div>
              )}

              <div className="flex justify-between items-center pt-2 border-t border-slate-300 dark:border-white/5">
                <div className="flex gap-2 relative">
                  <button 
                    type="button" 
                    onClick={() => setShowMentionPicker(!showMentionPicker)}
                    className="text-slate-500 hover:text-violet-400 transition-colors"
                    title="Mencionar usuarios"
                  >
                    <AtSign size={18} />
                  </button>
                  <button 
                    type="button"
                    onClick={handleToggleEveryone}
                    className={`transition-colors ${
                      isEveryoneTagged 
                        ? 'text-amber-400 hover:text-amber-300' 
                        : 'text-slate-500 hover:text-amber-400'
                    }`}
                    title="Mencionar a todos"
                  >
                    <AlertCircle size={18} />
                  </button>
                  
                  {/* Mention Picker Dropdown - Manual trigger */}
                  {showMentionPicker && !mentionStartPos && (
                    <div
                      ref={mentionPickerRef}
                      className="absolute bottom-full left-0 mb-2 w-64 bg-white dark:bg-slate-900 border border-slate-300 dark:border-white/20 rounded-lg shadow-xl z-50 max-h-64 overflow-hidden flex flex-col"
                    >
                      <div className="p-2 border-b border-slate-300 dark:border-white/10">
                        <input
                          type="text"
                          value={mentionSearch}
                          onChange={(e) => setMentionSearch(e.target.value)}
                          placeholder="Buscar usuario..."
                          className="w-full bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-white/10 rounded-lg px-3 py-2 text-sm text-slate-900 dark:text-white placeholder-slate-500 focus:outline-none focus:border-violet-500"
                          autoFocus
                        />
                      </div>
                      <div className="overflow-y-auto max-h-48">
                        {filteredUsers.length > 0 ? (
                          filteredUsers.map(u => (
                            <button
                              key={u.id}
                              type="button"
                              onClick={() => handleAddMention(u.id)}
                              className="w-full text-left px-4 py-2 hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center gap-3 transition-colors"
                            >
                              <img src={u.avatar} className="w-8 h-8 rounded-full" alt={u.name} />
                              <div>
                                <div className="text-sm font-medium text-slate-900 dark:text-white">{u.name}</div>
                                <div className="text-xs text-slate-500 dark:text-slate-400">{u.role}</div>
                              </div>
                            </button>
                          ))
                        ) : (
                          <div className="px-4 py-8 text-center text-sm text-slate-500 dark:text-slate-400">
                            No se encontraron usuarios
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                  
                  {/* Mention Picker Dropdown - Auto-triggered by @ */}
                  {showMentionPicker && mentionStartPos !== null && (
                    <div
                      ref={mentionPickerRef}
                      className="absolute bottom-full left-0 mb-2 w-64 bg-white dark:bg-slate-900 border border-slate-300 dark:border-white/20 rounded-lg shadow-xl z-50 max-h-64 overflow-hidden flex flex-col"
                    >
                      <div className="p-2 border-b border-slate-300 dark:border-white/10">
                        <div className="text-xs font-medium text-slate-500 dark:text-slate-400 px-2">
                          Mencionar usuario
                        </div>
                      </div>
                      <div className="overflow-y-auto max-h-48">
                        {/* @everyone option */}
                        {('everyone'.startsWith(mentionSearch.toLowerCase()) || mentionSearch === '') && (
                          <button
                            type="button"
                            onClick={handleSelectEveryone}
                            className="w-full text-left px-4 py-2 hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center gap-3 transition-colors border-b border-slate-200 dark:border-white/10"
                          >
                            <div className="w-8 h-8 rounded-full bg-amber-500/20 flex items-center justify-center">
                              <AlertCircle size={16} className="text-amber-400" />
                            </div>
                            <div>
                              <div className="text-sm font-medium text-slate-900 dark:text-white">@everyone</div>
                              <div className="text-xs text-slate-500 dark:text-slate-400">Mencionar a todos</div>
                            </div>
                          </button>
                        )}
                        {filteredUsers.length > 0 ? (
                          filteredUsers.map(u => (
                            <button
                              key={u.id}
                              type="button"
                              onClick={() => handleSelectMention(u.id)}
                              className="w-full text-left px-4 py-2 hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center gap-3 transition-colors"
                            >
                              <img src={u.avatar} className="w-8 h-8 rounded-full" alt={u.name} />
                              <div>
                                <div className="text-sm font-medium text-slate-900 dark:text-white">{u.name}</div>
                                <div className="text-xs text-slate-500 dark:text-slate-400">{u.role}</div>
                              </div>
                            </button>
                          ))
                        ) : mentionSearch !== '' && !('everyone'.startsWith(mentionSearch.toLowerCase())) ? (
                          <div className="px-4 py-8 text-center text-sm text-slate-500 dark:text-slate-400">
                            No se encontraron usuarios
                          </div>
                        ) : null}
                      </div>
                    </div>
                  )}
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
      </div>

      {/* Feed */}
      <div className="space-y-6 pb-6">
        {posts.map(post => {
          const author = getAuthor(post.authorId);
          return (
            <div key={post.id} className="glass-card p-5 rounded-2xl border border-slate-300 dark:border-white/5 hover:border-slate-400 dark:hover:border-white/10 transition-colors">
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
                     type="button"
                     onClick={(e) => {
                       e.stopPropagation();
                       setActiveMenu(activeMenu === `post-${post.id}` ? null : `post-${post.id}`);
                     }}
                     className="text-slate-600 dark:text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors"
                   >
                     <MoreHorizontal size={18} />
                   </button>
                   
                   {activeMenu === `post-${post.id}` && (
                     <div 
                       className="absolute right-0 top-8 w-48 bg-white dark:bg-black border border-slate-300 dark:border-white/20 rounded-lg shadow-xl py-1 z-50"
                       onClick={(e) => {
                         e.stopPropagation();
                       }}
                       onMouseDown={(e) => {
                         e.stopPropagation();
                       }}
                     >
                       {canEditPost(post) && (
                         <button
                           type="button"
                           onClick={(e) => {
                             e.preventDefault();
                             e.stopPropagation();
                             handleEditPost(post);
                           }}
                           className="w-full text-left px-4 py-2 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-white/5 flex items-center gap-2 transition-colors"
                         >
                           <Edit2 size={14} />
                           Editar
                         </button>
                       )}
                       {canDeletePost(post) && (
                         <button
                           type="button"
                           onClick={(e) => {
                             e.preventDefault();
                             e.stopPropagation();
                             handleDeletePost(post.id);
                           }}
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
                   {renderPostContent(post.content, post.mentions)}
                 </p>
               )}

               {/* Tags and Mentions */}
               <div className="flex flex-wrap items-center gap-2 mb-4">
                 {post.category === 'Announcement' && (
                   <span className="inline-block bg-violet-500/10 text-violet-300 text-[10px] px-2 py-0.5 rounded-full border border-violet-500/20">
                     Anuncio
                   </span>
                 )}
                 {post.isEveryoneTagged && (
                   <span className="inline-flex items-center gap-1 bg-amber-500/20 text-amber-400 text-[10px] px-2 py-0.5 rounded-full border border-amber-500/30">
                     <AlertCircle size={10} />
                     @everyone
                   </span>
                 )}
                 {post.mentions && post.mentions.length > 0 && (
                   <div className="flex flex-wrap items-center gap-1">
                     {post.mentions.map(mentionedUserId => {
                       const mentionedUser = users.find(u => u.id === mentionedUserId);
                       if (!mentionedUser) return null;
                       const isCurrentUser = mentionedUserId === user?.id;
                       return (
                         <span
                           key={mentionedUserId}
                           className={`inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full border ${
                             isCurrentUser
                               ? 'bg-violet-500/30 text-violet-300 border-violet-500/40'
                               : 'bg-violet-500/10 text-violet-400 border-violet-500/20'
                           }`}
                         >
                           <AtSign size={10} />
                           {mentionedUser.name}
                         </span>
                       );
                     })}
                   </div>
                 )}
               </div>

               <div className="flex items-center gap-6 pt-3 border-t border-slate-300 dark:border-white/5">
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
                 <div className="mt-4 pt-4 border-t border-slate-300 dark:border-white/5 space-y-4">
                   {/* Existing Comments */}
                   {post.comments.map(comment => {
                     const commentAuthor = getAuthor(comment.authorId);
                     return (
                       <div key={comment.id} className="flex gap-3 pl-4 border-l-2 border-slate-300 dark:border-white/10 group">
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
                     className="flex gap-3 pl-4 border-l-2 border-slate-300 dark:border-white/10"
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