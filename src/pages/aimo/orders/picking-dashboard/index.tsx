import { Button } from '@/components/ui/button';
import { ButtonGroup } from '@/components/ui/button-group';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useProductName } from '@/hooks/use-product-name';
import { firestore, useOrder } from '@/lib/firebase';
import type { TranslatedName } from '@/services/ProductService';
import { doc, Timestamp, updateDoc } from '@firebase/firestore';
import { t } from 'i18next';
import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, useParams } from 'react-router';
import { Header } from '../../components/Header';

export type PickEvent = {
  quantity: number;
  datetime: Date;
};

export type Item = {
  id: string;
  names: TranslatedName[];
  orderedQuantity: number;
  ean: string;
  pickEvent: PickEvent | null;
};

export type Order = {
  id: string;
  createdAt: Timestamp;
  products: Item[];
  totalPrice: number;
  pushNotificationToken: string | null;
  telephone: string | null;
  address: {
    formatted: string;
    lat: number;
    lng: number;
  };
  lang: string;
};

export default function AimoPickingDashboard() {
  const { t } = useTranslation();

  const { orderId } = useParams();
  const order = useOrder(orderId);

  async function updateOrder(order: Order) {
    const ref = doc(firestore, 'orders', order.id);
    await updateDoc(ref, order);
  }

  const navigate = useNavigate();
  function getOrderToConfirm() {
    const orderCopy = structuredClone(order!);
    orderCopy.products = Object.values(orderCopy.products).filter(
      (it) => it.orderedQuantity !== it.pickEvent?.quantity,
    );
    return orderCopy.products.length ? orderCopy : null;
  }

  const isSubmitDisabled = useMemo(() => {
    if (!order) return true;

    return order.products.some(
      (product) => !product.pickEvent || product.pickEvent.quantity > product.orderedQuantity,
    );
  }, [order]);

  const onPickEvent = (pickEvent: PickEvent | null, productId: string) => {
    const product = order!.products.find((p) => p.id === productId)!;
    if (pickEvent && pickEvent.quantity > product.orderedQuantity) return;
    product.pickEvent = pickEvent;
    updateOrder(order!);
  };
  function sendConfirmationNotifications() {
    if (!order!.pushNotificationToken) return;

    const hasMissingItems = order!.products.some(
      (product) => product.pickEvent && product.pickEvent.quantity < product.orderedQuantity,
    );
    if (hasMissingItems) return;

    console.log('Sending notification to', order!.pushNotificationToken, 'for order', order!.id);

    fetch('https://sendpushnotification-3avmwyjhaq-uc.a.run.app', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        token: order!.pushNotificationToken,
        notification: {
          title: 'Your order has been packed',
          body: 'Your order was packed successfully and is now on its way to you.',
        },
        data: { orderId: order!.id, hasMissingItems: 'false' },
        webpush: { notification: { requireInteraction: true } },
      }),
    });
  }
  function submit() {
    const orderToConfirm = getOrderToConfirm();
    if (orderToConfirm) {
      sendConfirmationNotifications();
      navigate(`/aimo/orders/${orderId}/picking-dashboard/confirm`, { state: orderToConfirm });
      return;
    }
    sendConfirmationNotifications();
    navigate('/aimo/orders');
  }
  return (
    <>
      <Header />
      <div className="flex flex-col gap-4 p-8">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{t('product_name')}</TableHead>
              <TableHead>{t('ordered_quantity')}</TableHead>
              <TableHead style={{ width: '50%' }}>{t('picked_quantity')}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {Object.values(order?.products ?? {}).map((item) => (
              <PickingRow
                key={item.id}
                item={item}
                setPickEvent={(e) => onPickEvent(e, item.id)}
              />
            ))}
          </TableBody>
        </Table>
        <Button
          className="w-32 self-end"
          disabled={isSubmitDisabled}
          onClick={submit}>
          {t('submit')}
        </Button>
      </div>
    </>
  );
}

function PickingRow({ item, setPickEvent }: { item: Item; setPickEvent: (event: PickEvent | null) => void }) {
  const getTranslatedProductName = useProductName();

  const quantity = item.pickEvent?.quantity;

  const [error, setError] = useState<string | null>(calculateError(quantity ?? item.orderedQuantity));
  const [errorColor, setErrorColor] = useState<string | undefined>(
    calculateErrorColor(quantity ?? item.orderedQuantity),
  );

  function calculateError(value: number): string | null {
    if (value > item.orderedQuantity) {
      return t('error_quantity_greater');
    } else if (value < item.orderedQuantity) {
      return t('error_quantity_smaller');
    } else {
      return null;
    }
  }

  function calculateErrorColor(value: number): string | undefined {
    if (value > item.orderedQuantity) {
      return 'red';
    } else if (value < item.orderedQuantity) {
      return 'orange';
    } else {
      return undefined;
    }
  }

  function setQuantity(rawValue: number) {
    setError(calculateError(rawValue));
    setErrorColor(calculateErrorColor(rawValue));
    const value = isNaN(rawValue) ? rawValue : Math.min(rawValue, item.orderedQuantity);
    setPickEvent(
      isNaN(value)
        ? null
        : {
            quantity: value,
            datetime: new Date(),
          },
    );
  }

  return (
    <TableRow>
      <TableCell>{getTranslatedProductName(item)}</TableCell>
      <TableCell>{item.orderedQuantity}</TableCell>
      <TableCell>
        <div className="flex flex-col gap-2">
          <ButtonGroup>
            <Button
              variant="outline"
              className={quantity == item.orderedQuantity ? 'bg-[#eee8f5]' : ''}
              onClick={() => setQuantity(item.orderedQuantity)}>
              All
            </Button>
            <Button
              variant="outline"
              className={quantity == 0 ? 'bg-[#eee8f5]' : ''}
              onClick={() => setQuantity(0)}>
              None
            </Button>
            <Input
              type="number"
              value={quantity && quantity !== item.orderedQuantity ? quantity : undefined}
              placeholder={t('aimo_picking_dashboard.picking_row.quantity_custom')}
              className={quantity && quantity !== item.orderedQuantity ? 'bg-[#eee8f5]' : ''}
              onChange={(event) => setQuantity(event.target.valueAsNumber)}
              onFocus={(event) => event.target.select()}
            />
          </ButtonGroup>
          <p style={{ color: errorColor }}>{error}</p>
        </div>
      </TableCell>
    </TableRow>
  );
}
