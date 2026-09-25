const palette = {
  present: "#14B8A6",
  absent: "#D9485F",
  late: "#F2A93B",
  leave: "#6D5BD0",
  unmarked: "#D6E4F0",
};

export function AttendanceTrend({
  records = [],
  title = "Attendance trend",
  caption = "Daily attendance this month",
}) {
  const byDate = new Map(records.map((record) => [record.date, record.status]));
  const now = new Date();
  const days = Array.from({ length: now.getDate() }, (_, index) => {
    const day = index + 1;
    const date = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
    return { day, date, status: byDate.get(date) || "unmarked" };
  });
  const marked = days.filter((day) => day.status !== "unmarked");
  return (
    <section className="panel">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-sm font-semibold text-[#0B1F3A]">{title}</h2>
          <p className="mt-1 text-xs text-[#5B7590]">{caption}</p>
        </div>
        <div className="flex flex-wrap gap-x-3 gap-y-1 text-[11px] text-[#5B7590]">
          {["present", "absent", "late", "leave"].map((status) => (
            <span className="capitalize" key={status}>
              <i
                className="mr-1 inline-block h-2 w-2 rounded-full"
                style={{ backgroundColor: palette[status] }}
              />
              {status}
            </span>
          ))}
        </div>
      </div>
      <div
        aria-label={title}
        className="mt-5 flex h-24 items-end gap-1"
        role="img"
      >
        {days.map(({ day, date, status }) => (
          <div
            className="group relative flex h-full flex-1 items-end"
            key={date}
          >
            <div
              className="w-full rounded-t-sm transition-opacity group-hover:opacity-70"
              style={{
                height: status === "unmarked" ? "14%" : "100%",
                backgroundColor: palette[status] || palette.unmarked,
              }}
              title={`${date}: ${status}`}
            />
            <span className="pointer-events-none absolute -top-7 left-1/2 z-10 hidden -translate-x-1/2 whitespace-nowrap rounded bg-[#0B1F3A] px-2 py-1 text-[10px] text-white group-hover:block">
              {day} · {status}
            </span>
          </div>
        ))}
      </div>
      <div className="mt-2 flex justify-between text-[10px] text-[#7A93AD]">
        <span>1</span>
        <span>{Math.ceil(days.length / 2)}</span>
        <span>{days.length}</span>
      </div>
      <p className="mt-3 text-xs text-[#5B7590]">
        {marked.length} of {days.length} days marked
      </p>
    </section>
  );
}

export function StatusBreakdown({
  summary = {},
  total = 0,
  title = "Today’s attendance",
}) {
  const parts = [
    { label: "Present", key: "present", color: palette.present },
    { label: "Absent", key: "absent", color: palette.absent },
    { label: "Late", key: "late", color: palette.late },
    { label: "Leave", key: "leave", color: palette.leave },
  ];
  const marked = parts.reduce(
    (sum, part) => sum + (Number(summary[part.key]) || 0),
    0,
  );
  const circumference = 2 * Math.PI * 40;
  let offset = 0;
  return (
    <section className="panel">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-sm font-semibold text-[#0B1F3A]">{title}</h2>
          <p className="mt-1 text-xs text-[#5B7590]">
            {marked} of {total} students marked
          </p>
        </div>
        <div className="relative h-24 w-24 shrink-0">
          <svg
            className="h-full w-full -rotate-90"
            viewBox="0 0 96 96"
            role="img"
            aria-label={`${marked} of ${total} students marked`}
          >
            <circle
              cx="48"
              cy="48"
              r="40"
              fill="none"
              stroke="#E1ECF5"
              strokeWidth="10"
            />
            {parts.map((part) => {
              const amount = total
                ? ((Number(summary[part.key]) || 0) / total) * circumference
                : 0;
              const circle = (
                <circle
                  key={part.key}
                  cx="48"
                  cy="48"
                  r="40"
                  fill="none"
                  stroke={part.color}
                  strokeDasharray={`${amount} ${circumference - amount}`}
                  strokeDashoffset={-offset}
                  strokeWidth="10"
                />
              );
              offset += amount;
              return circle;
            })}
          </svg>
          <div className="absolute inset-0 flex items-center justify-center text-sm font-semibold text-[#0B1F3A]">
            {total ? `${Math.round((marked / total) * 100)}%` : "—"}
          </div>
        </div>
      </div>
      <div className="mt-4 grid grid-cols-2 gap-2">
        {parts.map((part) => (
          <div
            className="flex items-center justify-between rounded-lg bg-[#F6FAFD] px-3 py-2"
            key={part.key}
          >
            <span className="text-xs text-[#5B7590]">
              <i
                className="mr-2 inline-block h-2 w-2 rounded-full"
                style={{ backgroundColor: part.color }}
              />
              {part.label}
            </span>
            <span className="text-sm font-semibold text-[#0B1F3A]">
              {Number(summary[part.key]) || 0}
            </span>
          </div>
        ))}
      </div>
    </section>
  );
}

export function MetricBar({ label, value, total, color = "#14B8A6", detail }) {
  const percentage = total
    ? Math.min((Number(value) / Number(total)) * 100, 100)
    : 0;
  return (
    <div>
      <div className="mb-2 flex items-center justify-between gap-3">
        <span className="text-sm text-[#0B1F3A]">{label}</span>
        <span className="text-xs text-[#5B7590]">
          {detail || `${value} / ${total}`}
        </span>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-[#E6EFF7]">
        <div
          className="h-full rounded-full"
          style={{ width: `${percentage}%`, backgroundColor: color }}
        />
      </div>
    </div>
  );
}
