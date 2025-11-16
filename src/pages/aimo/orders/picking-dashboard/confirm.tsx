import { Button } from '@/components/ui/button';
import { useProductName } from '@/hooks/use-product-name.ts';
import { useLocation, useNavigate } from 'react-router';
import type { Order } from '.';
import { Header } from '../../components/Header';

export default function AimoPickingDashboardConfirmPage() {
  const { state } = useLocation();
  const order = state as Order;
  const navigate = useNavigate();
  const getTranslatedProductName = useProductName();

  async function confirm() {
    if (!order.pushNotificationToken) return;

    console.log('Sending notification to', order.pushNotificationToken, 'for order', order.id);

    fetch('https://sendpushnotification-3avmwyjhaq-uc.a.run.app', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        token: order.pushNotificationToken,
        notification: {
          title: 'Your order has missing items',
          body: 'Some items were not available. Click on this notification to select alternatives.',
        },
        data: { orderId: order.id, hasMissingItems: 'true' },
        webpush: {
          notification: {
            // actions: [
            //   {
            //     action: 'view_order',
            //     title: 'View Order',
            //   },
            //   {
            //     action: 'select_alternatives',
            //     title: 'Select Alternatives',
            //   },
            // ],
            requireInteraction: true,
          },
        },
      }),
    });
    navigate('/aimo/orders');
  }

  return (
    <div className="p-8">
      <Header />
      <div className="flex flex-col gap-4 p-4">
        <p>
          You have picked less than the client ordered for these products. Please confirm to automatically
          notify the client, based on their communication preference.
        </p>
        {Object.values(order.products).map((product) => (
          <div className="p-4 flex flex-row border rounded-lg">
            <h3 className="flex flex-2">{getTranslatedProductName(product)}</h3>
            <p className="flex flex-1">Ordered Quantity: {product.orderedQuantity}</p>
            <p className="flex flex-1">Picked Quantity: {product.pickEvent?.quantity ?? 0}</p>
          </div>
        ))}
        <Button
          onClick={confirm}
          className="w-64 self-end">
          Confirm and notify client
        </Button>
      </div>
    </div>
  );
}
