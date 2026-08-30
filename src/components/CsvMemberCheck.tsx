import { useState, useEffect, useRef } from "react";
import { Upload, CheckCircle, XCircle, AlertCircle, Mail, Copy, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { parseCSV, ParsedMemberData } from "@/lib/csv-parser";
import { batchCheckMembership, ApiResponse, MemberInfo } from "@/lib/ntnui-api";
import { getMembershipStatus, NOT_FOUND_LABEL, VALID_LABEL } from "@/lib/membership-status";

interface MemberResult {
  phone: string;
  name?: string;
  email?: string;
  isMember: boolean;
  memberInfo?: MemberInfo;
  error?: string;
  apiResponse?: ApiResponse;
}

const CsvMemberCheck = () => {
  const [file, setFile] = useState<File | null>(null);
  const [results, setResults] = useState<MemberResult[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState<{ completed: number; total: number } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isFetchingData, setIsFetchingData] = useState(false);
  const [elapsedTime, setElapsedTime] = useState(0);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const startTimeRef = useRef<number | null>(null);

  // Timer for elapsed time
  useEffect(() => {
    if (isFetchingData && startTimeRef.current) {
      timerRef.current = setInterval(() => {
        const elapsed = Math.floor((Date.now() - startTimeRef.current!) / 1000);
        setElapsedTime(elapsed);
      }, 100);
    } else {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
      setElapsedTime(0);
      startTimeRef.current = null;
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [isFetchingData]);

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
        setIsFetchingData(false);
        setElapsedTime(0);
      } else {
        setError("Vennligst last opp en CSV-fil (.csv)");
      }
    }
  };

  const handleUpload = async () => {
    if (!file) {
      setError("Vennligst last opp en CSV-fil");
      return;
    }
    
    setIsProcessing(true);
    setError(null);
    setResults([]);
    setIsFetchingData(true);
    setElapsedTime(0);
    startTimeRef.current = Date.now();
    
    try {
      // Read and parse CSV file
      const csvContent = await file.text();
      const parsedData = parseCSV(csvContent);
      
      if (parsedData.length === 0) {
        setError("Ingen gyldige telefonnumre funnet i CSV-filen");
        setIsProcessing(false);
        setIsFetchingData(false);
        return;
      }
      
      setProgress({ completed: 0, total: parsedData.length });
      
      // Extract phone numbers
      const phoneNumbers = parsedData.map(row => row.phone);
      
      // Batch check membership
      const apiResults = await batchCheckMembership(
        phoneNumbers,
        (completed, total) => {
          setProgress({ completed, total });
        }
      );
      
      // Data hentet, stopp fetch indicator
      setIsFetchingData(false);
      
      // Process results
      const memberResults: MemberResult[] = parsedData.map(row => {
        const apiResponse = apiResults.get(row.phone);
        
        if (!apiResponse) {
          return {
            phone: row.phone,
            name: row.name,
            email: row.email,
            isMember: false,
            error: "No API response received"
          };
        }
        
        if (apiResponse.success) {
          return {
            phone: row.phone,
            name: row.name || apiResponse.data?.name,
            email: row.email,
            isMember: true,
            memberInfo: apiResponse.data,
            apiResponse
          };
        } else {
          return {
            phone: row.phone,
            name: row.name,
            email: row.email,
            isMember: false,
            error: apiResponse.error,
            apiResponse: apiResponse,
            memberInfo: apiResponse.data
          };
        }
      });
      
      setResults(memberResults);
      
    } catch (err) {
      console.error('Error processing CSV:', err);
      setError(err instanceof Error ? err.message : 'En feil oppstod under behandling av filen');
      setIsFetchingData(false);
    } finally {
      setIsProcessing(false);
      setProgress(null);
    }
  };
  return (
    <div className="space-y-6">
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

      {/* Fetching Data Indicator */}
      {isFetchingData && !progress && (
        <Alert className="border-primary/50 bg-primary/5">
          <Loader2 className="h-4 w-4 animate-spin text-primary" />
          <AlertDescription className="flex flex-col gap-2">
            <div className="flex items-center gap-2">
              <span className="font-medium">Sjekker medlemskap...</span>
              {elapsedTime > 0 && (
                <span className="text-xs text-muted-foreground">({elapsedTime}s)</span>
              )}
            </div>
            <p className="text-sm text-muted-foreground">
              Slår opp mot medlemsdatabasen. Første oppslag kan ta et minutt hvis API-et må vekkes.
            </p>
            <Progress 
              value={undefined} 
              className="w-full"
            />
          </AlertDescription>
        </Alert>
      )}

      {/* Progress Indicator */}
      {progress && (
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>Sjekker medlemskap...</span>
            <span>{progress.completed} / {progress.total}</span>
          </div>
          <Progress 
            value={progress.total > 0 ? (progress.completed / progress.total) * 100 : 0} 
            className="w-full"
          />
        </div>
      )}

      {file && (
        <Button
          onClick={handleUpload}
          disabled={isProcessing}
          className="w-full bg-gradient-to-r from-primary to-primary/90 hover:opacity-90"
          size="lg"
        >
          {isProcessing ? "Behandler..." : "Sjekk medlemskap"}
        </Button>
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
            {results.map((result, index) => {
              const data = result.apiResponse?.data;
              const status = data
                ? getMembershipStatus({ tf_valid: !!data.tf_valid, ntnui_valid: !!data.ntnui_valid })
                : result.isMember
                ? { valid: true, label: VALID_LABEL }
                : { valid: false, label: NOT_FOUND_LABEL };

              return (
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
                    {!status.valid && (
                      <span className="text-xs text-destructive">
                        {status.label}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    {status.valid ? (
                      <>
                        <CheckCircle className="w-5 h-5 text-green-500" />
                        <span className="text-sm text-green-600 dark:text-green-400 font-medium">
                          {status.label}
                        </span>
                      </>
                    ) : (
                      <>
                        <XCircle className="w-5 h-5 text-destructive" />
                        <span className="text-sm text-destructive font-medium">
                          {status.label}
                        </span>
                      </>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
          
          {/* Summary Statistics */}
          <div className="mt-4 p-4 bg-muted/30 rounded-lg">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                  {results.filter(r => r.isMember).length}
                </div>
                <div className="text-muted-foreground">Gyldige</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-destructive">
                  {results.filter(r => !r.isMember).length}
                </div>
                <div className="text-muted-foreground">Mangler medlemskap</div>
              </div>
            </div>
          </div>

          {/* Email list for non-members */}
          {(() => {
            const nonMembers = results.filter(r => !r.isMember && r.email);
            
            if (nonMembers.length > 0) {
              const emails = nonMembers.map(r => r.email).filter((email): email is string => !!email);
              const emailList = emails.join('; ');
              
              return (
                <div className="mt-4 p-4 bg-destructive/10 border border-destructive/20 rounded-lg">
                  <div className="flex items-start gap-3">
                    <Mail className="w-5 h-5 text-destructive mt-0.5 flex-shrink-0" />
                    <div className="flex-1">
                      <h4 className="font-semibold text-destructive mb-2">
                        E-poster for medlemmer uten gyldig medlemskap ({nonMembers.length})
                      </h4>
                      <div className="bg-background p-3 rounded border border-border/50 mb-2">
                        <p className="text-sm text-muted-foreground break-all">{emailList}</p>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          navigator.clipboard.writeText(emailList);
                        }}
                        className="w-full"
                      >
                        <Copy className="w-4 h-4 mr-2" />
                        Kopier alle e-poster
                      </Button>
                      <p className="text-xs text-muted-foreground mt-2">
                        E-postene er separert med semikolon (;) og kan kopieres direkte til e-postklient.
                      </p>
                    </div>
                  </div>
                </div>
              );
            }
            return null;
          })()}
        </div>
      )}
          
    </div>
  );
};

export default CsvMemberCheck;
