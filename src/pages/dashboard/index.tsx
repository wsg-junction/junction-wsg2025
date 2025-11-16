import { useTranslation } from 'react-i18next';
import { Header } from '@/pages/customers/components/Header/Header.tsx';
import { Card, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card.tsx';
import { InfoIcon, ShoppingCart, WarehouseIcon } from 'lucide-react';
import { Button } from '@/components/ui/button.tsx';
import { Link, useNavigate } from 'react-router';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert.tsx';
import { useTour } from '@/pages/tour/TourController.tsx';

export default function DashboardPage() {
  const { t } = useTranslation();
  const { fulfillStep } = useTour();
  const onStartTour = () => {
    localStorage.setItem('tourStep', '0');
    window.location.reload();
  };

  return (
    <div>
      <Header />
      <div className="flex flex-col gap-4 justify-center items-center md:items-center p-4 max-w-2xl mx-auto">
        <h1 className={'text-xl bold text-center'}>Hello Stranger!</h1>
        <p className={'text-'}>
          Welcome to our Submission for the Valio Aimo Challenge. We implemented two applications:
          <br />
          <br />
          <b>Warehouse Application</b> to help warehouse staff pick products and report missing items. <br />
          <b>Customer Application</b> to help customers place orders and get notified about product
          availability.
          <br />
          <br />
          Please use the cards below to navigate to the respective applications, or start the tour to get a
          quick overview of the features.
        </p>
        <Button
          onClick={onStartTour}
          variant={'default'}
          className={'mt-2'}>
          Start Tour
        </Button>
        <Alert className="border-blue-200 bg-blue-50 text-blue-800 dark:border-blue-800 dark:bg-yellow-950/30 dark:blue [&>svg]:text-blue-600 dark:[&>svg]:text-blue-400">
          <InfoIcon />
          <AlertTitle>We suggest using the Tour!</AlertTitle>
          <AlertDescription className="text-blue-700 dark:text-blue-300">
            If you are new to the applications, we highly recommend starting the guided tour to familiarize
            yourself with the features and functionalities available.
          </AlertDescription>
        </Alert>
      </div>
      <div className="flex flex-col md:flex-row gap-4 justify-center items-center md:items-stretch p-4">
        <Card
          className="w-xs"
          data-tour-id="select_customer_app">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ShoppingCart /> Customer Application
            </CardTitle>
            <CardDescription>
              This application allows customers to place orders and get notified about product availability.
            </CardDescription>
          </CardHeader>
          <div className="flex-1 -mt-6"></div>
          <CardFooter>
            <Button
              asChild
              onClick={() => {
                fulfillStep('select_customer_app');
              }}
              variant={'link'}>
              <Link to="/customer">Go to Customer Application</Link>
            </Button>
          </CardFooter>
        </Card>{' '}
        <Card
          className="w-xs"
          data-tour-id="select_warehouse_app">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <WarehouseIcon />
              Warehouse Application
            </CardTitle>
            <CardDescription>
              This application shows warehouse staff which products to pick so they can fulfill customer
              orders. While picking, they need to enter information about missing items.
            </CardDescription>
          </CardHeader>
          <div className="flex-1 -mt-6"></div>
          <CardFooter>
            <Button
              asChild
              onClick={() => {
                fulfillStep('select_warehouse_app');
              }}
              variant={'link'}>
              <Link to="/aimo">Go to Warehouse Application</Link>
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
