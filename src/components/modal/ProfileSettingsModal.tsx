import React, { useRef, useState, useEffect } from 'react';
import { X, Save, Mail, Lock, Camera, Upload, Loader2 } from 'lucide-react';
import { auth, storage } from '../../firebase';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { updateProfile, sendPasswordResetEmail } from 'firebase/auth';
import Toast, { type ToastType } from '../Toast';

interface ProfileSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface ToastState {
  show: boolean;
  message: string;
  type: ToastType;
}

const ProfileSettingsModal: React.FC<ProfileSettingsModalProps> = ({ isOpen, onClose }) => {
  const [displayName, setDisplayName] = useState('');
  const [email, setEmail] = useState('');
  const [photoURL, setPhotoURL] = useState('');
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<ToastState>({ show: false, message: '', type: 'success' });
  const fileInputRef = useRef<HTMLInputElement>(null);

  const showToast = (message: string, type: ToastType) => {
    setToast({ show: true, message, type });
  };

  const hideToast = () => {
    setToast({ show: false, message: '', type: 'success' });
  };

  // Fetch current user data when modal opens
  useEffect(() => {
    if (isOpen && auth.currentUser) {
      setDisplayName(auth.currentUser.displayName || '');
      setEmail(auth.currentUser.email || '');
      setPhotoURL(auth.currentUser.photoURL || '');
    }
  }, [isOpen]);

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !auth.currentUser) return;

    try {
      setUploading(true);

      // Create a reference to the file in Firebase Storage
      const storageRef = ref(storage, `profile-pictures/${auth.currentUser.uid}/${Date.now()}_${file.name}`);

      // Upload the file
      await uploadBytes(storageRef, file);

      // Get the download URL
      const downloadURL = await getDownloadURL(storageRef);

      // Update the profile with the new photo URL
      await updateProfile(auth.currentUser, {
        photoURL: downloadURL
      });

      // Update local state
      setPhotoURL(downloadURL);

      showToast('Profile picture updated successfully!', 'success');
    } catch (error) {
      console.error('Error uploading profile picture:', error);
      showToast('Failed to upload profile picture. Please try again.', 'error');
    } finally {
      setUploading(false);
    }
  };

  const handleResetPassword = async () => {
    if (!auth.currentUser?.email) {
      showToast('No email address found for this account.', 'error');
      return;
    }

    try {
      await sendPasswordResetEmail(auth, auth.currentUser.email);
      showToast(`Password reset email sent to ${auth.currentUser.email}`, 'success');
    } catch (error) {
      console.error('Error sending password reset email:', error);
      showToast('Failed to send password reset email. Please try again.', 'error');
    }
  };

  const handleSaveChanges = async () => {
    if (!auth.currentUser) return;

    try {
      setSaving(true);

      // Update display name
      await updateProfile(auth.currentUser, {
        displayName: displayName,
      });

      showToast('Profile updated successfully!', 'success');
      setTimeout(() => {
        onClose();
      }, 1000);
    } catch (error) {
      console.error('Error updating profile:', error);
      showToast('Failed to update profile. Please try again.', 'error');
    } finally {
      setSaving(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50"
      onClick={onClose}
    >
      <div 
        className="bg-white rounded-lg shadow-xl w-full max-w-md mx-4 p-6"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-gray-800">Profile Settings</h2>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 rounded-full transition-colors duration-200"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Profile Picture Section */}
        <div className="flex items-center gap-4 mb-6 p-4 bg-gray-50 rounded-lg">
          <div className="relative group">
            {photoURL ? (
              <img
                src={photoURL}
                alt="Profile"
                className="w-20 h-20 rounded-full object-cover shadow-lg group-hover:shadow-xl transition-shadow duration-200"
              />
            ) : (
              <div className="w-20 h-20 bg-blue-500 rounded-full flex items-center justify-center text-white text-2xl font-bold shadow-lg group-hover:shadow-xl transition-shadow duration-200">
                {displayName ? displayName.charAt(0).toUpperCase() : email.charAt(0).toUpperCase()}
              </div>
            )}
            {/* Hover overlay */}
            <div className="absolute inset-0 bg-black bg-opacity-40 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200 cursor-pointer">
              {uploading ? (
                <Loader2 className="w-6 h-6 text-white animate-spin" />
              ) : (
                <Camera className="w-6 h-6 text-white" />
              )}
            </div>
            {/* Hidden file input */}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              disabled={uploading}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            />
          </div>
          <div className="flex-1">
            <h3 className="font-medium text-gray-800">{displayName || 'User'}</h3>
            <p className="text-sm text-gray-600">{email}</p>
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
              className="mt-2 flex items-center gap-2 text-sm text-blue-600 hover:text-blue-700 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {uploading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Uploading...
                </>
              ) : (
                <>
                  <Upload className="w-4 h-4" />
                  Change Profile Picture
                </>
              )}
            </button>
          </div>
        </div>

        {/* Form Fields */}
        <div className="space-y-4">
          {/* Email Field */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Mail className="w-4 h-4 inline mr-2" />
              Email Address
            </label>
            <input
              type="email"
              value={email}
              disabled
              className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-100 text-gray-600 cursor-not-allowed"
            />
            <p className="text-xs text-gray-500 mt-1">Email cannot be changed</p>
          </div>

          {/* Display Name Field */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Display Name
            </label>
            <input
              type="text"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Password Reset Section */}
          <div className="pt-4 border-t border-gray-200">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Lock className="w-4 h-4 inline mr-2" />
              Password
            </label>
            <button 
              onClick={handleResetPassword}
              className="w-full px-3 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors duration-200 text-left"
            >
              Reset Password
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-gray-200">
          <button
            onClick={onClose}
            disabled={saving}
            className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Cancel
          </button>
          <button
            onClick={handleSaveChanges}
            disabled={saving || uploading}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors duration-200 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {saving ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                Save Changes
              </>
            )}
          </button>
        </div>
      </div>

      {/* Toast Notification */}
      {toast.show && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={hideToast}
        />
      )}
    </div>
  );
};

export default ProfileSettingsModal;