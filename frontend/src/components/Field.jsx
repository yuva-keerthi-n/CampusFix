export default function Field({ label, error, required, hint, children }) {
  return (
    <div>
      {label && (
        <label className="label">
          {label} {required && <span className="text-brand-600">*</span>}
        </label>
      )}
      {children}
      {hint && !error && <p className="mt-1.5 text-xs text-slate-500">{hint}</p>}
      {error && <p className="mt-1.5 text-xs font-medium text-red-600">{error}</p>}
    </div>
  );
}
