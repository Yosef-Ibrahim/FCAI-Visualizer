const LANGUAGE_KEYS = ['js', 'python', 'cpp', 'csharp', 'java'];

const implementations = {
  btree: {
    js: `class Node {
  constructor() { this.keys = []; this.children = []; }
}
class BTree {
  constructor(order = 3) { this.order = order; this.maxKeys = order - 1; this.minKeys = Math.floor((order - 1) / 2); this.root = new Node(); }
  search(key, node = this.root) {
    let i = 0;
    while (i < node.keys.length && key > node.keys[i]) i++;
    if (node.keys[i] === key) return true;
    return node.children.length ? this.search(key, node.children[i]) : false;
  }
  splitChild(parent, index) {
    const full = parent.children[index], right = new Node();
    const middleIndex = Math.floor(full.keys.length / 2);
    right.keys = full.keys.splice(middleIndex + 1); const middle = full.keys.pop();
    if (full.children.length) right.children = full.children.splice(middleIndex + 1);
    parent.keys.splice(index, 0, middle); parent.children.splice(index + 1, 0, right);
  }
  insert(key) {
    if (this.search(key)) return;
    this.insertNonFull(this.root, key);
    if (this.root.keys.length > this.maxKeys) {
      const oldRoot = this.root; this.root = new Node(); this.root.children.push(oldRoot); this.splitChild(this.root, 0);
    }
  }
  insertNonFull(node, key) {
    let i = 0;
    while (i < node.keys.length && key > node.keys[i]) i++;
    if (!node.children.length) {
      node.keys.splice(i, 0, key); return;
    }
    this.insertNonFull(node.children[i], key);
    if (node.children[i].keys.length > this.maxKeys) this.splitChild(node, i);
  }
  traverse(node = this.root, out = []) {
    for (let i = 0; i < node.keys.length; i++) {
      if (node.children.length) this.traverse(node.children[i], out);
      out.push(node.keys[i]);
    }
    if (node.children.length) this.traverse(node.children.at(-1), out);
    return out;
  }
  predecessor(node) { while (node.children.length) node = node.children.at(-1); return node.keys.at(-1); }
  fixChild(parent, i) {
    const child = parent.children[i], minKeys = this.minKeys;
    if (child.keys.length >= minKeys) return;
    if (i > 0 && parent.children[i - 1].keys.length > minKeys) {
      const left = parent.children[i - 1];
      child.keys.unshift(parent.keys[i - 1]); parent.keys[i - 1] = left.keys.pop();
      if (left.children.length) child.children.unshift(left.children.pop());
    } else if (i + 1 < parent.children.length && parent.children[i + 1].keys.length > minKeys) {
      const right = parent.children[i + 1];
      child.keys.push(parent.keys[i]); parent.keys[i] = right.keys.shift();
      if (right.children.length) child.children.push(right.children.shift());
    } else if (i > 0) {
      const left = parent.children[i - 1];
      left.keys.push(parent.keys[i - 1], ...child.keys); left.children.push(...child.children);
      parent.keys.splice(i - 1, 1); parent.children.splice(i, 1);
    } else {
      const right = parent.children[i + 1];
      child.keys.push(parent.keys[i], ...right.keys); child.children.push(...right.children);
      parent.keys.splice(i, 1); parent.children.splice(i + 1, 1);
    }
  }
  removeFrom(node, key) {
    let i = 0;
    while (i < node.keys.length && node.keys[i] < key) i++;
    if (node.keys[i] === key) {
      if (!node.children.length) { node.keys.splice(i, 1); return true; }
      const predecessor = this.predecessor(node.children[i]);
      node.keys[i] = predecessor;
      const removed = this.removeFrom(node.children[i], predecessor);
      this.fixChild(node, i);
      return removed;
    }
    if (!node.children.length) return false;
    const removed = this.removeFrom(node.children[i], key);
    if (removed) this.fixChild(node, i);
    return removed;
  }
  delete(key) {
    if (!this.search(key)) return false;
    const removed = this.removeFrom(this.root, key);
    if (this.root.keys.length === 0) this.root = this.root.children[0] ?? new Node();
    return removed;
  }
}`,
    python: `class Node:
    def __init__(self):
        self.keys, self.children = [], []
class BTree:
    def __init__(self, order=3):
        self.order, self.max_keys = order, order - 1
        self.min_keys, self.root = (order - 1) // 2, Node()
    def search(self, key, node=None):
        node = node or self.root
        i = 0
        while i < len(node.keys) and key > node.keys[i]: i += 1
        if i < len(node.keys) and node.keys[i] == key: return True
        return self.search(key, node.children[i]) if node.children else False
    def splitChild(self, parent, i):
        full, right = parent.children[i], Node()
        middle_index = len(full.keys) // 2
        middle = full.keys[middle_index]
        right.keys, full.keys = full.keys[middle_index + 1:], full.keys[:middle_index]
        if full.children: right.children, full.children = full.children[middle_index + 1:], full.children[:middle_index + 1]
        parent.keys.insert(i, middle); parent.children.insert(i + 1, right)
    def insert(self, key):
        if self.search(key): return
        self.insertNonFull(self.root, key)
        if len(self.root.keys) > self.max_keys:
            old = self.root; self.root = Node(); self.root.children = [old]; self.splitChild(self.root, 0)
    def insertNonFull(self, node, key):
        i = 0
        while i < len(node.keys) and key > node.keys[i]: i += 1
        if not node.children:
            node.keys.insert(i, key); return
        self.insertNonFull(node.children[i], key)
        if len(node.children[i].keys) > self.max_keys: self.splitChild(node, i)
    def traverse(self, node=None, out=None):
        node, out = (self.root if node is None else node), ([] if out is None else out)
        for i, key in enumerate(node.keys):
            if node.children: self.traverse(node.children[i], out)
            out.append(key)
        if node.children: self.traverse(node.children[-1], out)
        return out
    def predecessor(self, node):
        while node.children: node = node.children[-1]
        return node.keys[-1]
    def fix_child(self, parent, i):
        child, minimum = parent.children[i], self.min_keys
        if len(child.keys) >= minimum: return
        if i > 0 and len(parent.children[i - 1].keys) > minimum:
            left = parent.children[i - 1]
            child.keys.insert(0, parent.keys[i - 1]); parent.keys[i - 1] = left.keys.pop()
            if left.children: child.children.insert(0, left.children.pop())
        elif i + 1 < len(parent.children) and len(parent.children[i + 1].keys) > minimum:
            right = parent.children[i + 1]
            child.keys.append(parent.keys[i]); parent.keys[i] = right.keys.pop(0)
            if right.children: child.children.append(right.children.pop(0))
        elif i > 0:
            left = parent.children[i - 1]
            left.keys.extend([parent.keys[i - 1]] + child.keys); left.children.extend(child.children)
            parent.keys.pop(i - 1); parent.children.pop(i)
        else:
            right = parent.children[i + 1]
            child.keys.extend([parent.keys[i]] + right.keys); child.children.extend(right.children)
            parent.keys.pop(i); parent.children.pop(i + 1)
    def remove_from(self, node, key):
        i = 0
        while i < len(node.keys) and node.keys[i] < key: i += 1
        if i < len(node.keys) and node.keys[i] == key:
            if not node.children: node.keys.pop(i); return True
            predecessor = self.predecessor(node.children[i])
            node.keys[i] = predecessor
            removed = self.remove_from(node.children[i], predecessor)
            self.fix_child(node, i)
            return removed
        if not node.children: return False
        removed = self.remove_from(node.children[i], key)
        if removed: self.fix_child(node, i)
        return removed
    def delete(self, key):
        if not self.search(key): return False
        removed = self.remove_from(self.root, key)
        if not self.root.keys: self.root = self.root.children[0] if self.root.children else Node()
        return removed`,
    cpp: `#include <algorithm>
#include <vector>
struct Node { std::vector<int> keys; std::vector<Node*> children; };
class BTree {
  int order, maxKeys, minKeys; Node* root;
  bool searchNode(Node* n, int k) {
    int i = 0; while (i < (int)n->keys.size() && k > n->keys[i]) ++i;
    if (i < (int)n->keys.size() && n->keys[i] == k) return true;
    return !n->children.empty() && searchNode(n->children[i], k);
  }
  void splitChild(Node* p, int i) {
    Node* y = p->children[i]; Node* z = new Node();
    int middle = (int)y->keys.size() / 2, mid = y->keys[middle];
    z->keys.assign(y->keys.begin() + middle + 1, y->keys.end()); y->keys.resize(middle);
    if (!y->children.empty()) { z->children.assign(y->children.begin() + middle + 1, y->children.end()); y->children.resize(middle + 1); }
    p->keys.insert(p->keys.begin() + i, mid); p->children.insert(p->children.begin() + i + 1, z);
  }
  void insertNonFull(Node* n, int k) {
    int i = 0; while (i < (int)n->keys.size() && k > n->keys[i]) ++i;
    if (n->children.empty()) { n->keys.insert(n->keys.begin() + i, k); return; }
    insertNonFull(n->children[i], k);
    if ((int)n->children[i]->keys.size() > maxKeys) splitChild(n, i);
  }
  void collect(Node* n, std::vector<int>& out) { for (int i = 0; i < (int)n->keys.size(); ++i) { if (!n->children.empty()) collect(n->children[i], out); out.push_back(n->keys[i]); } if (!n->children.empty()) collect(n->children.back(), out); }
  int predecessor(Node* n) { while (!n->children.empty()) n = n->children.back(); return n->keys.back(); }
  void fixChild(Node* p, int i) {
    Node* c = p->children[i]; int minimum = minKeys;
    if ((int)c->keys.size() >= minimum) return;
    if (i > 0 && (int)p->children[i - 1]->keys.size() > minimum) {
      Node* left = p->children[i - 1]; c->keys.insert(c->keys.begin(), p->keys[i - 1]); p->keys[i - 1] = left->keys.back(); left->keys.pop_back();
      if (!left->children.empty()) { c->children.insert(c->children.begin(), left->children.back()); left->children.pop_back(); }
    } else if (i + 1 < (int)p->children.size() && (int)p->children[i + 1]->keys.size() > minimum) {
      Node* right = p->children[i + 1]; c->keys.push_back(p->keys[i]); p->keys[i] = right->keys.front(); right->keys.erase(right->keys.begin());
      if (!right->children.empty()) { c->children.push_back(right->children.front()); right->children.erase(right->children.begin()); }
    } else if (i > 0) {
      Node* left = p->children[i - 1]; left->keys.push_back(p->keys[i - 1]); left->keys.insert(left->keys.end(), c->keys.begin(), c->keys.end()); left->children.insert(left->children.end(), c->children.begin(), c->children.end());
      p->keys.erase(p->keys.begin() + i - 1); p->children.erase(p->children.begin() + i);
    } else {
      Node* right = p->children[i + 1]; c->keys.push_back(p->keys[i]); c->keys.insert(c->keys.end(), right->keys.begin(), right->keys.end()); c->children.insert(c->children.end(), right->children.begin(), right->children.end());
      p->keys.erase(p->keys.begin() + i); p->children.erase(p->children.begin() + i + 1);
    }
  }
  bool removeFrom(Node* n, int k) {
    int i = 0; while (i < (int)n->keys.size() && n->keys[i] < k) ++i;
    if (i < (int)n->keys.size() && n->keys[i] == k) {
      if (n->children.empty()) { n->keys.erase(n->keys.begin() + i); return true; }
      int prev = predecessor(n->children[i]); n->keys[i] = prev; bool removed = removeFrom(n->children[i], prev); fixChild(n, i); return removed;
    }
    if (n->children.empty()) return false;
    bool removed = removeFrom(n->children[i], k); if (removed) fixChild(n, i); return removed;
  }
public:
  explicit BTree(int maxChildren = 3) : order(maxChildren), maxKeys(maxChildren - 1), minKeys((maxChildren - 1) / 2), root(new Node()) {}
  bool search(int k) { return searchNode(root, k); }
  void insert(int k) { if (search(k)) return; insertNonFull(root, k); if ((int)root->keys.size() > maxKeys) { Node* old = root; root = new Node(); root->children.push_back(old); splitChild(root, 0); } }
  bool erase(int k) { if (!search(k)) return false; bool removed = removeFrom(root, k); if (root->keys.empty()) root = root->children.empty() ? new Node() : root->children[0]; return removed; }
};`,
    csharp: `using System.Collections.Generic;
public class BTree {
  public class Node { public List<int> keys = new(); public List<Node> children = new(); }
  private int order, maxKeys, minKeys; private Node root = new();
  public BTree(int maxChildren = 3) { order = maxChildren; maxKeys = maxChildren - 1; minKeys = (maxChildren - 1) / 2; }
  public bool Search(int key, Node node = null) {
    node ??= root; int i = 0;
    while (i < node.keys.Count && key > node.keys[i]) i++;
    if (i < node.keys.Count && node.keys[i] == key) return true;
    return node.children.Count > 0 && Search(key, node.children[i]);
  }
  private void SplitChild(Node parent, int i) {
    Node full = parent.children[i], right = new(); int middleIndex = full.keys.Count / 2, middle = full.keys[middleIndex];
    right.keys.AddRange(full.keys.GetRange(middleIndex + 1, full.keys.Count - middleIndex - 1)); full.keys.RemoveRange(middleIndex, full.keys.Count - middleIndex);
    if (full.children.Count > 0) { right.children.AddRange(full.children.GetRange(middleIndex + 1, full.children.Count - middleIndex - 1)); full.children.RemoveRange(middleIndex + 1, full.children.Count - middleIndex - 1); }
    parent.keys.Insert(i, middle); parent.children.Insert(i + 1, right);
  }
  public void Insert(int key) {
    if (Search(key)) return;
    InsertNonFull(root, key);
    if (root.keys.Count > maxKeys) { Node old = root; root = new(); root.children.Add(old); SplitChild(root, 0); }
  }
  private void InsertNonFull(Node node, int key) {
    int i = 0; while (i < node.keys.Count && key > node.keys[i]) i++;
    if (node.children.Count == 0) { node.keys.Insert(i, key); return; }
    InsertNonFull(node.children[i], key);
    if (node.children[i].keys.Count > maxKeys) SplitChild(node, i);
  }
  private int Predecessor(Node node) { while (node.children.Count > 0) node = node.children[^1]; return node.keys[^1]; }
  private void FixChild(Node parent, int i) {
    Node child = parent.children[i]; int minimum = minKeys;
    if (child.keys.Count >= minimum) return;
    if (i > 0 && parent.children[i - 1].keys.Count > minimum) {
      Node left = parent.children[i - 1]; child.keys.Insert(0, parent.keys[i - 1]); parent.keys[i - 1] = left.keys[^1]; left.keys.RemoveAt(left.keys.Count - 1);
      if (left.children.Count > 0) { child.children.Insert(0, left.children[^1]); left.children.RemoveAt(left.children.Count - 1); }
    } else if (i + 1 < parent.children.Count && parent.children[i + 1].keys.Count > minimum) {
      Node right = parent.children[i + 1]; child.keys.Add(parent.keys[i]); parent.keys[i] = right.keys[0]; right.keys.RemoveAt(0);
      if (right.children.Count > 0) { child.children.Add(right.children[0]); right.children.RemoveAt(0); }
    } else if (i > 0) {
      Node left = parent.children[i - 1]; left.keys.Add(parent.keys[i - 1]); left.keys.AddRange(child.keys); left.children.AddRange(child.children);
      parent.keys.RemoveAt(i - 1); parent.children.RemoveAt(i);
    } else {
      Node right = parent.children[i + 1]; child.keys.Add(parent.keys[i]); child.keys.AddRange(right.keys); child.children.AddRange(right.children);
      parent.keys.RemoveAt(i); parent.children.RemoveAt(i + 1);
    }
  }
  private bool RemoveFrom(Node node, int key) {
    int i = 0; while (i < node.keys.Count && node.keys[i] < key) i++;
    if (i < node.keys.Count && node.keys[i] == key) {
      if (node.children.Count == 0) { node.keys.RemoveAt(i); return true; }
      int predecessor = Predecessor(node.children[i]); node.keys[i] = predecessor;
      bool removed = RemoveFrom(node.children[i], predecessor); FixChild(node, i); return removed;
    }
    if (node.children.Count == 0) return false;
    bool result = RemoveFrom(node.children[i], key); if (result) FixChild(node, i); return result;
  }
  public bool Delete(int key) {
    if (!Search(key)) return false;
    bool removed = RemoveFrom(root, key);
    if (root.keys.Count == 0) root = root.children.Count == 0 ? new Node() : root.children[0];
    return removed;
  }
  private void Collect(Node n, List<int> o) { for (int i = 0; i < n.keys.Count; i++) { if (n.children.Count > 0) Collect(n.children[i], o); o.Add(n.keys[i]); } if (n.children.Count > 0) Collect(n.children[^1], o); }
}`,
    java: `import java.util.*;
class BTree {
  static class Node { List<Integer> keys = new ArrayList<>(); List<Node> children = new ArrayList<>(); }
  private final int order, maxKeys, minKeys; private Node root = new Node();
  BTree(int maxChildren) { order = maxChildren; maxKeys = maxChildren - 1; minKeys = (maxChildren - 1) / 2; }
  boolean search(int key, Node n) {
    int i = 0; while (i < n.keys.size() && key > n.keys.get(i)) i++;
    if (i < n.keys.size() && n.keys.get(i) == key) return true;
    return !n.children.isEmpty() && search(key, n.children.get(i));
  }
  private void splitChild(Node p, int i) {
    Node y = p.children.get(i), z = new Node(); int middle = y.keys.size() / 2, mid = y.keys.get(middle);
    z.keys.addAll(y.keys.subList(middle + 1, y.keys.size())); y.keys.subList(middle, y.keys.size()).clear();
    if (!y.children.isEmpty()) { z.children.addAll(y.children.subList(middle + 1, y.children.size())); y.children.subList(middle + 1, y.children.size()).clear(); }
    p.keys.add(i, mid); p.children.add(i + 1, z);
  }
  void insert(int key) {
    if (search(key, root)) return;
    insertNonFull(root, key);
    if (root.keys.size() > maxKeys) { Node old = root; root = new Node(); root.children.add(old); splitChild(root, 0); }
  }
  private void insertNonFull(Node n, int k) {
    int i = 0; while (i < n.keys.size() && k > n.keys.get(i)) i++;
    if (n.children.isEmpty()) { n.keys.add(i, k); return; }
    insertNonFull(n.children.get(i), k);
    if (n.children.get(i).keys.size() > maxKeys) splitChild(n, i);
  }
  private int predecessor(Node n) { while (!n.children.isEmpty()) n = n.children.get(n.children.size() - 1); return n.keys.get(n.keys.size() - 1); }
  private void fixChild(Node p, int i) {
    Node c = p.children.get(i); int minimum = minKeys;
    if (c.keys.size() >= minimum) return;
    if (i > 0 && p.children.get(i - 1).keys.size() > minimum) {
      Node left = p.children.get(i - 1); c.keys.add(0, p.keys.get(i - 1)); p.keys.set(i - 1, left.keys.remove(left.keys.size() - 1));
      if (!left.children.isEmpty()) c.children.add(0, left.children.remove(left.children.size() - 1));
    } else if (i + 1 < p.children.size() && p.children.get(i + 1).keys.size() > minimum) {
      Node right = p.children.get(i + 1); c.keys.add(p.keys.get(i)); p.keys.set(i, right.keys.remove(0));
      if (!right.children.isEmpty()) c.children.add(right.children.remove(0));
    } else if (i > 0) {
      Node left = p.children.get(i - 1); left.keys.add(p.keys.get(i - 1)); left.keys.addAll(c.keys); left.children.addAll(c.children);
      p.keys.remove(i - 1); p.children.remove(i);
    } else {
      Node right = p.children.get(i + 1); c.keys.add(p.keys.get(i)); c.keys.addAll(right.keys); c.children.addAll(right.children);
      p.keys.remove(i); p.children.remove(i + 1);
    }
  }
  private boolean removeFrom(Node n, int k) {
    int i = 0; while (i < n.keys.size() && n.keys.get(i) < k) i++;
    if (i < n.keys.size() && n.keys.get(i) == k) {
      if (n.children.isEmpty()) { n.keys.remove(i); return true; }
      int prev = predecessor(n.children.get(i)); n.keys.set(i, prev);
      boolean removed = removeFrom(n.children.get(i), prev); fixChild(n, i); return removed;
    }
    if (n.children.isEmpty()) return false;
    boolean removed = removeFrom(n.children.get(i), k); if (removed) fixChild(n, i); return removed;
  }
  boolean delete(int key) { if (!search(key, root)) return false; boolean removed = removeFrom(root, key); if (root.keys.isEmpty()) root = root.children.isEmpty() ? new Node() : root.children.get(0); return removed; }
  private void collect(Node n, List<Integer> out) { for (int i = 0; i < n.keys.size(); i++) { if (!n.children.isEmpty()) collect(n.children.get(i), out); out.add(n.keys.get(i)); } if (!n.children.isEmpty()) collect(n.children.get(n.children.size() - 1), out); }
}`,
  },
  trie: {
    js: `class TrieNode { constructor() { this.children = new Map(); this.end = false; } }
class Trie {
  constructor() { this.root = new TrieNode(); }
  insert(word) { let n = this.root; for (const ch of word) { if (!n.children.has(ch)) n.children.set(ch, new TrieNode()); n = n.children.get(ch); } n.end = true; }
  search(word) { let n = this.root; for (const ch of word) { n = n.children.get(ch); if (!n) return false; } return n.end; }
  startsWith(prefix) { let n = this.root; for (const ch of prefix) { n = n.children.get(ch); if (!n) return false; } return true; }
  delete(word) { const prune = (n, i) => { if (i === word.length) { if (!n.end) return false; n.end = false; return n.children.size === 0; } const ch = word[i], c = n.children.get(ch); if (!c || !prune(c, i + 1)) return false; n.children.delete(ch); return !n.end && n.children.size === 0; }; return this.search(word) && (prune(this.root, 0), true); }
}`,
    python: `class Node:
    def __init__(self): self.children, self.end = {}, False
class Trie:
    def __init__(self): self.root = Node()
    def insert(self, word):
        n = self.root
        for ch in word:
            if ch not in n.children: n.children[ch] = Node()
            n = n.children[ch]
        n.end = True
    def search(self, word):
        n = self.root
        for ch in word:
            if ch not in n.children: return False
            n = n.children[ch]
        return n.end
    def startsWith(self, prefix):
        n = self.root
        for ch in prefix:
            if ch not in n.children: return False
            n = n.children[ch]
        return True
    def delete(self, word):
        def prune(n, i):
            if i == len(word): n.end = False; return not n.children
            ch = word[i]
            if ch not in n.children or not prune(n.children[ch], i + 1): return False
            del n.children[ch]; return not n.end and not n.children
        if not self.search(word): return False
        prune(self.root, 0); return True`,
    cpp: `#include <string>
#include <unordered_map>
struct TrieNode { std::unordered_map<char, TrieNode*> next; bool end = false; };
class Trie {
  TrieNode* root = new TrieNode();
  bool prune(TrieNode* n, const std::string& w, size_t i) {
    if (i == w.size()) { n->end = false; return n->next.empty(); }
    char c = w[i]; auto it = n->next.find(c); if (it == n->next.end() || !prune(it->second, w, i + 1)) return false;
    delete it->second; n->next.erase(it); return !n->end && n->next.empty();
  }
public:
  void insert(const std::string& w) { TrieNode* n = root; for (char c : w) { if (!n->next.count(c)) n->next[c] = new TrieNode(); n = n->next[c]; } n->end = true; }
  bool search(const std::string& w) { TrieNode* n = root; for (char c : w) { if (!n->next.count(c)) return false; n = n->next[c]; } return n->end; }
  bool startsWith(const std::string& w) { TrieNode* n = root; for (char c : w) { if (!n->next.count(c)) return false; n = n->next[c]; } return true; }
  bool erase(const std::string& w) { if (!search(w)) return false; prune(root, w, 0); return true; }
};`,
    csharp: `using System.Collections.Generic;
class TrieNode { public Dictionary<char, TrieNode> children = new(); public bool end; }
class Trie {
  private TrieNode root = new();
  public void Insert(string word) { var n = root; foreach (char c in word) { if (!n.children.ContainsKey(c)) n.children[c] = new(); n = n.children[c]; } n.end = true; }
  public bool Search(string word) { var n = root; foreach (char c in word) { if (!n.children.TryGetValue(c, out n)) return false; } return n.end; }
  public bool StartsWith(string prefix) { var n = root; foreach (char c in prefix) { if (!n.children.TryGetValue(c, out n)) return false; } return true; }
  private bool Prune(TrieNode n, string w, int i) { if (i == w.Length) { n.end = false; return n.children.Count == 0; } char c = w[i]; if (!n.children.ContainsKey(c) || !Prune(n.children[c], w, i + 1)) return false; n.children.Remove(c); return !n.end && n.children.Count == 0; }
  public bool Delete(string word) { if (!Search(word)) return false; Prune(root, word, 0); return true; }
}`,
    java: `import java.util.*;
class TrieNode { Map<Character, TrieNode> children = new HashMap<>(); boolean end; }
class Trie {
  private TrieNode root = new TrieNode();
  void insert(String word) { TrieNode n = root; for (char c : word.toCharArray()) n = n.children.computeIfAbsent(c, k -> new TrieNode()); n.end = true; }
  boolean search(String word) { TrieNode n = root; for (char c : word.toCharArray()) { n = n.children.get(c); if (n == null) return false; } return n.end; }
  boolean startsWith(String prefix) { TrieNode n = root; for (char c : prefix.toCharArray()) { n = n.children.get(c); if (n == null) return false; } return true; }
  private boolean prune(TrieNode n, String w, int i) { if (i == w.length()) { n.end = false; return n.children.isEmpty(); } char c = w.charAt(i); TrieNode child = n.children.get(c); if (child == null || !prune(child, w, i + 1)) return false; n.children.remove(c); return !n.end && n.children.isEmpty(); }
  boolean delete(String word) { if (!search(word)) return false; prune(root, word, 0); return true; }
}`,
  },
  suffixTrie: {
    js: `class Node { constructor() { this.next = new Map(); this.suffix = -1; } }
class SuffixTrie {
  constructor(text) { this.text = text.endsWith('$') ? text : text + '$'; this.root = new Node(); this.build(); }
  build() { for (let start = 0; start < this.text.length; start++) { let n = this.root; for (const ch of this.text.slice(start)) { if (!n.next.has(ch)) n.next.set(ch, new Node()); n = n.next.get(ch); } n.suffix = start; } }
  search(pattern) { let n = this.root; for (const ch of pattern) { n = n.next.get(ch); if (!n) return []; } const out = []; const visit = x => { if (x.suffix >= 0) out.push(x.suffix); for (const child of x.next.values()) visit(child); }; visit(n); return out.sort((a, b) => a - b); }
}`,
    python: `class Node:
    def __init__(self): self.next, self.suffix = {}, -1
class SuffixTrie:
    def __init__(self, text):
        self.text = text if text.endswith('$') else text + '$'
        self.root = Node(); self.build()
    def build(self):
        for start in range(len(self.text)):
            node = self.root
            for ch in self.text[start:]:
                if ch not in node.next: node.next[ch] = Node()
                node = node.next[ch]
            node.suffix = start
    def search(self, pattern):
        node = self.root
        for ch in pattern:
            if ch not in node.next: return []
            node = node.next[ch]
        found = []
        def visit(n):
            if n.suffix >= 0: found.append(n.suffix)
            for child in n.next.values(): visit(child)
        visit(node); return sorted(found)`,
    cpp: `#include <algorithm>
#include <string>
#include <unordered_map>
#include <vector>
struct TrieNode { std::unordered_map<char, TrieNode*> next; int suffix = -1; };
class SuffixTrie {
  std::string text; TrieNode* root = new TrieNode();
  void collect(TrieNode* n, std::vector<int>& out) { if (n->suffix >= 0) out.push_back(n->suffix); for (auto [c, child] : n->next) collect(child, out); }
public:
  explicit SuffixTrie(std::string s) : text(s.back() == '$' ? s : s + '$') { build(); }
  void build() { for (int i = 0; i < (int)text.size(); ++i) { TrieNode* n = root; for (int j = i; j < (int)text.size(); ++j) { if (!n->next.count(text[j])) n->next[text[j]] = new TrieNode(); n = n->next[text[j]]; } n->suffix = i; } }
  std::vector<int> search(const std::string& p) { TrieNode* n = root; for (char c : p) { if (!n->next.count(c)) return {}; n = n->next[c]; } std::vector<int> out; collect(n, out); std::sort(out.begin(), out.end()); return out; }
};`,
    csharp: `using System.Collections.Generic;
class Node { public Dictionary<char, Node> next = new(); public int suffix = -1; }
class SuffixTrie {
  private string text; private Node root = new();
  public SuffixTrie(string value) { text = value.EndsWith("$") ? value : value + "$"; Build(); }
  public void Build() { for (int i = 0; i < text.Length; i++) { var n = root; for (int j = i; j < text.Length; j++) { if (!n.next.ContainsKey(text[j])) n.next[text[j]] = new(); n = n.next[text[j]]; } n.suffix = i; } }
  private void Collect(Node n, List<int> found) { if (n.suffix >= 0) found.Add(n.suffix); foreach (var child in n.next.Values) Collect(child, found); }
  public List<int> Search(string pattern) { var n = root; foreach (char c in pattern) { if (!n.next.TryGetValue(c, out n)) return new(); } var found = new List<int>(); Collect(n, found); found.Sort(); return found; }
}`,
    java: `import java.util.*;
class Node { Map<Character, Node> next = new HashMap<>(); int suffix = -1; }
class SuffixTrie {
  private String text; private Node root = new Node();
  SuffixTrie(String value) { text = value.endsWith("$") ? value : value + "$"; build(); }
  void build() { for (int i = 0; i < text.length(); i++) { Node n = root; for (int j = i; j < text.length(); j++) { char c = text.charAt(j); n = n.next.computeIfAbsent(c, k -> new Node()); } n.suffix = i; } }
  private void collect(Node n, List<Integer> out) { if (n.suffix >= 0) out.add(n.suffix); for (Node c : n.next.values()) collect(c, out); }
  List<Integer> search(String pattern) { Node n = root; for (char c : pattern.toCharArray()) { n = n.next.get(c); if (n == null) return List.of(); } List<Integer> out = new ArrayList<>(); collect(n, out); Collections.sort(out); return out; }
}`,
  },
  suffixTree: {
    js: `class Node { constructor(edge = '', suffix = -1) { this.edge = edge; this.suffix = suffix; this.children = new Map(); } }
class SuffixTree {
  constructor(text) { this.text = text.endsWith('$') ? text : text + '$'; this.root = new Node(); this.build(); }
  splitEdge(parent, key, edge, matched, suffix) {
    const split = new Node(edge.edge.slice(0, matched)), oldBranch = new Node(edge.edge.slice(matched), edge.suffix);
    oldBranch.children = edge.children; split.children.set(oldBranch.edge[0], oldBranch);
    split.children.set(suffix[matched], new Node(suffix.slice(matched), this.text.length - suffix.length)); parent.children.set(key, split);
  }
  build() {
    for (let start = 0; start < this.text.length; start++) {
      let n = this.root, rest = this.text.slice(start);
      while (rest.length) {
        const key = rest[0], edge = n.children.get(key);
        if (!edge) { n.children.set(key, new Node(rest, start)); break; }
        let k = 0; while (k < edge.edge.length && k < rest.length && edge.edge[k] === rest[k]) k++;
        if (k === edge.edge.length) { n = edge; rest = rest.slice(k); continue; }
        this.splitEdge(n, key, edge, k, rest); break;
      }
    }
  }
  search(pattern) {
    let n = this.root, rest = pattern;
    while (rest.length) {
      const edge = n.children.get(rest[0]); if (!edge) return [];
      let k = 0; while (k < edge.edge.length && k < rest.length && edge.edge[k] === rest[k]) k++;
      if (k === rest.length) { const out = []; const visit = x => { if (x.suffix >= 0) out.push(x.suffix); for (const c of x.children.values()) visit(c); }; visit(edge); return out.sort((a, b) => a - b); }
      if (k !== edge.edge.length) return [];
      rest = rest.slice(k); n = edge;
    }
    return [];
  }
}`,
    python: `class Node:
    def __init__(self, edge='', suffix=-1): self.edge, self.suffix, self.children = edge, suffix, {}
class SuffixTree:
    def __init__(self, text):
        self.text = text if text.endswith('$') else text + '$'
        self.root = Node(); self.build()
    def splitEdge(self, parent, key, edge, k, rest, start):
        split = Node(edge.edge[:k])
        old = Node(edge.edge[k:], edge.suffix); old.children = edge.children
        split.children[old.edge[0]] = old
        edge.edge = edge.edge[k:]
        split.children[rest[k]] = Node(rest[k:], start)
        parent.children[key] = split
    def build(self):
        for start in range(len(self.text)):
            node, rest = self.root, self.text[start:]
            while rest:
                key = rest[0]; edge = node.children.get(key)
                if edge is None: node.children[key] = Node(rest, start); break
                k = 0
                while k < min(len(edge.edge), len(rest)) and edge.edge[k] == rest[k]: k += 1
                if k == len(edge.edge): node, rest = edge, rest[k:]; continue
                self.splitEdge(node, key, edge, k, rest, start); break
    def search(self, pattern):
        node, rest = self.root, pattern
        while rest:
            edge = node.children.get(rest[0])
            if edge is None: return []
            k = 0
            while k < min(len(edge.edge), len(rest)) and edge.edge[k] == rest[k]: k += 1
            if k == len(rest):
                found = []
                def visit(n):
                    if n.suffix >= 0: found.append(n.suffix)
                    for child in n.children.values(): visit(child)
                visit(edge); return sorted(found)
            if k < len(edge.edge): return []
            node, rest = edge, rest[k:]
        return []`,
    cpp: `#include <algorithm>
#include <map>
#include <string>
#include <vector>
struct Node { std::string edge; int suffix; std::map<char, Node*> children; Node(std::string e = "", int s = -1) : edge(e), suffix(s) {} };
class SuffixTree {
  std::string text; Node* root = new Node();
  void collect(Node* n, std::vector<int>& out) { if (n->suffix >= 0) out.push_back(n->suffix); for (auto [c, child] : n->children) collect(child, out); }
  void splitEdge(Node* parent, char key, Node* edge, int k, const std::string& rest, int start) {
    Node* split = new Node(edge->edge.substr(0, k)); Node* old = new Node(edge->edge.substr(k), edge->suffix); old->children = edge->children; split->children[old->edge[0]] = old;
    edge->edge = edge->edge.substr(k); split->children[rest[k]] = new Node(rest.substr(k), start); parent->children[key] = split;
  }
public:
  explicit SuffixTree(std::string s) : text(s.back() == '$' ? s : s + '$') { build(); }
  void build() { for (int start = 0; start < (int)text.size(); ++start) { Node* n = root; std::string rest = text.substr(start); while (!rest.empty()) { char key = rest[0]; if (!n->children.count(key)) { n->children[key] = new Node(rest, start); break; } Node* edge = n->children[key]; int k = 0; while (k < (int)edge->edge.size() && k < (int)rest.size() && edge->edge[k] == rest[k]) ++k; if (k == (int)edge->edge.size()) { n = edge; rest = rest.substr(k); continue; } splitEdge(n, key, edge, k, rest, start); break; } } }
  std::vector<int> search(const std::string& pattern) { Node* n = root; std::string rest = pattern; while (!rest.empty()) { if (!n->children.count(rest[0])) return {}; Node* edge = n->children[rest[0]]; int k = 0; while (k < (int)edge->edge.size() && k < (int)rest.size() && edge->edge[k] == rest[k]) ++k; if (k == (int)rest.size()) { std::vector<int> out; collect(edge, out); std::sort(out.begin(), out.end()); return out; } if (k < (int)edge->edge.size()) return {}; n = edge; rest = rest.substr(k); } return {}; }
};`,
    csharp: `using System.Collections.Generic;
class Node { public string edge; public int suffix; public Dictionary<char, Node> children = new(); public Node(string e = "", int s = -1) { edge = e; suffix = s; } }
class SuffixTree {
  private string text; private Node root = new();
  public SuffixTree(string value) { text = value.EndsWith("$") ? value : value + "$"; Build(); }
  private void SplitEdge(Node parent, char key, Node edge, int k, string rest, int start) { var split = new Node(edge.edge.Substring(0, k)); var old = new Node(edge.edge.Substring(k), edge.suffix); old.children = edge.children; split.children[old.edge[0]] = old; edge.edge = edge.edge.Substring(k); split.children[rest[k]] = new Node(rest.Substring(k), start); parent.children[key] = split; }
  public void Build() { for (int start = 0; start < text.Length; start++) { var n = root; string rest = text.Substring(start); while (rest.Length > 0) { char key = rest[0]; if (!n.children.TryGetValue(key, out var edge)) { n.children[key] = new Node(rest, start); break; } int k = 0; while (k < edge.edge.Length && k < rest.Length && edge.edge[k] == rest[k]) k++; if (k == edge.edge.Length) { n = edge; rest = rest.Substring(k); continue; } SplitEdge(n, key, edge, k, rest, start); break; } } }
  private void Collect(Node n, List<int> outList) { if (n.suffix >= 0) outList.Add(n.suffix); foreach (var child in n.children.Values) Collect(child, outList); }
  public List<int> Search(string pattern) { var n = root; string rest = pattern; while (rest.Length > 0) { if (!n.children.TryGetValue(rest[0], out var edge)) return new(); int k = 0; while (k < edge.edge.Length && k < rest.Length && edge.edge[k] == rest[k]) k++; if (k == rest.Length) { var result = new List<int>(); Collect(edge, result); result.Sort(); return result; } if (k < edge.edge.Length) return new(); n = edge; rest = rest.Substring(k); } return new(); }
}`,
    java: `import java.util.*;
class Node { String edge; int suffix; Map<Character, Node> children = new HashMap<>(); Node(String e, int s) { edge = e; suffix = s; } }
class SuffixTree {
  private String text; private Node root = new Node("", -1);
  SuffixTree(String value) { text = value.endsWith("$") ? value : value + "$"; build(); }
  private void splitEdge(Node parent, char key, Node edge, int k, String rest, int start) { Node split = new Node(edge.edge.substring(0, k), -1); Node old = new Node(edge.edge.substring(k), edge.suffix); old.children = edge.children; split.children.put(old.edge.charAt(0), old); edge.edge = edge.edge.substring(k); split.children.put(rest.charAt(k), new Node(rest.substring(k), start)); parent.children.put(key, split); }
  void build() { for (int start = 0; start < text.length(); start++) { Node n = root; String rest = text.substring(start); while (!rest.isEmpty()) { char key = rest.charAt(0); Node edge = n.children.get(key); if (edge == null) { n.children.put(key, new Node(rest, start)); break; } int k = 0; while (k < edge.edge.length() && k < rest.length() && edge.edge.charAt(k) == rest.charAt(k)) k++; if (k == edge.edge.length()) { n = edge; rest = rest.substring(k); continue; } splitEdge(n, key, edge, k, rest, start); break; } } }
  private void collect(Node n, List<Integer> out) { if (n.suffix >= 0) out.add(n.suffix); for (Node c : n.children.values()) collect(c, out); }
  List<Integer> search(String pattern) { Node n = root; String rest = pattern; while (!rest.isEmpty()) { Node edge = n.children.get(rest.charAt(0)); if (edge == null) return List.of(); int k = 0; while (k < edge.edge.length() && k < rest.length() && edge.edge.charAt(k) == rest.charAt(k)) k++; if (k == rest.length()) { List<Integer> out = new ArrayList<>(); collect(edge, out); Collections.sort(out); return out; } if (k < edge.edge.length()) return List.of(); n = edge; rest = rest.substring(k); } return List.of(); }
}`,
  },
  suffixArray: {
    js: `class SuffixArray {
  constructor(text) { this.text = text.endsWith('$') ? text : text + '$'; this.sa = []; this.lcp = []; this.build(); }
  build() { this.sa = Array.from({ length: this.text.length }, (_, i) => i).sort((a, b) => { const x = this.text.slice(a), y = this.text.slice(b); return x < y ? -1 : x > y ? 1 : 0; }); this.buildLcp(); }
  buildLcp() { const n = this.text.length, rank = Array(n), lcp = Array(n).fill(0); this.sa.forEach((start, r) => { rank[start] = r; }); let h = 0; for (let i = 0; i < n; i++) { const r = rank[i]; if (r === 0) continue; const j = this.sa[r - 1]; while (i + h < n && j + h < n && this.text[i + h] === this.text[j + h]) h++; lcp[r] = h; if (h) h--; } this.lcp = lcp; }
  search(pattern) { let lo = 0, hi = this.sa.length; while (lo < hi) { const mid = (lo + hi) >> 1, suffix = this.text.slice(this.sa[mid]); if (suffix < pattern) lo = mid + 1; else hi = mid; } const first = lo; while (lo < this.sa.length && this.text.startsWith(pattern, this.sa[lo])) lo++; return this.sa.slice(first, lo).sort((a, b) => a - b); }
}`,
    python: `class SuffixArray:
    def __init__(self, text):
        self.text = text if text.endswith('$') else text + '$'
        self.sa, self.lcp = [], []; self.build()
    def build(self):
        self.sa = sorted(range(len(self.text)), key=lambda i: self.text[i:])
        self.buildLcp()
    def buildLcp(self):
        n = len(self.text); rank = [0] * n; self.lcp = [0] * n
        for r, start in enumerate(self.sa): rank[start] = r
        h = 0
        for i in range(n):
            r = rank[i]
            if r == 0: continue
            j = self.sa[r - 1]
            while i + h < n and j + h < n and self.text[i + h] == self.text[j + h]: h += 1
            self.lcp[r] = h
            if h: h -= 1
    def search(self, pattern):
        lo, hi = 0, len(self.sa)
        while lo < hi:
            mid = (lo + hi) // 2
            if self.text[self.sa[mid]:] < pattern: lo = mid + 1
            else: hi = mid
        first = lo
        while lo < len(self.sa) and self.text.startswith(pattern, self.sa[lo]): lo += 1
        return sorted(self.sa[first:lo])`,
    cpp: `#include <algorithm>
#include <numeric>
#include <string>
#include <vector>
class SuffixArray {
  std::string text;
public:
  std::vector<int> sa, lcp;
  explicit SuffixArray(std::string s) : text(s.back() == '$' ? s : s + '$') { build(); }
  void build() { sa.resize(text.size()); std::iota(sa.begin(), sa.end(), 0); std::sort(sa.begin(), sa.end(), [&](int a, int b) { return text.substr(a) < text.substr(b); }); buildLcp(); }
  void buildLcp() { int n = (int)text.size(), h = 0; std::vector<int> rank(n); lcp.assign(n, 0); for (int r = 0; r < n; ++r) rank[sa[r]] = r; for (int i = 0; i < n; ++i) { int r = rank[i]; if (!r) continue; int j = sa[r - 1]; while (i + h < n && j + h < n && text[i + h] == text[j + h]) ++h; lcp[r] = h; if (h) --h; } }
  std::vector<int> search(const std::string& p) { int lo = 0, hi = (int)sa.size(); while (lo < hi) { int m = (lo + hi) / 2; if (text.compare(sa[m], p.size(), p) < 0) lo = m + 1; else hi = m; } int first = lo; while (lo < (int)sa.size() && text.compare(sa[lo], p.size(), p) == 0) ++lo; std::vector<int> out(sa.begin() + first, sa.begin() + lo); std::sort(out.begin(), out.end()); return out; }
};`,
    csharp: `using System;
using System.Linq;
class SuffixArray {
  private string text; public int[] sa, lcp;
  public SuffixArray(string value) { text = value.EndsWith("$") ? value : value + "$"; Build(); }
  public void Build() { sa = Enumerable.Range(0, text.Length).OrderBy(i => text.Substring(i), StringComparer.Ordinal).ToArray(); BuildLcp(); }
  public void BuildLcp() { int n = text.Length, h = 0; var rank = new int[n]; lcp = new int[n]; for (int r = 0; r < n; r++) rank[sa[r]] = r; for (int i = 0; i < n; i++) { int r = rank[i]; if (r == 0) continue; int j = sa[r - 1]; while (i + h < n && j + h < n && text[i + h] == text[j + h]) h++; lcp[r] = h; if (h > 0) h--; } }
  public int[] Search(string pattern) { int lo = 0, hi = sa.Length; while (lo < hi) { int m = (lo + hi) / 2; if (string.CompareOrdinal(text.Substring(sa[m]), pattern) < 0) lo = m + 1; else hi = m; } int first = lo; while (lo < sa.Length && text.AsSpan(sa[lo]).StartsWith(pattern, StringComparison.Ordinal)) lo++; return sa.Skip(first).Take(lo - first).OrderBy(i => i).ToArray(); }
}`,
    java: `import java.util.*;
class SuffixArray {
  private String text; int[] sa, lcp;
  SuffixArray(String value) { text = value.endsWith("$") ? value : value + "$"; build(); }
  void build() { Integer[] order = new Integer[text.length()]; for (int i = 0; i < order.length; i++) order[i] = i; Arrays.sort(order, Comparator.comparing(i -> text.substring(i))); sa = Arrays.stream(order).mapToInt(i -> i).toArray(); buildLcp(); }
  void buildLcp() { int n = text.length(), h = 0; int[] rank = new int[n]; lcp = new int[n]; for (int r = 0; r < n; r++) rank[sa[r]] = r; for (int i = 0; i < n; i++) { int r = rank[i]; if (r == 0) continue; int j = sa[r - 1]; while (i + h < n && j + h < n && text.charAt(i + h) == text.charAt(j + h)) h++; lcp[r] = h; if (h > 0) h--; } }
  int[] search(String p) { int lo = 0, hi = sa.length; while (lo < hi) { int m = (lo + hi) / 2; if (text.substring(sa[m]).compareTo(p) < 0) lo = m + 1; else hi = m; } int first = lo; while (lo < sa.length && text.startsWith(p, sa[lo])) lo++; return Arrays.stream(Arrays.copyOfRange(sa, first, lo)).sorted().toArray(); }
}`,
  },
};

const SPECS = {
  btree: {
    helpers: ['insert', 'search', 'splitChild', 'insertNonFull', 'delete', 'traverse'],
    aliases: { delete: { cpp: 'erase' }, traverse: { cpp: 'collect', csharp: 'Collect', java: 'collect' } },
    defaultHelper: 'insert',
    stepIds: ['create-root', 'visit', 'split', 'promote', 'insert-leaf', 'insert-complete', 'found', 'not-found', 'child-select', 'borrow-left', 'borrow-right', 'merge', 'underflow', 'delete-leaf'],
  },
  trie: {
    helpers: ['insert', 'search', 'startsWith', 'delete'],
    aliases: { delete: { cpp: 'erase' } },
    defaultHelper: 'insert',
    stepIds: ['start', 'create', 'follow', 'markEnd', 'duplicate', 'searchStart', 'searchFollow', 'found', 'notFound', 'deleteStart', 'unmark', 'prune', 'deleted'],
  },
  suffixTrie: { helpers: ['build', 'search'], defaultHelper: 'build', stepIds: ['init', 'traverse', 'create', 'leaf', 'complete', 'search-start', 'search-char', 'search-miss', 'search-found'] },
  suffixTree: { helpers: ['build', 'search', 'splitEdge'], aliases: { splitEdge: { cpp: 'splitEdge', csharp: 'SplitEdge', java: 'splitEdge' } }, defaultHelper: 'build', stepIds: ['init', 'attach-leaf', 'traverse-edge', 'split-edge', 'complete', 'search-start', 'search-edge', 'search-miss', 'search-found'] },
  suffixArray: { helpers: ['build', 'buildLcp', 'search'], defaultHelper: 'build', stepIds: ['list', 'sort', 'lcp-init', 'lcp', 'complete', 'search-lower', 'search-upper', 'search-found', 'search-miss'] },
};

function findFunctionStart(lines, functionName, language) {
  return lines.findIndex((line) => {
    const trimmed = line.trim();
    return language === 'python'
      ? new RegExp(`^def ${functionName}\\s*\\(`, 'i').test(trimmed)
      : new RegExp(`(?:^|\\s)${functionName}\\s*\\(`, 'i').test(line) && !trimmed.startsWith('//');
  });
}

function extractFunction(source, functionName, language) {
  const lines = source.split('\n');
  const start = findFunctionStart(lines, functionName, language);
  if (start < 0) return [lines[0] ?? ''];
  if (language === 'python') {
    let end = start + 1;
    while (end < lines.length && (!lines[end].trim() || !/^ {4}def\s/.test(lines[end]))) end++;
    return lines.slice(start, end).filter((line) => line.length > 0);
  }
  let depth = 0;
  let opened = false;
  for (let end = start; end < lines.length; end++) {
    for (const char of lines[end]) {
      if (char === '{') { depth++; opened = true; }
      if (char === '}') depth--;
    }
    if (opened && depth === 0) return lines.slice(start, end + 1);
  }
  return lines.slice(start, start + 1);
}

function chooseSemanticLine(lines, stepId) {
  const id = stepId.toLowerCase();
  const find = (pattern) => lines.findIndex((line) => pattern.test(line));
  const candidate = /split|rotate|borrow|merge/.test(id)
    ? find(/split|rotate|borrow|merge/i)
    : /found|complete|deleted|duplicate|not-found/.test(id)
      ? find(/return|end\s*=/i)
      : /create|insert|attach|mark|delete|prune|promote/.test(id)
        ? find(/insert|add|set|splice|push|remove|delete|end\s*=/i)
        : find(/while|for|if|compare/i);
  return candidate >= 0 ? candidate : Math.min(1, Math.max(0, lines.length - 1));
}

function makeStructureCode(key) {
  const spec = SPECS[key];
  const source = implementations[key];
  const helpers = {};
  const implementationLineMap = {};
  for (const language of LANGUAGE_KEYS) {
    implementationLineMap[language] = {};
    for (const name of spec.helpers) {
      const methodName = spec.aliases?.[name]?.[language] ?? name;
      implementationLineMap[language][name] = findFunctionStart(source[language].split('\n'), methodName, language);
    }
  }
  for (const name of spec.helpers) {
    const codeByLang = Object.fromEntries(LANGUAGE_KEYS.map((language) => {
      const methodName = spec.aliases?.[name]?.[language] ?? name;
      return [language, extractFunction(source[language], methodName, language)];
    }));
    const lineByStep = Object.fromEntries(LANGUAGE_KEYS.map((language) => [
      language,
      Object.fromEntries(spec.stepIds.map((stepId) => [
        stepId,
        chooseSemanticLine(codeByLang[language], stepId),
      ])),
    ]));
    helpers[name] = { label: name, codeByLang, lineByStep };
  }
  return { implementations: source, helpers, defaultHelper: spec.defaultHelper, implementationLineMap };
}

export const ADVANCED_STRUCTURE_CODE = Object.freeze({
  btree: makeStructureCode('btree'),
  trie: makeStructureCode('trie'),
  suffixTrie: makeStructureCode('suffixTrie'),
  suffixTree: makeStructureCode('suffixTree'),
  suffixArray: makeStructureCode('suffixArray'),
});
