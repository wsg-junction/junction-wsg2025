import { createBrowserRouter } from "react-router";
import App from "@/App.tsx";
import DashboardPage from "@/pages/dashboard";
import { ThemeProvider } from "@/components/core/theme-provider.tsx";
import { NotFoundErrorPage } from "@/pages/error-pages/not-found.page.tsx";
import AimoPickingDashboardPage from "./pages/aimo/picking-dashboard";
import AimoPickingDashboardConfirmPage from "./pages/aimo/picking-dashboard/confirm";
import CustomerShoppingPage from '@/pages/customers/customer-shopping';
import MapPage from './pages/dashboard/map';
import AimoWarningsPage from "./pages/aimo/warnings";

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
    children: [
      {
        index: true,
        Component: DashboardPage,
      },
      {
        path: 'customer',
        children: [
          {
            index: true,
            Component: CustomerShoppingPage,
          },
        ],
      },
      {
        path: 'map',
        element: <MapPage />,
      },
      {
        path: 'aimo',
        children: [
          {
            path: 'dashboard',
            children: [
              {
                index: true,
                Component: AimoPickingDashboardPage,
              },
              {
                path: 'confirm',
                Component: AimoPickingDashboardConfirmPage,
              }
            ],
          },
          {
            path: 'warnings',
            index: true,
            Component: AimoWarningsPage,
          }
        ]
      }
    ],
  },
]);
