import { useRef, useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { initTreeVisualizer } from '../algorithms/trees/treeVisualizer';
import { getAlgorithm } from '../application/AlgorithmRegistry';
import { Step } from '../domain/algorithms/Step';
import '../styles/TreeVisualizer.css';

const TYPE_MAP = { bst: 'bst', avl: 'avl', heap: 'heap-tree', 'heap-tree': 'heap-tree' };

export default function Trees() {
  const containerRef = useRef(null);
  const vizRef = useRef(null);
  const { type = 'bst' } = useParams();
  const [algo, setAlgo] = useState(() => {
    try { return getAlgorithm(TYPE_MAP[type] || 'bst'); } catch { return null; }
  });

  useEffect(() => {
    if (containerRef.current) {
      if (vizRef.current) { vizRef.current.destroy(); vizRef.current = null; }
      vizRef.current = initTreeVisualizer(containerRef.current, type);
    }
    try { setAlgo(() => { try { return getAlgorithm(TYPE_MAP[type] || 'bst'); } catch { return null; } }); } catch {}
    return () => {
      if (vizRef.current) { vizRef.current.destroy(); vizRef.current = null; }
    };
  }, [type]);

  return (
    <div className="tree-page" style={{ width: '100%', height: '100%' }}>
      <div ref={containerRef} style={{ width: '100%', height: '100%' }} />
    </div>
  );
}
