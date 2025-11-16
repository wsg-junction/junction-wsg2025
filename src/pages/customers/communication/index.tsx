import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { Header } from "../components/Header/Header";

const days = [
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
    "Sunday",
];


export default function CommunicationPreferencesPage() {
    const navigate = useNavigate();
    return <div className="flex flex-col">
        <Header />
        <div className="flex flex-row gap-8 p-4">
            {
                days.map(day =>
                    <div className="flex w-full flex-col gap-8">
                        <div className="text-xl pb-3">{day}</div>
                        <TimeCard title="Notifications" day={day} />
                        <TimeCard title="Calls" day={day} />
                    </div>
                )
            }
        </div>
        <div className="flex self-end pr-8 pb-8">
            <Button onClick={() => navigate('/customer')}>Submit</Button>
        </div>
    </div>
}

interface ComPref {
    visible: boolean,
    startTime: string,
    endTime: string,
};

function TimeCard({ title, day }: { title: string, day: string }) {
    const [pref, setPref]: [ComPref, (pref: ComPref) => void] = useState(() => {
        const stored = localStorage.getItem(`com_${day}_${title}`);
        return stored !== null ? JSON.parse(stored) : {
            visible: true,
            startTime: "09:00",
            endTime: "18:00",
        };
    });
    useEffect(() => {
        localStorage.setItem(`com_${day}_${title}`, JSON.stringify(pref));
    }, [pref]);
    return <Card>
        <CardHeader>
            <div className="flex flex-row justify-between">
                <div>{title}</div>
                <label className="inline-flex items-center cursor-pointer">
                    <input type="checkbox" className="w-4" checked={pref.visible} onChange={e => { pref.visible = e.target.checked; setPref({ ...pref }); }} />
                </label>
            </div>
        </CardHeader>
        {pref.visible && <CardContent className="flex flex-col gap-3">
            <Label htmlFor="time-picker" className="px-1">
                From
            </Label>
            <Input
                type="time"
                id="time-picker"
                step="1"
                defaultValue={pref.startTime}
                onChange={(e) => {
                    pref.startTime = e.target.value;
                    setPref({ ...pref });
                }}
                className="bg-background appearance-none [&::-webkit-calendar-picker-indicator]:hidden [&::-webkit-calendar-picker-indicator]:appearance-none"
            />
            <Label htmlFor="time-picker" className="px-1">
                To
            </Label>
            <Input
                type="to"
                id="time-picker"
                step="1"
                defaultValue={pref.endTime}
                onChange={(e) => {
                    pref.endTime = e.target.value;
                    setPref({ ...pref });
                }}
                className="bg-background appearance-none [&::-webkit-calendar-picker-indicator]:hidden [&::-webkit-calendar-picker-indicator]:appearance-none"
            />
        </CardContent>}
    </Card>
}