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
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import SupermarketMap from '../components/SupermarketMap';

export default function SelectAlternativesPage() {
  const { t } = useTranslation();
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
              <BreadcrumbPage>{t('select_alternatives.title')}</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
        <div className="hero"></div>
      </div>
      <div className="m-8 flex flex-col gap-4">
        <h1>{t('select_alternatives.title')}</h1>
        <Card>
          <CardHeader>
            <div className="flex flex-row gap-4 items-center">
              <img
                src="https://api.valioaimo.fi/medias/96Wx96H-1200Wx1200H-null?context=bWFzdGVyfHJvb3R8MTA3OTZ8aW1hZ2Uvd2VicHxhR1JpTDJoaE55ODRPRGMxT0RVd09UZzVOVGs0THprMlYzZzVOa2hmTVRJd01GZDRNVEl3TUVoZmJuVnNiQXw0NWNmYTkyYWEyMTQwNmQxZGE5YmEwMzlhMjY5MjFlZTNmMTZjNGM3ODA1MTBjNmY4N2M0NjExNTRmMzI2NTBi"
                className="h-16"
              />
              2 crt (80 pcs) Dafgårds sourdough bread dark 40x110g
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex flex-row gap-4">
              <Card>Dafgårds levain multiseed 48x110g</Card>
              <Card>Dafgårds levain multiseed 48x110g</Card>
            </div>
          </CardContent>
          <CardContent>
            <div className="flex flex-row gap-2">
              <Button variant="outline">{t('select_alternatives.alternative_products')}</Button>
              <Button variant="outline">{t('select_alternatives.alternative_recipes')}</Button>
              <Dialog>
                <DialogTrigger asChild>
                  <Button
                    variant="outline"
                    className="cursor-pointer">
                    {t('select_alternatives.supermarket')}
                  </Button>
                </DialogTrigger>
                <DialogContent className="flex flex-col w-[90vw]! max-w-full!">
                  <DialogHeader className="flex-auto">
                    <DialogTitle>{t('select_alternatives.supermarket')}</DialogTitle>
                  </DialogHeader>
                  <SupermarketMap />
                </DialogContent>
              </Dialog>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
