"use client";

import { useEffect, useState } from "react";
import { useContract } from "../_contexts/ContractContext"; // Assuming this provides the contract
import { Post, Comment } from "../../types";
import PostCard from "../_components/PostCard";
import SearchBar from "../_components/SearchBar";

import * as tf from '@tensorflow/tfjs';
import { AutoTokenizer, TFAutoModelForSequenceClassification } from '@xenova/transformers';

// Load tokenizer and model
async function loadModelAndTokenizer() {
  const tokenizer = await AutoTokenizer.from_pretrained('distilbert-base-uncased-finetuned-sst-2-english');
  const model = await TFAutoModelForSequenceClassification.from_pretrained('distilbert-base-uncased-finetuned-sst-2-english');

  return { tokenizer, model };
}

async function predict(text: string) {
  const { tokenizer, model } = await loadModelAndTokenizer();

  // Tokenize input
  const inputs = tokenizer(text, {
    return_tensors: 'tf',
    truncation: true,
    padding: true,
  });

  // Run model prediction
  const logits = model.predict(inputs.data) as tf.Tensor;

  // Get the predicted class id
  const predictedClassId = tf.argMax(logits, -1).dataSync()[0];

  // Map the predicted class id to the corresponding label
  const label = (model.config as any).id2label[predictedClassId];

  return label;
}

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

        const postCount = await contract.methods.postCount().call(); // Assuming your contract has a postCount method
        const fetchedPosts: Post[] = [];

        for (let i = 1; i <= postCount; i++) {
          const post = await contract.methods.getPost(i).call(); // Assuming your contract has a getPost method
          const authorData = await contract.methods.getUser(post._author).call();

          let isFollowing = false;
          for (let j = 0; j < authorData._followers.length; j++) {
            if (authorData._followers[j] === account) {
              isFollowing = true;
              break;
            }
          }

          // Analyze comments and get labels
          const commentsWithLabels = await Promise.all(
            post._comments.map(async (comment: any) => {
              const label = await predict(comment._content);
              return {
                username: comment._username, // Adjust based on your contract
                content: comment._content, // Adjust based on your contract
                label: label, // Add the predicted label
              };
            })
          );

          fetchedPosts.push({
            id: i.toString(),
            username: post._author, // Adjust to match your contract's return structure
            userProfileImage: authorData.imageHash, // Default image or fetched from another source
            title: post._title,
            description: post._description,
            comments: commentsWithLabels, // Use comments with labels
            image: post._imageHash || null, // Add this if your posts have images
            isFollowingAuthor: isFollowing,
          });
        }

        setPosts(fetchedPosts);
        setFilteredPosts(fetchedPosts); // Initialize with all posts
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

  if (loading) return <div>Loading...</div>;

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
