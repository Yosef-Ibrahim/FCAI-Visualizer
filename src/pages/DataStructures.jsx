import { useRef, useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { initDSVisualizer } from '../algorithms/dataStructures/dsVisualizer';
import { getAlgorithm } from '../application/AlgorithmRegistry';
import '../styles/DataStructures.css';

const URL_TO_REGISTRY = {
  array: 'array-ds', stack: 'stack-ds', queue: 'queue-ds',
  'singly-ll': 'singly-ll', 'doubly-ll': 'doubly-ll',
  'circular-ll': 'circular-ll', 'ordered-ll': 'ordered-ll',
};

export default function DataStructures() {
  const { type = 'array' } = useParams();
  const containerRef = useRef(null);
  const vizRef = useRef(null);
  const [algo, setAlgo] = useState(() => {
    try { return getAlgorithm(URL_TO_REGISTRY[type] || 'array-ds'); } catch { return null; }
  });

  useEffect(() => {
    const dsType = type || 'array';
    if (containerRef.current) {
      if (vizRef.current) { vizRef.current.destroy(); vizRef.current = null; }
      vizRef.current = initDSVisualizer(containerRef.current, dsType);
    }
    try { setAlgo(() => { try { return getAlgorithm(URL_TO_REGISTRY[type] || 'array-ds'); } catch { return null; } }); } catch {}
    return () => {
      if (vizRef.current) { vizRef.current.destroy(); vizRef.current = null; }
    };
  }, [type]);

  return (
    <div ref={containerRef} className="ds-page" style={{ width: '100%', height: '100%' }} />
  );
}
