const NODE_GAP_X = 90;
const NODE_GAP_Y = 78;
const NODE_RADIUS = 20;

export const TREE_CAMERA_ORIGIN = Object.freeze({ x: 300, y: 180 });

export function layoutTreeSnapshot(snapshot) {
  const nodes = [];
  const edges = [];
  const visit = (node, depth, parentValue = null) => {
    if (!node) return;
    visit(node.left, depth + 1, node.value);
    nodes.push({ ...node, depth, parentValue });
    visit(node.right, depth + 1, node.value);
  };
  visit(snapshot, 0);

  nodes.forEach((node, index) => {
    node.x = (index - (nodes.length - 1) / 2) * NODE_GAP_X;
    node.y = node.depth * NODE_GAP_Y;
    if (node.parentValue !== null) edges.push({ parentValue: node.parentValue, value: node.value });
  });

  return {
    nodes: new Map(nodes.map(node => [node.value, node])),
    edges,
    radius: NODE_RADIUS,
  };
}
