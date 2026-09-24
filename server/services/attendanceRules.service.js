import Attendance from '../models/Attendance.js';

export async function getAttendanceAlerts(studentId) {
  const records = await Attendance.find({ studentId, periodNumber: null }).sort({ date: 1 }).select('date status');
  const marked = records.filter((record) => ['present', 'absent', 'late', 'leave'].includes(record.status));
  const attended = marked.filter((record) => record.status === 'present' || record.status === 'late').length;
  const warnings = [];
  if (marked.length && (attended / marked.length) * 100 < 75) warnings.push('Attendance below 75%');

  let consecutiveAbsent = 0;
  let previousDate = null;
  for (const record of marked) {
    const currentDate = new Date(`${record.date}T00:00:00Z`);
    const nextDay = previousDate ? new Date(previousDate.getTime() + 86400000) : null;
    if (record.status === 'absent' && (!nextDay || currentDate.getTime() === nextDay.getTime())) consecutiveAbsent += 1;
    else if (record.status === 'absent') consecutiveAbsent = 1;
    else consecutiveAbsent = 0;
    previousDate = currentDate;
    if (consecutiveAbsent >= 3) break;
  }
  if (consecutiveAbsent >= 3) warnings.push('Absent 3 consecutive days');
  return warnings;
}