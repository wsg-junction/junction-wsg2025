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
import { firestore, useOrder, useQuery } from '@/lib/firebase';
import type { Order } from '@/pages/aimo/orders/picking-dashboard';
import { Header } from '@/pages/customers/components/Header/Header.tsx';
import { type Product, productService } from '@/services/ProductService';
import { collection } from 'firebase/firestore';
import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ProductCard } from '../components/ProductCard/ProductCard';
import { SearchForAlternativeProductDialog } from '../components/SearchForAlternativeProductDialog';
import SupermarketMap from '../components/SupermarketMap';
import { useProductName } from '@/hooks/use-product-name.ts';
import { productCategoryService } from '@/services/ProductCategoryService.ts';
import { useLocalStorage } from '@/hooks/use-local-storage';
import type { CartItem } from '.';
import { useParams } from 'react-router';

export default function SelectAlternativesPage() {
  const { t, i18n } = useTranslation();
  const getTranslatedProductName = useProductName(i18n);

  const { orderId } = useParams();
  const order = useOrder(orderId);

  const unfulfilledItems = useMemo(() => {
    return order?.products.filter((p) => p.pickEvent && p.pickEvent.quantity < p.orderedQuantity) ?? [];
  }, [order]);

  const [similarProducts, setSimilarProducts] = useState<Record<string, Product[]>>({});

  useEffect(() => {
    let mounted = true;

    async function loadSimilar() {
      const results: Record<string, Product[]> = {};

      await Promise.all(
        unfulfilledItems.map(async (item) => {
          try {
            const category = await productCategoryService.findSimilarProductsById(item.id);
            if (category.length > 0) {
              results[item.id] = category;
            }
          } catch (err) {
            console.error(err);
            // optional: logging
          }
        }),
      );

      if (mounted) setSimilarProducts(results);
    }

    if (unfulfilledItems.length > 0) loadSimilar();

    return () => {
      mounted = false;
    };
  }, [unfulfilledItems]);

  const [cart, setCart] = useLocalStorage<CartItem[]>('cart', []);

  const onUpdateItem = (product: Product, quantity: number) => {
    if (quantity <= 0) {
      setCart(cart.filter((item) => item.id !== product.id));
      return;
    }

    const existingItem = cart.find((item) => item.id === product.id);
    if (existingItem) {
      setCart(cart.map((item) => (item.id === product.id ? { ...item, quantity } : item)));
      return;
    }
    setCart([...cart, { ...product, quantity, warnings: [] }]);
  };
  const getQuantityInCart = (productId: string) => {
    const item = cart.find((item) => item.id === productId);
    return item ? item.quantity : 0;
  };

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
              <BreadcrumbLink href="/customer/orders">{t('my_orders')}</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>{t('select_alternatives.title')}</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
        <div className="hero"></div>
      </div>
      <div className="m-8 flex flex-col gap-8">
        <h1>{t('select_alternatives.title')}</h1>
        {unfulfilledItems.map((item) => {
          const product = productService.getProductById(item.id)!;
          return (
            <Card key={item.id}>
              <CardHeader>
                <div className="flex flex-row justify-between items-center">
                  <div className="flex flex-row gap-4 items-center">
                    {product.image && (
                      <img
                        src={product.image}
                        className="h-16 object-contain"
                      />
                    )}
                    {getTranslatedProductName(product)}
                  </div>
                  <div>
                    {item.orderedQuantity - item.pickEvent!.quantity}/{item.orderedQuantity}{' '}
                    {t('select_alternatives.not_deliverable')}
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-6">
                  {similarProducts[item.id]
                    ? similarProducts[item.id].map((product) => {
                        return (
                          <ProductCard
                            key={product.id}
                            id={product.id}
                            onUpdateCartQuantity={(quantity) => onUpdateItem(product, quantity)}
                            currentQuantity={getQuantityInCart(product.id)}
                          />
                        );
                      })
                    : null}
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
                          {t('search_for_alternative_product_dialog.title')}{' '}
                          {getTranslatedProductName(product)}
                        </DialogTitle>
                      </DialogHeader>
                      <SearchForAlternativeProductDialog
                        productId={item.id}
                        onUpdateItem={onUpdateItem}
                        getCurrentQuantity={(productId) => getQuantityInCart(productId)}
                      />
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
