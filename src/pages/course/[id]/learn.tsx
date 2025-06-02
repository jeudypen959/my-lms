import { useState, useEffect, useCallback, useMemo } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import Link from 'next/link';
import Header from '@/components/Header/Header';
import Footer from '@/components/Footer/Footer';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db, auth } from '@/config/firebaseConfig';
import { Timestamp } from 'firebase/firestore';
import 'bootstrap/dist/css/bootstrap.min.css';
import ReactPlayer from 'react-player';
import { onAuthStateChanged } from 'firebase/auth';

// Define interfaces for TypeScript
interface Lesson {
  title: string;
  videoUrl?: string;
  duration?: string;
  isQuiz?: boolean;
  quizId?: string;
}

interface Module {
  title: string;
  lessons: Lesson[];
}

interface Course {
  id: string;
  courseTitle: string;
  modules: Module[];
}

interface QuizQuestion {
  question: string;
  options: string[];
  correctAnswer: number;
}

interface QuizData {
  title: string;
  questions: QuizQuestion[];
}

interface FirestoreCourseData {
  courseTitle?: string;
  modules?: { [key: string]: { title: string; lessons?: Lesson[] } };
}

interface UserProgress {
  completedCourse: boolean;
  completedLessons: string[];
  courseTitle: string;
  lastUpdated: Timestamp;
  moduleProgress: {
    [key: string]: {
      completed: boolean;
      completedLessons: string[];
      quizResults?: {
        [lessonId: string]: {
          score: number;
          answers: (number | null)[];
        };
      };
    };
  };
  certificateGenerated?: boolean;
}

const Learn = () => {
  const router = useRouter();
  const { id: rawId, module: moduleQuery } = router.query;
  const [course, setCourse] = useState<Course | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedModule, setSelectedModule] = useState<number>(0);
  const [selectedLesson, setSelectedLesson] = useState<number>(0);
  const [activeDropdown, setActiveDropdown] = useState<number | null>(null);
  const [videoError, setVideoError] = useState<string>('');
  const [moduleCompletion, setModuleCompletion] = useState<boolean[]>([]);
  const [lessonCompletion, setLessonCompletion] = useState<boolean[][]>([]);
  const [isFinalExam, setIsFinalExam] = useState(false);
  const [certificateAvailable, setCertificateAvailable] = useState(false);
  const [quizData, setQuizData] = useState<QuizData | null>(null);
  const [quizLoading, setQuizLoading] = useState(false);
  const [quizError, setQuizError] = useState('');
  const [answers, setAnswers] = useState<(number | null)[]>([]);
  const [score, setScore] = useState<number | null>(null);
  const [timeLeft, setTimeLeft] = useState(300);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [allQuestionsAnswered, setAllQuestionsAnswered] = useState(false);
  const [showQuizResultsOnly, setShowQuizResultsOnly] = useState(false);
  const [showFinalExamResultsOnly, setShowFinalExamResultsOnly] = useState(false);
  const [lastQuizAnswers, setLastQuizAnswers] = useState<(number | null)[]>([]);
  const [lastQuizScore, setLastQuizScore] = useState<number | null>(null);
  const [lastFinalExamAnswers, setLastFinalExamAnswers] = useState<(number | null)[]>([]);
  const [lastFinalExamScore, setLastFinalExamScore] = useState<number | null>(null);
  const [finalExamAvailable, setFinalExamAvailable] = useState(false);

  const id = typeof rawId === 'string' ? rawId : undefined;

  const currentModule = useMemo(
    () => course?.modules[selectedModule] || { title: '', lessons: [] },
    [course, selectedModule]
  );
  const currentLesson = useMemo(
    () => (currentModule.lessons.length > 0 && !isFinalExam ? currentModule.lessons[selectedLesson] : null),
    [currentModule, selectedLesson, isFinalExam]
  );

  // Handle module query parameter
  useEffect(() => {
    if (moduleQuery && typeof moduleQuery === 'string') {
      const moduleIndex = parseInt(moduleQuery, 10);
      if (!isNaN(moduleIndex) && moduleIndex >= 0 && course && moduleIndex < course.modules.length) {
        setSelectedModule(moduleIndex);
        setActiveDropdown(moduleIndex);
      }
    }
  }, [moduleQuery, course]);

  // Check if final exam is available
  useEffect(() => {
    setFinalExamAvailable(moduleCompletion.every((completed) => completed));
  }, [moduleCompletion]);

  const getDirectVideoUrl = (url?: string): string => {
    if (!url) {
      console.log('No video URL provided');
      return '';
    }
    try {
      if (url.includes('dropbox.com')) {
        if (url.includes('dl=1')) return url;
        if (url.includes('dl=0')) return url.replace('dl=0', 'dl=1');
        if (url.includes('?')) return `${url}&dl=1`;
        return `${url}?dl=1`;
      }
      return url;
    } catch (err) {
      console.error('Error transforming video URL:', err);
      return url;
    }
  };

  // Fetch course data
  useEffect(() => {
    const fetchCourseDetail = async () => {
      if (!id) {
        setError('No course ID provided');
        setLoading(false);
        return;
      }
      setLoading(true);
      try {
        const docRef = doc(db, 'courses', id);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const courseData = docSnap.data() as FirestoreCourseData;
          const modulesArray: Module[] = [];
          if (courseData.modules && typeof courseData.modules === 'object') {
            Object.keys(courseData.modules).forEach((key, index) => {
              const moduleData = courseData.modules![key];
              if (moduleData && typeof moduleData === 'object' && 'title' in moduleData) {
                const lessonsWithQuiz: Lesson[] = [
                  ...(moduleData.lessons || []),
                  {
                    title: `${moduleData.title} Quiz`,
                    isQuiz: true,
                    quizId: `quiz_${id}_${index}`,
                  },
                ];
                modulesArray.push({
                  title: moduleData.title,
                  lessons: lessonsWithQuiz,
                });
              }
            });
          }
          const courseWithModules: Course = {
            id: docSnap.id,
            courseTitle: courseData.courseTitle || 'Untitled Course',
            modules: modulesArray,
          };
          setCourse(courseWithModules);
          setModuleCompletion(new Array(modulesArray.length).fill(false));
          setLessonCompletion(
            modulesArray.map((module) => new Array(module.lessons.length).fill(false))
          );
          console.log('Course fetched:', courseWithModules);
        } else {
          setError('Course not found');
        }
      } catch (err) {
        console.error('Error fetching course:', err);
        setError('Failed to load course content');
      } finally {
        setLoading(false);
      }
    };
    fetchCourseDetail();
  }, [id]);

  // Fetch user progress on auth state change
  useEffect(() => {
    if (!id || !course) return;

    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        try {
          const progressDocId = `${user.uid}_${id}`;
          const progressRef = doc(db, 'userProgress', progressDocId);
          const progressSnap = await getDoc(progressRef);

          if (progressSnap.exists()) {
            const data = progressSnap.data() as UserProgress;
            const completedLessons = Array.isArray(data.completedLessons) ? data.completedLessons : [];
            const moduleProgress = data.moduleProgress || {};

            // Initialize lesson completion
            const newLessonCompletion = course.modules.map((module, moduleIndex) => {
              const moduleKey = `module${moduleIndex + 1}`;
              const moduleLessons = moduleProgress[moduleKey]?.completedLessons || [];
              return module.lessons.map((_, lessonIndex) => {
                const lessonId = `lesson-module${moduleIndex + 1}-${lessonIndex}`;
                return completedLessons.includes(lessonId) || moduleLessons.includes(lessonId);
              });
            });
            setLessonCompletion(newLessonCompletion);

            // Initialize module completion
            const newModuleCompletion = course.modules.map((_, moduleIndex) => {
              const moduleKey = `module${moduleIndex + 1}`;
              return moduleProgress[moduleKey]?.completed || false;
            });
            setModuleCompletion(newModuleCompletion);

            // Load quiz results
            course.modules.forEach((module, moduleIndex) => {
              const moduleKey = `module${moduleIndex + 1}`;
              const quizResults = moduleProgress[moduleKey]?.quizResults || {};
              module.lessons.forEach((lesson, lessonIndex) => {
                if (lesson.isQuiz) {
                  const lessonId = `lesson-module${moduleIndex + 1}-${lessonIndex}`;
                  if (quizResults[lessonId]) {
                    if (moduleIndex === selectedModule && lessonIndex === selectedLesson) {
                      setLastQuizScore(quizResults[lessonId].score);
                      setLastQuizAnswers(quizResults[lessonId].answers);
                      if (newLessonCompletion[moduleIndex][lessonIndex]) {
                        setShowQuizResultsOnly(true);
                      }
                    }
                  }
                }
              });
            });

            // Check if certificate is generated
            setCertificateAvailable(data.certificateGenerated || false);
            console.log('User progress loaded:', data);
          }
        } catch (err) {
          console.error('Error fetching user progress:', err);
          setError('Failed to load progress. Please try again.');
        }
      }
    });

    return () => unsubscribe();
  }, [id, course, selectedModule, selectedLesson]);

  // Update module completion based on lesson completion
  useEffect(() => {
    if (lessonCompletion.length > 0) {
      setModuleCompletion((prev) => {
        const newCompletion = [...prev];
        lessonCompletion.forEach((moduleLessons, index) => {
          newCompletion[index] = moduleLessons.every((completed) => completed);
        });
        return newCompletion;
      });
    }
  }, [lessonCompletion]);

  // Fetch quiz data
  useEffect(() => {
    const fetchQuizData = async () => {
      if (!course || !id || (!currentLesson?.isQuiz && !isFinalExam)) return;

      setQuizLoading(true);
      setQuizError('');
      setScore(null);
      setTimeLeft(300);
      setCurrentQuestionIndex(0);
      setAnswers([]);

      const defaultQuizData: QuizData = {
        title: isFinalExam ? 'Final Exam' : `Module ${selectedModule + 1} Quiz`,
        questions: [
          {
            question: isFinalExam ? 'What is the core concept of this course?' : 'What is the primary focus of this module?',
            options: ['Option A', 'Option B', 'Option C', 'Option D'],
            correctAnswer: 0,
          },
          {
            question: isFinalExam ? 'Which topic was covered across all modules?' : 'Which concept was introduced in lesson 1?',
            options: ['Concept X', 'Concept Y', 'Concept Z', 'None'],
            correctAnswer: 1,
          },
          {
            question: isFinalExam ? 'What is the main objective of the course?' : 'What is a key feature of this module?',
            options: ['Feature A', 'Feature B', 'Feature C', 'Feature D'],
            correctAnswer: 2,
          },
          {
            question: isFinalExam ? 'Which tool is used throughout the course?' : 'Which tool is used in this module?',
            options: ['Tool X', 'Tool Y', 'Tool Z', 'None'],
            correctAnswer: 0,
          },
          {
            question: isFinalExam ? 'What is the final outcome of the course?' : 'What is the final topic covered?',
            options: ['Topic A', 'Topic B', 'Topic C', 'Topic D'],
            correctAnswer: 3,
          },
        ],
      };

      try {
        const quizPath = isFinalExam ? `courses/${id}/exams/finalExam` : `courses/${id}/quizzes/${selectedModule}`;
        console.log('Fetching quiz for:', { courseId: id, path: quizPath });
        const quizRef = doc(db, quizPath);
        const quizSnap = await getDoc(quizRef);

        if (quizSnap.exists()) {
          const data = quizSnap.data() as QuizData;
          console.log('Firestore quiz data:', data);
          if (data.questions && Array.isArray(data.questions) && data.questions.length >= 5) {
            setQuizData({
              title: data.title || (isFinalExam ? 'Final Exam' : `Module ${selectedModule + 1} Quiz`),
              questions: data.questions.slice(0, 5),
            });
            setAnswers(new Array(data.questions.length).fill(null));
          } else {
            throw new Error('Quiz must have at least 5 valid questions');
          }
        } else {
          console.log('No quiz found in Firestore, using hardcoded data');
          setQuizData(defaultQuizData);
          setAnswers(new Array(defaultQuizData.questions.length).fill(null));
        }
      } catch (err) {
        console.error('Error fetching quiz:', err);
        setQuizError('Failed to load quiz content. Using default quiz.');
        setQuizData(defaultQuizData);
        setAnswers(new Array(defaultQuizData.questions.length).fill(null));
      } finally {
        setQuizLoading(false);
      }
    };

    fetchQuizData();
  }, [id, selectedModule, course, isFinalExam, currentLesson]);

  // Check if all questions are answered
  useEffect(() => {
    if (answers.length > 0) {
      const hasUnansweredQuestion = answers.some((answer) => answer === null);
      setAllQuestionsAnswered(!hasUnansweredQuestion);
    }
  }, [answers]);

  // Unified lesson completion handler
  const handleCompleteLesson = useCallback(async () => {
    if (!course || !id || !currentLesson || currentLesson.isQuiz || isFinalExam) return;

    const user = auth.currentUser;
    if (!user) {
      console.error('No authenticated user found');
      setError('Please sign in to save progress');
      return;
    }

    const lessonId = `lesson-module${selectedModule + 1}-${selectedLesson}`;
    const moduleKey = `module${selectedModule + 1}`;
    const progressDocId = `${user.uid}_${id}`;

    try {
      const progressRef = doc(db, 'userProgress', progressDocId);
      const progressSnap = await getDoc(progressRef);
      let currentProgress: UserProgress = {
        completedCourse: false,
        completedLessons: [],
        courseTitle: course.courseTitle,
        lastUpdated: Timestamp.now(),
        moduleProgress: {},
        certificateGenerated: false,
      };

      if (progressSnap.exists()) {
        const data = progressSnap.data();
        if (data && 'completedLessons' in data) {
          currentProgress = {
            completedCourse: data.completedCourse ?? false,
            completedLessons: Array.isArray(data.completedLessons) ? data.completedLessons : [],
            courseTitle: data.courseTitle ?? course.courseTitle,
            lastUpdated: data.lastUpdated instanceof Timestamp ? data.lastUpdated : Timestamp.now(),
            moduleProgress: data.moduleProgress ?? {},
            certificateGenerated: data.certificateGenerated ?? false,
          };
        }
      }

      // Update completedLessons array (avoid duplicates)
      const updatedLessons = currentProgress.completedLessons.includes(lessonId)
        ? currentProgress.completedLessons
        : [...currentProgress.completedLessons, lessonId];

      // Update moduleProgress
      const moduleProgress = currentProgress.moduleProgress || {};
      const moduleLessons = moduleProgress[moduleKey]?.completedLessons || [];
      const updatedModuleLessons = moduleLessons.includes(lessonId)
        ? moduleLessons
        : [...moduleLessons, lessonId];

      // Check if module is completed
      const isModuleCompleted = currentModule.lessons.every((_, index) =>
        updatedModuleLessons.includes(`lesson-module${selectedModule + 1}-${index}`)
      );

      const updatedProgress: UserProgress = {
        ...currentProgress,
        completedLessons: updatedLessons,
        courseTitle: course.courseTitle,
        lastUpdated: Timestamp.now(),
        moduleProgress: {
          ...moduleProgress,
          [moduleKey]: {
            completed: isModuleCompleted,
            completedLessons: updatedModuleLessons,
          },
        },
      };

      // Update local lesson completion state
      setLessonCompletion((prev) => {
        const newCompletion = [...prev];
        if (newCompletion[selectedModule]) {
          newCompletion[selectedModule][selectedLesson] = true;
        }
        return newCompletion;
      });

      await setDoc(progressRef, updatedProgress, { merge: true });
      console.log('Lesson progress updated:', updatedProgress);
    } catch (err) {
      console.error('Error updating user progress:', err);
      setError('Failed to save lesson progress. Please check Firestore permissions.');
    }
  }, [course, id, currentLesson, isFinalExam, selectedModule, selectedLesson, currentModule]);

  // Handle video completion
  const handleVideoEnd = useCallback(() => {
    if (!currentLesson || currentLesson.isQuiz || isFinalExam) return;
    handleCompleteLesson();
  }, [currentLesson, isFinalExam, handleCompleteLesson]);

  // Handle quiz submission
  const handleSubmit = useCallback(async () => {
    if (!quizData || !course || !id) {
      console.error('Missing quizData, course, or id', { quizData, course, id });
      setError('Cannot submit quiz due to missing data');
      return;
    }

    const user = auth.currentUser;
    if (!user) {
      console.error('No authenticated user found');
      setError('Please sign in to save quiz progress');
      return;
    }

    // Calculate score
    let correct = 0;
    quizData.questions.forEach((q, index) => {
      if (answers[index] === q.correctAnswer) {
        correct++;
      }
    });
    const scorePercentage = (correct / quizData.questions.length) * 100;
    setScore(scorePercentage);

    // Store results for display
    if (isFinalExam) {
      setLastFinalExamAnswers([...answers]);
      setLastFinalExamScore(scorePercentage);
      setShowFinalExamResultsOnly(true);
    } else {
      setLastQuizAnswers([...answers]);
      setLastQuizScore(scorePercentage);
      setShowQuizResultsOnly(scorePercentage >= 80);
    }

    if (scorePercentage < 80 && !isFinalExam) {
      console.log('Quiz not passed, no progress update needed', { score: scorePercentage });
      return;
    }

    // Save progress to Firestore
    const lessonId = isFinalExam
      ? `final-exam-${id}`
      : `lesson-module${selectedModule + 1}-${selectedLesson}`;
    const moduleKey = `module${selectedModule + 1}`;
    const progressDocId = `${user.uid}_${id}`;

    try {
      const progressRef = doc(db, 'userProgress', progressDocId);
      const progressSnap = await getDoc(progressRef);
      let currentProgress: UserProgress = {
        completedCourse: false,
        completedLessons: [],
        courseTitle: course.courseTitle,
        lastUpdated: Timestamp.now(),
        moduleProgress: {},
        certificateGenerated: false,
      };

      if (progressSnap.exists()) {
        const data = progressSnap.data();
        if (data && 'completedLessons' in data) {
          currentProgress = {
            completedCourse: data.completedCourse ?? false,
            completedLessons: Array.isArray(data.completedLessons) ? data.completedLessons : [],
            courseTitle: data.courseTitle ?? course.courseTitle,
            lastUpdated: data.lastUpdated instanceof Timestamp ? data.lastUpdated : Timestamp.now(),
            moduleProgress: data.moduleProgress ?? {},
            certificateGenerated: data.certificateGenerated ?? false,
          };
        }
      }

      // Update completedLessons array (avoid duplicates)
      const updatedLessons = currentProgress.completedLessons.includes(lessonId)
        ? currentProgress.completedLessons
        : [...currentProgress.completedLessons, lessonId];

      let updatedProgress: UserProgress = { ...currentProgress };

      if (!isFinalExam) {
        // Update moduleProgress for quizzes
        const moduleProgress = currentProgress.moduleProgress || {};
        const moduleLessons = moduleProgress[moduleKey]?.completedLessons || [];
        const updatedModuleLessons = moduleLessons.includes(lessonId)
          ? moduleLessons
          : [...moduleLessons, lessonId];

        // Check if module is completed
        const isModuleCompleted = currentModule.lessons.every((_, index) =>
          updatedModuleLessons.includes(`lesson-module${selectedModule + 1}-${index}`)
        );

        // Save quiz results
        const quizResults = moduleProgress[moduleKey]?.quizResults || {};
        quizResults[lessonId] = {
          score: scorePercentage,
          answers: [...answers],
        };

        updatedProgress = {
          ...currentProgress,
          completedLessons: updatedLessons,
          courseTitle: course.courseTitle,
          lastUpdated: Timestamp.now(),
          moduleProgress: {
            ...moduleProgress,
            [moduleKey]: {
              completed: isModuleCompleted,
              completedLessons: updatedModuleLessons,
              quizResults,
            },
          },
        };

        // Update local lesson completion state
        setLessonCompletion((prev) => {
          const newCompletion = [...prev];
          if (newCompletion[selectedModule]) {
            newCompletion[selectedModule][selectedLesson] = true;
          }
          return newCompletion;
        });
      } else {
        // Update progress for final exam
        updatedProgress = {
          ...currentProgress,
          completedLessons: updatedLessons,
          completedCourse: scorePercentage >= 80,
          certificateGenerated: scorePercentage >= 80,
          lastUpdated: Timestamp.now(),
          moduleProgress: {
            ...currentProgress.moduleProgress,
            finalExam: {
              completed: scorePercentage >= 80,
              completedLessons: [lessonId],
              quizResults: {
                [lessonId]: {
                  score: scorePercentage,
                  answers: [...answers],
                },
              },
            },
          },
        };

        if (scorePercentage >= 80) {
          setCertificateAvailable(true);
        }
      }

      // Log the data to be written
      console.log('Attempting to write to userProgress:', {
        progressDocId,
        lessonId,
        moduleKey,
        updatedProgress,
      });

      // Write to Firestore
      await setDoc(progressRef, updatedProgress, { merge: true });

      // Verify the write by reading back
      const verifySnap = await getDoc(progressRef);
      if (verifySnap.exists()) {
        const savedData = verifySnap.data();
        console.log('Progress successfully saved:', savedData);
        if (!savedData.completedLessons.includes(lessonId)) {
          console.warn('Lesson ID not found in saved progress:', lessonId);
        }
      } else {
        console.error('Progress document not found after write:', progressDocId);
        setError('Failed to verify progress save');
      }
    } catch (err: unknown) {
      console.error('Error updating quiz/final exam progress:', err);
      let errorMessage = 'An unknown error occurred';
      if (err instanceof Error) {
        errorMessage = err.message;
      }
      setError(`Failed to save ${isFinalExam ? 'final exam' : 'quiz'} progress: ${errorMessage}`);
    }

    console.log('Quiz/Final Exam submitted:', { score: scorePercentage, lessonId });
  }, [quizData, answers, selectedModule, selectedLesson, isFinalExam, course, id, currentModule]);

  // Quiz timer
  useEffect(() => {
    if (!quizData || (!currentLesson?.isQuiz && !isFinalExam) || score !== null || timeLeft <= 0 || showQuizResultsOnly || showFinalExamResultsOnly) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          handleSubmit();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [quizData, currentLesson, isFinalExam, score, timeLeft, handleSubmit, showQuizResultsOnly, showFinalExamResultsOnly]);

  // Debug logging
  useEffect(() => {
    if (course && currentModule) {
      console.log('Current module:', currentModule.title);
      console.log('Current lesson index:', selectedLesson);
      console.log('Total lessons:', currentModule.lessons.length);
      console.log('Is Final Exam:', isFinalExam);
      console.log('Certificate Available:', certificateAvailable);
      console.log('Show Quiz Results Only:', showQuizResultsOnly);
      console.log('Show Final Exam Results Only:', showFinalExamResultsOnly);
      console.log('Final Exam Available:', finalExamAvailable);
    }
  }, [course, selectedModule, selectedLesson, currentModule, isFinalExam, certificateAvailable, showQuizResultsOnly, showFinalExamResultsOnly, finalExamAvailable]);

  const handlePlayerError = (error: Error) => {
    console.error('ReactPlayer error:', error);
    setVideoError('Failed to load video. Please try again later.');
  };

  const formatTime = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handlePreviousQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  };

  const handleNextQuestion = () => {
    if (quizData && currentQuestionIndex < quizData.questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    }
  };

  const handleAnswer = (questionIndex: number, optionIndex: number) => {
    const newAnswers = [...answers];
    newAnswers[questionIndex] = optionIndex;
    setAnswers(newAnswers);
  };

  const handleRetry = () => {
    if (!quizData) return;
    setAnswers(new Array(quizData.questions.length).fill(null));
    setCurrentQuestionIndex(0);
    setScore(null);
    setTimeLeft(300);
    setAllQuestionsAnswered(false);
    setShowQuizResultsOnly(false);
    setShowFinalExamResultsOnly(false);
  };

  const handleQuizComplete = useCallback(async (isPassed: boolean) => {
    if (!course || !id) return;

    const user = auth.currentUser;
    if (!user) {
      console.error('No authenticated user found');
      setError('Please sign in to save progress');
      return;
    }

    try {
      const progressDocId = `${user.uid}_${id}`;
      const progressRef = doc(db, 'userProgress', progressDocId);
      const progressSnap = await getDoc(progressRef);
      let currentProgress: UserProgress = {
        completedCourse: false,
        completedLessons: [],
        courseTitle: course.courseTitle,
        lastUpdated: Timestamp.now(),
        moduleProgress: {},
        certificateGenerated: false,
      };

      if (progressSnap.exists()) {
        const data = progressSnap.data();
        if (data && 'completedLessons' in data) {
          currentProgress = {
            completedCourse: data.completedCourse ?? false,
            completedLessons: Array.isArray(data.completedLessons) ? data.completedLessons : [],
            courseTitle: data.courseTitle ?? course.courseTitle,
            lastUpdated: data.lastUpdated instanceof Timestamp ? data.lastUpdated : Timestamp.now(),
            moduleProgress: data.moduleProgress ?? {},
            certificateGenerated: data.certificateGenerated ?? false,
          };
        }
      }

      let updatedProgress: UserProgress = { ...currentProgress };

      if (isPassed && !isFinalExam && selectedModule < course.modules.length - 1) {
        setSelectedModule(selectedModule + 1);
        setSelectedLesson(0);
        setActiveDropdown(selectedModule + 1);
      } else if (isPassed && isFinalExam) {
        // Mark course and certificate as completed
        updatedProgress = {
          ...currentProgress,
          completedCourse: true,
          certificateGenerated: true,
          lastUpdated: Timestamp.now(),
        };
        await setDoc(progressRef, updatedProgress, { merge: true });
        setCertificateAvailable(true);
        console.log('Final exam and certificate progress updated:', updatedProgress);
        router.push(`/certificate/${id}`);
      } else {
        setSelectedLesson(0);
      }

      setQuizData(null);
      setQuizError('');
      setVideoError('');
      setIsFinalExam(false);
      setShowQuizResultsOnly(false);
      setShowFinalExamResultsOnly(false);
    } catch (err) {
      console.error('Error updating course completion:', err);
      setError('Failed to save course completion. Please check Firestore permissions.');
    }
  }, [isFinalExam, selectedModule, course, id, router]);

  const handleNextModule = useCallback(() => {
    if (!course || selectedModule >= course.modules.length - 1) return;
    setSelectedModule(selectedModule + 1);
    setSelectedLesson(0);
    setActiveDropdown(selectedModule + 1);
    setQuizData(null);
    setQuizError('');
    setVideoError('');
    setIsFinalExam(false);
    setShowQuizResultsOnly(false);
    setShowFinalExamResultsOnly(false);
  }, [selectedModule, course]);

  // Handle Next button for lessons and quizzes
  const handleNext = useCallback(async () => {
    if (!course || !currentLesson || !currentModule.lessons.length) {
      return;
    }

    if (!currentLesson.isQuiz) {
      // For non-quiz lessons, move to the next lesson
      if (selectedLesson < currentModule.lessons.length - 1) {
        setSelectedLesson(selectedLesson + 1);
        setVideoError('');
        setShowQuizResultsOnly(false);
      }
      return;
    }

    // For quizzes
    if (lessonCompletion[selectedModule]?.[selectedLesson]) {
      // Quiz is already completed, show results
      setShowQuizResultsOnly(true);
    } else if (quizData && allQuestionsAnswered) {
      // Quiz not completed but all questions answered, submit it
      await handleSubmit();
      if (score !== null && score >= 80) {
        setShowQuizResultsOnly(true);
      }
    } else {
      // Quiz not completed and not all questions answered, load quiz
      setQuizData(null);
      setQuizError('');
      setShowQuizResultsOnly(false);
    }
  }, [
    course,
    currentLesson,
    currentModule,
    selectedModule,
    selectedLesson,
    lessonCompletion,
    quizData,
    allQuestionsAnswered,
    handleSubmit,
    score,
  ]);

  if (loading) {
    return (
      <>
        <Header />
        <div
          className="container d-flex justify-content-center align-items-center"
          style={{ minHeight: '70vh', paddingTop: '90px' }}
        >
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  if (error || !course || !course.modules || course.modules.length === 0) {
    return (
      <>
        <Header />
        <div
          className="container text-center"
          style={{ minHeight: '70vh', paddingTop: '90px' }}
        >
          <div className="alert alert-danger mt-5" role="alert">
            {error || 'No course content available'}
          </div>
          <Link
            href="/coursedetail"
            className="btn p-0 border-0 bg-transparent shadow-none text-decoration-none"
            style={{
              fontFamily: '"Livvic", sans-serif',
              fontSize: 20,
              color: '#6c757d',
              transition: 'color 0.15s ease-in-out',
            }}
          >
            <span className="d-flex align-items-center" style={{ fontSize: 20 }}>
              <i className="bi bi-arrow-left me-3" style={{ fontSize: 20, marginRight: 10 }}></i>
              Courses Details
            </span>
          </Link>
        </div>
        <Footer />
      </>
    );
  }

  const videoUrl = currentLesson && !currentLesson.isQuiz ? getDirectVideoUrl(currentLesson.videoUrl) : '';

  return (
    <>
      <Head>
        <title>{`DG Next - Learn - ${course.courseTitle}`}</title>
        <meta name="description" content={`Learn ${course.courseTitle}`} />
        <link rel="icon" href="/dglogo.ico" />
      </Head>

      <Header />

      <div
        className="container"
        style={{ paddingTop: '90px', paddingBottom: '50px', minHeight: '70vh' }}
      >
        <div className="row mb-4">
          <div className="col-12">
            <Link
              href={`/course/${course.id}`}
              className="btn p-0 border-0 bg-transparent shadow-none text-decoration-none"
              style={{
                fontFamily: '"Livvic", sans-serif',
                fontSize: 20,
                color: '#6c757d',
                transition: 'color 0.15s ease-in-out',
              }}
            >
              <span className="d-flex align-items-center" style={{ fontSize: 20 }}>
                <i className="bi bi-arrow-left me-3" style={{ fontSize: 20, marginRight: 10 }}></i>
                Courses Details
              </span>
            </Link>
          </div>
        </div>

        <div className="row">
          <div className="col-lg-4" style={{ width: '30%' }}>
            <div
              className="card shadow-sm"
              style={{ borderRadius: '15px', position: 'sticky', top: '100px' }}
            >
              <div
                className="card-header"
                style={{ backgroundColor: '#fff', borderBottom: '1px solid #dee2e6' }}
              >
                <p
                  className="mt-2 mb-0"
                  style={{
                    fontFamily: "'Acme', sans-serif",
                    color: '#666',
                    fontSize: 20,
                    fontWeight: 400,
                  }}
                >
                  📓 {course.courseTitle}
                </p>
              </div>
              <div className="card-body p-3">
                {course.modules.map((module, moduleIndex) => (
                  <div key={moduleIndex} className="mb-3">
                    <button
                      className={`btn btn-link text-start w-100 text-decoration-none ${selectedModule === moduleIndex && !isFinalExam ? 'text-primary fw-bold' : 'text-dark'
                        }`}
                      onClick={() => {
                        setActiveDropdown(activeDropdown === moduleIndex ? null : moduleIndex);
                        setSelectedModule(moduleIndex);
                        setSelectedLesson(0);
                        setVideoError('');
                        setQuizData(null);
                        setQuizError('');
                        setIsFinalExam(false);
                        setShowQuizResultsOnly(false);
                        setShowFinalExamResultsOnly(false);
                      }}
                      style={{
                        fontFamily: "'Livvic', sans-serif",
                        padding: '5px 0',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        width: '100%',
                      }}
                    >
                      <span
                        style={{
                          display: 'flex',
                          alignItems: 'flex-start',
                          flex: 1,
                          overflow: 'hidden',
                        }}
                      >
                        <i
                          className={`bi ${activeDropdown === moduleIndex ? 'bi-chevron-down' : 'bi-chevron-right'} me-2`}
                          style={{ flexShrink: 0, marginTop: '2px' }}
                        ></i>
                        <span
                          style={{
                            display: '-webkit-box',
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: 'vertical',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            lineHeight: '1.2em',
                            maxHeight: '2.4em', // Ensures two lines
                            flex: 1,
                          }}
                        >
                          {module.title}
                        </span>
                      </span>
                      <i
                        className={`bi ${moduleCompletion[moduleIndex] ? 'bi-check-circle text-success' : 'bi-circle text-muted'}`}
                        style={{ fontSize: '16px', flexShrink: 0 }}
                      ></i>
                    </button>
                    {activeDropdown === moduleIndex && (
                      <ul className="list-unstyled ms-4 mt-0">
                        {module.lessons.map((lesson, lessonIndex) => (
                          <li key={lessonIndex}>
                            <button
                              className={`btn btn-link text-start w-100 text-decoration-none ${selectedModule === moduleIndex && selectedLesson === lessonIndex && !isFinalExam
                                  ? 'text-primary fw-bold'
                                  : 'text-dark'
                                }`}
                              onClick={() => {
                                setSelectedModule(moduleIndex);
                                setSelectedLesson(lessonIndex);
                                setVideoError('');
                                setIsFinalExam(false);
                                if (lesson.isQuiz) {
                                  const isCompleted = lessonCompletion[moduleIndex]?.[lessonIndex] || false;
                                  setShowQuizResultsOnly(isCompleted);
                                  if (!isCompleted) {
                                    setQuizData(null);
                                    setQuizError('');
                                  }
                                } else {
                                  setQuizData(null);
                                  setQuizError('');
                                  setShowQuizResultsOnly(false);
                                }
                                setShowFinalExamResultsOnly(false);
                                console.log('Quiz selected from dropdown:', {
                                  module: moduleIndex,
                                  lesson: lessonIndex,
                                  isQuiz: lesson.isQuiz,
                                  showQuizResultsOnly: lessonCompletion[moduleIndex]?.[lessonIndex] || false,
                                });
                              }}
                              style={{
                                fontFamily: "'Livvic', sans-serif",
                                padding: '5px 0',
                                display: 'flex',
                                alignItems: 'flex-start',
                                justifyContent: 'space-between',
                                overflow: 'visible',
                                whiteSpace: 'normal',
                                lineHeight: '1.2em',
                              }}
                              title={lesson.title}
                            >
                              <span style={{ flex: 1, display: 'flex', alignItems: 'flex-start' }}>
                                <i
                                  className={`bi ${lesson.isQuiz ? 'bi-pen' : 'bi-play-circle'} me-2`}
                                  style={{ flexShrink: 0, marginTop: '2px' }}
                                ></i>
                                <span>{lesson.title}</span>
                              </span>
                              <i
                                className={`bi ${lessonCompletion[moduleIndex]?.[lessonIndex] ? 'bi-check-circle text-success' : 'bi-circle text-muted'
                                  }`}
                                style={{ fontSize: '16px' }}
                              ></i>
                            </button>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                ))}
                <div className="mt-3 border-top pt-3">
                  <button
                    className={`btn btn-link text-start w-100 text-decoration-none ${isFinalExam ? 'text-primary fw-bold' : finalExamAvailable ? 'text-dark' : 'text-muted'
                      }`}
                    onClick={() => {
                      if (finalExamAvailable) {
                        setIsFinalExam(true);
                        setSelectedModule(0);
                        setSelectedLesson(0);
                        setActiveDropdown(null);
                        setVideoError('');
                        setQuizData(null);
                        setQuizError('');
                        setShowQuizResultsOnly(false);
                        setShowFinalExamResultsOnly(certificateAvailable);
                      }
                    }}
                    disabled={!finalExamAvailable}
                    style={{
                      fontFamily: "'Livvic', sans-serif",
                      padding: '5px 0',
                      display: 'flex',
                      alignItems: 'flex-start',
                      justifyContent: 'space-between',
                      overflow: 'visible',
                      whiteSpace: 'normal',
                      lineHeight: '1.2em',
                      cursor: finalExamAvailable ? 'pointer' : 'not-allowed',
                    }}
                    title={finalExamAvailable ? 'Final Exam' : 'Complete all modules to unlock the Final Exam'}
                  >
                    <span style={{ flex: 1, display: 'flex', alignItems: 'flex-start' }}>
                      <i className="bi bi-clipboard-check me-2" style={{ flexShrink: 0, marginTop: '2px' }}></i>
                      <span>Final Exam</span>
                    </span>
                    <i
                      className={`bi ${certificateAvailable ? 'bi-check-circle text-success' : 'bi-circle text-muted'}`}
                      style={{ fontSize: '16px' }}
                    ></i>
                  </button>
                </div>
                {certificateAvailable && (
                  <div className="mt-3 border-top pt-3">
                    <button
                      className="btn btn-link text-start w-100 text-decoration-none text-dark"
                      onClick={() => {
                        router.push(`/certificate/${id}`);
                        setIsFinalExam(false);
                        setSelectedModule(0);
                        setSelectedLesson(0);
                        setVideoError('');
                        setQuizData(null);
                        setQuizError('');
                        setShowQuizResultsOnly(false);
                        setShowFinalExamResultsOnly(false);
                      }}
                      style={{
                        fontFamily: "'Livvic', sans-serif",
                        padding: '5px 0',
                        display: 'flex',
                        alignItems: 'flex-start',
                        justifyContent: 'space-between',
                        overflow: 'visible',
                        whiteSpace: 'normal',
                        lineHeight: '1.2em',
                      }}
                      title="You have certificate"
                    >
                      <span style={{ flex: 1, display: 'flex', alignItems: 'flex-start' }}>
                        <i className="bi bi-award me-2" style={{ flexShrink: 0, marginTop: '2px' }}></i>
                        <span>You have certificate</span>
                      </span>
                      <i
                        className="bi bi-check-circle text-success"
                        style={{ fontSize: '16px' }}
                      ></i>
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="col-lg-8" style={{ width: '70%' }}>
            <div className="card shadow-sm" style={{ borderRadius: '15px' }}>
              <div
                className="card-header d-flex justify-content-between align-items-center"
                style={{ backgroundColor: '#2c3e50', borderBottom: '1px solid #dee2e6' }}
              >
                <h4
                  style={{
                    fontFamily: "'Acme', sans-serif",
                    color: '#fff',
                    paddingTop: 10,
                  }}
                >
                  {isFinalExam ? 'Final Exam' : currentModule.title}
                </h4>
                {(currentLesson?.isQuiz || isFinalExam) && score === null && !showQuizResultsOnly && !showFinalExamResultsOnly && (
                  <div
                    style={{
                      fontFamily: "'Livvic', sans-serif",
                      color: '#fff',
                      fontSize: 18,
                    }}
                  >
                    Time Left: {formatTime(timeLeft)}
                  </div>
                )}
              </div>
              <div className="card-body">
                {currentLesson && !isFinalExam ? (
                  <>
                    <h3
                      className="m-0"
                      style={{
                        fontFamily: "'Livvic', sans-serif",
                        color: '#2c3e50',
                        fontSize: 20,
                      }}
                    >
                      {currentLesson.isQuiz ? '📝' : '📜'} {currentLesson.title}
                    </h3>
                    {currentLesson.isQuiz ? (
                      quizLoading ? (
                        <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '300px' }}>
                          <div className="spinner-border text-primary" role="status">
                            <span className="visually-hidden">Loading...</span>
                          </div>
                        </div>
                      ) : quizError || !quizData ? (
                        <div className="text-center mt-3">
                          <div className="alert alert-danger" role="alert">
                            {quizError || 'No quiz available'}
                          </div>
                        </div>
                      ) : (
                        <>
                          {(score === null && !showQuizResultsOnly) || (showQuizResultsOnly && lastQuizScore === null) ? (
                            <>
                              <div className="progress mb-4" style={{ height: '8px' }}>
                                <div
                                  className="progress-bar"
                                  role="progressbar"
                                  style={{
                                    width: `${((currentQuestionIndex + 1) / quizData.questions.length) * 100}%`,
                                    backgroundColor: '#2c3e50',
                                  }}
                                  aria-valuenow={currentQuestionIndex + 1}
                                  aria-valuemin={0}
                                  aria-valuemax={quizData.questions.length}
                                ></div>
                              </div>
                              <div className="d-flex justify-content-between mb-3">
                                <div
                                  style={{
                                    fontFamily: "'Livvic', sans-serif",
                                    color: '#6c757d',
                                    fontSize: 16,
                                  }}
                                >
                                  Question {currentQuestionIndex + 1} of {quizData.questions.length}
                                </div>
                                <div
                                  style={{
                                    fontFamily: "'Livvic', sans-serif",
                                    color: answers[currentQuestionIndex] !== null ? '#28a745' : '#dc3545',
                                    fontSize: 16,
                                  }}
                                >
                                  {answers[currentQuestionIndex] !== null ? 'Answered' : 'Not answered'}
                                </div>
                              </div>
                              <div className="mb-4">
                                <h5
                                  style={{
                                    fontFamily: "'Livvic', sans-serif",
                                    color: "#2c3e50",
                                    marginBottom: '20px',
                                  }}
                                >
                                  {currentQuestionIndex + 1}. {quizData.questions[currentQuestionIndex].question}
                                </h5>
                                {quizData.questions[currentQuestionIndex].options.map((option, oIndex) => (
                                  <div key={oIndex} className="form-check mb-3">
                                    <input
                                      className="form-check-input"
                                      type="radio"
                                      name={`question-${currentQuestionIndex}`}
                                      id={`q${currentQuestionIndex}-o${oIndex}`}
                                      checked={answers[currentQuestionIndex] === oIndex}
                                      onChange={() => handleAnswer(currentQuestionIndex, oIndex)}
                                      disabled={timeLeft <= 0}
                                    />
                                    <label
                                      className="form-check-label"
                                      htmlFor={`q${currentQuestionIndex}-o${oIndex}`}
                                      style={{
                                        fontFamily: "'Livvic', sans-serif",
                                        padding: '8px 12px',
                                        cursor: 'pointer',
                                        borderRadius: '4px',
                                        transition: 'background-color 0.15s ease-in-out',
                                        width: '100%',
                                        display: 'block',
                                      }}
                                      onMouseOver={(e) => (e.currentTarget.style.backgroundColor = '#f8f9fa')}
                                      onMouseOut={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                                    >
                                      {option}
                                    </label>
                                  </div>
                                ))}
                              </div>
                              <div className="d-flex justify-content-between mt-4">
                                <button
                                  className="btn btn-outline-secondary"
                                  style={{
                                    fontFamily: "'Livvic', sans-serif",
                                    fontSize: '16px',
                                    letterSpacing: '1px',
                                    minWidth: '100px',
                                  }}
                                  onClick={handlePreviousQuestion}
                                  disabled={currentQuestionIndex === 0}
                                >
                                  <i className="bi bi-arrow-left me-2"></i> Previous
                                </button>
                                {currentQuestionIndex < quizData.questions.length - 1 ? (
                                  <button
                                    className="btn btn-primary"
                                    style={{
                                      fontFamily: "'Livvic', sans-serif",
                                      fontSize: '16px',
                                      letterSpacing: '1px',
                                      minWidth: '100px',
                                      backgroundColor: '#2c3e50',
                                      borderColor: '#2c3e50',
                                    }}
                                    onClick={handleNextQuestion}
                                  >
                                    Next <i className="bi bi-arrow-right ms-2"></i>
                                  </button>
                                ) : (
                                  <button
                                    className="btn btn-primary"
                                    style={{
                                      fontFamily: "'Livvic', sans-serif",
                                      fontSize: '16px',
                                      letterSpacing: '1px',
                                      minWidth: '100px',
                                    }}
                                    onClick={handleSubmit}
                                    disabled={timeLeft <= 0 || !allQuestionsAnswered}
                                  >
                                    Submit Quiz
                                  </button>
                                )}
                              </div>
                              <div className="d-flex justify-content-center mt-4">
                                {quizData.questions.map((_, index) => (
                                  <div
                                    key={index}
                                    style={{
                                      width: '12px',
                                      height: '12px',
                                      borderRadius: '50%',
                                      backgroundColor: answers[index] !== null ? '#28a745' :
                                        (index === currentQuestionIndex ? '#2c3e50' : '#dee2e6'),
                                      margin: '0 5px',
                                      cursor: 'pointer',
                                      transition: 'background-color 0.15s ease-in-out',
                                    }}
                                    onClick={() => setCurrentQuestionIndex(index)}
                                  ></div>
                                ))}
                              </div>
                              {allQuestionsAnswered && currentQuestionIndex !== quizData.questions.length - 1 && (
                                <div className="text-center mt-4">
                                  <button
                                    className="btn btn-primary"
                                    style={{
                                      fontFamily: "'Livvic', sans-serif",
                                      fontSize: '16px',
                                      letterSpacing: '1px',
                                    }}
                                    onClick={handleSubmit}
                                    disabled={timeLeft <= 0}
                                  >
                                    Submit Quiz
                                  </button>
                                </div>
                              )}
                              {timeLeft <= 0 && (
                                <p
                                  className="text-danger mt-3 text-center"
                                  style={{ fontFamily: "'Livvic', sans-serif" }}
                                >
                                  {`Time's up! Your quiz has been submitted.`}
                                </p>
                              )}
                              {!allQuestionsAnswered && currentQuestionIndex === quizData.questions.length - 1 && (
                                <p
                                  className="text-warning mt-3 text-center"
                                  style={{ fontFamily: "'Livvic', sans-serif" }}
                                >
                                  Please answer all questions before submitting.
                                </p>
                              )}
                            </>
                          ) : (
                            <div className="text-center">
                              <h3
                                style={{
                                  fontFamily: "'Acme', sans-serif",
                                  color: (showQuizResultsOnly ? (lastQuizScore! >= 80) : (score! >= 80)) ? '#28a745' : '#dc3545',
                                }}
                              >
                                {(showQuizResultsOnly ? (lastQuizScore! >= 80) : (score! >= 80)) ? 'Congratulations!' : 'Try Again'}
                              </h3>
                              <p
                                style={{
                                  fontFamily: "'Livvic', sans-serif",
                                  fontSize: 18,
                                }}
                              >
                                Your Score: {(showQuizResultsOnly ? lastQuizScore : score)!.toFixed(2)}% {(showQuizResultsOnly ? (lastQuizScore! >= 80) : (score! >= 80)) ? '(Passed)' : '(Failed)'}
                              </p>
                              <div className="mt-4 mb-4">
                                <div className="row">
                                  <div className="col-md-8 mx-auto">
                                    <div className="card">
                                      <div className="card-header bg-light">
                                        <h5 style={{ fontFamily: "'Livvic', sans-serif", margin: 0 }}>
                                          Quiz Results
                                        </h5>
                                      </div>
                                      <div className="card-body">
                                        {quizData.questions.map((question, qIndex) => (
                                          <div key={qIndex} className="mb-3">
                                            <div className="d-flex align-items-center">
                                              <span
                                                className={`badge ${(showQuizResultsOnly ? lastQuizAnswers[qIndex] : answers[qIndex]) === question.correctAnswer ? 'bg-success' : 'bg-danger'} me-2`}
                                              >
                                                {(showQuizResultsOnly ? lastQuizAnswers[qIndex] : answers[qIndex]) === question.correctAnswer ? (
                                                  <i className="bi bi-check"></i>
                                                ) : (
                                                  <i className="bi bi-x"></i>
                                                )}
                                              </span>
                                              <span style={{ fontFamily: "'Livvic', sans-serif" }}>
                                                Question {qIndex + 1}: {question.question}
                                              </span>
                                            </div>
                                          </div>
                                        ))}
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              </div>
                              {!showQuizResultsOnly && (score! >= 80) && lessonCompletion[selectedModule]?.[selectedLesson] ? (
                                selectedModule < course.modules.length - 1 ? (
                                  <button
                                    className="btn btn-primary"
                                    style={{
                                      fontFamily: "'Livvic', sans-serif",
                                      fontSize: '16px',
                                      letterSpacing: '1px',
                                      backgroundColor: '#F47834',
                                      borderColor: '#F47834',
                                    }}
                                    onClick={handleNextModule}
                                  >
                                    Next Module <i className="bi bi-arrow-right ms-2"></i>
                                  </button>
                                ) : certificateAvailable ? (
                                  <button
                                    className="btn btn-primary"
                                    style={{
                                      fontFamily: "'Livvic', sans-serif",
                                      fontSize: '16px',
                                      letterSpacing: '1px',
                                      backgroundColor: '#28a745',
                                      borderColor: '#28a745',
                                    }}
                                    onClick={() => router.push(`/certificate/${id}`)}
                                  >
                                    View Certificate <i className="bi bi-arrow-right ms-2"></i>
                                  </button>
                                ) : (
                                  <button
                                    className="btn btn-primary"
                                    style={{
                                      fontFamily: "'Livvic', sans-serif",
                                      fontSize: '16px',
                                      letterSpacing: '1px',
                                    }}
                                    onClick={() => setShowQuizResultsOnly(true)}
                                  >
                                    View Quiz Results
                                  </button>
                                )
                              ) : (
                                <button
                                  className="btn btn-primary"
                                  style={{
                                    fontFamily: "'Livvic', sans-serif",
                                    fontSize: '16px',
                                    letterSpacing: '1px',
                                  }}
                                  onClick={() => {
                                    handleRetry();
                                    handleQuizComplete(false);
                                  }}
                                >
                                  Retry Quiz
                                </button>
                              )}
                            </div>
                          )}
                        </>
                      )
                    ) : videoUrl ? (
                      <div className="mt-3">
                        <ReactPlayer
                          url={videoUrl}
                          controls
                          width="100%"
                          height="480px"
                          onError={handlePlayerError}
                          onEnded={handleVideoEnd}
                          config={{
                            file: {
                              attributes: {
                                controlsList: 'nodownload',
                                disablePictureInPicture: true,
                              },
                            },
                          }}
                        />
                        {videoError && (
                          <div className="alert alert-danger mt-2">
                            {videoError}
                          </div>
                        )}
                      </div>
                    ) : (
                      <p className="text-danger mt-3">
                        No video available for this lesson
                      </p>
                    )}
                    {!currentLesson.isQuiz && (
                      <>
                        <hr />
                        <div style={{ fontFamily: "'Livvic', sans-serif" }}>
                          <p>Lesson content for {currentLesson.title} goes here.</p>
                          <p>
                            You can add more text, quizzes, etc., based on your course
                            structure.
                          </p>
                          <p>Duration: {currentLesson.duration || 'Not specified'}</p>
                        </div>
                      </>
                    )}
                  </>
                ) : isFinalExam ? (
                  quizLoading ? (
                    <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '300px' }}>
                      <div className="spinner-border text-primary" role="status">
                        <span className="visually-hidden">Loading...</span>
                      </div>
                    </div>
                  ) : quizError || !quizData ? (
                    <div className="text-center mt-3">
                      <div className="alert alert-danger" role="alert">
                        {quizError || 'No final exam available'}
                      </div>
                    </div>
                  ) : (
                    <>
                      <h3
                        className="m-0"
                        style={{
                          fontFamily: "'Livvic', sans-serif",
                          color: '#2c3e50',
                          fontSize: 20,
                        }}
                      >
                        📝 Final Exam
                      </h3>
                      {(score === null && !showFinalExamResultsOnly) || (showFinalExamResultsOnly && lastFinalExamScore === null) ? (
                        <>
                          <div className="progress mb-4" style={{ height: '8px' }}>
                            <div
                              className="progress-bar"
                              role="progressbar"
                              style={{
                                width: `${((currentQuestionIndex + 1) / quizData.questions.length) * 100}%`,
                                backgroundColor: '#2c3e50',
                              }}
                              aria-valuenow={currentQuestionIndex + 1}
                              aria-valuemin={0}
                              aria-valuemax={quizData.questions.length}
                            ></div>
                          </div>
                          <div className="d-flex justify-content-between mb-3">
                            <div
                              style={{
                                fontFamily: "'Livvic', sans-serif",
                                color: '#6c757d',
                                fontSize: 16,
                              }}
                            >
                              Question {currentQuestionIndex + 1} of {quizData.questions.length}
                            </div>
                            <div
                              style={{
                                fontFamily: "'Livvic', sans-serif",
                                color: answers[currentQuestionIndex] !== null ? '#28a745' : '#dc3545',
                                fontSize: 16,
                              }}
                            >
                              {answers[currentQuestionIndex] !== null ? 'Answered' : 'Not answered'}
                            </div>
                          </div>
                          <div className="mb-4">
                            <h5
                              style={{
                                fontFamily: "'Livvic', sans-serif",
                                color: '#2c3e50',
                                marginBottom: '20px',
                              }}
                            >
                              {currentQuestionIndex + 1}. {quizData.questions[currentQuestionIndex].question}
                            </h5>
                            {quizData.questions[currentQuestionIndex].options.map((option, oIndex) => (
                              <div key={oIndex} className="form-check mb-3">
                                <input
                                  className="form-check-input"
                                  type="radio"
                                  name={`question-${currentQuestionIndex}`}
                                  id={`q${currentQuestionIndex}-o${oIndex}`}
                                  checked={answers[currentQuestionIndex] === oIndex}
                                  onChange={() => handleAnswer(currentQuestionIndex, oIndex)}
                                  disabled={timeLeft <= 0}
                                />
                                <label
                                  className="form-check-label"
                                  htmlFor={`q${currentQuestionIndex}-o${oIndex}`}
                                  style={{
                                    fontFamily: "'Livvic', sans-serif",
                                    padding: '8px 12px',
                                    cursor: 'pointer',
                                    borderRadius: '4px',
                                    transition: 'background-color 0.15s ease-in-out',
                                    width: '100%',
                                    display: 'block',
                                  }}
                                  onMouseOver={(e) => (e.currentTarget.style.backgroundColor = '#f8f9fa')}
                                  onMouseOut={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                                >
                                  {option}
                                </label>
                              </div>
                            ))}
                          </div>
                          <div className="d-flex justify-content-between mt-4">
                            <button
                              className="btn btn-outline-secondary"
                              style={{
                                fontFamily: "'Livvic', sans-serif",
                                fontSize: '16px',
                                letterSpacing: '1px',
                                minWidth: '100px',
                              }}
                              onClick={handlePreviousQuestion}
                              disabled={currentQuestionIndex === 0}
                            >
                              <i className="bi bi-arrow-left me-2"></i> Previous
                            </button>
                            {currentQuestionIndex < quizData.questions.length - 1 ? (
                              <button
                                className="btn btn-primary"
                                style={{
                                  fontFamily: "'Livvic', sans-serif",
                                  fontSize: '16px',
                                  letterSpacing: '1px',
                                  minWidth: '100px',
                                  backgroundColor: '#2c3e50',
                                  borderColor: '#2c3e50',
                                }}
                                onClick={handleNextQuestion}
                              >
                                Next <i className="bi bi-arrow-right ms-2"></i>
                              </button>
                            ) : (
                              <button
                                className="btn btn-primary"
                                style={{
                                  fontFamily: "'Livvic', sans-serif",
                                  fontSize: '16px',
                                  letterSpacing: '1px',
                                  minWidth: '100px',
                                }}
                                onClick={handleSubmit}
                                disabled={timeLeft <= 0 || !allQuestionsAnswered}
                              >
                                Submit Final Exam
                              </button>
                            )}
                          </div>
                          <div className="d-flex justify-content-center mt-4">
                            {quizData.questions.map((_, index) => (
                              <div
                                key={index}
                                style={{
                                  width: '12px',
                                  height: '12px',
                                  borderRadius: '50%',
                                  backgroundColor: answers[index] !== null ? '#28a745' :
                                    (index === currentQuestionIndex ? '#2c3e50' : '#dee2e6'),
                                  margin: '0 5px',
                                  cursor: 'pointer',
                                  transition: 'background-color 0.15s ease-in-out',
                                }}
                                onClick={() => setCurrentQuestionIndex(index)}
                              ></div>
                            ))}
                          </div>
                          {allQuestionsAnswered && currentQuestionIndex !== quizData.questions.length - 1 && (
                            <div className="text-center mt-4">
                              <button
                                className="btn btn-primary"
                                style={{
                                  fontFamily: "'Livvic', sans-serif",
                                  fontSize: '16px',
                                  letterSpacing: '1px',
                                }}
                                onClick={handleSubmit}
                                disabled={timeLeft <= 0}
                              >
                                Submit Final Exam
                              </button>
                            </div>
                          )}
                          {timeLeft <= 0 && (
                            <p
                              className="text-danger mt-3 text-center"
                              style={{ fontFamily: "'Livvic', sans-serif" }}
                            >
                              {`Time's up! Your final exam has been submitted.`}
                            </p>
                          )}
                          {!allQuestionsAnswered && currentQuestionIndex === quizData.questions.length - 1 && (
                            <p
                              className="text-warning mt-3 text-center"
                              style={{ fontFamily: "'Livvic', sans-serif" }}
                            >
                              Please answer all questions before submitting.
                            </p>
                          )}
                        </>
                      ) : (
                        <div className="text-center">
                          <h3
                            style={{
                              fontFamily: "'Acme', sans-serif",
                              color: (showFinalExamResultsOnly ? (lastFinalExamScore! >= 80) : (score! >= 80)) ? '#28a745' : '#dc3545',
                            }}
                          >
                            {(showFinalExamResultsOnly ? (lastFinalExamScore! >= 80) : (score! >= 80)) ? 'Congratulations!' : 'Try Again'}
                          </h3>
                          <p
                            style={{
                              fontFamily: "'Livvic', sans-serif",
                              fontSize: 18,
                            }}
                          >
                            Your Score: {(showFinalExamResultsOnly ? lastFinalExamScore : score)!.toFixed(2)}% {(showFinalExamResultsOnly ? (lastFinalExamScore! >= 80) : (score! >= 80)) ? '(Passed)' : '(Failed)'}
                          </p>
                          <div className="mt-4 mb-4">
                            <div className="row">
                              <div className="col-md-8 mx-auto">
                                <div className="card">
                                  <div className="card-header bg-light">
                                    <h5 style={{ fontFamily: "'Livvic', sans-serif", margin: 0 }}>
                                      Final Exam Results
                                    </h5>
                                  </div>
                                  <div className="card-body">
                                    {quizData.questions.map((question, qIndex) => (
                                      <div key={qIndex} className="mb-3">
                                        <div className="d-flex align-items-center">
                                          <span
                                            className={`badge ${(showFinalExamResultsOnly ? lastFinalExamAnswers[qIndex] : answers[qIndex]) === question.correctAnswer ? 'bg-success' : 'bg-danger'} me-2`}
                                          >
                                            {(showFinalExamResultsOnly ? lastFinalExamAnswers[qIndex] : answers[qIndex]) === question.correctAnswer ? (
                                              <i className="bi bi-check"></i>
                                            ) : (
                                              <i className="bi bi-x"></i>
                                            )}
                                          </span>
                                          <span style={{ fontFamily: "'Livvic', sans-serif" }}>
                                            Question {qIndex + 1}: {question.question}
                                          </span>
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                          {!showFinalExamResultsOnly && (score! >= 80) ? (
                            <button
                              className="btn btn-primary"
                              style={{
                                fontFamily: "'Livvic', sans-serif",
                                fontSize: '16px',
                                letterSpacing: '1px',
                                backgroundColor: '#28a745',
                                borderColor: '#28a745',
                              }}
                              onClick={() => handleQuizComplete(true)}
                            >
                              Continue <i className="bi bi-arrow-right ms-2"></i>
                            </button>
                          ) : !showFinalExamResultsOnly && (
                            <button
                              className="btn btn-primary"
                              style={{
                                fontFamily: "'Livvic', sans-serif",
                                fontSize: '16px',
                                letterSpacing: '1px',
                              }}
                              onClick={() => {
                                handleRetry();
                                handleQuizComplete(false);
                              }}
                            >
                              Retry Final Exam
                            </button>
                          )}
                        </div>
                      )}
                    </>
                  )
                ) : (
                  <p
                    style={{
                      fontFamily: "'Livvic', sans-serif",
                      color: '#2c3e50',
                    }}
                  >
                    No lessons available for this module.
                  </p>
                )}
              </div>
            </div>

            {currentLesson && !isFinalExam && currentModule.lessons.length > 0 && (
              <div className="mt-4">
                <div className="progress" style={{ height: '20px', borderRadius: '5px' }}>
                  <div
                    className="progress-bar bg-success"
                    role="progressbar"
                    style={{
                      width: `${((selectedLesson + 1) / currentModule.lessons.length) * 100}%`,
                    }}
                    aria-valuenow={((selectedLesson + 1) / currentModule.lessons.length) * 100}
                    aria-valuemin={0}
                    aria-valuemax={100}
                  >
                    {Math.round(((selectedLesson + 1) / currentModule.lessons.length) * 100)}%
                  </div>
                </div>
                <p
                  className="text-muted mt-2 text-center"
                  style={{ fontFamily: "'Livvic', sans-serif" }}
                >
                  Progress: Lesson {selectedLesson + 1} of {currentModule.lessons.length}
                </p>
                <div className="d-flex justify-content-between gap-3 mt-3">
                  {selectedLesson > 0 && (
                    <button
                      className="btn search-btn"
                      style={{
                        fontFamily: "'Livvic', sans-serif",
                        fontSize: '16px',
                        letterSpacing: '1px',
                        minWidth: '120px',
                      }}
                      onClick={() => {
                        setSelectedLesson(selectedLesson - 1);
                        setVideoError('');
                        setShowQuizResultsOnly(false);
                      }}
                    >
                      Previous
                    </button>
                  )}
                  {!currentLesson.isQuiz && (
                    <button
                      className="btn search-btn"
                      style={{
                        fontFamily: "'Livvic', sans-serif",
                        fontSize: '16px',
                        letterSpacing: '1px',
                        backgroundColor: '#28a745',
                        border: '1px solid #28a745',
                        minWidth: '120px',
                      }}
                      onClick={handleCompleteLesson}
                      disabled={lessonCompletion[selectedModule]?.[selectedLesson]}
                    >
                      Complete Lesson
                    </button>
                  )}
                  {selectedLesson < currentModule.lessons.length - 1 && (
                    <button
                      className="btn search-btn"
                      style={{
                        fontFamily: "'Livvic', sans-serif",
                        fontSize: '16px',
                        letterSpacing: '1px',
                        backgroundColor: '#F47834',
                        border: '1px solid #F47834',
                        minWidth: '120px',
                      }}
                      onClick={handleNext}
                    >
                      Next
                    </button>
                  )}
                  {selectedLesson === currentModule.lessons.length - 1 && lessonCompletion[selectedModule]?.[selectedLesson] && (
                    <button
                      className="btn search-btn"
                      style={{
                        fontFamily: "'Livvic', sans-serif",
                        fontSize: '16px',
                        letterSpacing: '1px',
                        minWidth: '120px',
                      }}
                      onClick={handleNext}
                    >
                      View Quiz Results
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <Footer />
    </>
  );
};

export default Learn;