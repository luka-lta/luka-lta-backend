import {Alert, AlertDescription, AlertTitle} from "@/components/ui/alert.tsx";
import type {UseQueryResult} from "@tanstack/react-query";
import {useMemo} from "react";
import {ZodError} from "zod";

type QueryErrorDisplayProps = {
    query: UseQueryResult;
}

export const QueryErrorDisplay: React.FC<QueryErrorDisplayProps> = ({ query }) => {
    const errorMessage = useMemo(() => {
        const error = query.error;
        if (error instanceof ZodError) {
            const errorList = error.errors.map(err => `- ${err.code}: ${err.message} (Path: "${err.path.join('.') || '.'}")`).join('.\n');
            return `Server returned invalid response! Schema validation failed, because of:\n${errorList}`;
        }

        if (error instanceof Error) {
            return error.message;
        }
        return 'An unknown error occurred, while fetching data.';
    }, [query.error]);

    return (
        <Alert variant="destructive">
            <AlertTitle>Error, failed to fetch data!</AlertTitle>
            <AlertDescription><pre>{errorMessage}</pre></AlertDescription>
        </Alert>
    );
}
