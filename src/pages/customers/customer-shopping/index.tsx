import { useTranslation } from 'react-i18next';
import { Header } from '@/pages/customers/components/Header/Header.tsx';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb.tsx';
import { ProductCard } from '@/pages/customers/components/ProductCard/ProductCard.tsx';
import { useEffect, useMemo, useState } from 'react';
import { Button } from '@/components/ui/button.tsx';
import { ShoppingCart, Trash2 } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover.tsx';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select.tsx';
import { useNavigate } from 'react-router';
import { productService, type Product } from '@/services/ProductService';
import { useProductName } from '@/hooks/use-product-name.ts';
import type { Warning } from '@/pages/aimo/warnings';

export default function CustomerShoppingPage() {
  const { t } = useTranslation();

  const [page, setPage] = useState(0);
  const [products, setProducts] = useState<Product[]>([]);
  const [, setFetchedPages] = useState([]);
  const [isLoading, setIsLoading] = useState(false); // for initial load and page load
  const [totalProducts, setTotalProducts] = useState(0);

  const [cart, setCart]: [CartItem[], (items: CartItem[]) => void] = useState(() => {
    const stored = localStorage.getItem('cart');
    return stored ? (JSON.parse(stored) as CartItem[]) : [];
  });

  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(cart));
  }, [cart]);

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
        <div className="hero"></div>
      </div>

      {isLoading && page === 0 ? (
        <div className="p-8 text-center">{t('loading_products')}</div>
      ) : (
        <>
          <div className="px-8 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-6">
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

      <Popover>
        <PopoverTrigger
          className="fixed bottom-3 right-3"
          asChild>
          <Button
            className="h-[50px] w-[50px] rounded-full flex justify-center items-center"
            variant="default"
            size="lg">
            <ShoppingCart />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="-translate-x-3 w-full max-w-[90vw] min-w-auto md:max-w-[600px] min-w-[300px]">
          <b>Shopping Cart</b>
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
  );
}

export type CartItem = Product & {
  quantity: number;
  warnings: Warning[],
};

interface ShoppingCartProps {
  cart: CartItem[];
  onUpdateItem: (product: Product, quantity: number) => void;
  readOnly?: boolean;
  showButtons?: boolean;
  setCart: (cart: CartItem[]) => void;
}

export const ShoppingCartList = ({
  readOnly = false,
  showButtons = false,
  cart,
  onUpdateItem,
  setCart,
}: ShoppingCartProps) => {
  const { t, i18n } = useTranslation();
  const getTranslatedProductName = useProductName(i18n);
  const navigate = useNavigate();
  const updateQuantity = (product: Product, quantity: number) => {
    onUpdateItem(product, quantity);
  };
  const totalPrice = (item: CartItem) => {
    const { price } = item;
    return price ? price * item.quantity : 0;
  };

  const calculateWarnings = (item: CartItem) => {
    const warnings: Warning[] = [];
    if (Math.random() < 0.2) {
      warnings.push({
        title: "Frequent Disruptions",
        description: "This item has been disrupted more frequently than usual.",
      });
    }
    if (Math.random() < 0.2) {
      warnings.push({
        title: "Unreliable Supplier",
        description: "This supplier's reliability is below average.",
      });
    }
    if (Math.random() < 0.2) {
      warnings.push({
        title: "Unreliable Supplier",
        description: "This supplier's reliability is below average.",
      });
    }
    if (Math.random() < 0.2) {
      warnings.push({
        title: "Seasonality Issues",
        description: "This item is prone to seasonal availability issues.",
      });
    }
    return warnings;
  }

  const allWarnings = useMemo(() => cart.map(item => calculateWarnings(item)), []);

  return (
    <div className={'space-y-4 mt-2'}>
      {cart.map((item, index) => {
        const { price } = item;
        const formattedPrice = price ? price.toFixed(2) : '0.00';

        return (
          <div
            key={index}
            className="flex items-center justify-between border-t pt-2 gap-1  ">
            <div className="flex-1">
              <p className="font-medium line-clamp-2 overflow-hidden text-ellipsis me-2">
                {getTranslatedProductName(item)}
              </p>
              <p className="text-sm text-muted-foreground">
                {formattedPrice}€<span className="text-sm text-muted-foreground font-light"> / pcs</span>
              </p>
              {allWarnings[index].length > 0 && (
                <div className="mt-1 space-y-1">
                  {allWarnings[index].map((warnings, wIndex) => (
                    <div
                      key={wIndex}
                      className="p-2 border border-yellow-400 bg-yellow-100 rounded-lg">
                      <div className="text-sm font-bold">{warnings.title}</div>
                      <div className="text-sm">{warnings.description}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>
            <div className='flex-1' />

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
                <p className="font-medium">Qty: {item.quantity}</p>
              </div>
            )}

            <p className="w-20 text-right font-medium">{totalPrice(item).toFixed(2)}€</p>

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
          <span>Total: </span>
          <span className="font-bold text-lg">
            {cart
              .reduce((a, b) => {
                return a + totalPrice(b);
              }, 0)
              .toFixed(2)}
            €
          </span>
        </div>
      </div>
    </div >
  );
};
