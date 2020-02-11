// https://stackoverflow.com/a/58110124/2615091
export default function nonNullable<T>(value: T): value is NonNullable<T> {
  return !!value;
}
