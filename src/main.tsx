import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

import { App } from './App';
import { BeginnerPractice } from './BeginnerPractice';
import { InstallmentQuote } from '../practice/2026-09-25/01-installment-quote/working/InstallmentQuote';
import { SavingsAllocation } from '../practice/2026-09-25/02-savings-allocation/working/SavingsAllocation';
import { TicketInbox } from '../practice/2026-10-02/01-ticket-inbox/working/TicketInbox';
import { DocumentEditor } from '../practice/2026-10-02/02-document-editor/working/DocumentEditor';
import { SessionPlanner } from '../practice/2026-10-07/01-session-planner/working/SessionPlanner';
import { ProductSearch } from '../practice/2026-10-07/02-product-search/working/ProductSearch';
import { TransferPage } from '../practice/2026-09-21/04-scheduled-transfers/working/TransferPage';
import './styles.css';

const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });

async function start() {
  if (import.meta.env.DEV) {
    const { worker } = await import('./mocks/browser');
    await worker.start({ onUnhandledRequest: 'bypass' });
  }

  createRoot(document.getElementById('root')!).render(
    <StrictMode>
      <QueryClientProvider client={queryClient}>
        {window.location.pathname === '/practice/installments' ? (
          <InstallmentQuote />
        ) : window.location.pathname === '/practice/savings' ? (
          <SavingsAllocation />
        ) : window.location.pathname === '/practice/tickets' ? (
          <TicketInbox />
        ) : window.location.pathname === '/practice/documents' ? (
          <DocumentEditor />
        ) : window.location.pathname === '/practice/sessions' ? (
          <SessionPlanner />
        ) : window.location.pathname === '/practice/products' ? (
          <ProductSearch />
        ) : window.location.pathname === '/practice/basics' ? (
          <BeginnerPractice />
        ) : window.location.pathname === '/practice/transfers' ? (
          <TransferPage />
        ) : (
          <App />
        )}
      </QueryClientProvider>
    </StrictMode>,
  );
}

void start();
