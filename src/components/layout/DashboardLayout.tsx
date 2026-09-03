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
      <div className="h-screen w-screen overflow-hidden bg-white p-0 m-0 text-[#101828]">
        <div className="flex h-full w-full overflow-hidden bg-white">
          <Sidebar />
          <div className="flex min-w-0 flex-1 flex-col overflow-hidden bg-white">
            <Topbar />
            {offlineMode && (
              <div className="mx-5 flex items-center gap-2 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-2 text-xs font-medium text-amber-800">
                <WifiOff size={14} className="flex-shrink-0" />
                <span>
                  You're offline. Showing data saved from your last visit
                  {lastSyncedAt ? ` (${new Date(lastSyncedAt).toLocaleString()})` : ''}.
                </span>
              </div>
            )}
            <main className="flex-1 overflow-y-auto bg-[#FBFEFD]">
              <motion.div
                key={location.pathname}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.25 }}
                className="mx-auto w-full max-w-7xl p-5 lg:p-7"
              >
                <Outlet />
              </motion.div>
            </main>
          </div>
        </div>
        {aiEnabled && <AssistantPanel />}
      </div>
    </TooltipProvider>
  );
};
