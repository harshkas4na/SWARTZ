"use client";

import { useEffect, useState } from "react";
import { useContract } from "../_contexts/ContractContext";
import { Post } from "../../types";
import PostCard from "../_components/PostCard";
import SearchBar from "../_components/SearchBar";
import Loader from "../_components/Loader";

// Add these lines at the top of your file
const sensitiveKeywords = ["offensive", "inappropriate", "explicit", "nsfw"];

const containsSensitiveContent = (post: Post): boolean => {
  const content = `${post.title} ${post.description}`.toLowerCase();
  return sensitiveKeywords.some((keyword) => content.includes(keyword));
};

export default function FeedsPage() {
  const { contract, account } = useContract();
  const [posts, setPosts] = useState<Post[]>([]);
  const [filteredPosts, setFilteredPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [userExists, setUserExists] = useState(false);

  useEffect(() => {
    const fetchPosts = async () => {
      if (!contract) return;

      try {
        const userData = await contract.methods.getUser(account).call();
        setUserExists(userData._exists);

        const postCount = await contract.methods.postCount().call();
        const fetchedPosts: Post[] = [];

        for (let i = 1; i <= postCount; i++) {
          const post = await contract.methods.getPost(i).call(); // Assuming your contract has a getPost method
          if (post._isDeleted) continue;
          const authorData = await contract.methods
            .getUser(post._author)
            .call();
          let isFollowing = false;
          for (let i = 0; i < authorData._followers.length; i++) {
            if (
              authorData._followers[i].toLowerCase() == account.toLowerCase()
            ) {
              isFollowing = true;
              break;
            }
          }
          fetchedPosts.push({
            id: i.toString(),
            username: post._author,
            userProfileImage: authorData._imageHash,
            title: post._title,
            description: post._description,
            comments: post._comments.map((comment: any) => ({
              username: comment._username,
              content: comment._content,
            })),
            image: post._imageHash || null,
            isFollowingAuthor: isFollowing,
            // Add this line to determine if the post should be blurred
            isBlurred: containsSensitiveContent({
              title: post._title,
              description: post._description,
            } as Post),
          });
        }

        setPosts(fetchedPosts);
        setFilteredPosts(fetchedPosts);
      } catch (error) {
        console.error("Error fetching posts:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchPosts();
  }, [contract, account]);

  const handleSearchResults = (results: Post[]) => {
    setFilteredPosts(results);
  };

  if (loading) return <Loader />;

  return (
    <>
      <SearchBar posts={posts} onSearchResults={handleSearchResults} />
      <div className="mt-6 space-y-6">
        {filteredPosts.length > 0 ? (
          filteredPosts.map((post: Post) => (
            <PostCard key={post.id} post={post} userExists={userExists} />
          ))
        ) : (
          <p>No posts found.</p>
        )}
      </div>
    </>
  );
}
