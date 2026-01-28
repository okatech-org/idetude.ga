import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Shield, RefreshCw, ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
// @ts-ignore - otplib types need proper import
import * as otplib from "otplib";

// Get authenticator from otplib
const authenticator = otplib.authenticator || otplib.default?.authenticator;

interface Verify2FAProps {
    userId: string;
    onSuccess: () => void;
    onBack?: () => void;
}

export const Verify2FA = ({ userId, onSuccess, onBack }: Verify2FAProps) => {
    const [code, setCode] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [useBackupCode, setUseBackupCode] = useState(false);

    const verifyCode = async () => {
        if (code.length < 6) {
            toast.error("Veuillez entrer un code valide");
            return;
        }

        setIsLoading(true);
        try {
            // Récupérer le secret de l'utilisateur
            const { data: totpData, error } = await (supabase as any)
                .from("totp_secrets")
                .select("secret_encrypted, backup_codes")
                .eq("user_id", userId)
                .single();

            if (error || !totpData) {
                toast.error("Erreur de configuration 2FA");
                setIsLoading(false);
                return;
            }

            if (useBackupCode) {
                // Vérifier si c'est un code de secours valide
                const backupCodes = (totpData.backup_codes as string[]) || [];
                const codeIndex = backupCodes.findIndex(
                    (c: string) => c.toUpperCase() === code.toUpperCase()
                );

                if (codeIndex === -1) {
                    toast.error("Code de secours invalide");
                    setIsLoading(false);
                    return;
                }

                // Retirer le code utilisé
                const newBackupCodes = backupCodes.filter((_: string, i: number) => i !== codeIndex);
                await (supabase as any)
                    .from("totp_secrets")
                    .update({ backup_codes: newBackupCodes, last_used_at: new Date().toISOString() })
                    .eq("user_id", userId);

                toast.success("Code de secours accepté");
                toast.warning(`Il vous reste ${newBackupCodes.length} codes de secours`);
                onSuccess();
            } else {
                // Vérifier le code TOTP
                const isValid = authenticator.verify({
                    token: code,
                    secret: totpData.secret_encrypted,
                });

                if (!isValid) {
                    toast.error("Code invalide. Veuillez réessayer.");
                    setIsLoading(false);
                    return;
                }

                // Mettre à jour last_used_at
                await (supabase as any)
                    .from("totp_secrets")
                    .update({ last_used_at: new Date().toISOString() })
                    .eq("user_id", userId);

                toast.success("Authentification réussie");
                onSuccess();
            }
        } catch (error) {
            console.error("Erreur vérification 2FA:", error);
            toast.error("Erreur lors de la vérification");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-muted p-4">
            <Card className="w-full max-w-md">
                <CardHeader className="text-center">
                    <div className="mx-auto w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                        <Shield className="h-6 w-6 text-primary" />
                    </div>
                    <CardTitle>Vérification 2FA</CardTitle>
                    <CardDescription>
                        {useBackupCode
                            ? "Entrez un de vos codes de secours"
                            : "Entrez le code de votre application d'authentification"}
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="2fa-code">
                            {useBackupCode ? "Code de secours" : "Code d'authentification"}
                        </Label>
                        <Input
                            id="2fa-code"
                            type="text"
                            inputMode={useBackupCode ? "text" : "numeric"}
                            pattern={useBackupCode ? undefined : "[0-9]*"}
                            maxLength={useBackupCode ? 8 : 6}
                            placeholder={useBackupCode ? "XXXXXXXX" : "000000"}
                            value={code}
                            onChange={(e) =>
                                setCode(
                                    useBackupCode
                                        ? e.target.value.toUpperCase()
                                        : e.target.value.replace(/\D/g, "")
                                )
                            }
                            className="text-center text-xl tracking-widest"
                            autoFocus
                        />
                    </div>

                    <Button
                        onClick={verifyCode}
                        disabled={isLoading || code.length < 6}
                        className="w-full"
                    >
                        {isLoading ? <RefreshCw className="h-4 w-4 animate-spin mr-2" /> : null}
                        Vérifier
                    </Button>

                    <div className="flex flex-col gap-2">
                        <Button
                            variant="ghost"
                            onClick={() => {
                                setUseBackupCode(!useBackupCode);
                                setCode("");
                            }}
                            className="text-sm"
                        >
                            {useBackupCode
                                ? "Utiliser le code d'authentification"
                                : "Utiliser un code de secours"}
                        </Button>

                        {onBack && (
                            <Button variant="ghost" onClick={onBack} className="text-sm gap-2">
                                <ArrowLeft className="h-4 w-4" />
                                Retour
                            </Button>
                        )}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};

export default Verify2FA;
