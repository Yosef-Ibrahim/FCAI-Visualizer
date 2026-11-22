import CourseOverview from '../../../components/shared/CourseOverview';
import { operatingSystemsCourse } from '../../../data/courses';

export default function OperatingSystemsHome() {
  return <CourseOverview course={operatingSystemsCourse} />;
}
