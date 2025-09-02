import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { CrisisStateProvider } from "@/hooks/useCrisisState";
import { CrisisLayout } from "@/components/CrisisLayout";

const App = () => {
  return (
    <CrisisStateProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="/*" element={<CrisisLayout />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </CrisisStateProvider>
  );
};

export default App;