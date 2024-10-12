import React, { useState, useEffect } from 'react';
import { FaLink, FaRegImage, FaExternalLinkAlt } from 'react-icons/fa'; // Importing icons
import ImageModal from './ImageModal';
import { Hootsuite } from '../services/Hootsuite';

// Define the interface for Post
export interface Post {
  author: {
    id: string;
    name: string;
    neighborhood_name: string;
  };
  body: string;
  category: string;
  comments: Comment[];
  comment_closed: boolean;
  comment_count: number;
  creation_date_epoch_seconds: number;
  downvote_count: number;
  embed_url: string;
  has_geo_tag: boolean;
  id: string;
  latitude: number;
  like_count: number;
  longitude: number;
  media: string[];
  media_focal_area: any[];
  public_post_url: string;
  reaction_types: {
    like2: number;
    report_count: number;
    scope: string;
    score: number;
    scores: any[];
  };
  title: string;
  user_entered_subject: boolean;
  video_preview_url: string;
  posts_length: number;
}

// Define Comment interface
interface Comment {
  id: number;
  body: string;
  author_name: string;
  author_type: string;
  creation_date: number;
  like_count: number;
  downvote_count: number;
  reply_count: number;
  report_count: number;
  comments: Comment[]; // Nested comments if any
  media: string[]; // Assuming media is an array of URLs or identifiers
  media_focal_area: (null | any)[]; // Adjust the type as needed
  reaction_types: Record<string, number>; // If there are reaction types with counts
  parent_comment_id: number | null; // Parent comment ID if this comment is a reply
}

interface PostListProps {
  posts: Post[];
  loading: boolean;
}

const PostList: React.FC<PostListProps> = ({ posts, loading }) => {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [openComments, setOpenComments] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false); // State for modal visibility

  const handleImageClick = (imageUrl: string) => {
    setSelectedImage(imageUrl);
    setModalOpen(true); // Open the modal when an image is clicked
  };

  const toggleComments = (postId: string) => {
    setOpenComments(openComments === postId ? null : postId);
  };



  const closeModal = () => {
    setModalOpen(false);
    setSelectedImage(null); // Clear selected image
  };
  

  return (
    <div className="xh-fit">
      <ImageModal isOpen={modalOpen} imageUrl={selectedImage} onClose={closeModal} />
      {loading ? (
        <div className="space-y-4">
          {/* Skeleton Loader */}
          {[1, 2, 3].map((_, index) => (
            <div key={index} className="animate-pulse bg-white p-4 rounded-lg shadow-md">
              <div className="bg-gray-300 h-6 w-1/4 mb-4 rounded"></div>
              <div className="bg-gray-300 h-4 w-full mb-2 rounded"></div>
              <div className="bg-gray-300 h-4 w-5/6 mb-2 rounded"></div>
              <div className="bg-gray-300 h-40 w-full rounded-md"></div>
            </div>
          ))}
        </div>
      ) : posts === undefined || (posts && posts.length === 0) ? (
        <div className="text-center text-gray-500 mt-4">
          No results found.
        </div>
      ) : (
        <ul className="space-y-4 ">
          <h1>Found {posts.length} post{posts.length > 1 ? 's' : '' }</h1>

          {posts.map((post) => (
            <li key={post.id} id={`post-${post.id}`} className="relative p-2 bg-white rounded-lg shadow-md">
              <div className="flex-col ">
                <div className="flex">
                  <div className="text-white font-semibold bg-blue-300 rounded-lg w-fit h-fit text-xs px-3 my-auto mr-auto">
                    {post.category || 'Uncategorized'}
                  </div>
                  <h3 className="text-sm ">{new Date(post.creation_date_epoch_seconds * 1000).toLocaleTimeString(undefined, {
                      weekday: 'short', // 'long' for full day name
                      month: 'short', // 'long' for full month name
                      day: 'numeric',
                  })}</h3>
                </div>
                <div className="flex items-center justify-between ">
                  <h3 className="text-lg font-bold ">{post.title}</h3>
                  {/* <a
                    href={post.public_post_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:text-blue-800"
                  >
                    <FaExternalLinkAlt />
                  </a> */}
                </div>
                <div className="flex gap-2">
                  <p className="text-gray-700">{post.like_count} 👍</p>
                  {/* <p className="text-gray-700">{post.downvote_count} 👎</p> */}
                  <p className="text-gray-700">{post.comments.length.toString()} 💬</p>
                </div>
                <div className="flex flex-wrap gap-2">
                  {post.media.length > 0 ? (
                    post.media.map((mediaUrl, index) => (
                      <img
                        key={index}
                        src={mediaUrl}
                        alt={`Media ${index + 1}`}
                        className="w-full h-40 object-cover cursor-pointer rounded-md shadow-sm"
                        onClick={() => Hootsuite.showImage}
                      />
                    ))
                  ) : (
                    <div className="w-full h-32 text-center content-center text-gray-500 p-2 bg-gradient-to-r from-transparent via-gray-200 to-transparent rounded-md">
                      <FaRegImage className="mx-auto" />
                      <div>No media available</div>
                    </div>
                  )}
                </div>
                <p className="pt-1  rounded">
                  <h1 className="font-semibold">Description:</h1> {post.body || 'No description available'}
                </p>
              </div>

              <button
                disabled={post.comments.length === 0}
                onClick={() => toggleComments(post.id)}
                className="absolute bottom-0 left-0 w-full h-12 btn-teal text-white py-2 rounded-t-none rounded-b-lg flex items-center justify-center gap-2 shadow-md transition-colors disabled:bg-gray-400"
              >
                {post.comments.length === 0
                  ? 'No Comments'
                  : openComments === post.id
                  ? 'Hide Comments'
                  : post.comments.length.toString() + ' Comments 💬'}
              </button>
              <div
                className={`transition-all duration-300 ease-in-out mb-12 ${
                  openComments === post.id ? 'max-h-120' : 'max-h-0'
                } overflow-hidden border-t border-gray-200`}
              >
                {post.comments.length > 0 ? (
                  <div className="pt-2">
                    <h2 className="py-2 text-lg font-semibold">💬 Comments</h2>
                    <ul className=''>
                      {post.comments.map((comment) => (
                        <li key={comment.id} className="p-4 border border-gray-100">
                          <p className="text-gray-800">
                            <strong>{new Date(comment.creation_date * 1000).toLocaleString()}:</strong> {comment.body}
                          </p>
                          <p className="text-gray-600">
                            <strong>Likes:</strong> {comment.like_count} 👍
                          </p>
                          {/* <p className="text-gray-600">
                            <strong>Downvotes:</strong> {comment.downvote_count} 👎
                          </p> */}
                        </li>
                      ))}
                    </ul>
                  </div>
                ) : (
                  <p className="p-4 text-gray-500">No comments available.</p>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}

    </div>
  );
};

export default PostList;
