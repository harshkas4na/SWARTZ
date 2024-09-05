"use client";
import { useState, useEffect, useContext } from "react";
import Image from "next/image";
import { Post } from "@/types";
import { ContractContext } from "../_contexts/ContractContext";
import { Gateway_url } from "../config";
import { useRouter } from "next/router";
import FollowButton from "./FollowButton";
import UnfollowButton from "./UnfollowButton";

interface PostCardProps {
  post: Post;
  userExists: boolean;
}

const PostCard: React.FC<PostCardProps> = ({ post, userExists }) => {
  const [isRevealed, setIsRevealed] = useState(false);
  const [showComments, setShowComments] = useState(false);
  const [newComment, setNewComment] = useState("");
  const [liked, setLiked] = useState(false);
  const [saved, setSaved] = useState(false);
  const [likeCount, setLikeCount] = useState(0);
  const [comments, setComments] = useState<
    { username: string; content: string }[]
  >([]);
  const [isFollowing, setIsFollowing] = useState(post.isFollowingAuthor);
  const { contract, account } = useContext(ContractContext);

  useEffect(() => {
    if (contract && account) {
      loadPostData();
    }
  }, [contract, account, post.id]);

  const loadPostData = async () => {
    try {
      // console.log(post.id);
      const postData = await contract.methods.getPost(post.id).call();
      setLikeCount(parseInt(postData._likeCount));

      const isLiked = await contract.methods.postLikes(post.id, account).call();
      setLiked(isLiked);

      const userData = await contract.methods.getUser(account).call();
      console.log(userData._savedPosts);
      // setSaved(userData._savedPosts.includes(post.id.toString()));
      for (let i = 0; i < userData._savedPosts.length; i++) {
        if (Number(userData._savedPosts[i]) == Number(post.id)) {
          setSaved(true);
          break;
        }
      }

      const commentPromises = postData._comments.map((commentId: string) =>
        contract.methods.comments(commentId).call()
      );
      const commentData = await Promise.all(commentPromises);
      setComments(
        commentData.map((comment: any) => ({
          username: comment.author,
          content: comment.content,
        }))
      );
    } catch (error) {
      console.error("Error loading post data:", error);
    }
  };

  const handleReveal = () => {
    setIsRevealed(true);
  };

  if (post.isBlurred && !isRevealed) {
    return (
      <div className="bg-white shadow rounded-lg p-6 relative">
        <div className="filter blur-sm">
          <div className="h-48 bg-gray-200"></div>
        </div>
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center bg-white p-4 rounded-lg shadow-lg">
            <p className="mb-2">This post may contain sensitive content.</p>
            <button
              onClick={handleReveal}
              className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition-colors duration-200"
            >
              Reveal Content
            </button>
          </div>
        </div>
      </div>
    );
  }

  const handleLike = async () => {
    if (userExists) {
      try {
        if (liked) {
          await contract.methods.unlikePost(post.id).send({ from: account });
          setLikeCount((prevCount) => prevCount - 1);
        } else {
          await contract.methods.likePost(post.id).send({ from: account });
          setLikeCount((prevCount) => prevCount + 1);
        }
        setLiked(!liked);
      } catch (error) {
        console.error("Error liking/unliking post:", error);
      }
    } else {
      alert("You must be logged in to like posts");
    }
  };

  const handleSave = async () => {
    if (userExists) {
      try {
        if (saved) {
          await contract.methods.unsavePost(post.id).send({ from: account });
        } else {
          await contract.methods.savePost(post.id).send({ from: account });
        }
        setSaved(!saved);
      } catch (error) {
        console.error("Error saving/unsaving post:", error);
      }
    } else {
      alert("You must be logged in to save posts");
    }
  };

  const handleCommentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;
    if (userExists) {
      try {
        await contract.methods
          .addComment(post.id, newComment)
          .send({ from: account });
        setComments([...comments, { username: account, content: newComment }]);
        setNewComment("");
        loadPostData();
      } catch (error) {
        console.error("Error commenting on post:", error);
      }
    } else {
      alert("You must be logged in to comment on posts");
    }
  };

  return (
    <div className="bg-white shadow-lg rounded-lg overflow-hidden border border-gray-200 hover:shadow-xl transition-shadow duration-300">
      <div className="p-6">
        <div className="flex items-center mb-4">
          <Image
            src={`${Gateway_url}/ipfs/${post.userProfileImage}`}
            alt={post.username}
            width={48}
            height={48}
            className="rounded-full border-2 border-blue-500"
          />
          <span className="ml-3 font-semibold text-lg text-gray-800">
            {post.username}
          </span>
          <span className="ml-auto text-xs text-gray-600">
            {!isFollowing ? (
              <FollowButton
                userToFollow={post.username}
                stateChange={setIsFollowing}
              />
            ) : (
              <UnfollowButton
                userToUnfollow={post.username}
                stateChange={setIsFollowing}
              />
            )}
          </span>
        </div>
        <h2 className="text-2xl font-bold mb-3 text-gray-900">{post.title}</h2>
        <p className="text-gray-700 mb-4 text-base">{post.description}</p>
        {post.image && (
          <div className="mb-4 rounded-lg overflow-hidden">
            <Image
              src={`${Gateway_url}/ipfs/${post.image}`}
              alt="Post image"
              width={500}
              height={300}
              className="w-full object-cover"
            />
          </div>
        )}
        <div className="flex justify-between items-center text-gray-500">
          <button
            onClick={handleLike}
            className={`flex items-center space-x-2 transition-colors duration-200 ${
              liked ? "text-red-500" : "hover:text-blue-500"
            }`}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6"
              fill={liked ? "red" : "none"}
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
              />
            </svg>
            <span>Like ({likeCount})</span>
          </button>
          <button
            onClick={() => setShowComments(!showComments)}
            className="flex items-center space-x-2 hover:text-blue-500 transition-colors duration-200"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"
              />
            </svg>
            <span>Comment ({comments.length})</span>
          </button>
          <button
            onClick={handleSave}
            className={`flex items-center space-x-2 transition-colors duration-200 ${
              saved ? "text-gray-700" : "hover:text-gray-700"
            }`}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6"
              fill={saved ? "gray" : "none"}
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z"
              />
            </svg>
            <span>{saved ? "Saved" : "Save"}</span>
          </button>
        </div>
      </div>
      {showComments && (
        <div className="p-6 border-t border-gray-200 bg-gray-50">
          {comments.map((comment, index) => (
            <div key={index} className="mb-3 bg-white p-3 rounded-lg shadow">
              <span className="font-semibold text-blue-600">
                {comment.username}:{" "}
              </span>
              <span className="text-gray-700">{comment.content}</span>
            </div>
          ))}
          <form onSubmit={handleCommentSubmit} className="mt-4">
            <input
              type="text"
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="Add a comment..."
              className="w-full p-3 border border-gray-300 rounded-lg text-black focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <button
              type="submit"
              className="mt-2 bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors duration-200 flex items-center justify-center"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 mr-2"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-8.707l-3-3a1 1 0 00-1.414 1.414L10.586 9H7a1 1 0 100 2h3.586l-1.293 1.293a1 1 0 101.414 1.414l3-3a1 1 0 000-1.414z"
                  clipRule="evenodd"
                />
              </svg>
              Add Comment
            </button>
          </form>
        </div>
      )}
    </div>
  );
};

export default PostCard;