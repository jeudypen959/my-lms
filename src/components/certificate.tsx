import { useState, useEffect } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db } from '@/config/firebaseConfig';
import Header from '@/components/Header/Header';
import Footer from '@/components/Footer/Footer';
import 'bootstrap/dist/css/bootstrap.min.css';
import { saveAs } from 'file-saver';

interface UserProgress {
  completedCourse: boolean;
  courseTitle: string;
}

const Certificate = () => {
  const router = useRouter();
  const { id: courseId } = router.query;
  const [userName, setUserName] = useState<string>('Student Name');
  const [courseTitle, setCourseTitle] = useState<string>('Course Title');
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');
  const [pdfUrl, setPdfUrl] = useState<string>('');

  // Fetch user and course data
  useEffect(() => {
    const fetchData = async () => {
      if (!courseId || typeof courseId !== 'string') {
        setError('Invalid course ID');
        setLoading(false);
        return;
      }

      const user = auth.currentUser;
      if (!user) {
        setError('Please sign in to view your certificate');
        setLoading(false);
        return;
      }

      try {
        // Fetch user progress to verify course completion
        const progressRef = doc(db, `users/${user.uid}/progress`, courseId);
        const progressSnap = await getDoc(progressRef);
        if (!progressSnap.exists() || !progressSnap.data()?.completedCourse) {
          setError('You have not completed this course or are not authorized to view this certificate');
          setLoading(false);
          return;
        }

        const progressData = progressSnap.data() as UserProgress;
        setCourseTitle(progressData.courseTitle || 'Untitled Course');
        setUserName(user.displayName || 'Student');

        // Generate LaTeX content for the certificate
        const latexContent = `
\\documentclass[a4paper,12pt]{article}
\\usepackage[utf8]{inputenc}
\\usepackage{geometry}
\\usepackage{graphicx}
\\usepackage{xcolor}
\\usepackage{fontspec}
\\setmainfont{Times New Roman}

\\geometry{a4paper, margin=1in}
\\pagestyle{empty}

\\begin{document}

\\begin{center}
  {\\Huge \\textbf{Certificate of Completion}} \\\\[0.5cm]
  {\\Large This is to certify that} \\\\[0.3cm]
  {\\huge ${user.displayName || 'Student'}} \\\\[0.3cm]
  {\\Large has successfully completed the course} \\\\[0.3cm]
  {\\Large \\textbf{${progressData.courseTitle || 'Untitled Course'}}} \\\\[0.3cm]
  {\\Large on \\today} \\\\[0.5cm]

  \\vfill

  \\begin{tabular}{cc}
    \\hline
    \\vspace{0.2cm} \\\\
    {\\large Instructor Signature} & {\\large Date} \\\\
    \\hline
  \\end{tabular}

  \\vfill

  {\\small Issued by DG Next}
\\end{center}

\\end{document}
        `;

        // Simulate PDF generation (in a real scenario, this would be sent to a server or processed with latexmk)
        // For demo, we'll assume the LaTeX is processed server-side and returns a PDF URL
        // Here, we'll create a blob URL for demo purposes
        const blob = new Blob([latexContent], { type: 'text/latex' });
        const url = URL.createObjectURL(blob);
        setPdfUrl(url);

        setLoading(false);
      } catch (err) {
        console.error('Error fetching certificate data:', err);
        setError('Failed to load certificate');
        setLoading(false);
      }
    };

    fetchData();
  }, [courseId]);

  // Handle PDF download
  const handleDownload = () => {
    if (pdfUrl) {
      saveAs(pdfUrl, `${courseTitle.replace(/\s+/g, '_')}_Certificate.pdf`);
    }
  };

  // Handle sharing (generates a shareable link)
  const handleShare = async () => {
    try {
      const shareUrl = `${window.location.origin}/certificate/${courseId}`;
      await navigator.clipboard.writeText(shareUrl);
      alert('Certificate link copied to clipboard!');
    } catch (err) {
      console.error('Error sharing certificate:', err);
      alert('Failed to copy link. Please copy the URL manually.');
    }
  };

  if (loading) {
    return (
      <>
        <Header />
        <div className="container d-flex justify-content-center align-items-center" style={{ minHeight: '70vh', paddingTop: '90px' }}>
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  if (error) {
    return (
      <>
        <Header />
        <div className="container text-center" style={{ minHeight: '70vh', paddingTop: '90px' }}>
          <div className="alert alert-danger mt-5" role="alert">
            {error}
          </div>
        </div>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Head>
        <title>{`DG Next - Certificate - ${courseTitle}`}</title>
        <meta name="description" content={`Certificate of Completion for ${courseTitle}`} />
        <link rel="icon" href="/dglogo.ico" />
      </Head>

      <Header />

      <div className="container" style={{ paddingTop: '90px', paddingBottom: '50px', minHeight: '70vh' }}>
        <div className="row justify-content-center">
          <div className="col-lg-8">
            <div className="card shadow-sm" style={{ borderRadius: '15px' }}>
              <div className="card-header bg-success text-white text-center" style={{ borderRadius: '15px 15px 0 0' }}>
                <h2 style={{ fontFamily: "'Acme', sans-serif", margin: 0 }}>
                  Certificate of Completion
                </h2>
              </div>
              <div className="card-body text-center">
                <h3 style={{ fontFamily: "'Livvic', sans-serif", color: '#2c3e50' }}>
                  Congratulations, {userName}!
                </h3>
                <p style={{ fontFamily: "'Livvic', sans-serif", fontSize: '18px' }}>
                  You have successfully completed the course <strong>{courseTitle}</strong>.
                </p>
                <div className="mt-4">
                  <iframe
                    src={pdfUrl}
                    style={{ width: '100%', height: '500px', border: '1px solid #dee2e6', borderRadius: '8px' }}
                    title="Certificate Preview"
                  ></iframe>
                </div>
                <div className="mt-4 d-flex justify-content-center gap-3">
                  <button
                    className="btn btn-primary"
                    style={{
                      fontFamily: "'Livvic', sans-serif",
                      fontSize: '16px',
                      letterSpacing: '1px',
                      backgroundColor: '#2c3e50',
                      borderColor: '#2c3e50',
                    }}
                    onClick={handleDownload}
                  >
                    Download Certificate
                  </button>
                  <button
                    className="btn btn-outline-primary"
                    style={{
                      fontFamily: "'Livvic', sans-serif",
                      fontSize: '16px',
                      letterSpacing: '1px',
                    }}
                    onClick={handleShare}
                  >
                    Share Certificate
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </>
  );
};

export default Certificate;