import React, { useRef } from 'react';
import { X, Save, Mail, Lock, Camera, Upload } from 'lucide-react';

interface ProfileSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const ProfileSettingsModal: React.FC<ProfileSettingsModalProps> = ({ isOpen, onClose }) => {
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      console.log('Selected file:', file);
      // TODO: Implement actual file upload to server
      alert(`Profile picture selected: ${file.name}`);
    }
  };

  const handleResetPassword = () => {
    // TODO: Implement password reset functionality
    alert('Password reset email will be sent to your registered email address.');
    console.log('Password reset requested');
  };

  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 bg-gray-900 bg-opacity-30 backdrop-blur-md flex items-center justify-center z-50"
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
            <div className="w-20 h-20 bg-blue-500 rounded-full flex items-center justify-center text-white text-2xl font-bold shadow-lg group-hover:shadow-xl transition-shadow duration-200 cursor-pointer">
              A
              {/* Hover overlay */}
              <div className="absolute inset-0 bg-black bg-opacity-40 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                <Camera className="w-6 h-6 text-white" />
              </div>
              {/* Hidden file input */}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              />
            </div>
          </div>
          <div className="flex-1">
            <h3 className="font-medium text-gray-800">Admin User</h3>
            <p className="text-sm text-gray-600">admin@example.com</p>
            <button 
              onClick={() => fileInputRef.current?.click()}
              className="mt-2 flex items-center gap-2 text-sm text-blue-600 hover:text-blue-700 transition-colors duration-200"
            >
              <Upload className="w-4 h-4" />
              Change Profile Picture
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
              defaultValue="admin@example.com"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Display Name Field */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Display Name
            </label>
            <input
              type="text"
              defaultValue="Admin User"
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
            className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors duration-200"
          >
            Cancel
          </button>
          <button className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors duration-200 flex items-center gap-2">
            <Save className="w-4 h-4" />
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProfileSettingsModal;