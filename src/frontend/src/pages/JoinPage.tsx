import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { fileToUint8Array, useAddSupporter } from "@/hooks/useQueries";
import { Principal } from "@icp-sdk/core/principal";
import { CheckCircle, Loader2, Upload, UserPlus, X } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useRef, useState } from "react";
import { toast } from "sonner";
import { ExternalBlob } from "../backend";

export default function JoinPage() {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const addSupporter = useAddSupporter();

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setPhotoFile(file);
    const url = URL.createObjectURL(file);
    setPhotoPreview(url);
  };

  const clearPhoto = () => {
    setPhotoFile(null);
    if (photoPreview) URL.revokeObjectURL(photoPreview);
    setPhotoPreview(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !phone.trim() || !address.trim()) {
      toast.error("Please fill in all required fields.");
      return;
    }

    let photoBlob: ExternalBlob | undefined;
    if (photoFile) {
      try {
        const bytes = await fileToUint8Array(photoFile);
        photoBlob = ExternalBlob.fromBytes(bytes);
      } catch {
        toast.error("Failed to process photo. Please try again.");
        return;
      }
    }

    try {
      await addSupporter.mutateAsync({
        id: Principal.fromText("2vxsx-fae"),
        name: name.trim(),
        phone: phone.trim(),
        address: address.trim(),
        photo: photoBlob,
      });
      setSubmitted(true);
    } catch (_err) {
      toast.error("Failed to register. Please try again.");
    }
  };

  return (
    <div data-ocid="join.page" className="min-h-screen font-body">
      {/* Page Header */}
      <section className="bg-navy py-16 relative overflow-hidden">
        <div
          className="absolute inset-0 opacity-5"
          style={{
            backgroundImage:
              "repeating-linear-gradient(-45deg, oklch(var(--saffron)) 0, oklch(var(--saffron)) 1px, transparent 0, transparent 50%)",
            backgroundSize: "24px 24px",
          }}
        />
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center gap-2 bg-saffron/20 border border-saffron/40 rounded-full px-4 py-1.5 mb-4">
            <UserPlus className="w-4 h-4 text-saffron" />
            <span className="text-saffron text-xs font-bold tracking-widest uppercase">
              Become a Member
            </span>
          </div>
          <h1 className="font-display text-white text-3xl sm:text-4xl lg:text-5xl font-bold mb-3">
            Join the Borola Party
          </h1>
          <p className="text-white/70 text-lg max-w-xl mx-auto">
            Register as a supporter and be part of the movement for change.
          </p>
        </div>
      </section>

      <div className="h-1 bg-saffron" />

      {/* Form Section */}
      <section className="py-16 bg-white">
        <div className="max-w-2xl mx-auto px-4 sm:px-6">
          <AnimatePresence mode="wait">
            {submitted ? (
              <motion.div
                key="success"
                data-ocid="join.success_state"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.4 }}
                className="text-center py-16"
              >
                <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-6">
                  <CheckCircle className="w-10 h-10 text-green-600" />
                </div>
                <h2 className="font-display text-navy text-3xl font-bold mb-3">
                  Welcome to Borola Party!
                </h2>
                <p className="text-muted-foreground text-lg mb-2">
                  You have successfully joined the Borola Party!
                </p>
                <p className="text-muted-foreground">
                  Your profile has been added to our supporters list.
                </p>
                <div className="mt-8">
                  <Button
                    onClick={() => {
                      setSubmitted(false);
                      setName("");
                      setPhone("");
                      setAddress("");
                      clearPhoto();
                    }}
                    variant="outline"
                    className="rounded-full px-8 border-navy text-navy hover:bg-navy hover:text-white"
                  >
                    Register Another Person
                  </Button>
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="form"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
              >
                {/* Form Card */}
                <div className="bg-white rounded-2xl border border-border shadow-navy p-8">
                  <h2 className="font-display text-navy text-2xl font-bold mb-6">
                    Registration Form
                  </h2>
                  <form onSubmit={handleSubmit} className="space-y-5">
                    {/* Name */}
                    <div className="space-y-1.5">
                      <Label htmlFor="name" className="text-navy font-semibold">
                        Full Name <span className="text-destructive">*</span>
                      </Label>
                      <Input
                        id="name"
                        data-ocid="join.name.input"
                        type="text"
                        placeholder="Enter your full name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        required
                        className="border-input focus-visible:ring-saffron"
                      />
                    </div>

                    {/* Phone */}
                    <div className="space-y-1.5">
                      <Label
                        htmlFor="phone"
                        className="text-navy font-semibold"
                      >
                        Phone Number <span className="text-destructive">*</span>
                      </Label>
                      <Input
                        id="phone"
                        data-ocid="join.phone.input"
                        type="tel"
                        placeholder="+91 XXXXX XXXXX"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        required
                        className="border-input focus-visible:ring-saffron"
                      />
                    </div>

                    {/* Address */}
                    <div className="space-y-1.5">
                      <Label
                        htmlFor="address"
                        className="text-navy font-semibold"
                      >
                        Address <span className="text-destructive">*</span>
                      </Label>
                      <Textarea
                        id="address"
                        data-ocid="join.address.textarea"
                        placeholder="Enter your full address"
                        value={address}
                        onChange={(e) => setAddress(e.target.value)}
                        required
                        rows={3}
                        className="border-input focus-visible:ring-saffron resize-none"
                      />
                    </div>

                    {/* Photo Upload */}
                    <div className="space-y-1.5">
                      <Label className="text-navy font-semibold">
                        Photo{" "}
                        <span className="text-muted-foreground text-xs font-normal">
                          (Optional)
                        </span>
                      </Label>
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        onChange={handlePhotoChange}
                        className="hidden"
                        id="photo-upload"
                      />
                      {photoPreview ? (
                        <div className="relative w-32 h-32">
                          <img
                            src={photoPreview}
                            alt="Preview"
                            className="w-32 h-32 rounded-xl object-cover border-2 border-saffron"
                          />
                          <button
                            type="button"
                            onClick={clearPhoto}
                            className="absolute -top-2 -right-2 w-6 h-6 bg-destructive rounded-full flex items-center justify-center text-white hover:bg-red-700 transition-colors"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ) : (
                        <label
                          htmlFor="photo-upload"
                          data-ocid="join.photo.upload_button"
                          className="flex flex-col items-center justify-center w-full h-36 border-2 border-dashed border-border rounded-xl cursor-pointer hover:border-saffron hover:bg-saffron/5 transition-all group"
                        >
                          <Upload className="w-8 h-8 text-muted-foreground group-hover:text-saffron mb-2 transition-colors" />
                          <span className="text-muted-foreground text-sm font-medium group-hover:text-saffron transition-colors">
                            Click to upload photo
                          </span>
                          <span className="text-muted-foreground text-xs mt-1">
                            JPG, PNG up to 5MB
                          </span>
                        </label>
                      )}
                    </div>

                    {/* Submit */}
                    <Button
                      type="submit"
                      data-ocid="join.submit_button"
                      disabled={addSupporter.isPending}
                      className="w-full bg-navy text-white hover:bg-navy-dark font-bold rounded-full py-3 text-base mt-2"
                      size="lg"
                    >
                      {addSupporter.isPending ? (
                        <>
                          <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                          Registering...
                        </>
                      ) : (
                        <>
                          <UserPlus className="mr-2 h-5 w-5" />
                          Join the Borola Party
                        </>
                      )}
                    </Button>
                  </form>
                </div>

                {/* Note */}
                <p className="text-center text-muted-foreground text-sm mt-4">
                  By registering, your profile will be publicly visible on the
                  Supporters page.
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </section>
    </div>
  );
}
