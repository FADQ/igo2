export function arrayDiff(array1: Array<any>, array2: Array<any>) {
  return array1.filter((v1: any) => !array2.includes(v1))
    .concat(array2.filter((v2: any) => !array1.includes(v2)));
}

export function arrayEqual(array1: Array<any>, array2: Array<any>) {
  return arrayDiff(array1, array2).length === 0;
}