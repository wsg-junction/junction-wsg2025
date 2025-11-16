import { Button } from '@/components/ui/button';
import { useProductName } from '@/hooks/use-product-name.ts';
import { firestore } from '@/lib/firebase.ts';
import type { Notification } from '@/pages/customers/components/NotificationsPopover/NotificationsPopover.tsx';
import { addDoc, collection } from 'firebase/firestore';
import { useLocation, useNavigate } from 'react-router';
import type { Order } from '.';
import { Header } from '../../components/Header';

export default function AimoPickingDashboardConfirmPage() {
  const { state } = useLocation();
  const order = state as Order;
  const navigate = useNavigate();
  const getTranslatedProductName = useProductName();

  async function confirm() {
    try {
      const docRef = await addDoc(collection(firestore, 'notifications'), {
        title: 'Your order has missing items',
        message: 'Some items were not available. Click on this notification to select alternatives.',
        createdAt: Date.now(),
        read: false,
        orderId: order.id,
      } as Omit<Notification, 'id'>);
      console.log('Document written with ID: ', docRef.id);
    } catch (error) {
      console.error('Error adding document: ', error);
    }

    if (order.pushNotificationToken) {
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
    }

    if (order.telephone) {
      console.log('Calling', order.telephone, 'for order', order.id);

      fetch('https://helloworld-3avmwyjhaq-uc.a.run.app', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          language: order.lang,
          phone_number: order.telephone,
          order_id: order.id,
        }),
      });
    }

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
