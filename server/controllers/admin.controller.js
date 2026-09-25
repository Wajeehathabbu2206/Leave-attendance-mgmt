import bcrypt from "bcryptjs";
import mongoose from "mongoose";
import ClassSection from "../models/ClassSection.js";
import Student from "../models/Student.js";
import User from "../models/User.js";

function publicUser(user) {
  return {
    id: user._id,
    name: user.name,
    email: user.email,
    role: user.role,
    createdAt: user.createdAt,
  };
}

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

async function getTeacher(teacherId) {
  if (!validId(teacherId)) return null;
  return User.findOne({ _id: teacherId, role: "teacher" });
}

export async function listTeachers(req, res) {
  const teachers = await User.find({ role: "teacher" })
    .select("name email")
    .sort({ name: 1 })
    .lean();
  return response(res, 200, "Teachers loaded", teachers);
}

export async function createClass(req, res) {
  try {
    const { grade, section, classTeacherId } = req.body;
    if (!grade || !section || !classTeacherId)
      return response(
        res,
        400,
        "Grade, section, and class teacher are required",
      );
    if (!(await getTeacher(classTeacherId)))
      return response(res, 400, "classTeacherId must reference a teacher");

    const classSection = await ClassSection.create({
      grade,
      section,
      classTeacherId,
    });
    await classSection.populate("classTeacherId", "name email");
    return response(res, 201, "Class-section created", classSection);
  } catch (error) {
    if (error.code === 11000)
      return response(res, 409, "That grade and section already exists");
    return response(res, 500, "Unable to create class-section", error.message);
  }
}

export async function listClasses(req, res) {
  try {
    const classes = await ClassSection.find()
      .populate("classTeacherId", "name email")
      .sort({ grade: 1, section: 1 });
    return response(res, 200, "Classes loaded", classes);
  } catch (error) {
    return response(res, 500, "Unable to load classes", error.message);
  }
}

export async function updateClass(req, res) {
  try {
    const { grade, section, classTeacherId } = req.body;
    const updates = {};
    if (grade !== undefined) updates.grade = grade;
    if (section !== undefined) updates.section = section;
    if (classTeacherId !== undefined) {
      if (!(await getTeacher(classTeacherId)))
        return response(res, 400, "classTeacherId must reference a teacher");
      updates.classTeacherId = classTeacherId;
    }
    const classSection = await ClassSection.findByIdAndUpdate(
      req.params.id,
      updates,
      { new: true, runValidators: true },
    ).populate("classTeacherId", "name email");
    if (!classSection) return response(res, 404, "Class-section not found");
    return response(res, 200, "Class-section updated", classSection);
  } catch (error) {
    if (error.code === 11000)
      return response(res, 409, "That grade and section already exists");
    return response(res, 500, "Unable to update class-section", error.message);
  }
}

async function createAccount({ name, email, password, role }) {
  if (!name || !email || !password)
    throw Object.assign(new Error("Name, email, and password are required"), {
      status: 400,
    });
  const normalizedEmail = email.toLowerCase().trim();
  if (await User.exists({ email: normalizedEmail }))
    throw Object.assign(new Error("A user with that email already exists"), {
      status: 409,
    });
  return User.create({
    name,
    email: normalizedEmail,
    password: await bcrypt.hash(password, 12),
    role,
  });
}

export async function createTeacher(req, res) {
  try {
    const user = await createAccount({ ...req.body, role: "teacher" });
    return response(res, 201, "Teacher created", publicUser(user));
  } catch (error) {
    return response(
      res,
      error.status || 500,
      error.status ? error.message : "Unable to create teacher",
      error.status ? undefined : error.message,
    );
  }
}

export async function createStudent(req, res) {
  let user;
  try {
    const { rollNo, classSectionId } = req.body;
    if (!rollNo || !classSectionId)
      return response(res, 400, "Roll number and class-section are required");
    if (
      !validId(classSectionId) ||
      !(await ClassSection.exists({ _id: classSectionId }))
    )
      return response(res, 404, "Class-section not found");
    user = await createAccount({ ...req.body, role: "student" });
    const student = await Student.create({
      userId: user._id,
      classSectionId,
      rollNo,
    });
    await student.populate([
      { path: "userId", select: "name email" },
      { path: "classSectionId" },
    ]);
    return response(res, 201, "Student created", student);
  } catch (error) {
    if (user?._id) await User.findByIdAndDelete(user._id);
    if (error.code === 11000)
      return response(res, 409, "That email or roll number already exists");
    return response(
      res,
      error.status || 500,
      error.status ? error.message : "Unable to create student",
      error.status ? undefined : error.message,
    );
  }
}

export async function listStudents(req, res) {
  try {
    const filter = {};
    if (req.query.classSectionId) {
      if (!validId(req.query.classSectionId))
        return response(res, 400, "Invalid classSectionId");
      filter.classSectionId = req.query.classSectionId;
    }
    const students = await Student.find(filter)
      .populate("userId", "name email")
      .populate("classSectionId", "grade section")
      .sort({ classSectionId: 1, rollNo: 1 });
    return response(res, 200, "Students loaded", students);
  } catch (error) {
    return response(res, 500, "Unable to load students", error.message);
  }
}

function studentLookup(value) {
  return value.includes("@")
    ? { "userId.email": value.toLowerCase().trim() }
    : { rollNo: value.trim() };
}

export async function createParent(req, res) {
  let user;
  try {
    const { students } = req.body;
    if (!Array.isArray(students) || students.length === 0)
      return response(
        res,
        400,
        "At least one student roll number or email is required",
      );
    user = await createAccount({ ...req.body, role: "parent" });
    const studentDocs = await Student.find().populate("userId", "email");
    const matches = students.map((value) => {
      const lookup = studentLookup(String(value));
      return studentDocs.find((student) =>
        lookup.rollNo
          ? student.rollNo === lookup.rollNo
          : student.userId?.email === lookup["userId.email"],
      );
    });
    if (matches.some((student) => !student)) {
      await User.findByIdAndDelete(user._id);
      return response(res, 404, "One or more students could not be found");
    }
    await Student.updateMany(
      { _id: { $in: matches.map((student) => student._id) } },
      { $addToSet: { parentIds: user._id } },
    );
    return response(
      res,
      201,
      "Parent created and linked to students",
      publicUser(user),
    );
  } catch (error) {
    if (user?._id) await User.findByIdAndDelete(user._id);
    return response(
      res,
      error.status || 500,
      error.status ? error.message : "Unable to create parent",
      error.status ? undefined : error.message,
    );
  }
}
