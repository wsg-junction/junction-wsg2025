import { Empty, EmptyDescription, EmptyHeader, EmptyTitle } from '@/components/ui/empty';
import { InputGroup, InputGroupAddon, InputGroupInput } from '@/components/ui/input-group';
import { Spinner } from '@/components/ui/spinner';
import { type Product, productService } from '@/services/ProductService';
import { useDebouncedCallback } from '@tanstack/react-pacer';
import { t } from 'i18next';
import { Search } from 'lucide-react';
import { useEffect, useState } from 'react';
import { ProductCard } from './ProductCard/ProductCard';

export function SearchForAlternativeProductDialog({
  onUpdateItem,
  getCurrentQuantity,
  onSelect,
}: {
  onUpdateItem?: (product: Product, quantity: number) => void;
  getCurrentQuantity?: (productId: string) => number;
  onSelect?: (productId: string) => void;
}) {
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
      <div className="max-h-[60svh] overflow-y-auto grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-6">
        {products.length ? (
          products.map((product) => {
            return (
              <ProductCard
                key={product.id}
                id={product.id}
                onUpdateCartQuantity={
                  onUpdateItem ? (newQuantity) => onUpdateItem(product, newQuantity) : undefined
                }
                currentQuantity={getCurrentQuantity ? getCurrentQuantity(product.id) : undefined}
                onSelect={onSelect ? () => onSelect(product.id) : undefined}
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
