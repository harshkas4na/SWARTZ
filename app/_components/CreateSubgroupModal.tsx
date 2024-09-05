import { useState } from "react";

interface CreateSubgroupModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (name: string) => void;
}

const CreateSubgroupModal: React.FC<CreateSubgroupModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
}) => {
  const [subgroupName, setSubgroupName] = useState("");

  const handleFormSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    onSubmit(subgroupName);
    setSubgroupName("");
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full"
      id="my-modal"
    >
      <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
        <div className="mt-3 text-center">
          <h3 className="text-lg leading-6 font-medium text-gray-900">
            Create Subgroup
          </h3>
          <form onSubmit={handleFormSubmit} className="mt-2 px-7 py-3">
            <input
              type="text"
              value={subgroupName}
              onChange={(e) => setSubgroupName(e.target.value)}
              placeholder="Subgroup Name"
              className="mt-2 px-3 py-2 bg-white border text-black shadow-sm border-slate-300 placeholder-slate-400 focus:outline-none focus:border-sky-500 focus:ring-sky-500 block w-full rounded-md sm:text-sm focus:ring-1"
              required
            />
            <div className="items-center px-4 py-3">
              <button
                onClick={onClose}
                className="px-4 py-2 bg-gray-500 text-white text-base font-medium rounded-md w-full shadow-sm hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-300"
              >
                Close
              </button>
              <button
                type="submit"
                className="mt-3 px-4 py-2 bg-orange-400 text-white text-base font-medium rounded-md w-full shadow-sm hover:bg-orange-600 focus:outline-none focus:ring-2 focus:ring-orange-200"
              >
                Create Subgroup
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CreateSubgroupModal;
