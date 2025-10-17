import React from 'react';
import { MessageCircle, ThumbsDown, ThumbsUp } from 'lucide-react';

const PostCard = ({
                      id,
                      username,
                      date,
                      title,
                      content,
                      likes,
                      dislikes,
                      comments,
                      image_url,
                      onClick,
                      onVote,
                      pending = false
                  }) => {
    const shortContent = content?.length > 180 ? content.slice(0, 180) + '...' : content || '';

    const handleLike = (e) => {
        e.stopPropagation();
        if (!pending) onVote?.(id, 'like');
    };

    const handleDislike = (e) => {
        e.stopPropagation();
        if (!pending) onVote?.(id, 'dislike');
    };

    return (
        <div
            onClick={onClick}
            className="bg-white text-black rounded-xl p-4 shadow-sm cursor-pointer hover:bg-gray-200 transition space-y-3"
        >
            <div className="flex items-center gap-2 text-sm">
                <span className="font-semibold">@{username}</span>
                <span className="text-gray-500">{date}</span>
            </div>

            <h2 className="font-bold text-md leading-snug">{title}</h2>
            <p className="text-sm text-gray-700">{shortContent}</p>

            {image_url && (
                <img src={image_url} alt={title} className="w-full h-48 object-cover rounded-md" />
            )}

            <div className="flex items-center gap-3 text-sm pt-2">
                <button
                    onClick={handleLike}
                    disabled={pending}
                    className={`flex items-center gap-2 border border-black rounded px-3 py-2 transition hover:bg-black hover:text-white ${
                        pending ? 'opacity-60 cursor-not-allowed' : ''
                    }`}
                    aria-label="like"
                >
                    <ThumbsUp size={16} />
                    {likes}
                </button>

                <button
                    onClick={handleDislike}
                    disabled={pending}
                    className={`flex items-center gap-2 border border-black rounded px-3 py-2 transition hover:bg-black hover:text-white ${
                        pending ? 'opacity-60 cursor-not-allowed' : ''
                    }`}
                    aria-label="dislike"
                >
                    <ThumbsDown size={16} />
                    {dislikes}
                </button>

                <div className="flex items-center gap-2 ml-auto text-gray-700">
                    <MessageCircle size={16} /> {comments}
                </div>
            </div>
        </div>
    );
};

export default PostCard;
