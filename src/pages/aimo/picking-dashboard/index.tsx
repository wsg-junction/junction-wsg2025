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

export type PickEvent = {
	quantity: number;
	datetime: Date;
};

export type Product = {
	id: number;
	name: string;
	ordered_qty: number;
	pick_event: PickEvent | null;
};

export type Order = {
	id: number;
	products: Record<number, Product>;
};

const mockOrders = {
	1: {
		id: 1,
		products: {
			1: {
				id: 1,
				name: "Product A",
				ordered_qty: 10,
				pick_event: null,
			},
			2: {
				id: 2,
				name: "Product B",
				ordered_qty: 5,
				pick_event: null,
			},
		}
	},
} satisfies Record<number, Order>;

export default function AimoPickingDashboard() {
	const { t } = useTranslation();

	const [orders, setOrders] = useState<Record<number, Order>>(mockOrders);
	const navigate = useNavigate();
	function getOrdersToConfirm() {
		const ret = [];
		const ordersCopy = structuredClone(orders);
		for (const order of Object.values(ordersCopy)) {
			order.products = Object.values(order.products).filter(it => it.ordered_qty !== it.pick_event?.quantity);
			if (Object.entries(order.products).length > 0) {
				ret.push(order);
			}
		}
		return ret;
	}

	const isDisabled = useMemo(() => {
		if (getOrdersToConfirm().length === 0) return true;
		for (const order of Object.values(orders)) {
			for (const product of Object.values(order.products)) {
				if (product.pick_event == null) {
					return true;
				}
				if (product.pick_event!.quantity > product.ordered_qty) {
					return true;
				}
			}
		}
		return false;
	}, [orders]);

	const onPickEvent = (pickEvent: PickEvent | null, orderId: number, productId: number) => {
		const copy = structuredClone(orders);
		copy[orderId].products[productId].pick_event = pickEvent;
		setOrders(copy);
		console.log(copy);
	}

	return (
		<div className="p-8">
			<Header />
			<div className="flex flex-col gap-4">
				<Table>
					<TableHeader>
						<TableRow>
							<TableHead>Order ID</TableHead>
							<TableHead>Product name</TableHead>
							<TableHead>Ordered Quantity</TableHead>
							<TableHead style={{ width: "45%" }}>Picked Quantity</TableHead>
						</TableRow>
					</TableHeader>
					<TableBody>
						{Object.values(orders).flatMap(order =>
							Object.values(order.products).map(product =>
								<PickingRow
									order_id={order.id}
									productName={product.name}
									orderedQty={product.ordered_qty}
									setPickEvent={(e) => onPickEvent(e, order.id, product.id)} />
							)
						)}
					</TableBody>

				</Table>
				<Button className="w-32 self-end" disabled={isDisabled} onClick={() => navigate("/aimo/dashboard/confirm", { state: getOrdersToConfirm() })}>Submit</Button>
			</div>
		</div>

	);
}

function PickingRow(
	{ order_id, productName, orderedQty, setPickEvent, }:
		{
			order_id: number,
			productName: string,
			orderedQty: number,
			setPickEvent: (event: PickEvent | null) => void,
		}
) {
	const [error, setError] = useState<string | null>(null);
	const [errorColor, setErrorColor] = useState<string>(null);
	return (
		<TableRow>
			<TableCell>{order_id}</TableCell>
			<TableCell>{productName}</TableCell>
			<TableCell>{orderedQty}</TableCell>
			<TableCell>
				<div className="flex flex-col gap-2">
					<Input
						type="number"
						placeholder="Enter the picked quantity"
						onChange={(event) => {
							const value = event.target.valueAsNumber;
							if (value > orderedQty) {
								setError(
									"Picked quantity is greater than ordered quantity.\nPlease select at most as many as ordered.",
								);
								setErrorColor("red");
							} else if (value < orderedQty) {
								setError(
									"Picked quantity is less than ordered quantity",
								);
								setErrorColor("orange");
							} else {
								setError(null);
							}
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
