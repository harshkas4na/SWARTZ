/* eslint-disable react-hooks/exhaustive-deps */
"use client";

import PostCard from "@/app/_components/PostCard";
import SearchBar from "@/app/_components/SearchBar";
import SubgroupHeader from "@/app/_components/SubgroupHeader";
import Loader from "@/app/_components/Loader"; // Assuming you have a Loader component
import { useContract } from "@/app/_contexts/ContractContext";
import { Post, Subgroup } from "@/types";
import { useParams } from "next/navigation";
import { useState, useEffect } from "react";
import Web3 from "web3";

export default function SubgroupFeedPage() {
  const params = useParams();
  const subgroupId = Array.isArray(params.subgroupId)
    ? params.subgroupId[0]
    : params.subgroupId;

  const [subgroup, setSubgroup] = useState<Subgroup>();
  const [posts, setPosts] = useState<Post[]>([]);
  const [filteredPosts, setFilteredPosts] = useState<Post[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isJoined, setIsJoined] = useState<boolean>(false);
  const [userExists, setUserExists] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true); // Unified loading state
  const { contract, account } = useContract();

  useEffect(() => {
    const fetchSubgroupData = async () => {
      try {
        if (contract) {
          setLoading(true); // Start loading when fetching begins

          const userData = await contract.methods.getUser(account).call();
          setUserExists(userData._exists);

          const subgroupData = await contract.methods
            .getSubgroup(subgroupId)
            .call();

          if (!subgroupData || !subgroupData._name) {
            setError("Subgroup not found");
            setLoading(false); // Stop loading if subgroup is invalid
            return;
          }

          setSubgroup({
            id: subgroupId,
            name: subgroupData._name,
            subscriberCount: parseInt(subgroupData._subscriberCount),
            posts: subgroupData._posts.map((id: string) => parseInt(id)),
          });

          // Fetch posts for this subgroup
          const fetchedPosts: Post[] = [];
          for (let i = 0; i < subgroupData._posts.length; i++) {
            const post = await contract.methods
              .getPost(Number(subgroupData._posts[i]))
              .call();

            const authorData = await contract.methods
              .getUser(post._author)
              .call();

            let isFollowing = authorData._followers.includes(account);

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
            });
          }

          setPosts(fetchedPosts);
          setFilteredPosts(fetchedPosts);

          const joined = await contract.methods
            .isSubscribed(Number(subgroupId), account)
            .call();
          setIsJoined(joined);

          setLoading(false); // Stop loading once all data is fetched
        }
      } catch (error) {
        console.error("Error fetching subgroup data:", error);
        setLoading(false); // Stop loading even if there's an error
      }
    };

    fetchSubgroupData();
  }, [contract, subgroupId]);

  const handleJoin = async () => {
    if (contract) {
      try {
        await contract.methods.joinSubgroup(subgroupId).send({
          from: account,
        });
        setIsJoined(true);
      } catch (error) {
        console.error("Error joining subgroup:", error);
      }
    }
  };

  const handleLeave = async () => {
    if (contract) {
      try {
        await contract.methods.leaveSubgroup(subgroupId).send({
          from: account,
        });
        setIsJoined(false);
      } catch (error) {
        console.error("Error leaving subgroup:", error);
      }
    }
  };

  const handleSearchResults = (results: Post[]) => {
    setFilteredPosts(results);
  };

  if (loading) {
    return <Loader />; // Display loader while fetching data
  }

  if (error) {
    return <div className="text-red-500">{error}</div>;
  }

  return (
    <div className="mt-6 space-y-6">
      <SearchBar posts={posts} onSearchResults={handleSearchResults} />
      <SubgroupHeader
        subgroup={subgroup}
        isJoined={isJoined}
        onJoin={handleJoin}
        onLeave={handleLeave}
      />
      {filteredPosts.length > 0 ? (
        filteredPosts.map((post: Post) => (
          <PostCard key={post.id} post={post} userExists={userExists} />
        ))
      ) : (
        <p>No posts found in this subgroup.</p>
      )}
    </div>
  );
}
