const implementations = {
  bst: {
    js: `class Node {
  constructor(key) { this.key = key; this.left = null; this.right = null; }
}
class BST {
  constructor() { this.root = null; }
  search(key, node = this.root) {
    if (!node || node.key === key) return node;
    return this.search(key, key < node.key ? node.left : node.right);
  }
  insert(key) {
    const add = node => {
      if (!node) return new Node(key);
      if (key < node.key) node.left = add(node.left);
      else if (key > node.key) node.right = add(node.right);
      return node;
    };
    this.root = add(this.root);
  }
  delete(key) {
    let removed = false;
    const remove = node => {
      if (!node) return null;
      if (key < node.key) node.left = remove(node.left);
      else if (key > node.key) node.right = remove(node.right);
      else {
        removed = true;
        if (!node.left) return node.right;
        if (!node.right) return node.left;
        let successor = node.right;
        while (successor.left) successor = successor.left;
        node.key = successor.key;
        node.right = removeSuccessor(node.right, successor.key);
      }
      return node;
    };
    const removeSuccessor = (node, value) => {
      if (value < node.key) node.left = removeSuccessor(node.left, value);
      else if (value > node.key) node.right = removeSuccessor(node.right, value);
      else return node.right;
      return node;
    };
    this.root = remove(this.root);
    return removed;
  }
  inorder(node = this.root, out = []) {
    if (node) { this.inorder(node.left, out); out.push(node.key); this.inorder(node.right, out); }
    return out;
  }
}`,
    python: `class Node:
    def __init__(self, key):
        self.key, self.left, self.right = key, None, None
class BST:
    def __init__(self):
        self.root = None
    def search(self, key):
        node = self.root
        while node is not None and node.key != key:
            node = node.left if key < node.key else node.right
        return node
    def insert(self, key):
        def add(node):
            if node is None: return Node(key)
            if key < node.key: node.left = add(node.left)
            elif key > node.key: node.right = add(node.right)
            return node
        self.root = add(self.root)
    def delete(self, key):
        removed = False
        def remove(node):
            nonlocal removed
            if node is None: return None
            if key < node.key: node.left = remove(node.left)
            elif key > node.key: node.right = remove(node.right)
            else:
                removed = True
                if node.left is None: return node.right
                if node.right is None: return node.left
                successor = node.right
                while successor.left: successor = successor.left
                node.key = successor.key
                node.right = remove_successor(node.right, successor.key)
            return node
        def remove_successor(node, value):
            if value < node.key: node.left = remove_successor(node.left, value)
            elif value > node.key: node.right = remove_successor(node.right, value)
            else: return node.right
            return node
        self.root = remove(self.root)
        return removed
    def inorder(self):
        def walk(node):
            return [] if node is None else walk(node.left) + [node.key] + walk(node.right)
        return walk(self.root)`,
    cpp: `#include <vector>
class BST {
  struct Node { double key; Node *left = nullptr, *right = nullptr; explicit Node(double v) : key(v) {} };
  Node* root = nullptr;
  Node* find(Node* n, double k) const { if (!n || n->key == k) return n; return find(k < n->key ? n->left : n->right, k); }
  Node* add(Node* n, double k) { if (!n) return new Node(k); if (k < n->key) n->left = add(n->left, k); else if (k > n->key) n->right = add(n->right, k); return n; }
  Node* remove(Node* n, double k, bool& found) {
    if (!n) return nullptr;
    if (k < n->key) n->left = remove(n->left, k, found);
    else if (k > n->key) n->right = remove(n->right, k, found);
    else {
      found = true;
      if (!n->left) return n->right;
      if (!n->right) return n->left;
      Node* s = n->right; while (s->left) s = s->left;
      n->key = s->key; n->right = remove(n->right, s->key, found);
    }
    return n;
  }
  void walk(Node* n, std::vector<double>& out) const { if (n) { walk(n->left, out); out.push_back(n->key); walk(n->right, out); } }
public:
  bool search(double key) const { return find(root, key) != nullptr; }
  void insert(double key) { root = add(root, key); }
  bool erase(double key) { bool found = false; root = remove(root, key, found); return found; }
  std::vector<double> inorder() const { std::vector<double> out; walk(root, out); return out; }
};`,
    java: `import java.util.ArrayList;
import java.util.List;
class BST {
  private static class Node { double key; Node left, right; Node(double key) { this.key = key; } }
  private Node root;
  private Node find(Node n, double k) { if (n == null || n.key == k) return n; return find(k < n.key ? n.left : n.right, k); }
  private Node add(Node n, double k) { if (n == null) return new Node(k); if (k < n.key) n.left = add(n.left, k); else if (k > n.key) n.right = add(n.right, k); return n; }
  private Node remove(Node n, double k) {
    if (n == null) return null;
    if (k < n.key) n.left = remove(n.left, k);
    else if (k > n.key) n.right = remove(n.right, k);
    else {
      if (n.left == null) return n.right;
      if (n.right == null) return n.left;
      Node s = n.right; while (s.left != null) s = s.left;
      n.key = s.key; n.right = remove(n.right, s.key);
    }
    return n;
  }
  private void walk(Node n, List<Double> out) { if (n != null) { walk(n.left, out); out.add(n.key); walk(n.right, out); } }
  boolean search(double key) { return find(root, key) != null; }
  void insert(double key) { root = add(root, key); }
  boolean delete(double key) { if (!search(key)) return false; root = remove(root, key); return true; }
  List<Double> inorder() { List<Double> out = new ArrayList<>(); walk(root, out); return out; }
}`,
    csharp: `using System.Collections.Generic;
class BST {
  private class Node { public double key; public Node left, right; public Node(double key) { this.key = key; } }
  private Node root;
  private Node Find(Node n, double k) { if (n == null || n.key == k) return n; return Find(k < n.key ? n.left : n.right, k); }
  private Node Add(Node n, double k) { if (n == null) return new Node(k); if (k < n.key) n.left = Add(n.left, k); else if (k > n.key) n.right = Add(n.right, k); return n; }
  private Node Remove(Node n, double k) {
    if (n == null) return null;
    if (k < n.key) n.left = Remove(n.left, k);
    else if (k > n.key) n.right = Remove(n.right, k);
    else {
      if (n.left == null) return n.right;
      if (n.right == null) return n.left;
      Node s = n.right; while (s.left != null) s = s.left;
      n.key = s.key; n.right = Remove(n.right, s.key);
    }
    return n;
  }
  private void Walk(Node n, List<double> out) { if (n != null) { Walk(n.left, out); out.Add(n.key); Walk(n.right, out); } }
  public bool Search(double key) { return Find(root, key) != null; }
  public void Insert(double key) { root = Add(root, key); }
  public bool Delete(double key) { if (!Search(key)) return false; root = Remove(root, key); return true; }
  public List<double> Inorder() { var out = new List<double>(); Walk(root, out); return out; }
}`,
  },
  rbt: {
    js: `class Node {
  constructor(key, red = true) { this.key = key; this.red = red; this.left = null; this.right = null; }
}
class RedBlackTree {
  constructor() { this.root = null; }
  isRed(node) { return node !== null && node.red; }
  rotateLeft(h) { const x = h.right; h.right = x.left; x.left = h; x.red = h.red; h.red = true; return x; }
  rotateRight(h) { const x = h.left; h.left = x.right; x.right = h; x.red = h.red; h.red = true; return x; }
  flipColors(h) { h.red = !h.red; if (h.left) h.left.red = !h.left.red; if (h.right) h.right.red = !h.right.red; }
  moveRedLeft(h) { this.flipColors(h); if (this.isRed(h.right?.left)) { h.right = this.rotateRight(h.right); h = this.rotateLeft(h); this.flipColors(h); } return h; }
  moveRedRight(h) { this.flipColors(h); if (this.isRed(h.left?.left)) { h = this.rotateRight(h); this.flipColors(h); } return h; }
  balance(h) {
    if (this.isRed(h.right)) h = this.rotateLeft(h);
    if (this.isRed(h.left) && this.isRed(h.left.left)) h = this.rotateRight(h);
    if (this.isRed(h.left) && this.isRed(h.right)) this.flipColors(h);
    return h;
  }
  search(key, node = this.root) { if (!node || node.key === key) return node; return this.search(key, key < node.key ? node.left : node.right); }
  insert(key) {
    const add = h => {
      if (!h) return new Node(key);
      if (key < h.key) h.left = add(h.left); else if (key > h.key) h.right = add(h.right); else return h;
      if (this.isRed(h.right) && !this.isRed(h.left)) h = this.rotateLeft(h);
      if (this.isRed(h.left) && this.isRed(h.left.left)) h = this.rotateRight(h);
      if (this.isRed(h.left) && this.isRed(h.right)) this.flipColors(h);
      return h;
    };
    this.root = add(this.root); this.root.red = false;
  }
  delete(key) {
    if (!this.search(key)) return false;
    if (!this.isRed(this.root.left) && !this.isRed(this.root.right)) this.root.red = true;
    this.root = this.remove(this.root, key);
    if (this.root) this.root.red = false;
    return true;
  }
  remove(h, key) {
    if (key < h.key) {
      if (h.left && !this.isRed(h.left) && !this.isRed(h.left.left)) h = this.moveRedLeft(h);
      h.left = this.remove(h.left, key);
    } else {
      if (this.isRed(h.left)) h = this.rotateRight(h);
      if (key === h.key && !h.right) return null;
      if (h.right && !this.isRed(h.right) && !this.isRed(h.right.left)) h = this.moveRedRight(h);
      if (key === h.key) { let successor = h.right; while (successor.left) successor = successor.left; h.key = successor.key; h.right = this.deleteMin(h.right); }
      else h.right = this.remove(h.right, key);
    }
    return this.balance(h);
  }
  deleteMin(h) { if (!h.left) return null; if (!this.isRed(h.left) && !this.isRed(h.left.left)) h = this.moveRedLeft(h); h.left = this.deleteMin(h.left); return this.balance(h); }
  inorder(node = this.root, out = []) { if (node) { this.inorder(node.left, out); out.push(node.key); this.inorder(node.right, out); } return out; }
}`,
    python: `class Node:
    def __init__(self, key, red=True):
        self.key, self.red, self.left, self.right = key, red, None, None
class RedBlackTree:
    def __init__(self): self.root = None
    def is_red(self, n): return n is not None and n.red
    def rotate_left(self, h):
        x = h.right; h.right = x.left; x.left = h
        x.red, h.red = h.red, True; return x
    def rotate_right(self, h):
        x = h.left; h.left = x.right; x.right = h
        x.red, h.red = h.red, True; return x
    def flip_colors(self, h):
        h.red = not h.red
        if h.left: h.left.red = not h.left.red
        if h.right: h.right.red = not h.right.red
    def move_red_left(self, h):
        self.flip_colors(h)
        if h.right and self.is_red(h.right.left):
            h.right = self.rotate_right(h.right); h = self.rotate_left(h); self.flip_colors(h)
        return h
    def move_red_right(self, h):
        self.flip_colors(h)
        if h.left and self.is_red(h.left.left): h = self.rotate_right(h); self.flip_colors(h)
        return h
    def balance(self, h):
        if self.is_red(h.right): h = self.rotate_left(h)
        if self.is_red(h.left) and self.is_red(h.left.left): h = self.rotate_right(h)
        if self.is_red(h.left) and self.is_red(h.right): self.flip_colors(h)
        return h
    def search(self, key):
        n = self.root
        while n is not None and n.key != key:
            n = n.left if key < n.key else n.right
        return n
    def insert(self, key):
        def add(h):
            if h is None: return Node(key)
            if key < h.key: h.left = add(h.left)
            elif key > h.key: h.right = add(h.right)
            else: return h
            if self.is_red(h.right) and not self.is_red(h.left): h = self.rotate_left(h)
            if self.is_red(h.left) and self.is_red(h.left.left): h = self.rotate_right(h)
            if self.is_red(h.left) and self.is_red(h.right): self.flip_colors(h)
            return h
        self.root = add(self.root); self.root.red = False
    def delete(self, key):
        if self.search(key) is None: return False
        if not self.is_red(self.root.left) and not self.is_red(self.root.right): self.root.red = True
        self.root = self.remove(self.root, key)
        if self.root: self.root.red = False
        return True
    def remove(self, h, key):
        if key < h.key:
            if h.left and not self.is_red(h.left) and not self.is_red(h.left.left): h = self.move_red_left(h)
            h.left = self.remove(h.left, key)
        else:
            if self.is_red(h.left): h = self.rotate_right(h)
            if key == h.key and h.right is None: return None
            if h.right and not self.is_red(h.right) and not self.is_red(h.right.left): h = self.move_red_right(h)
            if key == h.key:
                s = h.right
                while s.left: s = s.left
                h.key = s.key; h.right = self.delete_min(h.right)
            else: h.right = self.remove(h.right, key)
        return self.balance(h)
    def delete_min(self, h):
        if h.left is None: return None
        if not self.is_red(h.left) and not self.is_red(h.left.left): h = self.move_red_left(h)
        h.left = self.delete_min(h.left); return self.balance(h)
    def inorder(self):
        def walk(n):
            return [] if n is None else walk(n.left) + [n.key] + walk(n.right)
        return walk(self.root)`,
    cpp: `#include <vector>
class RedBlackTree {
  struct Node { double key; bool red = true; Node *left = nullptr, *right = nullptr; explicit Node(double k) : key(k) {} };
  Node* root = nullptr;
  bool isRed(Node* n) { return n && n->red; }
  Node* rotateLeft(Node* h) { Node* x = h->right; h->right = x->left; x->left = h; x->red = h->red; h->red = true; return x; }
  Node* rotateRight(Node* h) { Node* x = h->left; h->left = x->right; x->right = h; x->red = h->red; h->red = true; return x; }
  void flipColors(Node* h) { h->red = !h->red; if (h->left) h->left->red = !h->left->red; if (h->right) h->right->red = !h->right->red; }
  Node* moveRedLeft(Node* h) { flipColors(h); if (h->right && isRed(h->right->left)) { h->right = rotateRight(h->right); h = rotateLeft(h); flipColors(h); } return h; }
  Node* moveRedRight(Node* h) { flipColors(h); if (h->left && isRed(h->left->left)) { h = rotateRight(h); flipColors(h); } return h; }
  Node* balance(Node* h) { if (isRed(h->right)) h = rotateLeft(h); if (isRed(h->left) && isRed(h->left->left)) h = rotateRight(h); if (isRed(h->left) && isRed(h->right)) flipColors(h); return h; }
  Node* add(Node* h, double k) {
    if (!h) return new Node(k);
    if (k < h->key) h->left = add(h->left, k); else if (k > h->key) h->right = add(h->right, k); else return h;
    if (isRed(h->right) && !isRed(h->left)) h = rotateLeft(h);
    if (isRed(h->left) && isRed(h->left->left)) h = rotateRight(h);
    if (isRed(h->left) && isRed(h->right)) flipColors(h);
    return h;
  }
  Node* deleteMin(Node* h) { if (!h->left) return nullptr; if (!isRed(h->left) && !isRed(h->left->left)) h = moveRedLeft(h); h->left = deleteMin(h->left); return balance(h); }
  Node* remove(Node* h, double k) {
    if (k < h->key) { if (h->left && !isRed(h->left) && !isRed(h->left->left)) h = moveRedLeft(h); h->left = remove(h->left, k); }
    else {
      if (isRed(h->left)) h = rotateRight(h);
      if (k == h->key && !h->right) return nullptr;
      if (h->right && !isRed(h->right) && !isRed(h->right->left)) h = moveRedRight(h);
      if (k == h->key) { Node* s = h->right; while (s->left) s = s->left; h->key = s->key; h->right = deleteMin(h->right); }
      else h->right = remove(h->right, k);
    }
    return balance(h);
  }
  bool contains(Node* n, double k) { return n && (k == n->key || contains(k < n->key ? n->left : n->right, k)); }
  void walk(Node* n, std::vector<double>& o) { if (n) { walk(n->left, o); o.push_back(n->key); walk(n->right, o); } }
public:
  void insert(double k) { root = add(root, k); root->red = false; }
  bool search(double k) { return contains(root, k); }
  bool erase(double k) { if (!search(k)) return false; if (!isRed(root->left) && !isRed(root->right)) root->red = true; root = remove(root, k); if (root) root->red = false; return true; }
  std::vector<double> inorder() { std::vector<double> o; walk(root, o); return o; }
};`,
    java: `import java.util.ArrayList;
import java.util.List;
class RedBlackTree {
  private static class Node { double key; boolean red = true; Node left, right; Node(double k) { key = k; } }
  private Node root;
  private boolean isRed(Node n) { return n != null && n.red; }
  private Node rotateLeft(Node h) { Node x = h.right; h.right = x.left; x.left = h; x.red = h.red; h.red = true; return x; }
  private Node rotateRight(Node h) { Node x = h.left; h.left = x.right; x.right = h; x.red = h.red; h.red = true; return x; }
  private void flipColors(Node h) { h.red = !h.red; if (h.left != null) h.left.red = !h.left.red; if (h.right != null) h.right.red = !h.right.red; }
  private Node moveRedLeft(Node h) { flipColors(h); if (h.right != null && isRed(h.right.left)) { h.right = rotateRight(h.right); h = rotateLeft(h); flipColors(h); } return h; }
  private Node moveRedRight(Node h) { flipColors(h); if (h.left != null && isRed(h.left.left)) { h = rotateRight(h); flipColors(h); } return h; }
  private Node balance(Node h) { if (isRed(h.right)) h = rotateLeft(h); if (isRed(h.left) && isRed(h.left.left)) h = rotateRight(h); if (isRed(h.left) && isRed(h.right)) flipColors(h); return h; }
  private Node add(Node h, double k) { if (h == null) return new Node(k); if (k < h.key) h.left = add(h.left, k); else if (k > h.key) h.right = add(h.right, k); else return h; if (isRed(h.right) && !isRed(h.left)) h = rotateLeft(h); if (isRed(h.left) && isRed(h.left.left)) h = rotateRight(h); if (isRed(h.left) && isRed(h.right)) flipColors(h); return h; }
  private Node deleteMin(Node h) { if (h.left == null) return null; if (!isRed(h.left) && !isRed(h.left.left)) h = moveRedLeft(h); h.left = deleteMin(h.left); return balance(h); }
  private Node remove(Node h, double k) {
    if (k < h.key) { if (h.left != null && !isRed(h.left) && !isRed(h.left.left)) h = moveRedLeft(h); h.left = remove(h.left, k); }
    else {
      if (isRed(h.left)) h = rotateRight(h);
      if (k == h.key && h.right == null) return null;
      if (h.right != null && !isRed(h.right) && !isRed(h.right.left)) h = moveRedRight(h);
      if (k == h.key) { Node s = h.right; while (s.left != null) s = s.left; h.key = s.key; h.right = deleteMin(h.right); }
      else h.right = remove(h.right, k);
    }
    return balance(h);
  }
  private boolean contains(Node n, double k) { return n != null && (k == n.key || contains(k < n.key ? n.left : n.right, k)); }
  private void walk(Node n, List<Double> out) { if (n != null) { walk(n.left, out); out.add(n.key); walk(n.right, out); } }
  void insert(double k) { root = add(root, k); root.red = false; }
  boolean search(double k) { return contains(root, k); }
  boolean delete(double k) { if (!search(k)) return false; if (!isRed(root.left) && !isRed(root.right)) root.red = true; root = remove(root, k); if (root != null) root.red = false; return true; }
  List<Double> inorder() { List<Double> out = new ArrayList<>(); walk(root, out); return out; }
}`,
    csharp: `using System.Collections.Generic;
class RedBlackTree {
  private class Node { public double key; public bool red = true; public Node left, right; public Node(double k) { key = k; } }
  private Node root;
  private bool IsRed(Node n) => n != null && n.red;
  private Node RotateLeft(Node h) { Node x = h.right; h.right = x.left; x.left = h; x.red = h.red; h.red = true; return x; }
  private Node RotateRight(Node h) { Node x = h.left; h.left = x.right; x.right = h; x.red = h.red; h.red = true; return x; }
  private void FlipColors(Node h) { h.red = !h.red; if (h.left != null) h.left.red = !h.left.red; if (h.right != null) h.right.red = !h.right.red; }
  private Node MoveRedLeft(Node h) { FlipColors(h); if (h.right != null && IsRed(h.right.left)) { h.right = RotateRight(h.right); h = RotateLeft(h); FlipColors(h); } return h; }
  private Node MoveRedRight(Node h) { FlipColors(h); if (h.left != null && IsRed(h.left.left)) { h = RotateRight(h); FlipColors(h); } return h; }
  private Node Balance(Node h) { if (IsRed(h.right)) h = RotateLeft(h); if (IsRed(h.left) && IsRed(h.left.left)) h = RotateRight(h); if (IsRed(h.left) && IsRed(h.right)) FlipColors(h); return h; }
  private Node Add(Node h, double k) { if (h == null) return new Node(k); if (k < h.key) h.left = Add(h.left, k); else if (k > h.key) h.right = Add(h.right, k); else return h; if (IsRed(h.right) && !IsRed(h.left)) h = RotateLeft(h); if (IsRed(h.left) && IsRed(h.left.left)) h = RotateRight(h); if (IsRed(h.left) && IsRed(h.right)) FlipColors(h); return h; }
  private Node DeleteMin(Node h) { if (h.left == null) return null; if (!IsRed(h.left) && !IsRed(h.left.left)) h = MoveRedLeft(h); h.left = DeleteMin(h.left); return Balance(h); }
  private Node Remove(Node h, double k) {
    if (k < h.key) { if (h.left != null && !IsRed(h.left) && !IsRed(h.left.left)) h = MoveRedLeft(h); h.left = Remove(h.left, k); }
    else {
      if (IsRed(h.left)) h = RotateRight(h);
      if (k == h.key && h.right == null) return null;
      if (h.right != null && !IsRed(h.right) && !IsRed(h.right.left)) h = MoveRedRight(h);
      if (k == h.key) { Node s = h.right; while (s.left != null) s = s.left; h.key = s.key; h.right = DeleteMin(h.right); }
      else h.right = Remove(h.right, k);
    }
    return Balance(h);
  }
  private bool Contains(Node n, double k) => n != null && (k == n.key || Contains(k < n.key ? n.left : n.right, k));
  private void Walk(Node n, List<double> o) { if (n != null) { Walk(n.left, o); o.Add(n.key); Walk(n.right, o); } }
  public void Insert(double k) { root = Add(root, k); root.red = false; }
  public bool Search(double k) => Contains(root, k);
  public bool Delete(double k) { if (!Search(k)) return false; if (!IsRed(root.left) && !IsRed(root.right)) root.red = true; root = Remove(root, k); if (root != null) root.red = false; return true; }
  public List<double> Inorder() { var o = new List<double>(); Walk(root, o); return o; }
}`,
  },
  avl: {
    js: `class Node {
  constructor(key) { this.key = key; this.left = null; this.right = null; this.height = 0; }
}
class AVLTree {
  constructor() { this.root = null; }
  height(node) { return node ? node.height : -1; }
  update(node) { node.height = 1 + Math.max(this.height(node.left), this.height(node.right)); }
  rotateRight(y) { const x = y.left; y.left = x.right; x.right = y; this.update(y); this.update(x); return x; }
  rotateLeft(x) { const y = x.right; x.right = y.left; y.left = x; this.update(x); this.update(y); return y; }
  balance(node) {
    this.update(node);
    const factor = this.height(node.left) - this.height(node.right);
    if (factor > 1) { if (this.height(node.left.left) < this.height(node.left.right)) node.left = this.rotateLeft(node.left); return this.rotateRight(node); }
    if (factor < -1) { if (this.height(node.right.right) < this.height(node.right.left)) node.right = this.rotateRight(node.right); return this.rotateLeft(node); }
    return node;
  }
  search(key, node = this.root) { if (!node || node.key === key) return node; return this.search(key, key < node.key ? node.left : node.right); }
  insert(key) {
    const add = node => { if (!node) return new Node(key); if (key < node.key) node.left = add(node.left); else if (key > node.key) node.right = add(node.right); else return node; return this.balance(node); };
    this.root = add(this.root);
  }
  delete(key) {
    if (!this.search(key)) return false;
    const remove = node => {
      if (key < node.key) node.left = remove(node.left);
      else if (key > node.key) node.right = remove(node.right);
      else {
        if (!node.left) return node.right;
        if (!node.right) return node.left;
        let successor = node.right; while (successor.left) successor = successor.left;
        node.key = successor.key; node.right = removeSuccessor(node.right, successor.key);
      }
      return this.balance(node);
    };
    const removeSuccessor = (node, value) => { if (value < node.key) node.left = removeSuccessor(node.left, value); else if (value > node.key) node.right = removeSuccessor(node.right, value); else return node.right; return this.balance(node); };
    this.root = remove(this.root); return true;
  }
  inorder(node = this.root, out = []) { if (node) { this.inorder(node.left, out); out.push(node.key); this.inorder(node.right, out); } return out; }
}`,
    python: `class Node:
    def __init__(self, key):
        self.key, self.left, self.right, self.height = key, None, None, 0
class AVLTree:
    def __init__(self):
        self.root = None
    def height(self, n): return n.height if n else -1
    def update(self, n): n.height = 1 + max(self.height(n.left), self.height(n.right))
    def rotate_right(self, y):
        x = y.left; y.left = x.right; x.right = y
        self.update(y); self.update(x); return x
    def rotate_left(self, x):
        y = x.right; x.right = y.left; y.left = x
        self.update(x); self.update(y); return y
    def balance(self, n):
        self.update(n); factor = self.height(n.left) - self.height(n.right)
        if factor > 1:
            if self.height(n.left.left) < self.height(n.left.right): n.left = self.rotate_left(n.left)
            return self.rotate_right(n)
        if factor < -1:
            if self.height(n.right.right) < self.height(n.right.left): n.right = self.rotate_right(n.right)
            return self.rotate_left(n)
        return n
    def search(self, key):
        node = self.root
        while node is not None and node.key != key:
            node = node.left if key < node.key else node.right
        return node
    def insert(self, key):
        def add(n):
            if n is None: return Node(key)
            if key < n.key: n.left = add(n.left)
            elif key > n.key: n.right = add(n.right)
            else: return n
            return self.balance(n)
        self.root = add(self.root)
    def delete(self, key):
        if self.search(key) is None: return False
        def remove(n):
            if key < n.key: n.left = remove(n.left)
            elif key > n.key: n.right = remove(n.right)
            else:
                if n.left is None: return n.right
                if n.right is None: return n.left
                s = n.right
                while s.left: s = s.left
                n.key = s.key; n.right = remove_successor(n.right, s.key)
            return self.balance(n)
        def remove_successor(n, value):
            if value < n.key: n.left = remove_successor(n.left, value)
            elif value > n.key: n.right = remove_successor(n.right, value)
            else: return n.right
            return self.balance(n)
        self.root = remove(self.root); return True
    def inorder(self):
        def walk(node):
            return [] if node is None else walk(node.left) + [node.key] + walk(node.right)
        return walk(self.root)`,
    cpp: `#include <algorithm>
#include <vector>
class AVLTree {
  struct Node { double key; int height = 0; Node *left = nullptr, *right = nullptr; explicit Node(double v) : key(v) {} };
  Node* root = nullptr;
  int height(Node* n) { return n ? n->height : -1; }
  void update(Node* n) { n->height = 1 + std::max(height(n->left), height(n->right)); }
  Node* rotateRight(Node* y) { Node* x = y->left; y->left = x->right; x->right = y; update(y); update(x); return x; }
  Node* rotateLeft(Node* x) { Node* y = x->right; x->right = y->left; y->left = x; update(x); update(y); return y; }
  Node* balance(Node* n) {
    update(n); int b = height(n->left) - height(n->right);
    if (b > 1) { if (height(n->left->left) < height(n->left->right)) n->left = rotateLeft(n->left); return rotateRight(n); }
    if (b < -1) { if (height(n->right->right) < height(n->right->left)) n->right = rotateRight(n->right); return rotateLeft(n); }
    return n;
  }
  Node* add(Node* n, double k) { if (!n) return new Node(k); if (k < n->key) n->left = add(n->left, k); else if (k > n->key) n->right = add(n->right, k); else return n; return balance(n); }
  Node* remove(Node* n, double k) {
    if (k < n->key) n->left = remove(n->left, k);
    else if (k > n->key) n->right = remove(n->right, k);
    else {
      if (!n->left) return n->right;
      if (!n->right) return n->left;
      Node* s = n->right; while (s->left) s = s->left;
      n->key = s->key; n->right = remove(n->right, s->key);
    }
    return balance(n);
  }
  bool contains(Node* n, double k) { return n && (k == n->key || contains(k < n->key ? n->left : n->right, k)); }
  void walk(Node* n, std::vector<double>& out) { if (n) { walk(n->left, out); out.push_back(n->key); walk(n->right, out); } }
public:
  void insert(double key) { root = add(root, key); }
  bool search(double key) { return contains(root, key); }
  bool erase(double key) { if (!search(key)) return false; root = remove(root, key); return true; }
  std::vector<double> inorder() { std::vector<double> out; walk(root, out); return out; }
};`,
    java: `import java.util.ArrayList;
import java.util.List;
class AVLTree {
  private static class Node { double key; int height; Node left, right; Node(double k) { key = k; } }
  private Node root;
  private int height(Node n) { return n == null ? -1 : n.height; }
  private void update(Node n) { n.height = 1 + Math.max(height(n.left), height(n.right)); }
  private Node rotateRight(Node y) { Node x = y.left; y.left = x.right; x.right = y; update(y); update(x); return x; }
  private Node rotateLeft(Node x) { Node y = x.right; x.right = y.left; y.left = x; update(x); update(y); return y; }
  private Node balance(Node n) {
    update(n); int b = height(n.left) - height(n.right);
    if (b > 1) { if (height(n.left.left) < height(n.left.right)) n.left = rotateLeft(n.left); return rotateRight(n); }
    if (b < -1) { if (height(n.right.right) < height(n.right.left)) n.right = rotateRight(n.right); return rotateLeft(n); }
    return n;
  }
  private Node add(Node n, double k) { if (n == null) return new Node(k); if (k < n.key) n.left = add(n.left, k); else if (k > n.key) n.right = add(n.right, k); else return n; return balance(n); }
  private Node remove(Node n, double k) {
    if (k < n.key) n.left = remove(n.left, k);
    else if (k > n.key) n.right = remove(n.right, k);
    else {
      if (n.left == null) return n.right;
      if (n.right == null) return n.left;
      Node s = n.right; while (s.left != null) s = s.left;
      n.key = s.key; n.right = remove(n.right, s.key);
    }
    return balance(n);
  }
  private boolean contains(Node n, double k) { return n != null && (k == n.key || contains(k < n.key ? n.left : n.right, k)); }
  private void walk(Node n, List<Double> out) { if (n != null) { walk(n.left, out); out.add(n.key); walk(n.right, out); } }
  void insert(double key) { root = add(root, key); }
  boolean search(double key) { return contains(root, key); }
  boolean delete(double key) { if (!search(key)) return false; root = remove(root, key); return true; }
  List<Double> inorder() { List<Double> out = new ArrayList<>(); walk(root, out); return out; }
}`,
    csharp: `using System;
using System.Collections.Generic;
class AVLTree {
  private class Node { public double key; public int height; public Node left, right; public Node(double k) { key = k; } }
  private Node root;
  private int Height(Node n) => n == null ? -1 : n.height;
  private void Update(Node n) { n.height = 1 + Math.Max(Height(n.left), Height(n.right)); }
  private Node RotateRight(Node y) { Node x = y.left; y.left = x.right; x.right = y; Update(y); Update(x); return x; }
  private Node RotateLeft(Node x) { Node y = x.right; x.right = y.left; y.left = x; Update(x); Update(y); return y; }
  private Node Balance(Node n) {
    Update(n); int b = Height(n.left) - Height(n.right);
    if (b > 1) { if (Height(n.left.left) < Height(n.left.right)) n.left = RotateLeft(n.left); return RotateRight(n); }
    if (b < -1) { if (Height(n.right.right) < Height(n.right.left)) n.right = RotateRight(n.right); return RotateLeft(n); }
    return n;
  }
  private Node Add(Node n, double k) { if (n == null) return new Node(k); if (k < n.key) n.left = Add(n.left, k); else if (k > n.key) n.right = Add(n.right, k); else return n; return Balance(n); }
  private Node Remove(Node n, double k) {
    if (k < n.key) n.left = Remove(n.left, k);
    else if (k > n.key) n.right = Remove(n.right, k);
    else {
      if (n.left == null) return n.right;
      if (n.right == null) return n.left;
      Node s = n.right; while (s.left != null) s = s.left;
      n.key = s.key; n.right = Remove(n.right, s.key);
    }
    return Balance(n);
  }
  private bool Contains(Node n, double k) => n != null && (k == n.key || Contains(k < n.key ? n.left : n.right, k));
  private void Walk(Node n, List<double> o) { if (n != null) { Walk(n.left, o); o.Add(n.key); Walk(n.right, o); } }
  public void Insert(double key) { root = Add(root, key); }
  public bool Search(double key) => Contains(root, key);
  public bool Delete(double key) { if (!Search(key)) return false; root = Remove(root, key); return true; }
  public List<double> Inorder() { var o = new List<double>(); Walk(root, o); return o; }
}`,
  },
};

export const TREE_IMPLEMENTATION_LANGUAGES = Object.freeze(['js', 'python', 'cpp', 'java', 'csharp']);

export function getTreeImplementation(type, language) {
  return implementations[type]?.[language] ?? '';
}

export function getTreeImplementationLine(type, helper, language) {
  const source = getTreeImplementation(type, language);
  const treeHelper = type === 'rbt'
    ? ({ fixAfterInsert: 'balance', fixAfterDelete: 'remove' }[helper] ?? helper)
    : type === 'avl'
      ? ({ fixAfterInsert: 'balance', fixAfterDelete: 'balance' }[helper] ?? helper)
      : helper;
  const functionNames = {
    insert: { js: 'insert(key)', python: 'insert(self, key)', cpp: 'insert(double key)', java: 'insert(double key)', csharp: 'Insert(double key)' },
    delete: { js: 'delete(key)', python: 'delete(self, key)', cpp: 'erase(double key)', java: 'delete(double key)', csharp: 'Delete(double key)' },
    remove: { js: 'remove(h, key)', python: 'remove(self, h, key)', cpp: 'remove(Node* h, double k)', java: 'remove(Node h, double k)', csharp: 'Remove(Node h, double k)' },
    search: { js: 'search(key', python: 'search(self, key', cpp: 'search(double key)', java: 'search(double key)', csharp: 'Search(double key)' },
    rotateLeft: { js: 'rotateLeft(', python: 'rotate_left(', cpp: 'rotateLeft(', java: 'rotateLeft(', csharp: 'RotateLeft(' },
    rotateRight: { js: 'rotateRight(', python: 'rotate_right(', cpp: 'rotateRight(', java: 'rotateRight(', csharp: 'RotateRight(' },
    balance: { js: 'balance(', python: 'balance(self,', cpp: 'balance(Node*', java: 'balance(Node', csharp: 'Balance(Node' },
  };
  const rbtFunctionNames = {
    insert: { cpp: 'insert(double k)', java: 'insert(double k)', csharp: 'Insert(double k)' },
    delete: { cpp: 'erase(double k)', java: 'delete(double k)', csharp: 'Delete(double k)' },
    search: { cpp: 'search(double k)', java: 'search(double k)', csharp: 'Search(double k)' },
  };
  const target = type === 'rbt'
    ? rbtFunctionNames[treeHelper]?.[language] ?? functionNames[treeHelper]?.[language]
    : functionNames[treeHelper]?.[language];
  if (!target) return -1;
  return source.split('\n').findIndex(line => line.includes(target));
}
