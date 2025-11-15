import { Header } from '@/pages/customers/components/Header/Header.tsx';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb.tsx';
import { useTranslation } from 'react-i18next';
import { Progress } from '@/components/ui/progress.tsx';
import { Input } from '@/components/ui/input.tsx';
import { Button } from '@/components/ui/button.tsx';
import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import { ShoppingCartList, type CartItem } from '@/pages/customers/customer-shopping';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert.tsx';
import { AlertTriangleIcon } from 'lucide-react';
import { productService, type Product } from '@/services/ProductService';

export const CheckoutPage = () => {
  const { t } = useTranslation();
  const [step, setStep] = useState(1);
  // increase steps: 1=Cart, 2=Contact, 3=Fallbacks, 4=Review
  const maxSteps = 4;

  const next = () => setStep((s) => Math.min(maxSteps, s + 1));
  const prev = () => setStep((s) => Math.max(1, s - 1));

  const progressValue = (step / maxSteps) * 100;

  const [email, setEmail] = useState('');
  const [telephone, setTelephone] = useState('');
  const [name, setName] = useState('');
  const [cart, setCart] = useState(() => {
    const stored = localStorage.getItem('cart');
    return stored ? (JSON.parse(stored) as CartItem[]) : [];
  });

  // --- fallback state: map from cartItemId -> fallbackProductId | null
  const LOCALSTORAGE_FALLBACKS_KEY = 'checkout_fallbacks_v1';
  const [fallbacks, setFallbacks] = useState<Record<string, string | null>>(() => {
    try {
      const raw = localStorage.getItem(LOCALSTORAGE_FALLBACKS_KEY) || '{}';
      return JSON.parse(raw);
    } catch {
      return {};
    }
  });

  // products for fallback choices
  const [products, setProducts] = useState<Product[]>([]);
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const res = await productService.getProducts(-1);
        if (mounted) setProducts(res.data || []);
      } catch (e) {
        console.error('Failed to load products for fallbacks', e);
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem(LOCALSTORAGE_FALLBACKS_KEY, JSON.stringify(fallbacks));
    } catch (e) {
      // ignore storage errors
      console.error('Failed to save fallbacks to localStorage', e);
    }
  }, [fallbacks]);

  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(cart));
  }, [cart]);

  const onUpdateItem = (product: Product, quantity: number) => {
    setCart(cart.map((item) => (item.id === product.id ? { ...item, quantity } : item)));
  };

  // set a fallback for a cart item (pass fallbackId as string or null)
  const setFallbackForItem = (itemId: string, fallbackId: string | null) => {
    if (!itemId) return;
    if (fallbackId === itemId) return; // disallow same-product fallback
    setFallbacks((prev) => {
      const next = { ...prev, [itemId]: fallbackId };
      try {
        localStorage.setItem(LOCALSTORAGE_FALLBACKS_KEY, JSON.stringify(next));
      } catch {
        console.error('Failed to save fallbacks to localStorage');
      }
      return next;
    });
  };

  const clearFallbackForItem = (itemId: string) => {
    setFallbacks((prev) => {
      const next = { ...prev };
      delete next[itemId];
      try {
        localStorage.setItem(LOCALSTORAGE_FALLBACKS_KEY, JSON.stringify(next));
      } catch {
        console.error('Failed to save fallbacks to localStorage');
      }
      return next;
    });
  };

  const getProductName = (id: string | null | undefined) => {
    if (!id) return null;
    const p = products.find((x) => x.id === id);
    return p ? p.name || p.title || id : id;
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
              <BreadcrumbPage>{t('checkout')}</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
        <div className="hero">
          <div className={''}></div>
        </div>

        <div className={'mt-4'}>
          <div className="mb-6">
            <Progress
              value={progressValue}
              className="h-2"
            />
            <p className="text-sm mt-2">
              Step {step} of {maxSteps}
            </p>
          </div>

          <motion.div
            key={step}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25 }}
            className="space-y-4">
            {step === 1 && (
              <div>
                <h2 className="text-xl font-semibold mb-4">Your cart</h2>
                <ShoppingCartList
                  readOnly={false}
                  cart={cart}
                  onUpdateItem={onUpdateItem}
                  setCart={() => {}}
                />
              </div>
            )}
            {step === 2 && (
              <div>
                <h2 className="text-xl font-semibold mb-4">Contact Information</h2>
                <Alert className="my-2 border-yellow-200 bg-yellow-50 text-yellow-800 dark:border-yellow-800 dark:bg-yellow-950/30 dark:text-yellow-200 [&>svg]:text-yellow-600 dark:[&>svg]:text-yellow-400">
                  <AlertTriangleIcon />
                  <AlertTitle>Demo Info: Please add Information</AlertTitle>
                  <AlertDescription className="text-yellow-700 dark:text-yellow-300">
                    Kevin will only be able to contact you automatically if you enter contact information!
                  </AlertDescription>
                </Alert>
                <Input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Name"
                  className="mb-3"
                />
                <Input
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Email"
                  className="mb-3"
                  type={'email'}
                />
                <Input
                  value={telephone}
                  onChange={(e) => setTelephone(e.target.value)}
                  placeholder="Telephone"
                  type={'tel'}
                />
              </div>
            )}

            {step === 3 && (
              <div>
                <h2 className="text-xl font-semibold mb-4">Fallback items</h2>
                <p className="text-sm text-gray-600 mb-3">
                  Choose an alternative product to use if an item is unavailable.
                </p>
                <div className="space-y-3">
                  {cart.length === 0 && <p className="text-sm">Your cart is empty.</p>}
                  {cart.map((item, idx) => (
                    <div
                      key={item.id || idx}
                      className="p-3 border rounded">
                      <div className="flex justify-between items-center">
                        <div>
                          <div className="font-medium">{item.name}</div>
                          <div className="text-sm text-muted-foreground">Qty: {item.quantity}</div>
                        </div>
                        <div className="flex items-center gap-2">
                          <select
                            className="border rounded p-1"
                            value={fallbacks[item.id] ?? ''}
                            onChange={(e) => setFallbackForItem(item.id, e.target.value || null)}>
                            <option value="">No fallback</option>
                            {products
                              .filter((p) => p.id !== item.id)
                              .map((p) => (
                                <option
                                  key={p.id}
                                  value={p.id}>
                                  {p.name || p.title || p.id}
                                </option>
                              ))}
                          </select>
                          {fallbacks[item.id] ? (
                            <Button
                              variant="ghost"
                              onClick={() => clearFallbackForItem(item.id)}>
                              Clear
                            </Button>
                          ) : null}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {step === maxSteps && (
              <div>
                <h2 className="text-xl font-semibold mb-4">Review & Confirm</h2>
                <p className="text-sm text-gray-600">Please check your order and contact information.</p>

                <div className="mt-4">
                  <h3 className="font-medium">Contact Information</h3>
                  <p>Name: {name || 'N/A'}</p>
                  <p>Email: {email || 'N/A'}</p>
                  <p>Telephone: {telephone || 'N/A'}</p>
                </div>

                <div className="mt-4">
                  <h3 className="font-medium">Order Summary</h3>
                  <ShoppingCartList
                    readOnly={true}
                    cart={cart}
                    onUpdateItem={onUpdateItem}
                    setCart={() => {}}
                  />

                  {/* Show selected fallbacks for review */}
                  <div className="mt-3">
                    <h4 className="font-medium">Fallbacks</h4>
                    {cart.map((item) => {
                      const fb = fallbacks[item.id];
                      return (
                        <div
                          key={item.id}
                          className="text-sm">
                          {item.name}: {fb ? getProductName(fb) : 'No fallback selected'}
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}
          </motion.div>

          <div className="flex justify-end mt-8 gap-2">
            <Button
              variant="outline"
              onClick={prev}
              disabled={step === 1}>
              Back
            </Button>
            <Button
              onClick={next}
              disabled={step === maxSteps}>
              {step === maxSteps - 1 ? 'Review' : step === maxSteps ? 'Done' : 'Next'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
