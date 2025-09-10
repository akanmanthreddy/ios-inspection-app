import { Alert, AlertDescription } from "./ui/alert";
import { InfoIcon } from "lucide-react";
import { isSupabaseConfigured } from "../config/env";

export function DevelopmentNotice() {
  if (isSupabaseConfigured()) {
    return null;
  }

  return (
    <Alert className="mb-6 border-secondary bg-secondary/10">
      <InfoIcon className="h-4 w-4" />
      <AlertDescription>
        <strong>Development Mode:</strong> Running with mock data. To connect to your Supabase database, 
        update the credentials in <code>/config/env.ts</code> or set up environment variables.
      </AlertDescription>
    </Alert>
  );
}