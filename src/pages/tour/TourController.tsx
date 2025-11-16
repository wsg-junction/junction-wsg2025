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

export const TourContext = createContext<TourContextType>(null);
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
        This is a demo.
        <br />
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
  const prevIdRef = useRef<string | undefined>(selector);

  useLayoutEffect(() => {
    if (prevIdRef.current === selector) return; // keine Änderung
    prevIdRef.current = selector;

    if (!selector) {
      setRect(null);
      return;
    }

    const el = document.querySelector(selector);
    if (!el) {
      setRect(null);
      return;
    }

    const frame = requestAnimationFrame(() => {
      const newRect = el.getBoundingClientRect();
      setRect((r) => (isSameRect(r, newRect) ? r : newRect));
    });

    return () => cancelAnimationFrame(frame);
  }, [selector]);

  return rect;
};

function isSameRect(a: DOMRect | null, b: DOMRect) {
  if (!a) return false;
  return (
    a.top === b.top &&
    a.left === b.left &&
    a.right === b.right &&
    a.bottom === b.bottom &&
    a.width === b.width &&
    a.height === b.height
  );
}

export default function TourController() {
  const location = useLocation();
  const navigate = useNavigate();

  const [currentStepIndex, setStepIndex] = useState(0);
  const target = useTourTarget(steps[currentStepIndex]?.targetSelector);
  console.log(target);
  console.log(steps[currentStepIndex]?.targetSelector);
  const currentStep: TourStep | null = steps[currentStepIndex] || null;

  // redirect on load + run previous afterAction
  useEffect(() => {
    const previousStep = steps[currentStepIndex - 1];
    if (previousStep?.afterAction) previousStep.afterAction(navigate);

    if (currentStep && location.pathname !== currentStep.route) {
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

  return (
    <TourContext.Provider value={{ currentStep, currentStepIndex, steps }}>
      <Outlet />
      <>
        <div className="fixed top-8 left-1/2 transform -translate-x-1/2 bg-white border border-gray-300 rounded-lg shadow-lg p-4 w-96 z-50">
          <h3 className="text-lg font-semibold mb-2">{currentStep.title}</h3>
          <div className="mb-4">{currentStep.content}</div>
          {!currentStep.nextOnAction ? (
            <div className={'flex justify-end gap-2 '}>
              {currentStepIndex < steps.length - 1 ? <Button onClick={handleNextStep}>Next</Button> : null}
              {currentStepIndex === steps.length - 1 ? (
                <Button onClick={handleNextStep}>End Tour</Button>
              ) : null}
            </div>
          ) : null}
        </div>
        {currentStep.targetSelector === 'global' ? (
          <div className="fixed inset-0 z-40 opacity-50 bg-black"></div>
        ) : (
          <div
            style={{
              clipPath: target
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
                : 'none',
            }}
            className={'fixed inset-0 z-40 bg-black opacity-20 pointer-events-none  '}></div>
        )}
      </>
    </TourContext.Provider>
  );
}
