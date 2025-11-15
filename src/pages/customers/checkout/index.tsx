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
import { ShoppingCartList } from '@/pages/customers/customer-shopping';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert.tsx';
import { AlertTriangleIcon } from 'lucide-react';

export const CheckoutPage = () => {
  const { t } = useTranslation();
  const [step, setStep] = useState(1);
  const maxSteps = 3;

  const next = () => setStep((s) => Math.min(maxSteps, s + 1));
  const prev = () => setStep((s) => Math.max(1, s - 1));

  const progressValue = (step / maxSteps) * 100;

  const [email, setEmail] = useState('');
  const [telephone, setTelephone] = useState('');
  const [name, setName] = useState('');
  const [cart, setCart] = useState(() => {
    const stored = localStorage.getItem('cart');
    return stored ? JSON.parse(stored) : [];
  });

  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(cart));
  }, [cart]);

  const onUpdateItem = (product, newProduct) => {
    setCart(cart.map((item) => (item.id === product.id ? newProduct : item)));
  };

  const onRemoveItem = (product) => {
    setCart(cart.filter((item) => item.id !== product.id));
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
                  onRemoveItem={onRemoveItem}
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
                    onRemoveItem={onRemoveItem}
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
              Back
            </Button>
            <Button
              onClick={next}
              disabled={step === 4}>
              {step === 3 ? 'Review' : step === 4 ? 'Done' : 'Next'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
