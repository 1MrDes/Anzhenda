import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter, Route } from 'react-router-dom';
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AnimatedRoutes } from "@/components/AnimatedRoutes";
import { PageTransition } from "@/components/PageTransition";
import { BottomNav } from "@/components/layout/BottomNav";
import { VoiceAssistant } from "@/components/layout/VoiceAssistant";
import Index from "./pages/Index";
import Booking from "./pages/Booking";
import CompanionDetail from "./pages/CompanionDetail";
import Tracking from "./pages/Tracking";
import Orders from "./pages/Orders";
import Payment from "./pages/Payment";
import Family from "./pages/Family";
import Profile from "./pages/Profile";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60 * 1000,
      gcTime: 5 * 60 * 1000,
      retry: 1,
      refetchOnWindowFocus: false,
      refetchOnReconnect: false,
    },
    mutations: {
      retry: 1,
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <BrowserRouter>
          <AnimatedRoutes>
            <Route path="/" data-genie-title="首页" data-genie-key="Home" element={<PageTransition transition="slide-up"><Index /></PageTransition>} />
            <Route path="/booking" data-genie-title="服务预约" data-genie-key="Booking" element={<PageTransition transition="slide-up"><Booking /></PageTransition>} />
            <Route path="/companion/:id" data-genie-title="陪诊员详情" data-genie-key="CompanionDetail" element={<PageTransition transition="slide-fade"><CompanionDetail /></PageTransition>} />
            <Route path="/tracking" data-genie-title="订单追踪" data-genie-key="Tracking" element={<PageTransition transition="slide-up"><Tracking /></PageTransition>} />
            <Route path="/orders" data-genie-title="我的订单" data-genie-key="Orders" element={<PageTransition transition="slide-up"><Orders /></PageTransition>} />
            <Route path="/payment" data-genie-title="确认支付" data-genie-key="Payment" element={<PageTransition transition="slide-up"><Payment /></PageTransition>} />
            <Route path="/family" data-genie-title="家庭关怀" data-genie-key="Family" element={<PageTransition transition="slide-up"><Family /></PageTransition>} />
            <Route path="/profile" data-genie-title="个人中心" data-genie-key="Profile" element={<PageTransition transition="slide-up"><Profile /></PageTransition>} />
            <Route path="*" data-genie-key="NotFound" data-genie-title="页面未找到" element={<PageTransition transition="fade"><NotFound /></PageTransition>} />
          </AnimatedRoutes>
          <BottomNav />
          <VoiceAssistant />
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App
