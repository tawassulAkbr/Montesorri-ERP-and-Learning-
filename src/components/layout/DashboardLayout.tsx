import { Outlet } from 'react-router-dom';
import { motion } from 'framer-motion';
import { RefreshCcw, WifiOff } from 'lucide-react';
import { Sidebar } from './Sidebar';
import { Topbar } from './Topbar';
import { TooltipProvider } from '@/components/ui/tooltip';
import { AssistantPanel } from '@/components/ai/AssistantPanel';
import { useData } from '@/context/DataContext';
import { SidebarProvider } from '@/hooks/useSidebar';

export const DashboardLayout: React.FC = () => {
  const { offlineMode, lastSyncedAt, aiEnabled, pendingWrites, lastQueuedAt } = useData();

  return (
    <SidebarProvider>
      <TooltipProvider>
        <div className="h-screen w-screen overflow-hidden bg-white p-0 m-0 text-[#101828]">
          <div className="flex h-full w-full overflow-hidden bg-white">
            <Sidebar />
            <div className="flex min-w-0 flex-1 flex-col overflow-hidden bg-white">
              <Topbar />
              {(offlineMode || pendingWrites > 0) && (
                <div className="mx-5 flex items-center gap-2 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-2 text-xs font-medium text-amber-800">
                  {offlineMode ? <WifiOff size={14} className="flex-shrink-0" /> : <RefreshCcw size={14} className="flex-shrink-0" />}
                  <span>
                    {offlineMode ? 'Offline mode: showing saved data' : 'Sync pending'}
                    {pendingWrites > 0 ? ` - ${pendingWrites} queued write(s)` : ''}
                    {lastQueuedAt ? ` - last queued ${new Date(lastQueuedAt).toLocaleTimeString()}` : lastSyncedAt ? ` - synced ${new Date(lastSyncedAt).toLocaleTimeString()}` : ''}.
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
    </SidebarProvider>
  );
};
