import React, { Component, ErrorInfo, ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { RefreshCcw, AlertTriangle } from "lucide-react";

interface Props {
    children: ReactNode;
}

interface State {
    hasError: boolean;
    error: Error | null;
    errorInfo: ErrorInfo | null;
}

export class ErrorBoundary extends Component<Props, State> {
    public state: State = {
        hasError: false,
        error: null,
        errorInfo: null,
    };

    public static getDerivedStateFromError(error: Error): State {
        // Update state so the next render will show the fallback UI.
        return { hasError: true, error, errorInfo: null };
    }

    public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        console.error("Uncaught error:", error, errorInfo);
        this.setState({ errorInfo });
    }

    private handleReset = () => {
        // Attempt to clear local storage and reload
        localStorage.clear();
        window.location.reload();
    };

    public render() {
        if (this.state.hasError) {
            return (
                <div className="flex flex-col items-center justify-center min-h-screen bg-background p-4 text-center space-y-6">
                    <div className="p-4 rounded-full bg-destructive/10 text-destructive mb-4">
                        <AlertTriangle className="w-12 h-12" />
                    </div>

                    <h1 className="text-3xl font-bold tracking-tight">Une erreur est survenue</h1>

                    <div className="max-w-md w-full bg-muted/50 p-4 rounded-lg text-left overflow-auto max-h-[300px] text-xs font-mono border">
                        <p className="font-semibold text-destructive mb-2">
                            {this.state.error?.toString()}
                        </p>
                        <pre className="whitespace-pre-wrap text-muted-foreground">
                            {this.state.errorInfo?.componentStack}
                        </pre>
                    </div>

                    <div className="flex gap-4">
                        <Button onClick={() => window.location.reload()} variant="outline">
                            Actualiser la page
                        </Button>
                        <Button onClick={this.handleReset} variant="destructive">
                            <RefreshCcw className="w-4 h-4 mr-2" />
                            Réinitialiser et Recharger
                        </Button>
                    </div>

                    <p className="text-sm text-muted-foreground max-w-lg">
                        Si le problème persiste, cela peut être dû à une donnée corrompue dans la session.
                        Utilisez le bouton "Réinitialiser" pour nettoyer les données locales.
                    </p>
                </div>
            );
        }

        return this.props.children;
    }
}
