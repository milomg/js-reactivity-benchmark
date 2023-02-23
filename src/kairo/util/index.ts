export function busy() {
  let a = 0;
  for (let i = 0; i < 1_00; i++) {
    a++;
  }
}

export function assert(exp: any, value: any) {
  if (exp !== value) throw Error(`Assertation failed ${exp} !== ${value}`);
}
