import { AlertTriangle, X } from 'lucide-react';

interface ConfirmDialogProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm: () => void;
  onCancel: () => void;
  type?: 'danger' | 'warning' | 'info';
}

export default function ConfirmDialog({
  isOpen,
  title,
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  onConfirm,
  onCancel,
  type = 'danger',
}: ConfirmDialogProps) {
  if (!isOpen) return null;

  const getColorClasses = () => {
    switch (type) {
      case 'danger':
        return {
          icon: 'text-red-600',
          iconBg: 'bg-red-100',
          confirmBtn: 'bg-red-600 hover:bg-red-700',
        };
      case 'warning':
        return {
          icon: 'text-yellow-600',
          iconBg: 'bg-yellow-100',
          confirmBtn: 'bg-yellow-600 hover:bg-yellow-700',
        };
      case 'info':
        return {
          icon: 'text-blue-600',
          iconBg: 'bg-blue-100',
          confirmBtn: 'bg-blue-600 hover:bg-blue-700',
        };
      default:
        return {
          icon: 'text-red-600',
          iconBg: 'bg-red-100',
          confirmBtn: 'bg-red-600 hover:bg-red-700',
        };
    }
  };

  const colors = getColorClasses();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onCancel}
      ></div>

      {/* Dialog */}
      <div className="relative bg-white rounded-lg shadow-2xl max-w-md w-full mx-4 animate-slideIn">
        {/* Close Button */}
        <button
          onClick={onCancel}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Content */}
        <div className="p-6">
          {/* Icon */}
          <div className={`w-12 h-12 rounded-full ${colors.iconBg} flex items-center justify-center mb-4`}>
            <AlertTriangle className={`h-6 w-6 ${colors.icon}`} />
          </div>

          {/* Title */}
          <h3 className="text-xl font-bold text-gray-900 font-manrope mb-2">
            {title}
          </h3>

          {/* Message */}
          <p className="text-gray-600 font-inter-tight mb-6 leading-relaxed">
            {message}
          </p>

          {/* Buttons */}
          <div className="flex gap-3">
            <button
              onClick={onCancel}
              className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-manrope font-medium"
            >
              {cancelText}
            </button>
            <button
              onClick={onConfirm}
              className={`flex-1 px-4 py-2 text-white rounded-lg transition-colors font-manrope font-medium ${colors.confirmBtn}`}
            >
              {confirmText}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
