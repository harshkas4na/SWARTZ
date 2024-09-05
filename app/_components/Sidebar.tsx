/* eslint-disable react-hooks/exhaustive-deps */
"use client";
import Image from "next/image";
import Link from "next/link";
import { useState, useEffect } from "react";
import CreateSubgroupModal from "./CreateSubgroupModal";
import { useContract } from "../_contexts/ContractContext";
import { Subgroup } from "@/types";
import WalletDropdown from "./WalletDropdown";

const Sidebar = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [subscribedSubgroups, setSubscribedSubgroups] = useState<Subgroup[]>(
    []
  );
  const [allSubgroups, setAllSubgroups] = useState<Subgroup[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const { contract, account } = useContract();

  useEffect(() => {
    fetchSubgroups();
  }, [contract, account]);

  const fetchSubgroups = async () => {
    if (!contract || !account) return;

    try {
      const subgroupCount = await contract.methods.subgroupCount().call();
      const groups: Subgroup[] = [];

      for (let i = 1; i <= subgroupCount; i++) {
        const subgroup = await contract.methods.getSubgroup(i).call();

        groups.push({
          id: i.toString(),
          name: subgroup._name,
          subscriberCount: parseInt(subgroup._subscriberCount),
          // You might want to add an icon based on the subgroup name or use a default one
          icon: "🔹",
        });
      }

      setAllSubgroups(groups);
    } catch (error) {
      console.error("Error fetching subgroups:", error);
    }
  };

  const handleCreateSubgroup = async (name: string) => {
    if (!contract || !account) return;

    try {
      await contract.methods.createSubgroup(name).send({ from: account });
      console.log(`Creating subgroup: ${name}`);
      setIsModalOpen(false);
      // Refresh the subgroups list after creating a new one
      fetchSubgroups();
    } catch (error) {
      console.error("Error creating subgroup:", error);
    }
  };

  useEffect(() => {
    fetchSubscribedGroups();
  }, [contract, account]);

  const fetchSubscribedGroups = async () => {
    if (!contract || !account) return;
    try {
      const userData = await contract.methods.getUser(account).call();
      const groups: Subgroup[] = [];

      for (let i = 1; i <= userData._subgroupsJoined.length; i++) {
        const subgroup = await contract.methods.getSubgroup(i).call();

        groups.push({
          id: i.toString(),
          name: subgroup._name,
          subscriberCount: parseInt(subgroup._subscriberCount),
          // You might want to add an icon based on the subgroup name or use a default one
          icon: "🔹",
        });
      }

      setSubscribedSubgroups(groups);
    } catch {}
  };

  // Filter subgroups based on search term
  const filteredSubgroups = allSubgroups.filter((group) =>
    group.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <>
      <div className="w-64 bg-slate-100 shadow-md h-screen flex flex-col">
        <div className="flex justify-between items-center p-4 border-b border-gray-200">
          <Image
            src="/logo.png"
            alt="Platform Logo"
            width={900}
            height={40}
            quality={100}
          />
        </div>
        <nav className="flex-1 overflow-y-auto py-4">
          <Link
            href="/"
            className="flex items-center px-4 py-2 text-gray-700 hover:bg-blue-100 hover:text-blue-600 transition-colors duration-200"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-12 w-8 mr-3"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
              />
            </svg>
            Home
          </Link>
          <div className="mt-8">
            <h3 className="px-4 mb-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">
              Sub-Groups Joined
            </h3>
            <ul>
              {subscribedSubgroups.map((group) => (
                <li key={group.id}>
                  <Link
                    href={`/subgroups/${group.id}`}
                    className="flex items-center px-4 py-2 text-gray-700 hover:bg-blue-100 hover:text-blue-600 transition-colors duration-200"
                  >
                    <span className="mr-3 text-xl">{group.icon}</span>
                    {group.name} ({group.subscriberCount})
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <div className="mt-8">
            <h3 className="px-4 mb-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">
              All Groups
            </h3>
            <input
              type="text"
              placeholder="Search groups..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-2 mb-4 border rounded-md text-gray-500"
            />
            <ul>
              {filteredSubgroups.map((group) => (
                <li key={group.id}>
                  <Link
                    href={`/subgroups/${group.id}`}
                    className="flex items-center px-4 py-2 text-gray-700 hover:bg-blue-100 hover:text-blue-600 transition-colors duration-200"
                  >
                    <span className="mr-3 text-xl">{group.icon}</span>
                    {group.name} ({group.subscriberCount})
                  </Link>
                </li>
              ))}
            </ul>
            <button
              onClick={() => setIsModalOpen(true)}
              className="w-[1/3] ml-10 mt-4 bg-transparent border-2 border-orange-300 text-orange-300 font-medium py-1 px-3 rounded-md shadow-sm transition-all duration-200 hover:bg-orange-300 hover:text-gray-800"
            >
              Create Subgroup
            </button>
          </div>
        </nav>
        <div className="p-4 border-t border-gray-200">
          <Link
            href="/profile"
            className="flex items-center text-gray-700 hover:text-blue-600 transition-colors duration-200"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5 mr-3"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
              />
            </svg>
            Profile
          </Link>
        </div>
      </div>

      <CreateSubgroupModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleCreateSubgroup}
      />
    </>
  );
};

export default Sidebar;
