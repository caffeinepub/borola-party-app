module {
  // Define the types used by the old actor.
  type OldActor = {
    adminPassword : Text;
  };

  // Define the types used by the new actor.
  type NewActor = {
    adminPassword : Text;
  };

  // Migration function called by the main actor via the with-clause
  public func run(old : OldActor) : NewActor {
    { old with adminPassword = "784509" };
  };
};
