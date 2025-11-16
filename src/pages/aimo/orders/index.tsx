import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useProductName } from '@/hooks/use-product-name';
import { useMyOrders } from '@/lib/firebase';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router';
import { Header } from '../components/Header';
import { Empty, EmptyContent, EmptyDescription, EmptyHeader, EmptyTitle } from '@/components/ui/empty';
import { useTour } from '@/pages/tour/TourController.tsx';

export default function AimoOrdersPage() {
  const { t } = useTranslation();
  const { fulfillStep } = useTour();
  const getTranslatedProductName = useProductName();

  const myOrders = useMyOrders();

  return (
    <div className="flex flex-col">
      <Header />
      <div className="self-center max-w-4xl flex flex-col gap-4 items-stretch p-8">
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
  );
}
