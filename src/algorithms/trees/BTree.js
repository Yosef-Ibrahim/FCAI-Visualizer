export const BTREE_ORDER = 3;
export const BTREE_MAX_KEYS = BTREE_ORDER - 1;
export const BTREE_MIN_KEYS = Math.floor((BTREE_ORDER - 1) / 2);
export const BTREE_MIN_ORDER = 3;
export const BTREE_MAX_ORDER = 10;

export function getBTreeLimits(order) {
  if (!Number.isInteger(order) || order < BTREE_MIN_ORDER || order > BTREE_MAX_ORDER) {
    throw new RangeError(`B-Tree order must be an integer from ${BTREE_MIN_ORDER} to ${BTREE_MAX_ORDER}.`);
  }

  return {
    order,
    maxKeys: order - 1,
    minKeys: Math.floor((order - 1) / 2),
  };
}

function cloneNode(node) {
  if (!node) return null;
  return {
    id: node.id,
    keys: [...node.keys],
    children: node.children.map(cloneNode),
  };
}

function validateKey(value) {
  if (!Number.isSafeInteger(value)) {
    throw new TypeError('B-Tree keys must be safe integers.');
  }
}

export class BTree {
  constructor(order = BTREE_ORDER) {
    const limits = getBTreeLimits(order);
    this.root = null;
    this.nextId = 1;
    this.steps = [];
    this.order = limits.order;
    this.maxKeys = limits.maxKeys;
    this.minKeys = limits.minKeys;
  }

  snapshot() {
    return cloneNode(this.root);
  }

  getHeight() {
    let height = 0;
    let node = this.root;
    while (node) {
      height += 1;
      node = node.children[0] ?? null;
    }
    return height;
  }

  _newNode(keys = [], children = []) {
    return { id: this.nextId++, keys, children };
  }

  _record(operation, explanation, kind, focusIds = [], extra = {}) {
    this.steps.push({
      operation,
      explanation,
      msg: explanation,
      msgKey: extra.msgKey,
      msgParams: extra.msgParams,
      kind,
      focusIds,
      snapshot: this.snapshot(),
      ...extra,
    });
  }

  _split(node) {
    const middleIndex = Math.floor(node.keys.length / 2);
    const promotedKey = node.keys[middleIndex];
    const right = this._newNode(
      node.keys.slice(middleIndex + 1),
      node.children.length ? node.children.slice(middleIndex + 1) : [],
    );

    node.keys = node.keys.slice(0, middleIndex);
    if (node.children.length) node.children = node.children.slice(0, middleIndex + 1);

    this._record(
      'split',
      `Node [${[...node.keys, promotedKey, ...right.keys].join(', ')}] overflowed. Split it around ${promotedKey}; the middle key moves up.`,
      'split',
      [node.id, right.id],
      {
        promotedKey,
        msgKey: 'catalog:btree.steps.split',
        msgParams: { keys: [...node.keys, promotedKey, ...right.keys].join(', '), key: promotedKey },
      },
    );
    return { promotedKey, right };
  }

  _insertRecursive(node, value) {
    let index = 0;
    while (index < node.keys.length && value > node.keys[index]) index += 1;

    this._record(
      'visit',
      `Compare ${value} with the keys [${node.keys.join(', ')}] and follow child ${index + 1}.`,
      'visit',
      [node.id],
      {
        msgKey: 'catalog:btree.steps.visitInsert',
        msgParams: { value, keys: node.keys.join(', '), child: index + 1 },
        childId: node.children[index]?.id,
      },
    );

    if (node.keys[index] === value) {
      this._record(
        'duplicate',
        `${value} is already in the B-Tree. Duplicate keys are ignored.`,
        'duplicate',
        [node.id],
        { msgKey: 'catalog:btree.steps.duplicate', msgParams: { value } },
      );
      return { duplicate: true };
    }

    if (node.children.length === 0) {
      node.keys.splice(index, 0, value);
      this._record(
        'insert-leaf',
        `Insert ${value} into this leaf in sorted order.`,
        'insert',
        [node.id],
        { msgKey: 'catalog:btree.steps.insertLeaf', msgParams: { value }, key: value },
      );
    } else {
      const result = this._insertRecursive(node.children[index], value);
      if (result.duplicate) return result;
      if (result.split) {
        node.keys.splice(index, 0, result.split.promotedKey);
        node.children.splice(index + 1, 0, result.split.right);
        this._record(
          'promote',
          `Promote ${result.split.promotedKey} into its parent between the split children.`,
          'promote',
          [node.id, result.split.right.id],
          {
            promotedKey: result.split.promotedKey,
            msgKey: 'catalog:btree.steps.promote',
            msgParams: { key: result.split.promotedKey },
            key: result.split.promotedKey,
          },
        );
      }
    }

    if (node.keys.length === this.order) {
      return { split: this._split(node) };
    }
    return {};
  }

  insert(value) {
    validateKey(value);
    this.steps = [];

    if (!this.root) {
      this.root = this._newNode([value]);
      this._record(
        'create-root',
        `The tree is empty. Create a leaf root containing ${value}.`,
        'insert',
        [this.root.id],
        { msgKey: 'catalog:btree.steps.rootCreated', msgParams: { value } },
      );
      return { inserted: true, steps: this.steps };
    }

    const result = this._insertRecursive(this.root, value);
    if (result.duplicate) return { inserted: false, steps: this.steps };

    if (result.split) {
      const oldRoot = this.root;
      this.root = this._newNode([result.split.promotedKey], [oldRoot, result.split.right]);
      this._record(
        'split-root',
        `The root split. Create a new root with ${result.split.promotedKey}; the tree gains a level.`,
        'root-split',
        [this.root.id, oldRoot.id, result.split.right.id],
        {
          promotedKey: result.split.promotedKey,
          msgKey: 'catalog:btree.steps.rootSplit',
          msgParams: { key: result.split.promotedKey },
          key: result.split.promotedKey,
        },
      );
    }

    this._record(
      'insert-complete',
      `Inserted ${value}. Every node is back within the B-Tree key limits.`,
      'complete',
      [],
      { msgKey: 'catalog:btree.steps.insertComplete', msgParams: { value } },
    );
    return { inserted: true, steps: this.steps };
  }

  search(value) {
    validateKey(value);
    this.steps = [];
    let node = this.root;

    if (!node) {
      this._record(
        'empty',
        'The tree is empty, so the key cannot be present.',
        'not-found',
        [],
        { msgKey: 'catalog:btree.steps.notFoundEmpty', msgParams: { value } },
      );
      return { found: false, steps: this.steps };
    }

    while (node) {
      let index = 0;
      while (index < node.keys.length && value > node.keys[index]) index += 1;
      this._record(
        'visit',
        `Inspect [${node.keys.join(', ')}] for ${value}.`,
        'visit',
        [node.id],
        { msgKey: 'catalog:btree.steps.visitSearch', msgParams: { value, keys: node.keys.join(', ') } },
      );
      if (node.keys[index] === value) {
        this._record(
          'found',
          `Found ${value} in this node.`,
          'found',
          [node.id],
          { msgKey: 'catalog:btree.steps.found', msgParams: { value }, key: value },
        );
        return { found: true, steps: this.steps };
      }
      if (node.children.length === 0) break;
      this._record(
        'child-select',
        `The key is not in this node. Follow child ${index + 1} to continue the search.`,
        'visit',
        [node.id, node.children[index].id],
        {
          msgKey: 'catalog:btree.steps.childSelected',
          msgParams: { child: index + 1 },
          childId: node.children[index].id,
        },
      );
      node = node.children[index];
    }

    this._record(
      'not-found',
      `${value} is not in the B-Tree.`,
      'not-found',
      [],
      { msgKey: 'catalog:btree.steps.notFound', msgParams: { value } },
    );
    return { found: false, steps: this.steps };
  }

  _getPredecessor(node) {
    let current = node;
    while (current.children.length) current = current.children[current.children.length - 1];
    return current.keys[current.keys.length - 1];
  }

  _borrowFromLeft(parent, index) {
    const child = parent.children[index];
    const left = parent.children[index - 1];
    child.keys.unshift(parent.keys[index - 1]);
    parent.keys[index - 1] = left.keys.pop();
    if (left.children.length) child.children.unshift(left.children.pop());

    this._record(
      'borrow-left',
      `Borrow from the left sibling: move ${parent.keys[index - 1]} up and rotate the parent key down into the underfull node.`,
      'borrow',
      [parent.id, left.id, child.id],
      { msgKey: 'catalog:btree.steps.borrowLeft' },
    );
  }

  _borrowFromRight(parent, index) {
    const child = parent.children[index];
    const right = parent.children[index + 1];
    child.keys.push(parent.keys[index]);
    parent.keys[index] = right.keys.shift();
    if (right.children.length) child.children.push(right.children.shift());

    this._record(
      'borrow-right',
      `Borrow from the right sibling: move ${parent.keys[index]} up and rotate the parent key down into the underfull node.`,
      'borrow',
      [parent.id, child.id, right.id],
      { msgKey: 'catalog:btree.steps.borrowRight' },
    );
  }

  _mergeChildren(parent, index) {
    const left = parent.children[index];
    const right = parent.children[index + 1];
    const separator = parent.keys[index];
    left.keys.push(separator, ...right.keys);
    if (right.children.length) left.children.push(...right.children);
    parent.keys.splice(index, 1);
    parent.children.splice(index + 1, 1);

    this._record(
      'merge',
      `Merge the siblings with separator ${left.keys[left.keys.length - right.keys.length - 1]} into one node.`,
      'merge',
      [parent.id, left.id, right.id],
      { msgKey: 'catalog:btree.steps.merge', msgParams: { key: separator } },
    );
  }

  _fixChild(parent, index) {
    const child = parent.children[index];
    if (!child || child.keys.length >= this.minKeys) return;

    this._record(
      'underflow',
      `This child has fewer than ${this.minKeys} key. Check adjacent siblings for a key to borrow.`,
      'underflow',
      [parent.id, child.id],
      { msgKey: 'catalog:btree.steps.underflow', msgParams: { min: this.minKeys } },
    );

    if (index > 0 && parent.children[index - 1].keys.length > this.minKeys) {
      this._borrowFromLeft(parent, index);
    } else if (
      index < parent.keys.length
      && parent.children[index + 1].keys.length > this.minKeys
    ) {
      this._borrowFromRight(parent, index);
    } else if (index > 0) {
      this._mergeChildren(parent, index - 1);
    } else if (parent.children[index + 1]) {
      this._mergeChildren(parent, index);
    }
  }

  _deleteRecursive(node, value) {
    let index = 0;
    while (index < node.keys.length && node.keys[index] < value) index += 1;
    const found = node.keys[index] === value;
    this._record(
      'visit',
      `Search for ${value} in [${node.keys.join(', ')}].`,
      'visit',
      [node.id],
      { msgKey: 'catalog:btree.steps.visitDelete', msgParams: { value, keys: node.keys.join(', ') } },
    );

    if (node.children.length === 0) {
      if (!found) {
        this._record(
          'not-found',
          `${value} is not in the B-Tree; nothing was deleted.`,
          'not-found',
          [],
          { msgKey: 'catalog:btree.steps.notFound', msgParams: { value } },
        );
        return false;
      }
      node.keys.splice(index, 1);
      this._record(
        'delete-leaf',
        `Remove ${value} from the leaf.`,
        'delete',
        [node.id],
        { msgKey: 'catalog:btree.steps.deleteLeaf', msgParams: { value }, key: value },
      );
      return true;
    }

    let deleted;
    if (found) {
      const predecessor = this._getPredecessor(node.children[index]);
      this._record(
        'find-predecessor',
        `${value} is inside an internal node. Find its predecessor, ${predecessor}, in the left subtree.`,
        'predecessor',
        [node.id, node.children[index].id],
        {
          predecessor,
          msgKey: 'catalog:btree.steps.findPredecessor',
          msgParams: { value, predecessor },
        },
      );
      node.keys[index] = predecessor;
      this._record(
        'replace-predecessor',
        `Replace ${value} with its predecessor ${predecessor}, then remove the predecessor from the leaf.`,
        'predecessor',
        [node.id],
        {
          predecessor,
          msgKey: 'catalog:btree.steps.replacePredecessor',
          msgParams: { value, predecessor },
          key: predecessor,
        },
      );
      deleted = this._deleteRecursive(node.children[index], predecessor);
    } else {
      if (node.children[index]) {
        this._record(
          'child-select',
          `The key is not in this node. Continue through child ${index + 1}.`,
          'visit',
          [node.id, node.children[index].id],
          {
            msgKey: 'catalog:btree.steps.childSelected',
            msgParams: { child: index + 1 },
            childId: node.children[index].id,
          },
        );
      }
      deleted = this._deleteRecursive(node.children[index], value);
    }

    this._fixChild(node, index);
    return deleted;
  }

  delete(value) {
    validateKey(value);
    this.steps = [];

    if (!this.root) {
      this._record(
        'empty',
        'The tree is empty, so there is nothing to delete.',
        'not-found',
        [],
        { msgKey: 'catalog:btree.steps.notFoundEmpty', msgParams: { value } },
      );
      return { deleted: false, steps: this.steps };
    }

    const deleted = this._deleteRecursive(this.root, value);
    if (!deleted) return { deleted: false, steps: this.steps };

    if (this.root.keys.length === 0) {
      const oldRoot = this.root;
      this.root = oldRoot.children[0] ?? null;
      this._record(
        'shrink-root',
        this.root
          ? 'The root became empty. Its only child becomes the new root, reducing the tree height.'
          : 'The last key was deleted. The tree is now empty.',
        'root-shrink',
        this.root ? [this.root.id] : [],
        {
          msgKey: this.root ? 'catalog:btree.steps.shrinkRoot' : 'catalog:btree.steps.shrinkEmpty',
        },
      );
    }

    this._record(
      'delete-complete',
      `Deleted ${value}. The B-Tree key limits are restored.`,
      'complete',
      [],
      { msgKey: 'catalog:btree.steps.deleteComplete', msgParams: { value } },
    );
    return { deleted: true, steps: this.steps };
  }
}
