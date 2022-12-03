import { range, filter, map } from "rxjs";

const pipe = range(1, 200).pipe(
  filter((x) => x % 2 === 1),
  map((x) => x + x)
);

pipe.subscribe((x) => console.log(x));
