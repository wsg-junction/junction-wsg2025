import { Card, CardContent, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertTriangle, ArrowLeft, Home } from 'lucide-react';

export const NotFoundErrorPage = () => {
  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center p-6">
      <Card className="max-w-3xl w-full">
        <CardContent>
          <div className="flex flex-col items-center gap-6 text-center">
            <div className="rounded-full bg-linear-to-tr from-rose-100 to-amber-50 p-6 shadow-md">
              <AlertTriangle className="size-10 text-rose-600" />
            </div>

            <div>
              <h1 className="text-6xl font-extrabold leading-tight tracking-tight">404</h1>
              <CardTitle className="mt-2">Page not found</CardTitle>
              <CardDescription className="mt-1 text-muted-foreground">
                We couldn’t find the page you’re looking for. It may have been moved or deleted.
              </CardDescription>
            </div>

            <div className="flex flex-col items-center gap-3 sm:flex-row">
              <Button
                asChild
                onClick={() => {
                  localStorage.removeItem('tourStep');
                }}>
                <a
                  href="/"
                  className="inline-flex items-center gap-2">
                  <Home className="size-4" />
                  Take me home
                </a>
              </Button>

              <Button
                variant="outline"
                asChild>
                <a
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    localStorage.removeItem('tourStep');
                    window.history.back();
                  }}
                  className="inline-flex items-center gap-2">
                  <ArrowLeft className="size-4" />
                  Go back
                </a>
              </Button>
            </div>
            <div className="text-xs text-muted-foreground mt-3">
              If you think this is an error, try refreshing or contact support.
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
