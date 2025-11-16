import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb.tsx';
import { Button } from '@/components/ui/button.tsx';
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table.tsx';
import { useProductName } from '@/hooks/use-product-name.ts';
import { useDocument } from '@/lib/firebase.ts';
import type { Order } from '@/pages/aimo/orders/picking-dashboard';
import { Header } from '@/pages/customers/components/Header/Header.tsx';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router';

export interface CheckoutCompletionPageProps {
  orderId: string;
}
export const CheckoutCompletionPage = ({ orderId }: CheckoutCompletionPageProps) => {
  const { t, i18n } = useTranslation();
  const getTranslatedProductName = useProductName(i18n);
  const doc = useDocument<Order>('orders', orderId);

  return (
    <div>
      <Header />
      <div className="hero-container p-4">
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink href="/customer">{t('shop')}</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>{t('order_confirmation')}</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
        <div className="hero"></div>
      </div>
      <div>
        <h1 className="text-3xl font-bold text-center mt-8">{t('thank_you_for_your_order')}</h1>
        <p className="text-center mt-4">
          {t('your_order_number_is')}: <strong>{orderId}</strong>
        </p>
        <p className="text-center mt-2">{t('you_will_receive_a_confirmation_email_soon')}</p>
        <hr className={'mt-8'} />
        <div className="max-w-2xl mx-auto mt-8 p-4 border rounded-lg dark:bg-gray-950 ">
          <h2 className="text-2xl font-semibold mb-4">{t('order_summary')}</h2>
          {doc ? (
            <Table>
              <TableCaption>A list of your bought products.</TableCaption>
              <TableHeader>
                <TableRow>
                  <TableHead>EAN</TableHead>
                  <TableHead>Quantity</TableHead>
                  <TableHead>Product</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {doc.products.map((product) => (
                  <TableRow key={product.id}>
                    <TableCell className="bold">{product.ean}</TableCell>
                    <TableCell>{product.orderedQuantity}</TableCell>
                    <TableCell>{getTranslatedProductName(product)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
              <TableFooter>
                <TableRow>
                  <TableCell colSpan={3}>Total</TableCell>
                  <TableCell className="text-right">$2,500.00</TableCell>
                </TableRow>
              </TableFooter>
            </Table>
          ) : (
            <p>{t('loading_order_details')}...</p>
          )}

          <div className={'flex justify-center mt-4'}>
            <Button
              asChild
              variant={'default'}>
              <Link to="/customer">{t('back_to_shop')}</Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
