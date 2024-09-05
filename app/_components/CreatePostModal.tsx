// components/CreatePostModal.tsx
import React, { useState } from "react";
import Image from "next/image";
import { useContract } from "../_contexts/ContractContext";
import { JWT_SECRET_ACCESS_TOKEN } from "../../app/config";

interface CreatePostModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const CreatePostModal: React.FC<CreatePostModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [subgroups, setSubgroups] = useState<string>("");
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const { contract, account } = useContract();

  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedImage(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleImageUpload = async (file: File): Promise<string | null> => {
    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch(
        "https://api.pinata.cloud/pinning/pinFileToIPFS",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${JWT_SECRET_ACCESS_TOKEN}`,
          },
          body: formData,
        }
      );

      if (!res.ok) {
        throw new Error("Failed to upload image to IPFS");
      }

      const resData = await res.json();
      console.log("IPFS response:", resData);
      return resData.IpfsHash;
    } catch (error) {
      console.error("Error uploading file to IPFS:", error);
      return null;
    }
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!contract || !account) return;
    setIsLoading(true);

    try {
      let imageHash = "";
      if (selectedImage) {
        imageHash = (await handleImageUpload(selectedImage)) || "";
      }

      const subgroupIds = subgroups
        .split(",")
        .map((id) => parseInt(id.trim()))
        .filter((id) => !isNaN(id));

      await contract.methods
        .createPost(title, subgroupIds, description, imageHash)
        .send({ from: account });
      onClose();
      // Reset form
      setTitle("");
      setDescription("");
      setSubgroups("");
      setSelectedImage(null);
      setPreviewUrl(null);
    } catch (error) {
      console.error("Error creating post:", error);
      alert("Failed to create post. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full">
      <div className="relative top-20 mx-auto p-5 border w-4/6 shadow-lg rounded-md bg-white">
        <div className="mt-3 text-center">
          <h3 className="text-lg leading-6 font-medium text-gray-900">
            Create Post
          </h3>
          <form onSubmit={handleSubmit} className="mt-2 px-7 py-3">
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Title"
              className="mt-2 px-3 py-2 bg-white border text-black shadow-sm border-slate-300 placeholder-slate-400 focus:outline-none focus:border-sky-500 focus:ring-sky-500 block w-full rounded-md sm:text-sm focus:ring-1"
              required
            />
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Description"
              className="mt-2 px-3 py-2 size-64 bg-white border text-black shadow-sm border-slate-300 placeholder-slate-400 focus:outline-none focus:border-sky-500 focus:ring-sky-500 block w-full rounded-md sm:text-sm focus:ring-1"
              required
            />
            <input
              type="text"
              value={subgroups}
              onChange={(e) => setSubgroups(e.target.value)}
              placeholder="Subgroup IDs (comma-separated)"
              className="mt-2 px-3 py-2 bg-white border text-black shadow-sm border-slate-300 placeholder-slate-400 focus:outline-none focus:border-sky-500 focus:ring-sky-500 block w-full rounded-md sm:text-sm focus:ring-1"
              required
            />
            
            <div className="mt-2 flex">
              <label className="text-sm font-medium text-gray-700 mb-2 ">
                Post Image
              </label>
              <input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-orange-50 file:text-orange-700 hover:file:bg-orange-100"
              />
              {previewUrl && (
                <div className="mt-4">
                  <Image
                    src={previewUrl}
                    alt="Post Image Preview"
                    width={100}
                    height={100}
                    className="rounded-lg"
                  />
                </div>
              )}
            </div>
            <div className="items-center px-4 py-3">
              <button
                onClick={onClose}
                className="px-4 py-2 mr-4 bg-gray-500 text-white text-base font-medium rounded-md w-48 shadow-sm hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-300"
                type="button"
                disabled={isLoading}
              >
                Close
              </button>
              <button
                type="submit"
                className="mt-3 px-4 py-2 bg-blue-500 text-white text-base w-48 font-medium rounded-md shadow-sm hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-300"
                disabled={isLoading}
              >
                {isLoading ? "Creating Post..." : "Create Post"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CreatePostModal;
