import { Empty, EmptyDescription, EmptyHeader, EmptyTitle } from '@/components/ui/empty';
import { InputGroup, InputGroupAddon, InputGroupInput } from '@/components/ui/input-group';
import { Spinner } from '@/components/ui/spinner';
import { type Product, productService } from '@/services/ProductService';
import { useDebouncedCallback } from '@tanstack/react-pacer';
import { t } from 'i18next';
import { Search } from 'lucide-react';
import { useEffect, useState } from 'react';
import type { CartItem } from '../customer-shopping';
import { ProductCard } from './ProductCard/ProductCard';
import { useLocalStorage } from '@/hooks/use-local-storage';

export function SearchForAlternativeProductDialog() {
  const [isLoading, setIsLoading] = useState(true);
  const [products, setProducts] = useState<Product[]>([]);
  const search = useDebouncedCallback(
    async (searchTerm: string) => {
      setProducts(await productService.searchProducts(searchTerm));
      setIsLoading(false);
    },
    { wait: 10 },
  );
  useEffect(() => {
    search('');
  }, []);

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
  const getQuantityInCart = (cart: CartItem[], product: Product) => {
    const item = cart.find((item) => item.id === product.id);
    return item ? item.quantity : 0;
  };

  return (
    <div className="flex flex-col gap-4">
      <InputGroup>
        <InputGroupInput
          placeholder={t('search_for_alternative_product_dialog.search_placeholder')}
          onChange={(e) => search(e.target.value)}
        />
        <InputGroupAddon>
          <Search />
        </InputGroupAddon>
        <InputGroupAddon align="inline-end"></InputGroupAddon>
      </InputGroup>
      <div className="max-h-[50svh] overflow-y-auto grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-6">
        {products.length ? (
          products.map((product) => {
            return (
              <ProductCard
                key={product.id}
                id={product.id}
                onUpdateCartQuantity={(newQuantity) => {
                  onUpdateItem(product, newQuantity);
                }}
                currentQuantity={getQuantityInCart(cart, product)}
                rating={3}
              />
            );
          })
        ) : (
          <div className="col-span-full text-center text-muted-foreground">
            {isLoading ? (
              <Spinner />
            ) : (
              <Empty className="align">
                <EmptyHeader>
                  <EmptyTitle>{t('search_for_alternative_product_dialog.no_products_found')}</EmptyTitle>
                  <EmptyDescription>
                    {t('search_for_alternative_product_dialog.no_products_found_description')}
                  </EmptyDescription>
                </EmptyHeader>
              </Empty>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
