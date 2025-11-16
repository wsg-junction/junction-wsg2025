import { type NavigateFunction, Outlet, type To, useLocation, useNavigate } from 'react-router';
import {
  useLayoutEffect,
  createContext,
  type ReactNode,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from 'react';
import { Button } from '@/components/ui/button.tsx';

export interface TourStep {
  id: string;
  title: string;
  content: ReactNode;
  targetSelector: string;
  route: To;
  afterAction?: (navigate: NavigateFunction) => void;
  nextOnAction?: boolean;
}
export interface TourContextType {
  currentStep: TourStep | null;
  currentStepIndex: number;
  steps: TourStep[];
  fulfillStep?: (stepId: string) => void;
}
// eslint-disable-next-line react-refresh/only-export-components
export const TourContext = createContext<TourContextType>(null as unknown as TourContextType);
// eslint-disable-next-line react-refresh/only-export-components
export const useTour = () => {
  return (
    useContext(TourContext) ?? {
      fulfillStep: () => {},
    }
  );
};

const steps: TourStep[] = [
  {
    id: 'welcome',
    title: 'Welcome to the Tour',
    content: (
      <div>
        This tour will guide you through the main features of our application.
        <br />
        <br />
        <b>
          It is designed interactively. You can click the highlighted elements to proceed to the next step.
        </b>
      </div>
    ),
    route: '/',
    targetSelector: 'global',
    nextOnAction: false,
  },
  {
    id: 'select_customer_app',
    title: 'Demo Overview',
    content: (
      <div>
        This is a demo. <br />
        <b>First, go to Customer Application.</b>
      </div>
    ),
    route: '/',
    targetSelector: '[data-tour-id="select_customer_app"]',
    nextOnAction: true,
  },
  {
    id: 'customer_shop',
    title: 'Customer Shop',
    content: (
      <div>
        This is the Customer Shopping page where customers can browse products and add them to their cart.
      </div>
    ),
    route: '/customer',
    targetSelector: 'global',
    nextOnAction: false,
  },
  {
    id: 'customer_shop_select_products',
    title: 'Customer Shop - Select Products',
    content: (
      <div>
        Add some products to your cart here. <br />
        <br />
        You can add as many products as you like, to proceed, click on the Cart icon at the bottom right.
      </div>
    ),
    route: '/customer',
    targetSelector: '[data-tour-id="select_products"]',
    nextOnAction: true,
  },
  {
    id: 'customer_shop_checkout',
    title: 'Customer Shop - Checkout',
    content: (
      <div>
        You can proceed to the checkout by clicking the 'Checkout'-Button. <br />
      </div>
    ),
    route: '/customer',
    targetSelector: '[data-tour-id="cart_button"]',
    nextOnAction: true,
  },
  {
    id: 'customer_checkout',
    title: 'Customer Checkout',
    content: (
      <div>
        This is the Checkout page where customers can review their cart and place orders. <br />
      </div>
    ),
    route: '/customer/checkout',
    targetSelector: 'global',
    nextOnAction: false,
  },
  {
    id: 'customer_checkout_2',
    title: 'Customer Checkout - Place Order',
    content: (
      <div>
        Please follow the wizard to place your order. <br />
      </div>
    ),
    route: '/customer/checkout',
    targetSelector: 'body',
    nextOnAction: false,
  },
  {
    id: 'thanks',
    title: 'Thank You!',
    content: <div>Thank you for taking the tour.</div>,
    route: '/',
    targetSelector: 'global',
    nextOnAction: false,
    afterAction: (navigate) => {
      localStorage.removeItem('tourStep');
      navigate('/');
      window.location.reload();
    },
  },
];

const useTourTarget = (selector?: string) => {
  const [rect, setRect] = useState<DOMRect | null>(null);
  const rafRef = useRef<number | null>(null);
  const lastRectRef = useRef<DOMRect | null>(null);
  const elRef = useRef<Element | null>(null);

  useLayoutEffect(() => {
    if (!selector) {
      setRect(null);
      elRef.current = null;
      return;
    }

    const el = document.querySelector(selector);
    elRef.current = el;

    if (!el) {
      setRect(null);
      return;
    }

    const computeRect = () => {
      const el = document.querySelector(selector);
      elRef.current = el;

      if (!elRef.current) return;
      const newRect = elRef.current.getBoundingClientRect();
      const last = lastRectRef.current;
      if (
        !last ||
        last.top !== newRect.top ||
        last.left !== newRect.left ||
        last.width !== newRect.width ||
        last.height !== newRect.height ||
        last.bottom !== newRect.bottom ||
        last.right !== newRect.right
      ) {
        lastRectRef.current = newRect;
        setRect(newRect);
      }
    };

    // Initial measurement
    computeRect();

    // ResizeObserver for element size changes
    const ro = new ResizeObserver(computeRect);
    ro.observe(el);

    // MutationObserver to catch attribute/DOM subtree changes that may reposition element
    const mo = new MutationObserver(computeRect);
    mo.observe(document.body, { attributes: true, childList: true, subtree: true });

    // Update on scroll and window resize
    const onScroll = () => computeRect();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', computeRect);

    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      ro.disconnect();
      mo.disconnect();
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', computeRect);
    };
  }, [selector]);

  return rect;
};

export default function TourController() {
  const location = useLocation();
  const navigate = useNavigate();

  const [currentStepIndex, setStepIndex] = useState(() => {
    const savedStep = localStorage.getItem('tourStep');
    if (savedStep === null) return -1;
    const num = Number(savedStep);
    if (!Number.isFinite(num) || Number.isNaN(num)) return -1;
    return Math.max(0, Math.min(num, steps.length - 1));
  });

  // currentStep is null when index is -1 (tour not active)
  const currentStep = currentStepIndex === -1 ? null : (steps[currentStepIndex] ?? null);

  // pass undefined for 'global' steps or when there is no current step
  const target = useTourTarget(
    !currentStep || currentStep.targetSelector === 'global' ? undefined : currentStep.targetSelector,
  );

  useEffect(() => {
    const previousStep = steps[currentStepIndex - 1];
    if (previousStep?.afterAction) previousStep.afterAction(navigate);

    if (currentStep && location.pathname !== (currentStep.route as string)) {
      navigate(currentStep.route);
    }

    // Persist only when tour is active; remove when tour is inactive
    if (currentStepIndex !== -1) {
      localStorage.setItem('tourStep', String(currentStepIndex));
    } else {
      localStorage.removeItem('tourStep');
    }
  }, [currentStepIndex, currentStep, location.pathname, navigate]);

  const handleNextStep = useCallback(() => {
    setStepIndex((prev) => Math.min(prev + 1, steps.length - 1));
  }, []);

  const handleFulfillStep = useCallback(
    (stepId: string) => {
      const stepIndex = steps.findIndex((step) => step.id === stepId);
      if (stepIndex !== -1 && stepIndex === currentStepIndex) {
        handleNextStep();
      }
    },
    [currentStepIndex, handleNextStep],
  );

  useEffect(() => {
    function onTourAction() {
      if (currentStep?.nextOnAction) handleNextStep();
    }
    window.addEventListener('tour:action', onTourAction);
    return () => window.removeEventListener('tour:action', onTourAction);
  }, [currentStep, handleNextStep]);

  // Build clip-path (uses viewport coordinates from getBoundingClientRect)
  const clipPath = target
    ? `polygon(
        0% 0%, 
        0% 100%, 
        100% 100%,
        ${target.left}px ${target.bottom}px,
        ${target.left}px ${target.top}px,
        ${target.right}px ${target.top}px,
        ${target.right}px ${target.bottom}px,
        ${target.left}px ${target.bottom}px,
        ${target.left}px ${target.bottom}px,
        100% 100%, 
        100% 0%
      )`
    : 'none';

  return (
    <TourContext.Provider value={{ currentStep, currentStepIndex, steps, fulfillStep: handleFulfillStep }}>
      <Outlet />
      {currentStep && (
        <>
          <div className="fixed top-8 left-1/2 transform -translate-x-1/2 bg-white border border-gray-300 rounded-lg shadow-lg p-4 w-96 z-50">
            <h3 className="text-lg font-semibold mb-2">{currentStep?.title}</h3>
            <div className="mb-4">{currentStep?.content}</div>
            <div className={'flex justify-between gap-2 '}>
              <Button
                variant={'link'}
                onClick={() => {
                  localStorage.removeItem('tourStep');
                  window.location.reload();
                }}>
                Exit Early
              </Button>
              <div className={'flex gap-2'}>
                {currentStepIndex < steps.length - 1 ? <Button onClick={handleNextStep}>Next</Button> : null}
                {currentStepIndex === steps.length - 1 ? (
                  <Button
                    onClick={() => {
                      localStorage.removeItem('tourStep');
                      window.location.reload();
                    }}>
                    End Tour
                  </Button>
                ) : null}
              </div>
            </div>
          </div>

          {currentStep?.targetSelector === 'global' ? (
            <div className="fixed inset-0 z-40 opacity-50 bg-black"></div>
          ) : (
            <div
              style={{
                clipPath,
              }}
              className={'fixed inset-0 z-40 bg-black opacity-50 '}></div>
          )}
        </>
      )}
    </TourContext.Provider>
  );
}
