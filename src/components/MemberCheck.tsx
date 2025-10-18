import { useState } from "react";
import { Upload, CheckCircle, XCircle, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

interface MemberResult {
  name: string;
  isMember: boolean;
}

const MemberCheck = () => {
  const [file, setFile] = useState<File | null>(null);
  const [results, setResults] = useState<MemberResult[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile && selectedFile.type === "text/csv") {
      setFile(selectedFile);
      setResults([]);
    }
  };

  const handleUpload = async () => {
    if (!file) return;
    
    setIsProcessing(true);
    
    // Placeholder for API call - user will implement later
    // This simulates processing time
    setTimeout(() => {
      // Mock results for demonstration
      const mockResults: MemberResult[] = [
        { name: "Eksempel Person 1", isMember: true },
        { name: "Eksempel Person 2", isMember: false },
        { name: "Eksempel Person 3", isMember: true },
      ];
      setResults(mockResults);
      setIsProcessing(false);
    }, 1500);
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
            <div className="border-2 border-dashed border-border rounded-lg p-8 text-center hover:border-primary/50 transition-colors">
              <input
                type="file"
                accept=".csv"
                onChange={handleFileChange}
                className="hidden"
                id="csv-upload"
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
                    CSV-fil med medlemsinformasjon
                  </p>
                </div>
              </label>
            </div>

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
                      <span className="font-medium">{result.name}</span>
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
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </section>
  );
};

export default MemberCheck;
