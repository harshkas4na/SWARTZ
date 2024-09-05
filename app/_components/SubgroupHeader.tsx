import { Proposal, Subgroup } from "@/types";
import React, { useState, useEffect, useCallback, useMemo } from "react";
import { useContract } from "../_contexts/ContractContext";

interface SubgroupHeaderProps {
  subgroup: Subgroup;
  isJoined: boolean;
  onJoin: () => void;
  onLeave: () => void;
}

const SubgroupHeader: React.FC<SubgroupHeaderProps> = ({
  subgroup,
  isJoined,
  onJoin,
  onLeave,
}) => {
  const [showCreatePoll, setShowCreatePoll] = useState(false);
  const [pollDescription, setPollDescription] = useState("");
  const [proposals, setProposals] = useState<Proposal[]>([]);
  const { GovernanceContract, account } = useContract();

  const fetchProposals = useCallback(async () => {
    if (GovernanceContract && GovernanceContract.methods) {
      try {
        const proposalCount = await GovernanceContract.methods.proposalCount().call();
        const fetchedProposals = await Promise.all(
          Array.from({ length: Number(proposalCount) }, (_, i) =>
            GovernanceContract.methods.proposals(i + 1).call()
          )
        );
        setProposals(fetchedProposals);
      } catch (error) {
        console.error("Error fetching proposals:", error);
      }
    }
  }, [GovernanceContract]);

  useEffect(() => {
    fetchProposals();
    const interval = setInterval(fetchProposals, 10000); // Poll every 10 seconds
    return () => clearInterval(interval);
  }, [fetchProposals]);

  // Filter proposals for the current subgroup
  const filteredProposals = useMemo(() => {
    return proposals.filter(proposal => proposal && Number(proposal.subgroupId) === Number(subgroup.id));

  }, [proposals, subgroup.id]);

  const handleCreatePoll = async () => {
    if (GovernanceContract && GovernanceContract.methods && pollDescription) {
      try {
        await GovernanceContract.methods
          .createProposal(pollDescription, subgroup.subscriberCount, subgroup.id)
          .send({ from: account });
        setShowCreatePoll(false);
        setPollDescription("");
        fetchProposals();
      } catch (error) {
        console.error("Error creating proposal:", error);
      }
    }
  };

  const handleVote = async (proposalId: number, support: boolean) => {
    if (GovernanceContract && GovernanceContract.methods) {
      try {
        await GovernanceContract.methods
          .vote(proposalId, support)
          .send({ from: account });
        fetchProposals();
      } catch (error) {
        console.error("Error voting:", error);
      }
    }
  };
  console.log(proposals);

  return (
    <div className="bg-white shadow rounded-lg p-6 mb-6">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-3xl text-black font-bold">{subgroup.name}</h1>
        {isJoined ? (
          <button
            onClick={onLeave}
            className="border-2 border-red-600 hover:bg-red-800 hover:text-white text-red-500 font-semibold py-1 px-3 rounded text-sm transition-colors duration-300"
          >
            Leave
          </button>
          ) : (
          <button
            onClick={onJoin}
            className="border-2 border-green-400 hover:bg-green-400 hover:text-white text-green-400 font-semibold py-1 px-3 rounded text-sm transition-colors duration-300"
          >
            Join
          </button>
        )}
        <button
          onClick={() => setShowCreatePoll(!showCreatePoll)}
          className="ml-4 border-2 border-blue-400 hover:bg-blue-700 hover:text-white text-blue-400 font-semibold py-1 px-3 rounded text-sm transition-colors duration-300"
        >
          {showCreatePoll ? "Cancel" : "Create Poll"}
        </button>
      </div>

      <p className="text-gray-600 mb-4">
        Subscribers: {subgroup.subscriberCount}
      </p>

      {showCreatePoll && (
        <div className="mb-4 p-4 bg-gray-100 rounded">
          <input
            type="text"
            value={pollDescription}
            onChange={(e) => setPollDescription(e.target.value)}
            placeholder="Poll description"
            className="w-full text-black p-2 mb-2 border rounded"
          />
          
          <button
            onClick={handleCreatePoll}
            className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded"
          >
            Submit Poll
          </button>
        </div>
      )}
  
  <div className="space-y-4">
        <h2 className="text-2xl text-gray-800 font-semibold">Active Polls</h2>
        {filteredProposals.filter(p => !p.executed && p.deadline).map((proposal) => (
          <div key={proposal.id} className="border p-4 rounded">
            <p className="font-semibold text-black">{proposal.description}</p>
            <p className="text-sm text-gray-600">
              Votes For: {Number(proposal.votesFor)} | Votes Against: {Number(proposal.votesAgainst)}
            </p>
            <div className="mt-2">
              <button
                onClick={() => handleVote(proposal.id, true)}
                className="bg-green-500 hover:bg-green-700 text-white font-bold py-1 px-2 rounded mr-2"
              >
                Vote For
              </button>
              <button
                onClick={() => handleVote(proposal.id, false)}
                className="bg-red-500 hover:bg-red-700 text-white font-bold py-1 px-2 rounded mr-2"
              >
                Vote Against
              </button>
            </div>
          </div>
        ))}
      </div>

      <h2 className="text-2xl text-gray-800 font-semibold mt-8">Executed Polls</h2>
      {filteredProposals.filter(p => p.executed).map((proposal) => (
        <div key={proposal.id} className="border p-4 rounded bg-gray-100">
          <p className="font-semibold text-black">{proposal.description}</p>
          <p className="text-sm text-gray-600">
            Final Votes: For: {Number(proposal.votesFor)} | Against: {Number(proposal.votesAgainst)}
          </p>
          <p className="text-green-600 mt-2">This proposal has been executed.</p>
        </div>
      ))}
</div>
    
  );
};

export default SubgroupHeader;