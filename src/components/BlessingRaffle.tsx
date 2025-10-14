"use client";

import { useState, useMemo } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import * as Tone from "tone";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Confetti } from "@/components/Confetti";
import { Church, Gift, Loader2, RefreshCw, Share2 } from "lucide-react";

const formSchema = z.object({
    numTickets: z.coerce.number().min(1, { message: "Debe haber al menos 1 boleto." }).max(10000, { message: "El máximo es 10,000 boletos." }),
    numPrizes: z.coerce.number().min(1, { message: "Debe haber al menos 1 premio." }).max(100, { message: "El máximo es 100 premios." }),
}).refine(data => data.numPrizes <= data.numTickets, {
    message: "El número de premios no puede ser mayor que el de boletos.",
    path: ["numPrizes"],
});

type RaffleStatus = "setup" | "raffling" | "results";

const WhatsAppIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg
      role="img"
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <path
        d="M12.06 10.84c-.28.14-1.02.5-1.18.55-.16.05-.28.08-.41.03-.13-.05-.28-.13-.39-.23-.11-.1-.28-.27-.42-.42-.14-.14-.28-.32-.39-.45-.11-.13-.23-.28-.3-.39-.08-.11-.05-.18.03-.26.08-.08.16-.11.23-.16.05-.03.11-.08.16-.11.05-.03.08-.05.11-.08s.05-.05.08-.08c.03-.03.05-.05.08-.08l.03-.03c.03-.03.06-.06.08-.1.03-.03.05-.08.06-.11.03-.03.01-.08-.01-.13-.03-.05-.27-.63-.37-.88-.1-.25-.2-.21-.28-.21-.08 0-.16.01-.23.01-.08 0-.18.03-.28.13-.1.1-.39.38-.39.93s.39 1.08.45 1.15c.05.08.78 1.25 1.9 1.7.9.38 1.13.3 1.34.28.21-.03.65-.27.75-.53.1-.27.1-.5.08-.55-.03-.05-.08-.08-.16-.11zm11.93 2.1a12.03 12.03 0 11-20.2-6.04A12.03 12.03 0 0123.99 12.94zM5.33 19.34l.32.18c1.83 1.03 3.86 1.58 5.97 1.58.03 0 .06 0 .08 0l.1-.01.03-.01h.03c4.95 0 9.1-3.44 10.33-8.05l.2-1.03-.68-.34a10.03 10.03 0 00-19.1 5.3l.01.2z"
        fill="currentColor"
      />
    </svg>
);  

export function BlessingRaffle() {
  const [status, setStatus] = useState<RaffleStatus>("setup");
  const [winners, setWinners] = useState<number[]>([]);
  const [playSound, setPlaySound] = useState(true);

  const synth = useMemo(() => {
    if (typeof window !== 'undefined') {
        return new Tone.PolySynth(Tone.Synth, {
            oscillator: { type: "sine" },
            envelope: { attack: 0.01, decay: 0.2, sustain: 0.2, release: 0.5 },
        }).toDestination();
    }
    return null;
  }, []);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      numTickets: 20,
      numPrizes: 3,
    },
  });

  const playChime = () => {
    if (playSound && synth) {
        const now = Tone.now();
        synth.triggerAttackRelease("C5", "8n", now);
        synth.triggerAttackRelease("E5", "8n", now + 0.1);
        synth.triggerAttackRelease("G5", "8n", now + 0.2);
    }
  }

  const onSubmit = async (data: z.infer<typeof formSchema>) => {
    if (typeof window !== 'undefined') {
        await Tone.start();
    }
    setStatus("raffling");

    setTimeout(() => {
      const tickets = Array.from({ length: data.numTickets }, (_, i) => i + 1);
      const shuffled = tickets.sort(() => 0.5 - Math.random());
      const newWinners = shuffled.slice(0, data.numPrizes);

      setWinners(newWinners);
      setStatus("results");
      playChime();
    }, 3000);
  };

  const handleReset = () => {
    setStatus("setup");
    setWinners([]);
  };

  const handleShare = () => {
    const winnerText = winners.join(', ');
    const text = `¡Felicidades a los ganadores del Sorteo de Bendición! 🎉\n\nNúmeros ganadores: ${winnerText}\n\n¡Gracias a todos por participar!`;
    const url = `https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`;
    window.open(url, '_blank');
  }

  return (
    <>
      {status === 'results' && <Confetti />}
      <Card className="w-full max-w-md shadow-2xl transition-all duration-500">
        <CardHeader className="text-center">
          <div className="flex justify-center items-center gap-3">
            <Church className="h-8 w-8 text-primary" />
            <CardTitle className="font-headline text-3xl md:text-4xl">Blessing Raffle</CardTitle>
          </div>
          <CardDescription>Sorteos comunitarios para la iglesia</CardDescription>
        </CardHeader>

        {status === "setup" && (
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)}>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="numTickets"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Boletos vendidos</FormLabel>
                        <FormControl>
                          <Input type="number" placeholder="Ej: 20" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="numPrizes"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Premios</FormLabel>
                        <FormControl>
                          <Input type="number" placeholder="Ej: 3" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <div className="flex items-center space-x-2">
                    <Switch id="sound-mode" checked={playSound} onCheckedChange={setPlaySound} />
                    <Label htmlFor="sound-mode">Sonido de celebración</Label>
                </div>
              </CardContent>
              <CardFooter>
                <Button type="submit" className="w-full bg-accent hover:bg-accent/90 text-accent-foreground">
                  <Gift className="mr-2 h-4 w-4" />
                  Sortear
                </Button>
              </CardFooter>
            </form>
          </Form>
        )}

        {status === "raffling" && (
            <CardContent className="flex flex-col items-center justify-center space-y-4 py-16">
                <Loader2 className="h-16 w-16 animate-spin text-primary" />
                <p className="font-headline text-2xl text-muted-foreground">Seleccionando ganadores...</p>
            </CardContent>
        )}

        {status === "results" && (
            <>
            <CardContent className="flex flex-col items-center justify-center space-y-4 pt-6 pb-4">
                <h3 className="font-headline text-2xl">¡Números Ganadores!</h3>
                <div className="grid grid-cols-3 gap-3 md:gap-4 py-4">
                    {winners.map((winner, index) => (
                        <div
                            key={winner}
                            className="relative flex aspect-square items-center justify-center rounded-full bg-primary shadow-lg animate-winner-appear"
                            style={{ animationDelay: `${index * 150}ms` }}
                        >
                            <span className="font-bold text-3xl text-primary-foreground">{winner}</span>
                        </div>
                    ))}
                </div>
            </CardContent>
            <CardFooter className="grid grid-cols-2 gap-3">
                <Button variant="outline" onClick={handleReset}>
                    <RefreshCw className="mr-2 h-4 w-4" />
                    Reiniciar
                </Button>
                <Button onClick={handleShare} className="bg-green-500 hover:bg-green-600 text-white">
                    <WhatsAppIcon className="mr-2 h-4 w-4" />
                    Compartir
                </Button>
            </CardFooter>
            </>
        )}
      </Card>
    </>
  );
}
