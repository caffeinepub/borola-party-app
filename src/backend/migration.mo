import Map "mo:core/Map";
import Principal "mo:core/Principal";
import Text "mo:core/Text";
import Storage "blob-storage/Storage";

module {
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

  type OldState = {
    mlAs : Map.Map<Principal, Mla>;
    candidates : Map.Map<Principal, Candidate>;
    supporters : Map.Map<Principal, Supporter>;
    adminSessions : Map.Map<Text, AdminSession>;
  };

  type NewState = {
    mlAs : Map.Map<Principal, Mla>;
    candidates : Map.Map<Principal, Candidate>;
    supporters : Map.Map<Principal, Supporter>;
    adminSessions : Map.Map<Text, AdminSession>;
  };

  public func run(old : OldState) : NewState {
    old;
  };
};
