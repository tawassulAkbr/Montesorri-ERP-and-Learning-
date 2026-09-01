import { Outlet } from 'react-router-dom';
import { motion } from 'framer-motion';
import { WifiOff } from 'lucide-react';
import { Sidebar } from './Sidebar';
import { Topbar } from './Topbar';
import { TooltipProvider } from '@/components/ui/tooltip';
import { AssistantPanel } from '@/components/ai/AssistantPanel';
import { useData } from '@/context/DataContext';

export const DashboardLayout: React.FC = () => {
  const { offlineMode, lastSyncedAt, aiEnabled } = useData();

  return (
    <TooltipProvider>
      <div className="flex h-screen bg-slate-50 overflow-hidden">
        <Sidebar />
        <div className="flex-1 flex flex-col overflow-hidden">
          <Topbar />
          {offlineMode && (
            <div className="bg-amber-50 border-b border-amber-200 text-amber-800 text-xs font-medium px-4 py-2 flex items-center gap-2">
              <WifiOff size={14} className="flex-shrink-0" />
              <span>
                You're offline — showing data saved from your last visit
                {lastSyncedAt ? ` (${new Date(lastSyncedAt).toLocaleString()})` : ''}.
                Changes can't be saved until the connection is restored.
              </span>
            </div>
          )}
          <main className="flex-1 overflow-y-auto">
            <motion.div
              key={location.pathname}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.25 }}
              className="p-6 max-w-7xl mx-auto w-full"
            >
              <Outlet />
            </motion.div>
          </main>
        </div>
        {aiEnabled && <AssistantPanel />}
      </div>
    </TooltipProvider>
  );
};
