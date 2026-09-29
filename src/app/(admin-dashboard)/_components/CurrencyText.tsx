// Renders a formatted money string, enlarging a leading riel sign (៛) so the
// Khmer symbol isn't dwarfed by the Latin digits. USD ($) strings pass through.
export default function CurrencyText({ text }: { text: string }) {
  if (!text.startsWith("៛")) return <>{text}</>;

  return (
    <>
      <span className="text-[1.25em] leading-none">៛</span>
      {text.slice(1)}
    </>
  );
}
