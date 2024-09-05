"use client";

import React, { useState } from "react";
import { useContract } from "../_contexts/ContractContext";
import Web3 from "web3";

interface FollowButtonProps {
  userToFollow: string; // The address of the user to follow
  stateChange: any;
}

const FollowButton: React.FC<FollowButtonProps> = ({
  userToFollow,
  stateChange,
}) => {
  const { account, contract } = useContract();
  const [loading, setLoading] = useState(false);

  const handleFollow = async () => {
    if (!contract || !account) {
      alert("Wallet not connected or contract not initialized.");
      return;
    }

    setLoading(true);

    try {
      await contract.methods.followUser(userToFollow).send({ from: account });

      alert(`Successfully followed ${userToFollow}`);
      stateChange(true);
    } catch (err) {
      alert(
        "Failed to follow user. Make sure you have enough gas and the contract is correctly configured."
      );
      console.error(err);
    } finally {
      setLoading(false);
    }
  };
  if (account.toLowerCase() === userToFollow.toLowerCase()) return null;

  return (
    <div>
      <button
        onClick={handleFollow}
        disabled={loading}
        className="bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600 disabled:bg-gray-400"
      >
        {loading ? "Following..." : "Follow"}
      </button>
    </div>
  );
};

export default FollowButton;
