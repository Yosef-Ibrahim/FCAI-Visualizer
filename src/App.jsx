import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Layout from './components/layout/Layout';
import Home from './pages/Home';
import DataStructureHome from './pages/courses/DataStructure/DataStructureHome';
import Arrays from './pages/courses/DataStructure/Arrays';
import Stacks from './pages/courses/DataStructure/Stacks';
import Queues from './pages/courses/DataStructure/Queues';
import LinkedLists from './pages/courses/DataStructure/LinkedLists';
import CourseSorting from './pages/courses/DataStructure/Sorting';
import CourseSearching from './pages/courses/DataStructure/Searching';
import CourseGraphs from './pages/courses/DataStructure/Graphs';
import AdvancedHome from './pages/courses/AdvancedDataStructure/AdvancedHome';
import TreesCourse from './pages/courses/AdvancedDataStructure/Trees';
import AVLTree from './pages/courses/AdvancedDataStructure/AVLTree';
import RedBlackTree from './pages/courses/AdvancedDataStructure/RedBlackTree';
import BTree from './pages/courses/AdvancedDataStructure/BTree';
import InformationTheoryHome from './pages/courses/InformationTheoryCompression/InformationTheoryHome';
import LosslessCompression from './pages/courses/InformationTheoryCompression/LosslessCompression';
import LossyCompression from './pages/courses/InformationTheoryCompression/LossyCompression';
import Trees from './pages/Trees';
import Sorting from './pages/Sorting';
import Searching from './pages/Searching';
import DataStructures from './pages/DataStructures';
import Graphs from './pages/Graphs';
import PracticeMode from './pages/PracticeMode';
import Compare from './pages/Compare';
import NotFound from './pages/NotFound';
import { Analytics } from '@vercel/analytics/react';
import { LocaleProvider } from './i18n/LocaleProvider';

export default function App() {
  return (
    <BrowserRouter>
      <LocaleProvider>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="courses/data-structure" element={<DataStructureHome />} />
          <Route path="courses/data-structure/arrays" element={<Arrays />} />
          <Route path="courses/data-structure/stacks" element={<Stacks />} />
          <Route path="courses/data-structure/queues" element={<Queues />} />
          <Route path="courses/data-structure/linked-lists" element={<LinkedLists />} />
          <Route path="courses/data-structure/sorting" element={<CourseSorting />} />
          <Route path="courses/data-structure/sorting/:algo" element={<CourseSorting />} />
          <Route path="courses/data-structure/searching" element={<CourseSearching />} />
          <Route path="courses/data-structure/searching/:algo" element={<CourseSearching />} />
          <Route path="courses/data-structure/graphs" element={<CourseGraphs />} />
          <Route path="courses/data-structure/graphs/:algo" element={<CourseGraphs />} />
          <Route path="courses/advanced-data-structure" element={<AdvancedHome />} />
          <Route path="courses/advanced-data-structure/trees" element={<TreesCourse />} />
          <Route path="courses/advanced-data-structure/avl-tree" element={<AVLTree />} />
          <Route path="courses/advanced-data-structure/red-black-tree" element={<RedBlackTree />} />
          <Route path="courses/advanced-data-structure/b-tree" element={<BTree />} />
          <Route path="courses/information-theory-compression" element={<InformationTheoryHome />} />
          <Route path="courses/information-theory-compression/lossless" element={<LosslessCompression />} />
          <Route path="courses/information-theory-compression/lossy" element={<LossyCompression />} />

          {/* Trees — fully functional */}
          <Route path="trees" element={<Trees />} />
          <Route path="trees/:type" element={<Trees />} />

          {/* Sorting — placeholders */}
          <Route path="sorting" element={<Sorting />} />
          <Route path="sorting/:algo" element={<Sorting />} />

          {/* Searching — placeholders */}
          <Route path="searching" element={<Searching />} />
          <Route path="searching/:algo" element={<Searching />} />

          {/* Data Structures — placeholders */}
          <Route path="data-structures" element={<DataStructures />} />
          <Route path="data-structures/:type" element={<DataStructures />} />

          {/* Graphs — placeholders */}
          <Route path="graphs" element={<Graphs />} />
          <Route path="graphs/:algo" element={<Graphs />} />

          {/* Practice Mode */}
          <Route path="practice" element={<PracticeMode />} />

          {/* Comparison Mode */}
          <Route path="compare" element={<Compare />} />

          {/* Catch-all */}
          <Route path="*" element={<NotFound />} />
        </Route>
      </Routes>
      </LocaleProvider>
      <Analytics />
    </BrowserRouter>
  );
}
