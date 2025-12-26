import { useState, useEffect, useRef } from "react";
import { Upload, CheckCircle, XCircle, Users, AlertCircle, Mail, Copy, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { parseCSV, ParsedMemberData } from "@/lib/csv-parser";
import { batchCheckMembership, ApiResponse } from "@/lib/ntnui-api";

interface MemberResult {
  phone: string;
  name?: string;
  email?: string;
  isMember: boolean;
  memberInfo?: any;
  error?: string;
  apiResponse?: ApiResponse;
}

const MemberCheck = () => {
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
    setProgress(null);
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
            memberInfo: apiResponse.data // Kan inneholde date_paid selv om ikke gyldig
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
                    <span className="font-medium">Henter medlemskap fra webshop...</span>
                    {elapsedTime > 0 && (
                      <span className="text-xs text-muted-foreground">({elapsedTime}s)</span>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Det kan ta opptil 5 minutter ved første hentering. Data blir cachet i 5 minutter for raskere søk neste gang.
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
                        {result.isMember && result.memberInfo?.date_paid && (
                          <span className="text-xs text-muted-foreground">
                            Kjøpt: {new Date(result.memberInfo.date_paid).toLocaleDateString('nb-NO')}
                            {result.memberInfo.total_memberships > 1 && 
                              ` (${result.memberInfo.total_memberships} totale kjøp)`
                            }
                          </span>
                        )}
                        {!result.isMember && result.memberInfo?.date_paid && (
                          <span className="text-xs text-orange-600 dark:text-orange-400">
                            Kjøpt: {new Date(result.memberInfo.date_paid).toLocaleDateString('nb-NO')}
                          </span>
                        )}
                        {!result.isMember && !result.memberInfo?.date_paid && result.apiResponse?.data && (
                          <span className="text-xs text-destructive">
                            {!result.apiResponse.data.tf_valid && !result.apiResponse.data.ntnui_valid
                              ? 'Mangler TF + NTNUI'
                              : !result.apiResponse.data.tf_valid
                              ? 'Mangler TF'
                              : 'Mangler NTNUI'}
                          </span>
                        )}
                        {!result.isMember && !result.memberInfo?.date_paid && !result.apiResponse?.data && (
                          <span className="text-xs text-destructive">
                            Ikke funnet
                          </span>
                        )}
                      </div>
                      <div className="flex flex-col items-end gap-1">
                        {result.isMember ? (
                          <>
                            <div className="flex items-center gap-2">
                              <CheckCircle className="w-5 h-5 text-green-500" />
                              <span className="text-sm text-green-600 dark:text-green-400 font-medium">
                                Gyldig medlem
                              </span>
                            </div>
                          </>
                        ) : result.memberInfo?.date_paid ? (
                          <>
                            <div className="flex items-center gap-2">
                              <AlertCircle className="w-5 h-5 text-orange-500" />
                              <span className="text-sm text-orange-600 dark:text-orange-400 font-medium">
                                Utgått medlemskap
                              </span>
                            </div>
                          </>
                        ) : result.apiResponse?.data ? (
                          <>
                            <div className="flex items-center gap-2">
                              <XCircle className="w-5 h-5 text-destructive" />
                              <span className="text-sm text-destructive font-medium">
                                {!result.apiResponse.data.tf_valid && !result.apiResponse.data.ntnui_valid
                                  ? 'Mangler TF + NTNUI'
                                  : !result.apiResponse.data.tf_valid
                                  ? 'Mangler TF'
                                  : 'Mangler NTNUI'}
                              </span>
                            </div>
                          </>
                        ) : (
                          <>
                            <div className="flex items-center gap-2">
                              <XCircle className="w-5 h-5 text-destructive" />
                              <span className="text-sm text-destructive font-medium">
                                Ikke funnet
                              </span>
                            </div>
                          </>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
                
                {/* Summary Statistics */}
                <div className="mt-4 p-4 bg-muted/30 rounded-lg">
                  <div className="grid grid-cols-3 gap-4 text-sm">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                        {results.filter(r => r.isMember).length}
                      </div>
                      <div className="text-muted-foreground">Gyldige</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">
                        {results.filter(r => !r.isMember && r.memberInfo?.date_paid).length}
                      </div>
                      <div className="text-muted-foreground">Utgått</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-destructive">
                        {results.filter(r => !r.isMember && !r.memberInfo?.date_paid).length}
                      </div>
                      <div className="text-muted-foreground">Aldri medlem</div>
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
          </CardContent>
        </Card>
      </div>
    </section>
  );
};

export default MemberCheck;