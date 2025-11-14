import {Card, CardContent, CardHeader, CardTitle} from "@/components/ui/card.tsx";
import {Button} from "@/components/ui/button.tsx";
import {Copy} from "lucide-react";
import {Textarea} from "@/components/ui/textarea.tsx";

interface jsonProps<T> {
    jsonData: T;
}

const RawJsonData = <T,>({ jsonData }: jsonProps<T>) => {
    const jsonString = JSON.stringify(jsonData, null, 2);


    const handleCopy = async () => {
        try {
            await navigator.clipboard.writeText(jsonString);
        } catch (err) {
            console.error("Copy failed", err);
        }
    };

    return (
        <Card className="w-full max-w-xl mx-auto">
            <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>JSON Preview</CardTitle>
                <Button variant="outline" size="icon" onClick={handleCopy}>
                    <Copy className="h-4 w-4" />
                </Button>
            </CardHeader>
            <CardContent>
                <Textarea
                    value={jsonString}
                    readOnly
                    className="font-mono text-sm h-64"
                />
            </CardContent>
        </Card>
    );
}

export default RawJsonData;