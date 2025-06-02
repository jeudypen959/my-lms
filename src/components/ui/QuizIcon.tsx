import { Player } from "@lottiefiles/react-lottie-player";
import quizAnimation from "@/assets/animation/quiz.json"; // Make sure the path is correct

const QuizIcon = () => {
  return (
    <Player
      autoplay
      loop
      src={quizAnimation}
      style={{ width: 90, height: 90, marginTop: -45, marginBottom: -50, marginLeft: -30, marginRight: -30}} // Adjust size as needed
    />
  );
};

export default QuizIcon;
