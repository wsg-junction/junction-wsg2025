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
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert.tsx';
import { AlertTriangleIcon, InfoIcon } from 'lucide-react';
import { Badge } from '@/components/ui/badge.tsx';

export interface TourStep {
  id: string;
  title: string;
  content: ReactNode;
  targetSelector: string;
  route?: To;
  afterAction?: (navigate: NavigateFunction) => void;
  nextOnAction?: boolean;
  overwritePosition?: string;
  isWarehouseView?: boolean;
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

export let TOUR_STATE = {
  LAST_ORDER_ID: '1de4c21e-65dd-41da-aefb-7ee10bebd6af',
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
    id: 'select_customer_browse_overview',
    title: 'Customer - Dashboard',
    content: (
      <div>
        This is the Customer Dashboard. <br />
        <br />
        The dashboard showcases different services for the customers. <br />
      </div>
    ),
    targetSelector: 'global',
    nextOnAction: false,
  },
  {
    id: 'select_customer_browse',
    title: 'Customer - Dashboard',
    content: (
      <div>
        Please select the Store Catalog to browse products. <br />
        <br />
        <b>Click on the Store Catalog button to continue.</b>
      </div>
    ),
    route: '/customer',
    targetSelector: '[data-tour-id="select_browse_catalog"]',
    nextOnAction: true,
  },
  {
    id: 'customer_shop',
    title: 'Customer - Shop',
    content: (
      <div>This is the Shop Catalog page where customers can browse products and add them to their cart.</div>
    ),
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
    route: '/customer/browse',
    targetSelector: 'body',
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
    targetSelector: 'global',
    nextOnAction: false,
  },
  {
    id: 'customer_checkout_place_order',
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
    id: 'customer_checkout_complete',
    title: 'Customer Checkout - Confirmation',
    content: (
      <div>
        You have now ordered your products. <br />
      </div>
    ),
    targetSelector: 'global',
    nextOnAction: false,
  },
  {
    id: 'switch_back_to_warehouse',
    title: 'Switch Back to Warehouse App',
    content: (
      <div>
        <Alert className="my-2 border-yellow-200 bg-yellow-50 text-yellow-800 dark:border-yellow-800 dark:bg-yellow-950/30 dark:text-yellow-200 [&>svg]:text-yellow-600 dark:[&>svg]:text-yellow-400">
          <AlertTriangleIcon />
          <AlertTitle>Switching to Warehouse Staff Point of View.</AlertTitle>
          <AlertDescription className="text-yellow-700 dark:text-yellow-300">
            We will now proceed to the Warehouse Application to manage and fulfill the orders placed by
            customers.
          </AlertDescription>
        </Alert>
      </div>
    ),
    route: '/customer/checkout/complete/' + TOUR_STATE.LAST_ORDER_ID,
    targetSelector: 'global',
    nextOnAction: false,
  },
  {
    id: 'select_warehouse_app',
    title: 'Switch to Warehouse Application',
    content: (
      <div>
        Now, switch back to the Warehouse Application. <br />
        <br />
        <b>Click on the Warehouse App button to continue.</b>
      </div>
    ),
    route: '/',
    targetSelector: '[data-tour-id="select_warehouse_app"]',
    nextOnAction: true,
    isWarehouseView: true,
  },
  {
    id: 'warehouse_dashboard',
    title: 'Warehouse Dashboard',
    content: (
      <div>
        This is the Warehouse Dashboard where staff can navigate to different sections of the application.
      </div>
    ),
    route: '/aimo',
    targetSelector: 'global',
    nextOnAction: false,
    isWarehouseView: true,
    overwritePosition: 'bottom-8',
  },
  {
    id: 'select_warehouse_orders',
    title: 'Warehouse - Orders',
    content: (
      <div>Select the Orders section to view and manage customer orders that need to be fulfilled.</div>
    ),
    route: '/aimo',
    targetSelector: '[data-tour-id="nav_orders"]',
    nextOnAction: true,
    isWarehouseView: true,
    overwritePosition: 'bottom-8',
  },
  {
    id: 'warehouse_orders_0',
    title: 'Warehouse - Orders',
    content: (
      <div>
        This is the Orders Dashboard where warehouse staff can see which products need to be picked to fulfill
        customer orders.
      </div>
    ),
    route: '/aimo/orders',
    targetSelector: 'global',
    nextOnAction: true,
    isWarehouseView: true,
    overwritePosition: 'bottom-8',
  },
  {
    id: 'warehouse_orders',
    title: 'Warehouse - Orders',
    content: (
      <div>
        <b>Select the first order in the list to start the picking process.</b>
      </div>
    ),
    route: '/aimo/orders',
    targetSelector: 'body',
    nextOnAction: true,
    isWarehouseView: true,
    overwritePosition: 'bottom-8',
  },
  {
    id: 'warehouse_order_picking',
    title: 'Warehouse - Order Picking',
    content: (
      <div>
        This is the Picking Dashboard where warehouse staff can see the products that need to be picked for
        the selected order.
        <br />
        <br />
        <span>
          Follow the steps and make sure to set some items to None or less than required -{' '}
          <b>so you can see Kevin in action!</b>.
        </span>
      </div>
    ),
    targetSelector: 'body',
    nextOnAction: true,
    isWarehouseView: true,
    overwritePosition: 'bottom-8',
  },
  {
    id: 'switch_back_to_customer',
    title: 'Switch Back to Customer App',
    content: (
      <div>
        <Alert className="my-2 border-yellow-200 bg-yellow-50 text-yellow-800 dark:border-yellow-800 dark:bg-yellow-950/30 dark:text-yellow-200 [&>svg]:text-yellow-600 dark:[&>svg]:text-yellow-400">
          <AlertTriangleIcon />
          <AlertTitle>Switching to Customer App</AlertTitle>
          <AlertDescription className="text-yellow-700 dark:text-yellow-300">
            We will now proceed to the Customer Application to see the order confirmation after picking.
          </AlertDescription>
        </Alert>
      </div>
    ),
    targetSelector: 'global',
    nextOnAction: false,
  },
  {
    id: 'customer_order_select',
    title: 'Customer - Dashboard',
    content: <div>Back to the Customer Dashboard</div>,

    route: '/customer',
    targetSelector: 'global',
    nextOnAction: false,
  },
  {
    id: 'customer_order_select_2',
    title: 'Customer - Orders',
    content: (
      <div>Please select the Orders section in the Customer Application to view your order history.</div>
    ),
    route: '/customer',
    targetSelector: '[data-tour-id="select_my_orders"]',
    nextOnAction: true,
    overwritePosition: 'bottom-8',
  },
  {
    id: 'thanks',
    title: 'Thank You!',
    route: '/customer/orders',
    content: (
      <div>
        <span>Thank you for taking the tour.</span>
        <br />
        <br />
        <b>We want you to explore more!</b>
        <br />
        <span>
          There are many more features! Like a Map with nearby stores, and a Select Alternatives for
          unavailable items.
        </span>
        <br />
        <br />
        <b>Make sure to check them out in this order page for orders that have unavailable items.</b>
      </div>
    ),
    targetSelector: 'global',
    nextOnAction: false,
    afterAction: (navigate) => {
      localStorage.removeItem('tourStep');
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
    console.log(selector, el);
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

    if (currentStep && currentStep.route && location.pathname !== (currentStep.route as string)) {
      navigate(currentStep.route);
    }

    // Persist only when tour is active; remove when tour is inactive
    if (currentStepIndex !== -1) {
      localStorage.setItem('tourStep', String(currentStepIndex));
    } else {
      localStorage.removeItem('tourStep');
    }
  }, [currentStepIndex, currentStep, location.pathname, navigate]);

  const handleNextStep = useCallback((stepId?: string) => {
    if (stepId) {
      const stepIndex = steps.findIndex((step) => step.id === stepId);
      console.log('Next step requested for stepId:', stepId, 'found at index', stepIndex);
      if (stepIndex !== -1) {
        setStepIndex(stepIndex + 1);
        return;
      }
    }
    setStepIndex((prev) => Math.min(prev + 1, steps.length - 1));
  }, []);

  const handleFulfillStep = useCallback(
    (stepId: string) => {
      const stepIndex = steps.findIndex((step) => step.id === stepId);
      const step = steps[stepIndex];
      console.log('Fulfilling step:', stepId, 'at index', stepIndex);
      if (stepIndex !== -1 && stepIndex === currentStepIndex && step.id === stepId) {
        handleNextStep(stepId);
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
          <div
            className={
              'fixed left-1/2 transform -translate-x-1/2 dark:bg-gray-950 dark:border-gray-800 bg-white border border-gray-300 rounded-lg shadow-lg p-4 w-96 z-50' +
              (currentStep?.overwritePosition ? ' ' + currentStep.overwritePosition : ' top-8 ')
            }>
            <div className={'flex flex-row justify-between  mb-2'}>
              <h3 className="text-lg font-semibold mb-2">{currentStep?.title}</h3>
              <span>
                {currentStep?.isWarehouseView ? (
                  <Badge variant="destructive">Warehouse View</Badge>
                ) : (
                  <Badge variant={'secondary'}>Customer View</Badge>
                )}
              </span>
            </div>
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
                {currentStepIndex < steps.length - 1 ? (
                  <Button
                    disabled={currentStepIndex <= steps.length - 1 && !steps[currentStepIndex + 1]?.route}
                    onClick={() => {
                      handleNextStep();
                    }}>
                    Next
                  </Button>
                ) : null}
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
