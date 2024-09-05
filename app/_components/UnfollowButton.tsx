"use client";

import React, { useState } from "react";
import { useContract } from "../_contexts/ContractContext";

interface UnfollowButtonProps {
  userToUnfollow: string; // The address of the user to unfollow
  stateChange: any;
}

const UnfollowButton: React.FC<UnfollowButtonProps> = ({
  userToUnfollow,
  stateChange,
}) => {
  const { account, contract } = useContract();
  const [loading, setLoading] = useState(false);

  const handleUnfollow = async () => {
    if (!contract || !account) {
      alert("Wallet not connected or contract not initialized.");
      return;
    }

    setLoading(true);

    try {
      await contract.methods
        .unfollowUser(userToUnfollow)
        .send({ from: account });

      alert(`Successfully unfollowed ${userToUnfollow}`);
      stateChange(false);
    } catch (err) {
      alert(
        "Failed to unfollow user. Make sure you have enough gas and the contract is correctly configured."
      );
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (account.toLowerCase() === userToUnfollow.toLowerCase()) return null;

  return (
    <div>
      <button
        onClick={handleUnfollow}
        disabled={loading}
        className="bg-red-500 text-white py-2 px-4 rounded hover:bg-red-600 disabled:bg-gray-400"
      >
        {loading ? "Unfollowing..." : "Unfollow"}
      </button>
    </div>
  );
};

export default UnfollowButton;
