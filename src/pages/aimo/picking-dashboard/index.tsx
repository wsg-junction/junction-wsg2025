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
import type {
	DateTimezoneSetter,
	ValueSetter,
} from "node_modules/date-fns/parse/_lib/Setter";
import { useReducer, useState } from "react";
import { useTranslation } from "react-i18next";

type PickEvent = {
	quantity: number;
	datetime: Date;
};

type Product = {
	name: string;
	ordered_qty: number;
	pick_event: PickEvent | null;
};

type Order = {
	id: number;
	products: Product[];
};

const orders = [
	{
		id: 1,
		products: [
			{
				name: "Product A",
				ordered_qty: 10,
				pick_event: null,
			},
			{
				name: "Product B",
				ordered_qty: 5,
				pick_event: null,
			},
		],
	},
] as Order[];

export default function AimoPickingDashboard() {
	const { t } = useTranslation();

	const [, rebuild] = useReducer((x) => x + 1, 0);
	const rows = [];
	for (const [i, order] of orders.entries()) {
		for (const [j, product] of order.products.entries()) {
			rows.push(
				PickingRow(
					i + j * orders.length,
					order.id,
					product.name,
					product.ordered_qty,
					product.pick_event,
					(event) => {
						console.log("here");
						product.pick_event = event;
						rebuild();
					},
				),
			);
		}
	}
	return (
		<div className="flex flex-col gap-4">
			<Table>
				<TableHeader>
					<TableRow>
						<TableHead>Order ID</TableHead>
						<TableHead>Product name</TableHead>
						<TableHead>Ordered Quantity</TableHead>
						<TableHead style={{width:"33%"}}>Picked Quantity</TableHead>
					</TableRow>
				</TableHeader>
				<TableBody>{rows}</TableBody>
			</Table>
			<Button className="w-32 self-end">Submit</Button>
		</div>
	);
}

function PickingRow(
	key: number,
	order_id: number,
	productName: string,
	orderedQty: number,
	pickEvent: PickEvent | null,
	setPickEvent: (event: PickEvent | null) => void,
) {
	const [error, setError] = useState<string | null>(null);
	return (
		<TableRow key={key}  >
			<TableCell>{order_id}</TableCell>
			<TableCell>{productName}</TableCell>
			<TableCell>{orderedQty}</TableCell>
			<TableCell>
				<div className="flex flex-col gap-2">
					<Input
						type="number"
						value={pickEvent?.quantity}
						placeholder="Enter the picked quantity"
						onChange={(event) => {
							const value = event.target.valueAsNumber;
							if (value > orderedQty) {
								setError(
									"Picked quantity is greater than ordered quantity",
								);
							} else if (value < orderedQty) {
								setError(
									"Picked quantity is less than ordered quantity",
								);
							} else {
								setError(null);
							}
							const pickEvent = {
								quantity: value,
								datetime: new Date(),
							};
							setPickEvent(pickEvent);
						}}
						onSelect={(event) => event.target.select()}
					/>
					<p style={{color: "red"}}>
						{error}
					</p>
				</div>
			</TableCell>
		</TableRow>
	);
}
