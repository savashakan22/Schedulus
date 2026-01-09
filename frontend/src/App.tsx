import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Scheduler } from './pages/Scheduler';

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <div className="min-h-screen bg-slate-50">
        <Scheduler />
      </div>
    </QueryClientProvider>
  );
}

export default App;
