const thaiNumerals: string[] = ["๐", "๑", "๒", "๓", "๔", "๕", "๖", "๗", "๘", "๙"];
const regularNumerals: string[] = ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9"];

export function hasThaiNumerals(text: string): boolean {
  const thaiNumeralsPattern: RegExp = /[๐-๙]/;
  return thaiNumeralsPattern.test(text);
}

export function convert(dateString: string): string {
  return dateString.replace(
    new RegExp(thaiNumerals.join("|"), "g"),
    (match: string) => regularNumerals[thaiNumerals.indexOf(match)]
  );
}
