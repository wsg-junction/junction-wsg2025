import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useProductName } from '@/hooks/use-product-name';
import { useMyOrders } from '@/lib/firebase';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router';
import { Header } from '../components/Header';
import { Empty, EmptyContent, EmptyDescription, EmptyHeader, EmptyTitle } from '@/components/ui/empty';

export default function OrdersPage() {
  const { t } = useTranslation();
  const getTranslatedProductName = useProductName();

  const myOrders = useMyOrders();

  return (
    <>
      <Header />
      <div className="flex flex-col gap-4 p-8">
        {myOrders.length ? (
          myOrders.map((order) => (
            <Card key={order.id}>
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
                        className="flex items-center justify-between border-t pt-2 gap-1  ">
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
                <Button asChild>
                  <Link to={`/aimo/orders/${order.id}/picking-dashboard`}>Start Picking</Link>
                </Button>
              </CardFooter>
            </Card>
          ))
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
    </>
  );
}
