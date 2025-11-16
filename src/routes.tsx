import { createBrowserRouter } from 'react-router';
import App from '@/App.tsx';
import DashboardPage from '@/pages/dashboard';
import { ThemeProvider } from '@/components/core/theme-provider.tsx';
import { NotFoundErrorPage } from '@/pages/error-pages/not-found.page.tsx';
import AimoPickingDashboardPage from './pages/aimo/orders/picking-dashboard';
import AimoPickingDashboardConfirmPage from './pages/aimo/orders/picking-dashboard/confirm';
import CustomerShoppingPage from '@/pages/customers/customer-shopping';
import { CheckoutPage } from '@/pages/customers/checkout';
import SelectAlternativesPage from './pages/customers/customer-shopping/select-alternatives';
import AimoWarningsPage from "./pages/aimo/warnings";
import AimoHomePage from "./pages/aimo";
import GeminiPage from "./pages/gemini/gemini";
import CommunicationPreferencesPage from "./pages/customers/communication";
import TourController from './pages/tour/TourController';
import OrdersPage from './pages/aimo/orders';

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
        path: 'select-alternatives',
        Component: SelectAlternativesPage,
      },
      {
        path: 'checkout',
        Component: CheckoutPage,
      },
      {
        path: 'communication',
        Component: CommunicationPreferencesPage,
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
            Component: OrdersPage,
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
            ]
          }
        ]
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
