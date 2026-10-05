import bcrypt from "bcryptjs";
import dotenv from "dotenv";
import mongoose from "mongoose";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { connectDB } from "./config/db.js";
import Attendance from "./models/Attendance.js";
import ClassSection from "./models/ClassSection.js";
import LeaveBalance from "./models/LeaveBalance.js";
import LeaveRequest from "./models/LeaveRequest.js";
import Student from "./models/Student.js";
import Subject from "./models/Subject.js";
import Timetable from "./models/Timetable.js";
import User from "./models/User.js";
import { getAttendanceAlerts } from "./services/attendanceRules.service.js";

dotenv.config({
  path: path.join(path.dirname(fileURLToPath(import.meta.url)), ".env"),
});

const demoPassword = process.env.DEMO_PASSWORD;
if (!demoPassword || demoPassword.length < 12) {
  throw new Error(
    "Set DEMO_PASSWORD to a unique password of at least 12 characters in server/.env",
  );
}

const currentYear = new Date().getFullYear();
const academicStartYear = Number(
  process.env.DEMO_DATA_YEAR ||
    (new Date().getMonth() < 7 ? currentYear - 1 : currentYear),
);
if (!Number.isInteger(academicStartYear) || academicStartYear < 2000) {
  throw new Error("DEMO_DATA_YEAR must be a four-digit year from 2000 onward");
}

const academicYear = `${academicStartYear}-${academicStartYear + 1}`;
const attendanceStart = `${academicStartYear}-08-01`;
const attendanceEnd =
  academicStartYear === currentYear
    ? [
        new Date().toISOString().slice(0, 10),
        `${academicStartYear}-10-31`,
      ].sort()[0]
    : `${academicStartYear}-10-31`;

const staff = [
  { key: "teacher-1", name: "Ananya Rao", email: "ananya.rao@markmyday.example" },
  { key: "teacher-2", name: "Rahul Menon", email: "rahul.menon@markmyday.example" },
  { key: "teacher-3", name: "Farah Khan", email: "farah.khan@markmyday.example" },
  { key: "teacher-4", name: "Arjun Das", email: "arjun.das@markmyday.example" },
];

const classDefinitions = [
  { key: "6A", grade: "6", section: "A", teacher: "teacher-1" },
  { key: "6B", grade: "6", section: "B", teacher: "teacher-2" },
  { key: "7A", grade: "7", section: "A", teacher: "teacher-3" },
  { key: "7B", grade: "7", section: "B", teacher: "teacher-4" },
];

const guardianDefinitions = [
  { key: "kapoor-family", name: "Meera Kapoor", email: "meera.kapoor@markmyday.example" },
  { key: "mehta-family", name: "Sanjay Mehta", email: "sanjay.mehta@markmyday.example" },
  { key: "iyer-family", name: "Lakshmi Iyer", email: "lakshmi.iyer@markmyday.example" },
  { key: "khan-family", name: "Nadeem Khan", email: "nadeem.khan@markmyday.example" },
  { key: "sharma-family", name: "Pooja Sharma", email: "pooja.sharma@markmyday.example" },
  { key: "singh-family", name: "Harpreet Singh", email: "harpreet.singh@markmyday.example" },
];

const studentDefinitions = [
  { name: "Aarav Kapoor", email: "aarav.kapoor@markmyday.example", guardian: "kapoor-family", class: "6A" },
  { name: "Rohan Kapoor", email: "rohan.kapoor@markmyday.example", guardian: "kapoor-family", class: "7A" },
  { name: "Anaya Mehta", email: "anaya.mehta@markmyday.example", guardian: "mehta-family", class: "6A" },
  { name: "Kabir Mehta", email: "kabir.mehta@markmyday.example", guardian: "mehta-family", class: "7B" },
  { name: "Diya Iyer", email: "diya.iyer@markmyday.example", guardian: "iyer-family", class: "6A" },
  { name: "Vivaan Iyer", email: "vivaan.iyer@markmyday.example", guardian: "iyer-family", class: "7A" },
  { name: "Ishaan Khan", email: "ishaan.khan@markmyday.example", guardian: "khan-family", class: "6B" },
  { name: "Meera Khan", email: "meera.khan@markmyday.example", guardian: "khan-family", class: "7A" },
  { name: "Arjun Sharma", email: "arjun.sharma@markmyday.example", guardian: "sharma-family", class: "6B" },
  { name: "Zoya Sharma", email: "zoya.sharma@markmyday.example", guardian: "sharma-family", class: "7B" },
  { name: "Tara Singh", email: "tara.singh@markmyday.example", guardian: "singh-family", class: "6B" },
  { name: "Nikhil Singh", email: "nikhil.singh@markmyday.example", guardian: "singh-family", class: "7B" },
];

const subjectDefinitions = [
  { name: "English", code: "DMO-ENG" },
  { name: "Mathematics", code: "DMO-MAT" },
  { name: "Environmental Science", code: "DMO-SCI" },
  { name: "Social Studies", code: "DMO-SST" },
  { name: "Hindi", code: "DMO-HIN" },
  { name: "Computer Applications", code: "DMO-COM" },
];

const schoolHolidays = new Set([
  `${academicStartYear}-08-15`,
  `${academicStartYear}-10-02`,
]);

function toDateString(date) {
  return date.toISOString().slice(0, 10);
}

function getSchoolDates(start, end) {
  const dates = [];
  for (
    let date = new Date(`${start}T00:00:00Z`);
    toDateString(date) <= end;
    date.setUTCDate(date.getUTCDate() + 1)
  ) {
    const day = date.getUTCDay();
    const dateString = toDateString(date);
    if (day !== 0 && !schoolHolidays.has(dateString)) dates.push(dateString);
  }
  return dates;
}

function schoolDateInMonth(month, targetDay) {
  const monthPrefix = `${academicStartYear}-${String(month).padStart(2, "0")}`;
  const lastDay = new Date(Date.UTC(academicStartYear, month, 0)).getUTCDate();
  const monthDates = getSchoolDates(
    `${monthPrefix}-01`,
    `${monthPrefix}-${String(lastDay).padStart(2, "0")}`,
  );
  return (
    monthDates.find((date) => Number(date.slice(8, 10)) >= targetDay) ||
    monthDates.at(-1)
  );
}

function nextOctoberSchoolDates(targetDay, count) {
  const dates = [];
  for (let day = targetDay; day <= 31 && dates.length < count; day += 1) {
    const date = `${academicStartYear}-10-${String(day).padStart(2, "0")}`;
    const parsed = new Date(`${date}T00:00:00Z`);
    if (
      parsed.getUTCMonth() === 9 &&
      parsed.getUTCDay() !== 0 &&
      !schoolHolidays.has(date)
    )
      dates.push(date);
  }
  return dates;
}

function leaveRequest(student, teacher, fromDate, toDate, type, reason, status) {
  return {
    studentId: student._id,
    classSectionId: student.classSectionId,
    fromDate,
    toDate,
    type,
    reason,
    status,
    ...(status === "pending"
      ? {}
      : {
          reviewedBy: teacher._id,
          reviewedAt: new Date(`${toDate}T15:00:00Z`),
          teacherRemarks:
            status === "approved"
              ? "Thank you for the supporting note. Leave recorded."
              : "Please contact the class teacher to discuss an alternative.",
        }),
  };
}

async function upsertUser({ name, email, role, passwordHash }) {
  const normalizedEmail = email.toLowerCase();
  const existing = await User.findOne({ email: normalizedEmail });
  if (existing && existing.role !== role) {
    throw new Error(
      `Cannot seed ${normalizedEmail}: the address is already used by a ${existing.role} account`,
    );
  }
  if (existing) {
    existing.name = name;
    existing.password = passwordHash;
    await existing.save();
    return existing;
  }
  return User.create({
    name,
    email: normalizedEmail,
    role,
    password: passwordHash,
  });
}

const schoolDates = getSchoolDates(attendanceStart, attendanceEnd);

try {
  await connectDB();

  const passwordHash = await bcrypt.hash(demoPassword, 12);
  const teachers = new Map();
  for (const definition of staff) {
    teachers.set(
      definition.key,
      await upsertUser({ ...definition, role: "teacher", passwordHash }),
    );
  }

  const classes = new Map();
  for (const definition of classDefinitions) {
    const teacher = teachers.get(definition.teacher);
    let classSection = await ClassSection.findOne({
      grade: definition.grade,
      section: definition.section,
    });
    if (classSection && !classSection.classTeacherId.equals(teacher._id)) {
      throw new Error(
        `Cannot seed demo class ${definition.grade}${definition.section}: it already belongs to another teacher`,
      );
    }
    if (!classSection) {
      classSection = await ClassSection.create({
        grade: definition.grade,
        section: definition.section,
        classTeacherId: teacher._id,
      });
    }
    classes.set(definition.key, classSection);
  }

  const guardians = new Map();
  for (const definition of guardianDefinitions) {
    guardians.set(
      definition.key,
      await upsertUser({ ...definition, role: "parent", passwordHash }),
    );
  }

  const students = [];
  for (const [index, definition] of studentDefinitions.entries()) {
    const user = await upsertUser({
      ...definition,
      role: "student",
      passwordHash,
    });
    const classSection = classes.get(definition.class);
    const student = await Student.findOneAndUpdate(
      { userId: user._id },
      {
        $set: {
          classSectionId: classSection._id,
          rollNo: `${definition.class.replace(/[A-Z]/g, "")}-${String(index + 1).padStart(3, "0")}`,
          parentIds: [guardians.get(definition.guardian)._id],
        },
      },
      { new: true, upsert: true, runValidators: true },
    );
    students.push({ ...definition, user, profile: student });
  }

  const subjects = new Map();
  for (const definition of subjectDefinitions) {
    const subject = await Subject.findOneAndUpdate(
      { code: definition.code },
      { $set: { name: definition.name }, $setOnInsert: { code: definition.code } },
      { new: true, upsert: true, runValidators: true },
    );
    subjects.set(definition.code, subject);
  }

  for (const [classIndex, definition] of classDefinitions.entries()) {
    const classSection = classes.get(definition.key);
    for (const [dayIndex, dayOfWeek] of [
      "Mon",
      "Tue",
      "Wed",
      "Thu",
      "Fri",
      "Sat",
    ].entries()) {
      const periods = Array.from({ length: 5 }, (_, periodIndex) => {
        const subjectCode =
          subjectDefinitions[
            (periodIndex + dayIndex + classIndex) % subjectDefinitions.length
          ].code;
        const teacher =
          teachers.get(staff[(periodIndex + dayIndex + classIndex) % staff.length].key);
        return {
          periodNumber: periodIndex + 1,
          subjectId: subjects.get(subjectCode)._id,
          teacherId: teacher._id,
        };
      });
      await Timetable.findOneAndUpdate(
        { classSectionId: classSection._id, dayOfWeek },
        { $set: { periods } },
        { new: true, upsert: true, runValidators: true },
      );
    }
  }

  const requests = [];
  const pendingDates = nextOctoberSchoolDates(6, 2);
  for (const [index, student] of students.entries()) {
    const classTeacher = teachers.get(
      classDefinitions.find(
        (item) => item.key === student.class,
      ).teacher,
    );
    if (index === 0) {
      requests.push(
        leaveRequest(
          student.profile,
          classTeacher,
          schoolDateInMonth(8, 12),
          schoolDateInMonth(8, 13),
          "sick",
          "Flu symptoms; medical note shared with the class teacher.",
          "approved",
        ),
        leaveRequest(
          student.profile,
          classTeacher,
          schoolDateInMonth(9, 9),
          schoolDateInMonth(9, 9),
          "casual",
          "Family appointment outside the city.",
          "approved",
        ),
        leaveRequest(
          student.profile,
          classTeacher,
          schoolDateInMonth(9, 21),
          schoolDateInMonth(9, 21),
          "other",
          "Request to attend a family function.",
          "rejected",
        ),
        leaveRequest(
          student.profile,
          classTeacher,
          pendingDates[0],
          pendingDates[1],
          "sick",
          "Follow-up appointment; awaiting teacher confirmation.",
          "pending",
        ),
      );
    } else {
      const month = index % 2 === 0 ? 8 : 9;
      const type = ["sick", "casual", "other"][index % 3];
      const status = index % 3 === 0 ? "rejected" : "approved";
      const date = schoolDateInMonth(month, 5 + index * 2);
      requests.push(
        leaveRequest(
          student.profile,
          classTeacher,
          date,
          date,
          type,
          status === "approved"
            ? [
                "Seasonal illness; parent informed the school office.",
                "Religious observance with family.",
                "Dental appointment; student will collect missed work.",
              ][index % 3]
            : "Family commitment; supporting details were not provided.",
          status,
        ),
      );
      if (index < 5 && pendingDates[index % pendingDates.length]) {
        const pendingDate = pendingDates[index % pendingDates.length];
        requests.push(
          leaveRequest(
            student.profile,
            classTeacher,
            pendingDate,
            pendingDate,
            index % 2 === 0 ? "casual" : "other",
            "Parent-submitted request; awaiting class teacher review.",
            "pending",
          ),
        );
      }
    }
  }

  for (const request of requests) {
    await LeaveRequest.findOneAndUpdate(
      {
        studentId: request.studentId,
        fromDate: request.fromDate,
        toDate: request.toDate,
        type: request.type,
        reason: request.reason,
      },
      { $set: request },
      { new: true, upsert: true, runValidators: true },
    );
  }

  const approvedByStudentAndType = new Map();
  for (const request of requests.filter((item) => item.status === "approved")) {
    const key = `${request.studentId}-${request.type}`;
    const days =
      (new Date(`${request.toDate}T00:00:00Z`) -
        new Date(`${request.fromDate}T00:00:00Z`)) /
        86400000 +
      1;
    approvedByStudentAndType.set(
      key,
      (approvedByStudentAndType.get(key) || 0) + days,
    );
  }

  for (const student of students) {
    for (const leaveType of ["sick", "casual", "other"]) {
      const key = `${student.profile._id}-${leaveType}`;
      await LeaveBalance.findOneAndUpdate(
        {
          studentId: student.profile._id,
          leaveType,
          academicYear,
        },
        {
          $set: {
            totalAllotted: leaveType === "sick" ? 12 : leaveType === "casual" ? 10 : 5,
            used: approvedByStudentAndType.get(key) || 0,
          },
          $setOnInsert: {
            studentId: student.profile._id,
            leaveType,
            academicYear,
          },
        },
        { new: true, upsert: true, runValidators: true },
      );
    }
  }

  const approvedLeaveDates = new Map();
  for (const request of requests.filter((item) => item.status === "approved")) {
    for (
      let date = new Date(`${request.fromDate}T00:00:00Z`);
      toDateString(date) <= request.toDate;
      date.setUTCDate(date.getUTCDate() + 1)
    ) {
      const key = `${request.studentId}-${toDateString(date)}`;
      approvedLeaveDates.set(key, request);
    }
  }

  const attendanceOperations = [];
  for (const [studentIndex, student] of students.entries()) {
    const classTeacher = teachers.get(
      classDefinitions.find(
        (item) => item.key === student.class,
      ).teacher,
    );
    for (const [dayIndex, date] of schoolDates.entries()) {
      const approvedLeave = approvedLeaveDates.get(
        `${student.profile._id}-${date}`,
      );
      let status;
      if (approvedLeave) {
        status = "leave";
      } else if (studentIndex === 0 && dayIndex % 3 === 0) {
        status = "absent";
      } else {
        const signal = (dayIndex * 17 + studentIndex * 29 + 13) % 100;
        status = signal < 9 ? "absent" : signal < 15 ? "late" : "present";
      }
      attendanceOperations.push({
        updateOne: {
          filter: {
            studentId: student.profile._id,
            date,
            periodNumber: null,
          },
          update: {
            $set: {
              classSectionId: student.profile.classSectionId,
              periodNumber: null,
              status,
              markedBy: approvedLeave?.reviewedBy || classTeacher._id,
              remarks:
                status === "absent"
                  ? "Parent notified; follow-up recorded by the class teacher."
                  : status === "late"
                    ? "Arrived after morning registration."
                    : status === "leave"
                      ? approvedLeave.reason
                      : "",
            },
          },
          upsert: true,
        },
      });
    }
  }
  if (attendanceOperations.length)
    await Attendance.bulkWrite(attendanceOperations);

  const lowAttendanceStudent = students[0];
  const lowAttendanceRecords = await Attendance.find({
    studentId: lowAttendanceStudent.profile._id,
    periodNumber: null,
    date: { $gte: attendanceStart, $lte: attendanceEnd },
  }).select("status");
  const attendedDays = lowAttendanceRecords.filter((record) =>
    ["present", "late"].includes(record.status),
  ).length;
  const attendancePercentage = lowAttendanceRecords.length
    ? Number(((attendedDays / lowAttendanceRecords.length) * 100).toFixed(2))
    : 0;
  const warnings = await getAttendanceAlerts(lowAttendanceStudent.profile._id);
  if (attendancePercentage >= 75 || !warnings.includes("Attendance below 75%")) {
    throw new Error(
      `Demo attendance invariant failed: ${lowAttendanceStudent.name} must be below 75% and receive a parent warning`,
    );
  }

  console.log(
    `Demo school data is ready for ${attendanceStart} through ${attendanceEnd}.`,
  );
  console.log(
    `${students.length} students, ${staff.length} teachers, ${guardianDefinitions.length} guardians, ${classDefinitions.length} class sections, ${attendanceOperations.length} attendance records, and ${requests.length} leave requests seeded.`,
  );
  console.log(
    `${lowAttendanceStudent.name}: ${attendancePercentage}% attendance; parent alert: ${warnings.join("; ")}.`,
  );
  console.log(
    `Guardian login for the flagged student: ${guardians.get(lowAttendanceStudent.guardian).email}`,
  );
  console.log("All demo accounts use the configured DEMO_PASSWORD.");
} catch (error) {
  console.error(`Demo seed failed: ${error.message}`);
  process.exitCode = 1;
} finally {
  await mongoose.disconnect();
}
