import { Outlet } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Sidebar } from './Sidebar';
import { Topbar } from './Topbar';
import { TooltipProvider } from '@/components/ui/tooltip';

export const DashboardLayout: React.FC = () => {
  return (
    <TooltipProvider>
      <div className="flex h-screen bg-slate-50 overflow-hidden">
        <Sidebar />
        <div className="flex-1 flex flex-col overflow-hidden">
          <Topbar />
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
      </div>
    </TooltipProvider>
  );
};
