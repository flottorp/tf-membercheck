import { Info } from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

/**
 * Forklarer hva som kreves for TF-medlemskap, og hvorfor tallene her kan
 * avvike fra fasit på medlem.ntnui.no.
 */
const MembershipInfo = () => {
  return (
    <div className="rounded-lg border border-border/50 bg-muted/30 p-4">
      <div className="flex items-start gap-3">
        <Info className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
        <div className="flex-1 min-w-0 space-y-1">
          <p className="text-sm font-medium text-foreground">
            Medlemskapene oppdateres én gang i døgnet
          </p>
          <p className="text-sm text-muted-foreground">
            Tallene her er derfor et øyeblikksbilde og kan avvike fra fasit. Helt
            korrekt informasjon finnes alltid på{" "}
            <a
              href="https://medlem.ntnui.no"
              target="_blank"
              rel="noreferrer"
              className="font-medium text-primary underline underline-offset-4"
            >
              medlem.ntnui.no
            </a>{" "}
            og i kjøpshistorikken som kasserer har tilgang på.
          </p>
        </div>
      </div>

      <Accordion type="single" collapsible className="mt-1">
        <AccordionItem value="krav" className="border-b-0">
          <AccordionTrigger className="py-2 text-sm hover:no-underline">
            Hva kreves for å være TF-medlem?
          </AccordionTrigger>
          <AccordionContent className="text-sm text-muted-foreground space-y-3 pb-3">
            <p>Det er to krav, og begge må være oppfylt:</p>
            <ol className="list-decimal space-y-2 pl-5">
              <li>
                <span className="font-medium text-foreground">
                  Gyldig NTNUI-medlemskap.
                </span>{" "}
                Registreres og fornyes på medlem.ntnui.no.
              </li>
              <li>
                <span className="font-medium text-foreground">
                  Betalt årsavgift hos TF.
                </span>{" "}
                Avgiften er per nå 50 kr og gjelder for et helt kalenderår.
              </li>
            </ol>
            <p>
              Mangler én av delene, er ikke medlemskapet gyldig. Sjekken over
              viser hvilken av dem som mangler.
            </p>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="avvik" className="border-b-0">
          <AccordionTrigger className="py-2 text-sm hover:no-underline">
            Hvorfor kan resultatet avvike?
          </AccordionTrigger>
          <AccordionContent className="text-sm text-muted-foreground space-y-3 pb-3">
            <ul className="list-disc space-y-2 pl-5">
              <li>
                Medlemskapene synkroniseres én gang i døgnet, så helt ferske
                innmeldinger og betalinger er ikke med ennå.
              </li>
              <li>
                Har noen registrert seg med forskjellig telefonnummer eller
                e-postadresse hos NTNUI og hos TF, klarer ikke sjekken å koble de
                to sammen, og personen kan se ut som den mangler medlemskap.
              </li>
              <li>
                Betaling med Google Pay eller Apple Pay blir i noen tilfeller ikke
                registrert på personen.
              </li>
            </ul>
            <p>
              Ved tvil: sjekk alltid mot medlem.ntnui.no og kjøpshistorikken hos
              kasserer før du konkluderer med at noen mangler medlemskap.
            </p>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
};

export default MembershipInfo;
