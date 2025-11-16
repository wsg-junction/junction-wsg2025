import App from '@/App.tsx';
import { ThemeProvider } from '@/components/core/theme-provider.tsx';
import { CheckoutPage } from '@/pages/customers/checkout';
import { CheckoutCompletionPage } from '@/pages/customers/checkout-completion';
import CustomerShoppingPage from '@/pages/customers/customer-shopping';
import DashboardPage from '@/pages/dashboard';
import { NotFoundErrorPage } from '@/pages/error-pages/not-found.page.tsx';
import { createBrowserRouter, useParams } from 'react-router';
import AimoHomePage from './pages/aimo';
import AimoOrdersPage from './pages/aimo/orders';
import AimoPickingDashboardPage from './pages/aimo/orders/picking-dashboard';
import AimoPickingDashboardConfirmPage from './pages/aimo/orders/picking-dashboard/confirm';
import AimoWarningsPage from './pages/aimo/warnings';
import CommunicationPreferencesPage from './pages/customers/communication';
import SelectAlternativesPage from './pages/customers/customer-shopping/select-alternatives';
import GeminiPage from './pages/gemini/gemini';
import CustomerOrdersPage from './pages/customers/customer-shopping/orders';

const BUSINESS_ROUTES = [
  {
    index: true,
    Component: DashboardPage,
  },
  {
    path: 'gemini',
    Component: GeminiPage,
  },
  {
    path: 'customer',
    children: [
      {
        path: 'checkout',
        Component: CheckoutPage,
      },
      {
        path: 'checkout/complete/:orderId',
        Component: () => {
          const { orderId } = useParams();
          return <CheckoutCompletionPage orderId={orderId!} />;
        },
      },
      {
        path: 'communication',
        Component: CommunicationPreferencesPage,
      },
      {
        path: 'orders',
        children: [
          {
            index: true,
            Component: CustomerOrdersPage,
          },
          {
            path: ':orderId/select-alternatives',
            Component: SelectAlternativesPage,
          },
        ],
      },
      {
        index: true,
        Component: CustomerShoppingPage,
      },
    ],
  },
  {
    path: 'aimo',
    children: [
      {
        index: true,
        Component: AimoHomePage,
      },
      {
        path: 'orders',
        children: [
          {
            index: true,
            Component: AimoOrdersPage,
          },
          {
            path: ':orderId/picking-dashboard',
            children: [
              {
                index: true,
                Component: AimoPickingDashboardPage,
              },
              {
                path: 'confirm',
                Component: AimoPickingDashboardConfirmPage,
              },
            ],
          },
        ],
      },
      {
        path: 'warnings',
        index: true,
        Component: AimoWarningsPage,
      },
    ],
  },
];

export const ROUTES = createBrowserRouter([
  {
    path: '/',
    element: (
      <ThemeProvider
        defaultTheme={'system'}
        storageKey={'app-theme'}>
        <App></App>
      </ThemeProvider>
    ),
    errorElement: <NotFoundErrorPage></NotFoundErrorPage>,
    children: [...BUSINESS_ROUTES],
  },
]);
