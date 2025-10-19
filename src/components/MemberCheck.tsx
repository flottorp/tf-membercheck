import { useState } from "react";
import { Upload, CheckCircle, XCircle, Users, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { parseCSV, ParsedMemberData } from "@/lib/csv-parser";
import { batchCheckMembership, ApiResponse } from "@/lib/ntnui-api";

interface MemberResult {
  phone: string;
  name?: string;
  isMember: boolean;
  memberInfo?: any;
  error?: string;
  apiResponse?: ApiResponse;
}

const MemberCheck = () => {
  const [file, setFile] = useState<File | null>(null);
  const [password, setPassword] = useState<string>("");
  const [results, setResults] = useState<MemberResult[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState<{ completed: number; total: number } | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      // Accept CSV files and files with .csv extension
      const isCSV = selectedFile.type === "text/csv" || 
                   selectedFile.name.toLowerCase().endsWith('.csv') ||
                   selectedFile.type === "application/csv";
      
      if (isCSV) {
        setFile(selectedFile);
        setResults([]);
        setError(null);
        setProgress(null);
      } else {
        setError("Vennligst last opp en CSV-fil (.csv)");
      }
    }
  };

  const handleUpload = async () => {
    if (!file || !password) {
      setError("Vennligst last opp en CSV-fil og skriv inn passord");
      return;
    }
    
    setIsProcessing(true);
    setError(null);
    setResults([]);
    setProgress(null);
    
    try {
      // Read and parse CSV file
      const csvContent = await file.text();
      const parsedData = parseCSV(csvContent);
      
      if (parsedData.length === 0) {
        setError("Ingen gyldige telefonnumre funnet i CSV-filen");
        setIsProcessing(false);
        return;
      }
      
      // Extract phone numbers
      const phoneNumbers = parsedData.map(row => row.phone);
      
      // Batch check membership
      const apiResults = await batchCheckMembership(
        phoneNumbers,
        password,
        (completed, total) => {
          setProgress({ completed, total });
        }
      );
      
      // Process results
      const memberResults: MemberResult[] = parsedData.map(row => {
        const apiResponse = apiResults.get(row.phone);
        
        if (!apiResponse) {
          return {
            phone: row.phone,
            name: row.name,
            isMember: false,
            error: "No API response received"
          };
        }
        
        if (apiResponse.success) {
          return {
            phone: row.phone,
            name: row.name || apiResponse.data?.name,
            isMember: true,
            memberInfo: apiResponse.data,
            apiResponse
          };
        } else {
          return {
            phone: row.phone,
            name: row.name,
            isMember: false,
            error: apiResponse.error,
            apiResponse
          };
        }
      });
      
      setResults(memberResults);
      
    } catch (err) {
      console.error('Error processing CSV:', err);
      setError(err instanceof Error ? err.message : 'En feil oppstod under behandling av filen');
    } finally {
      setIsProcessing(false);
      setProgress(null);
    }
  };

  return (
    <section className="py-20 px-4 bg-gradient-to-b from-background to-muted/30">
      <div className="max-w-4xl mx-auto">
        <Card className="shadow-[var(--shadow-elevation)] border-border/50">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 w-16 h-16 rounded-full bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center">
              <Users className="w-8 h-8 text-primary-foreground" />
            </div>
            <CardTitle className="text-3xl">Medlemssjekk</CardTitle>
            <CardDescription className="text-base">
              Last opp en CSV-fil for å sjekke medlemsstatus
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Password Input */}
            <div className="space-y-2">
              <Label htmlFor="password">NTNUI API Passord</Label>
              <Input
                id="password"
                type="password"
                placeholder="Skriv inn passord for NTNUI API"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={isProcessing}
              />
              <p className="text-xs text-muted-foreground">
                Dette passordet brukes til å autentisere mot NTNUI API for hver telefonnummer
              </p>
            </div>

            {/* File Upload */}
            <div className="border-2 border-dashed border-border rounded-lg p-8 text-center hover:border-primary/50 transition-colors">
              <input
                type="file"
                accept=".csv"
                onChange={handleFileChange}
                className="hidden"
                id="csv-upload"
                disabled={isProcessing}
              />
              <label
                htmlFor="csv-upload"
                className="cursor-pointer flex flex-col items-center gap-3"
              >
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                  <Upload className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <p className="text-sm font-medium text-foreground">
                    {file ? file.name : "Klikk for å laste opp CSV"}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    CSV-fil med telefonnumre (kolonne må inneholde "phone", "telefon", "mobil", etc.)
                  </p>
                </div>
              </label>
            </div>

            {/* Error Alert */}
            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {/* Progress Indicator */}
            {progress && (
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Behandler medlemmer...</span>
                  <span>{progress.completed} / {progress.total}</span>
                </div>
                <Progress 
                  value={(progress.completed / progress.total) * 100} 
                  className="w-full"
                />
              </div>
            )}

            {file && (
              <Button
                onClick={handleUpload}
                disabled={isProcessing || !password}
                className="w-full bg-gradient-to-r from-primary to-primary/90 hover:opacity-90"
                size="lg"
              >
                {isProcessing ? "Behandler..." : password ? "Sjekk medlemskap" : "Skriv inn passord først"}
              </Button>
            )}

            {/* Debug info - remove this after testing */}
            {file && (
              <div className="text-xs text-muted-foreground">
                Debug: Fil lastet opp: {file.name} | Passord oppgitt: {password ? "Ja" : "Nei"}
              </div>
            )}

            {results.length > 0 && (
              <div className="space-y-3 animate-in fade-in-50 duration-500">
                <h3 className="font-semibold text-lg flex items-center gap-2">
                  Resultater
                  <span className="text-sm text-muted-foreground font-normal">
                    ({results.length} personer)
                  </span>
                </h3>
                <div className="space-y-2">
                  {results.map((result, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-4 rounded-lg bg-card border border-border/50 hover:shadow-[var(--shadow-soft)] transition-shadow"
                    >
                      <div className="flex flex-col gap-1">
                        <span className="font-medium">
                          {result.name || result.phone}
                        </span>
                        {result.name && (
                          <span className="text-xs text-muted-foreground">
                            {result.phone}
                          </span>
                        )}
                        {result.error && (
                          <span className="text-xs text-destructive">
                            {result.error}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        {result.isMember ? (
                          <>
                            <CheckCircle className="w-5 h-5 text-green-500" />
                            <span className="text-sm text-green-600 dark:text-green-400 font-medium">
                              Medlem
                            </span>
                          </>
                        ) : (
                          <>
                            <XCircle className="w-5 h-5 text-destructive" />
                            <span className="text-sm text-destructive font-medium">
                              Ikke medlem
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
                
                {/* Summary Statistics */}
                <div className="mt-4 p-4 bg-muted/30 rounded-lg">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                        {results.filter(r => r.isMember).length}
                      </div>
                      <div className="text-muted-foreground">Medlemmer</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-destructive">
                        {results.filter(r => !r.isMember).length}
                      </div>
                      <div className="text-muted-foreground">Ikke medlemmer</div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </section>
  );
};

export default MemberCheck;
