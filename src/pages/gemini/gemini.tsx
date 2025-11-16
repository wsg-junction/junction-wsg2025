import { useState, useRef, useEffect } from "react";
import { generateGeminiRecipe } from "./gemini-functions";

export default function GeminiPage() {
    const [response, setResponse] = useState("");
    const [loading, setLoading] = useState(false);
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    async function handleClick() {
        setLoading(true);
        setResponse("");
        try {

            const content = await generateGeminiRecipe(["chicken", "rice", "broccoli"]);

            setResponse(content);
        } catch {
            setResponse("Error fetching AI response.");
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        if (textareaRef.current) {
            textareaRef.current.style.height = "auto";
            textareaRef.current.style.height = textareaRef.current.scrollHeight + "px";
        }
    }, [response]);

    return (
        <div className="m-8 flex flex-col gap-4 max-w-md">
            <h1 className="text-2xl font-bold">Gemini AI Page</h1>
            <p className="text-gray-700">This page demonstrates the integration of Google Gemini AI.</p>
            <button
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
                onClick={handleClick}
                disabled={loading}
            >
                {loading ? "Loading…" : "Ask Gemini"}
            </button>
            <textarea
                ref={textareaRef}
                className="mt-4 p-2 border rounded bg-gray-50 text-gray-800 resize-none overflow-hidden"
                value={response}
                readOnly
                rows={1}
                style={{ minHeight: "2.5rem" }}
            />
        </div>
    );
}
