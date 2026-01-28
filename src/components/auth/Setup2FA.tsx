import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Shield, Smartphone, Key, Check, Copy, RefreshCw, AlertTriangle } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
// @ts-ignore - otplib types need proper import
import * as otplib from "otplib";
import QRCode from "qrcode";

// Get authenticator from otplib
const authenticator = otplib.authenticator || otplib.default?.authenticator;

export const Setup2FA = () => {
    const { user } = useAuth();
    const [isOpen, setIsOpen] = useState(false);
    const [step, setStep] = useState<"generate" | "verify" | "backup">("generate");
    const [secret, setSecret] = useState("");
    const [qrCodeUrl, setQrCodeUrl] = useState("");
    const [verificationCode, setVerificationCode] = useState("");
    const [backupCodes, setBackupCodes] = useState<string[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [is2FAEnabled, setIs2FAEnabled] = useState(false);

    // Check if 2FA is already enabled
    useEffect(() => {
        const check2FAStatus = async () => {
            if (!user?.id) return;
            try {
                // Use any to bypass Supabase typing for new tables
                const { data } = await (supabase as any)
                    .from("totp_secrets")
                    .select("is_enabled")
                    .eq("user_id", user.id)
                    .single();
                if (data?.is_enabled) {
                    setIs2FAEnabled(true);
                }
            } catch {
                // Table might not exist yet
            }
        };
        check2FAStatus();
    }, [user?.id]);

    // Générer un nouveau secret TOTP
    const generateSecret = async () => {
        setIsLoading(true);
        try {
            const newSecret = authenticator.generateSecret();
            setSecret(newSecret);

            // Générer l'URL TOTP
            const otpAuthUrl = authenticator.keyuri(
                user?.email || "user",
                "iDETUDE",
                newSecret
            );

            // Générer le QR code
            const qrUrl = await QRCode.toDataURL(otpAuthUrl);
            setQrCodeUrl(qrUrl);
            setStep("verify");
        } catch (error) {
            console.error("Erreur génération 2FA:", error);
            toast.error("Erreur lors de la génération du code 2FA");
        } finally {
            setIsLoading(false);
        }
    };

    // Vérifier le code TOTP
    const verifyCode = async () => {
        setIsLoading(true);
        try {
            const isValid = authenticator.verify({
                token: verificationCode,
                secret: secret,
            });

            if (!isValid) {
                toast.error("Code invalide. Veuillez réessayer.");
                setIsLoading(false);
                return;
            }

            // Générer des codes de secours
            const codes = Array.from({ length: 8 }, () =>
                Math.random().toString(36).substring(2, 10).toUpperCase()
            );
            setBackupCodes(codes);

            // Sauvegarder dans Supabase
            const { error } = await (supabase as any).from("totp_secrets").upsert({
                user_id: user?.id,
                secret_encrypted: secret,
                is_enabled: true,
                backup_codes: codes,
            });

            if (error) throw error;

            setIs2FAEnabled(true);
            setStep("backup");
            toast.success("2FA activé avec succès!");
        } catch (error) {
            console.error("Erreur vérification 2FA:", error);
            toast.error("Erreur lors de l'activation du 2FA");
        } finally {
            setIsLoading(false);
        }
    };

    // Désactiver 2FA
    const disable2FA = async () => {
        setIsLoading(true);
        try {
            const { error } = await (supabase as any)
                .from("totp_secrets")
                .delete()
                .eq("user_id", user?.id);

            if (error) throw error;

            setIs2FAEnabled(false);
            setSecret("");
            setQrCodeUrl("");
            setBackupCodes([]);
            setStep("generate");
            toast.success("2FA désactivé");
        } catch (error) {
            console.error("Erreur désactivation 2FA:", error);
            toast.error("Erreur lors de la désactivation");
        } finally {
            setIsLoading(false);
        }
    };

    // Copier les codes de secours
    const copyBackupCodes = () => {
        navigator.clipboard.writeText(backupCodes.join("\n"));
        toast.success("Codes copiés dans le presse-papier");
    };

    return (
        <Card>
            <CardHeader>
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <Shield className="h-5 w-5 text-primary" />
                        <CardTitle className="text-lg">Authentification à deux facteurs</CardTitle>
                    </div>
                    <Badge variant={is2FAEnabled ? "default" : "secondary"}>
                        {is2FAEnabled ? "Activé" : "Désactivé"}
                    </Badge>
                </div>
                <CardDescription>
                    Protégez votre compte Super Admin avec une authentification à deux facteurs
                </CardDescription>
            </CardHeader>
            <CardContent>
                {is2FAEnabled ? (
                    <div className="space-y-4">
                        <div className="flex items-center gap-2 text-green-600">
                            <Check className="h-4 w-4" />
                            <span className="text-sm">Votre compte est protégé par 2FA</span>
                        </div>
                        <Button variant="destructive" onClick={disable2FA} disabled={isLoading}>
                            {isLoading ? <RefreshCw className="h-4 w-4 animate-spin mr-2" /> : null}
                            Désactiver 2FA
                        </Button>
                    </div>
                ) : (
                    <Dialog open={isOpen} onOpenChange={setIsOpen}>
                        <DialogTrigger asChild>
                            <Button className="gap-2">
                                <Smartphone className="h-4 w-4" />
                                Configurer 2FA
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-md">
                            <DialogHeader>
                                <DialogTitle>Configuration 2FA</DialogTitle>
                                <DialogDescription>
                                    {step === "generate" && "Générez un code QR pour votre application d'authentification"}
                                    {step === "verify" && "Scannez le QR code et entrez le code de vérification"}
                                    {step === "backup" && "Sauvegardez vos codes de secours"}
                                </DialogDescription>
                            </DialogHeader>

                            <div className="space-y-4 py-4">
                                {step === "generate" && (
                                    <div className="text-center space-y-4">
                                        <div className="p-4 bg-muted rounded-lg">
                                            <Key className="h-12 w-12 mx-auto text-primary mb-2" />
                                            <p className="text-sm text-muted-foreground">
                                                Utilisez une application comme Google Authenticator, Authy ou 1Password
                                            </p>
                                        </div>
                                        <Button onClick={generateSecret} disabled={isLoading} className="w-full">
                                            {isLoading ? <RefreshCw className="h-4 w-4 animate-spin mr-2" /> : null}
                                            Générer le code QR
                                        </Button>
                                    </div>
                                )}

                                {step === "verify" && (
                                    <div className="space-y-4">
                                        <div className="flex justify-center">
                                            {qrCodeUrl && (
                                                <img src={qrCodeUrl} alt="QR Code 2FA" className="w-48 h-48 rounded-lg" />
                                            )}
                                        </div>
                                        <div className="text-center">
                                            <p className="text-xs text-muted-foreground mb-1">Ou entrez manuellement:</p>
                                            <code className="text-xs bg-muted p-1 rounded break-all">{secret}</code>
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="code">Code de vérification</Label>
                                            <Input
                                                id="code"
                                                type="text"
                                                inputMode="numeric"
                                                pattern="[0-9]*"
                                                maxLength={6}
                                                placeholder="000000"
                                                value={verificationCode}
                                                onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, ""))}
                                                className="text-center text-xl tracking-widest"
                                            />
                                        </div>
                                        <Button
                                            onClick={verifyCode}
                                            disabled={isLoading || verificationCode.length !== 6}
                                            className="w-full"
                                        >
                                            {isLoading ? <RefreshCw className="h-4 w-4 animate-spin mr-2" /> : null}
                                            Vérifier et activer
                                        </Button>
                                    </div>
                                )}

                                {step === "backup" && (
                                    <div className="space-y-4">
                                        <div className="p-4 bg-amber-50 dark:bg-amber-950/20 rounded-lg border border-amber-200 dark:border-amber-800">
                                            <div className="flex items-center gap-2 text-amber-600 mb-2">
                                                <AlertTriangle className="h-4 w-4" />
                                                <span className="font-medium">Important</span>
                                            </div>
                                            <p className="text-sm text-amber-700 dark:text-amber-300">
                                                Sauvegardez ces codes dans un endroit sûr. Ils vous permettront d'accéder à votre compte si vous perdez votre appareil.
                                            </p>
                                        </div>
                                        <div className="grid grid-cols-2 gap-2">
                                            {backupCodes.map((code, index) => (
                                                <div
                                                    key={index}
                                                    className="p-2 bg-muted rounded text-center font-mono text-sm"
                                                >
                                                    {code}
                                                </div>
                                            ))}
                                        </div>
                                        <Button onClick={copyBackupCodes} variant="outline" className="w-full gap-2">
                                            <Copy className="h-4 w-4" />
                                            Copier les codes
                                        </Button>
                                        <Button onClick={() => setIsOpen(false)} className="w-full">
                                            J'ai sauvegardé mes codes
                                        </Button>
                                    </div>
                                )}
                            </div>
                        </DialogContent>
                    </Dialog>
                )}
            </CardContent>
        </Card>
    );
};

export default Setup2FA;
