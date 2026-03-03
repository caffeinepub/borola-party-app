import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export class ExternalBlob {
    getBytes(): Promise<Uint8Array<ArrayBuffer>>;
    getDirectURL(): string;
    static fromURL(url: string): ExternalBlob;
    static fromBytes(blob: Uint8Array<ArrayBuffer>): ExternalBlob;
    withUploadProgress(onProgress: (percentage: number) => void): ExternalBlob;
}
export interface Candidate {
    id: Principal;
    bio: string;
    name: string;
    constituency: string;
    photo?: ExternalBlob;
}
export interface Supporter {
    id: Principal;
    name: string;
    address: string;
    phone: string;
    photo?: ExternalBlob;
}
export interface Mla {
    id: Principal;
    bio: string;
    name: string;
    constituency: string;
    photo?: ExternalBlob;
}
export interface backendInterface {
    addCandidate(token: string, candidate: Candidate): Promise<void>;
    addMla(token: string, mla: Mla): Promise<void>;
    addSupporter(supporter: Supporter): Promise<void>;
    adminLogin(username: string, password: string): Promise<string>;
    deleteCandidate(token: string, id: Principal): Promise<void>;
    deleteMla(token: string, id: Principal): Promise<void>;
    deleteSupporter(token: string, id: Principal): Promise<void>;
    getAllCandidates(): Promise<Array<Candidate>>;
    getAllMlas(): Promise<Array<Mla>>;
    getAllSupporters(): Promise<Array<Supporter>>;
    updateCandidate(token: string, candidate: Candidate): Promise<void>;
    updateMla(token: string, mla: Mla): Promise<void>;
    updateSupporter(token: string, supporter: Supporter): Promise<void>;
    verifyAdmin(token: string): Promise<boolean>;
}
