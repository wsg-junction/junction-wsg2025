import { Card, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Header } from './components/Header';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router';
import { TriangleAlertIcon, WarehouseIcon } from 'lucide-react';

export default function AimoHomePage() {
  return (
    <>
      <Header />
      <div className="flex flex-col md:flex-row gap-4 justify-center items-center md:items-stretch p-4">
        <Card className="w-xs">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <WarehouseIcon />
              Picking Dashboard
            </CardTitle>
            <CardDescription>
              This dashboard shows warehouse staff which products to pick so they can fulfill customer orders.
              While picking, they need to enter information about missing items.
            </CardDescription>
          </CardHeader>
          <div className="flex-1 -mt-6"></div>
          <CardFooter>
            <Button asChild>
              <Link to="/aimo/dashboard">Open</Link>
            </Button>
          </CardFooter>
        </Card>
        <Card className="w-xs">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TriangleAlertIcon /> Warnings Overview
            </CardTitle>
            <CardDescription>
              View warnings about product availabilities and other issues that need attention.
            </CardDescription>
          </CardHeader>
          <div className="flex-1 -mt-6"></div>
          <CardFooter>
            <Button asChild>
              <Link to="/aimo/warnings">Open</Link>
            </Button>
          </CardFooter>
        </Card>
      </div>
    </>
  );
}
