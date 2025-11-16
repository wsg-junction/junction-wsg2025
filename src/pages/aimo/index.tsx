import { Card, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Header } from './components/Header';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router';
import { TriangleAlertIcon, WarehouseIcon } from 'lucide-react';
import { useTour } from '@/pages/tour/TourController.tsx';
import { useTranslation } from 'react-i18next';

export default function AimoHomePage() {
  const { t } = useTranslation();
  const { fulfillStep } = useTour();

  return (
    <>
      <Header />
      <div className="hero-container p-4">
        <div className="hero mt-4">
          <h1 className={'text-lg font-bold'}>{t('warehouse_dashboard')}</h1>
          <h3 className={'text-gray-800 dark:text-gray-400'}>{t('warehouse_dashboard_welcome_message')}</h3>
        </div>

        <div className={'flex flex-wrap gap-4 mt-6'}>
          <Card
            className="w-xs"
            data-tour-id="nav_orders">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <WarehouseIcon />
                Orders
              </CardTitle>
              <CardDescription>
                This dashboard shows warehouse staff which products to pick so they can fulfill customer
                orders. While picking, they need to enter information about missing items.
              </CardDescription>
            </CardHeader>
            <div className="flex-1 -mt-6"></div>
            <CardFooter>
              <Button
                asChild
                variant={'link'}
                onClick={() => fulfillStep('select_warehouse_orders')}>
                <Link to="/aimo/orders">{t('warehouse_go_to_orders')}</Link>
              </Button>
            </CardFooter>
          </Card>
          <Card className="w-xs">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TriangleAlertIcon /> Warnings Overview
              </CardTitle>
              <CardDescription>
                View warnings about product availabilities and other issues that need attention.
              </CardDescription>
            </CardHeader>
            <div className="flex-1 -mt-6"></div>
            <CardFooter>
              <Button
                asChild
                variant={'link'}>
                <Link to="/aimo/warnings">{t('warehouse_go_to_warnings_overview')}</Link>
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>
    </>
  );
}
