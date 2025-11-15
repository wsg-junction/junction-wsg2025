import { useTranslation } from 'react-i18next';
import { Header } from '@/pages/customers/components/Header/Header.tsx';
import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbList,
    BreadcrumbPage,
    BreadcrumbSeparator,
} from '@/components/ui/breadcrumb.tsx';
import { ProductCard } from '@/pages/customers/components/ProductCard/ProductCard.tsx';
import products from '@/products.json';
import { useState } from 'react';
import { Button } from '@/components/ui/button.tsx';
import { ShoppingCart, Trash2 } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover.tsx';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select.tsx';

export default function CustomerShoppingPage() {
    const { t } = useTranslation();

    const allProducts = products.products;
    const [cart, setCart] = useState(
        localStorage.getItem('cart') ? JSON.parse(localStorage.getItem('cart')) : [],
    );

    const onAddToCart = (product) => {
        const existingItem = cart.find((item) => item.name === product.name);
        if (existingItem) {
            onUpdateItem(existingItem, {
                ...existingItem,
                quantity: existingItem.quantity + 1,
            });
            return;
        }

        setCart([
            ...cart,
            {
                ...product,
                quantity: 1,
            },
        ]);
        localStorage.setItem('cart', JSON.stringify(cart));
        console.log(cart);
    };

    const onUpdateItem = (product, newProduct) => {
        const newCart = cart.map((cartItem) => {
            if (cartItem.name === product.name) {
                return newProduct;
            }
            return cartItem;
        });
        setCart(newCart);
        localStorage.setItem('cart', JSON.stringify(newCart));
    };

    const onRemoveItem = (product) => {
        const newCart = cart.filter((item) => item.name !== product.name);
        setCart(newCart);
        localStorage.setItem('cart', JSON.stringify(newCart));
    };

    return (
        <div>
            <Header></Header>
            <div className="hero-container p-4">
                <Breadcrumb>
                    <BreadcrumbList>
                        <BreadcrumbItem>
                            <BreadcrumbLink href="/customer">{t('shop')}</BreadcrumbLink>
                        </BreadcrumbItem>
                        <BreadcrumbSeparator />
                        <BreadcrumbItem>
                            <BreadcrumbPage>{t('all_products')}</BreadcrumbPage>
                        </BreadcrumbItem>
                    </BreadcrumbList>
                </Breadcrumb>
                <div className="hero"></div>
            </div>
            <div className="px-8 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {allProducts.map((product, index) => {
                    const { name, description, price } = product;
                    const formattedPrice = price.value ? price.value.toFixed(2) : '0.00';
                    const imageName = product.images.find((t) => t.format == 'product')?.savedImage;
                    let imageUrl = null;
                    if (imageName) {
                        imageUrl = '/product_images/' + imageName;
                    }

                    return (
                        <ProductCard
                            key={index}
                            onAddToCart={() => {
                                console.log('CLICK');
                                onAddToCart(product);
                            }}
                            imageUrl={imageUrl}
                            name={name}
                            description={description}
                            rating={3}
                            price={formattedPrice + '€'}></ProductCard>
                    );
                })}
            </div>
            <Popover>
                <PopoverTrigger
                    className={'fixed bottom-3 right-3'}
                    asChild>
                    <Button
                        className={'h-[50px] w-[50px] rounded-full flex justify-center items-center'}
                        variant="default"
                        size={'lg'}>
                        <ShoppingCart />
                    </Button>
                </PopoverTrigger>
                <PopoverContent
                    className={
                        '-translate-x-3 w-full max-w-[90vw] min-w-auto md:max-w-[600px] min-w-[300px]'
                    }>
                    <ShoppingCartList
                        onUpdateItem={onUpdateItem}
                        onRemoveItem={onRemoveItem}
                        cart={cart}></ShoppingCartList>
                </PopoverContent>
            </Popover>
        </div>
    );
}

interface CartItem {
    [key: string]: any;
}
interface ShoppingCartProps {
    cart: CartItem[];
    onRemoveItem: (item: CartItem) => void;
    onUpdateItem: (item: CartItem, newItem: CartItem) => void;
}

const ShoppingCartList = ({ cart, onRemoveItem, onUpdateItem }: ShoppingCartProps) => {
    const updateQuantity = (item, quantity) => {
        onUpdateItem(item, {
            ...item,
            quantity: quantity,
        });
    };
    const removeItem = (item) => {
        onRemoveItem(item);
    };
    const totalPrice = (item) => {
        const { price } = item;
        return price.value ? price.value * item.quantity : 0;
    };

    console.log(cart);

    return (
        <div>
            <b>Shopping Cart</b>
            <div className={'space-y-4 mt-2'}>
                {cart.map((item, index) => {
                    const { name, price } = item;
                    const formattedPrice = price.value ? price.value.toFixed(2) : '0.00';

                    return (
                        <div
                            key={index}
                            className="flex items-center justify-between border-b pb-2 gap-1">
                            <div className="flex-1">
                                <p className="font-medium line-clamp-2 overflow-hidden text-ellipsis">
                                    {name}
                                </p>
                                <p className="text-sm text-muted-foreground">
                                    ${formattedPrice}€
                                    <span className="text-sm text-muted-foreground font-light"> / pcs</span>
                                </p>
                            </div>

                            <Select
                                value={String(item.quantity)}
                                onValueChange={(val) => updateQuantity(item, Number(val))}>
                                <SelectTrigger className="w-16">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    {[...Array(10)].map((_, i) => (
                                        <SelectItem
                                            key={i + 1}
                                            value={String(i + 1)}>
                                            {i + 1}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>

                            <p className="w-20 text-right font-medium">${totalPrice(item).toFixed(2)}€</p>

                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => removeItem(item)}>
                                <Trash2 className="h-4 w-4" />
                            </Button>
                        </div>
                    );
                })}
            </div>
            <hr></hr>
            <div className={'flex justify-between items-center'}>
                <span>Total</span>
                <span className="font-bold">
                    {cart
                        .reduce((a, b) => {
                            return a + totalPrice(b);
                        }, 0)
                        .toFixed(2)}
                    €
                </span>
            </div>
        </div>
    );
};
