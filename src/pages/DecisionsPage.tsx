import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Plus, Trash2, Clock, Info, CheckCircle, AlertCircle } from "lucide-react";
import { useCrisisState } from "@/hooks/useCrisisState";
import type { AppState } from "@/lib/stateStore";
import { toast } from "sonner";

/** -------- Types -------- */
type RidaType = "I" | "D" | "A";
type RidaStatus = "À initier" | "En cours" | "En pause" | "En retard" | "Bloqué" | "Terminé";

type DecisionRecord = AppState["decisions"][number] & {
  kind?: RidaType;
  status?: RidaStatus;
  dueDate?: string;
  owner?: string;
};

function TypeIcon({ t }: { t: RidaType }) {
  if (t === "I") return <Info className="w-4 h-4 text-blue-600" />;
  if (t === "D") return <CheckCircle className="w-4 h-4 text-green-600" />;
  return <AlertCircle className="w-4 h-4 text-orange-600" />;
}

/** -------- Helpers UI -------- */
function statusBg(status: RidaStatus) {
  switch (status) {
    case "À initier": return "bg-gray-100";
    case "En cours": return "bg-yellow-100";
    case "En pause": return "bg-orange-100";
    case "En retard": return "bg-blue-100";
    case "Bloqué": return "bg-red-100";
    case "Terminé": return "bg-green-100";
    default: return "bg-gray-100";
  }
}

function statusBadgeVariant(status: RidaStatus) {
  switch (status) {
    case "En retard":
    case "Bloqué":
      return "destructive";
    case "En pause":
      return "secondary";
    case "En cours":
    case "Terminé":
      return "default";
    default:
      return "outline";
  }
}

/** -------- Page -------- */
export function DecisionsPage() {
  const { state, updateState } = useCrisisState();

  // Liste RIDA = décisions triées du plus récent au plus ancien
  const rida: DecisionRecord[] = useMemo(
    () =>
      [...state.decisions].sort(
        (a, b) => new Date(b.decidedAt).getTime() - new Date(a.decidedAt).getTime()
      ),
    [state.decisions]
  );

  const [isAddOpen, setIsAddOpen] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  // Formulaire d’ajout
  const [draft, setDraft] = useState({
    subject: "",
    type: "D" as RidaType,
    description: "",
    owner: "",
    status: "À initier" as RidaStatus,
    dueDate: "",
  });

  const onAdd = () => {
    if (!draft.subject.trim() || !draft.description.trim()) {
      toast.error("Sujet et description sont requis");
      return;
    }

    const newDecision: DecisionRecord = {
      id: crypto.randomUUID(),
      title: draft.subject.trim(),
      decidedAt: new Date().toISOString(),
      rationale: draft.description.trim(),
      owner: draft.owner.trim() || undefined,
      status: draft.status,
      kind: draft.type,
      dueDate: draft.type === "A" && draft.dueDate ? draft.dueDate : undefined,
    };

    updateState((prev) => ({
      ...prev,
      decisions: [...prev.decisions, newDecision],
    }));

    setDraft({
      subject: "",
      type: "D",
      description: "",
      owner: "",
      status: "À initier",
      dueDate: "",
    });
    setIsAddOpen(false);
    toast.success("Décision ajoutée");
  };

  const onDelete = (id: string) => {
    if (!confirm("Supprimer cette décision ?")) return;

    updateState((prev) => ({
      ...prev,
      decisions: prev.decisions.filter((d) => d.id !== id),
    }));

    if (selectedId === id) setSelectedId(null);
    toast.success("Décision supprimée");
  };

  const onUpdateStatus = (id: string, newStatus: RidaStatus) => {
    updateState((prev) => ({
      ...prev,
      decisions: prev.decisions.map((d) =>
        d.id === id ? ({ ...d, status: newStatus } as DecisionRecord) : (d as DecisionRecord)
      ),
    }));
  };

  const selected = (selectedId && rida.find((d) => d.id === selectedId)) || null;

  return (
    <div className="space-y-6">
      {/* Header + explication */}
      <div className="bg-gradient-to-r from-pink-200 to-purple-200 p-6 rounded-lg">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">
              Relevé des Informations, Décisions & Actions (RIDA)
            </h1>
            <p className="text-gray-600 mt-2 max-w-4xl">
              Le RIDA est un outil de gestion de projet qui permet de retrouver les différentes
              informations transmises lors d&apos;une crise dans un document. Ces informations sont le
              point de départ de décisions à prendre en équipe, et d&apos;actions à réaliser.
            </p>
          </div>

          <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Nouvel élément
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Ajouter un élément au RIDA</DialogTitle>
                <DialogDescription>
                  Documentez une nouvelle information, décision ou action de la cellule de crise.
                </DialogDescription>
              </DialogHeader>

              <div className="grid gap-4">
                <div className="grid gap-2">
                  <Label>Sujet</Label>
                  <Input
                    value={draft.subject}
                    onChange={(e) => setDraft({ ...draft, subject: e.target.value })}
                    placeholder="Sujet ou thème (ex : Investigation messagerie)"
                  />
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div className="grid gap-2">
                    <Label>Type</Label>
                    <Select
                      value={draft.type}
                      onValueChange={(v: RidaType) => setDraft({ ...draft, type: v })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="I">Information</SelectItem>
                        <SelectItem value="D">Décision</SelectItem>
                        <SelectItem value="A">Action</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="grid gap-2">
                    <Label>Porteur</Label>
                    <Input
                      value={draft.owner}
                      onChange={(e) => setDraft({ ...draft, owner: e.target.value })}
                      placeholder="Responsable / porteur"
                    />
                  </div>

                  <div className="grid gap-2">
                    <Label>État</Label>
                    <Select
                      value={draft.status}
                      onValueChange={(v: RidaStatus) => setDraft({ ...draft, status: v })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="À initier">À initier</SelectItem>
                        <SelectItem value="En cours">En cours</SelectItem>
                        <SelectItem value="En pause">En pause</SelectItem>
                        <SelectItem value="En retard">En retard</SelectItem>
                        <SelectItem value="Bloqué">Bloqué</SelectItem>
                        <SelectItem value="Terminé">Terminé</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid gap-2">
                  <Label>Description</Label>
                  <Textarea
                    value={draft.description}
                    onChange={(e) => setDraft({ ...draft, description: e.target.value })}
                    placeholder="Description détaillée…"
                    rows={3}
                  />
                </div>

                {draft.type === "A" && (
                  <div className="grid gap-2">
                    <Label>Échéance (optionnel)</Label>
                    <Input
                      type="date"
                      value={draft.dueDate}
                      onChange={(e) => setDraft({ ...draft, dueDate: e.target.value })}
                    />
                  </div>
                )}

                <Button onClick={onAdd} className="w-full">
                  Ajouter l’élément
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        <div className="mt-4 text-sm text-gray-700">
          <p className="mb-2 font-medium">Le relevé comprend :</p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
            <p>
              • <strong>Information</strong> : l’élément factuel diffusé à tous les membres de la cellule
            </p>
            <p>
              • <strong>Décision</strong> : les décisions prises pour faire avancer la crise par la cellule
              décisionnelle
            </p>
            <p>
              • <strong>Action</strong> : les tâches à réaliser pour parvenir à un résultat
            </p>
          </div>
        </div>
      </div>

      {/* Tableau RIDA */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Tableau RIDA</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-purple-100">
                  <TableHead className="w-24">Date</TableHead>
                  <TableHead className="w-20">Heure</TableHead>
                  <TableHead className="w-32">Sujet</TableHead>
                  <TableHead className="w-8 text-center">I</TableHead>
                  <TableHead className="w-8 text-center">D</TableHead>
                  <TableHead className="w-8 text-center">A</TableHead>
                  <TableHead className="w-40">Échéance</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead className="w-28">Porteur</TableHead>
                  <TableHead className="w-32">État</TableHead>
                  <TableHead className="w-12" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {rida.map((d) => {
                  const dt = new Date(d.decidedAt);
                  const date = dt.toLocaleDateString("fr-FR");
                  const time = dt.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" });
                  const kind = (d.kind ?? "D") as RidaType;
                  const status = (d.status ?? "À initier") as RidaStatus;

                  return (
                    <TableRow
                      key={d.id}
                      className="hover:bg-gray-50 cursor-pointer"
                      onClick={() => setSelectedId(d.id)}
                    >
                      <TableCell className="font-medium">{date}</TableCell>
                      <TableCell>{time}</TableCell>
                      <TableCell className="font-medium">{d.title}</TableCell>
                      <TableCell className="text-center">{kind === "I" && <TypeIcon t="I" />}</TableCell>
                      <TableCell className="text-center">{kind === "D" && <TypeIcon t="D" />}</TableCell>
                      <TableCell className="text-center">{kind === "A" && <TypeIcon t="A" />}</TableCell>
                      <TableCell>{d.dueDate || "-"}</TableCell>
                      <TableCell className="max-w-md">
                        <p className="text-sm line-clamp-2">{d.rationale}</p>
                      </TableCell>
                      <TableCell>{d.owner || ""}</TableCell>
                      <TableCell>
                        <Select
                          value={status}
                          onValueChange={(v: RidaStatus) => onUpdateStatus(d.id, v)}
                        >
                          <SelectTrigger className={`w-full text-xs ${statusBg(status)}`}>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="À initier">À initier</SelectItem>
                            <SelectItem value="En cours">En cours</SelectItem>
                            <SelectItem value="En pause">En pause</SelectItem>
                            <SelectItem value="En retard">En retard</SelectItem>
                            <SelectItem value="Bloqué">Bloqué</SelectItem>
                            <SelectItem value="Terminé">Terminé</SelectItem>
                          </SelectContent>
                        </Select>
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            onDelete(d.id);
                          }}
                          className="text-destructive hover:text-destructive hover:bg-destructive/10"
                          aria-label="Supprimer"
                          title="Supprimer"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>

          {rida.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              Aucun élément dans le relevé pour l’instant
            </div>
          )}
        </CardContent>
      </Card>

      {/* Instructions */}
      <Card className="bg-blue-50">
        <CardContent className="pt-6">
          <h3 className="font-medium mb-3">Instructions d&apos;utilisation du RIDA</h3>
          <div className="text-sm text-gray-600 space-y-2">
            <p>
              <strong>1.</strong> Notez de manière abrégée les informations, décisions et actions abordées en cellule de
              crise.
            </p>
            <p>
              <strong>2.</strong> Indiquez le type du sujet. S&apos;agit-il d&apos;une information ? D&apos;une décision ? D&apos;une action ?
              Indiquez un I, D, ou A dans la colonne Type correspondante.
            </p>
            <p><strong>3.</strong> Notez qui est l&apos;acteur/le porteur associé à ce sujet.</p>
            <p><strong>4.</strong> Précisez la date d&apos;échéance s&apos;il s&apos;agit d&apos;une action.</p>
            <p>
              <strong>5.</strong> Lisez le RIDA à chaque point de situation afin de rappeler les décisions prises et les actions
              à réaliser pour faire le point d&apos;avancement de ces actions.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Détail */}
      <Dialog open={!!selectedId} onOpenChange={(open) => !open && setSelectedId(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {selected && <TypeIcon t={(selected.kind ?? "D") as RidaType} />}
              {selected?.title}
            </DialogTitle>
            <DialogDescription>
              {(selected?.kind ?? "D") === "I" && "Information"}
              {(selected?.kind ?? "D") === "D" && "Décision"}
              {(selected?.kind ?? "D") === "A" && "Action"} · Ajouté le{" "}
              {selected && new Date(selected.decidedAt).toLocaleDateString("fr-FR")} à{" "}
              {selected &&
                new Date(selected.decidedAt).toLocaleTimeString("fr-FR", {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
            </DialogDescription>
          </DialogHeader>

          {selected && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Porteur</Label>
                  <p className="text-sm mt-1">{selected.owner || "Non assigné"}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">État</Label>
                  <div className="mt-1">
                    <Badge
                      variant={statusBadgeVariant((selected.status ?? "À initier") as RidaStatus)}
                      className={`${statusBg((selected.status ?? "À initier") as RidaStatus)} text-black`}
                    >
                      {(selected.status ?? "À initier") as RidaStatus}
                    </Badge>
                  </div>
                </div>
              </div>

              {selected.dueDate && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Clock className="w-4 h-4" />
                  <span>
                    Échéance :{" "}
                    {new Date(selected.dueDate).toLocaleDateString("fr-FR")}
                  </span>
                </div>
              )}

              <div>
                <Label className="text-sm font-medium text-muted-foreground">Description complète</Label>
                <div className="mt-2 p-3 bg-muted rounded-md">
                  <p className="text-sm whitespace-pre-wrap">{selected.rationale}</p>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-4">
                <Button variant="outline" onClick={() => setSelectedId(null)}>
                  Fermer
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
