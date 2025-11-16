import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useProductName } from '@/hooks/use-product-name';
import { firestore, useQuery } from '@/lib/firebase';
import type { TranslatedName } from '@/services/ProductService';
import { collection, doc, updateDoc } from '@firebase/firestore';
import { t } from 'i18next';
import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router';
import { Header } from '../components/Header';
import { ButtonGroup } from '@/components/ui/button-group';
import { ToggleGroup } from '@/components/ui/toggle-group';
import { ToggleGroupItem } from '@radix-ui/react-toggle-group';

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
	products: Item[];
	pushNotificationToken?: string;
};

export default function AimoPickingDashboard() {
	const { t } = useTranslation();

	const orders = useQuery<Order>(useMemo(() => collection(firestore, 'orders'), []));

	async function updateOrder(order: Order) {
		const ref = doc(firestore, 'orders', order.id);
		await updateDoc(ref, order);
	}

	const navigate = useNavigate();
	function getOrdersToConfirm() {
		const ret = [];
		const ordersCopy = structuredClone(orders);
		for (const order of Object.values(ordersCopy)) {
			order.products = Object.values(order.products).filter(
				(it) => it.orderedQuantity !== it.pickEvent?.quantity,
			);
			if (Object.entries(order.products).length > 0) {
				ret.push(order);
			}
		}
		return ret;
	}

	const isSubmitDisabled = useMemo(() => {
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
		const order = orders.find((o) => o.id === orderId)!;
		const product = order.products.find((p) => p.id === productId)!;
		if (pickEvent && pickEvent.quantity > product.orderedQuantity) return;
		product.pickEvent = pickEvent;
		updateOrder(order);
	};
	const getSubmitAction = () => {
		if (getOrdersToConfirm().length > 0) {
			return () => navigate('/aimo/dashboard/confirm', { state: getOrdersToConfirm() });
		}
		return () => navigate('/aimo');
	};
	return (
		<>
			<Header />
			<div className="flex flex-col gap-4 p-8">
				<Table>
					<TableHeader>
						<TableRow>
							<TableHead style={{ width: '10%' }}>{t('order_id')}</TableHead>
							<TableHead>{t('product_name')}</TableHead>
							<TableHead>{t('ordered_quantity')}</TableHead>
							<TableHead style={{ width: '50%' }}>{t('picked_quantity')}</TableHead>
						</TableRow>
					</TableHeader>
					<TableBody>
						{Object.values(orders).flatMap((order) =>
							Object.values(order.products).map((item) => (
								<PickingRow
									order={order}
									item={item}
									setPickEvent={(e) => onPickEvent(e, order.id, item.id)}
								/>
							)),
						)}
					</TableBody>
				</Table>
				<Button
					className="w-32 self-end"
					disabled={isSubmitDisabled}
					onClick={getSubmitAction()}>
					{t('submit')}
				</Button>
			</div>
		</>
	);
}

function PickingRow({
	order,
	item,
	setPickEvent,
}: {
	order: Order;
	item: Item;
	setPickEvent: (event: PickEvent | null) => void;
}) {
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
			{item.id === order.products[0].id && <TableCell rowSpan={order.products.length}>{order.id}</TableCell>}
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
