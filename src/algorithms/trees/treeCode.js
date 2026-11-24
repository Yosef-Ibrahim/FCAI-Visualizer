const bst = {
  insert: {
    js: [
      'function insert(node, key) {',
      '  if (node === null) return new Node(key);',
      '  if (key < node.key) node.left = insert(node.left, key);',
      '  else if (key > node.key) node.right = insert(node.right, key);',
      '  return node;',
      '}',
    ],
    python: [
      'def insert(node, key):',
      '    if node is None: return Node(key)',
      '    if key < node.key: node.left = insert(node.left, key)',
      '    elif key > node.key: node.right = insert(node.right, key)',
      '    return node',
    ],
    cpp: [
      'Node* insert(Node* node, double key) {',
      '    if (!node) return new Node(key);',
      '    if (key < node->key) node->left = insert(node->left, key);',
      '    else if (key > node->key) node->right = insert(node->right, key);',
      '    return node;',
      '}',
    ],
    java: [
      'Node insert(Node node, double key) {',
      '    if (node == null) return new Node(key);',
      '    if (key < node.key) node.left = insert(node.left, key);',
      '    else if (key > node.key) node.right = insert(node.right, key);',
      '    return node;',
      '}',
    ],
    csharp: [
      'Node Insert(Node node, double key) {',
      '    if (node == null) return new Node(key);',
      '    if (key < node.key) node.left = Insert(node.left, key);',
      '    else if (key > node.key) node.right = Insert(node.right, key);',
      '    return node;',
      '}',
    ],
    semantic: {
      start: { js: 0, python: 0, cpp: 0, java: 0, csharp: 0 },
      root: { js: 1, python: 1, cpp: 1, java: 1, csharp: 1 },
      compare: { js: 2, python: 2, cpp: 2, java: 2, csharp: 2 },
      attach: { js: 2, python: 2, cpp: 2, java: 2, csharp: 2 },
      done: { js: 4, python: 4, cpp: 4, java: 4, csharp: 4 },
    },
  },
  delete: {
    js: [
      'function remove(node, key) {',
      '  if (node === null) return null;',
      '  if (key < node.key) node.left = remove(node.left, key);',
      '  else if (key > node.key) node.right = remove(node.right, key);',
      '  else if (!node.left) return node.right;',
      '  else if (!node.right) return node.left;',
      '  else { node.key = min(node.right).key; node.right = remove(node.right, node.key); }',
      '  return node;',
      '}',
    ],
    python: [
      'def remove(node, key):',
      '    if node is None: return None',
      '    if key < node.key: node.left = remove(node.left, key)',
      '    elif key > node.key: node.right = remove(node.right, key)',
      '    elif node.left is None: return node.right',
      '    elif node.right is None: return node.left',
      '    else: node.key = minimum(node.right).key; node.right = remove(node.right, node.key)',
      '    return node',
    ],
    cpp: [
      'Node* remove(Node* node, double key) {',
      '    if (!node) return nullptr;',
      '    if (key < node->key) node->left = remove(node->left, key);',
      '    else if (key > node->key) node->right = remove(node->right, key);',
      '    else if (!node->left) return node->right;',
      '    else if (!node->right) return node->left;',
      '    else { node->key = minimum(node->right)->key; node->right = remove(node->right, node->key); }',
      '    return node;',
      '}',
    ],
    java: [
      'Node remove(Node node, double key) {',
      '    if (node == null) return null;',
      '    if (key < node.key) node.left = remove(node.left, key);',
      '    else if (key > node.key) node.right = remove(node.right, key);',
      '    else if (node.left == null) return node.right;',
      '    else if (node.right == null) return node.left;',
      '    else { node.key = minimum(node.right).key; node.right = remove(node.right, node.key); }',
      '    return node;',
      '}',
    ],
    csharp: [
      'Node Remove(Node node, double key) {',
      '    if (node == null) return null;',
      '    if (key < node.key) node.left = Remove(node.left, key);',
      '    else if (key > node.key) node.right = Remove(node.right, key);',
      '    else if (node.left == null) return node.right;',
      '    else if (node.right == null) return node.left;',
      '    else { node.key = Minimum(node.right).key; node.right = Remove(node.right, node.key); }',
      '    return node;',
      '}',
    ],
    semantic: {
      start: { js: 0, python: 0, cpp: 0, java: 0, csharp: 0 },
      compare: { js: 2, python: 2, cpp: 2, java: 2, csharp: 2 },
      remove: { js: 4, python: 4, cpp: 4, java: 4, csharp: 4 },
      successor: { js: 6, python: 6, cpp: 6, java: 6, csharp: 6 },
      done: { js: 7, python: 7, cpp: 7, java: 7, csharp: 7 },
    },
  },
  search: {
    js: [
      'function search(node, key) {',
      '  if (node === null || node.key === key) return node;',
      '  return key < node.key ? search(node.left, key) : search(node.right, key);',
      '}',
    ],
    python: [
      'def search(node, key):',
      '    if node is None or node.key == key: return node',
      '    return search(node.left, key) if key < node.key else search(node.right, key)',
    ],
    cpp: [
      'Node* search(Node* node, double key) {',
      '    if (!node || node->key == key) return node;',
      '    return key < node->key ? search(node->left, key) : search(node->right, key);',
      '}',
    ],
    java: [
      'Node search(Node node, double key) {',
      '    if (node == null || node.key == key) return node;',
      '    return key < node.key ? search(node.left, key) : search(node.right, key);',
      '}',
    ],
    csharp: [
      'Node Search(Node node, double key) {',
      '    if (node == null || node.key == key) return node;',
      '    return key < node.key ? Search(node.left, key) : Search(node.right, key);',
      '}',
    ],
    semantic: {
      start: { js: 0, python: 0, cpp: 0, java: 0, csharp: 0 },
      compare: { js: 1, python: 1, cpp: 1, java: 1, csharp: 1 },
      done: { js: 2, python: 2, cpp: 2, java: 2, csharp: 2 },
    },
  },
};

const avl = {
  ...bst,
  insert: {
    js: [
      'function insert(node, key) {',
      '  if (!node) return new Node(key);',
      '  if (key < node.key) node.left = insert(node.left, key);',
      '  else if (key > node.key) node.right = insert(node.right, key);',
      '  else return node;',
      '  updateHeight(node);',
      '  const balance = height(node.left) - height(node.right);',
      '  if (balance > 1 && key < node.left.key) return rotateRight(node);',
      '  if (balance < -1 && key > node.right.key) return rotateLeft(node);',
      '  if (balance > 1) { node.left = rotateLeft(node.left); return rotateRight(node); }',
      '  if (balance < -1) { node.right = rotateRight(node.right); return rotateLeft(node); }',
      '  return node;',
      '}',
    ],
    python: [
      'def insert(node, key):',
      '    if node is None: return Node(key)',
      '    if key < node.key: node.left = insert(node.left, key)',
      '    elif key > node.key: node.right = insert(node.right, key)',
      '    else: return node',
      '    update_height(node)',
      '    balance = height(node.left) - height(node.right)',
      '    if balance > 1 and key < node.left.key: return rotate_right(node)',
      '    if balance < -1 and key > node.right.key: return rotate_left(node)',
      '    if balance > 1: node.left = rotate_left(node.left); return rotate_right(node)',
      '    if balance < -1: node.right = rotate_right(node.right); return rotate_left(node)',
      '    return node',
    ],
    cpp: [
      'Node* insert(Node* node, double key) {',
      '    if (!node) return new Node(key);',
      '    if (key < node->key) node->left = insert(node->left, key);',
      '    else if (key > node->key) node->right = insert(node->right, key);',
      '    else return node;',
      '    updateHeight(node);',
      '    int balance = height(node->left) - height(node->right);',
      '    if (balance > 1 && key < node->left->key) return rotateRight(node);',
      '    if (balance < -1 && key > node->right->key) return rotateLeft(node);',
      '    if (balance > 1) { node->left = rotateLeft(node->left); return rotateRight(node); }',
      '    if (balance < -1) { node->right = rotateRight(node->right); return rotateLeft(node); }',
      '    return node;',
      '}',
    ],
    java: [
      'Node insert(Node node, double key) {',
      '    if (node == null) return new Node(key);',
      '    if (key < node.key) node.left = insert(node.left, key);',
      '    else if (key > node.key) node.right = insert(node.right, key);',
      '    else return node;',
      '    updateHeight(node);',
      '    int balance = height(node.left) - height(node.right);',
      '    if (balance > 1 && key < node.left.key) return rotateRight(node);',
      '    if (balance < -1 && key > node.right.key) return rotateLeft(node);',
      '    if (balance > 1) { node.left = rotateLeft(node.left); return rotateRight(node); }',
      '    if (balance < -1) { node.right = rotateRight(node.right); return rotateLeft(node); }',
      '    return node;',
      '}',
    ],
    csharp: [
      'Node Insert(Node node, double key) {',
      '    if (node == null) return new Node(key);',
      '    if (key < node.key) node.left = Insert(node.left, key);',
      '    else if (key > node.key) node.right = Insert(node.right, key);',
      '    else return node;',
      '    UpdateHeight(node);',
      '    int balance = Height(node.left) - Height(node.right);',
      '    if (balance > 1 && key < node.left.key) return RotateRight(node);',
      '    if (balance < -1 && key > node.right.key) return RotateLeft(node);',
      '    if (balance > 1) { node.left = RotateLeft(node.left); return RotateRight(node); }',
      '    if (balance < -1) { node.right = RotateRight(node.right); return RotateLeft(node); }',
      '    return node;',
      '}',
    ],
    semantic: {
      start: { js: 0, python: 0, cpp: 0, java: 0, csharp: 0 },
      root: { js: 1, python: 1, cpp: 1, java: 1, csharp: 1 },
      compare: { js: 2, python: 2, cpp: 2, java: 2, csharp: 2 },
      attach: { js: 2, python: 2, cpp: 2, java: 2, csharp: 2 },
      balance: { js: 6, python: 6, cpp: 6, java: 6, csharp: 6 },
      rotateLeft: { js: 8, python: 8, cpp: 8, java: 8, csharp: 8 },
      rotateRight: { js: 7, python: 7, cpp: 7, java: 7, csharp: 7 },
      done: { js: 11, python: 11, cpp: 11, java: 11, csharp: 11 },
    },
  },
  delete: {
    js: [
      'function remove(node, key) {',
      '  if (!node) return null;',
      '  if (key < node.key) node.left = remove(node.left, key);',
      '  else if (key > node.key) node.right = remove(node.right, key);',
      '  else if (!node.left || !node.right) node = node.left ?? node.right;',
      '  else { const successor = minimum(node.right); node.key = successor.key; node.right = remove(node.right, successor.key); }',
      '  if (!node) return null;',
      '  updateHeight(node);',
      '  const balance = height(node.left) - height(node.right);',
      '  if (balance > 1 && balanceOf(node.left) >= 0) return rotateRight(node);',
      '  if (balance > 1) { node.left = rotateLeft(node.left); return rotateRight(node); }',
      '  if (balance < -1 && balanceOf(node.right) <= 0) return rotateLeft(node);',
      '  if (balance < -1) { node.right = rotateRight(node.right); return rotateLeft(node); }',
      '  return node;',
      '}',
    ],
    python: [
      'def remove(node, key):',
      '    if node is None: return None',
      '    if key < node.key: node.left = remove(node.left, key)',
      '    elif key > node.key: node.right = remove(node.right, key)',
      '    elif node.left is None: node = node.right',
      '    elif node.right is None: node = node.left',
      '    else:',
      '        successor = minimum(node.right)',
      '        node.key = successor.key; node.right = remove(node.right, successor.key)',
      '    if node is None: return None',
      '    update_height(node)',
      '    balance = height(node.left) - height(node.right)',
      '    if balance > 1 and balance_of(node.left) >= 0: return rotate_right(node)',
      '    if balance > 1: node.left = rotate_left(node.left); return rotate_right(node)',
      '    if balance < -1 and balance_of(node.right) <= 0: return rotate_left(node)',
      '    if balance < -1: node.right = rotate_right(node.right); return rotate_left(node)',
      '    return node',
    ],
    cpp: [
      'Node* remove(Node* node, double key) {',
      '    if (!node) return nullptr;',
      '    if (key < node->key) node->left = remove(node->left, key);',
      '    else if (key > node->key) node->right = remove(node->right, key);',
      '    else if (!node->left || !node->right) node = node->left ? node->left : node->right;',
      '    else { Node* successor = minimum(node->right); node->key = successor->key; node->right = remove(node->right, successor->key); }',
      '    if (!node) return nullptr;',
      '    updateHeight(node);',
      '    int balance = height(node->left) - height(node->right);',
      '    if (balance > 1 && balanceOf(node->left) >= 0) return rotateRight(node);',
      '    if (balance > 1) { node->left = rotateLeft(node->left); return rotateRight(node); }',
      '    if (balance < -1 && balanceOf(node->right) <= 0) return rotateLeft(node);',
      '    if (balance < -1) { node->right = rotateRight(node->right); return rotateLeft(node); }',
      '    return node;',
      '}',
    ],
    java: [
      'Node remove(Node node, double key) {',
      '    if (node == null) return null;',
      '    if (key < node.key) node.left = remove(node.left, key);',
      '    else if (key > node.key) node.right = remove(node.right, key);',
      '    else if (node.left == null) node = node.right;',
      '    else if (node.right == null) node = node.left;',
      '    else { Node successor = minimum(node.right); node.key = successor.key; node.right = remove(node.right, successor.key); }',
      '    if (node == null) return null;',
      '    updateHeight(node);',
      '    int balance = height(node.left) - height(node.right);',
      '    if (balance > 1 && balanceOf(node.left) >= 0) return rotateRight(node);',
      '    if (balance > 1) { node.left = rotateLeft(node.left); return rotateRight(node); }',
      '    if (balance < -1 && balanceOf(node.right) <= 0) return rotateLeft(node);',
      '    if (balance < -1) { node.right = rotateRight(node.right); return rotateLeft(node); }',
      '    return node;',
      '}',
    ],
    csharp: [
      'Node Remove(Node node, double key) {',
      '    if (node == null) return null;',
      '    if (key < node.key) node.left = Remove(node.left, key);',
      '    else if (key > node.key) node.right = Remove(node.right, key);',
      '    else if (node.left == null) node = node.right;',
      '    else if (node.right == null) node = node.left;',
      '    else { Node successor = Minimum(node.right); node.key = successor.key; node.right = Remove(node.right, successor.key); }',
      '    if (node == null) return null;',
      '    UpdateHeight(node);',
      '    int balance = Height(node.left) - Height(node.right);',
      '    if (balance > 1 && BalanceOf(node.left) >= 0) return RotateRight(node);',
      '    if (balance > 1) { node.left = RotateLeft(node.left); return RotateRight(node); }',
      '    if (balance < -1 && BalanceOf(node.right) <= 0) return RotateLeft(node);',
      '    if (balance < -1) { node.right = RotateRight(node.right); return RotateLeft(node); }',
      '    return node;',
      '}',
    ],
    semantic: {
      start: { js: 0, python: 0, cpp: 0, java: 0, csharp: 0 },
      compare: { js: 2, python: 2, cpp: 2, java: 2, csharp: 2 },
      remove: { js: 4, python: 4, cpp: 4, java: 4, csharp: 4 },
      successor: { js: 5, python: 7, cpp: 5, java: 6, csharp: 6 },
      balance: { js: 8, python: 11, cpp: 8, java: 9, csharp: 9 },
      rotateRight: { js: 9, python: 12, cpp: 9, java: 10, csharp: 10 },
      rotateLeft: { js: 11, python: 14, cpp: 11, java: 12, csharp: 12 },
      done: { js: 13, python: 16, cpp: 13, java: 14, csharp: 14 },
    },
  },
  rotateLeft: {
    js: ['function rotateLeft(x) {', '  const y = x.right;', '  x.right = y.left; y.left = x;', '  updateHeight(x); updateHeight(y);', '  return y;', '}'],
    python: ['def rotate_left(x):', '    y = x.right', '    x.right = y.left; y.left = x', '    update_height(x); update_height(y)', '    return y'],
    cpp: ['Node* rotateLeft(Node* x) {', '    Node* y = x->right;', '    x->right = y->left; y->left = x;', '    updateHeight(x); updateHeight(y);', '    return y;', '}'],
    java: ['Node rotateLeft(Node x) {', '    Node y = x.right;', '    x.right = y.left; y.left = x;', '    updateHeight(x); updateHeight(y);', '    return y;', '}'],
    csharp: ['Node RotateLeft(Node x) {', '    Node y = x.right;', '    x.right = y.left; y.left = x;', '    UpdateHeight(x); UpdateHeight(y);', '    return y;', '}'],
    semantic: { start: { js: 0, python: 0, cpp: 0, java: 0, csharp: 0 }, rotate: { js: 2, python: 2, cpp: 2, java: 2, csharp: 2 }, done: { js: 4, python: 4, cpp: 4, java: 4, csharp: 4 } },
  },
  rotateRight: {
    js: ['function rotateRight(y) {', '  const x = y.left;', '  y.left = x.right; x.right = y;', '  updateHeight(y); updateHeight(x);', '  return x;', '}'],
    python: ['def rotate_right(y):', '    x = y.left', '    y.left = x.right; x.right = y', '    update_height(y); update_height(x)', '    return x'],
    cpp: ['Node* rotateRight(Node* y) {', '    Node* x = y->left;', '    y->left = x->right; x->right = y;', '    updateHeight(y); updateHeight(x);', '    return x;', '}'],
    java: ['Node rotateRight(Node y) {', '    Node x = y.left;', '    y.left = x.right; x.right = y;', '    updateHeight(y); updateHeight(x);', '    return x;', '}'],
    csharp: ['Node RotateRight(Node y) {', '    Node x = y.left;', '    y.left = x.right; x.right = y;', '    UpdateHeight(y); UpdateHeight(x);', '    return x;', '}'],
    semantic: { start: { js: 0, python: 0, cpp: 0, java: 0, csharp: 0 }, rotate: { js: 2, python: 2, cpp: 2, java: 2, csharp: 2 }, done: { js: 4, python: 4, cpp: 4, java: 4, csharp: 4 } },
  },
};

const rbt = {
  ...bst,
  insert: {
    js: [
      'function insert(root, key) {',
      '  const node = bstInsert(root, key);',
      '  node.color = RED;',
      '  fixAfterInsert(node);',
      '  root.color = BLACK;',
      '  return root;',
      '}',
    ],
    python: [
      'def insert(root, key):',
      '    node = bst_insert(root, key)',
      '    node.color = RED',
      '    fix_after_insert(node)',
      '    root.color = BLACK',
      '    return root',
    ],
    cpp: [
      'Node* insert(Node* root, double key) {',
      '    Node* node = bstInsert(root, key);',
      '    node->color = RED;',
      '    fixAfterInsert(node);',
      '    root->color = BLACK;',
      '    return root;',
      '}',
    ],
    java: [
      'Node insert(Node root, double key) {',
      '    Node node = bstInsert(root, key);',
      '    node.color = RED;',
      '    fixAfterInsert(node);',
      '    root.color = BLACK;',
      '    return root;',
      '}',
    ],
    csharp: [
      'Node Insert(Node root, double key) {',
      '    Node node = BstInsert(root, key);',
      '    node.color = RED;',
      '    FixAfterInsert(node);',
      '    root.color = BLACK;',
      '    return root;',
      '}',
    ],
    semantic: {
      start: { js: 0, python: 0, cpp: 0, java: 0, csharp: 0 },
      root: { js: 1, python: 1, cpp: 1, java: 1, csharp: 1 },
      red: { js: 2, python: 2, cpp: 2, java: 2, csharp: 2 },
      blackRoot: { js: 4, python: 4, cpp: 4, java: 4, csharp: 4 },
      compare: { js: 1, python: 1, cpp: 1, java: 1, csharp: 1 },
      attach: { js: 1, python: 1, cpp: 1, java: 1, csharp: 1 },
      balance: { js: 3, python: 3, cpp: 3, java: 3, csharp: 3 },
      done: { js: 5, python: 5, cpp: 5, java: 5, csharp: 5 },
    },
  },
  fixAfterInsert: {
    js: ['function fixAfterInsert(node) {', '  while (node.parent?.color === RED) {', '    const uncle = siblingOf(node.parent);', '    if (uncle?.color === RED) recolor(node, uncle);', '    else rotateAtViolation(node);', '  }', '}'],
    python: ['def fix_after_insert(node):', '    while node.parent and node.parent.color == RED:', '        uncle = sibling_of(node.parent)', '        if uncle and uncle.color == RED: recolor(node, uncle)', '        else: rotate_at_violation(node)'],
    cpp: ['void fixAfterInsert(Node* node) {', '    while (node->parent && node->parent->color == RED) {', '        Node* uncle = siblingOf(node->parent);', '        if (uncle && uncle->color == RED) recolor(node, uncle);', '        else rotateAtViolation(node);', '    }', '}'],
    java: ['void fixAfterInsert(Node node) {', '    while (node.parent != null && node.parent.color == RED) {', '        Node uncle = siblingOf(node.parent);', '        if (uncle != null && uncle.color == RED) recolor(node, uncle);', '        else rotateAtViolation(node);', '    }', '}'],
    csharp: ['void FixAfterInsert(Node node) {', '    while (node.parent != null && node.parent.color == RED) {', '        Node uncle = SiblingOf(node.parent);', '        if (uncle != null && uncle.color == RED) Recolor(node, uncle);', '        else RotateAtViolation(node);', '    }', '}'],
    semantic: { start: { js: 0, python: 0, cpp: 0, java: 0, csharp: 0 }, balance: { js: 1, python: 1, cpp: 1, java: 1, csharp: 1 }, rotate: { js: 4, python: 4, cpp: 4, java: 4, csharp: 4 }, done: { js: 5, python: 4, cpp: 5, java: 5, csharp: 5 } },
  },
  delete: {
    js: ['function remove(root, key) {', '  const node = find(root, key);', '  const moved = successorOrChild(node);', '  transplant(node, moved);', '  if (moved.color === BLACK) fixAfterDelete(moved);', '  return root;', '}'],
    python: ['def remove(root, key):', '    node = find(root, key)', '    moved = successor_or_child(node)', '    transplant(node, moved)', '    if moved.color == BLACK: fix_after_delete(moved)', '    return root'],
    cpp: ['Node* remove(Node* root, double key) {', '    Node* node = find(root, key);', '    Node* moved = successorOrChild(node);', '    transplant(node, moved);', '    if (moved->color == BLACK) fixAfterDelete(moved);', '    return root;', '}'],
    java: ['Node remove(Node root, double key) {', '    Node node = find(root, key);', '    Node moved = successorOrChild(node);', '    transplant(node, moved);', '    if (moved.color == BLACK) fixAfterDelete(moved);', '    return root;', '}'],
    csharp: ['Node Remove(Node root, double key) {', '    Node node = Find(root, key);', '    Node moved = SuccessorOrChild(node);', '    Transplant(node, moved);', '    if (moved.color == BLACK) FixAfterDelete(moved);', '    return root;', '}'],
    semantic: { start: { js: 0, python: 0, cpp: 0, java: 0, csharp: 0 }, compare: { js: 1, python: 1, cpp: 1, java: 1, csharp: 1 }, successor: { js: 2, python: 2, cpp: 2, java: 2, csharp: 2 }, remove: { js: 3, python: 3, cpp: 3, java: 3, csharp: 3 }, balance: { js: 4, python: 4, cpp: 4, java: 4, csharp: 4 }, done: { js: 5, python: 5, cpp: 5, java: 5, csharp: 5 } },
  },
  fixAfterDelete: {
    js: ['function fixAfterDelete(node) {', '  while (node !== root && colorOf(node) === BLACK) {', '    const sibling = siblingOf(node);', '    if (colorOf(sibling) === RED) rotateRedSibling(node, sibling);', '    else repairBlackSibling(node, sibling);', '  }', '  setColor(node, BLACK);', '}'],
    python: ['def fix_after_delete(node):', '    while node is not root and color_of(node) == BLACK:', '        sibling = sibling_of(node)', '        if color_of(sibling) == RED: rotate_red_sibling(node, sibling)', '        else: repair_black_sibling(node, sibling)', '    set_color(node, BLACK)'],
    cpp: ['void fixAfterDelete(Node* node) {', '    while (node != root && colorOf(node) == BLACK) {', '        Node* sibling = siblingOf(node);', '        if (colorOf(sibling) == RED) rotateRedSibling(node, sibling);', '        else repairBlackSibling(node, sibling);', '    }', '    setColor(node, BLACK);', '}'],
    java: ['void fixAfterDelete(Node node) {', '    while (node != root && colorOf(node) == BLACK) {', '        Node sibling = siblingOf(node);', '        if (colorOf(sibling) == RED) rotateRedSibling(node, sibling);', '        else repairBlackSibling(node, sibling);', '    }', '    setColor(node, BLACK);', '}'],
    csharp: ['void FixAfterDelete(Node node) {', '    while (node != root && ColorOf(node) == BLACK) {', '        Node sibling = SiblingOf(node);', '        if (ColorOf(sibling) == RED) RotateRedSibling(node, sibling);', '        else RepairBlackSibling(node, sibling);', '    }', '    SetColor(node, BLACK);', '}'],
    semantic: { start: { js: 0, python: 0, cpp: 0, java: 0, csharp: 0 }, balance: { js: 1, python: 1, cpp: 1, java: 1, csharp: 1 }, rotate: { js: 4, python: 4, cpp: 4, java: 4, csharp: 4 }, done: { js: 6, python: 5, cpp: 6, java: 6, csharp: 6 } },
  },
  rotateLeft: {
    js: ['function rotateLeft(node) {', '  const pivot = node.right;', '  node.right = pivot.left; pivot.left = node;', '  updateParents(node, pivot);', '  return pivot;', '}'],
    python: ['def rotate_left(node):', '    pivot = node.right', '    node.right = pivot.left; pivot.left = node', '    update_parents(node, pivot)', '    return pivot'],
    cpp: ['Node* rotateLeft(Node* node) {', '    Node* pivot = node->right;', '    node->right = pivot->left; pivot->left = node;', '    updateParents(node, pivot);', '    return pivot;', '}'],
    java: ['Node rotateLeft(Node node) {', '    Node pivot = node.right;', '    node.right = pivot.left; pivot.left = node;', '    updateParents(node, pivot);', '    return pivot;', '}'],
    csharp: ['Node RotateLeft(Node node) {', '    Node pivot = node.right;', '    node.right = pivot.left; pivot.left = node;', '    UpdateParents(node, pivot);', '    return pivot;', '}'],
    semantic: { start: { js: 0, python: 0, cpp: 0, java: 0, csharp: 0 }, rotate: { js: 2, python: 2, cpp: 2, java: 2, csharp: 2 }, done: { js: 4, python: 4, cpp: 4, java: 4, csharp: 4 } },
  },
  rotateRight: {
    js: ['function rotateRight(node) {', '  const pivot = node.left;', '  node.left = pivot.right; pivot.right = node;', '  updateParents(node, pivot);', '  return pivot;', '}'],
    python: ['def rotate_right(node):', '    pivot = node.left', '    node.left = pivot.right; pivot.right = node', '    update_parents(node, pivot)', '    return pivot'],
    cpp: ['Node* rotateRight(Node* node) {', '    Node* pivot = node->left;', '    node->left = pivot->right; pivot->right = node;', '    updateParents(node, pivot);', '    return pivot;', '}'],
    java: ['Node rotateRight(Node node) {', '    Node pivot = node.left;', '    node.left = pivot.right; pivot.right = node;', '    updateParents(node, pivot);', '    return pivot;', '}'],
    csharp: ['Node RotateRight(Node node) {', '    Node pivot = node.left;', '    node.left = pivot.right; pivot.right = node;', '    UpdateParents(node, pivot);', '    return pivot;', '}'],
    semantic: { start: { js: 0, python: 0, cpp: 0, java: 0, csharp: 0 }, rotate: { js: 2, python: 2, cpp: 2, java: 2, csharp: 2 }, done: { js: 4, python: 4, cpp: 4, java: 4, csharp: 4 } },
  },
};

const TREE_CODE = { bst, avl, rbt };
export const TREE_CODE_LANGUAGES = Object.freeze(['js', 'python', 'cpp', 'java', 'csharp']);

export function getTreeCode(type) {
  return TREE_CODE[type] ?? TREE_CODE.bst;
}

export function getTreeStep(event, type, action = 'insert') {
  const tree = getTreeCode(type);
  const operation = event?.operation?.toLowerCase() ?? '';
  let helper = action === 'delete' ? 'delete' : 'insert';
  let semantic = 'compare';

  if ((operation.includes('rotat') || operation.includes('rotation')) && operation.includes('left')) {
    helper = 'rotateLeft';
    semantic = 'rotate';
  } else if ((operation.includes('rotat') || operation.includes('rotation')) && operation.includes('right')) {
    helper = 'rotateRight';
    semantic = 'rotate';
  } else if (action === 'delete' && (operation.includes('balance') || operation.includes('recolor') || operation.includes('violation') || operation.includes('repair') || operation.includes('fix') || operation.includes('black sibling') || operation.includes('resolve'))) {
    helper = type === 'rbt' ? 'fixAfterDelete' : 'delete';
    semantic = operation.includes('resolve') ? 'done' : 'balance';
  } else if (action === 'delete') {
    helper = 'delete';
    semantic = operation.includes('successor') || operation.includes('move left')
      ? 'successor'
      : operation.includes('remove') || operation.includes('bypass')
        ? 'remove'
        : operation.includes('complete') || operation.includes('replaced')
          ? 'done'
          : operation.includes('compare')
            ? 'compare'
            : 'start';
  } else if (operation.includes('balance') || operation.includes('recolor') || operation.includes('violation') || operation.includes('repair') || operation.includes('fix')) {
    helper = type === 'rbt' ? 'fixAfterInsert' : 'insert';
    semantic = 'balance';
  } else if (operation.startsWith('insert') || operation.startsWith('attach') || operation.startsWith('set ') || operation.includes('root black')) {
    helper = 'insert';
    semantic = operation.includes('complete')
      ? 'done'
      : operation.includes('as red')
        ? 'red'
        : operation.includes('root black')
          ? 'blackRoot'
      : operation.startsWith('set ')
        ? 'root'
        : operation.includes('attach')
          ? 'attach'
          : 'start';
  }

  if (!tree[helper]) {
    helper = type === 'rbt' ? 'insert' : 'search';
    semantic = 'start';
  }
  return { helper, semantic };
}

export function getTreeCodeLine(code, semantic, lang) {
  return code?.semantic?.[semantic]?.[lang] ?? -1;
}
