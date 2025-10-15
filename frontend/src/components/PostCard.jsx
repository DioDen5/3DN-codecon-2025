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
                      voted,
                      onVote
                  }) => {
    const shortContent = content.length > 180 ? content.slice(0, 180) + '...' : content;

    const handleLike = (e) => {
        e.stopPropagation();
        if (voted !== 'like') onVote(id, 'like');
    };

    const handleDislike = (e) => {
        e.stopPropagation();
        if (voted !== 'dislike') onVote(id, 'dislike');
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
                <img
                    src={image_url}
                    alt={title}
                    className="w-full h-48 object-cover rounded-md"
                />
            )}

            <div className="flex items-center gap-3 text-sm pt-2">
                <button
                    onClick={handleLike}
                    className={`flex items-center gap-1 transition ${voted === 'like' ? "text-green-600" : "hover:text-green-600"}`}
                >
                    <ThumbsUp size={16} /> {likes}
                </button>
                <button
                    onClick={handleDislike}
                    className={`flex items-center gap-1 transition ${voted === 'dislike' ? "text-red-600" : "hover:text-red-600"}`}
                >
                    <ThumbsDown size={16} /> {dislikes}
                </button>
                <div className="flex items-center gap-1"><MessageCircle size={16} /> {comments}</div>
            </div>
        </div>
    );
};

export default PostCard;
