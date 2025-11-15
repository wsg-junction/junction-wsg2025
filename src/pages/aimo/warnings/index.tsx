import { t } from "i18next";
import { Header } from "../components/Header";

type Warning = {
    title: string;
    description: string;
};

const warnings = [
    {
        title: "Low safety margin for item type #1234",
        description: "The safety margin for item type #1234 has fallen below the recommended threshold. Consider increasing stock levels to prevent potential stockouts."
    },
    {
        title: "Supplier disruptions",
        description: "Supplier XYZ has had increased disruptions for product type #9876"
    },
    {
        title: "Frequent shortages for item #4567",
        description: "Item #4567 has experienced frequent shortages in the past month."
    }
] satisfies Warning[];

export default function AimoWarningsPage() {
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
        </div>
    </div>;
}
