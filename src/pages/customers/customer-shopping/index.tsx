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
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button.tsx';
import { ShoppingCart, Trash2 } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover.tsx';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select.tsx';
import { useNavigate } from 'react-router';
import { productService, type Product } from '@/services/ProductService';

export default function CustomerShoppingPage() {
    const { t } = useTranslation();
    const [page, setPage] = useState(0);
    const [products, setProducts] = useState<Product[]>([]);
    const [_, setFetchedPages] = useState([]);
    const [isLoading, setIsLoading] = useState(false); // for initial load and page load
    const [totalProducts, setTotalProducts] = useState(0);

    const [cart, setCart] = useState(() => {
        const stored = localStorage.getItem('cart');
        return stored ? JSON.parse(stored) : [];
    });

    useEffect(() => {
        localStorage.setItem('cart', JSON.stringify(cart));
    }, [cart]);

    useEffect(() => {
        const fetchProducts = async () => {
            setIsLoading(true); // start loading
            try {
                const result = await productService.getProducts(page);
                setFetchedPages((prev) => {
                    if (prev.find((p) => p.page === page)) {
                        return prev; // already fetched
                    }
                    const newFetched = [...prev, { page, products: result.data }];
                    setProducts(newFetched.flatMap((p) => p.products));
                    return newFetched;
                });
                setTotalProducts(result.total);
            } catch (error) {
                console.error('Failed to fetch products', error);
            } finally {
                setIsLoading(false); // stop loading
            }
        };
        fetchProducts();
    }, [page]);

    const onLoadMore = () => {
        setPage((prev) => prev + 1);
    };

    const onAddToCart = (product) => {
        const existingItem = cart.find((item) => item.id === product.id);
        if (existingItem) {
            onUpdateItem(existingItem, { ...existingItem, quantity: existingItem.quantity + 1 });
            return;
        }
        setCart([...cart, { ...product, quantity: 1 }]);
    };

    const onUpdateItem = (product, newProduct) => {
        setCart(cart.map((item) => (item.id === product.id ? newProduct : item)));
    };

    const onRemoveItem = (product) => {
        setCart(cart.filter((item) => item.id !== product.id));
    };

    const updateQuantity = (item, quantity) => {
        onUpdateItem(item, {
            ...item,
            quantity: quantity,
        });
    };

    const getQuantityInCart = (cart, product) => {
        const item = cart.find((item) => item.id === product.id);
        return item ? item.quantity : 0;
    };

    return (
        <div>
            <Header />
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

            {isLoading && page === 0 ? (
                <div className="p-8 text-center">Loading products...</div>
            ) : (
                <>
                    <div className="px-8 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-6">
                        {products.map((product, index) => {
                            const { name, description, price } = product;
                            const formattedPrice = price.value ? price.value.toFixed(2) : '0.00';
                            const imageName =
                                product.images?.find((t) => t.format === 'product')?.savedImage ?? null;
                            const imageUrl = imageName ? '/product_images/' + imageName : null;

                            return (
                                <ProductCard
                                    onUpdateCartQuantity={(newQuantity) => {
                                        if (newQuantity === 0) {
                                            onRemoveItem(product);
                                            return;
                                        }
                                        updateQuantity(product, newQuantity);
                                    }}
                                    currentQuantity={getQuantityInCart(cart, product)}
                                    key={index}
                                    onAddToCart={() => onAddToCart(product)}
                                    imageUrl={imageUrl}
                                    name={name}
                                    description={description}
                                    rating={3}
                                    price={formattedPrice + '€'}
                                />
                            );
                        })}
                    </div>
                    <div className="flex justify-center my-8">
                        <Button
                            onClick={onLoadMore}
                            disabled={isLoading}>
                            {isLoading
                                ? 'Loading...'
                                : 'Show More' +
                                  (totalProducts ? ` (${products.length}/${totalProducts})` : '')}
                        </Button>
                    </div>
                </>
            )}

            <Popover>
                <PopoverTrigger
                    className="fixed bottom-3 right-3"
                    asChild>
                    <Button
                        className="h-[50px] w-[50px] rounded-full flex justify-center items-center"
                        variant="default"
                        size="lg">
                        <ShoppingCart />
                    </Button>
                </PopoverTrigger>
                <PopoverContent className="-translate-x-3 w-full max-w-[90vw] min-w-auto md:max-w-[600px] min-w-[300px]">
                    <ShoppingCartList
                        clearCart={() => setCart([])}
                        cart={cart}
                        onUpdateItem={onUpdateItem}
                        onRemoveItem={onRemoveItem}
                    />
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
    clearCart: () => void;
}

const ShoppingCartList = ({ cart, onRemoveItem, onUpdateItem, clearCart }: ShoppingCartProps) => {
    const navigate = useNavigate();
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
                            className="flex items-center justify-between border-b pb-2 gap-1 ">
                            <div className="flex-1">
                                <p className="font-medium line-clamp-2 overflow-hidden text-ellipsis me-2">
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
            <div className={'mt-2 flex justify-end'}>
                <Button
                    onClick={clearCart}
                    variant="ghost"
                    className=" mt-4"
                    disabled={cart.length === 0}>
                    Clear
                </Button>
                <Button
                    onClick={() => {
                        navigate('/customer/checkout');
                    }}
                    className=" mt-4"
                    disabled={cart.length === 0}>
                    Checkout
                </Button>
            </div>
        </div>
    );
};
