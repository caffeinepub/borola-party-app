import Map "mo:core/Map";
import Iter "mo:core/Iter";
import Principal "mo:core/Principal";
import Text "mo:core/Text";
import Random "mo:core/Random";
import Runtime "mo:core/Runtime";
import Migration "migration";
import Time "mo:core/Time";

import Storage "blob-storage/Storage";
import MixinStorage "blob-storage/Mixin";

// Specify the data migration function in the with-clause
(with migration = Migration.run)
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

  // Persisted state
  stable var mlAs : Map.Map<Principal, Mla> = Map.empty<Principal, Mla>();
  stable var candidates : Map.Map<Principal, Candidate> = Map.empty<Principal, Candidate>();
  stable var supporters : Map.Map<Principal, Supporter> = Map.empty<Principal, Supporter>();
  stable var adminSessions : Map.Map<Text, AdminSession> = Map.empty<Text, AdminSession>();

  public shared ({ caller }) func adminLogin(username : Text, password : Text) : async Text {
    if (username != "BOROLA2026" or password != "784509") {
      Runtime.trap("Invalid credentials");
    };

    let random = Random.crypto();
    let token = await* random.nat64();
    let tokenText = token.toText();
    let session : AdminSession = {
      token = tokenText;
      timestamp = Time.now();
    };

    adminSessions.add(tokenText, session);
    tokenText;
  };

  public query ({ caller }) func verifyAdmin(token : Text) : async Bool {
    adminSessions.containsKey(token);
  };

  // MLA Functions
  public query ({ caller }) func getAllMlas() : async [Mla] {
    mlAs.values().toArray();
  };

  public shared ({ caller }) func addMla(token : Text, mla : Mla) : async () {
    if (not adminSessions.containsKey(token)) {
      Runtime.trap("Invalid admin session");
    };
    mlAs.add(mla.id, mla);
  };

  public shared ({ caller }) func updateMla(token : Text, mla : Mla) : async () {
    if (not adminSessions.containsKey(token)) {
      Runtime.trap("Invalid admin session");
    };
    mlAs.add(mla.id, mla);
  };

  public shared ({ caller }) func deleteMla(token : Text, id : Principal) : async () {
    if (not adminSessions.containsKey(token)) {
      Runtime.trap("Invalid admin session");
    };
    mlAs.remove(id);
  };

  // Candidate Functions
  public query ({ caller }) func getAllCandidates() : async [Candidate] {
    candidates.values().toArray();
  };

  public shared ({ caller }) func addCandidate(token : Text, candidate : Candidate) : async () {
    if (not adminSessions.containsKey(token)) {
      Runtime.trap("Invalid admin session");
    };
    candidates.add(candidate.id, candidate);
  };

  public shared ({ caller }) func updateCandidate(token : Text, candidate : Candidate) : async () {
    if (not adminSessions.containsKey(token)) {
      Runtime.trap("Invalid admin session");
    };
    candidates.add(candidate.id, candidate);
  };

  public shared ({ caller }) func deleteCandidate(token : Text, id : Principal) : async () {
    if (not adminSessions.containsKey(token)) {
      Runtime.trap("Invalid admin session");
    };
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
    if (not adminSessions.containsKey(token)) {
      Runtime.trap("Invalid admin session");
    };
    supporters.add(supporter.id, supporter);
  };

  public shared ({ caller }) func deleteSupporter(token : Text, id : Principal) : async () {
    if (not adminSessions.containsKey(token)) {
      Runtime.trap("Invalid admin session");
    };
    supporters.remove(id);
  };
};
