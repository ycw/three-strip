import { UvFn } from "./Type";

function uvFnGen(
  x: number,
  mode: 0 | 1 | 2 | 3
): ReturnType<UvFn> {
  switch (mode) {
    case 0: return [0, x, 1, x];
    case 1: return [x, 1, x, 0];
    case 2: return [1, x, 0, x];
    case 3: return [x, 0, x, 1];
  }
}

export class UvPreset {
  static dash: [UvFn, UvFn, UvFn, UvFn] = [
    (i, I) => uvFnGen(i / I, 0),
    (i, I) => uvFnGen(i / I, 1),
    (i, I) => uvFnGen(1 - i / I, 2),
    (i, I) => uvFnGen(1 - i / I, 3),
  ];
  static strip: [UvFn, UvFn, UvFn, UvFn] = [
    (_i, _I, j, J) => uvFnGen(j / J, 0),
    (_i, _I, j, J) => uvFnGen(j / J, 1),
    (_i, _I, j, J) => uvFnGen(1 - j / J, 2),
    (_i, _I, j, J) => uvFnGen(1 - j / J, 3),
  ];
}