import { Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Analytics } from '@vercel/analytics/react';
import Layout from './components/layout/Layout';
import Home from './pages/Home';
import { LocaleProvider } from './i18n/LocaleProvider';

const DataStructureHome = lazy(() => import('./pages/courses/DataStructure/DataStructureHome'));
const Arrays = lazy(() => import('./pages/courses/DataStructure/Arrays'));
const Stacks = lazy(() => import('./pages/courses/DataStructure/Stacks'));
const Queues = lazy(() => import('./pages/courses/DataStructure/Queues'));
const LinkedLists = lazy(() => import('./pages/courses/DataStructure/LinkedLists'));
const CourseSorting = lazy(() => import('./pages/courses/DataStructure/Sorting'));
const CourseSearching = lazy(() => import('./pages/courses/DataStructure/Searching'));
const CourseGraphs = lazy(() => import('./pages/courses/DataStructure/Graphs'));
const Hashing = lazy(() => import('./pages/courses/DataStructure/Hashing'));

const AdvancedHome = lazy(() => import('./pages/courses/AdvancedDataStructure/AdvancedHome'));
const TreesCourse = lazy(() => import('./pages/courses/AdvancedDataStructure/Trees'));
const AVLTree = lazy(() => import('./pages/courses/AdvancedDataStructure/AVLTree'));
const RedBlackTree = lazy(() => import('./pages/courses/AdvancedDataStructure/RedBlackTree'));
const BTree = lazy(() => import('./pages/courses/AdvancedDataStructure/BTree'));
const TrieVisualizer = lazy(() => import('./pages/courses/AdvancedDataStructure/Trie'));
const SuffixTrie = lazy(() => import('./pages/courses/AdvancedDataStructure/SuffixTrie'));
const SuffixTree = lazy(() => import('./pages/courses/AdvancedDataStructure/SuffixTree'));
const SuffixArray = lazy(() => import('./pages/courses/AdvancedDataStructure/SuffixArray'));

const AlgorithmDesignHome = lazy(() => import('./pages/courses/AlgorithmDesign/AlgorithmDesignHome'));
const DynamicProgramming = lazy(() => import('./pages/courses/AlgorithmDesign/DynamicProgramming'));
const GreedyAlgorithms = lazy(() => import('./pages/courses/AlgorithmDesign/GreedyAlgorithms'));

const OperatingSystemsHome = lazy(() => import('./pages/courses/OperatingSystems/OperatingSystemsHome'));
const CpuScheduling = lazy(() => import('./pages/courses/OperatingSystems/CpuScheduling'));

const InformationTheoryHome = lazy(() => import('./pages/courses/InformationTheoryCompression/InformationTheoryHome'));
const LosslessCompression = lazy(() => import('./pages/courses/InformationTheoryCompression/LosslessCompression'));
const LossyCompression = lazy(() => import('./pages/courses/InformationTheoryCompression/LossyCompression'));

const Trees = lazy(() => import('./pages/Trees'));
const Sorting = lazy(() => import('./pages/Sorting'));
const Searching = lazy(() => import('./pages/Searching'));
const DataStructures = lazy(() => import('./pages/DataStructures'));
const Graphs = lazy(() => import('./pages/Graphs'));
const PracticeMode = lazy(() => import('./pages/PracticeMode'));
const Compare = lazy(() => import('./pages/Compare'));
const NotFound = lazy(() => import('./pages/NotFound'));

function RouteFallback() {
  return <div className="page" aria-busy="true" />;
}

export default function App() {
  return (
    <BrowserRouter>
      <LocaleProvider>
        <Suspense fallback={<RouteFallback />}>
          <Routes>
            <Route path="/" element={<Layout />}>
              <Route index element={<Home />} />

              {/* Data Structure course */}
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
              <Route path="courses/data-structure/hashing" element={<Hashing />} />

              {/* Advanced Data Structure course */}
              <Route path="courses/advanced-data-structure" element={<AdvancedHome />} />
              <Route path="courses/advanced-data-structure/trees" element={<TreesCourse />} />
              <Route path="courses/advanced-data-structure/avl-tree" element={<AVLTree />} />
              <Route path="courses/advanced-data-structure/red-black-tree" element={<RedBlackTree />} />
              <Route path="courses/advanced-data-structure/b-tree" element={<BTree />} />
              <Route path="courses/advanced-data-structure/trie" element={<TrieVisualizer />} />
              <Route path="courses/advanced-data-structure/suffix-trie" element={<SuffixTrie />} />
              <Route path="courses/advanced-data-structure/suffix-tree" element={<SuffixTree />} />
              <Route path="courses/advanced-data-structure/suffix-array" element={<SuffixArray />} />

              {/* Algorithm Analysis & Design course */}
              <Route path="courses/algorithms" element={<AlgorithmDesignHome />} />
              <Route path="courses/algorithms/dynamic-programming" element={<DynamicProgramming />} />
              <Route path="courses/algorithms/dynamic-programming/:algo" element={<DynamicProgramming />} />
              <Route path="courses/algorithms/greedy" element={<GreedyAlgorithms />} />
              <Route path="courses/algorithms/greedy/:algo" element={<GreedyAlgorithms />} />

              {/* Operating Systems course */}
              <Route path="courses/operating-systems" element={<OperatingSystemsHome />} />
              <Route path="courses/operating-systems/cpu-scheduling" element={<CpuScheduling />} />
              <Route path="courses/operating-systems/cpu-scheduling/:algo" element={<CpuScheduling />} />

              {/* Information Theory & Data Compression course */}
              <Route path="courses/information-theory-compression" element={<InformationTheoryHome />} />
              <Route path="courses/information-theory-compression/lossless" element={<LosslessCompression />} />
              <Route path="courses/information-theory-compression/lossy" element={<LossyCompression />} />

              {/* Legacy top-level routes */}
              <Route path="trees" element={<Trees />} />
              <Route path="trees/:type" element={<Trees />} />
              <Route path="sorting" element={<Sorting />} />
              <Route path="sorting/:algo" element={<Sorting />} />
              <Route path="searching" element={<Searching />} />
              <Route path="searching/:algo" element={<Searching />} />
              <Route path="data-structures" element={<DataStructures />} />
              <Route path="data-structures/:type" element={<DataStructures />} />
              <Route path="graphs" element={<Graphs />} />
              <Route path="graphs/:algo" element={<Graphs />} />

              {/* Learning tools */}
              <Route path="practice" element={<PracticeMode />} />
              <Route path="compare" element={<Compare />} />

              {/* Catch-all */}
              <Route path="*" element={<NotFound />} />
            </Route>
          </Routes>
        </Suspense>
      </LocaleProvider>
      <Analytics />
    </BrowserRouter>
  );
}
