import { t } from "i18next";
import { Header } from "../components/Header";
import { useMemo } from "react";
import { collection } from "firebase/firestore";
import { firestore, useQuery } from "@/lib/firebase";

type Warning = {
    title: string;
    description: string;
};


export default function AimoWarningsPage() {
    const warnings = useQuery<Warning>(useMemo(() => collection(firestore, "warnings"), []));
    return <div>
        <Header />
        <div className="flex flex-col gap-4 p-4">
            <p className="text-xl">Warnings</p>
            {warnings.map((warning, index) =>
                <div key={index} className="p-4 border border-yellow-400 bg-yellow-100 rounded-lg">
                    <div className="text-md font-bold">{warning.title}</div>
                    <div>{warning.description}</div>
                </div>
            )}
            {warnings.length === 0 && <div>No warnings</div>}
        </div>
    </div>;
}
