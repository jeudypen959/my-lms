import { useState, useEffect, useCallback } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import Link from 'next/link';
import Header from '@/components/Header/Header';
import Footer from '@/components/Footer/Footer';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/config/firebaseConfig';
import 'bootstrap/dist/css/bootstrap.min.css';

interface QuizQuestion {
  question: string;
  options: string[];
  correctAnswer: number; // Index of the correct option
}

interface QuizData {
  title: string;
  questions: QuizQuestion[];
}

const Quiz: React.FC = () => {
  const router = useRouter();
  const { courseId, moduleIndex } = router.query;
  const [quizData, setQuizData] = useState<QuizData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [answers, setAnswers] = useState<(number | null)[]>([]);
  const [score, setScore] = useState<number | null>(null);
  const [passed, setPassed] = useState(false);
  const [timeLeft, setTimeLeft] = useState(300); // 5 minutes in seconds
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [allQuestionsAnswered, setAllQuestionsAnswered] = useState(false);

  // Log query parameters for debugging
  useEffect(() => {
    console.log('Quiz query params:', { courseId, moduleIndex });
    if (!courseId || !moduleIndex) {
      setError('Missing courseId or moduleIndex in URL');
      setLoading(false);
    }
  }, [courseId, moduleIndex]);

  // Fetch quiz data
  useEffect(() => {
    const fetchQuizData = async () => {
      if (!courseId || !moduleIndex) return;

      setLoading(true);
      try {
        console.log('Fetching quiz for:', { courseId, moduleIndex });
        
        // Fix: Use proper collection/document path for Firestore
        const quizRef = doc(db, `courses/${courseId}/quizzes`, moduleIndex as string);
        const quizSnap = await getDoc(quizRef);

        if (quizSnap.exists()) {
          const data = quizSnap.data() as QuizData;
          console.log('Firestore quiz data:', data);
          // Ensure exactly 5 questions
          if (data.questions && data.questions.length >= 5) {
            setQuizData({
              title: data.title || `Module ${parseInt(moduleIndex as string) + 1} Quiz`,
              questions: data.questions.slice(0, 5),
            });
            // Initialize answers array with null values for each question
            setAnswers(new Array(data.questions.length).fill(null));
          } else {
            throw new Error('Quiz must have at least 5 questions');
          }
        } else {
          console.log('No quiz found in Firestore, using hardcoded data');
          // Fallback: Hardcoded quiz data with 5 questions
          const defaultQuizData = {
            title: `Module ${parseInt(moduleIndex as string) + 1} Quiz`,
            questions: [
              {
                question: 'What is the primary focus of this module?',
                options: ['Option A', 'Option B', 'Option C', 'Option D'],
                correctAnswer: 0,
              },
              {
                question: 'Which concept was introduced in lesson 1?',
                options: ['Concept X', 'Concept Y', 'Concept Z', 'None'],
                correctAnswer: 1,
              },
              {
                question: 'What is a key feature of this module?',
                options: ['Feature A', 'Feature B', 'Feature C', 'Feature D'],
                correctAnswer: 2,
              },
              {
                question: 'Which tool is used in this module?',
                options: ['Tool X', 'Tool Y', 'Tool Z', 'None'],
                correctAnswer: 0,
              },
              {
                question: 'What is the final topic covered?',
                options: ['Topic A', 'Topic B', 'Topic C', 'Topic D'],
                correctAnswer: 3,
              },
            ],
          };
          setQuizData(defaultQuizData);
          // Initialize answers array with null values for each question
          setAnswers(new Array(defaultQuizData.questions.length).fill(null));
        }
      } catch (err) {
        console.error('Error fetching quiz:', err);
        setError('Failed to load quiz content');
      } finally {
        setLoading(false);
      }
    };

    fetchQuizData();
  }, [courseId, moduleIndex]);

  // Check if all questions have been answered
  useEffect(() => {
    if (answers.length > 0) {
      const hasUnansweredQuestion = answers.some(answer => answer === null);
      setAllQuestionsAnswered(!hasUnansweredQuestion);
    }
  }, [answers]);

  // Memoize handleSubmit to use in the timer effect
  const handleSubmit = useCallback(() => {
    if (!quizData) return;

    let correct = 0;
    quizData.questions.forEach((q, index) => {
      if (answers[index] === q.correctAnswer) {
        correct++;
      }
    });

    const scorePercentage = (correct / quizData.questions.length) * 100;
    setScore(scorePercentage);
    setPassed(scorePercentage >= 80); // Pass threshold: 80%
    console.log('Quiz submitted:', { score: scorePercentage, passed: scorePercentage >= 80 });
  }, [quizData, answers]);

  // Countdown timer
  useEffect(() => {
    if (score !== null || timeLeft <= 0) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          handleSubmit(); // Auto-submit when time is up
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft, score, handleSubmit]);

  // Format time as MM:SS
  const formatTime = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Navigate to previous question
  const handlePreviousQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  };

  // Navigate to next question
  const handleNextQuestion = () => {
    if (quizData && currentQuestionIndex < quizData.questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    }
  };

  // Handle answer selection
  const handleAnswer = (questionIndex: number, optionIndex: number) => {
    const newAnswers = [...answers];
    newAnswers[questionIndex] = optionIndex;
    setAnswers(newAnswers);
  };

  // Reset quiz for retry
  const handleRetry = () => {
    if (!quizData) return;
    setAnswers(new Array(quizData.questions.length).fill(null));
    setCurrentQuestionIndex(0);
    setScore(null);
    setPassed(false);
    setTimeLeft(300); // Reset timer to 5 minutes
    setAllQuestionsAnswered(false);
  };

  // Determine the next module index
  const currentModuleIndex = moduleIndex ? parseInt(moduleIndex as string, 10) : 0;
  const nextModuleIndex = currentModuleIndex + 1; // Advance to next module
  const returnUrl = nextModuleIndex < 5 ? `/learn/${courseId}?module=${nextModuleIndex}` : `/learn/${courseId}`;

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

  if (error || !quizData) {
    console.log('Quiz error state:', { error, quizData });
    return (
      <>
        <Header />
        <div
          className="container text-center"
          style={{ minHeight: '70vh', paddingTop: '90px' }}
        >
          <div className="alert alert-danger mt-5" role="alert">
            {error || 'No quiz available'}
          </div>
          <Link
            href={`/learn/${courseId}`}
            className="btn p-0 border-0 bg-transparent shadow-none text-decoration-none"
            style={{
              fontFamily: '"Livvic", sans-serif',
              fontSize: 20,
              color: '#6c757d',
              transition: 'color 0.15s ease-in-out',
            }}
          >
            <span className="d-flex align-items-center" style={{ fontSize: 20 }}>
              <i
                className="bi bi-arrow-left me-3"
                style={{ fontSize: 20, marginRight: 10 }}
              ></i>
              Back to Course
            </span>
          </Link>
        </div>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Head>
        <title>{`DG Next - Quiz - ${quizData.title}`}</title>
        <meta name="description" content={`Quiz for ${quizData.title}`} />
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
              href={`/learn/${courseId}`}
              className="btn p-0 border-0 bg-transparent shadow-none text-decoration-none"
              style={{
                fontFamily: '"Livvic", sans-serif',
                fontSize: 20,
                color: '#6c757d',
                transition: 'color 0.15s ease-in-out',
              }}
              onMouseOver={(e) => (e.currentTarget.style.color = '#2c3e50')}
              onMouseOut={(e) => (e.currentTarget.style.color = '#6c757d')}
              onMouseDown={(e) => (e.currentTarget.style.color = '#2c3e50')}
              onMouseUp={(e) => (e.currentTarget.style.color = '#2c3e50')}
            >
              <span className="d-flex align-items-center" style={{ fontSize: 20 }}>
                <i
                  className="bi bi-arrow-left me-3"
                  style={{ fontSize: 20, marginRight: 10 }}
                ></i>
                Back to Course
              </span>
            </Link>
          </div>
        </div>

        <div className="row">
          <div className="col-12">
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
                    margin: 0,
                  }}
                >
                  {quizData.title}
                </h4>
                {score === null && (
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
                {score === null ? (
                  <>
                    {/* Progress bar */}
                    <div className="progress mb-4" style={{ height: '8px' }}>
                      <div
                        className="progress-bar"
                        role="progressbar"
                        style={{
                          width: `${((currentQuestionIndex + 1) / quizData.questions.length) * 100}%`,
                          backgroundColor: '#2c3e50',
                        }}
                        aria-valuenow={(currentQuestionIndex + 1)}
                        aria-valuemin={0}
                        aria-valuemax={quizData.questions.length}
                      ></div>
                    </div>
                    
                    {/* Question counter */}
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
                    
                    {/* Current question */}
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
                              display: 'block'
                            }}
                            onMouseOver={(e) => (e.currentTarget.style.backgroundColor = '#f8f9fa')}
                            onMouseOut={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                          >
                            {option}
                          </label>
                        </div>
                      ))}
                    </div>
                    
                    {/* Navigation buttons */}
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
                          className="btn search-btn"
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
                    
                    {/* Question indicator dots */}
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
                    
                    {/* Submit button at bottom if all questions are answered */}
                    {allQuestionsAnswered && currentQuestionIndex !== quizData.questions.length - 1 && (
                      <div className="text-center mt-4">
                        <button
                          className="btn search-btn"
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
                    
                    {/* Time's up message */}
                    {timeLeft <= 0 && (
                      <p
                        className="text-danger mt-3 text-center"
                        style={{ fontFamily: "'Livvic', sans-serif" }}
                      >
                        {`Time's up! Your quiz has been submitted.`}
                      </p>
                    )}
                    
                    {/* Warning if not all questions are answered */}
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
                        color: passed ? '#28a745' : '#dc3545',
                      }}
                    >
                      {passed ? 'Congratulations!' : 'Try Again'}
                    </h3>
                    <p
                      style={{
                        fontFamily: "'Livvic', sans-serif",
                        fontSize: 18,
                      }}
                    >
                      Your Score: {score.toFixed(2)}%{' '}
                      {passed ? '(Passed)' : '(Failed)'}
                    </p>
                    
                    {/* Result details - show correct/incorrect answers */}
                    <div className="mt-4 mb-4">
                      <div className="row">
                        <div className="col-md-8 mx-auto">
                          <div className="card">
                            <div className="card-header bg-light">
                              <h5 style={{ fontFamily: "'Livvic', sans-serif", margin: 0 }}>Quiz Results</h5>
                            </div>
                            <div className="card-body">
                              {quizData.questions.map((question, qIndex) => (
                                <div key={qIndex} className="mb-3">
                                  <div className="d-flex align-items-center">
                                    <span 
                                      className={`badge ${answers[qIndex] === question.correctAnswer ? 'bg-success' : 'bg-danger'} me-2`}
                                    >
                                      {answers[qIndex] === question.correctAnswer ? 
                                        <i className="bi bi-check"></i> : 
                                        <i className="bi bi-x"></i>}
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
                    
                    {passed ? (
                      <Link
                        href={returnUrl}
                        className="btn search-btn"
                        style={{
                          fontFamily: "'Livvic', sans-serif",
                          fontSize: '16px',
                          letterSpacing: '1px',
                        }}
                      >
                        {nextModuleIndex < 5 ? 'Next Module' : 'Return to Course'}
                      </Link>
                    ) : (
                      <button
                        className="btn search-btn"
                        style={{
                          fontFamily: "'Livvic', sans-serif",
                          fontSize: '16px',
                          letterSpacing: '1px',
                        }}
                        onClick={handleRetry}
                      >
                        Retry Quiz
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </>
  );
};

export default Quiz;