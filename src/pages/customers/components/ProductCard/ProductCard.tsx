import { Card, CardContent, CardTitle } from '@/components/ui/card.tsx';
import { ShoppingCart, StarIcon } from 'lucide-react';
import { Button } from '@/components/ui/button.tsx';
import { productService } from '@/services/ProductService';
import { useTranslation } from 'react-i18next';
import { useProductName } from '@/hooks/use-product-name.ts';

interface ProductCardProps {
    id: string;
    rating?: number;
    onUpdateCartQuantity?: (quantity: number) => void;
    currentQuantity?: number;
}

export const ProductCard = ({
    id,
    rating,
    onUpdateCartQuantity,
    currentQuantity,
}: ProductCardProps) => {
    const { t } = useTranslation();
  const getTranslatedProductName = useProductName(i18n);

    const product = productService.getProductById(id)!;
    return (
        <Card className={'p-0'}>
          <CardContent className="p-3">
            <div className="aspect-square rounded-md mb-2 flex justify-center items-center">
              <div className={'w-full h-full  p-10'}>
                {product.image ? (
                  <img
                    src={product.image}
                    alt={getTranslatedProductName(product) || product.names?.[0]?.value || 'Product image'}
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
              {getTranslatedProductName(product)}
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
                    {rating && <span className="text-xs text-muted-foreground">{rating.toFixed(1)}</span>}
                </div>
                <div className="flex items-center justify-between">
                    <span className="text-sm font-bold">
                        <span className={'text-lg'}>{product.priceString}</span>
                        <span className="text-sm text-muted-foreground font-light"> / pcs</span>
                    </span>

                    {(!currentQuantity || currentQuantity === 0) && (
                        <Button
                            onClick={() => onUpdateCartQuantity && onUpdateCartQuantity(1)}
                            variant="default"
                            size={'icon'}>
                            <ShoppingCart></ShoppingCart>
                        </Button>
                    )}

          {currentQuantity && currentQuantity > 0 ? (
            <div className="flex items-center space-x-2 gap-2">
              <Button
                onClick={() => {
                  if (onUpdateCartQuantity) {
                    onUpdateCartQuantity(currentQuantity - 1);
                  }
                }}
                variant="outline"
                size={'icon'}>
                -
              </Button>
              <span>{currentQuantity}</span>
              <Button
                onClick={() => {
                  if (onUpdateCartQuantity) {
                    onUpdateCartQuantity(currentQuantity + 1);
                  }
                }}
                variant="outline"
                size={'icon'}>
                +
              </Button>
            </div>
          ) : (
            ''
          )}
        </div>
      </CardContent>
    </Card>
  );
};
