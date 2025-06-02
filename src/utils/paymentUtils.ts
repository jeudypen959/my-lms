import { doc, updateDoc, arrayUnion } from 'firebase/firestore';
import { db } from '@/config/firebaseConfig';
import { getAuth } from 'firebase/auth';

interface Course {
  id: string;
  courseTitle: string;
  instructor: string;
  price: number;
  thumbnail: string;
}

export const recordEnrollment = async (course: Course) => {
  const auth = getAuth();
  const user = auth.currentUser;

  if (!user) {
    throw new Error('No authenticated user found');
  }

  const userRef = doc(db, 'users', user.uid);

  const enrollmentData = {
    courseId: course.id,
    courseTitle: course.courseTitle,
    enrolledAt: new Date().toISOString(),
    instructor: course.instructor,
    price: course.price === 0 ? 'Free' : course.price.toFixed(2),
    thumbnail: course.thumbnail,
    username: user.displayName || 'Unknown User',
  };

  try {
    await updateDoc(userRef, {
      enrollment: arrayUnion(enrollmentData),
    });
  } catch (err) {
    console.error('Error recording enrollment:', err);
    throw new Error(`Failed to record enrollment: ${err instanceof Error ? err.message : 'Unknown error'}`);
  }
};