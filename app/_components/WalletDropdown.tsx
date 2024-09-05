import React, { useState, useEffect } from "react";
import { useContract } from "../_contexts/ContractContext"; // Adjust the import path if needed
import Web3 from "web3";

const WalletDropdown: React.FC = () => {
  const { account, setAccount } = useContract();
  const [accounts, setAccounts] = useState<string[]>([]);
  const [selectedAccount, setSelectedAccount] = useState<string>(account);

  useEffect(() => {
    const fetchAccounts = async () => {
      if (typeof window !== "undefined" && window.ethereum) {
        const web3 = new Web3(window.ethereum);
        try {
          const accountsList = await web3.eth.getAccounts();
          setAccounts(accountsList);
          if (accountsList.length > 0 && !selectedAccount) {
            setSelectedAccount(accountsList[0]);
            setAccount(accountsList[0]); // Set the default account initially
          }
        } catch (error) {
          console.error("Error fetching accounts:", error);
        }
      } else {
        console.log("Please install MetaMask!");
      }
    };

    fetchAccounts();
  }, [selectedAccount, setAccount]);

  const handleAccountChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selected = e.target.value;
    setSelectedAccount(selected);
    setAccount(selected);
  };

  return (
    <div className="relative inline-block text-left">
      <select
        value={selectedAccount}
        onChange={handleAccountChange}
        className="block w-full pl-3 pr-10 py-2 text-base text-black border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
      >
        {accounts.map((acc) => (
          <option key={acc} value={acc}>
            {acc}
          </option>
        ))}
      </select>
    </div>
  );
};

export default WalletDropdown;
