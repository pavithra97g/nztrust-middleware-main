import { createFileRoute } from "@tanstack/react-router";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { ShieldAlert } from "lucide-react";

export const Route = createFileRoute("/error")({
  component: AccessDenied,
});

function AccessDenied() {
  return (
    <div className="p-4 flex justify-center items-center min-h-screen">
      <Alert className="max-w-md">
        <ShieldAlert className="h-5 w-5" />
        <AlertTitle>Access Denied</AlertTitle>
        <AlertDescription>
          <p>Please verify your account details and try again.</p>
          <ul className="list-inside list-disc text-sm">
            <li>Ensure you have a stable network connection.</li>
            <li>Use a genuine, authorized system.</li>
            <li>Confirm that you are not using automated tools.</li>
          </ul>
        </AlertDescription>
      </Alert>
    </div>
  );
}
