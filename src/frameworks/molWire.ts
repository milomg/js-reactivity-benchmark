import { ReactiveFramework, Signal } from "../util/reactiveFramework";
import $ from "mol_wire_lib";

const Atom = $.$mol_wire_atom; // fix a bug in mol exports

let toCleanup: ($.$mol_wire_atom<unknown, [], unknown>)[] = [];
export const molWireFramework: ReactiveFramework = {
  name: "$mol_wire_atom",
  signal: <T>(initialValue: T): Signal<T> => {
    const atom = new Atom("", (next: T = initialValue) => next);
    return {
      write: (v: T) => atom.put(v),
      read: () => atom.sync(),
    };
  },
  computed: (fn) => {
    const atom = new Atom("", fn);
    return {
      read: () => atom.sync(),
    };
  },
  effect: (fn) => toCleanup.push(new Atom("", fn)),
  withBatch: (fn) => {
    fn();
    Atom.sync();
  },
  withBuild: (fn) => fn(),
  cleanup: () => {
    for (const cleanup of toCleanup) {
      cleanup.destructor();
    }
    toCleanup = [];
  },
};
