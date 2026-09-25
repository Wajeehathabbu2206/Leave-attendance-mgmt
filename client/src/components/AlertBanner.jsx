export default function AlertBanner({ warnings = [] }) {
  if (!warnings.length) return null;
  return (
    <div className="mb-5 rounded-xl border border-[#F4DCA7] bg-[#FDF0D5] p-4 text-sm text-[#8A5300]">
      <p className="font-semibold">Attendance alerts</p>
      <ul className="mt-1 list-disc pl-5">
        {warnings.map((warning) => (
          <li key={warning}>{warning}</li>
        ))}
      </ul>
    </div>
  );
}
