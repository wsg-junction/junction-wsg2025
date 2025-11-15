import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router";
import { Header } from "../components/Header";
import { t } from "i18next";
import { firestore, useQuery } from "@/lib/firebase";
import { collection, doc, updateDoc } from "@firebase/firestore";
import type { Warning } from "../warnings";

export type PickEvent = {
	quantity: number;
	datetime: Date;
};

export type Item = {
	id: string;
	name: string;
	orderedQuantity: number;
	pickEvent: PickEvent | null;
	warnings: Warning[]
};

export type Order = {
	id: string;
	products: Item[];
};

export default function AimoPickingDashboard() {
	const { t } = useTranslation();

	const orders = useQuery<Order>(useMemo(() => collection(firestore, "orders"), []));
	console.log(orders);

	async function updateOrder(order: Order) {
		const ref = doc(firestore, "orders", order.id);
		await updateDoc(ref, order);
	}

	const navigate = useNavigate();
	function getOrdersToConfirm() {
		const ret = [];
		const ordersCopy = structuredClone(orders);
		for (const order of Object.values(ordersCopy)) {
			order.products = Object.values(order.products).filter(it => it.orderedQuantity !== it.pickEvent?.quantity);
			if (Object.entries(order.products).length > 0) {
				ret.push(order);
			}
		}
		return ret;
	}

	const isDisabled = useMemo(() => {
		for (const order of Object.values(orders)) {
			for (const product of Object.values(order.products)) {
				if (product.pickEvent == null) {
					return true;
				}
				if (product.pickEvent!.quantity > product.orderedQuantity) {
					return true;
				}
			}
		}
		return false;
	}, [orders]);

	const onPickEvent = (pickEvent: PickEvent | null, orderId: string, productId: string) => {
		const order = orders.find(o => o.id === orderId);
		const product = order?.products.find(p => p.id === productId);
		if (pickEvent.quantity > product.orderedQuantity) return;
		product.pickEvent = pickEvent;
		updateOrder(order);
	}
	const getSubmitAction = () => {
		if (getOrdersToConfirm().length > 0) {
			return () => navigate('/aimo/dashboard/confirm', { state: getOrdersToConfirm() });
		}
		return () => navigate('/aimo');

	}
	return (
		<div className="p-8">
			<Header />
			<div className="flex flex-col gap-4">
				<Table>
					<TableHeader>
						<TableRow>
							<TableHead style={{ width: "10%" }}>{t("order_id")}</TableHead>
							<TableHead>{t("product_name")}</TableHead>
							<TableHead>{t("ordered_quantity")}</TableHead>
							<TableHead style={{ width: "50%" }}>{t("picked_quantity")}</TableHead>
						</TableRow>
					</TableHeader>
					<TableBody>
						{Object.values(orders).flatMap(order =>
							Object.values(order.products).map(product =>
								<PickingRow
									order_id={order.id}
									productName={product.name}
									orderedQty={product.orderedQuantity}
									setPickEvent={(e) => onPickEvent(e, order.id, product.id)}
									defaultPickedQuantity={product.pickEvent?.quantity} />
							)
						)}
					</TableBody>
				</Table>
				<Button className="w-32 self-end" disabled={isDisabled} onClick={getSubmitAction()}>{t("submit")}</Button>
			</div>
		</div>

	);
}

function PickingRow(
	{ order_id, productName, orderedQty, setPickEvent, defaultPickedQuantity }:
		{
			order_id: string,
			productName: string,
			orderedQty: number,
			setPickEvent: (event: PickEvent | null) => void,
			defaultPickedQuantity?: number,
		}
) {
	const [error, setError] = useState<string | null>(calculateError(defaultPickedQuantity ?? orderedQty));
	const [errorColor, setErrorColor] = useState<string>(calculateErrorColor(defaultPickedQuantity ?? orderedQty));

	function calculateError(value: number): string | null {
		if (value > orderedQty) {
			return t("error_quantity_greater");
		} else if (value < orderedQty) {
			return t("error_quantity_smaller");
		} else {
			return null;
		}
	}

	function calculateErrorColor(value: number): string | null {
		if (value > orderedQty) {
			return "red";
		} else if (value < orderedQty) {
			return "orange";
		} else {
			return null;
		}
	}

	return (
		<TableRow>
			<TableCell>{order_id}</TableCell>
			<TableCell>{productName}</TableCell>
			<TableCell>{orderedQty}</TableCell>
			<TableCell>
				<div className="flex flex-col gap-2">
					<Input
						type="number"
						defaultValue={defaultPickedQuantity}
						placeholder={t("enter_quantity")}
						onChange={(event) => {
							const value = event.target.valueAsNumber;
							setError(calculateError(value));
							setErrorColor(calculateErrorColor(value));
							const pickEvent = isNaN(value) ? null : {
								quantity: value,
								datetime: new Date(),
							};
							setPickEvent(pickEvent);
						}}
						onFocus={(event) => event.target.select()}
					/>
					<p style={{ color: errorColor }}>
						{error}
					</p>
				</div>
			</TableCell>
		</TableRow>
	);
}
