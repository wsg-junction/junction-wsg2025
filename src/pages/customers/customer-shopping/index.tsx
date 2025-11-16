import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb.tsx';
import { Button } from '@/components/ui/button.tsx';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover.tsx';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select.tsx';
import { useLocalStorage } from '@/hooks/use-local-storage';
import { useProductName } from '@/hooks/use-product-name.ts';
import { formatPrice } from '@/lib/utils';
import type { Warning } from '@/pages/aimo/warnings';
import { Header } from '@/pages/customers/components/Header/Header.tsx';
import { ProductCard } from '@/pages/customers/components/ProductCard/ProductCard.tsx';
import { useTour } from '@/pages/tour/TourController.tsx';
import { productService, type Product } from '@/services/ProductService';
import { ShoppingCart, Trash2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router';

export default function CustomerShoppingPage() {
  const { t } = useTranslation();
  const { fulfillStep } = useTour();

  const [page, setPage] = useState(0);
  const [products, setProducts] = useState<Product[]>([]);
  const [, setFetchedPages] = useState([]);
  const [isLoading, setIsLoading] = useState(false); // for initial load and page load
  const [totalProducts, setTotalProducts] = useState(0);

  const [cart, setCart] = useLocalStorage<CartItem[]>('cart', []);

  useEffect(() => {
    const fetchProducts = async () => {
      setIsLoading(true); // start loading
      try {
        const result = await productService.getProducts(page);
        setFetchedPages((prev) => {
          if (prev.find((p) => p.page === page)) {
            return prev; // already fetched
          }
          const newFetched = [...prev, { page, products: result.data }];
          setProducts(newFetched.flatMap((p) => p.products));
          return newFetched;
        });
        setTotalProducts(result.total);
      } catch (error) {
        console.error('Failed to fetch products', error);
      } finally {
        setIsLoading(false); // stop loading
      }
    };
    fetchProducts();
  }, [page]);

  const onLoadMore = () => {
    setPage((prev) => prev + 1);
  };

  const onUpdateItem = (product: Product, quantity: number) => {
    if (quantity <= 0) {
      setCart(cart.filter((item) => item.id !== product.id));
      return;
    }

    const existingItem = cart.find((item) => item.id === product.id);
    if (existingItem) {
      setCart(cart.map((item) => (item.id === product.id ? { ...product, quantity, warnings: [] } : item)));
      return;
    }
    setCart([...cart, { ...product, quantity, warnings: [] }]);
  };
  const getQuantityInCart = (cart: CartItem[], product: Product) => {
    const item = cart.find((item) => item.id === product.id);
    return item ? item.quantity : 0;
  };

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
              <BreadcrumbPage>{t('all_products')}</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
        <div className="hero mt-4">
          <h1 className={'text-lg font-bold'}>{t('customer_catalog')}</h1>
          <h3 className={'text-gray-800 dark:text-gray-400'}>{t('customer_catalog_subtitle')}</h3>
        </div>

        <div className={'mt-6'}>
          {isLoading && page === 0 ? (
            <div className="p-8 text-center">{t('loading_products')}</div>
          ) : (
            <>
              <div
                className=" grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-6"
                data-tour-id="select_products">
                {products.map((product) => {
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
                })}
              </div>
              <div className="flex justify-center my-8">
                <Button
                  onClick={onLoadMore}
                  disabled={isLoading}>
                  {isLoading
                    ? t('loading')
                    : t('show_more') + (totalProducts ? ` (${products.length}/${totalProducts})` : '')}
                </Button>
              </div>
            </>
          )}
        </div>
        <Popover>
          <PopoverTrigger
            className="fixed bottom-3 right-3"
            asChild>
            <Button
              onClick={() => {
                fulfillStep('customer_shop_select_products');
              }}
              data-tour-id="cart_button"
              className="h-[50px] w-[50px] rounded-full flex justify-center items-center"
              variant="default"
              size="lg">
              <ShoppingCart />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="-translate-x-3 w-full max-w-[90vw] min-w-auto md:max-w-[600px] min-w-[300px] max-h-[80vh] overflow-y-auto">
            <b>{t('shopping_cart')}</b>
            <ShoppingCartList
              setCart={(cart) => {
                setCart(cart);
              }}
              showButtons={true}
              cart={cart}
              onUpdateItem={onUpdateItem}
            />
          </PopoverContent>
        </Popover>
      </div>
    </div>
  );
}

export type CartItem = Product & {
  quantity: number;
  warnings: Warning[];
};

interface ShoppingCartProps {
  cart: CartItem[];
  onUpdateItem: (product: Product, quantity: number) => void;
  readOnly?: boolean;
  showButtons?: boolean;
  setCart: (cart: CartItem[]) => void;
  fallbacks?: Record<string, string>;
}

export const ShoppingCartList = ({
  readOnly = false,
  showButtons = false,
  cart,
  onUpdateItem,
  setCart,
  fallbacks,
}: ShoppingCartProps) => {
  const { t, i18n } = useTranslation();
  const { fulfillStep } = useTour();
  const getTranslatedProductName = useProductName(i18n);
  const navigate = useNavigate();
  const updateQuantity = (product: Product, quantity: number) => {
    onUpdateItem(product, quantity);
  };
  const totalPrice = (item: CartItem) => {
    const { price } = item;
    return price ? price * item.quantity : 0;
  };

  return (
    <div className={'space-y-4 mt-2'}>
      {cart.map((item, index) => {
        return (
          <div
            key={index}
            className="flex items-center justify-between border-t pt-2 gap-1  ">
            <div className="flex-1">
              <p className="font-medium line-clamp-2 overflow-hidden text-ellipsis me-2">
                {getTranslatedProductName(item)}
              </p>
              <p className="text-sm text-muted-foreground tabular-nums">
                {formatPrice(item.price)}
                <span className="font-light"> / pcs</span>
              </p>
              {fallbacks && fallbacks[item.id] && (
                <p className="text-sm text-muted-foreground">
                  {t('checkout_page.fallbacks.fallback')}{' '}
                  {getTranslatedProductName(productService.getProductById(fallbacks[item.id]))}
                </p>
              )}
              {item.warnings.length > 0 && (
                <div className="mt-1 space-y-1">
                  {item.warnings.map((warnings, wIndex) => (
                    <div
                      key={wIndex}
                      className="p-2 border  border-yellow-200 bg-yellow-50 text-yellow-800 dark:border-yellow-800 dark:bg-yellow-950/30 dark:text-yellow-200 [&>svg]:text-yellow-600 dark:[&>svg]:text-yellow-400 rounded-lg">
                      <div className="text-sm font-bold">{warnings.title}</div>
                      <div className="text-sm">{warnings.description}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>
            <div className="flex-1" />

            {!readOnly ? (
              <div className={'flex items-center gap-2'}>
                <span>Qty:</span>
                <Select
                  value={String(item.quantity)}
                  onValueChange={(val) => updateQuantity(item, Number(val))}>
                  <SelectTrigger className="w-16">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {[...Array(10)].map((_, i) => (
                      <SelectItem
                        key={i + 1}
                        value={String(i + 1)}>
                        {i + 1}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            ) : (
              <div>
                <p className="font-medium tabular-nums">Qty: {item.quantity}</p>
              </div>
            )}

            <p className="w-20 text-right font-medium tabular-nums">{formatPrice(totalPrice(item))}</p>

            {!readOnly && (
              <Button
                variant="ghost"
                size="icon"
                onClick={() => updateQuantity(item, 0)}>
                <Trash2 className="h-4 w-4" />
              </Button>
            )}
          </div>
        );
      })}
      <div className={'h-px bg-black dark:bg-white '}></div>
      <div className={'flex flex-row justify-between'}>
        <div>
          {showButtons ? (
            <div className={'flex flex-row gap-2'}>
              <Button
                onClick={() => {
                  fulfillStep('customer_shop_checkout');
                  navigate('/customer/checkout');
                }}
                disabled={cart.length === 0}>
                {t('checkout')}
              </Button>
              <Button
                onClick={() => {
                  setCart([]);
                }}
                variant="ghost"
                disabled={cart.length === 0}>
                {t('clear')}
              </Button>
            </div>
          ) : null}
        </div>
        <div className={'flex justify-end items-center gap-2 '}>
          <span>{t('total')}: </span>
          <span className="font-bold text-lg">
            {formatPrice(cart.reduce((a, b) => a + totalPrice(b), 0))}
          </span>
        </div>
      </div>
    </div>
  );
};
