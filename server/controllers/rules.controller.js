import Student from "../models/Student.js";
import mongoose from "mongoose";
import ClassSection from "../models/ClassSection.js";
import { getAttendanceAlerts } from "../services/attendanceRules.service.js";

function response(res, status, message, data) {
  return res.status(status).json({
    success: status < 400,
    message,
    ...(data === undefined ? {} : { data }),
  });
}

export async function getStudentAttendanceAlerts(req, res) {
  try {
    const student = await Student.findOne({ userId: req.user.userId }).select(
      "_id",
    );
    if (!student) return response(res, 404, "Student profile not found");
    return response(res, 200, "Attendance alerts loaded", {
      warnings: await getAttendanceAlerts(student._id),
    });
  } catch (error) {
    return response(
      res,
      500,
      "Unable to load attendance alerts",
      error.message,
    );
  }
}

export async function getParentAttendanceAlerts(req, res) {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.query.studentId))
      return response(res, 400, "A valid studentId is required");
    const student = await Student.findOne({
      _id: req.query.studentId,
      parentIds: req.user.userId,
    }).select("_id");
    if (!student)
      return response(
        res,
        403,
        "You can only view alerts for your linked children",
      );
    return response(res, 200, "Attendance alerts loaded", {
      warnings: await getAttendanceAlerts(student._id),
    });
  } catch (error) {
    return response(
      res,
      500,
      "Unable to load attendance alerts",
      error.message,
    );
  }
}

export async function getTeacherAttendanceAlerts(req, res) {
  try {
    if (
      !mongoose.Types.ObjectId.isValid(req.query.classSectionId) ||
      !(await ClassSection.exists({
        _id: req.query.classSectionId,
        classTeacherId: req.user.userId,
      }))
    )
      return response(
        res,
        403,
        "You can only view alerts for your assigned class",
      );
    const students = await Student.find({
      classSectionId: req.query.classSectionId,
    })
      .populate("userId", "name")
      .select("userId");
    const warnings = (
      await Promise.all(
        students.map(async (student) => ({
          studentId: student._id,
          name: student.userId?.name,
          warnings: await getAttendanceAlerts(student._id),
        })),
      )
    ).filter((item) => item.warnings.length);
    return response(res, 200, "Class attendance alerts loaded", warnings);
  } catch (error) {
    return response(
      res,
      500,
      "Unable to load class attendance alerts",
      error.message,
    );
  }
}
