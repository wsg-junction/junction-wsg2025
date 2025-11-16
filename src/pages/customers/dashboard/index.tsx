import { Header } from '@/pages/customers/components/Header/Header.tsx';
import { Breadcrumb, BreadcrumbItem, BreadcrumbList, BreadcrumbPage } from '@/components/ui/breadcrumb.tsx';
import { useTranslation } from 'react-i18next';
import { Card, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card.tsx';
import { Settings, ShoppingBasket, ShoppingCart } from 'lucide-react';
import { Button } from '@/components/ui/button.tsx';
import { Link } from 'react-router';

export const CustomerDashboardPage = () => {
  const { t } = useTranslation();
  return (
    <div>
      <Header />
      <div className="hero-container p-4">
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbPage>{t('shop')}</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
        <div className="hero mt-4">
          <h1 className={'text-lg font-bold'}>{t('customer_dashboard')}</h1>
          <h3 className={'text-gray-800 dark:text-gray-400'}>{t('customer_dashboard_welcome_message')}</h3>
        </div>
        <div className={'flex flex-wrap gap-4 mt-6'}>
          <Card
            className="w-xs"
            data-tour-id="select_browse_catalog">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ShoppingCart /> Store Catalog
              </CardTitle>
              <CardDescription>
                Browse and select products from our extensive catalog tailored to your needs.
              </CardDescription>
            </CardHeader>
            <div className="flex-1 -mt-6"></div>
            <CardFooter>
              <Button
                asChild
                variant={'link'}>
                <Link to="/customer/browse">Go to Catalog</Link>
              </Button>
            </CardFooter>
          </Card>

          <Card
            className="w-xs"
            data-tour-id="select_my_orders">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ShoppingBasket /> My Orders
              </CardTitle>
              <CardDescription>View and manage your past and current orders with ease.</CardDescription>
            </CardHeader>
            <div className="flex-1 -mt-6"></div>
            <CardFooter>
              <Button
                asChild
                variant={'link'}>
                <Link to="/customer/orders">Go to My Orders</Link>
              </Button>
            </CardFooter>
          </Card>

          <Card
            className="w-xs"
            data-tour-id="select_my_orders">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings /> Notification Settings
              </CardTitle>
              <CardDescription>
                Manage your communication preferences and notification settings.
              </CardDescription>
            </CardHeader>
            <div className="flex-1 -mt-6"></div>
            <CardFooter>
              <Button
                asChild
                variant={'link'}>
                <Link to="/customer/communication">Go to Notification Settings</Link>
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  );
};
