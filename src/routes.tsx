import { createBrowserRouter } from 'react-router';
import App from '@/App.tsx';
import DashboardPage from '@/pages/dashboard';
import { ThemeProvider } from '@/components/core/theme-provider.tsx';
import { NotFoundErrorPage } from '@/pages/error-pages/not-found.page.tsx';
import CustomerShoppingPage from '@/pages/customers/customer-shopping';
import { CheckoutPage } from '@/pages/customers/checkout';

export const ROUTES = createBrowserRouter([
    {
        path: '/',
        element: (
            <ThemeProvider
                defaultTheme={'dark'}
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
                    {
                        path: 'checkout',
                        Component: CheckoutPage,
                    },
                ],
            },
        ],
    },
]);
