import { useTranslation } from 'react-i18next';

export default function DashboardPage() {
    const { t } = useTranslation();
    return <div className="flex flex-col gap-4 p-4">{t('welcome')}</div>;
}
