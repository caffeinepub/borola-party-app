import type { Principal } from "@icp-sdk/core/principal";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { ExternalBlob } from "../backend";
import type { Candidate, Mla, Supporter } from "../backend";
import { useActor } from "./useActor";

export function useGetAllMlas() {
  const { actor, isFetching } = useActor();
  return useQuery<Mla[]>({
    queryKey: ["mlas"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllMlas();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useGetAllCandidates() {
  const { actor, isFetching } = useActor();
  return useQuery<Candidate[]>({
    queryKey: ["candidates"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllCandidates();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useGetAllSupporters() {
  const { actor, isFetching } = useActor();
  return useQuery<Supporter[]>({
    queryKey: ["supporters"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllSupporters();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useAddSupporter() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (supporter: Supporter) => {
      if (!actor) throw new Error("Actor not available");
      return actor.addSupporter(supporter);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["supporters"] });
    },
  });
}

export function useAdminLogin() {
  const { actor } = useActor();
  return useMutation({
    mutationFn: async ({
      username,
      password,
    }: { username: string; password: string }) => {
      if (!actor) throw new Error("Actor not available");
      const token = await actor.adminLogin(username, password);
      return token;
    },
  });
}

export function useVerifyAdmin() {
  const { actor, isFetching } = useActor();
  const token = localStorage.getItem("borola_admin_token") || "";
  return useQuery<boolean>({
    queryKey: ["verifyAdmin", token],
    queryFn: async () => {
      if (!actor || !token) return false;
      return actor.verifyAdmin(token);
    },
    enabled: !!actor && !isFetching && !!token,
  });
}

export function useAddMla() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ token, mla }: { token: string; mla: Mla }) => {
      if (!actor) throw new Error("Actor not available");
      return actor.addMla(token, mla);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["mlas"] });
    },
  });
}

export function useUpdateMla() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ token, mla }: { token: string; mla: Mla }) => {
      if (!actor) throw new Error("Actor not available");
      return actor.updateMla(token, mla);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["mlas"] });
    },
  });
}

export function useDeleteMla() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ token, id }: { token: string; id: Principal }) => {
      if (!actor) throw new Error("Actor not available");
      return actor.deleteMla(token, id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["mlas"] });
    },
  });
}

export function useAddCandidate() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      token,
      candidate,
    }: { token: string; candidate: Candidate }) => {
      if (!actor) throw new Error("Actor not available");
      return actor.addCandidate(token, candidate);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["candidates"] });
    },
  });
}

export function useUpdateCandidate() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      token,
      candidate,
    }: { token: string; candidate: Candidate }) => {
      if (!actor) throw new Error("Actor not available");
      return actor.updateCandidate(token, candidate);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["candidates"] });
    },
  });
}

export function useDeleteCandidate() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ token, id }: { token: string; id: Principal }) => {
      if (!actor) throw new Error("Actor not available");
      return actor.deleteCandidate(token, id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["candidates"] });
    },
  });
}

export function useUpdateSupporter() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      token,
      supporter,
    }: { token: string; supporter: Supporter }) => {
      if (!actor) throw new Error("Actor not available");
      return actor.updateSupporter(token, supporter);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["supporters"] });
    },
  });
}

export function useDeleteSupporter() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ token, id }: { token: string; id: Principal }) => {
      if (!actor) throw new Error("Actor not available");
      return actor.deleteSupporter(token, id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["supporters"] });
    },
  });
}

export async function fileToUint8Array(
  file: File,
): Promise<Uint8Array<ArrayBuffer>> {
  const buffer = await file.arrayBuffer();
  return new Uint8Array(buffer) as Uint8Array<ArrayBuffer>;
}

export function getPhotoUrl(photo: ExternalBlob | undefined): string | null {
  if (!photo) return null;
  try {
    return photo.getDirectURL();
  } catch {
    return null;
  }
}
