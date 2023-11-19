const express = require("express");
const app = express();

const mongoose = require("mongoose");
const config = require("./utils/config");
const MONGODB_URI = config.MONGODB_URI;
const PORT = config.PORT;

app.use(express.json());

mongoose.set("strictQuery", false);

// if (!MONGODB_URI) {
//   console.error('MONGODB_URI is not defined. Please check your configuration.');
//   process.exit(1);
// }

// console.log('connecting to', MONGODB_URI);

mongoose.connect(MONGODB_URI)
.then(() => {
  console.log('Connected to MongoDB');
})
.catch((err) => {
  console.error('Error connecting to MongoDB:', err);
});

const mentorSchema = new mongoose.Schema({
  name: String,
  students: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Student'}]
});


  
const Mentor = mongoose.model("Mentor", mentorSchema);

const studentSchema = new mongoose.Schema({
  name: String,
  mentor: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Mentor'}]
});
  
const Student = mongoose.model("Student", studentSchema);

app.get('/', (req, res) => {
  res.status(200).json({
    message: 'Welcome to the mentor and student assignment database'
  })
});

app.post('/create_mentor', async (req, res) => {
  try {
    const mentor = new Mentor(req.body);
    await mentor.save();
    res.json({ message: "Mentor created successfully", id: mentor._id });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "something went wrong" });
  }
});

app.post('/create_student', async (req, res) => {
  try {
    const student = new Student(req.body);
    await student.save();
    res.json({ message: "Student data created successfully", id: student._id });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "something went wrong while creating data" });
  }
});

app.get("/mentors", async (req, res) => {
  try {
    const mentors = await Mentor.find({});
    res.json(mentors);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'something went wrong' });
  }
});

app.get("/students", async (req, res) => {
  try {
    const students = await Student.find({});
    res.json(students);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'something went wrong' });
  }
});

app.put('/assign_students/:id/:studentId', async (req, res) => {
  try {
    const { id, studentId } = req.params;
    
    const mentor = await Mentor.findById(id);

    if (!mentor) {
      return res.status(404).json({ message: "Mentor not found" });
    }

    const student = await Student.findById(studentId);

    if (!student) {
      return res.status(404).json({ message: "Student not found" });
    }

    // Check if the student is already assigned to a mentor
    if (student.mentor && student.mentor !== id) {
      const previousMentor = await Mentor.findById(student.mentor);
      if (previousMentor) {
        // Remove the student from the previous mentor's list
        previousMentor.students.pull(studentId);
        await previousMentor.save();
      }
    }

    // Assign the student to the new mentor
    mentor.students.addToSet(studentId);
    student.mentor = id;

    await Promise.all([mentor.save(), student.save()]);

    res.json({ message: "Student assigned to a new mentor", mentor, student });
  } catch (error) {
    res.status(500).json({ message: "Something went wrong while assigning" });
  }
});


app.get("/mentor_student/:id", async (req, res) => {
  try {
    const mentor = await Mentor.findById(req.params.id).populate('students');

    if (mentor) {
      res.json({ mentor });
    } else {
      res.status(404).json({ message: 'mentor not found' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "something went wrong" });
  }
});

app.put("/change_mentor/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { newMentorId } = req.body;

    const student = await Student.findById(id);

    if (!student) {
      return res.status(404).json({ message: "student not found" });
    }

    const newMentor = await Mentor.findById(newMentorId);
    
    if (!newMentor) {
      return res.status(404).json({ message: "new mentor not found" });
    }

    student.mentor = newMentorId;

    await student.save();

    res.json({ message: "student and mentor updated successfully", student });
  } catch (error) {
    res.status(500).json({ message: "something went wrong" });
  }
});

app.listen(PORT, () => {
  console.log(`server running on port ${PORT}`);
});