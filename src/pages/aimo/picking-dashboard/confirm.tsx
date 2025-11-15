import { use } from "react";
import { useTranslation } from "react-i18next";
import { useLocation } from "react-router";
import type { Order } from ".";

export default function AimoPickingDashboardConfirmPage() {
    const { t } = useTranslation();
    const { state } = useLocation();
    const ordersToConfirm = state as Order[];
    console.log(ordersToConfirm);
    const rows = [];
    for (const [i, order] of ordersToConfirm.entries()) {
        for (const [j, product] of order.products.entries()) {
            rows.push(
                <div key={i + j * ordersToConfirm.length} className="p-4 flex flex-row border rounded-lg">
                    <h3 className="flex w-32 font-bold mb-2">{order.id}</h3>
                    <h3 className="flex flex-1 mb-2">{product.name}</h3>
                    <p className="flex flex-1">{`Ordered Quantity: ${product.ordered_qty}`}</p>
                    <p className="flex flex-1">{`Picked Quantity: ${product.pick_event?.quantity ?? 0}`}</p>
                </div>
            );
        }
    }

    return <div className="flex flex-col gap-4 p-4">{rows}</div>;
}
