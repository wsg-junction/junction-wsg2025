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
  currentStep: TourStep;
  currentStepIndex: number;
  steps: TourStep[];
}
export const TourContext = createContext<TourContextType>(null as unknown as TourContextType);
export const useTour = () => useContext(TourContext);

const steps: TourStep[] = [
  {
    id: 'welcome',
    title: 'Welcome to the Tour',
    content: <div>This tour will guide you through the main features of our application.</div>,
    route: '/tour',
    targetSelector: 'global',
    nextOnAction: false,
  },
  {
    id: 'overview',
    title: 'Demo Overview',
    content: (
      <div>
        This is a demo. <br />
        <b>First, go to Customer Application.</b>
      </div>
    ),
    route: '/tour',
    targetSelector: '[data-tour-id="select_customer_app"]',
    nextOnAction: true,
  },
  {
    id: 'customer_shop',
    title: 'Customer Shop',
    content: <div>Customer application where products can be browsed.</div>,
    route: '/tour/customer',
    targetSelector: 'global',
    nextOnAction: false,
  },
  {
    id: 'thanks',
    title: 'Thank You!',
    content: <div>Thank you for taking the tour.</div>,
    route: '/tour',
    targetSelector: 'global',
    nextOnAction: false,
    afterAction: (navigate) => navigate('/'),
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

    // rAF polling fallback to catch transforms / CSS animations
    let running = true;
    const loop = () => {
      if (!running) return;
      computeRect();
      rafRef.current = requestAnimationFrame(loop);
    };
    rafRef.current = requestAnimationFrame(loop);

    return () => {
      running = false;
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

  const [currentStepIndex, setStepIndex] = useState(0);

  // pass undefined for 'global' steps so the hook doesn't try to query 'global'
  const currentStep = steps[currentStepIndex] || null;
  const target = useTourTarget(
    currentStep?.targetSelector === 'global' ? undefined : currentStep?.targetSelector,
  );

  useEffect(() => {
    const previousStep = steps[currentStepIndex - 1];
    if (previousStep?.afterAction) previousStep.afterAction(navigate);
    if (currentStep && location.pathname !== (currentStep.route as string)) {
      navigate(currentStep.route);
    }
  }, [currentStepIndex, currentStep, location.pathname, navigate]);

  const handleNextStep = useCallback(() => {
    setStepIndex((prev) => Math.min(prev + 1, steps.length - 1));
  }, []);

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
    <TourContext.Provider value={{ currentStep, currentStepIndex, steps }}>
      <Outlet />
      <>
        <div className="fixed top-8 left-1/2 transform -translate-x-1/2 bg-white border border-gray-300 rounded-lg shadow-lg p-4 w-96 z-50">
          <h3 className="text-lg font-semibold mb-2">{currentStep?.title}</h3>
          <div className="mb-4">{currentStep?.content}</div>
          {!currentStep?.nextOnAction ? (
            <div className={'flex justify-end gap-2 '}>
              {currentStepIndex < steps.length - 1 ? <Button onClick={handleNextStep}>Next</Button> : null}
              {currentStepIndex === steps.length - 1 ? (
                <Button onClick={handleNextStep}>End Tour</Button>
              ) : null}
            </div>
          ) : null}
        </div>

        {currentStep?.targetSelector === 'global' ? (
          <div className="fixed inset-0 z-40 opacity-50 bg-black"></div>
        ) : (
          <div
            style={{
              clipPath,
            }}
            className={'fixed inset-0 z-40 bg-black opacity-20 '}></div>
        )}
      </>
    </TourContext.Provider>
  );
}
