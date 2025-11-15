import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb.tsx';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { firestore, useQuery } from '@/lib/firebase';
import type { Order } from '@/pages/aimo/picking-dashboard';
import { Header } from '@/pages/customers/components/Header/Header.tsx';
import { productService } from '@/services/ProductService';
import { collection } from 'firebase/firestore';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { ProductCard } from '../components/ProductCard/ProductCard';
import { SearchForAlternativeProductDialog } from '../components/SearchForAlternativeProductDialog';
import SupermarketMap from '../components/SupermarketMap';

export default function SelectAlternativesPage() {
  const { t } = useTranslation();

  const orders = useQuery<Order>(useMemo(() => collection(firestore, 'orders'), []));
  const unfulfilledItmes = useMemo(
    () =>
      Object.values(orders)
        .flatMap((order) => order.products)
        .filter((p) => p.pickEvent && p.pickEvent.quantity < p.orderedQuantity),
    [orders],
  );

  return (
    <div>
      <Header></Header>
      <div className="hero-container p-4">
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink href="/customer">{t('shop')}</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>{t('select_alternatives.title')}</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
        <div className="hero"></div>
      </div>
      <div className="m-8 flex flex-col gap-4">
        <h1>{t('select_alternatives.title')}</h1>
        {unfulfilledItmes.map((item) => {
          const product = productService.getProductById(item.id)!;
          return (
            <Card key={item.id}>
              <CardHeader>
                <div className="flex flex-row justify-between items-center">
                  <div className="flex flex-row gap-4 items-center">
                    {product.imageUrl && (
                      <img
                        src={product.imageUrl}
                        className="h-16 object-contain"
                      />
                    )}
                    {product.name}
                  </div>
                  <div>
                    {item.orderedQuantity - item.pickEvent!.quantity}/{item.orderedQuantity}{' '}
                    {t('select_alternatives.not_deliverable')}
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-6">
                  <ProductCard id="9042d0eb-a792-4b2f-9770-dac62f894148" />
                  <ProductCard id="10b64381-9d0d-4077-bfa7-2b1f3eefb7bc" />
                  <ProductCard id="ce5509b2-3148-49e2-b83c-7c636e38dfbf" />
                </div>
              </CardContent>
              <CardContent>
                <div className="flex flex-row gap-2">
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button
                        variant="outline"
                        className="cursor-pointer">
                        {t('select_alternatives.alternative_products')}
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="flex flex-col w-[90vw]! max-w-full!">
                      <DialogHeader className="flex-auto">
                        <DialogTitle>
                          {t('search_for_alternative_product_dialog.title')} {product.name}
                        </DialogTitle>
                      </DialogHeader>
                      <SearchForAlternativeProductDialog />
                    </DialogContent>
                  </Dialog>
                  {/* <SearchForAlternativeRecipeDialog item={'TODO'} /> */}
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button
                        variant="outline"
                        className="cursor-pointer">
                        {t('select_alternatives.supermarket')}
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="flex flex-col w-[90vw]! max-w-full!">
                      <DialogHeader className="flex-auto">
                        <DialogTitle>{t('select_alternatives.supermarket')}</DialogTitle>
                      </DialogHeader>
                      <SupermarketMap />
                    </DialogContent>
                  </Dialog>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
