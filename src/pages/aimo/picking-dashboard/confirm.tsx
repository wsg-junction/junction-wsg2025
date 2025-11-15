import { use } from "react";
import { useTranslation } from "react-i18next";
import { useLocation } from "react-router";
import type { Order } from ".";
import { Button } from "@/components/ui/button";
import { Header } from "../components/Header";

export default function AimoPickingDashboardConfirmPage() {
    const { t } = useTranslation();
    const { state } = useLocation();
    const ordersToConfirm = state as Record<number, Order>;
    console.log(ordersToConfirm);

    return (
        <div className="p-8">
            <Header />
            <div className="flex flex-col gap-4 p-4">
                <p>You have picked less than the clients ordered for these products. Please confirm to automatically notify the clients, based on their communication preferences.</p>
                {
                    Object.values(ordersToConfirm).flatMap(order =>
                        Object.values(order.products).map(product =>
                            <div className="p-4 flex flex-row border rounded-lg">
                                <h3 className="flex w-32 font-bold mb-2">{order.id}</h3>
                                <h3 className="flex flex-1 mb-2">{product.name}</h3>
                                <p className="flex flex-1">Ordered Quantity: {product.ordered_qty}</p>
                                <p className="flex flex-1">Picked Quantity: {product.pick_event?.quantity ?? 0}</p>
                            </div>
                        )
                    )
                }
                <Button onClick={() => alert("Success")} className="w-64 self-end">Confirm and notify clients</Button>
            </div>
        </div>);
}
