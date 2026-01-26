import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CreditCard, Receipt, Clock, CheckCircle, AlertCircle, DollarSign } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { format, isPast, isFuture, addDays } from "date-fns";
import { fr } from "date-fns/locale";

interface SchoolFee {
  id: string;
  student_id: string;
  title: string;
  description: string | null;
  amount: number;
  due_date: string;
  school_year: string;
  fee_type: string;
  status: string;
  created_at: string;
}

interface Payment {
  id: string;
  fee_id: string;
  student_id: string;
  amount: number;
  payment_method: string;
  transaction_reference: string | null;
  paid_at: string;
  fee?: SchoolFee;
}

const Payments = () => {
  const navigate = useNavigate();
  const { user, isLoading } = useAuth();
  const { toast } = useToast();
  const [fees, setFees] = useState<SchoolFee[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [selectedFee, setSelectedFee] = useState<SchoolFee | null>(null);
  const [paymentMethod, setPaymentMethod] = useState("");
  const [isPaymentDialogOpen, setIsPaymentDialogOpen] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    if (!isLoading && !user) {
      navigate("/auth");
    }
  }, [user, isLoading, navigate]);

  useEffect(() => {
    if (user) {
      fetchFees();
      fetchPayments();
    }
  }, [user]);

  const fetchFees = async () => {
    if (!user) return;

    const { data, error } = await supabase
      .from("school_fees")
      .select("*")
      .eq("student_id", user.id)
      .order("due_date", { ascending: true });

    if (error) {
      console.error("Error fetching fees:", error);
      return;
    }

    setFees(data || []);
  };

  const fetchPayments = async () => {
    if (!user) return;

    const { data, error } = await supabase
      .from("payments")
      .select("*, fee:school_fees(*)")
      .eq("student_id", user.id)
      .order("paid_at", { ascending: false });

    if (error) {
      console.error("Error fetching payments:", error);
      return;
    }

    setPayments(data || []);
  };

  const handlePayment = async () => {
    if (!selectedFee || !paymentMethod || !user) return;

    setIsProcessing(true);

    try {
      // Create payment record
      const { error: paymentError } = await supabase.from("payments").insert({
        fee_id: selectedFee.id,
        student_id: user.id,
        amount: selectedFee.amount,
        payment_method: paymentMethod,
        transaction_reference: `TXN-${Date.now()}`,
      });

      if (paymentError) throw paymentError;

      // Update fee status
      const { error: feeError } = await supabase
        .from("school_fees")
        .update({ status: "paid" })
        .eq("id", selectedFee.id);

      if (feeError) throw feeError;

      toast({
        title: "Paiement effectué",
        description: `Le paiement de ${selectedFee.amount.toLocaleString()} FCFA a été enregistré.`,
      });

      setIsPaymentDialogOpen(false);
      setSelectedFee(null);
      setPaymentMethod("");
      fetchFees();
      fetchPayments();
    } catch (error) {
      console.error("Error processing payment:", error);
      toast({
        title: "Erreur",
        description: "Impossible d'effectuer le paiement",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const getStatusBadge = (fee: SchoolFee) => {
    if (fee.status === "paid") {
      return <Badge className="bg-green-500/10 text-green-600 border-green-500/20">Payé</Badge>;
    }
    if (isPast(new Date(fee.due_date))) {
      return <Badge variant="destructive">En retard</Badge>;
    }
    if (isFuture(addDays(new Date(fee.due_date), -7)) === false) {
      return <Badge className="bg-yellow-500/10 text-yellow-600 border-yellow-500/20">Échéance proche</Badge>;
    }
    return <Badge variant="secondary">En attente</Badge>;
  };

  const getFeeTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      tuition: "Frais de scolarité",
      registration: "Frais d'inscription",
      exam: "Frais d'examen",
      transport: "Transport",
      canteen: "Cantine",
      other: "Autre",
    };
    return labels[type] || type;
  };

  const pendingFees = fees.filter((f) => f.status !== "paid");
  const paidFees = fees.filter((f) => f.status === "paid");
  const totalPending = pendingFees.reduce((sum, f) => sum + Number(f.amount), 0);
  const totalPaid = paidFees.reduce((sum, f) => sum + Number(f.amount), 0);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />
      <main className="flex-1 pt-20">
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
              <CreditCard className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-foreground">Frais Scolaires</h1>
              <p className="text-muted-foreground">Gestion des paiements et historique</p>
            </div>
          </div>

          {/* Summary Cards */}
          <div className="grid md:grid-cols-3 gap-4 mb-8">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Total à payer</p>
                    <p className="text-2xl font-bold text-foreground">
                      {totalPending.toLocaleString()} FCFA
                    </p>
                  </div>
                  <div className="w-12 h-12 rounded-full bg-yellow-500/10 flex items-center justify-center">
                    <Clock className="h-6 w-6 text-yellow-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Total payé</p>
                    <p className="text-2xl font-bold text-green-600">
                      {totalPaid.toLocaleString()} FCFA
                    </p>
                  </div>
                  <div className="w-12 h-12 rounded-full bg-green-500/10 flex items-center justify-center">
                    <CheckCircle className="h-6 w-6 text-green-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Frais en retard</p>
                    <p className="text-2xl font-bold text-destructive">
                      {pendingFees.filter((f) => isPast(new Date(f.due_date))).length}
                    </p>
                  </div>
                  <div className="w-12 h-12 rounded-full bg-destructive/10 flex items-center justify-center">
                    <AlertCircle className="h-6 w-6 text-destructive" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <Tabs defaultValue="pending" className="space-y-4">
            <TabsList>
              <TabsTrigger value="pending" className="gap-2">
                <Clock className="h-4 w-4" />
                À payer ({pendingFees.length})
              </TabsTrigger>
              <TabsTrigger value="history" className="gap-2">
                <Receipt className="h-4 w-4" />
                Historique ({payments.length})
              </TabsTrigger>
            </TabsList>

            <TabsContent value="pending" className="space-y-4">
              {pendingFees.length === 0 ? (
                <Card>
                  <CardContent className="py-12 text-center">
                    <CheckCircle className="h-12 w-12 mx-auto mb-4 text-green-500" />
                    <p className="text-lg font-medium">Tous les frais sont payés !</p>
                    <p className="text-muted-foreground">Aucun paiement en attente</p>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid gap-4">
                  {pendingFees.map((fee) => (
                    <Card key={fee.id}>
                      <CardContent className="p-6">
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <h3 className="font-semibold text-foreground">{fee.title}</h3>
                              {getStatusBadge(fee)}
                            </div>
                            <p className="text-sm text-muted-foreground mb-1">
                              {getFeeTypeLabel(fee.fee_type)} • {fee.school_year}
                            </p>
                            {fee.description && (
                              <p className="text-sm text-muted-foreground">{fee.description}</p>
                            )}
                            <p className="text-sm mt-2">
                              Échéance:{" "}
                              <span className={isPast(new Date(fee.due_date)) ? "text-destructive font-medium" : ""}>
                                {format(new Date(fee.due_date), "dd MMMM yyyy", { locale: fr })}
                              </span>
                            </p>
                          </div>
                          <div className="flex items-center gap-4">
                            <div className="text-right">
                              <p className="text-2xl font-bold text-foreground">
                                {Number(fee.amount).toLocaleString()}
                              </p>
                              <p className="text-sm text-muted-foreground">FCFA</p>
                            </div>
                            <Dialog
                              open={isPaymentDialogOpen && selectedFee?.id === fee.id}
                              onOpenChange={(open) => {
                                setIsPaymentDialogOpen(open);
                                if (!open) {
                                  setSelectedFee(null);
                                  setPaymentMethod("");
                                }
                              }}
                            >
                              <DialogTrigger asChild>
                                <Button onClick={() => setSelectedFee(fee)}>
                                  <DollarSign className="h-4 w-4 mr-2" />
                                  Payer
                                </Button>
                              </DialogTrigger>
                              <DialogContent>
                                <DialogHeader>
                                  <DialogTitle>Effectuer un paiement</DialogTitle>
                                </DialogHeader>
                                <div className="space-y-4 py-4">
                                  <div className="p-4 bg-muted rounded-lg">
                                    <p className="font-medium">{fee.title}</p>
                                    <p className="text-2xl font-bold mt-2">
                                      {Number(fee.amount).toLocaleString()} FCFA
                                    </p>
                                  </div>

                                  <div className="space-y-2">
                                    <Label>Mode de paiement</Label>
                                    <Select value={paymentMethod} onValueChange={setPaymentMethod}>
                                      <SelectTrigger>
                                        <SelectValue placeholder="Sélectionnez un mode de paiement" />
                                      </SelectTrigger>
                                      <SelectContent>
                                        <SelectItem value="mobile_money">Mobile Money</SelectItem>
                                        <SelectItem value="bank_transfer">Virement bancaire</SelectItem>
                                        <SelectItem value="cash">Espèces</SelectItem>
                                        <SelectItem value="check">Chèque</SelectItem>
                                      </SelectContent>
                                    </Select>
                                  </div>

                                  <Button
                                    onClick={handlePayment}
                                    disabled={!paymentMethod || isProcessing}
                                    className="w-full"
                                  >
                                    {isProcessing ? "Traitement en cours..." : "Confirmer le paiement"}
                                  </Button>
                                </div>
                              </DialogContent>
                            </Dialog>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="history" className="space-y-4">
              {payments.length === 0 ? (
                <Card>
                  <CardContent className="py-12 text-center">
                    <Receipt className="h-12 w-12 mx-auto mb-4 text-muted-foreground/50" />
                    <p className="text-lg font-medium">Aucun paiement</p>
                    <p className="text-muted-foreground">L'historique des paiements apparaîtra ici</p>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid gap-4">
                  {payments.map((payment) => (
                    <Card key={payment.id}>
                      <CardContent className="p-6">
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <h3 className="font-semibold text-foreground">
                                {payment.fee?.title || "Paiement"}
                              </h3>
                              <Badge className="bg-green-500/10 text-green-600 border-green-500/20">
                                Payé
                              </Badge>
                            </div>
                            <p className="text-sm text-muted-foreground">
                              {format(new Date(payment.paid_at), "dd MMMM yyyy à HH:mm", {
                                locale: fr,
                              })}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              Mode: {payment.payment_method.replace("_", " ")}
                            </p>
                            {payment.transaction_reference && (
                              <p className="text-xs text-muted-foreground mt-1">
                                Réf: {payment.transaction_reference}
                              </p>
                            )}
                          </div>
                          <div className="text-right">
                            <p className="text-2xl font-bold text-green-600">
                              {Number(payment.amount).toLocaleString()}
                            </p>
                            <p className="text-sm text-muted-foreground">FCFA</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Payments;
