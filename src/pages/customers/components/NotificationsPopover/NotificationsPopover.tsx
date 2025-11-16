import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover.tsx';
import { Button } from '@/components/ui/button.tsx';
import { Bell } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { Badge } from '@/components/ui/badge.tsx';
import { firestore, useMyOrders, useQuery } from '@/lib/firebase.ts';
import { collection, query, where } from 'firebase/firestore';
import { doc, updateDoc } from '@firebase/firestore';

export interface Notification {
  id: string;
  title: string;
  message: string;
  read: boolean;
  orderId?: string;
}

export const NotificationsPopover = () => {
  const orders = useMyOrders();
  const [unread, setUnread] = useState(0);

  const q = useMemo(() => {
    const orderIds = orders.map((o) => o.id);
    if (orderIds.length === 0) {
      return query(collection(firestore, 'notifications'), where('orderId', '==', ''));
    }

    return query(collection(firestore, 'notifications'), where('orderId', 'in', orderIds));
  }, [orders]);
  const notifications = useQuery<Notification>(q);

  useEffect(() => {
    if (!notifications) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setUnread(0);
    } else {
      const unreadCount = notifications.filter((n) => !n.read).length;
      setUnread(unreadCount);
    }
  }, [notifications]);

  const onMarkNotificationsAsRead = async () => {
    setUnread(0);
    if (!notifications?.length) return;

    const toUpdate = notifications.filter((n) => !n.read);
    if (toUpdate.length === 0) return;

    try {
      await Promise.all(
        toUpdate.map((n) =>
          updateDoc(doc(firestore, 'notifications', n.id), {
            read: true,
          }),
        ),
      );
    } catch (error) {
      console.error('Error while marking notifications as read.', error);
    }
  };

  return (
    <Popover
      onOpenChange={(open) => {
        if (open) return;
        onMarkNotificationsAsRead();
      }}>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          aria-label="Notifications">
          <Bell className="size-4" />
          {unread > 0 && <Badge className="ml-1 absolute translate-x-2 -translate-y-2">{unread}</Badge>}
        </Button>
      </PopoverTrigger>
      <PopoverContent>
        <div className="w-64">
          {notifications && notifications.length > 0 ? (
            <div className="flex flex-col gap-2">
              {notifications?.map((notification) => (
                <div
                  key={notification.id}
                  className="p-2 border-b last:border-0 relative">
                  <div
                    className={
                      'absolute top-2 right-2 w-2 h-2 rounded-full bg-blue-500 ' +
                      (notification.read ? 'hidden' : '')
                    }></div>
                  <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{notification.title}</p>
                  <p className="text-xs text-gray-600 dark:text-gray-400">{notification.message}</p>
                </div>
              ))}
            </div>
          ) : (
            <div className=" text-sm text-gray-600 dark:text-gray-400">No notifications</div>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
};
