import { Users } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import CsvMemberCheck from "@/components/CsvMemberCheck";
import MemberSearch from "@/components/MemberSearch";

const MemberCheck = () => {
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
              Sjekk mange på én gang med CSV, eller søk opp én enkelt person
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="csv" className="space-y-6">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="csv">CSV-opplasting</TabsTrigger>
                <TabsTrigger value="search">Søk enkeltperson</TabsTrigger>
              </TabsList>
              <TabsContent value="csv" forceMount className="mt-0 data-[state=inactive]:hidden">
                <CsvMemberCheck />
              </TabsContent>
              <TabsContent value="search" forceMount className="mt-0 data-[state=inactive]:hidden">
                <MemberSearch />
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </section>
  );
};

export default MemberCheck;
