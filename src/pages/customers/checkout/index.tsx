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
import { useEffect, useMemo, useRef, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router';
import { v4 } from 'uuid';
import { z } from 'zod';
import { useAutocompleteSuggestions } from './useAutocompleteSuggestions';
import { type TFunction } from 'i18next';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { SearchForAlternativeProductDialog } from '../components/SearchForAlternativeProductDialog';
import React from 'react';

const phoneUtil = PhoneNumberUtil.getInstance();

const formSchema = (t: TFunction<'translation', undefined>, region: string) =>
  z.object({
    name: z.string().min(1, t('checkout_page.form.name_required')),

    telephone: z
      .string()
      .optional()
      .refine((value) => {
        if (!value || value.trim() === '') return true; // optional field
        try {
          const number = phoneUtil.parse(value, region.split('-')[0].toUpperCase());
          console.log('Parsed phone number:', number, phoneUtil.isValidNumber(number));
          return phoneUtil.isValidNumber(number);
        } catch (e) {
          console.log(e);
          return false;
        }
      }, t('checkout_page.form.telephone_invalid')),

    address: z
      .object(
        {
          formatted: z.string(), // normalized
          lat: z.number(),
          lng: z.number(),
        },
        t('checkout_page.form.address_required'),
      )
      .refine((addr) => !!addr.formatted, t('checkout_page.form.address_invalid')),
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
  const maxSteps = 4;
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
      telephone: '',
    },
    resolver: zodResolver(formSchema(t, i18n.language)),
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
      const phone = form.getValues('telephone');
      const order = {
        id: orderId,
        createdAt: Timestamp.now(),
        products: cart.map(cartItemToItem),
        fallbacks,
        totalPrice: cart.reduce((sum, item) => sum + item.price * item.quantity, 0),
        pushNotificationToken: pushNotificationToken || null,
        telephone: !phone || phone.trim() === '' ? null : phone,
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
      if (!value || value.trim() === '') return ''; // optional field

      const parsed = phoneUtil.parse(value, i18n.language.split('-')[0].toUpperCase());
      if (!phoneUtil.isValidNumber(parsed)) return value;
      return phoneUtil.format(parsed, PhoneNumberFormat.E164);
    } catch {
      return value; // leave unchanged if parsing failed
    }
  };

  // --- fallback state: map from cartItemId -> fallbackProductId
  const [fallbacks, setFallbacks] = useLocalStorage<Record<string, string>>('checkout_fallbacks', {});

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
    setFallbacks(
      fallbackId
        ? { ...fallbacks, [itemId]: fallbackId }
        : Object.fromEntries(Object.entries(fallbacks).filter(([key]) => key !== itemId)),
    );
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
                  setCart={() => {}}
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
                  {...form.register('name')}
                  placeholder={t('name')}
                  className="mb-1"
                />
                {form.formState.errors.name && (
                  <p className="text-red-500 text-sm mb-3">{form.formState.errors.name.message}</p>
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
                  placeholder={t('telephone')}
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
                      {t('receive_notifications')}
                      <p className="text-muted-foreground text-sm">{t('get_notified')}</p>
                    </div>
                  </Label>
                </div>
              </div>
            )}

            {step === 3 && (
              <div>
                <h2 className="text-xl font-semibold mb-4">Fallback items</h2>
                <p className="text-sm text-gray-600 mb-3">{t('alternative_product')}</p>
                <div className="space-y-3">
                  {cart.length === 0 && <p className="text-sm">Your cart is empty.</p>}
                  {cart.map((item) => (
                    <div
                      key={item.id}
                      className="p-3 border rounded">
                      <div className="flex justify-between items-center">
                        <div className="font-medium tabular-nums">
                          {item.quantity} × {getTranslatedProductName(item)}
                          {fallbacks[item.id] && (
                            <div>
                              {t('checkout_page.fallbacks.fallback')}{' '}
                              {getTranslatedProductName(productService.getProductById(fallbacks[item.id]))}
                            </div>
                          )}
                        </div>
                        <div className="flex items-center gap-2">
                          <SelectFallbackDialog
                            productId={item.id}
                            fallbacks={fallbacks}
                            setFallback={(fallbackId) => setFallbackForItem(item.id, fallbackId)}
                          />
                          {fallbacks[item.id] ? (
                            <Button
                              variant="outline"
                              onClick={() => setFallbackForItem(item.id, null)}>
                              {t('clear')}
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
                <p className="text-sm text-gray-600">{t('check_order')}</p>

                <div className="mt-4">
                  <h3 className="font-medium">{t('contact_information')}</h3>
                  <p>
                    {t('name')}: {form.getValues('name') || 'N/A'}
                  </p>
                  <p>
                    {t('telephone')}: {form.getValues('telephone') || 'N/A'}
                  </p>
                  <p>
                    {t('address')}: {form.getValues('address').formatted || 'N/A'}
                  </p>
                </div>

                <div className="mt-4">
                  <h3 className="font-medium">{t('order_summary')}</h3>
                  <ShoppingCartList
                    readOnly={true}
                    cart={cart}
                    onUpdateItem={onUpdateItem}
                    setCart={() => {}}
                    fallbacks={fallbacks}
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
            <Button onClick={next}>
              {step === maxSteps - 1 ? t('review') : step === maxSteps ? t('done') : t('next')}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

// TODO: Do not create new order when updated in GUI

function SelectFallbackDialog({
  productId,
  fallbacks,
  setFallback,
}: {
  productId: string;
  fallbacks: Record<string, string>;
  setFallback: (fallbackId: string | null) => void;
}) {
  const { t } = useTranslation();
  const getTranslatedProductName = useProductName();

  const ref = React.useRef(undefined);

  return (
    <Dialog>
      <DialogTrigger
        ref={ref}
        asChild>
        <Button variant="outline">
          {fallbacks[productId] ? t('checkout_page.fallbacks.change') : t('checkout_page.fallbacks.select')}
        </Button>
      </DialogTrigger>
      <DialogContent className="flex flex-col w-[90vw]! max-w-full!">
        <DialogHeader className="flex-auto">
          <DialogTitle>
            {t('checkout_page.fallbacks.dialog_title', {
              productName: getTranslatedProductName(productService.getProductById(productId)!),
            })}
          </DialogTitle>
        </DialogHeader>
        <SearchForAlternativeProductDialog
          productId={productId}
          onSelect={(fallbackId) => {
            setFallback(fallbackId);
            ref.current?.click();
          }}
        />
      </DialogContent>
    </Dialog>
  );
}
