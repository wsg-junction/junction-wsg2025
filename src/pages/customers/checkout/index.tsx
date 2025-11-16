import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert.tsx';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb.tsx';
import { Button } from '@/components/ui/button.tsx';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input.tsx';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress.tsx';
import { useProductName } from '@/hooks/use-product-name';
import { firestore, messaging, vapidKey } from '@/lib/firebase';
import type { Item, Order } from '@/pages/aimo/picking-dashboard';
import type { Warning } from '@/pages/aimo/warnings';
import { Header } from '@/pages/customers/components/Header/Header.tsx';
import { ShoppingCartList, type CartItem } from '@/pages/customers/customer-shopping';
import { productService, type Product } from '@/services/ProductService';
import { doc, setDoc } from 'firebase/firestore';
import { getToken } from 'firebase/messaging';
import { motion } from 'framer-motion';
import { AlertTriangleIcon } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router';
import { v4 } from "uuid";

export const CheckoutPage = () => {
  const { t } = useTranslation();
  const { i18n } = useTranslation();
  const getTranslatedProductName = useProductName(i18n);
  const [step, setStep] = useState(1);
  const maxSteps = 3;
  const navigate = useNavigate();

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
        description: "This supplier's reliability is poor.",
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

  const [cart, setCart] = useState(() => {
    const stored = localStorage.getItem('cart');
    const cart = stored ? (JSON.parse(stored) as CartItem[]) : [];
    for (const item of cart) {
      item.warnings = calculateWarnings(item);
    }
    return cart;
  });

  function cartItemToItem(item: CartItem): Item {
    const newItem = { id: item.id, ean: item.ean, names: item.names, orderedQuantity: item.quantity, pickEvent: null };
    return newItem;
  }

  const [pushNotificationToken, setPushNotificationToken] = useState<string | null>(() => {
    const token = localStorage.getItem('pushNotificationToken');
    return token ? token : null;
  });
  const next = () => setStep((s) => {
    if (s === maxSteps) {
      const orderId = v4();
      for (const item of cart) {
        console.log(item);
        for (const warning of item.warnings) {
          warning.orderId = orderId;
          warning.itemId = item.id;
          const d = doc(firestore, "warnings", v4());
          setDoc(d, warning);
        }
      }
      const order = {
        id: orderId,
        products: cart.map(cartItemToItem),
        pushNotificationToken: pushNotificationToken || undefined,
      } satisfies Order;
      const d = doc(firestore, "orders", orderId);
      setDoc(d, order);
      navigate('/customer');
      return;
    }
    return Math.min(maxSteps, s + 1);
  });
  const prev = () => setStep((s) => Math.max(1, s - 1));

  const progressValue = (step / maxSteps) * 100;

  const [email, setEmail] = useState('');
  const [telephone, setTelephone] = useState('');
  const [name, setName] = useState('');


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
    if (quantity <= 0) {
      setCart(cart.filter((item) => item.id !== product.id));
      return;
    }

    const existingItem = cart.find((item) => item.id === product.id);
    if (existingItem) {
      setCart(cart.map((item) => (item.id === product.id ? { ...existingItem, quantity } : item)));
      return;
    }
    setCart([...cart, { ...product, quantity, warnings: [] }]);
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
    return getTranslatedProductName(p);
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
              {t('step')} {step} / {maxSteps}
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
                <h2 className="text-xl font-semibold mb-4">{t('your_cart')}</h2>
                <ShoppingCartList
                  readOnly={false}
                  cart={cart}
                  onUpdateItem={onUpdateItem}
                  setCart={() => { }}
                />
              </div>
            )}
            {step === 2 && (
              <div>
                <h2 className="text-xl font-semibold mb-4">{t('contact_information')}</h2>
                <Alert className="my-2 border-yellow-200 bg-yellow-50 text-yellow-800 dark:border-yellow-800 dark:bg-yellow-950/30 dark:text-yellow-200 [&>svg]:text-yellow-600 dark:[&>svg]:text-yellow-400">
                  <AlertTriangleIcon />
                  <AlertTitle>{t('add_information')}</AlertTitle>
                  <AlertDescription className="text-yellow-700 dark:text-yellow-300">
                    {t('automatic_contact')}
                  </AlertDescription>
                </Alert>
                <Input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder={t('name')}
                  className="mb-3"
                />
                <Input
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={t('email')}
                  className="mb-3"
                  type={'email'}
                />
                <Input
                  value={telephone}
                  onChange={(e) => setTelephone(e.target.value)}
                  placeholder={t('telephone')}
                  type={'tel'}
                />
                <div className="mt-4 flex items-start gap-3">
                  <Checkbox
                    id="push-notifications"
                    checked={!!pushNotificationToken}
                    onCheckedChange={async (checked) => {
                      if (!checked) {
                        setPushNotificationToken(null);
                        return;
                      }

                      try {
                        const token = await getToken(messaging, { vapidKey });
                        console.log('Push notification token:', token);
                        setPushNotificationToken(token);
                        localStorage.setItem('pushNotificationToken', token);
                      } catch (error) {
                        console.error('Error getting push notification token:', error);
                      }
                    }}
                  />
                  <Label htmlFor="push-notifications">
                    <div className="grid gap-2">
                      {t('receive_notifications')}
                      <p className="text-muted-foreground text-sm">
                        {t('get_notified')}
                      </p>
                    </div>
                  </Label>
                </div>
              </div>
            )}

            {step === 3 && (
              <div>
                <h2 className="text-xl font-semibold mb-4">Fallback items</h2>
                <p className="text-sm text-gray-600 mb-3">
                  {t('alternative_product')}
                </p>
                <div className="space-y-3">
                  {cart.length === 0 && <p className="text-sm">Your cart is empty.</p>}
                  {cart.map((item, idx) => (
                    <div
                      key={item.id || idx}
                      className="p-3 border rounded">
                      <div className="flex justify-between items-center">
                        <div>
                          <div className="font-medium">{getTranslatedProductName(item)}</div>
                          <div className="text-sm text-muted-foreground">Qty: {item.quantity}</div>
                        </div>
                        <div className="flex items-center gap-2">
                          <select
                            className="border rounded p-1"
                            value={fallbacks[item.id] ?? ''}
                            onChange={(e) => setFallbackForItem(item.id, e.target.value || null)}>
                            <option value="">{t('no_fallback')}</option>
                            {products
                              .filter((p) => p.id !== item.id)
                              .map((p) => (
                                <option
                                  key={p.id}
                                  value={p.id}>
                                  {getTranslatedProductName(p)}
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
                <h2 className="text-xl font-semibold mb-4">{t('review_and_confirm')}</h2>
                <p className="text-sm text-gray-600">{t('check_rder')}</p>

                <div className="mt-4">
                  <h3 className="font-medium">{t('contact_infromation')}</h3>
                  <p>{t('name')}: {name || 'N/A'}</p>
                  <p>{t('email')}: {email || 'N/A'}</p>
                  <p>{t('telephone')}: {telephone || 'N/A'}</p>
                </div>

                <div className="mt-4">
                  <h3 className="font-medium">{t('order_summary')}</h3>
                  <ShoppingCartList
                    readOnly={true}
                    cart={cart}
                    onUpdateItem={onUpdateItem}
                    setCart={() => { }}
                  />
                </div>
              </div>
            )}
          </motion.div>

          <div className="flex justify-end mt-8 gap-2">
            <Button
              variant="outline"
              onClick={prev}
              disabled={step === 1}>
              {t('back')}
            </Button>
            <Button
              onClick={next}>
              {step === maxSteps - 1 ? t('review') : step === maxSteps ? t('done') : t('next')}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
