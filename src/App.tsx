import { APIProvider } from '@vis.gl/react-google-maps';
import { Outlet } from 'react-router';

export default function App() {
    return (
        <APIProvider apiKey={'AIzaSyAfKvZy0XgyZgdCXnFbQO-3pX_gpWdbGu4'}>
            <Outlet />
        </APIProvider>
    );
    /*
      return (
          <SidebarProvider>
              <AppSidebar />
              <SidebarInset>
                  <header className="flex me-4 justify-between h-16 shrink-0 items-center gap-2">
                      <div className="flex items-center gap-2 px-4">
                          <SidebarTrigger className="-ml-1" />
                          <Separator
                              orientation="vertical"
                              className="mr-2 data-[orientation=vertical]:h-4"
                          />
                          <Breadcrumb>
                              <BreadcrumbList>
                                  <BreadcrumbItem className="hidden md:block">
                                      <BreadcrumbLink href="#">Building Your Application</BreadcrumbLink>
                                  </BreadcrumbItem>
                                  <BreadcrumbSeparator className="hidden md:block" />
                                  <BreadcrumbItem>
                                      <BreadcrumbPage>Data Fetching</BreadcrumbPage>
                                  </BreadcrumbItem>
                              </BreadcrumbList>
                          </Breadcrumb>
                      </div>
                      <div>
                          <ThemeModeToggle />
                      </div>
                  </header>
                  <div className="flex flex-1 flex-col gap-4 p-4 pt-0"></div>
              </SidebarInset>
          </SidebarProvider>
      );
       */
}
