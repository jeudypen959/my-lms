import * as React from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button"; // Assuming you have a custom button component
import Lottie from 'lottie-react'; // Correct import for version 3.x.x and above
import lottieJson from "@/assets/animation/signout.json"; // Path to your Lottie JSON file

const SignOutModal = ({ isOpen, onClose, onConfirm }: { isOpen: boolean, onClose: () => void, onConfirm: () => void }) => {
  return (
    <Dialog.Root open={isOpen} onOpenChange={onClose}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/50" />
        <Dialog.Content className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 p-6 bg-white rounded-lg shadow-lg">
          <Dialog.Close asChild>
            <button className="absolute top-2 right-2 p-1 text-gray-500 hover:text-gray-700">
              <X className="w-5 h-5" />
            </button>
          </Dialog.Close>

          {/* Lottie Animation */}
          <div className="flex justify-center mb-4">
            <Lottie animationData={lottieJson} loop={true} className="w-24 h-24" />
          </div>

          {/* Dialog Title */}
          <Dialog.Title className="text-lg font-semibold text-center">
            You want to sign out?
          </Dialog.Title>

          <div className="mt-4 flex justify-center space-x-4">
            <Button variant="outline" onClick={onClose}>Cancel</Button>
            <Button onClick={onConfirm} className="bg-red-600 text-white hover:bg-red-700">Sign Out</Button>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
};

export default SignOutModal;
