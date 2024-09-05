"use client";

import React, { createContext, useState, useContext, useEffect } from 'react';
import Web3 from 'web3';
import { GovernanceAddress, contractAddress } from '../_web3';
import Swartz_ABI from '../_web3/ABIS/Swartz_ABI.json';
import Governance_ABI from '../_web3/ABIS/Governance_ABI.json';

declare global {
  interface Window {
    ethereum: any;
  }
}

interface ContractContextType {
  account: any;
  setAccount: (account: any) => void;
  contract: any;
  setContract: (contract: any) => void;
  GovernanceContract: any;
  setGovernanceContract: (contract: any) => void;
}

export const ContractContext = createContext<ContractContextType | undefined>(
  undefined
);

export const ContractProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [contract, setContract] = useState<any>(null);
  const [account, setAccount] = useState<any>(null);
  const [GovernanceContract, setGovernanceContract] = useState<any>(null);

  useEffect(() => {
    const initializeContract = async () => {
      if (typeof window !== "undefined" && window.ethereum) {
        try {
          
          // Request account access
          const accounts = await window.ethereum.request({
            method: "eth_requestAccounts",
          });
          setAccount(accounts[0]);
          const web3 = new Web3(window.ethereum);
          // Create contract instance
          const contractInstance = new web3.eth.Contract(
            Swartz_ABI as any,
            contractAddress
          );
          setContract(contractInstance);

          const GovernanceContractInstance = new web3.eth.Contract(Governance_ABI as any, GovernanceAddress);
          setGovernanceContract(GovernanceContractInstance);

        } catch (error) {
          console.error("Error initializing contract:", error);
        }
      } else {
        console.log("Please install MetaMask!");
      }
    };

    initializeContract();
  }, []);

  return (
    <ContractContext.Provider value={{account,setAccount,contract, setContract,GovernanceContract,setGovernanceContract}}>
      {children}
    </ContractContext.Provider>
  );
};

export const useContract = () => {
  const context = useContext(ContractContext);
  if (context === undefined) {
    throw new Error("useContract must be used within a ContractProvider");
  }
  return context;
};