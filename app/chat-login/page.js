// app/chat-login/page.js

import VisitorForm from '@/components/auth/VisitorForm';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export default function ChatLoginPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 dark:bg-zinc-950 p-4">
      <div className="w-full max-w-md mb-6">
        <Link
          href="/"
          className="flex items-center gap-2 text-gray-500 hover:text-blue-600 transition-colors"
        >
          <ArrowLeft size={18} /> Voltar para o Portal
        </Link>
      </div>

      <VisitorForm />
    </div>
  );
}
