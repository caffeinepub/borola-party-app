import Map "mo:core/Map";
import Text "mo:core/Text";
import Principal "mo:core/Principal";
import Random "mo:core/Random";
import Runtime "mo:core/Runtime";

import Storage "blob-storage/Storage";
import MixinStorage "blob-storage/Mixin";



actor {
  include MixinStorage();

  type Mla = {
    id : Principal;
    name : Text;
    constituency : Text;
    bio : Text;
    photo : ?Storage.ExternalBlob;
  };

  type Candidate = {
    id : Principal;
    name : Text;
    constituency : Text;
    bio : Text;
    photo : ?Storage.ExternalBlob;
  };

  type Supporter = {
    id : Principal;
    name : Text;
    phone : Text;
    address : Text;
    photo : ?Storage.ExternalBlob;
  };

  type AdminSession = {
    token : Text;
    timestamp : Int;
  };

  let mlAs = Map.empty<Principal, Mla>();
  let candidates = Map.empty<Principal, Candidate>();
  let supporters = Map.empty<Principal, Supporter>();
  let adminSessions = Map.empty<Text, AdminSession>();

  // Hardcoded admin credentials
  let adminId = "BOROLA2026";
  let adminPassword = "784509";

  public shared ({ caller }) func adminLogin(username : Text, password : Text) : async Text {
    if (username != adminId or password != adminPassword) {
      Runtime.trap("Invalid credentials");
    };

    let random = Random.crypto();
    let token = await* random.nat64();
    let session : AdminSession = {
      token = token.toText();
      timestamp = 0;
    };

    adminSessions.add(token.toText(), session);
    token.toText();
  };

  public query ({ caller }) func verifyAdmin(token : Text) : async Bool {
    adminSessions.containsKey(token);
  };

  // MLA Functions
  public query ({ caller }) func getAllMlas() : async [Mla] {
    mlAs.values().toArray();
  };

  public shared ({ caller }) func addMla(token : Text, mla : Mla) : async () {
    assert (adminSessions.containsKey(token));
    mlAs.add(mla.id, mla);
  };

  public shared ({ caller }) func updateMla(token : Text, mla : Mla) : async () {
    assert (adminSessions.containsKey(token));
    mlAs.add(mla.id, mla);
  };

  public shared ({ caller }) func deleteMla(token : Text, id : Principal) : async () {
    assert (adminSessions.containsKey(token));
    mlAs.remove(id);
  };

  // Candidate Functions
  public query ({ caller }) func getAllCandidates() : async [Candidate] {
    candidates.values().toArray();
  };

  public shared ({ caller }) func addCandidate(token : Text, candidate : Candidate) : async () {
    assert (adminSessions.containsKey(token));
    candidates.add(candidate.id, candidate);
  };

  public shared ({ caller }) func updateCandidate(token : Text, candidate : Candidate) : async () {
    assert (adminSessions.containsKey(token));
    candidates.add(candidate.id, candidate);
  };

  public shared ({ caller }) func deleteCandidate(token : Text, id : Principal) : async () {
    assert (adminSessions.containsKey(token));
    candidates.remove(id);
  };

  // Supporter Functions
  public query ({ caller }) func getAllSupporters() : async [Supporter] {
    supporters.values().toArray();
  };

  public shared ({ caller }) func addSupporter(supporter : Supporter) : async () {
    supporters.add(supporter.id, supporter);
  };

  public shared ({ caller }) func updateSupporter(token : Text, supporter : Supporter) : async () {
    assert (adminSessions.containsKey(token));
    supporters.add(supporter.id, supporter);
  };

  public shared ({ caller }) func deleteSupporter(token : Text, id : Principal) : async () {
    assert (adminSessions.containsKey(token));
    supporters.remove(id);
  };
};
