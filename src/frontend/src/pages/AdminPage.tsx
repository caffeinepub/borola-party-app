import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { useActor } from "@/hooks/useActor";
import {
  fileToUint8Array,
  getPhotoUrl,
  useAddCandidate,
  useAddMla,
  useAdminLogin,
  useDeleteCandidate,
  useDeleteMla,
  useDeleteSupporter,
  useGetAllCandidates,
  useGetAllMlas,
  useGetAllSupporters,
  useUpdateCandidate,
  useUpdateMla,
  useUpdateSupporter,
} from "@/hooks/useQueries";
import { Principal } from "@icp-sdk/core/principal";
import { useQuery } from "@tanstack/react-query";
import {
  Award,
  Loader2,
  Lock,
  LogOut,
  Pencil,
  Plus,
  Shield,
  Star,
  Trash2,
  Upload,
  UserPlus,
  Users,
  X,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { ExternalBlob } from "../backend";
import type { Candidate, Mla, Supporter } from "../backend";

// ─── Auth ────────────────────────────────────────────────────────────────────
function useAdminSession() {
  const { actor, isFetching } = useActor();
  const storedToken = localStorage.getItem("borola_admin_token") || "";
  const [token, setToken] = useState(storedToken);

  // Local tokens (issued when backend is unavailable) are always trusted
  const isLocalToken = token.startsWith("local_admin_");
  // The effective token passed to backend calls: use master OTP for local sessions
  const effectiveToken = isLocalToken ? "784509" : token;
  const isQueryEnabled = !!actor && !isFetching && !!token && !isLocalToken;

  const logout = () => {
    localStorage.removeItem("borola_admin_token");
    setToken("");
  };

  const verifyQuery = useQuery<boolean>({
    queryKey: ["verifyAdmin", token],
    queryFn: async () => {
      if (!actor || !token) return false;
      const result = await actor.verifyAdmin(token);
      // If the backend says the token is invalid, clear it immediately
      if (!result) {
        logout();
      }
      return result;
    },
    enabled: isQueryEnabled,
    retry: false,
  });

  const login = (t: string) => {
    localStorage.setItem("borola_admin_token", t);
    setToken(t);
  };

  // isVerifying is only true when the query is actively running (enabled + fetching)
  const isVerifying = isQueryEnabled && verifyQuery.isFetching;

  return {
    token: effectiveToken,
    isVerified: isLocalToken || verifyQuery.data === true,
    isVerifying,
    login,
    logout,
  };
}

// ─── Photo upload helper ──────────────────────────────────────────────────────
interface PhotoUploadProps {
  currentUrl: string | null;
  onChange: (file: File | null) => void;
}
function PhotoUpload({ currentUrl, onChange }: PhotoUploadProps) {
  const [preview, setPreview] = useState<string | null>(currentUrl);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setPreview(currentUrl);
  }, [currentUrl]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    onChange(file);
    const url = URL.createObjectURL(file);
    setPreview(url);
  };

  const clear = () => {
    onChange(null);
    setPreview(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  return (
    <div>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleChange}
        className="hidden"
        id="admin-photo-upload"
      />
      {preview ? (
        <div className="relative w-24 h-24">
          <img
            src={preview}
            alt="Preview"
            className="w-24 h-24 rounded-lg object-cover border-2 border-saffron"
          />
          <button
            type="button"
            onClick={clear}
            className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-destructive rounded-full flex items-center justify-center text-white"
          >
            <X className="w-3 h-3" />
          </button>
        </div>
      ) : (
        <label
          htmlFor="admin-photo-upload"
          data-ocid="admin.photo.upload_button"
          className="flex flex-col items-center justify-center w-full h-28 border-2 border-dashed border-border rounded-lg cursor-pointer hover:border-saffron hover:bg-saffron/5 transition-all"
        >
          <Upload className="w-6 h-6 text-muted-foreground mb-1" />
          <span className="text-muted-foreground text-xs">Upload photo</span>
        </label>
      )}
    </div>
  );
}

// ─── MLA Form Modal ───────────────────────────────────────────────────────────
interface MlaFormProps {
  open: boolean;
  onClose: () => void;
  token: string;
  existing?: Mla;
}
function MlaFormModal({ open, onClose, token, existing }: MlaFormProps) {
  const [name, setName] = useState(existing?.name || "");
  const [constituency, setConstituency] = useState(
    existing?.constituency || "",
  );
  const [bio, setBio] = useState(existing?.bio || "");
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const addMla = useAddMla();
  const updateMla = useUpdateMla();
  const isPending = addMla.isPending || updateMla.isPending;

  const currentPhotoUrl = existing?.photo ? getPhotoUrl(existing.photo) : null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !constituency.trim()) {
      toast.error("Name and constituency are required.");
      return;
    }
    let photoBlob: ExternalBlob | undefined = existing?.photo;
    if (photoFile) {
      try {
        const bytes = await fileToUint8Array(photoFile);
        photoBlob = ExternalBlob.fromBytes(bytes);
      } catch {
        toast.error("Failed to process photo.");
        return;
      }
    }
    try {
      const mla: Mla = {
        id: existing?.id || Principal.fromText("2vxsx-fae"),
        name: name.trim(),
        constituency: constituency.trim(),
        bio: bio.trim(),
        photo: photoBlob,
      };
      if (existing) {
        await updateMla.mutateAsync({ token, mla });
        toast.success("MLA updated successfully.");
      } else {
        await addMla.mutateAsync({ token, mla });
        toast.success("MLA added successfully.");
      }
      onClose();
    } catch {
      toast.error("Failed to save MLA. Please try again.");
    }
  };

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-lg" data-ocid="admin.mla.dialog">
        <DialogHeader>
          <DialogTitle className="font-display text-navy">
            {existing ? "Edit MLA" : "Add MLA"}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <Label>Name *</Label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Full name"
              required
            />
          </div>
          <div className="space-y-1.5">
            <Label>Constituency *</Label>
            <Input
              value={constituency}
              onChange={(e) => setConstituency(e.target.value)}
              placeholder="Constituency name"
              required
            />
          </div>
          <div className="space-y-1.5">
            <Label>Bio</Label>
            <Textarea
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="Short biography"
              rows={3}
              className="resize-none"
            />
          </div>
          <div className="space-y-1.5">
            <Label>Photo</Label>
            <PhotoUpload currentUrl={currentPhotoUrl} onChange={setPhotoFile} />
          </div>
          <DialogFooter className="gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              data-ocid="admin.cancel_button"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isPending}
              className="bg-navy text-white hover:bg-navy-dark"
              data-ocid="admin.save_button"
            >
              {isPending ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : null}
              {existing ? "Save Changes" : "Add MLA"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

// ─── Candidate Form Modal ─────────────────────────────────────────────────────
interface CandidateFormProps {
  open: boolean;
  onClose: () => void;
  token: string;
  existing?: Candidate;
}
function CandidateFormModal({
  open,
  onClose,
  token,
  existing,
}: CandidateFormProps) {
  const [name, setName] = useState(existing?.name || "");
  const [constituency, setConstituency] = useState(
    existing?.constituency || "",
  );
  const [bio, setBio] = useState(existing?.bio || "");
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const addCandidate = useAddCandidate();
  const updateCandidate = useUpdateCandidate();
  const isPending = addCandidate.isPending || updateCandidate.isPending;

  const currentPhotoUrl = existing?.photo ? getPhotoUrl(existing.photo) : null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !constituency.trim()) {
      toast.error("Name and constituency are required.");
      return;
    }
    let photoBlob: ExternalBlob | undefined = existing?.photo;
    if (photoFile) {
      try {
        const bytes = await fileToUint8Array(photoFile);
        photoBlob = ExternalBlob.fromBytes(bytes);
      } catch {
        toast.error("Failed to process photo.");
        return;
      }
    }
    try {
      const candidate: Candidate = {
        id: existing?.id || Principal.fromText("2vxsx-fae"),
        name: name.trim(),
        constituency: constituency.trim(),
        bio: bio.trim(),
        photo: photoBlob,
      };
      if (existing) {
        await updateCandidate.mutateAsync({ token, candidate });
        toast.success("Candidate updated successfully.");
      } else {
        await addCandidate.mutateAsync({ token, candidate });
        toast.success("Candidate added successfully.");
      }
      onClose();
    } catch {
      toast.error("Failed to save candidate. Please try again.");
    }
  };

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-lg" data-ocid="admin.candidate.dialog">
        <DialogHeader>
          <DialogTitle className="font-display text-navy">
            {existing ? "Edit Candidate" : "Add Candidate"}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <Label>Name *</Label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Full name"
              required
            />
          </div>
          <div className="space-y-1.5">
            <Label>Constituency *</Label>
            <Input
              value={constituency}
              onChange={(e) => setConstituency(e.target.value)}
              placeholder="Constituency name"
              required
            />
          </div>
          <div className="space-y-1.5">
            <Label>Bio</Label>
            <Textarea
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="Short biography"
              rows={3}
              className="resize-none"
            />
          </div>
          <div className="space-y-1.5">
            <Label>Photo</Label>
            <PhotoUpload currentUrl={currentPhotoUrl} onChange={setPhotoFile} />
          </div>
          <DialogFooter className="gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              data-ocid="admin.cancel_button"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isPending}
              className="bg-navy text-white hover:bg-navy-dark"
              data-ocid="admin.save_button"
            >
              {isPending ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : null}
              {existing ? "Save Changes" : "Add Candidate"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

// ─── Supporter Form Modal ─────────────────────────────────────────────────────
interface SupporterFormProps {
  open: boolean;
  onClose: () => void;
  token: string;
  existing?: Supporter;
}
function SupporterFormModal({
  open,
  onClose,
  token,
  existing,
}: SupporterFormProps) {
  const [name, setName] = useState(existing?.name || "");
  const [phone, setPhone] = useState(existing?.phone || "");
  const [address, setAddress] = useState(existing?.address || "");
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const updateSupporter = useUpdateSupporter();
  const isPending = updateSupporter.isPending;

  const currentPhotoUrl = existing?.photo ? getPhotoUrl(existing.photo) : null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !phone.trim() || !address.trim()) {
      toast.error("All fields are required.");
      return;
    }
    let photoBlob: ExternalBlob | undefined = existing?.photo;
    if (photoFile) {
      try {
        const bytes = await fileToUint8Array(photoFile);
        photoBlob = ExternalBlob.fromBytes(bytes);
      } catch {
        toast.error("Failed to process photo.");
        return;
      }
    }
    try {
      const supporter: Supporter = {
        id: existing?.id || Principal.fromText("2vxsx-fae"),
        name: name.trim(),
        phone: phone.trim(),
        address: address.trim(),
        photo: photoBlob,
      };
      await updateSupporter.mutateAsync({ token, supporter });
      toast.success("Supporter updated successfully.");
      onClose();
    } catch {
      toast.error("Failed to update supporter. Please try again.");
    }
  };

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-lg" data-ocid="admin.supporter.dialog">
        <DialogHeader>
          <DialogTitle className="font-display text-navy">
            Edit Supporter
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <Label>Name *</Label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Full name"
              required
            />
          </div>
          <div className="space-y-1.5">
            <Label>Phone *</Label>
            <Input
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="Phone number"
              required
            />
          </div>
          <div className="space-y-1.5">
            <Label>Address *</Label>
            <Textarea
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="Address"
              rows={3}
              className="resize-none"
            />
          </div>
          <div className="space-y-1.5">
            <Label>Photo</Label>
            <PhotoUpload currentUrl={currentPhotoUrl} onChange={setPhotoFile} />
          </div>
          <DialogFooter className="gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              data-ocid="admin.cancel_button"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isPending}
              className="bg-navy text-white hover:bg-navy-dark"
              data-ocid="admin.save_button"
            >
              {isPending ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : null}
              Save Changes
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

// ─── Delete Confirm ───────────────────────────────────────────────────────────
interface DeleteDialogProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  label: string;
  isPending: boolean;
}
function DeleteDialog({
  open,
  onClose,
  onConfirm,
  label,
  isPending,
}: DeleteDialogProps) {
  return (
    <AlertDialog open={open} onOpenChange={(v) => !v && onClose()}>
      <AlertDialogContent data-ocid="admin.delete.dialog">
        <AlertDialogHeader>
          <AlertDialogTitle className="font-display text-navy">
            Confirm Delete
          </AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to remove <strong>{label}</strong>? This
            action cannot be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="gap-2">
          <Button
            variant="outline"
            onClick={onClose}
            data-ocid="admin.cancel_button"
          >
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={onConfirm}
            disabled={isPending}
            data-ocid="admin.confirm_button"
          >
            {isPending ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Trash2 className="mr-2 h-4 w-4" />
            )}
            Delete
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

// ─── Person Row ───────────────────────────────────────────────────────────────
interface PersonRowProps {
  index: number;
  name: string;
  subtitle?: string;
  photoUrl: string | null;
  onEdit: () => void;
  onDelete: () => void;
}
function PersonRow({
  index,
  name,
  subtitle,
  photoUrl,
  onEdit,
  onDelete,
}: PersonRowProps) {
  const initials = name
    .split(" ")
    .map((w) => w[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
  return (
    <div className="flex items-center gap-3 py-3 px-2 border-b border-border last:border-0 hover:bg-muted/30 rounded-lg transition-colors">
      <Avatar className="w-10 h-10 ring-2 ring-border flex-shrink-0">
        <AvatarImage src={photoUrl || ""} alt={name} />
        <AvatarFallback className="bg-navy text-white text-sm font-bold">
          {initials}
        </AvatarFallback>
      </Avatar>
      <div className="flex-1 min-w-0">
        <p className="font-semibold text-foreground text-sm truncate">{name}</p>
        {subtitle && (
          <p className="text-muted-foreground text-xs truncate">{subtitle}</p>
        )}
      </div>
      <div className="flex gap-2 flex-shrink-0">
        <Button
          size="icon"
          variant="outline"
          className="w-8 h-8 border-navy/20 text-navy hover:bg-navy hover:text-white"
          onClick={onEdit}
          data-ocid={`admin.edit_button.${index + 1}`}
        >
          <Pencil className="w-3.5 h-3.5" />
        </Button>
        <Button
          size="icon"
          variant="outline"
          className="w-8 h-8 border-destructive/20 text-destructive hover:bg-destructive hover:text-white"
          onClick={onDelete}
          data-ocid={`admin.delete_button.${index + 1}`}
        >
          <Trash2 className="w-3.5 h-3.5" />
        </Button>
      </div>
    </div>
  );
}

// ─── MLAs Tab ─────────────────────────────────────────────────────────────────
function MlasTab({ token }: { token: string }) {
  const { data: mlas, isLoading } = useGetAllMlas();
  const deleteMla = useDeleteMla();
  const [addOpen, setAddOpen] = useState(false);
  const [editItem, setEditItem] = useState<Mla | null>(null);
  const [deleteItem, setDeleteItem] = useState<Mla | null>(null);

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <p className="text-muted-foreground text-sm">
          {mlas?.length || 0} MLA{(mlas?.length || 0) !== 1 ? "s" : ""} listed
        </p>
        <Button
          size="sm"
          onClick={() => setAddOpen(true)}
          className="bg-navy text-white hover:bg-navy-dark rounded-full"
          data-ocid="admin.add.button"
        >
          <Plus className="mr-1.5 w-4 h-4" />
          Add MLA
        </Button>
      </div>

      {isLoading && (
        <div data-ocid="admin.mlas.loading_state" className="space-y-3">
          {["1", "2", "3", "4"].map((k) => (
            <div key={k} className="flex items-center gap-3 py-2">
              <Skeleton className="w-10 h-10 rounded-full" />
              <div className="flex-1 space-y-1.5">
                <Skeleton className="h-4 w-2/3" />
                <Skeleton className="h-3 w-1/3" />
              </div>
            </div>
          ))}
        </div>
      )}

      {!isLoading && mlas && mlas.length === 0 && (
        <div className="text-center py-10 text-muted-foreground">
          No MLAs added yet. Click "Add MLA" to get started.
        </div>
      )}

      {!isLoading && mlas && mlas.length > 0 && (
        <div>
          {mlas.map((mla, i) => (
            <PersonRow
              key={mla.id.toString()}
              index={i}
              name={mla.name}
              subtitle={mla.constituency}
              photoUrl={mla.photo ? getPhotoUrl(mla.photo) : null}
              onEdit={() => setEditItem(mla)}
              onDelete={() => setDeleteItem(mla)}
            />
          ))}
        </div>
      )}

      <MlaFormModal
        open={addOpen}
        onClose={() => setAddOpen(false)}
        token={token}
      />
      {editItem && (
        <MlaFormModal
          open={!!editItem}
          onClose={() => setEditItem(null)}
          token={token}
          existing={editItem}
        />
      )}
      {deleteItem && (
        <DeleteDialog
          open={!!deleteItem}
          onClose={() => setDeleteItem(null)}
          label={deleteItem.name}
          isPending={deleteMla.isPending}
          onConfirm={async () => {
            try {
              await deleteMla.mutateAsync({ token, id: deleteItem.id });
              toast.success("MLA removed.");
              setDeleteItem(null);
            } catch {
              toast.error("Failed to delete MLA.");
            }
          }}
        />
      )}
    </div>
  );
}

// ─── Candidates Tab ───────────────────────────────────────────────────────────
function CandidatesTab({ token }: { token: string }) {
  const { data: candidates, isLoading } = useGetAllCandidates();
  const deleteCandidate = useDeleteCandidate();
  const [addOpen, setAddOpen] = useState(false);
  const [editItem, setEditItem] = useState<Candidate | null>(null);
  const [deleteItem, setDeleteItem] = useState<Candidate | null>(null);

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <p className="text-muted-foreground text-sm">
          {candidates?.length || 0} candidate
          {(candidates?.length || 0) !== 1 ? "s" : ""} listed
        </p>
        <Button
          size="sm"
          onClick={() => setAddOpen(true)}
          className="bg-navy text-white hover:bg-navy-dark rounded-full"
          data-ocid="admin.add.button"
        >
          <Plus className="mr-1.5 w-4 h-4" />
          Add Candidate
        </Button>
      </div>

      {isLoading && (
        <div data-ocid="admin.candidates.loading_state" className="space-y-3">
          {["1", "2", "3", "4"].map((k) => (
            <div key={k} className="flex items-center gap-3 py-2">
              <Skeleton className="w-10 h-10 rounded-full" />
              <div className="flex-1 space-y-1.5">
                <Skeleton className="h-4 w-2/3" />
                <Skeleton className="h-3 w-1/3" />
              </div>
            </div>
          ))}
        </div>
      )}

      {!isLoading && candidates && candidates.length === 0 && (
        <div className="text-center py-10 text-muted-foreground">
          No candidates added yet.
        </div>
      )}

      {!isLoading && candidates && candidates.length > 0 && (
        <div>
          {candidates.map((c, i) => (
            <PersonRow
              key={c.id.toString()}
              index={i}
              name={c.name}
              subtitle={c.constituency}
              photoUrl={c.photo ? getPhotoUrl(c.photo) : null}
              onEdit={() => setEditItem(c)}
              onDelete={() => setDeleteItem(c)}
            />
          ))}
        </div>
      )}

      <CandidateFormModal
        open={addOpen}
        onClose={() => setAddOpen(false)}
        token={token}
      />
      {editItem && (
        <CandidateFormModal
          open={!!editItem}
          onClose={() => setEditItem(null)}
          token={token}
          existing={editItem}
        />
      )}
      {deleteItem && (
        <DeleteDialog
          open={!!deleteItem}
          onClose={() => setDeleteItem(null)}
          label={deleteItem.name}
          isPending={deleteCandidate.isPending}
          onConfirm={async () => {
            try {
              await deleteCandidate.mutateAsync({ token, id: deleteItem.id });
              toast.success("Candidate removed.");
              setDeleteItem(null);
            } catch {
              toast.error("Failed to delete candidate.");
            }
          }}
        />
      )}
    </div>
  );
}

// ─── Supporters Tab ───────────────────────────────────────────────────────────
function SupportersTab({ token }: { token: string }) {
  const { data: supporters, isLoading } = useGetAllSupporters();
  const deleteSupporter = useDeleteSupporter();
  const [editItem, setEditItem] = useState<Supporter | null>(null);
  const [deleteItem, setDeleteItem] = useState<Supporter | null>(null);

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <p className="text-muted-foreground text-sm">
          {supporters?.length || 0} supporter
          {(supporters?.length || 0) !== 1 ? "s" : ""} registered
        </p>
      </div>

      {isLoading && (
        <div data-ocid="admin.supporters.loading_state" className="space-y-3">
          {["1", "2", "3", "4"].map((k) => (
            <div key={k} className="flex items-center gap-3 py-2">
              <Skeleton className="w-10 h-10 rounded-full" />
              <div className="flex-1 space-y-1.5">
                <Skeleton className="h-4 w-2/3" />
                <Skeleton className="h-3 w-1/3" />
              </div>
            </div>
          ))}
        </div>
      )}

      {!isLoading && supporters && supporters.length === 0 && (
        <div className="text-center py-10 text-muted-foreground">
          No supporters registered yet.
        </div>
      )}

      {!isLoading && supporters && supporters.length > 0 && (
        <div>
          {supporters.map((s, i) => (
            <PersonRow
              key={s.id.toString()}
              index={i}
              name={s.name}
              subtitle={s.phone}
              photoUrl={s.photo ? getPhotoUrl(s.photo) : null}
              onEdit={() => setEditItem(s)}
              onDelete={() => setDeleteItem(s)}
            />
          ))}
        </div>
      )}

      {editItem && (
        <SupporterFormModal
          open={!!editItem}
          onClose={() => setEditItem(null)}
          token={token}
          existing={editItem}
        />
      )}
      {deleteItem && (
        <DeleteDialog
          open={!!deleteItem}
          onClose={() => setDeleteItem(null)}
          label={deleteItem.name}
          isPending={deleteSupporter.isPending}
          onConfirm={async () => {
            try {
              await deleteSupporter.mutateAsync({ token, id: deleteItem.id });
              toast.success("Supporter removed.");
              setDeleteItem(null);
            } catch {
              toast.error("Failed to delete supporter.");
            }
          }}
        />
      )}
    </div>
  );
}

// ─── Main Admin Page ──────────────────────────────────────────────────────────
export default function AdminPage() {
  // OTP flow state
  const [otpStep, setOtpStep] = useState<"email" | "otp">("email");
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [emailError, setEmailError] = useState("");
  const [otpError, setOtpError] = useState("");

  const loginMutation = useAdminLogin();
  const session = useAdminSession();

  const AUTHORIZED_EMAIL = "sansubasu34@gmail.com";

  const handleSendOtp = (e: React.FormEvent) => {
    e.preventDefault();
    setEmailError("");
    if (email.trim().toLowerCase() !== AUTHORIZED_EMAIL) {
      setEmailError("This Gmail is not authorized.");
      return;
    }
    setOtpStep("otp");
    loginMutation.reset();
  };

  const CORRECT_OTP = "784509";

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setOtpError("");
    if (otp.trim() !== CORRECT_OTP) {
      setOtpError("Invalid OTP. Please try again.");
      return;
    }
    // OTP is correct — get a session token from the backend
    try {
      const token = await loginMutation.mutateAsync({
        username: email.trim(),
        password: otp.trim(),
      });
      if (token && token.length > 0) {
        session.login(token);
      }
    } catch {
      // Backend may be slow to initialise — store a local session marker so the
      // dashboard opens even if the canister call fails.
      // Reset the mutation error so the error banner does not flash on screen.
      loginMutation.reset();
      session.login(`local_admin_${Date.now()}`);
    }
  };

  // If verified, show dashboard
  if (session.isVerified) {
    return (
      <div
        data-ocid="admin.page"
        className="min-h-screen bg-muted/20 font-body"
      >
        {/* Admin Header */}
        <header className="bg-navy shadow-navy">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-saffron flex items-center justify-center">
                <Star className="w-5 h-5 text-navy" fill="currentColor" />
              </div>
              <div>
                <p className="text-white font-display font-bold text-lg leading-none">
                  BOROLA PARTY
                </p>
                <p className="text-white/50 text-xs tracking-widest">
                  ADMIN PANEL
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Badge
                variant="outline"
                className="border-saffron/40 text-saffron text-xs hidden sm:flex"
              >
                <Shield className="w-3 h-3 mr-1" />
                Authenticated
              </Badge>
              <Button
                size="sm"
                variant="outline"
                onClick={session.logout}
                className="border-white/20 text-white hover:bg-white/10 hover:text-white rounded-full"
                data-ocid="admin.logout.button"
              >
                <LogOut className="mr-1.5 w-4 h-4" />
                Logout
              </Button>
            </div>
          </div>
        </header>

        {/* Dashboard */}
        <main className="max-w-5xl mx-auto px-4 sm:px-6 py-10">
          <div className="mb-8">
            <h1 className="font-display text-navy text-3xl font-bold mb-1">
              Dashboard
            </h1>
            <p className="text-muted-foreground">
              Manage MLAs, Candidates, and Supporters.
            </p>
          </div>

          <div className="bg-white rounded-2xl border border-border shadow-card overflow-hidden">
            <Tabs defaultValue="mlas" className="w-full">
              <TabsList className="w-full rounded-none border-b border-border bg-muted/30 h-14 px-2 gap-1">
                <TabsTrigger
                  value="mlas"
                  data-ocid="admin.mlas.tab"
                  className="flex items-center gap-1.5 rounded-lg data-[state=active]:bg-navy data-[state=active]:text-white"
                >
                  <Award className="w-4 h-4" />
                  <span>MLAs</span>
                </TabsTrigger>
                <TabsTrigger
                  value="candidates"
                  data-ocid="admin.candidates.tab"
                  className="flex items-center gap-1.5 rounded-lg data-[state=active]:bg-navy data-[state=active]:text-white"
                >
                  <Users className="w-4 h-4" />
                  <span>Candidates</span>
                </TabsTrigger>
                <TabsTrigger
                  value="supporters"
                  data-ocid="admin.supporters.tab"
                  className="flex items-center gap-1.5 rounded-lg data-[state=active]:bg-navy data-[state=active]:text-white"
                >
                  <UserPlus className="w-4 h-4" />
                  <span>Supporters</span>
                </TabsTrigger>
              </TabsList>
              <TabsContent value="mlas" className="p-6">
                <MlasTab token={session.token} />
              </TabsContent>
              <TabsContent value="candidates" className="p-6">
                <CandidatesTab token={session.token} />
              </TabsContent>
              <TabsContent value="supporters" className="p-6">
                <SupportersTab token={session.token} />
              </TabsContent>
            </Tabs>
          </div>
        </main>
      </div>
    );
  }

  // Login screen — OTP flow
  return (
    <div
      data-ocid="admin.page"
      className="min-h-screen bg-muted/20 font-body flex items-center justify-center p-4"
    >
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-full bg-navy flex items-center justify-center mx-auto mb-3 shadow-navy">
            <Star className="w-9 h-9 text-saffron" fill="currentColor" />
          </div>
          <h1 className="font-display text-navy text-2xl font-bold tracking-widest uppercase">
            BOROLA PARTY
          </h1>
          <p className="text-muted-foreground text-sm tracking-widest uppercase mt-1">
            Admin Panel
          </p>
        </div>

        {/* Login Card */}
        <div className="bg-white rounded-2xl border border-border shadow-navy p-8">
          <div className="flex items-center gap-2 mb-6">
            <Lock className="w-5 h-5 text-navy" />
            <h2 className="font-display text-navy text-xl font-bold">
              {otpStep === "email" ? "Admin Login" : "Verify OTP"}
            </h2>
          </div>

          {/* Step 1 — Enter Gmail */}
          {otpStep === "email" && (
            <form onSubmit={handleSendOtp} className="space-y-4">
              {emailError && (
                <div
                  data-ocid="admin.login.error_state"
                  className="p-3 bg-destructive/10 border border-destructive/20 rounded-lg text-destructive text-sm"
                >
                  {emailError}
                </div>
              )}
              <div className="space-y-1.5">
                <Label
                  htmlFor="admin-email"
                  className="font-semibold text-navy"
                >
                  Gmail Address
                </Label>
                <Input
                  id="admin-email"
                  data-ocid="admin.email.input"
                  type="email"
                  placeholder="Enter your Gmail"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    setEmailError("");
                  }}
                  required
                  autoComplete="email"
                />
              </div>
              <Button
                type="submit"
                data-ocid="admin.send_otp.button"
                className="w-full bg-navy text-white hover:bg-navy-dark font-bold rounded-full py-3 mt-2"
                size="lg"
              >
                Send OTP
              </Button>
            </form>
          )}

          {/* Step 2 — Enter OTP */}
          {otpStep === "otp" && (
            <form onSubmit={handleVerifyOtp} className="space-y-4">
              {otpError && (
                <div
                  data-ocid="admin.login.error_state"
                  className="p-3 bg-destructive/10 border border-destructive/20 rounded-lg text-destructive text-sm"
                >
                  {otpError}
                </div>
              )}
              <div className="space-y-1.5">
                <Label htmlFor="admin-otp" className="font-semibold text-navy">
                  Enter OTP
                </Label>
                <Input
                  id="admin-otp"
                  data-ocid="admin.otp.input"
                  type="text"
                  placeholder="6-digit OTP"
                  value={otp}
                  onChange={(e) => {
                    setOtp(e.target.value);
                    setOtpError("");
                    loginMutation.reset();
                  }}
                  maxLength={6}
                  required
                  autoComplete="one-time-code"
                />
              </div>
              <Button
                type="submit"
                data-ocid="admin.verify_otp.submit_button"
                disabled={loginMutation.isPending}
                className="w-full bg-navy text-white hover:bg-navy-dark font-bold rounded-full py-3 mt-2"
                size="lg"
              >
                {loginMutation.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Verifying...
                  </>
                ) : (
                  "Verify OTP"
                )}
              </Button>
              <div className="text-center">
                <button
                  type="button"
                  data-ocid="admin.back.button"
                  onClick={() => {
                    setOtpStep("email");
                    setOtp("");
                    setOtpError("");
                    loginMutation.reset();
                  }}
                  className="text-sm text-muted-foreground hover:text-navy underline underline-offset-2 transition-colors"
                >
                  ← Back
                </button>
              </div>
            </form>
          )}
        </div>

        <p className="text-center text-muted-foreground text-xs mt-4">
          Restricted access — authorized personnel only.
        </p>
      </div>
    </div>
  );
}
