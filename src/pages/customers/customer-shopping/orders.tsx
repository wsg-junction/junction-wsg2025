import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useProductName } from '@/hooks/use-product-name';
import { useMyOrders } from '@/lib/firebase';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router';
import { Empty, EmptyContent, EmptyDescription, EmptyHeader, EmptyTitle } from '@/components/ui/empty';
import { Header } from '../components/Header/Header';
import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbSeparator,
  BreadcrumbPage,
} from '@/components/ui/breadcrumb';
import { formatPrice } from '@/lib/utils';
import { productService } from '@/services/ProductService';

export default function CustomerOrdersPage() {
  const { t } = useTranslation();
  const getTranslatedProductName = useProductName();

  const myOrders = useMyOrders();

  return (
    <div className="flex flex-col">
      <Header />
      <div className="hero-container p-4">
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink href="/customer">{t('shop')}</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>My Orders</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
        <div className="hero"></div>
      </div>

      <div className="self-center max-w-4xl flex flex-col gap-4 items-stretch p-8">
        {myOrders.length ? (
          myOrders.map((order) => (
            <Card
              key={order.id}
              className="max-w-4xl">
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
                        className="flex items-center border-t pt-2 gap-2">
                        <p className="flex-3 font-medium line-clamp-2 overflow-hidden text-ellipsis me-2 tabular-nums">
                          {item.orderedQuantity} × {getTranslatedProductName(item)}
                        </p>
                        <p className="min-w-24 font-medium tabular-nums text-right">
                          {formatPrice(productService.getProductById(item.id)!.price * item.orderedQuantity)}
                        </p>
                      </div>
                    );
                  })}
                </div>
                <div className="flex justify-end items-center gap-2 mt-4">
                  <span>Total: </span>
                  <span className="font-bold text-lg">{formatPrice(order.totalPrice)}</span>
                </div>
              </CardContent>
              {order.products[0].pickEvent !== null &&
                order.products.some((it) => (it.pickEvent?.quantity ?? 0) < it.orderedQuantity) && (
                  <CardFooter>
                    <div className="flex justify-between items-center gap-4">
                      <div className="flex-1">Unfortunately, some of these items are not available.</div>
                      <Button asChild>
                        <Link to={`/customer/orders/${order.id}/select-alternatives`}>
                          Select alternatives
                        </Link>
                      </Button>
                    </div>
                  </CardFooter>
                )}
            </Card>
          ))
        ) : (
          <Empty>
            <EmptyHeader>
              <EmptyTitle>No Orders yet</EmptyTitle>
              <EmptyDescription>You haven't placed any orders yet.</EmptyDescription>
            </EmptyHeader>
            <EmptyContent>
              <Button asChild>
                <Link to="/customer">Visit the Shop</Link>
              </Button>
            </EmptyContent>
          </Empty>
        )}
      </div>
    </div>
  );
}
