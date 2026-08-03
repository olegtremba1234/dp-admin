import type { ReactNode } from 'react';
import { X } from 'lucide-react';

interface ModalProps {
  title: string;
  isOpen: boolean;
  onClose: () => void;
  children: ReactNode;
  width?: 'md' | 'lg' | 'xl';
}

const widths: Record<string, string> = {
  md: 'max-w-md',
  lg: 'max-w-xl',
  xl: 'max-w-3xl',
};

export default function Modal({ title, isOpen, onClose, children, width = 'lg' }: ModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-navy-950/50 p-4 py-10 backdrop-blur-sm">
      <div className={`w-full ${widths[width]} rounded-xl bg-white shadow-xl`}>
        <div className="flex items-center justify-between border-b border-navy-100 px-5 py-4">
          <h2 className="text-base font-bold text-navy-900">{title}</h2>
          <button onClick={onClose} className="rounded-md p-1 text-navy-400 hover:bg-navy-50 hover:text-navy-700">
            <X size={20} />
          </button>
        </div>
        <div className="p-5">{children}</div>
      </div>
    </div>
  );
}
