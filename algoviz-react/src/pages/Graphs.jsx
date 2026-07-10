import { useRef, useEffect, useState } from 'react';
import { useParams, Navigate } from 'react-router-dom';
import { initGraphVisualizer } from '../algorithms/graphs/graphVisualizer';
import { initDFSVisualizer } from '../algorithms/graphs/dfsVisualizer';
import { initDijkstraVisualizer } from '../algorithms/graphs/dijkstraVisualizer';
import { getAlgorithm } from '../application/AlgorithmRegistry';
import '../styles/TreeVisualizer.css';

const VIZ_MAP = {
  bfs: initGraphVisualizer,
  dfs: initDFSVisualizer,
  dijkstra: initDijkstraVisualizer,
};

export default function Graphs() {
  const containerRef = useRef(null);
  const vizRef = useRef(null);
  const { algo = 'bfs' } = useParams();
  const [alg, setAlg] = useState(() => {
    try { return getAlgorithm(algo); } catch { return null; }
  });

  useEffect(() => {
    if (containerRef.current) {
      if (vizRef.current) { vizRef.current.destroy(); vizRef.current = null; }
      const init = VIZ_MAP[algo];
      if (init) vizRef.current = init(containerRef.current);
    }
    try { setAlg(() => { try { return getAlgorithm(algo); } catch { return null; } }); } catch {}
    return () => {
      if (vizRef.current) { vizRef.current.destroy(); vizRef.current = null; }
    };
  }, [algo]);

  if (!algo) return <Navigate to="/graphs/bfs" replace />;

  return (
    <div ref={containerRef} className="tree-page" style={{ width: '100%', height: '100%' }} />
  );
}
