import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Empty, EmptyContent, EmptyDescription, EmptyHeader, EmptyTitle } from '@/components/ui/empty';
import { useProductName } from '@/hooks/use-product-name';
import { useMyOrders } from '@/lib/firebase';
import { useTour } from '@/pages/tour/TourController';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router';
import { Header } from '../components/Header';

export default function AimoOrdersPage() {
  const { t } = useTranslation();
  const { fulfillStep } = useTour();
  const getTranslatedProductName = useProductName();

  const myOrders = useMyOrders();

  return (
    <div>
      <Header />
      <div className="hero-container p-4">
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink href="/aimo">{t('warehouse_application')}</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>{t('warehouse_orders')}</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
        <div className="hero mt-4">
          <h1 className={'text-lg font-bold'}>{t('warehouse_orders')}</h1>
          <h3 className={'text-gray-800 dark:text-gray-400'}>{t('warehouse_orders_subtitle')}</h3>
        </div>

        <div className="self-center max-w-4xl flex flex-col gap-4 items-stretch mt-6">
          {myOrders.length ? (
            myOrders.map((order) => {
              const wasPicked = order.products.some((it) => it.pickEvent !== null);
              return (
                <Card
                  key={order.id}
                  data-tour-id={'warehouse-order-item'}
                  className="max-w-4xl warehouse-order-item">
                  <CardHeader>
                    <CardTitle>Order {order.id}</CardTitle>
                    <CardDescription>{order.createdAt.toDate().toLocaleString()}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className={'space-y-4 mt-2'}>
                      {order.products.map((item, index) => {
                        return (
                          <div
                            key={index}
                            className="flex items-center justify-between border-t pt-2 gap-8">
                            <p className="font-medium line-clamp-2 overflow-hidden text-ellipsis me-2">
                              {getTranslatedProductName(item)}
                            </p>

                            <p className="font-medium tabular-nums">Qty: {item.orderedQuantity}</p>
                          </div>
                        );
                      })}
                    </div>
                  </CardContent>
                  <CardFooter>
                    <Button
                      onClick={() => {
                        fulfillStep('warehouse_orders');
                      }}
                      variant={wasPicked ? 'secondary' : 'default'}
                      asChild>
                      <Link to={`/aimo/orders/${order.id}/picking-dashboard`}>
                        {wasPicked ? 'Pick again' : 'Start Picking'}
                      </Link>
                    </Button>
                  </CardFooter>
                </Card>
              );
            })
          ) : (
            <Empty>
              <EmptyHeader>
                <EmptyTitle>No Orders Found</EmptyTitle>
                <EmptyDescription>Please create an order in the Customer Application first.</EmptyDescription>
              </EmptyHeader>
              <EmptyContent>
                <Button asChild>
                  <Link to="/customer">Open Customer Application</Link>
                </Button>
              </EmptyContent>
            </Empty>
          )}
        </div>
      </div>
    </div>
  );
}
