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
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import { Input } from '@/components/ui/input.tsx';
import { Label } from '@/components/ui/label';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Progress } from '@/components/ui/progress.tsx';
import { Spinner } from '@/components/ui/spinner';
import { useLocalStorage } from '@/hooks/use-local-storage';
import { useProductName } from '@/hooks/use-product-name';
import { firestore, messaging, vapidKey } from '@/lib/firebase';
import type { Item, Order } from '@/pages/aimo/orders/picking-dashboard';
import type { Warning } from '@/pages/aimo/warnings';
import { Header } from '@/pages/customers/components/Header/Header.tsx';
import { ShoppingCartList, type CartItem } from '@/pages/customers/customer-shopping';
import { TOUR_STATE, useTour } from '@/pages/tour/TourController.tsx';
import { productService, type Product } from '@/services/ProductService';
import { zodResolver } from '@hookform/resolvers/zod';
import { doc, setDoc, Timestamp } from 'firebase/firestore';
import { getToken } from 'firebase/messaging';
import { motion } from 'framer-motion';
import { PhoneNumberFormat, PhoneNumberUtil } from 'google-libphonenumber';
import { AlertTriangleIcon, ChevronsUpDown } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router';
import { v4 } from 'uuid';
import { z } from 'zod';
import { useAutocompleteSuggestions } from './useAutocompleteSuggestions';

const phoneUtil = PhoneNumberUtil.getInstance();

const formSchema = (region: string) =>
  z.object({
    name: z.string().min(1, 'Name is required'),

    email: z.string().min(1, 'Email is required').email('Invalid email address'),

    telephone: z
      .string()
      .min(1, 'Telephone is required')
      .refine((value) => {
        try {
          const number = phoneUtil.parse(value, region.split('-')[0].toUpperCase());
          console.log('Parsed phone number:', number, phoneUtil.isValidNumber(number));
          return phoneUtil.isValidNumber(number);
        } catch (e) {
          console.log(e);
          return false;
        }
      }, 'Invalid phone number'),

    address: z
      .object({
        formatted: z.string(), // normalized
        lat: z.number(),
        lng: z.number(),
      })
      .refine((addr) => !!addr.formatted, 'Please select a valid address from suggestions'),
  });

type PlaceAutocompleteProps = {
  onPlaceSelect: (place: google.maps.places.Place | null) => void;
  onBlur: () => void;
};
const PlaceAutocomplete = ({ onPlaceSelect }: PlaceAutocompleteProps) => {
  const [open, setOpen] = useState(false);
  const [selectedPlace, setSelectedPlace] = useState('');
  const [inputValue, setInputValue] = useState('');

  const { suggestions, resetSession, isLoading } = useAutocompleteSuggestions(inputValue);

  const predictions = useMemo(
    () => suggestions.filter((s) => s.placePrediction).map(({ placePrediction }) => placePrediction!),
    [suggestions],
  );

  const handleSelect = async (prediction: google.maps.places.PlacePrediction) => {
    if (!prediction) return;
    const place = prediction.toPlace();

    await place.fetchFields({
      fields: ['viewport', 'location', 'formattedAddress', 'displayName'],
    });

    resetSession();
    onPlaceSelect(place);
    setInputValue('');
    setOpen(false);
    setSelectedPlace(prediction.text.text);
  };

  return (
    <Popover
      open={open}
      onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between font-normal mb-1">
          {selectedPlace ? selectedPlace : 'Select address...'}
          <ChevronsUpDown className="opacity-50" />
        </Button>
      </PopoverTrigger>

      <PopoverContent align="start">
        <Command shouldFilter={false}>
          <CommandInput
            placeholder="Search for a place"
            value={inputValue}
            onValueChange={(value) => {
              setInputValue(value);
              setOpen(true);
            }}
          />

          <CommandList>
            {!isLoading && predictions.length === 0 && <CommandEmpty>No results found.</CommandEmpty>}

            <CommandGroup>
              {predictions.map((prediction) => (
                <CommandItem
                  key={prediction.placeId}
                  value={prediction.placeId}
                  onSelect={() => handleSelect(prediction)}>
                  {prediction.text.text}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
};

export const CheckoutPage = () => {
  const { t } = useTranslation();
  const { i18n } = useTranslation();
  const { fulfillStep } = useTour();
  const getTranslatedProductName = useProductName(i18n);
  const [step, setStep] = useState(1);
  const maxSteps = 3;
  const navigate = useNavigate();

  const calculateWarnings = (item: CartItem) => {
    const warnings: Warning[] = [];
    if (Math.random() < 0.2) {
      warnings.push({
        title: 'Frequent Disruptions',
        description: 'This item has been disrupted more frequently than usual.',
      });
    }
    if (Math.random() < 0.2) {
      warnings.push({
        title: 'Unreliable Supplier',
        description: "This supplier's reliability is poor.",
      });
    }
    if (Math.random() < 0.2) {
      warnings.push({
        title: 'Seasonality Issues',
        description: 'This item is prone to seasonal availability issues.',
      });
    }
    return warnings;
  };

  const [cart, setCart] = useState(() => {
    const stored = localStorage.getItem('cart');
    const cart = stored ? (JSON.parse(stored) as CartItem[]) : [];
    for (const item of cart) {
      item.warnings = calculateWarnings(item);
    }
    return cart;
  });

  function cartItemToItem(item: CartItem): Item {
    const newItem = {
      id: item.id,
      ean: item.ean,
      names: item.names,
      orderedQuantity: item.quantity,
      pickEvent: null,
    };
    return newItem;
  }

  const form = useForm({
    defaultValues: {
      name: '',
      email: '',
      telephone: '',
    },
    resolver: zodResolver(formSchema(i18n.language)),
    reValidateMode: 'onBlur',
  });

  const [pushNotificationToken, setPushNotificationToken] = useState<string | null>(() => {
    const token = localStorage.getItem('pushNotificationToken');
    return token ? token : null;
  });
  const [isEnablingPushNotifications, setIsEnablingPushNotifications] = useState(false);
  const [myOrderIds, setMyOrderIds] = useLocalStorage<string[]>('myOrderIds', []);
  const next = async () => {
    if (step === 2) {
      const isValid = await form.trigger(undefined, { shouldFocus: true });
      if (!isValid) return;
    }
    if (step === maxSteps) {
      const orderId = v4();
      for (const item of cart) {
        console.log(item);
        for (const warning of item.warnings) {
          const d = doc(firestore, 'warnings', v4());
          setDoc(d, {
            ...warning,
            orderId: orderId,
            itemId: item.id,
          });
        }
      }
      const order = {
        id: orderId,
        createdAt: Timestamp.now(),
        products: cart.map(cartItemToItem),
        totalPrice: cart.reduce((sum, item) => sum + item.price * item.quantity, 0),
        pushNotificationToken: pushNotificationToken || null,
        email: form.getValues('email'),
        telephone: form.getValues('telephone'),
        address: form.getValues('address'),
        lang: i18n.language,
      } satisfies Order;
      const d = doc(firestore, 'orders', orderId);
      setDoc(d, order).then(() => {
        console.log('Order saved:', order);
        console.log(order.id);
        TOUR_STATE.LAST_ORDER_ID = order.id;
        setMyOrderIds([...myOrderIds, orderId]);
        navigate('/customer/checkout/complete/' + order.id);
        fulfillStep('customer_checkout_place_order');
        setCart([]);
      });
    }
    setStep((s) => {
      return Math.min(maxSteps, s + 1);
    });
  };
  const prev = () => setStep((s) => Math.max(1, s - 1));

  const progressValue = (step / maxSteps) * 100;

  const normalizePhone = (value: string) => {
    try {
      const parsed = phoneUtil.parse(value, i18n.language.split('-')[0].toUpperCase());
      if (!phoneUtil.isValidNumber(parsed)) return value;
      return phoneUtil.format(parsed, PhoneNumberFormat.E164);
    } catch {
      return value; // leave unchanged if parsing failed
    }
  };

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
                  {...form.register('name')}
                  placeholder="Name"
                  className="mb-1"
                />
                {form.formState.errors.name && (
                  <p className="text-red-500 text-sm mb-3">{form.formState.errors.name.message}</p>
                )}

                <Input
                  {...form.register('email')}
                  placeholder="Email"
                  type="email"
                  className="mb-1"
                />
                {form.formState.errors.email && (
                  <p className="text-red-500 text-sm mb-3">{form.formState.errors.email.message}</p>
                )}

                <Input
                  {...form.register('telephone', {
                    onBlur: (e) => {
                      const normalized = normalizePhone(e.target.value);

                      form.setValue('telephone', normalized, {
                        shouldDirty: true,
                        shouldTouch: true,
                      });
                    },
                  })}
                  placeholder="Telephone"
                  type="tel"
                  className="mb-1"
                />
                {form.formState.errors.telephone && (
                  <p className="text-red-500 text-sm mb-3">{form.formState.errors.telephone.message}</p>
                )}

                <Controller
                  control={form.control}
                  name="address"
                  render={({ field }) => (
                    <PlaceAutocomplete
                      onPlaceSelect={(value) => {
                        field.onChange(
                          value && {
                            formatted: value.formattedAddress || value.displayName || '',
                            lat: value.location?.lat() || 0,
                            lng: value.location?.lng() || 0,
                          },
                        );
                      }}
                      onBlur={field.onBlur}
                    />
                  )}></Controller>
                {form.formState.errors.address && (
                  <p className="text-red-500 text-sm mb-3">{form.formState.errors.address.message}</p>
                )}

                <div className="mt-4 flex items-start gap-3">
                  {isEnablingPushNotifications ? (
                    <Spinner />
                  ) : (
                    <Checkbox
                      id="push-notifications"
                      checked={!!pushNotificationToken}
                      onCheckedChange={async (checked) => {
                        if (!checked) {
                          setPushNotificationToken(null);
                          return;
                        }

                        setIsEnablingPushNotifications(true);
                        try {
                          const token = await getToken(messaging, { vapidKey });
                          console.log('Push notification token:', token);
                          setPushNotificationToken(token);
                          localStorage.setItem('pushNotificationToken', token);
                        } catch (error) {
                          console.error('Error getting push notification token:', error);
                        } finally {
                          setIsEnablingPushNotifications(false);
                        }
                      }}
                    />
                  )}
                  <Label htmlFor="push-notifications">
                    <div className="grid gap-2">
                      Receive push notifications
                      <p className="text-muted-foreground text-sm">
                        Get notified if there are any issues while fulfilling your order.
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
                          <div className="font-medium">{getTranslatedProductName(item)}</div>
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
                <h2 className="text-xl font-semibold mb-4">Review & Confirm</h2>
                <p className="text-sm text-gray-600">Please check your order and contact information.</p>

                <div className="mt-4">
                  <h3 className="font-medium">Contact Information</h3>
                  <p>Name: {form.getValues('name') || 'N/A'}</p>
                  <p>Email: {form.getValues('email') || 'N/A'}</p>
                  <p>Telephone: {form.getValues('telephone') || 'N/A'}</p>
                  <p>Address: {form.getValues('address').formatted || 'N/A'}</p>
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
                          {getTranslatedProductName(item)}: {fb ? getProductName(fb) : 'No fallback selected'}
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
            <Button onClick={next}>
              {step === maxSteps - 1 ? 'Review' : step === maxSteps ? 'Done' : 'Next'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

// TODO: Do not create new order when updated in GUI

// TODO: Verify if fields are optional
// TODO: Remove email if not supported
