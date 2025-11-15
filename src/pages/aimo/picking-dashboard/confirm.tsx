import { use } from 'react';
import { useTranslation } from 'react-i18next';
import { useLocation, useNavigate } from 'react-router';
import type { Order } from '.';
import { Button } from '@/components/ui/button';
import { Header } from '../components/Header';
import { useProductName } from '@/hooks/use-product-name';

export default function AimoPickingDashboardConfirmPage() {
  const { t } = useTranslation();
  const { state } = useLocation();
  const ordersToConfirm = state as Record<number, Order>;
  const navigate = useNavigate();
  const getTranslatedProductName = useProductName();

  return (
    <div className="p-8">
      <Header />
      <div className="flex flex-col gap-4 p-4">
        <p>
          You have picked less than the clients ordered for these products. Please confirm to automatically
          notify the clients, based on their communication preferences.
        </p>
        {Object.values(ordersToConfirm).flatMap((order) =>
          Object.values(order.products).map((product) => (
            <div className="p-4 flex flex-row border rounded-lg">
              <h3 className="flex w-32 font-bold mb-2">{order.id}</h3>
              <h3 className="flex flex-1 mb-2">{getTranslatedProductName(product)}</h3>
              <p className="flex flex-1">Ordered Quantity: {product.orderedQuantity}</p>
              <p className="flex flex-1">Picked Quantity: {product.pickEvent?.quantity ?? 0}</p>
            </div>
          )),
        )}
        <Button
          onClick={() => navigate('/aimo')}
          className="w-64 self-end">
          Confirm and notify clients
        </Button>
      </div>
    </div>
  );
}
