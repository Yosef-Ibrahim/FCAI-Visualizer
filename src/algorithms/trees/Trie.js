function validateWord(word, allowEmpty = false) {
  if (typeof word !== 'string' || (!allowEmpty && word.length === 0) || /\s/u.test(word)) {
    throw new TypeError('Trie words must be non-empty strings without whitespace.');
  }
}

function snapshotNode(node, depth, nodes, edges) {
  nodes.push({
    id: node.id,
    character: node.character,
    prefix: node.prefix,
    terminal: node.terminal,
    depth,
  });

  for (const child of node.children.values()) {
    edges.push({
      id: `${node.id}:${child.id}`,
      fromId: node.id,
      toId: child.id,
    });
    snapshotNode(child, depth + 1, nodes, edges);
  }
}

export class Trie {
  constructor() {
    this.root = {
      id: 'root',
      character: '',
      prefix: '',
      terminal: false,
      children: new Map(),
    };
    this.nextId = 1;
    this.words = new Set();
  }

  getSnapshot() {
    const nodes = [];
    const edges = [];
    snapshotNode(this.root, 0, nodes, edges);
    const alphabet = [...new Set(nodes.map((node) => node.character).filter(Boolean))]
      .sort((a, b) => a.localeCompare(b));
    return {
      nodes,
      edges,
      words: [...this.words],
      alphabet,
      alphabetSize: alphabet.length,
    };
  }

  _record(steps, kind, word, details = {}) {
    const snapshot = this.getSnapshot();
    const messages = {
      start: `Start inserting “${word}” from the root.`,
      create: `Create a node for “${details.character}” to extend the prefix “${details.prefix}”.`,
      follow: `The “${details.character}” edge already exists; follow it to “${details.prefix}”.`,
      markEnd: `Mark “${word}” as a complete word.`,
      duplicate: `“${word}” is already stored in the trie.`,
      searchStart: `Start searching for “${word}” from the root.`,
      searchFollow: `Follow “${details.character}” to the prefix “${details.prefix}”.`,
      found: `“${word}” is stored as a complete word.`,
      notFound: `“${word}” is not stored as a complete word.`,
      deleteStart: `Start deleting “${word}” from the root.`,
      unmark: `Remove the complete-word marker from “${word}”; keep its shared prefix nodes.`,
      prune: `Remove the unused “${details.character}” node; no stored word needs this branch.`,
      deleted: `“${word}” has been deleted from the trie.`,
    };
    steps.push({
      kind,
      word,
      operation: details.operation ?? 'insert',
      currentNodeId: details.currentNodeId ?? this.root.id,
      activeEdgeId: details.activeEdgeId ?? null,
      focusPath: details.focusPath ?? [this.root.id],
      character: details.character,
      prefix: details.prefix ?? '',
      msgKey: `trie.steps.${kind}`,
      msg: messages[kind],
      msgParams: {
        word,
        character: details.character,
        prefix: details.prefix,
        operation: details.operation ?? 'insert',
      },
      snapshot,
    });
  }

  insert(word) {
    validateWord(word);
    const characters = Array.from(word);
    const steps = [];
    const focusPath = [this.root.id];
    let node = this.root;
    let prefix = '';

    this._record(steps, 'start', word, { focusPath });
    for (const character of characters) {
      prefix += character;
      let child = node.children.get(character);
      const created = !child;
      if (!child) {
        child = {
          id: `node-${this.nextId++}`,
          character,
          prefix,
          terminal: false,
          children: new Map(),
        };
        node.children.set(character, child);
      }

      focusPath.push(child.id);
      this._record(steps, created ? 'create' : 'follow', word, {
        currentNodeId: child.id,
        activeEdgeId: `${node.id}:${child.id}`,
        focusPath: [...focusPath],
        character,
        prefix,
      });
      node = child;
    }

    if (node.terminal) {
      this._record(steps, 'duplicate', word, {
        currentNodeId: node.id,
        focusPath: [...focusPath],
        prefix,
      });
      return { inserted: false, steps };
    }

    node.terminal = true;
    this.words.add(word);
    this._record(steps, 'markEnd', word, {
      currentNodeId: node.id,
      focusPath: [...focusPath],
      prefix,
    });
    return { inserted: true, steps };
  }

  search(word) {
    validateWord(word);
    let node = this.root;
    for (const character of Array.from(word)) {
      node = node.children.get(character);
      if (!node) return false;
    }
    return node.terminal;
  }

  searchWithSteps(word) {
    validateWord(word);
    let node = this.root;
    const steps = [];
    const focusPath = [this.root.id];
    let prefix = '';

    this._record(steps, 'searchStart', word, { operation: 'search', focusPath });
    for (const character of Array.from(word)) {
      prefix += character;
      const child = node.children.get(character);
      if (!child) {
        this._record(steps, 'notFound', word, {
          operation: 'search',
          currentNodeId: node.id,
          focusPath: [...focusPath],
          character,
          prefix,
        });
        return { found: false, steps };
      }

      node = child;
      focusPath.push(node.id);
      this._record(steps, 'searchFollow', word, {
        operation: 'search',
        currentNodeId: node.id,
        activeEdgeId: `${focusPath.at(-2)}:${node.id}`,
        focusPath: [...focusPath],
        character,
        prefix,
      });
    }

    this._record(steps, node.terminal ? 'found' : 'notFound', word, {
      operation: 'search',
      currentNodeId: node.id,
      focusPath,
      prefix,
    });
    return { found: node.terminal, steps };
  }

  delete(word) {
    validateWord(word);
    const steps = [];
    const nodes = [this.root];
    const characters = Array.from(word);
    const focusPath = [this.root.id];
    let node = this.root;
    let prefix = '';

    this._record(steps, 'deleteStart', word, { operation: 'delete', focusPath });
    for (const character of characters) {
      prefix += character;
      const child = node.children.get(character);
      if (!child) {
        this._record(steps, 'notFound', word, {
          operation: 'delete',
          currentNodeId: node.id,
          focusPath: [...focusPath],
          character,
          prefix,
        });
        return { deleted: false, steps };
      }

      node = child;
      nodes.push(node);
      focusPath.push(node.id);
      this._record(steps, 'searchFollow', word, {
        operation: 'delete',
        currentNodeId: node.id,
        activeEdgeId: `${focusPath.at(-2)}:${node.id}`,
        focusPath: [...focusPath],
        character,
        prefix,
      });
    }

    if (!node.terminal) {
      this._record(steps, 'notFound', word, {
        operation: 'delete',
        currentNodeId: node.id,
        focusPath: [...focusPath],
        prefix,
      });
      return { deleted: false, steps };
    }

    node.terminal = false;
    this.words.delete(word);
    this._record(steps, 'unmark', word, {
      operation: 'delete',
      currentNodeId: node.id,
      focusPath: [...focusPath],
      prefix,
    });

    for (let index = nodes.length - 1; index > 0; index -= 1) {
      const current = nodes[index];
      if (current.terminal || current.children.size > 0) break;

      const parent = nodes[index - 1];
      parent.children.delete(current.character);
      this._record(steps, 'prune', word, {
        operation: 'delete',
        currentNodeId: parent.id,
        activeEdgeId: `${parent.id}:${current.id}`,
        focusPath: nodes.slice(0, index).map((pathNode) => pathNode.id),
        character: current.character,
        prefix: parent.prefix,
      });
    }

    this._record(steps, 'deleted', word, {
      operation: 'delete',
      currentNodeId: nodes[Math.max(0, nodes.length - 1)].id,
      focusPath: [this.root.id],
      prefix: '',
    });
    return { deleted: true, steps };
  }

  startsWith(prefix) {
    validateWord(prefix, true);
    let node = this.root;
    for (const character of Array.from(prefix)) {
      node = node.children.get(character);
      if (!node) return false;
    }
    return true;
  }
}
