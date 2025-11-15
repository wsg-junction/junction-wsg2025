import { useTranslation } from 'react-i18next';
import {
    Select,
    SelectContent,
    SelectGroup,
    SelectItem,
    SelectLabel,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select.tsx';
import Flag from 'react-flagkit';
import { SelectIcon } from '@radix-ui/react-select';

export function LanguageModeToggle() {
    const { t, i18n } = useTranslation();

    const changeLanguageHandler = (lang: string) => {
        i18n.changeLanguage(lang);
    };

    const languageFlagMap = {
        'de-DE': 'DE',
        'en-GB': 'GB',
        'fi-FI': 'FI',
        'sv-FI': 'SE',
        fi: 'FI',
        sv: 'SE',
    };

    return (
        <Select
            onValueChange={(event) => changeLanguageHandler(event)}
            value={i18n.language}>
            <SelectTrigger className="w-[70px]">
                <SelectValue placeholder="Select a fruit">
                    <Flag
                        country={
                            languageFlagMap[i18n.language] ?? i18n.language.split('-')?.[2] ?? 'GB'
                        }></Flag>
                </SelectValue>
            </SelectTrigger>
            <SelectContent>
                <SelectGroup>
                    <SelectLabel>Languages</SelectLabel>
                    <SelectItem value={'de-DE'}>
                        <div className={'flex item-center gap-5 pe-4'}>
                            <Flag country={'DE'}></Flag>
                            <span className={'text-base'}>Deutsch</span>
                        </div>
                    </SelectItem>
                    <SelectItem value={'en-GB'}>
                        <div className={'flex item-center gap-5 pe-4'}>
                            <Flag country={'GB'}></Flag>
                            <span className={'text-base'}>English</span>
                        </div>
                    </SelectItem>
                    <SelectItem value={'fi-FI'}>
                        <div className={'flex item-center gap-5 pe-4'}>
                            <Flag country={'FI'}></Flag>
                            <span className={'text-base'}>Suomi</span>
                        </div>
                    </SelectItem>
                    <SelectItem value={'sv-FI'}>
                        <div className={'flex item-center gap-5 pe-4'}>
                            <Flag country={'SE'}></Flag>
                            <span className={'text-base'}>Svenska</span>
                        </div>
                    </SelectItem>
                </SelectGroup>
            </SelectContent>
        </Select>
    );
}
