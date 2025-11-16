import { Button } from '@/components/ui/button';
import { useProductName } from '@/hooks/use-product-name.ts';
import { useLocation, useNavigate } from 'react-router';
import type { Order } from '.';
import { Header } from '../../components/Header';
import { useTranslation } from 'react-i18next';

export default function AimoPickingDashboardConfirmPage() {
  const { t } = useTranslation();
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
          title: t('push_notifications.missing_items.title'),
          body: t('push_notifications.missing_items.body'),
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
        <p>{t('aimo_picking_dashboard_confirm.description')}</p>
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
