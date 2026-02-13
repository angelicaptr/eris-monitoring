import { Card } from "@/Components/ui/card";
import { Badge } from "@/Components/ui/badge";
import { Button } from "@/Components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/Components/ui/tabs";
import { Copy, Terminal, AlertCircle, BookOpen } from "lucide-react";
import { toast } from "sonner";
import { PageHeader } from "@/Components/ui/page-header";

export function DokumentasiAPI() {
  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("Code successfully copied!");
  };

  const endpointUrl = "http://localhost:8000/api/logs";

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <PageHeader
        title="API Documentation"
        description="System error monitoring integration guide for IT teams."
        icon={BookOpen}
      />

      <Card className="p-6 bg-slate-900 border-slate-800 text-slate-100">
        <div className="flex items-start gap-4">
          <Terminal className="w-8 h-8 text-cyan-400 mt-1" />
          <div>
            <h3 className="font-semibold text-xl mb-2 text-cyan-500">Identification Guide</h3>
            <p className="text-slate-300">
              This system uses <strong>API Key</strong> to identify the sending application.
              The API Key must be sent via <strong>Header</strong>, not Body.
            </p>
          </div>
        </div>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Endpoint Information</h3>
          <div className="space-y-4">
            <div>
              <Label>Base URL</Label>
              <div className="flex gap-2 mt-1">
                <code className="flex-1 bg-slate-950 text-cyan-400 px-4 py-2 rounded font-mono text-sm border border-slate-800">
                  {endpointUrl}
                </code>
                <Button variant="outline" size="sm" onClick={() => handleCopy(endpointUrl)} className="dark:bg-slate-900 dark:border-slate-800 dark:text-slate-200 dark:hover:bg-slate-800">
                  <Copy className="w-4 h-4" />
                </Button>
              </div>
            </div>
            <div>
              <Label>Method</Label>
              <div className="mt-1">
                <Badge className="bg-green-600 text-white hover:bg-green-700">POST</Badge>
              </div>
            </div>
            <div>
              <Label>Required Headers</Label>
              <div className="mt-2 space-y-2 font-mono text-sm">
                <div className="flex items-center justify-between bg-slate-100 dark:bg-slate-900 p-2 rounded">
                  <span className="text-slate-600 dark:text-slate-400">Content-Type</span>
                  <span className="font-bold text-slate-900 dark:text-slate-200">application/json</span>
                </div>
                <div className="flex items-center justify-between bg-slate-100 dark:bg-slate-900 p-2 rounded border-l-4 border-cyan-500">
                  <span className="text-slate-600 dark:text-slate-400">X-API-KEY</span>
                  <span className="font-bold text-slate-900 dark:text-slate-200">YOUR_API_KEY</span>
                </div>
              </div>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Request Body Structure</h3>
          <div className="relative h-[250px]">
            <pre className="bg-slate-950 text-slate-100 p-4 rounded-lg overflow-auto text-sm h-full font-mono border border-slate-800">
              {`{
  // Required
  "message": "Short error message",
  
  // Optional (Default: Auto-detect / Error)
  // Values: critical, warning, error
  "severity": "critical",

  // Optional
  "stack_trace": "Complete error trace...",
  
  // Optional (Format: YYYY-MM-DD HH:mm:ss)
  // Set error occurrence time (for simulation/backdate)
  "happened_at": "2025-12-01 08:30:00",
  
  // Optional (Arbitrary object)
  "metadata": {
    "user_id": 123,
    "path": "/transaction/pay",
    "custom_field": "value"
  }
}`}
            </pre>
          </div>
        </Card>
      </div>

      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Implementation Code Examples</h3>
        <Tabs defaultValue="javascript">
          <TabsList>
            <TabsTrigger value="javascript">JavaScript (Fetch)</TabsTrigger>
            <TabsTrigger value="php">PHP (cURL)</TabsTrigger>
            <TabsTrigger value="python">Python (Requests)</TabsTrigger>
          </TabsList>

          <TabsContent value="javascript" className="mt-4">
            <div className="relative">
              <pre className="bg-slate-950 text-green-400 p-4 rounded-lg overflow-x-auto text-sm font-mono border border-slate-800">
                {`const sendLog = async (error) => {
  await fetch('${endpointUrl}', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-API-KEY': 'YOUR_ACTUAL_API_KEY_HERE'
    },
    body: JSON.stringify({
      message: error.message,
      stack_trace: error.stack,
      severity: 'critical', 
      happened_at: '2025-12-01 08:00:00', // Opsional: Backdate log
      metadata: {
        url: window.location.href,
        user_agent: navigator.userAgent
      }
    })
  });
}`}
              </pre>
              <Button size="icon" variant="ghost" className="absolute top-2 right-2 text-slate-400 hover:text-white" onClick={() => handleCopy(`await fetch('${endpointUrl}', { ... }`)}>
                <Copy className="w-4 h-4" />
              </Button>
            </div>
          </TabsContent>

          <TabsContent value="php" className="mt-4">
            <div className="relative">
              <pre className="bg-slate-950 text-blue-400 p-4 rounded-lg overflow-x-auto text-sm font-mono border border-slate-800">
                {`$ch = curl_init('${endpointUrl}');
curl_setopt($ch, CURLOPT_POST, 1);
curl_setopt($ch, CURLOPT_HTTPHEADER, [
    'Content-Type: application/json',
    'X-API-KEY: YOUR_ACTUAL_API_KEY_HERE'
]);
curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode([
    'message' => 'Database connection failed',
    'severity' => 'critical',
    'metadata' => ['db_host' => '127.0.0.1']
]));
curl_exec($ch);
curl_close($ch);`}
              </pre>
            </div>
          </TabsContent>

          <TabsContent value="python" className="mt-4">
            <div className="relative">
              <pre className="bg-slate-950 text-yellow-400 p-4 rounded-lg overflow-x-auto text-sm font-mono border border-slate-800">
                {`import requests

requests.post(
    '${endpointUrl}',
    headers={
        'X-API-KEY': 'YOUR_ACTUAL_API_KEY_HERE'
    },
    json={
        'message': 'Division by zero error',
        'severity': 'warning',
        'metadata': {'module': 'calculation_engine'}
    }
)`}
              </pre>
            </div>
          </TabsContent>
        </Tabs>
      </Card>

      <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-900 rounded-lg p-4 flex gap-3 text-yellow-800 dark:text-yellow-200 text-sm">
        <AlertCircle className="w-5 h-5 shrink-0" />
        <p>
          <strong>Security:</strong> Never expose the API Key in public frontend code (client-side).
          Use a proxy server or environment variables on the build side if possible.
        </p>
      </div>

    </div>
  );
}

function Label({ children }: { children: React.ReactNode }) {
  return <div className="text-sm font-medium text-slate-500 mb-1 uppercase tracking-wider text-[10px]">{children}</div>;
}
