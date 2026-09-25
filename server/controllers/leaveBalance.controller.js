import mongoose from "mongoose";
import ClassSection from "../models/ClassSection.js";
import LeaveBalance from "../models/LeaveBalance.js";
import Student from "../models/Student.js";

const leaveTypes = ["sick", "casual", "other"];

function response(res, status, message, data) {
  return res.status(status).json({
    success: status < 400,
    message,
    ...(data === undefined ? {} : { data }),
  });
}

function validId(id) {
  return mongoose.Types.ObjectId.isValid(id);
}

function validAcademicYear(value) {
  return (
    /^\d{4}-(\d{4})$/.test(value || "") &&
    Number(value.slice(5)) === Number(value.slice(0, 4)) + 1
  );
}

function balanceView(balance) {
  return {
    leaveType: balance.leaveType,
    totalAllotted: balance.totalAllotted,
    used: balance.used,
    remaining: Math.max(balance.totalAllotted - balance.used, 0),
  };
}

export async function setLeaveBalances(req, res) {
  try {
    const { academicYear, leaveConfig, classSectionId, studentIds } = req.body;
    if (!validAcademicYear(academicYear))
      return response(res, 400, "academicYear must use the YYYY-YYYY format");
    if (
      !leaveConfig ||
      leaveTypes.some(
        (type) => !Number.isInteger(leaveConfig[type]) || leaveConfig[type] < 0,
      )
    )
      return response(
        res,
        400,
        "leaveConfig must contain non-negative integer sick, casual, and other allotments",
      );
    if (classSectionId && !validId(classSectionId))
      return response(res, 400, "Invalid classSectionId");
    if (classSectionId && !(await ClassSection.exists({ _id: classSectionId })))
      return response(res, 404, "Class-section not found");
    if (
      studentIds !== undefined &&
      (!Array.isArray(studentIds) || studentIds.some((id) => !validId(id)))
    )
      return response(res, 400, "studentIds must be an array of valid ids");
    if (!classSectionId && (!studentIds || studentIds.length === 0))
      return response(res, 400, "Provide classSectionId or studentIds");

    const filter = classSectionId
      ? { classSectionId }
      : { _id: { $in: studentIds } };
    const students = await Student.find(filter).select("_id");
    if (studentIds && students.length !== new Set(studentIds).size)
      return response(res, 404, "One or more students could not be found");
    if (!students.length)
      return response(res, 404, "No students found for the allotment");

    const existing = await LeaveBalance.find({
      studentId: { $in: students.map((student) => student._id) },
      academicYear,
    });
    const exceedsUsed = existing.find(
      (balance) => balance.used > leaveConfig[balance.leaveType],
    );
    if (exceedsUsed)
      return response(
        res,
        400,
        `Cannot set ${exceedsUsed.leaveType} allotment below days already used`,
      );

    const operations = students.flatMap((student) =>
      leaveTypes.map((leaveType) => ({
        updateOne: {
          filter: { studentId: student._id, leaveType, academicYear },
          update: {
            $set: { totalAllotted: leaveConfig[leaveType] },
            $setOnInsert: { used: 0 },
          },
          upsert: true,
        },
      })),
    );
    await LeaveBalance.bulkWrite(operations);
    return response(res, 200, "Leave balances set", {
      students: students.length,
      academicYear,
    });
  } catch (error) {
    if (error.code === 11000)
      return response(
        res,
        409,
        "A leave balance already exists for one of the selected students",
      );
    return response(res, 500, "Unable to set leave balances", error.message);
  }
}

export async function getStudentBalances(req, res) {
  try {
    const student = await Student.findOne({ userId: req.user.userId }).select(
      "_id",
    );
    if (!student) return response(res, 404, "Student profile not found");
    const balances = await LeaveBalance.find({ studentId: student._id }).sort({
      leaveType: 1,
    });
    return response(
      res,
      200,
      "Leave balances loaded",
      balances.map(balanceView),
    );
  } catch (error) {
    return response(res, 500, "Unable to load leave balances", error.message);
  }
}

export async function getParentBalances(req, res) {
  try {
    if (!validId(req.query.studentId))
      return response(res, 400, "A valid studentId is required");
    const student = await Student.findOne({
      _id: req.query.studentId,
      parentIds: req.user.userId,
    }).select("_id");
    if (!student)
      return response(
        res,
        403,
        "You can only view balances for your linked children",
      );
    const balances = await LeaveBalance.find({ studentId: student._id }).sort({
      leaveType: 1,
    });
    return response(
      res,
      200,
      "Leave balances loaded",
      balances.map(balanceView),
    );
  } catch (error) {
    return response(res, 500, "Unable to load leave balances", error.message);
  }
}

export async function getTeacherBalances(req, res) {
  try {
    if (!validId(req.query.studentId))
      return response(res, 400, "A valid studentId is required");
    const student = await Student.findById(req.query.studentId).populate(
      "classSectionId",
      "classTeacherId",
    );
    if (
      !student ||
      student.classSectionId?.classTeacherId.toString() !== req.user.userId
    )
      return response(
        res,
        403,
        "You can only view balances for your assigned students",
      );
    const balances = await LeaveBalance.find({ studentId: student._id }).sort({
      leaveType: 1,
    });
    return response(
      res,
      200,
      "Leave balances loaded",
      balances.map(balanceView),
    );
  } catch (error) {
    return response(res, 500, "Unable to load leave balances", error.message);
  }
}
