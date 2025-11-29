const { Course, Enrollment, Progress } = require('../models/Course');
const mongoose = require('mongoose');

// Course Controllers
exports.createCourse = async (req, res) => {
  try {
    const courseData = {
      ...req.body,
      createdBy: req.user.id
    };

    const course = new Course(courseData);
    await course.save();

    res.status(201).json({
      success: true,
      message: 'Course created successfully',
      data: course
    });
  } catch (error) {
    console.error('Error creating course:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating course',
      error: error.message
    });
  }
};

exports.getAllCourses = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      category,
      level,
      search,
      sort = 'createdAt',
      order = 'desc'
    } = req.query;

    // Build filter
    const filter = { status: 'published' };
    
    if (category) filter.category = category;
    if (level) filter.level = level;
    if (search) {
      filter.$text = { $search: search };
    }

    // Build sort
    const sortOptions = {};
    sortOptions[sort] = order === 'desc' ? -1 : 1;

    const courses = await Course.find(filter)
      .populate('instructor', 'name email avatar')
      .sort(sortOptions)
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .exec();

    const total = await Course.countDocuments(filter);

    res.json({
      success: true,
      data: {
        courses,
        pagination: {
          current: page,
          pages: Math.ceil(total / limit),
          total
        }
      }
    });
  } catch (error) {
    console.error('Error fetching courses:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching courses',
      error: error.message
    });
  }
};

exports.getCourseById = async (req, res) => {
  try {
    const course = await Course.findById(req.params.id)
      .populate('instructor', 'name email avatar bio')
      .populate('createdBy', 'name email');

    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Course not found'
      });
    }

    res.json({
      success: true,
      data: course
    });
  } catch (error) {
    console.error('Error fetching course:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching course',
      error: error.message
    });
  }
};

exports.updateCourse = async (req, res) => {
  try {
    const course = await Course.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Course not found'
      });
    }

    res.json({
      success: true,
      message: 'Course updated successfully',
      data: course
    });
  } catch (error) {
    console.error('Error updating course:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating course',
      error: error.message
    });
  }
};

exports.deleteCourse = async (req, res) => {
  try {
    const course = await Course.findByIdAndDelete(req.params.id);

    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Course not found'
      });
    }

    // Also delete related enrollments and progress
    await Enrollment.deleteMany({ course: req.params.id });
    await Progress.deleteMany({ course: req.params.id });

    res.json({
      success: true,
      message: 'Course deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting course:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting course',
      error: error.message
    });
  }
};

// Enrollment Controllers
exports.enrollInCourse = async (req, res) => {
  try {
    const { courseId } = req.body;
    const userId = req.user.id;

    // Check if course exists and is available
    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Course not found'
      });
    }

    if (course.status !== 'published') {
      return res.status(400).json({
        success: false,
        message: 'Course is not available for enrollment'
      });
    }

    // Check if already enrolled
    const existingEnrollment = await Enrollment.findOne({
      user: userId,
      course: courseId
    });

    if (existingEnrollment) {
      return res.status(400).json({
        success: false,
        message: 'Already enrolled in this course'
      });
    }

    // Check enrollment capacity
    if (course.enrollment.currentStudents >= course.enrollment.maxStudents) {
      return res.status(400).json({
        success: false,
        message: 'Course is full'
      });
    }

    // Create enrollment
    const enrollment = new Enrollment({
      user: userId,
      course: courseId
    });

    await enrollment.save();

    // Update course enrollment count
    await Course.findByIdAndUpdate(courseId, {
      $inc: { 'enrollment.currentStudents': 1 }
    });

    res.status(201).json({
      success: true,
      message: 'Enrolled successfully',
      data: enrollment
    });
  } catch (error) {
    console.error('Error enrolling in course:', error);
    res.status(500).json({
      success: false,
      message: 'Error enrolling in course',
      error: error.message
    });
  }
};

exports.getUserEnrollments = async (req, res) => {
  try {
    const userId = req.user.id;
    const { status } = req.query;

    const filter = { user: userId };
    if (status) filter.status = status;

    const enrollments = await Enrollment.find(filter)
      .populate('course', 'title description thumbnail instructor category level duration')
      .populate('course.instructor', 'name avatar')
      .sort({ enrolledAt: -1 });

    res.json({
      success: true,
      data: enrollments
    });
  } catch (error) {
    console.error('Error fetching enrollments:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching enrollments',
      error: error.message
    });
  }
};

exports.getEnrollmentById = async (req, res) => {
  try {
    const enrollment = await Enrollment.findById(req.params.id)
      .populate('course')
      .populate('user', 'name email avatar');

    if (!enrollment) {
      return res.status(404).json({
        success: false,
        message: 'Enrollment not found'
      });
    }

    // Check if user owns this enrollment or is admin/instructor
    if (enrollment.user._id.toString() !== req.user.id && 
        req.user.role !== 'admin' && 
        enrollment.course.instructor.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    res.json({
      success: true,
      data: enrollment
    });
  } catch (error) {
    console.error('Error fetching enrollment:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching enrollment',
      error: error.message
    });
  }
};

// Progress Controllers
exports.updateProgress = async (req, res) => {
  try {
    const { courseId, lessonId, timeSpent, progress, completed } = req.body;
    const userId = req.user.id;

    // Find or create progress record
    let progressRecord = await Progress.findOne({
      user: userId,
      course: courseId,
      'lesson.lessonId': lessonId
    });

    if (!progressRecord) {
      progressRecord = new Progress({
        user: userId,
        course: courseId,
        lesson: { lessonId, type: req.body.lessonType || 'video' },
        timeSpent: timeSpent || 0,
        progress: progress || 0
      });
    } else {
      progressRecord.timeSpent += timeSpent || 0;
      progressRecord.progress = Math.min(100, progress || progressRecord.progress);
    }

    if (completed) {
      progressRecord.completedAt = new Date();
      progressRecord.progress = 100;
    }

    await progressRecord.save();

    // Update enrollment progress
    await this.updateEnrollmentProgress(userId, courseId);

    res.json({
      success: true,
      message: 'Progress updated successfully',
      data: progressRecord
    });
  } catch (error) {
    console.error('Error updating progress:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating progress',
      error: error.message
    });
  }
};

exports.updateEnrollmentProgress = async (userId, courseId) => {
  try {
    // Get all progress for this user and course
    const progressRecords = await Progress.find({
      user: userId,
      course: courseId
    });

    // Get course details to calculate total lessons
    const course = await Course.findById(courseId);
    if (!course) return;

    let totalLessons = 0;
    let completedLessons = 0;

    course.syllabus.forEach(week => {
      week.lessons.forEach(lesson => {
        totalLessons++;
        const progress = progressRecords.find(p => p.lesson.lessonId === lesson._id.toString());
        if (progress && progress.completedAt) {
          completedLessons++;
        }
      });
    });

    const percentage = totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0;

    // Update enrollment
    await Enrollment.findOneAndUpdate(
      { user: userId, course: courseId },
      {
        'progress.percentage': percentage,
        'progress.completedLessons': progressRecords.map(p => ({
          lessonId: p.lesson.lessonId,
          completedAt: p.completedAt,
          timeSpent: p.timeSpent
        }))
      }
    );

    // If 100% complete, mark as completed
    if (percentage === 100) {
      await Enrollment.findOneAndUpdate(
        { user: userId, course: courseId },
        {
          status: 'completed',
          completedAt: new Date()
        }
      );
    }
  } catch (error) {
    console.error('Error updating enrollment progress:', error);
  }
};

exports.getCourseProgress = async (req, res) => {
  try {
    const { courseId } = req.params;
    const userId = req.user.id;

    const progress = await Progress.find({
      user: userId,
      course: courseId
    }).sort({ 'lesson.lessonId': 1 });

    const enrollment = await Enrollment.findOne({
      user: userId,
      course: courseId
    });

    res.json({
      success: true,
      data: {
        progress,
        enrollment
      }
    });
  } catch (error) {
    console.error('Error fetching course progress:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching course progress',
      error: error.message
    });
  }
};

// Assessment Controllers
exports.submitAssessment = async (req, res) => {
  try {
    const { courseId, assessmentId, answers } = req.body;
    const userId = req.user.id;

    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Course not found'
      });
    }

    const assessment = course.assessments.id(assessmentId);
    if (!assessment) {
      return res.status(404).json({
        success: false,
        message: 'Assessment not found'
      });
    }

    // Calculate score
    let score = 0;
    let maxScore = 0;

    assessment.questions.forEach((question, index) => {
      maxScore += question.points;
      const userAnswer = answers[index];
      
      if (question.type === 'multiple-choice' || question.type === 'true-false') {
        if (userAnswer === question.correctAnswer) {
          score += question.points;
        }
      }
      // Add more scoring logic for other question types
    });

    const percentage = Math.round((score / maxScore) * 100);

    // Update enrollment with assessment score
    await Enrollment.findOneAndUpdate(
      { user: userId, course: courseId },
      {
        $push: {
          assessmentScores: {
            assessmentId,
            score,
            maxScore,
            percentage,
            attempts: 1, // This should be incremented
            completedAt: new Date()
          }
        }
      }
    );

    res.json({
      success: true,
      message: 'Assessment submitted successfully',
      data: {
        score,
        maxScore,
        percentage,
        passed: percentage >= assessment.passingScore
      }
    });
  } catch (error) {
    console.error('Error submitting assessment:', error);
    res.status(500).json({
      success: false,
      message: 'Error submitting assessment',
      error: error.message
    });
  }
};

// Analytics Controllers
exports.getCourseAnalytics = async (req, res) => {
  try {
    const { courseId } = req.params;
    const userId = req.user.id;

    // Check if user is instructor or admin
    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Course not found'
      });
    }

    if (course.instructor.toString() !== userId && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    const enrollments = await Enrollment.find({ course: courseId });
    const totalEnrollments = enrollments.length;
    const completedEnrollments = enrollments.filter(e => e.status === 'completed').length;
    const activeEnrollments = enrollments.filter(e => e.status === 'active').length;

    // Calculate average progress
    const avgProgress = enrollments.reduce((sum, e) => sum + e.progress.percentage, 0) / totalEnrollments;

    res.json({
      success: true,
      data: {
        totalEnrollments,
        completedEnrollments,
        activeEnrollments,
        completionRate: totalEnrollments > 0 ? (completedEnrollments / totalEnrollments) * 100 : 0,
        averageProgress: Math.round(avgProgress)
      }
    });
  } catch (error) {
    console.error('Error fetching course analytics:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching course analytics',
      error: error.message
    });
  }
};