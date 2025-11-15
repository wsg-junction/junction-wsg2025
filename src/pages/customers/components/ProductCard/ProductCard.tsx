import { Card, CardContent, CardDescription, CardTitle } from '@/components/ui/card.tsx';
import { ShoppingCart, StarIcon } from 'lucide-react';
import { Button } from '@/components/ui/button.tsx';

interface ProductCardProps {
    name: string;
    description: string;
    price: string;
    rating?: number;
    imageUrl?: string;
    onAddToCart?: () => void;
}

export const ProductCard = ({
    name,
    description,
    price,
    rating,
    imageUrl,
    onAddToCart,
}: ProductCardProps) => {
    return (
        <Card className={'p-0'}>
            <CardContent className="p-3">
                <div className="aspect-square rounded-md mb-2 flex justify-center items-center">
                    <div className={'w-full h-full  p-10'}>
                        {imageUrl ? (
                            <img
                                src={imageUrl}
                                className={'w-full h-full object-contain'}
                            />
                        ) : (
                            'No Image'
                        )}
                    </div>
                </div>
                <CardTitle
                    className="text-sm mb-1 line-clamp-2 h-10"
                    style={{
                        textOverflow: 'ellipsis',
                    }}>
                    {name}
                </CardTitle>
                <div className="flex items-center space-x-1 mb-2 ">
                    <div className="flex">
                        {Array(5)
                            .fill(0)
                            .map((val, index) => {
                                if (index < (rating || 0)) {
                                    return (
                                        <StarIcon
                                            key={index}
                                            className="h-3 w-3 fill-yellow-400 text-yellow-400"
                                        />
                                    );
                                } else {
                                    return (
                                        <StarIcon
                                            key={index}
                                            className="h-3 w-3 text-gray-300"
                                        />
                                    );
                                }
                            })}
                    </div>
                    <span className="text-xs text-muted-foreground">{rating.toFixed(1)}</span>
                </div>
                <div className="flex items-center justify-between">
                    <span className="text-sm font-bold">
                        <span className={'text-lg'}>{price}</span>
                        <span className="text-sm text-muted-foreground font-light"> / pcs</span>
                    </span>
                    <Button
                        onClick={onAddToCart}
                        variant="default"
                        size={'icon'}>
                        <ShoppingCart></ShoppingCart>
                    </Button>
                </div>
            </CardContent>
        </Card>
    );
};
