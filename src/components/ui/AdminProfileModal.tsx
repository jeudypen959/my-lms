import React, { useState, useEffect, useCallback } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { updateDoc, doc, getDoc, setDoc } from "firebase/firestore";
import { db } from "@/config/firebaseConfig";
import { DropdownMenuItem } from "./dropdown-menu";

// Define the shape of the form data
interface AdminFormData {
  username: string;
  email: string;
  role: string;
  imgProfile: string;
}

// Define the props interface for the component
interface ProfileModalProps {
  adminId: string;
}

const ProfileModal: React.FC<ProfileModalProps> = ({ adminId }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [formData, setFormData] = useState<AdminFormData>({
    username: "",
    email: "",
    role: "",
    imgProfile: "",
  });

  // Fetch admin info from Firestore with useCallback to avoid dependency issues
  const fetchAdminInfo = useCallback(async () => {
    try {
      const adminDocRef = doc(db, "adminInfo", adminId);
      const adminDocSnap = await getDoc(adminDocRef);
      
      if (adminDocSnap.exists()) {
        const data = adminDocSnap.data();
        setFormData({
          username: data.username || "",
          email: data.email || "",
          role: data.role || "",
          imgProfile: data.imgProfile || "",
        });
      }
    } catch (error) {
      console.error("Error fetching admin info:", error);
    }
  }, [adminId]);

  // Fetch admin info when the modal opens
  useEffect(() => {
    if (isOpen) {
      fetchAdminInfo();
    }
  }, [isOpen, fetchAdminInfo]);

  const handleSave = async () => {
    const adminDocRef = doc(db, "adminInfo", adminId);
    
    try {
      const docSnap = await getDoc(adminDocRef);
      
      // Convert formData to a plain object for Firestore
      const dataToUpdate = {
        username: formData.username,
        email: formData.email,
        role: formData.role,
        imgProfile: formData.imgProfile,
      };
      
      if (docSnap.exists()) {
        await updateDoc(adminDocRef, dataToUpdate);
      } else {
        await setDoc(adminDocRef, dataToUpdate); // Creates a new document
      }
      setIsOpen(false); // Close the modal after saving
      alert("Profile updated successfully!");
    } catch (error) {
      console.error("Error updating profile:", error);
      alert("Failed to update profile.");
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <DropdownMenuItem onSelect={() => setIsOpen(true)}>
          Profile
        </DropdownMenuItem>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Admin Profile</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <Input
            placeholder="Username"
            value={formData.username}
            onChange={(e) => setFormData({ ...formData, username: e.target.value })}
          />
          <Input
            placeholder="Email"
            type="email"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          />
          <Select
            value={formData.role}
            onValueChange={(value) => setFormData({ ...formData, role: value })}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select Role" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="admin">Admin</SelectItem>
              <SelectItem value="editor">Editor</SelectItem>
              <SelectItem value="instructor">Instructor</SelectItem>
            </SelectContent>
          </Select>
          <Input
            placeholder="Profile Image URL"
            value={formData.imgProfile}
            onChange={(e) => setFormData({ ...formData, imgProfile: e.target.value })}
          />
        </div>
        <DialogFooter>
          {/* Using button element directly instead of the Button component */}
          <button 
            type="button" 
            className="bg-primary text-primary-foreground hover:bg-primary/90 px-4 py-2 rounded-md"
            onClick={handleSave}
          >
            Save Changes
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ProfileModal;