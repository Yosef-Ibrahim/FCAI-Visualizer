import CourseOverview from '../../../components/shared/CourseOverview';
import { algorithmDesignCourse } from '../../../data/courses';

export default function AlgorithmDesignHome() {
  return <CourseOverview course={algorithmDesignCourse} />;
}
