import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import { Header } from '../components/Header/Header';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb.tsx';
import { useTranslation } from 'react-i18next';
import { Checkbox } from '@/components/ui/checkbox.tsx';

export default function CommunicationPreferencesPage() {
  const { t } = useTranslation();

  const days = [
    t('monday'),
    t('tuesday'),
    t('wednesday'),
    t('thursday'),
    t('friday'),
    t('saturday'),
    t('sunday'),
  ];

  const navigate = useNavigate();
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
        <div className="hero mt-4">
          <h1 className={'text-lg font-bold'}>{t('communication_preferences')}</h1>
          <h3 className={'text-gray-800 dark:text-gray-400'}>
            {t('set_your_communication_preferences_below')}
          </h3>
        </div>

        <div
          className="
          mt-6
          grid
          gap-6
          grid-cols-1
          sm:grid-cols-2
          md:grid-cols-3
          lg:grid-cols-5
        ">
          {days.map((day) => (
            <div
              key={day}
              className="flex flex-col gap-4 p-4 rounded-xl shadow-sm border">
              <div className="text-xl font-semibold">{day}</div>

              <TimeCard
                title="Notifications"
                day={day}
              />
              <TimeCard
                title="Calls"
                day={day}
              />
            </div>
          ))}
        </div>

        <div className="flex self-end pr-8 pb-8 justify-end">
          <Button onClick={() => navigate('/customer')}>Submit</Button>
        </div>
      </div>
    </div>
  );
}

interface ComPref {
  visible: boolean;
  startTime: string;
  endTime: string;
}

function TimeCard({ title, day }: { title: string; day: string }) {
  const [pref, setPref] = useState<ComPref>(() => {
    const stored = localStorage.getItem(`com_${day}_${title}`);
    return stored !== null
      ? JSON.parse(stored)
      : {
          visible: true,
          startTime: '09:00',
          endTime: '18:00',
        };
  });

  useEffect(() => {
    localStorage.setItem(`com_${day}_${title}`, JSON.stringify(pref));
  }, [pref]);

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-row justify-between">
          <div>{title}</div>
          <label className="inline-flex items-center cursor-pointer">
            <Checkbox
              id="terms"
              checked={pref.visible}
              onCheckedChange={(value) => {
                setPref((pref) => ({ ...pref, visible: !!value }));
              }}
            />
          </label>
        </div>
      </CardHeader>
      {pref.visible && (
        <CardContent className="flex flex-col gap-3">
          <Label
            htmlFor="time-picker"
            className="px-1">
            From
          </Label>
          <Input
            type="time"
            id="time-picker"
            step="1"
            defaultValue={pref.startTime}
            onChange={(e) => {
              setPref((pref) => ({ ...pref, startTime: e.target.value }));
            }}
            className="bg-background appearance-none [&::-webkit-calendar-picker-indicator]:hidden [&::-webkit-calendar-picker-indicator]:appearance-none"
          />
          <Label
            htmlFor="time-picker"
            className="px-1">
            To
          </Label>
          <Input
            type="to"
            id="time-picker"
            step="1"
            defaultValue={pref.endTime}
            onChange={(e) => {
              setPref((pref) => ({ ...pref, endTime: e.target.value }));
            }}
            className="bg-background appearance-none [&::-webkit-calendar-picker-indicator]:hidden [&::-webkit-calendar-picker-indicator]:appearance-none"
          />
        </CardContent>
      )}
    </Card>
  );
}
